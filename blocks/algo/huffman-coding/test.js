import { describe, it, expect } from '../../../test/test-harness.js';
import {buildFrequencyMap,  buildCodes, encode as huffEncode, decode as huffDecode,  compressionStats} from './index.js';

  await describe('algo/huffman-coding', async () => {
    await it('should build frequency map correctly', () => {
      const freqMap = buildFrequencyMap('aabbc');
      expect(freqMap.get('a')).toBe(2);
      expect(freqMap.get('b')).toBe(2);
      expect(freqMap.get('c')).toBe(1);
    });

    await it('should build a valid prefix-free code table', () => {
      const freqMap = buildFrequencyMap('aaabbc');
      const codes = buildCodes(freqMap);
      // No code should be a prefix of another
      const codeList = [...codes.values()];
      for (let i = 0; i < codeList.length; i++) {
        for (let j = 0; j < codeList.length; j++) {
          if (i !== j) {
            expect(codeList[j].startsWith(codeList[i])).toBe(false);
          }
        }
      }
    });

    await it('should encode and decode to exact original string', () => {
      const input = 'hello huffman world';
      const freqMap = buildFrequencyMap(input);
      const codes = buildCodes(freqMap);
      const encoded = huffEncode(input, codes);
      const decoded = huffDecode(encoded, codes);
      expect(decoded).toBe(input);
    });

    await it('should achieve compression on repetitive strings', () => {
      const input = 'aaaaaabbbbcccd';
      const freqMap = buildFrequencyMap(input);
      const codes = buildCodes(freqMap);
      const encoded = huffEncode(input, codes);
      const stats = compressionStats(input, encoded);
      expect(stats.ratio).toBeLessThan(1); // Compressed
    });

    await it('should handle single unique character', () => {
      const freqMap = buildFrequencyMap('aaa');
      const codes = buildCodes(freqMap);
      const encoded = huffEncode('aaa', codes);
      const decoded = huffDecode(encoded, codes);
      expect(decoded).toBe('aaa');
    });
  });
