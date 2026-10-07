import rateLimit from 'express-rate-limit';
import { RedisStore } from 'rate-limit-redis';
import redisClient, { isRedisConfigured } from '../utilites/redisClient.js';

// Helper to create Redis store with fallback to in-memory store
const createRedisStore = (prefix) => {
  if (!isRedisConfigured || !redisClient) {
    return undefined; // in-memory fallback
  }

  try {
    return new RedisStore({
      // @ts-expect-error - Custom sendCommand wrapper
      sendCommand: async (...args) => {
        if (redisClient && redisClient.status === 'ready') {
          return redisClient.call(...args);
        }
        throw new Error('Redis not ready');
      },
      prefix: `chesso_rl:${prefix}:`,
    });
  } catch (err) {
    return undefined;
  }
};

// Global rate limiter for all general traffic
export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 200,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  passOnStoreError: true, // Fail-open on storage error so Render/production users are never blocked
  store: createRedisStore('global'),
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes.',
  },
});

// Stricter rate limiter for authentication routes
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 30,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  passOnStoreError: true,
  store: createRedisStore('auth'),
  message: {
    success: false,
    message: 'Too many authentication attempts. Please try again in 15 minutes.',
  },
});

// API rate limiter for gameplay and user queries
export const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  limit: 60,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  passOnStoreError: true,
  store: createRedisStore('api'),
  message: {
    success: false,
    message: 'Too many API requests, please slow down.',
  },
});
