import { describe, it, expect } from '../../../test/test-harness.js';
import {isV4, isV6, isPrivate, isLoopback, cidrMatch} from './index.js';

  await describe('validation/ip-validator', async () => {
    await it('should check IP structures and subnet mappings', () => {
      expect(isV4('192.168.1.10')).toBe(true);
      expect(isV6('::1')).toBe(true);
      expect(isPrivate('192.168.1.10')).toBe(true);
      expect(isPrivate('8.8.8.8')).toBe(false);
      expect(isLoopback('127.0.0.1')).toBe(true);
      expect(cidrMatch('192.168.1.100', '192.168.1.0/24')).toBe(true);
      expect(cidrMatch('192.168.2.100', '192.168.1.0/24')).toBe(false);
      expect(cidrMatch('fc00::1', 'fc00::/7')).toBe(true);
    });
  });
