let redisInstance: any | null = null;

export async function getRedis(): Promise<any> {
  if (redisInstance) return redisInstance;
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) {
    throw new Error('Upstash Redis is not configured. Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN.');
  }
  const mod = await import('@upstash/redis');
  const { Redis } = mod as any;
  redisInstance = new Redis({ url, token });
  return redisInstance;
}
