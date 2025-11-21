// lib/cache/redis.ts
import Redis from 'ioredis';

const globalForRedis = globalThis as unknown as {
  redis: Redis | undefined;
};

function createRedisClient() {
  const redisUrl = process.env.REDIS_URL;

  if (!redisUrl || redisUrl === 'mock') {
    console.log('⚠️  [REDIS] Mock mode - no real Redis connection');
    // Retourner un mock simple pour le dev local
    return null;
  }

  try {
    const redis = new Redis(redisUrl, {
      maxRetriesPerRequest: 3,
      retryStrategy(times) {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
    });

    redis.on('connect', () => {
      console.log('✅ [REDIS] Connected');
    });

    redis.on('error', (err) => {
      console.error('❌ [REDIS] Error:', err);
    });

    return redis;
  } catch (error) {
    console.error('❌ [REDIS] Failed to create client:', error);
    return null;
  }
}

export const redis = globalForRedis.redis ?? createRedisClient();

if (process.env.NODE_ENV !== 'production') {
  globalForRedis.redis = redis;
}

// Helper functions pour le cache de session
export async function setSession(sessionId: string, data: any, expirationSeconds: number = 3600) {
  if (!redis) {
    console.warn('⚠️  [REDIS] Skipping setSession (mock mode)');
    return;
  }

  try {
    await redis.setex(
      `session:${sessionId}`,
      expirationSeconds,
      JSON.stringify(data)
    );
  } catch (error) {
    console.error('❌ [REDIS] setSession error:', error);
  }
}

export async function getSession(sessionId: string): Promise<any | null> {
  if (!redis) {
    console.warn('⚠️  [REDIS] Skipping getSession (mock mode)');
    return null;
  }

  try {
    const data = await redis.get(`session:${sessionId}`);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('❌ [REDIS] getSession error:', error);
    return null;
  }
}

export async function deleteSession(sessionId: string) {
  if (!redis) {
    console.warn('⚠️  [REDIS] Skipping deleteSession (mock mode)');
    return;
  }

  try {
    await redis.del(`session:${sessionId}`);
  } catch (error) {
    console.error('❌ [REDIS] deleteSession error:', error);
  }
}

// Cache pour les réponses récentes (éviter les doubles requêtes)
export async function cacheResponse(key: string, data: any, expirationSeconds: number = 300) {
  if (!redis) return;

  try {
    await redis.setex(`cache:${key}`, expirationSeconds, JSON.stringify(data));
  } catch (error) {
    console.error('❌ [REDIS] cacheResponse error:', error);
  }
}

export async function getCachedResponse(key: string): Promise<any | null> {
  if (!redis) return null;

  try {
    const data = await redis.get(`cache:${key}`);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('❌ [REDIS] getCachedResponse error:', error);
    return null;
  }
}
