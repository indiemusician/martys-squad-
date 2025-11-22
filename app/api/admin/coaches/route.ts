// app/api/admin/coaches/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export async function GET() {
  try {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Stats par coach (all time)
    const coachStatsAllTime = await prisma.conversation.groupBy({
      by: ['currentCoach'],
      _count: true,
    });

    // Stats par coach (7 derniers jours)
    const coachStatsWeek = await prisma.conversation.groupBy({
      by: ['currentCoach'],
      where: { createdAt: { gte: weekAgo } },
      _count: true,
    });

    // Tokens par coach
    const tokensByCoach = await prisma.message.groupBy({
      by: ['coach'],
      where: { role: 'assistant', coach: { not: null } },
      _sum: { tokensInput: true, tokensOutput: true, cost: true, responseTimeMs: true },
      _count: true,
    });

    // Combiner les données
    const coaches = ['marty', 'luke', 'peter', 'riplay', 'april', 'clarice'];
    const coachColors: Record<string, string> = {
      marty: '#ef4444',
      luke: '#8b5cf6',
      peter: '#3b82f6',
      riplay: '#10b981',
      april: '#f59e0b',
      clarice: '#ec4899',
    };

    const coachData = coaches.map((coach) => {
      const allTime = coachStatsAllTime.find((s) => s.currentCoach === coach);
      const week = coachStatsWeek.find((s) => s.currentCoach === coach);
      const tokens = tokensByCoach.find((t) => t.coach === coach);

      const msgCount = tokens?._count || 0;
      const totalResponseTime = tokens?._sum?.responseTimeMs || 0;

      return {
        name: coach,
        color: coachColors[coach],
        conversations: {
          allTime: allTime?._count || 0,
          week: week?._count || 0,
        },
        tokens: {
          input: tokens?._sum?.tokensInput || 0,
          output: tokens?._sum?.tokensOutput || 0,
          total: (tokens?._sum?.tokensInput || 0) + (tokens?._sum?.tokensOutput || 0),
        },
        cost: tokens?._sum?.cost || 0,
        avgResponseTime: msgCount > 0 ? Math.round(totalResponseTime / msgCount) : 0,
        messages: msgCount,
      };
    });

    // Calculer les handoffs (Marty vers autres)
    // Un handoff = conversation qui commence avec Marty puis change de coach
    const conversationsWithMultipleCoaches = await prisma.$queryRaw<
      { currentCoach: string; count: bigint }[]
    >`
      SELECT c."currentCoach", COUNT(*) as count
      FROM "Conversation" c
      WHERE c."currentCoach" != 'marty'
      AND EXISTS (
        SELECT 1 FROM "Message" m
        WHERE m."conversationId" = c.id
        AND m.coach = 'marty'
      )
      GROUP BY c."currentCoach"
    `;

    const handoffs = conversationsWithMultipleCoaches.map((h) => ({
      to: h.currentCoach,
      count: Number(h.count),
    }));

    const totalHandoffs = handoffs.reduce((sum, h) => sum + h.count, 0);

    return NextResponse.json({
      coaches: coachData,
      handoffs: {
        total: totalHandoffs,
        breakdown: handoffs,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('❌ [ADMIN/COACHES] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch coach stats' },
      { status: 500 }
    );
  }
}
