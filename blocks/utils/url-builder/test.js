import { describe, it, expect } from '../../../test/test-harness.js';
import { UrlBuilder } from './index.js';

await describe('utils/url-builder', async () => {
  await it('should build URLs with flat and nested parameters', () => {
    const baseUrl = 'https://api.example.com/search';
    const params = {
      q: 'test suite',
      filters: {
        role: 'admin',
        active: 'true'
      },
      tags: ['user', 'moderator']
    };

    const url = UrlBuilder.build(baseUrl, params);
    
    expect(url.includes('q=test%20suite')).toBe(true);
    expect(url.includes('filters%5Brole%5D=admin')).toBe(true);
    expect(url.includes('tags%5B0%5D=user')).toBe(true);
    expect(url.includes('tags%5B1%5D=moderator')).toBe(true);
  });

  await it('should parse query strings into structured objects', () => {
    const qs = 'q=hello&filters[role]=admin&tags[]=1&tags[]=2';
    const parsed = UrlBuilder.parse(qs);

    expect(parsed.q).toBe('hello');
    expect(parsed.filters.role).toBe('admin');
    expect(parsed.tags.length).toBe(2);
    expect(parsed.tags[0]).toBe('1');
    expect(parsed.tags[1]).toBe('2');
  });
});
