// app/api/chat/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { sendMessage } from '@/lib/integrations/anthropic';
import { SYSTEM_PROMPTS, CoachName } from '@/lib/prompts/system-prompts';
import { prisma } from '@/lib/db/prisma';
import { getSession, setSession } from '@/lib/cache/redis';

/**
 * Génère un contexte de mémoire pour l'utilisateur
 */
async function getUserContext(conversationId: string | null, userId: string | null): Promise<string> {
  if (!conversationId && !userId) return '';

  try {
    // Essayer de récupérer depuis Redis d'abord (plus rapide)
    if (userId) {
      const cached = await getSession(`user:${userId}`);
      if (cached) {
        return `
📝 CONTEXTE UTILISATEUR (rappelle-toi de cette personne) :
- Nom d'artiste : ${cached.artistName || 'Non défini'}
- Dernier coach consulté : ${cached.lastCoach || 'Aucun'}
- Dernière interaction : ${cached.lastInteraction || 'Première visite'}
${cached.currentStep ? `- Étape en cours : ${cached.currentStep}` : ''}
`;
      }
    }

    // Sinon, chercher dans la DB
    if (conversationId) {
      const conversation = await prisma.conversation.findUnique({
        where: { id: conversationId },
        include: {
          user: true,
          messages: {
            orderBy: { createdAt: 'desc' },
            take: 5, // Les 5 derniers messages pour le contexte
          },
        },
      });

      if (conversation) {
        const artistName = conversation.user?.artistName || 'Artiste';
        const lastCoach = conversation.currentCoach;

        // Sauvegarder dans Redis pour la prochaine fois
        if (conversation.userId) {
          await setSession(`user:${conversation.userId}`, {
            artistName,
            lastCoach,
            lastInteraction: new Date().toISOString(),
            conversationId,
          }, 86400); // 24h
        }

        return `
📝 CONTEXTE UTILISATEUR :
- Nom d'artiste : ${artistName}
- Coach actuel de la conversation : ${lastCoach}
- Cette personne revient, adapte ton accueil en conséquence !
`;
      }
    }
  } catch (error) {
    console.error('⚠️ [CONTEXT] Error getting user context:', error);
  }

  return '';
}

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
 *   "userId": "xxx" (optionnel, pour associer à un utilisateur),
 *   "artistName": "xxx" (optionnel, pour personnaliser)
 * }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message, coach = 'marty', history = [], conversationId, userId, artistName } = body;

    // Validation
    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message required and must be a string' },
        { status: 400 }
      );
    }

    // Vérifier que le coach existe
    let systemPrompt = SYSTEM_PROMPTS[coach as CoachName];
    if (!systemPrompt) {
      return NextResponse.json(
        {
          error: 'Invalid coach',
          available: Object.keys(SYSTEM_PROMPTS)
        },
        { status: 400 }
      );
    }

    // Ajouter le contexte utilisateur au prompt système
    const userContext = await getUserContext(conversationId, userId);
    if (userContext) {
      systemPrompt = systemPrompt + '\n' + userContext;
    }

    // Si on a un nom d'artiste, l'ajouter au contexte
    if (artistName) {
      systemPrompt = systemPrompt + `\n📝 Cette personne s'appelle ${artistName}. Utilise son nom !`;
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
      // Créer ou récupérer l'utilisateur
      let dbUserId = userId;
      if (!dbUserId) {
        // Créer un user (avec nom d'artiste si fourni)
        const newUser = await prisma.user.create({
          data: {
            artistName: artistName || 'Anonymous',
          },
        });
        dbUserId = newUser.id;
      } else if (artistName) {
        // Mettre à jour le nom d'artiste si fourni
        await prisma.user.update({
          where: { id: dbUserId },
          data: { artistName },
        }).catch(() => {}); // Ignorer si l'user n'existe pas
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

      // Sauvegarder le contexte dans Redis
      await setSession(`user:${dbUserId}`, {
        artistName: artistName || 'Anonymous',
        lastCoach: coach,
        lastInteraction: new Date().toISOString(),
        conversationId: dbConversationId,
      }, 86400); // 24h
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
