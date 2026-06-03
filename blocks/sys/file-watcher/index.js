import { EventEmitter } from 'events';
import fs from 'fs';
import fsPromises from 'fs/promises';
import path from 'path';

export class FileWatcher extends EventEmitter {
  constructor(options = {}) {
    super();
    this.options = {
      persistent: options.persistent !== false,
      recursive: !!options.recursive,
      forcePolling: !!options.forcePolling,
      interval: options.interval || 100,
      ignoreInitial: !!options.ignoreInitial,
      ...options
    };

    this.watchers = new Map(); // path -> fs.FSWatcher
    this.polledStats = new Map(); // path -> statInfo
    this.pollIntervalId = null;
    this.targets = new Set();
    this.closed = false;
  }

  async watch(targetPath) {
    if (this.closed) return this;
    const resolvedPath = path.resolve(targetPath);
    this.targets.add(resolvedPath);

    try {
      const stat = await fsPromises.stat(resolvedPath);
      const isDir = stat.isDirectory();

      if (this.options.forcePolling) {
        await this._startPolling(resolvedPath, isDir);
      } else {
        try {
          await this._startNativeWatch(resolvedPath, isDir);
        } catch (err) {
          // Native watch failed or unsupported, fallback to polling
          this.emit('fallback', resolvedPath, err);
          await this._startPolling(resolvedPath, isDir);
        }
      }
    } catch (err) {
      this.emit('error', err);
    }

    return this;
  }

  async close() {
    this.closed = true;
    if (this.pollIntervalId) {
      clearInterval(this.pollIntervalId);
      this.pollIntervalId = null;
    }
    for (const [p, watcher] of this.watchers.entries()) {
      watcher.close();
    }
    this.watchers.clear();
    this.polledStats.clear();
    this.targets.clear();
    this.emit('close');
  }

  // --- Native Watching ---
  async _startNativeWatch(targetPath, isDir) {
    const isMacOrWin = process.platform === 'darwin' || process.platform === 'win32';
    
    if (isDir && this.options.recursive && !isMacOrWin) {
      // Manual recursive watching for platforms without native recursive support (like Linux)
      await this._watchDirRecursiveNative(targetPath);
    } else {
      this._attachNativeWatcher(targetPath);
    }

    // Perform initial scan to emit add events if not ignored
    if (!this.options.ignoreInitial) {
      await this._scanAndEmitInitial(targetPath);
    }
  }

  _attachNativeWatcher(targetPath) {
    if (this.watchers.has(targetPath)) return;

    try {
      const watcher = fs.watch(targetPath, {
        persistent: this.options.persistent,
        recursive: this.options.recursive
      }, async (eventType, filename) => {
        if (this.closed) return;
        const changedPath = filename ? path.join(targetPath, filename) : targetPath;
        
        try {
          const exists = fs.existsSync(changedPath);
          if (!exists) {
            this.emit('unlink', changedPath);
          } else {
            const stat = await fsPromises.stat(changedPath);
            if (eventType === 'rename') {
              this.emit('add', changedPath, stat);
            } else {
              this.emit('change', changedPath, stat);
            }
          }
        } catch (err) {
          // File might have been deleted/moved rapidly
          this.emit('unlink', changedPath);
        }
      });

      watcher.on('error', (err) => {
        this.emit('error', err);
      });

      this.watchers.set(targetPath, watcher);
    } catch (err) {
      throw err;
    }
  }

  async _watchDirRecursiveNative(dirPath) {
    this._attachNativeWatcher(dirPath);
    try {
      const entries = await fsPromises.readdir(dirPath, { withFileTypes: true });
      for (const entry of entries) {
        if (entry.isDirectory()) {
          const fullPath = path.join(dirPath, entry.name);
          await this._watchDirRecursiveNative(fullPath);
        }
      }
    } catch (err) {
      this.emit('error', err);
    }
  }

  async _scanAndEmitInitial(targetPath) {
    try {
      const stat = await fsPromises.stat(targetPath);
      this.emit('add', targetPath, stat);
      if (stat.isDirectory()) {
        const entries = await fsPromises.readdir(targetPath, { withFileTypes: true });
        for (const entry of entries) {
          const fullPath = path.join(targetPath, entry.name);
          if (this.options.recursive && entry.isDirectory()) {
            await this._scanAndEmitInitial(fullPath);
          } else {
            const entryStat = await fsPromises.stat(fullPath);
            this.emit('add', fullPath, entryStat);
          }
        }
      }
    } catch (err) {
      // Ignore if file doesn't exist
    }
  }

  // --- Polling Logic ---
  async _startPolling(targetPath, isDir) {
    // Initial scan to populate polledStats map
    await this._pollScan(targetPath, this.options.ignoreInitial);

    if (!this.pollIntervalId) {
      this.pollIntervalId = setInterval(async () => {
        for (const target of this.targets) {
          await this._pollScan(target, false);
        }
      }, this.options.interval);
      if (!this.options.persistent && this.pollIntervalId.unref) {
        this.pollIntervalId.unref();
      }
    }
  }

  async _pollScan(targetPath, skipEmit) {
    const currentStats = new Map();
    await this._collectStats(targetPath, currentStats);

    // 1. Detect additions and modifications
    for (const [filePath, stat] of currentStats.entries()) {
      const previous = this.polledStats.get(filePath);
      if (!previous) {
        this.polledStats.set(filePath, stat);
        if (!skipEmit) {
          this.emit('add', filePath, stat.raw);
        }
      } else if (
        previous.mtime !== stat.mtime ||
        previous.size !== stat.size ||
        previous.isDirectory !== stat.isDirectory
      ) {
        this.polledStats.set(filePath, stat);
        if (!skipEmit) {
          this.emit('change', filePath, stat.raw);
        }
      }
    }

    // 2. Detect deletions
    for (const filePath of this.polledStats.keys()) {
      // Check if it belongs to this target scan path
      if (filePath.startsWith(targetPath)) {
        if (!currentStats.has(filePath)) {
          this.polledStats.delete(filePath);
          if (!skipEmit) {
            this.emit('unlink', filePath);
          }
        }
      }
    }
  }

  async _collectStats(targetPath, map) {
    try {
      const stat = await fsPromises.stat(targetPath);
      map.set(targetPath, {
        mtime: stat.mtimeMs,
        size: stat.size,
        isDirectory: stat.isDirectory(),
        raw: stat
      });

      if (stat.isDirectory()) {
        const entries = await fsPromises.readdir(targetPath, { withFileTypes: true });
        for (const entry of entries) {
          const fullPath = path.join(targetPath, entry.name);
          if (entry.isDirectory()) {
            if (this.options.recursive) {
              await this._collectStats(fullPath, map);
            } else {
              const dirStat = await fsPromises.stat(fullPath);
              map.set(fullPath, {
                mtime: dirStat.mtimeMs,
                size: dirStat.size,
                isDirectory: true,
                raw: dirStat
              });
            }
          } else {
            const fileStat = await fsPromises.stat(fullPath);
            map.set(fullPath, {
              mtime: fileStat.mtimeMs,
              size: fileStat.size,
              isDirectory: false,
              raw: fileStat
            });
          }
        }
      }
    } catch (err) {
      // Target path may not exist or permission denied
    }
  }
}
