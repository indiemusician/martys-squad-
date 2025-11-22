// app/api/chat/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { sendMessage } from '@/lib/integrations/anthropic';
import { SYSTEM_PROMPTS, CoachName } from '@/lib/prompts/system-prompts';
import { prisma } from '@/lib/db/prisma';
import { getSession, setSession } from '@/lib/cache/redis';

/**
 * Recherche un utilisateur par son nom d'artiste et récupère son historique
 */
async function findUserByArtistName(artistName: string) {
  if (!artistName || artistName === 'Anonymous') return null;

  try {
    // Chercher l'utilisateur par nom d'artiste (case insensitive)
    const user = await prisma.user.findFirst({
      where: {
        artistName: {
          equals: artistName,
          mode: 'insensitive',
        },
      },
      include: {
        conversations: {
          orderBy: { updatedAt: 'desc' },
          take: 1,
          include: {
            messages: {
              orderBy: { createdAt: 'desc' },
              take: 10, // Les 10 derniers messages
            },
          },
        },
      },
    });

    return user;
  } catch (error) {
    console.error('⚠️ [FIND_USER] Error:', error);
    return null;
  }
}

/**
 * Génère un contexte de mémoire pour l'utilisateur basé sur son nom d'artiste
 */
async function getUserContextByArtistName(artistName: string | null): Promise<{
  context: string;
  userId: string | null;
  conversationId: string | null;
  history: { role: 'user' | 'assistant'; content: string }[];
}> {
  if (!artistName || artistName === 'Anonymous') {
    return { context: '', userId: null, conversationId: null, history: [] };
  }

  try {
    // D'abord essayer Redis (plus rapide)
    const cached = await getSession(`artist:${artistName.toLowerCase()}`);
    if (cached) {
      return {
        context: `
📝 CONTEXTE UTILISATEUR (tu connais déjà cette personne !) :
- Nom d'artiste : ${artistName}
- Dernier coach consulté : ${cached.lastCoach || 'marty'}
- Dernière interaction : ${cached.lastInteraction || 'Récemment'}
${cached.currentStep ? `- Étape en cours : ${cached.currentStep}` : ''}
- C'est un(e) habitué(e), accueille-le/la chaleureusement et rappelle où vous en étiez !
`,
        userId: cached.userId,
        conversationId: cached.conversationId,
        history: cached.recentHistory || [],
      };
    }

    // Sinon chercher dans la DB
    const user = await findUserByArtistName(artistName);
    if (user && user.conversations.length > 0) {
      const lastConversation = user.conversations[0];
      const recentMessages = lastConversation.messages.reverse(); // Du plus ancien au plus récent

      // Construire l'historique
      const history = recentMessages.map((m) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      }));

      // Sauvegarder dans Redis pour la prochaine fois
      await setSession(`artist:${artistName.toLowerCase()}`, {
        userId: user.id,
        conversationId: lastConversation.id,
        lastCoach: lastConversation.currentCoach,
        lastInteraction: lastConversation.updatedAt.toISOString(),
        recentHistory: history.slice(-6), // Garder les 6 derniers messages
      }, 86400); // 24h

      // Résumé du contexte pour le prompt
      const lastMessages = recentMessages.slice(-4);
      const conversationSummary = lastMessages.length > 0
        ? `\nDerniers échanges :\n${lastMessages.map((m) => `- ${m.role === 'user' ? artistName : lastConversation.currentCoach}: "${m.content.substring(0, 100)}..."`).join('\n')}`
        : '';

      return {
        context: `
📝 CONTEXTE UTILISATEUR (tu connais déjà ${artistName} !) :
- Dernier coach consulté : ${lastConversation.currentCoach}
- Dernière interaction : ${lastConversation.updatedAt.toLocaleDateString('fr-FR')}
- C'est un(e) habitué(e) ! Rappelle où vous en étiez.
${conversationSummary}
`,
        userId: user.id,
        conversationId: lastConversation.id,
        history,
      };
    }
  } catch (error) {
    console.error('⚠️ [CONTEXT] Error getting user context:', error);
  }

  return { context: '', userId: null, conversationId: null, history: [] };
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

    // Récupérer le contexte utilisateur par nom d'artiste (ou autres identifiants)
    let resolvedUserId = userId;
    let resolvedConversationId = conversationId;
    let loadedHistory = history;

    if (artistName) {
      const userContext = await getUserContextByArtistName(artistName);

      if (userContext.context) {
        systemPrompt = systemPrompt + '\n' + userContext.context;
      }

      // Utiliser l'userId et conversationId trouvés
      if (userContext.userId) {
        resolvedUserId = userContext.userId;
      }
      if (userContext.conversationId && !conversationId) {
        resolvedConversationId = userContext.conversationId;
      }

      // Si on n'a pas d'historique fourni, utiliser celui de la DB
      if (history.length === 0 && userContext.history.length > 0) {
        loadedHistory = userContext.history;
        console.log(`📚 [HISTORY] Loaded ${loadedHistory.length} messages for ${artistName}`);
      }

      // Toujours ajouter le nom au prompt
      systemPrompt = systemPrompt + `\n📝 Cette personne s'appelle ${artistName}. Utilise son nom dans tes réponses !`;
    }

    // Construire l'historique de conversation
    const messages = [
      ...loadedHistory,
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
