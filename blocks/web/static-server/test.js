import { describe, it, expect } from '../../../test/test-harness.js';
import {StaticServer} from './index.js';
import path from 'path';
import fs from 'fs/promises';
import http from 'http';

  await describe('web/static-server', async () => {
    await it('should start, serve file content, and stop successfully', async () => {
      const serverTestDir = path.resolve('./scratch/static_test');
      await fs.mkdir(serverTestDir, { recursive: true });
      await fs.writeFile(path.join(serverTestDir, 'index.html'), '<h1>Hello Static</h1>', 'utf8');

      const server = new StaticServer(serverTestDir, 4567);
      await server.start();

      const fetchRes = await new Promise((resolve, reject) => {
        http.get('http://localhost:4567/', (res) => {
          let data = '';
          res.on('data', chunk => { data += chunk; });
          res.on('end', () => resolve({ status: res.statusCode, body: data, headers: res.headers }));
        }).on('error', reject);
      });

      expect(fetchRes.status).toBe(200);
      expect(fetchRes.body).toBe('<h1>Hello Static</h1>');
      expect(fetchRes.headers['content-type']).toBe('text/html; charset=utf-8');

      await server.stop();
      // clean up
      await fs.rm(serverTestDir, { recursive: true, force: true });
    });
  });
