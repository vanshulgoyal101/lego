import { describe, it, expect } from '../../../test/test-harness.js';
import {hexToRgb, rgbToHex, getContrastRatio} from './index.js';

  await describe('ui/color-converter', async () => {
    await it('should convert color channels and calculate W3C contrast', async () => {
      const rgb = hexToRgb('#ff0000');
      expect(rgb.r).toBe(255);
      expect(rgbToHex(255, 0, 0)).toBe('#ff0000');
      
      const contrast = getContrastRatio('#ffffff', '#000000');
      expect(contrast).toBe(21);
    });
  });
