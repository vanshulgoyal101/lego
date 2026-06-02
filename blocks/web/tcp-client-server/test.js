import { describe, it, expect } from '../../../test/test-harness.js';
import { TCPServer, TCPClient } from './index.js';

await describe('web/tcp-client-server', async () => {
  await it('should successfully establish TCP server-client connections and pass message frames', async () => {
    const server = new TCPServer();
    const client = new TCPClient();
    const port = 9876;

    let receivedData = null;

    // Start server: echo back whatever is received
    await server.start(port, (socket, data) => {
      socket.write(data);
    });

    // Connect client
    await client.connect(port);

    const testMessage = 'TCP Echo Test Message';
    
    // Set up client reader
    const dataReceivedPromise = new Promise((resolve) => {
      client.onData((data) => {
        receivedData = data.toString('utf8');
        resolve();
      });
    });

    // Write message
    await client.write(testMessage);

    // Wait for echo back
    await dataReceivedPromise;

    expect(receivedData).toBe(testMessage);

    // Clean up
    client.close();
    await server.stop();
  });
});
