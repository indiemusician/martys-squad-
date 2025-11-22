// app/api/admin/stats/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export async function GET() {
  try {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);

    // Stats globales
    const [
      totalUsers,
      totalConversations,
      totalMessages,
      usersToday,
      usersWeek,
      usersMonth,
      conversationsToday,
      conversationsWeek,
      messagestoday,
      messagesYesterday,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.conversation.count(),
      prisma.message.count(),
      prisma.user.count({ where: { createdAt: { gte: today } } }),
      prisma.user.count({ where: { createdAt: { gte: weekAgo } } }),
      prisma.user.count({ where: { createdAt: { gte: monthAgo } } }),
      prisma.conversation.count({ where: { createdAt: { gte: today } } }),
      prisma.conversation.count({ where: { createdAt: { gte: weekAgo } } }),
      prisma.message.count({ where: { createdAt: { gte: today } } }),
      prisma.message.count({ where: { createdAt: { gte: yesterday, lt: today } } }),
    ]);

    // Artistes actifs (ont envoyé un message)
    const activeUsersToday = await prisma.conversation.count({
      where: {
        updatedAt: { gte: today },
      },
    });

    const activeUsersWeek = await prisma.conversation.count({
      where: {
        updatedAt: { gte: weekAgo },
      },
    });

    // Stats par coach
    const coachStats = await prisma.conversation.groupBy({
      by: ['currentCoach'],
      _count: true,
    });

    const coachColors: Record<string, string> = {
      marty: '#ef4444',
      luke: '#8b5cf6',
      peter: '#3b82f6',
      riplay: '#10b981',
      april: '#f59e0b',
      clarice: '#ec4899',
    };

    const coachData = coachStats.map((stat) => ({
      name: stat.currentCoach,
      count: stat._count,
      color: coachColors[stat.currentCoach] || '#6b7280',
    }));

    // Trend messages (comparé à hier)
    const messagesTrend = messagesYesterday > 0
      ? Math.round(((messagestoday - messagesYesterday) / messagesYesterday) * 100)
      : 0;

    return NextResponse.json({
      overview: {
        totalUsers,
        totalConversations,
        totalMessages,
        activeUsersToday,
        activeUsersWeek,
      },
      users: {
        today: usersToday,
        week: usersWeek,
        month: usersMonth,
      },
      conversations: {
        today: conversationsToday,
        week: conversationsWeek,
      },
      messages: {
        today: messagestoday,
        yesterday: messagesYesterday,
        trend: messagesTrend,
      },
      coaches: coachData,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('❌ [ADMIN/STATS] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}
