import Redis from 'ioredis';
import { config } from './index';
import { logger } from '../utils/logger';

let redisClient: Redis | null = null;
let redisPubClient: Redis | null = null;
let redisSubClient: Redis | null = null;
let isRedisConnected = false;

// High-speed In-Memory L1 Cache (fallback & ultra-low latency layer)
interface CacheEntry {
  value: any;
  expiresAt: number;
}
const inMemoryCache = new Map<string, CacheEntry>();
const MAX_LOCAL_CACHE_SIZE = 1500;

// Periodic cleanup of expired in-memory items every 60 seconds
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of inMemoryCache.entries()) {
    if (now > entry.expiresAt) {
      inMemoryCache.delete(key);
    }
  }
}, 60000);

// Initialize Redis client only if explicitly enabled
if (config.redisEnabled) {
  try {
    redisClient = new Redis(config.redisUri, {
      maxRetriesPerRequest: 1,
      connectTimeout: 2000,
      enableReadyCheck: true,
      retryStrategy(times) {
        if (times > 2) {
          logger.warn('⚠️ Redis unreachable. Operating in fallback local-cache mode.');
          return null;
        }
        return Math.min(times * 1000, 2000);
      },
    });

    redisClient.on('connect', () => {
      isRedisConnected = true;
      logger.info('⚡ Connected to Redis successfully');
    });

    redisClient.on('error', (err) => {
      isRedisConnected = false;
      logger.warn(`⚠️ Redis Connection warning: ${err.message}`);
    });

    // Dedicated Pub & Sub clients for Socket.IO Redis adapter
    redisPubClient = redisClient.duplicate();
    redisSubClient = redisClient.duplicate();
  } catch (err: any) {
    logger.warn(`⚠️ Failed to initialize Redis: ${err.message}`);
  }
} else {
  logger.info('ℹ️ Redis is disabled. Operating in fast in-memory cache mode.');
}

/**
 * Multi-tier Cache helper (L1 In-Memory + L2 Redis)
 * Delivers sub-millisecond responses regardless of Redis deployment state.
 */
export const redisCache = {
  /**
   * Set a key with TTL (seconds) in both L1 and L2
   */
  async set(key: string, value: any, ttlSeconds: number = 300): Promise<void> {
    try {
      // 1. Store in L1 In-Memory Cache
      if (inMemoryCache.size >= MAX_LOCAL_CACHE_SIZE) {
        // Evict oldest entry
        const oldestKey = inMemoryCache.keys().next().value;
        if (oldestKey) inMemoryCache.delete(oldestKey);
      }
      inMemoryCache.set(key, {
        value,
        expiresAt: Date.now() + ttlSeconds * 1000,
      });

      // 2. Store in L2 Redis if active
      if (redisClient && isRedisConnected) {
        const serialized = typeof value === 'string' ? value : JSON.stringify(value);
        await redisClient.set(key, serialized, 'EX', ttlSeconds);
      }
    } catch (err: any) {
      logger.warn(`Cache set error for key [${key}]: ${err.message}`);
    }
  },

  /**
   * Get a cached value by key (checks L1 in-memory first for 0ms speed, then L2 Redis)
   */
  async get<T = any>(key: string): Promise<T | null> {
    try {
      // 1. Check L1 In-Memory Cache
      const local = inMemoryCache.get(key);
      if (local) {
        if (Date.now() <= local.expiresAt) {
          return local.value as T;
        } else {
          inMemoryCache.delete(key);
        }
      }

      // 2. Check L2 Redis if available
      if (redisClient && isRedisConnected) {
        const data = await redisClient.get(key);
        if (!data) return null;
        try {
          const parsed = JSON.parse(data) as T;
          // Populate L1 cache for subsequent instant hits
          inMemoryCache.set(key, { value: parsed, expiresAt: Date.now() + 60000 });
          return parsed;
        } catch {
          inMemoryCache.set(key, { value: data, expiresAt: Date.now() + 60000 });
          return data as unknown as T;
        }
      }

      return null;
    } catch (err: any) {
      logger.warn(`Cache get error for key [${key}]: ${err.message}`);
      return null;
    }
  },

  /**
   * Delete a key from L1 and L2 cache
   */
  async del(key: string): Promise<void> {
    try {
      inMemoryCache.delete(key);
      if (redisClient && isRedisConnected) {
        await redisClient.del(key);
      }
    } catch (err: any) {
      logger.warn(`Cache del error for key [${key}]: ${err.message}`);
    }
  },

  /**
   * Delete multiple keys matching a pattern (e.g. "users:*")
   */
  async delPattern(pattern: string): Promise<void> {
    try {
      // Invalidate matching in-memory keys
      const regex = new RegExp(`^${pattern.replace('*', '.*')}`);
      for (const k of inMemoryCache.keys()) {
        if (regex.test(k)) {
          inMemoryCache.delete(k);
        }
      }

      // Invalidate in Redis
      if (redisClient && isRedisConnected) {
        const keys = await redisClient.keys(pattern);
        if (keys.length > 0) {
          await redisClient.del(...keys);
        }
      }
    } catch (err: any) {
      logger.warn(`Cache delPattern error: ${err.message}`);
    }
  },

  /**
   * Check connection status
   */
  isConnected(): boolean {
    return isRedisConnected;
  },
};

export { redisClient, redisPubClient, redisSubClient };

