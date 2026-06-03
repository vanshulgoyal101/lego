import { describe, it, expect } from '../../../test/test-harness.js';
import { DependencyResolver } from './index.js';

await describe('utils/dependency-resolver', async () => {
  await it('should resolve simple dependencies in topological order', () => {
    const resolver = new DependencyResolver();
    resolver.add('app', ['db', 'api']);
    resolver.add('api', ['db', 'cache']);
    resolver.add('db', []);
    resolver.add('cache', []);

    const order = resolver.resolve();

    // Valid topological orders:
    // [ 'db', 'cache', 'api', 'app' ] or [ 'cache', 'db', 'api', 'app' ]
    expect(order.indexOf('db') < order.indexOf('api')).toBe(true);
    expect(order.indexOf('cache') < order.indexOf('api')).toBe(true);
    expect(order.indexOf('api') < order.indexOf('app')).toBe(true);
    expect(order.indexOf('db') < order.indexOf('app')).toBe(true);
  });

  await it('should throw an error on circular dependencies', () => {
    const resolver = new DependencyResolver();
    resolver.add('A', ['B']);
    resolver.add('B', ['C']);
    resolver.add('C', ['A']);

    let threw = false;
    try {
      resolver.resolve();
    } catch (e) {
      threw = true;
      expect(e.message.includes('Circular dependency detected')).toBe(true);
    }
    expect(threw).toBe(true);
  });
});
