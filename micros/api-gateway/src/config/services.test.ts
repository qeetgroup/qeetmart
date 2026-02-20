import test from 'node:test';
import assert from 'node:assert/strict';
import { routeConfig } from './services.js';

const routeMap = new Map(routeConfig.map(route => [route.path, route]));

test('route config rewrites API paths to service-native prefixes', () => {
  assert.equal(routeMap.get('/api/v1/auth')?.upstreamPath, '/auth');
  assert.equal(routeMap.get('/api/v1/users')?.upstreamPath, '/users');
  assert.equal(routeMap.get('/api/v1/products')?.upstreamPath, '/products');
  assert.equal(routeMap.get('/api/v1/inventory')?.upstreamPath, '/inventory');
});
