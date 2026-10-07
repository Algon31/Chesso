import test, { after } from 'node:test';
import assert from 'node:assert';
import { globalLimiter, authLimiter, apiLimiter } from '../middleware/rateLimiter.js';
import redisClient from '../utilites/redisClient.js';

after(async () => {
  try {
    await redisClient.quit();
  } catch (e) {}
});

test('Rate limiters are properly initialized and defined', (t) => {
  assert.ok(globalLimiter, 'globalLimiter should be defined');
  assert.ok(authLimiter, 'authLimiter should be defined');
  assert.ok(apiLimiter, 'apiLimiter should be defined');
});
