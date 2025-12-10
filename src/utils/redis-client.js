import { getRedisClient } from '../config/redis.js';

/**
 * Cache data in Redis with expiration
 * @param {string} key - Cache key
 * @param {any} value - Value to cache (will be JSON stringified)
 * @param {number} expirationInSeconds - Expiration time in seconds (default: 3600 = 1 hour)
 * @returns {Promise<void>}
 */
export async function setCache(key, value, expirationInSeconds = 3600) {
  try {
    const client = getRedisClient();
    const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
    await client.setEx(key, expirationInSeconds, stringValue);
  } catch (error) {
    console.error('Redis setCache error:', error);
    // Don't throw - caching failures shouldn't break the app
  }
}

/**
 * Get cached data from Redis
 * @param {string} key - Cache key
 * @returns {Promise<any|null>} - Parsed value or null if not found
 */
export async function getCache(key) {
  try {
    const client = getRedisClient();
    const value = await client.get(key);
    if (!value) return null;
    
    try {
      return JSON.parse(value);
    } catch {
      return value; // Return as string if not JSON
    }
  } catch (error) {
    console.error('Redis getCache error:', error);
    return null;
  }
}

/**
 * Delete cache by key
 * @param {string} key - Cache key
 * @returns {Promise<void>}
 */
export async function deleteCache(key) {
  try {
    const client = getRedisClient();
    await client.del(key);
  } catch (error) {
    console.error('Redis deleteCache error:', error);
  }
}

/**
 * Delete multiple cache keys by pattern
 * @param {string} pattern - Pattern to match (e.g., 'user:*')
 * @returns {Promise<void>}
 */
export async function deleteCacheByPattern(pattern) {
  try {
    const client = getRedisClient();
    const keys = await client.keys(pattern);
    if (keys.length > 0) {
      await client.del(keys);
    }
  } catch (error) {
    console.error('Redis deleteCacheByPattern error:', error);
  }
}

/**
 * Check if key exists in cache
 * @param {string} key - Cache key
 * @returns {Promise<boolean>}
 */
export async function cacheExists(key) {
  try {
    const client = getRedisClient();
    const exists = await client.exists(key);
    return exists === 1;
  } catch (error) {
    console.error('Redis cacheExists error:', error);
    return false;
  }
}

/**
 * Set expiration for a key
 * @param {string} key - Cache key
 * @param {number} expirationInSeconds - Expiration time in seconds
 * @returns {Promise<void>}
 */
export async function setExpiration(key, expirationInSeconds) {
  try {
    const client = getRedisClient();
    await client.expire(key, expirationInSeconds);
  } catch (error) {
    console.error('Redis setExpiration error:', error);
  }
}

/**
 * Blacklist a token (useful for logout)
 * @param {string} token - JWT token to blacklist
 * @param {number} expirationInSeconds - How long to keep it blacklisted (default: 7 days)
 * @returns {Promise<void>}
 */
export async function blacklistToken(token, expirationInSeconds = 604800) {
  try {
    const client = getRedisClient();
    await client.setEx(`blacklist:${token}`, expirationInSeconds, '1');
  } catch (error) {
    console.error('Redis blacklistToken error:', error);
  }
}

/**
 * Check if a token is blacklisted
 * @param {string} token - JWT token to check
 * @returns {Promise<boolean>} - true if token is blacklisted
 */
export async function isTokenBlacklisted(token) {
  try {
    const client = getRedisClient();
    const exists = await client.exists(`blacklist:${token}`);
    return exists === 1;
  } catch (error) {
    console.error('Redis isTokenBlacklisted error:', error);
    return false;
  }
}

/**
 * Rate limiting - Check if user/ip has exceeded rate limit
 * @param {string} identifier - User ID or IP address
 * @param {number} maxRequests - Maximum number of requests
 * @param {number} windowInSeconds - Time window in seconds
 * @returns {Promise<{allowed: boolean, remaining: number, resetIn: number}>}
 */
export async function checkRateLimit(identifier, maxRequests = 100, windowInSeconds = 60) {
  try {
    const client = getRedisClient();
    const key = `ratelimit:${identifier}`;
    
    const current = await client.incr(key);
    
    if (current === 1) {
      // First request in this window, set expiration
      await client.expire(key, windowInSeconds);
    }
    
    const ttl = await client.ttl(key);
    const remaining = Math.max(0, maxRequests - current);
    
    return {
      allowed: current <= maxRequests,
      remaining,
      resetIn: ttl,
    };
  } catch (error) {
    console.error('Redis checkRateLimit error:', error);
    // Allow request if Redis fails (fail open)
    return {
      allowed: true,
      remaining: maxRequests,
      resetIn: windowInSeconds,
    };
  }
}

/**
 * Increment a counter
 * @param {string} key - Counter key
 * @param {number} increment - Amount to increment (default: 1)
 * @returns {Promise<number>} - New counter value
 */
export async function incrementCounter(key, increment = 1) {
  try {
    const client = getRedisClient();
    return await client.incrBy(key, increment);
  } catch (error) {
    console.error('Redis incrementCounter error:', error);
    return 0;
  }
}

/**
 * Get counter value
 * @param {string} key - Counter key
 * @returns {Promise<number>} - Counter value
 */
export async function getCounter(key) {
  try {
    const client = getRedisClient();
    const value = await client.get(key);
    return value ? parseInt(value, 10) : 0;
  } catch (error) {
    console.error('Redis getCounter error:', error);
    return 0;
  }
}

