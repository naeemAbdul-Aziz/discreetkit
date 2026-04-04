let redisInstance: any | null = null;

export async function getRedis(): Promise<any> {
  if (redisInstance) return redisInstance;

  let url = process.env.UPSTASH_REDIS_REST_URL;
  let token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (typeof url === 'string') {
    url = url.replace(/^"|"$/g, '').trim();
    if (url && !url.startsWith('http')) {
      url = `https://${url}`;
    }
  }
  if (typeof token === 'string') {
    token = token.replace(/^"|"$/g, '').trim();
  }

  if (!url || !token) {
    console.error('[Redis] Missing configuration:', { url: !!url, token: !!token });
    throw new Error('Upstash Redis is not configured. Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN.');
  }

  try {
    const mod = await import('@upstash/redis');
    const { Redis } = mod as any;
    redisInstance = new Redis({ url, token });
    console.log('[Redis] Instance initialized successfully');
    return redisInstance;
  } catch (err) {
    console.error('[Redis] Initialization failed:', err);
    throw err;
  }
}
