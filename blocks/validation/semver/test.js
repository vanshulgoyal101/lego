import { describe, it, expect } from '../../../test/test-harness.js';
import * as semver from './index.js';

  await describe('validation/semver', async () => {
    await it('should parse valid semver strings', () => {
      const v = semver.parse('1.2.3-alpha.1+build.42');
      expect(v.major).toBe(1);
      expect(v.minor).toBe(2);
      expect(v.patch).toBe(3);
      expect(v.prerelease[0]).toBe('alpha');
    });

    await it('should compare versions correctly', () => {
      expect(semver.compare('1.0.0', '2.0.0')).toBe(-1);
      expect(semver.compare('2.0.0', '1.9.9')).toBe(1);
      expect(semver.compare('1.0.0', '1.0.0')).toBe(0);
      expect(semver.gt('2.0.0', '1.9.9')).toBe(true);
      expect(semver.lt('1.0.0', '1.0.1')).toBe(true);
    });

    await it('should handle prerelease comparison', () => {
      // 1.0.0 > 1.0.0-alpha (release > prerelease)
      expect(semver.compare('1.0.0', '1.0.0-alpha')).toBe(1);
      expect(semver.compare('1.0.0-beta', '1.0.0-alpha')).toBe(1);
    });

    await it('should satisfy caret (^) ranges', () => {
      expect(semver.satisfies('1.2.3', '^1.0.0')).toBe(true);
      expect(semver.satisfies('2.0.0', '^1.0.0')).toBe(false);
      expect(semver.satisfies('1.0.1', '^1.0.0')).toBe(true);
    });

    await it('should satisfy tilde (~) ranges', () => {
      expect(semver.satisfies('1.2.5', '~1.2.0')).toBe(true);
      expect(semver.satisfies('1.3.0', '~1.2.0')).toBe(false);
    });

    await it('should sort versions', () => {
      const versions = ['2.1.0', '1.0.0', '1.5.3', '2.0.0'];
      const sorted = semver.sort(versions);
      expect(sorted[0]).toBe('1.0.0');
      expect(sorted[3]).toBe('2.1.0');
    });

    await it('should increment versions', () => {
      expect(semver.increment('1.2.3', 'major')).toBe('2.0.0');
      expect(semver.increment('1.2.3', 'minor')).toBe('1.3.0');
      expect(semver.increment('1.2.3', 'patch')).toBe('1.2.4');
    });
  });
