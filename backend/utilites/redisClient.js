import Redis from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

const hasRedisConfig = Boolean(process.env.REDIS_URL || process.env.REDIS_HOST);
const redisUrl = process.env.REDIS_URL || `redis://${process.env.REDIS_HOST || '127.0.0.1'}:${process.env.REDIS_PORT || 6379}`;

export const isRedisConfigured = hasRedisConfig || process.env.NODE_ENV !== 'production';

export let redisClient = null;

if (isRedisConfigured) {
  redisClient = new Redis(redisUrl, {
    maxRetriesPerRequest: 1,
    enableOfflineQueue: false,
    retryStrategy(times) {
      if (times > 3) return null; // stop retrying if Redis is not running
      return Math.min(times * 300, 1000);
    },
    lazyConnect: true,
  });

  redisClient.on('connect', () => {
    console.log('⚡ Connected to Redis successfully');
  });

  redisClient.on('error', (err) => {
    console.warn('ℹ️ Redis notice (rate limiting fallback to memory):', err.message);
  });

  // Attempt connect with graceful catch
  redisClient.connect().catch((err) => {
    console.warn('ℹ️ Redis connection optional/offline, falling back to memory store:', err.message);
  });
}

export default redisClient;
