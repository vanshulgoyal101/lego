import { describe, it, expect } from '../../../test/test-harness.js';
import { decodeProtobuf } from './index.js';

await describe('encoding/protobuf-decoder', async () => {
  await it('should correctly parse standard wire types and recursively decode nested objects', () => {
    // Protobuf binary stream:
    // Field 1: Varint 150 -> tag: (1 << 3) | 0 = 8. Value 150 -> 0x96, 0x01
    // Field 2: Length-delimited string "testing" -> tag: (2 << 3) | 2 = 18. Len 7, bytes: t,e,s,t,i,n,g
    const buffer = new Uint8Array([
      8, 0x96, 0x01,
      18, 7, 116, 101, 115, 116, 105, 110, 107
    ]);

    const fields = decodeProtobuf(buffer);

    expect(fields.length).toBe(2);

    expect(fields[0].fieldNumber).toBe(1);
    expect(fields[0].wireType).toBe(0);
    expect(fields[0].value).toBe(150n);

    expect(fields[1].fieldNumber).toBe(2);
    expect(fields[1].wireType).toBe(2);
    expect(fields[1].value).toBe('testink');
  });
});
