import { describe, it, expect } from '../../../test/test-harness.js';
import { normalize, join, resolve, dirname, basename, extname } from './index.js';

await describe('sys/path-resolver', async () => {
  await it('should normalize standard and complex paths', () => {
    expect(normalize('foo/bar//baz')).toBe('foo/bar/baz');
    expect(normalize('foo/bar/../baz')).toBe('foo/baz');
    expect(normalize('/foo/bar/../../baz')).toBe('/baz');
    expect(normalize('foo/bar/../../..')).toBe('..');
    expect(normalize('foo/bar/')).toBe('foo/bar/');
    expect(normalize('.')).toBe('.');
    expect(normalize('')).toBe('.');
    expect(normalize('C:\\foo\\bar')).toBe('C:/foo/bar');
  });

  await it('should join path segments correctly', () => {
    expect(join('foo', 'bar', 'baz')).toBe('foo/bar/baz');
    expect(join('foo', '/bar', '..', 'baz')).toBe('foo/baz');
    expect(join('', 'foo')).toBe('foo');
  });

  await it('should resolve absolute paths correctly', () => {
    expect(resolve('foo', 'bar', '/baz')).toBe('/baz');
    expect(resolve('/foo', 'bar', 'baz')).toBe('/foo/bar/baz');
  });

  await it('should compute correct dirname', () => {
    expect(dirname('/foo/bar/baz')).toBe('/foo/bar');
    expect(dirname('foo/bar')).toBe('foo');
    expect(dirname('/foo')).toBe('/');
    expect(dirname('foo')).toBe('.');
  });

  await it('should compute correct basename', () => {
    expect(basename('/foo/bar/baz.html')).toBe('baz.html');
    expect(basename('/foo/bar/baz.html', '.html')).toBe('baz');
    expect(basename('foo/')).toBe('foo');
  });

  await it('should compute correct extname', () => {
    expect(extname('index.js')).toBe('.js');
    expect(extname('/foo/bar.d.ts')).toBe('.ts');
    expect(extname('.gitignore')).toBe('');
    expect(extname('foo')).toBe('');
  });
});
