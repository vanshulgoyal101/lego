import { describe, it, expect } from '../../../test/test-harness.js';
import { ConsistentHash } from './index.js';

await describe('ds/consistent-hash', async () => {
  await it('should distribute keys across added nodes consistently', () => {
    const ch = new ConsistentHash(32);

    ch.addNode('Server_A');
    ch.addNode('Server_B');
    ch.addNode('Server_C');

    const node1 = ch.getNode('session_key_123');
    const node2 = ch.getNode('session_key_456');

    expect(typeof node1).toBe('string');
    expect(typeof node2).toBe('string');

    // Routing remains consistent
    expect(ch.getNode('session_key_123')).toBe(node1);

    // Node removal distributes its keys to other servers
    ch.removeNode(node1);
    const newNode = ch.getNode('session_key_123');
    expect(newNode !== node1).toBe(true);
    expect(newNode !== null).toBe(true);
  });
});
