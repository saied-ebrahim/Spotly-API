import { createClient } from 'redis';

let redisClient;

export default async function connectRedis() {
  const redisUrl = process.env.REDIS_URL ;
  
  redisClient = createClient({
    url: redisUrl,
  });

  redisClient.on('error', (err) => {
    console.error('Redis Client Error:', err);
  });

  redisClient.on('connect', () => {
    console.log('Redis Client Connecting...');
  });

  redisClient.on('ready', () => {
    console.log('Redis Client Ready');
  });

  await redisClient.connect();
  return redisClient;
}

export function getRedisClient() {
  if (!redisClient) {
    throw new Error('Redis client not initialized. Call connectRedis() first.');
  }
  return redisClient;
}

export async function disconnectRedis() {
  if (redisClient) {
    await redisClient.quit();
    console.log('Redis Client Disconnected');
  }
}

