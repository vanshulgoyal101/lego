import { describe, it, expect } from '../../../test/test-harness.js';
import { GraphQLClient } from './index.js';
import http from 'http';

await describe('web/graphql-client', async () => {
  await it('should execute queries, mutations, parse variables, and handle GraphQL error responses', async () => {
    let receivedPayload = null;
    let shouldFail = false;

    // Spin up local mock server
    const server = http.createServer((req, res) => {
      let body = '';
      req.on('data', chunk => body += chunk);
      req.on('end', () => {
        receivedPayload = JSON.parse(body);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        if (shouldFail) {
          res.end(JSON.stringify({
            errors: [{ message: 'Validation failed' }]
          }));
        } else {
          res.end(JSON.stringify({
            data: { user: { id: '1', name: 'Alice' } }
          }));
        }
      });
    });

    const port = 9081;
    await new Promise(resolve => server.listen(port, '127.0.0.1', resolve));

    const client = new GraphQLClient(`http://127.0.0.1:${port}`);

    // Test simple query with variables
    const query = 'query GetUser($id: ID!) { user(id: $id) { name } }';
    const variables = { id: '1' };
    const data = await client.query(query, variables);

    expect(data.user.name).toBe('Alice');
    expect(receivedPayload.query).toBe(query);
    expect(receivedPayload.variables.id).toBe('1');

    // Test error handling
    shouldFail = true;
    let errorOccurred = false;
    try {
      await client.query(query);
    } catch (err) {
      errorOccurred = true;
      expect(err.message).toBe('Validation failed');
    }
    expect(errorOccurred).toBe(true);

    // Clean up
    await new Promise(resolve => server.close(resolve));
  });
});
