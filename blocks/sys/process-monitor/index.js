import { spawn } from 'child_process';
import { EventEmitter } from 'events';

/**
 * Retrieves resource usage statistics for the current process.
 * Pass a previous stats result object as prevState to compute accurate CPU percentage.
 */
export function getProcessStats(prevState = null) {
  const memory = process.memoryUsage();
  const cpu = process.cpuUsage(prevState?._internal?.cpu);
  const now = performance.now();
  const elapsedMs = prevState ? (now - prevState._internal.time) : 0;
  
  let cpuPercent = 0;
  if (elapsedMs > 0) {
    const totalMicroseconds = cpu.user + cpu.system;
    // elapsedMs * 1000 gives microseconds elapsed.
    cpuPercent = (totalMicroseconds / (elapsedMs * 1000)) * 100;
  }

  return {
    memory: {
      rss: memory.rss,
      heapTotal: memory.heapTotal,
      heapUsed: memory.heapUsed,
      external: memory.external
    },
    cpuPercent,
    _internal: {
      cpu: process.cpuUsage(),
      time: now
    }
  };
}

/**
 * Child process wrapper that provides lifecycle control, buffer limits, and timeout protection.
 */
export class ProcessWrapper extends EventEmitter {
  constructor(command, args = [], options = {}) {
    super();
    this.command = command;
    this.args = args;
    this.options = {
      timeout: 0, // No timeout by default
      maxBuffer: 1024 * 1024, // 1MB limit by default
      env: process.env,
      ...options
    };

    this.child = null;
    this.pid = null;
    this.stdoutBuffer = [];
    this.stderrBuffer = [];
    this.stdoutSize = 0;
    this.stderrSize = 0;
    this.exitCode = null;
    this.signal = null;
    this.started = false;
    this.finished = false;
    this.error = null;
    this.timeoutTimer = null;
  }

  start() {
    if (this.started) {
      throw new Error('Process has already been started');
    }
    this.started = true;

    try {
      this.child = spawn(this.command, this.args, {
        env: this.options.env,
        cwd: this.options.cwd,
        shell: this.options.shell
      });

      this.pid = this.child.pid;

      if (this.child.stdout) {
        this.child.stdout.on('data', (chunk) => this._handleData(chunk, 'stdout'));
      }
      if (this.child.stderr) {
        this.child.stderr.on('data', (chunk) => this._handleData(chunk, 'stderr'));
      }

      this.child.on('error', (err) => {
        this.error = err;
        this.emit('error', err);
        this._cleanup(false);
      });

      this.child.on('exit', (code, sig) => {
        this.exitCode = code;
        this.signal = sig;
        this._cleanup(true);
      });

      if (this.options.timeout > 0) {
        this.timeoutTimer = setTimeout(() => {
          this.emit('timeout');
          this.kill('SIGTERM');
          this.error = new Error(`Process timed out after ${this.options.timeout}ms`);
        }, this.options.timeout);
      }
    } catch (err) {
      this.error = err;
      this.started = false;
      this.finished = true;
      throw err;
    }

    return this;
  }

  kill(signal = 'SIGTERM') {
    if (this.child && !this.finished) {
      return this.child.kill(signal);
    }
    return false;
  }

  getStdout() {
    return Buffer.concat(this.stdoutBuffer).toString();
  }

  getStderr() {
    return Buffer.concat(this.stderrBuffer).toString();
  }

  getStatus() {
    return {
      pid: this.pid,
      started: this.started,
      finished: this.finished,
      exitCode: this.exitCode,
      signal: this.signal,
      error: this.error ? this.error.message : null,
      stdoutBytes: this.stdoutSize,
      stderrBytes: this.stderrSize
    };
  }

  _handleData(chunk, stream) {
    if (stream === 'stdout') {
      this.stdoutBuffer.push(chunk);
      this.stdoutSize += chunk.length;
      this.emit('stdout', chunk);
    } else {
      this.stderrBuffer.push(chunk);
      this.stderrSize += chunk.length;
      this.emit('stderr', chunk);
    }

    if (this.stdoutSize + this.stderrSize > this.options.maxBuffer) {
      const err = new Error('maxBuffer size exceeded');
      this.error = err;
      this.emit('error', err);
      this.kill('SIGKILL');
    }
  }

  _cleanup(emitExit) {
    if (this.finished) return;
    this.finished = true;
    if (this.timeoutTimer) {
      clearTimeout(this.timeoutTimer);
      this.timeoutTimer = null;
    }
    if (emitExit) {
      this.emit('exit', this.exitCode, this.signal);
    }
  }
}
