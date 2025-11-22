// app/api/admin/tokens/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export async function GET() {
  try {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Tokens totaux
    const [todayStats, weekStats, monthStats, allTimeStats] = await Promise.all([
      prisma.message.aggregate({
        where: { createdAt: { gte: today }, role: 'assistant' },
        _sum: { tokensInput: true, tokensOutput: true, cost: true, responseTimeMs: true },
        _count: true,
      }),
      prisma.message.aggregate({
        where: { createdAt: { gte: weekAgo }, role: 'assistant' },
        _sum: { tokensInput: true, tokensOutput: true, cost: true, responseTimeMs: true },
        _count: true,
      }),
      prisma.message.aggregate({
        where: { createdAt: { gte: monthAgo }, role: 'assistant' },
        _sum: { tokensInput: true, tokensOutput: true, cost: true, responseTimeMs: true },
        _count: true,
      }),
      prisma.message.aggregate({
        where: { role: 'assistant' },
        _sum: { tokensInput: true, tokensOutput: true, cost: true, responseTimeMs: true },
        _count: true,
      }),
    ]);

    // Stats par jour (7 derniers jours)
    const dailyStats = [];
    for (let i = 6; i >= 0; i--) {
      const dayStart = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
      const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);

      const stats = await prisma.message.aggregate({
        where: {
          createdAt: { gte: dayStart, lt: dayEnd },
          role: 'assistant',
        },
        _sum: { tokensInput: true, tokensOutput: true, cost: true },
        _count: true,
      });

      dailyStats.push({
        date: dayStart.toISOString().split('T')[0],
        tokensInput: stats._sum?.tokensInput || 0,
        tokensOutput: stats._sum?.tokensOutput || 0,
        cost: stats._sum?.cost || 0,
        requests: stats._count,
      });
    }

    // Dernières réponses avec temps
    const recentResponses = await prisma.message.findMany({
      where: { role: 'assistant' },
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: {
        createdAt: true,
        responseTimeMs: true,
        tokensInput: true,
        tokensOutput: true,
        coach: true,
      },
    });

    const formatStats = (stats: typeof todayStats) => ({
      tokensInput: stats._sum?.tokensInput || 0,
      tokensOutput: stats._sum?.tokensOutput || 0,
      totalTokens: (stats._sum?.tokensInput || 0) + (stats._sum?.tokensOutput || 0),
      cost: stats._sum?.cost || 0,
      avgResponseTime: stats._count > 0 ? Math.round((stats._sum?.responseTimeMs || 0) / stats._count) : 0,
      requests: stats._count,
    });

    return NextResponse.json({
      today: formatStats(todayStats),
      week: formatStats(weekStats),
      month: formatStats(monthStats),
      allTime: formatStats(allTimeStats),
      daily: dailyStats,
      recentResponses: recentResponses.map((r) => ({
        ...r,
        createdAt: r.createdAt.toISOString(),
      })),
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('❌ [ADMIN/TOKENS] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch token stats' },
      { status: 500 }
    );
  }
}
