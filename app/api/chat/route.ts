// app/api/chat/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { sendMessage } from '@/lib/integrations/anthropic';
import { SYSTEM_PROMPTS, CoachName } from '@/lib/prompts/system-prompts';
import { prisma } from '@/lib/db/prisma';

/**
 * POST /api/chat
 *
 * Endpoint principal pour discuter avec les coachs
 *
 * Body:
 * {
 *   "message": "Salut Marty!",
 *   "coach": "marty" (optionnel, défaut: marty),
 *   "history": [...] (optionnel, pour continuer une conversation),
 *   "conversationId": "xxx" (optionnel, pour continuer une conversation existante),
 *   "userId": "xxx" (optionnel, pour associer à un utilisateur)
 * }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message, coach = 'marty', history = [], conversationId, userId } = body;

    // Validation
    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message required and must be a string' },
        { status: 400 }
      );
    }

    // Vérifier que le coach existe
    const systemPrompt = SYSTEM_PROMPTS[coach as CoachName];
    if (!systemPrompt) {
      return NextResponse.json(
        {
          error: 'Invalid coach',
          available: Object.keys(SYSTEM_PROMPTS)
        },
        { status: 400 }
      );
    }

    // Construire l'historique de conversation
    const messages = [
      ...history,
      { role: 'user' as const, content: message }
    ];

    // Envoyer à Claude (ou au mock)
    const response = await sendMessage(messages, systemPrompt);

    // Sauvegarder dans la database
    let dbConversationId = conversationId;

    if (!dbConversationId) {
      // Créer ou récupérer l'utilisateur (pour l'instant, un user anonyme par défaut)
      let dbUserId = userId;
      if (!dbUserId) {
        // Créer un user anonyme
        const anonymousUser = await prisma.user.create({
          data: {
            artistName: 'Anonymous',
          },
        });
        dbUserId = anonymousUser.id;
      }

      // Créer une nouvelle conversation
      const conversation = await prisma.conversation.create({
        data: {
          userId: dbUserId,
          currentCoach: coach,
          platform: 'web',
        },
      });
      dbConversationId = conversation.id;
    }

    // Sauvegarder le message de l'utilisateur
    await prisma.message.create({
      data: {
        conversationId: dbConversationId,
        role: 'user',
        content: message,
      },
    });

    // Sauvegarder la réponse de l'assistant
    await prisma.message.create({
      data: {
        conversationId: dbConversationId,
        role: 'assistant',
        content: response,
        coach: coach,
        model: 'claude-3-haiku-20240307',
      },
    });

    // Mettre à jour le coach actuel de la conversation
    await prisma.conversation.update({
      where: { id: dbConversationId },
      data: { currentCoach: coach },
    });

    // Log pour debug (visible dans les logs Railway plus tard)
    console.log('💬 [CHAT]', {
      coach,
      conversationId: dbConversationId,
      userMessage: message.substring(0, 100),
      responseLength: response.length,
    });

    return NextResponse.json({
      message: response,
      coach,
      timestamp: new Date().toISOString(),
      conversationId: dbConversationId,
    });

  } catch (error) {
    console.error('❌ [CHAT] Error:', error);

    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/chat
 *
 * Retourne la liste des coachs disponibles
 */
export async function GET() {
  return NextResponse.json({
    coaches: Object.keys(SYSTEM_PROMPTS),
    default: 'marty',
    info: 'POST /api/chat with { message, coach? } to chat',
  });
}
