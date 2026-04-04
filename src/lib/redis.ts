let redisInstance: any | null = null;

export async function getRedis(): Promise<any> {
  if (redisInstance) return redisInstance;

  let url = process.env.UPSTASH_REDIS_REST_URL;
  let token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (typeof url === 'string') {
    url = url.replace(/^"|"$/g, '').trim();
    
    // Check if it's a redis:// URL (common mistake)
    if (url.startsWith('redis://') || url.startsWith('rediss://')) {
        console.warn(`[Redis] WARNING: detected redis:// protocol instead of REST https://. Upstash @upstash/redis REST client requires the HTTPS URL.`);
        // Note: we'll let it fail or handle it if we want to be proactive
    }

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

  // Diagnostic Log (Masked)
  const urlParts = url.split('.');
  const subdomain = urlParts[0]?.split('//')[1] || '???';
  console.log(`[Redis] Initializing with URL: https://${subdomain}.*** (Length: ${url.length})`);

  try {
    const mod = await import('@upstash/redis');
    const { Redis } = mod as any;
    redisInstance = new Redis({ url, token });
    return redisInstance;
  } catch (err) {
    console.error('[Redis] Initialization failed:', err);
    throw err;
  }
}
