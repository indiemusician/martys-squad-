// app/api/admin/health/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { redis } from '@/lib/cache/redis';

async function checkDatabase(): Promise<{ status: 'online' | 'offline'; latency: number }> {
  const start = Date.now();
  try {
    await prisma.$queryRaw`SELECT 1`;
    return { status: 'online', latency: Date.now() - start };
  } catch {
    return { status: 'offline', latency: 0 };
  }
}

async function checkRedis(): Promise<{ status: 'online' | 'offline' | 'degraded'; latency: number }> {
  const start = Date.now();
  try {
    if (!redis) {
      return { status: 'degraded', latency: 0 };
    }
    await redis.ping();
    return { status: 'online', latency: Date.now() - start };
  } catch {
    return { status: 'offline', latency: 0 };
  }
}

async function checkAnthropic(): Promise<{ status: 'online' | 'offline' | 'unknown'; configured: boolean }> {
  const hasKey = !!process.env.ANTHROPIC_API_KEY && process.env.ANTHROPIC_API_KEY !== 'mock-key-dev';
  const isMock = process.env.USE_MOCK_ANTHROPIC === 'true';

  if (isMock) {
    return { status: 'online', configured: false };
  }

  return { status: hasKey ? 'online' : 'offline', configured: hasKey };
}

export async function GET() {
  try {
    const [database, redisStatus, anthropic] = await Promise.all([
      checkDatabase(),
      checkRedis(),
      checkAnthropic(),
    ]);

    // Statut global
    const allOnline = database.status === 'online' && anthropic.status !== 'offline';
    const overallStatus = allOnline ? 'healthy' : 'degraded';

    return NextResponse.json({
      status: overallStatus,
      services: {
        database: {
          ...database,
          name: 'PostgreSQL',
        },
        redis: {
          ...redisStatus,
          name: 'Redis Cache',
        },
        anthropic: {
          ...anthropic,
          name: 'Claude API',
        },
      },
      environment: {
        nodeEnv: process.env.NODE_ENV,
        hasMockMode: process.env.USE_MOCK_ANTHROPIC === 'true',
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('❌ [ADMIN/HEALTH] Error:', error);
    return NextResponse.json(
      {
        status: 'error',
        error: 'Health check failed',
      },
      { status: 500 }
    );
  }
}
