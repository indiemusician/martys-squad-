// lib/mocks/mock-anthropic.ts

interface MockResponse {
  content: Array<{ type: string; text: string }>;
}

const MOCK_RESPONSES: Record<string, string> = {
  // Réponses de Marty (accueil et routing)
  salut: `Yo ! Content de te voir ici 💪

Je suis Marty, ton manager musical virtuel créé par Clem (et ouais, celui avec la touffe de cheveux légendaire !).

Avec moi tu as accès à toute l'équipe d'Indie Musician :
• Luke - Identité artistique
• Peter - Réseaux sociaux
• Riplay - Stratégie Spotify
• April - Plan promo
• Clarice - Déblocages mentaux

Dis-moi :
👉 Tu t'appelles comment en tant qu'artiste ?
👉 C'est quoi ton style musical ?
👉 Tu veux bosser sur quoi en priorité ?`,

  instagram: `OK nickel ! Pour Instagram, je te passe Peter, c'est le meilleur pour les réseaux sociaux !

📱 Yo, c'est Peter !

Prêt à faire vibrer ton Insta ?

Avant de démarrer, j'ai besoin de savoir :
- T'as déjà défini ton identité artistique avec Luke ?
- Tu postes déjà des reels ou t'as jamais commencé ?
- C'est quoi ton @ Instagram ?

PS : Si t'as pas encore bossé ton identité avec Luke, on va commencer par là ! C'est la base de tout.`,

  identite: `Excellent choix ! L'identité artistique, c'est LA base de tout.

Je te passe Luke, c'est son domaine !

🎨 Salut, c'est Luke !

On va travailler ensemble pour définir qui tu es vraiment en tant qu'artiste.

C'est super important parce que sans identité claire :
- Ton contenu manquera de cohérence
- Tes fans ne comprendront pas ton message
- Tu auras du mal à te démarquer

Pour commencer, dis-moi :
- C'est quoi ton style musical ?
- Quelles sont tes 3 influences principales ?
- Si tu devais résumer en une phrase le message que tu veux faire passer, ce serait quoi ?`,

  spotify: `Pour Spotify, Riplay est la meilleure ! Je te la passe.

🎧 Hey, c'est Riplay !

On va mettre en place une stratégie pour faire exploser tes streams sur Spotify.

Mais d'abord, quelques questions essentielles :
- T'as déjà un profil artiste vérifié sur Spotify ?
- Combien d'écoutes mensuelles tu as en ce moment ?
- T'as sorti combien de morceaux ?
- T'as travaillé ton identité artistique avec Luke ?

Si t'as pas encore d'identité claire, je te renvoie vers Luke d'abord. C'est crucial pour la suite !`,

  promo: `Pour un plan promo béton, April est la cheffe !

📅 Salut, c'est April !

On va mettre en place un plan promo sur 7 semaines pour ta sortie.

Mais avant, j'ai besoin de savoir :
- Tu as une date de sortie prévue ?
- C'est un single, EP ou album ?
- T'as déjà une fan base (Instagram, TikTok, Spotify) ?
- Ton identité artistique est définie ?

Important : pour qu'un plan promo fonctionne, il faut avoir :
1. Identité définie (Luke)
2. Un début de communauté (Peter ou Riplay)
3. Une sortie prévue

Si t'as pas ça, on va d'abord bosser ces bases !`,

  confiance: `Pour ça, Clarice est parfaite. Elle va t'aider à débloquer tout ça.

💭 Salut, c'est Clarice.

Je suis là pour t'aider avec tes blocages mentaux.

Avant de commencer, rappel important : je ne remplace pas un·e psychologue professionnel·le. Si tu ressens un mal-être profond, parle-en à un·e spécialiste.

Dis-moi :
- C'est quoi exactement qui te bloque en ce moment ?
- Depuis combien de temps tu ressens ça ?
- Ça t'empêche de créer ? De partager ta musique ?

Je suis là pour t'écouter et t'aider à comprendre ce qui se passe.`,

  default: `Super ! Je comprends ta demande.

Pour t'aider au mieux, dis-moi plus précisément :
- C'est quoi ton objectif principal cette année ?
- Tu veux bosser sur quoi en priorité ?
- T'en es où dans ton développement artistique ?

Petit rappel du parcours idéal :
1️⃣ Identité artistique (Luke) - La base de tout
2️⃣ Créer sa communauté (Peter)
3️⃣ Préparer Spotify (Riplay)
4️⃣ Plan promo (April)

Et si t'as des blocages mentaux en cours de route, Clarice est là !

Alors, on commence par quoi ?`,
};

function detectIntent(message: string): string {
  const lowerMessage = message.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  // Salutations
  if (/^(salut|bonjour|hello|hey|yo|coucou)/.test(lowerMessage)) {
    return 'salut';
  }

  // Instagram / Réseaux sociaux
  if (lowerMessage.includes('instagram') ||
      lowerMessage.includes('insta') ||
      lowerMessage.includes('reels') ||
      lowerMessage.includes('tiktok') ||
      lowerMessage.includes('reseau') ||
      lowerMessage.includes('fan base') ||
      lowerMessage.includes('followers') ||
      lowerMessage.includes('communaute')) {
    return 'instagram';
  }

  // Identité artistique
  if (lowerMessage.includes('identite') ||
      lowerMessage.includes('branding') ||
      lowerMessage.includes('direction artistique') ||
      lowerMessage.includes('qui je suis') ||
      lowerMessage.includes('me definir') ||
      lowerMessage.includes('pourquoi')) {
    return 'identite';
  }

  // Spotify
  if (lowerMessage.includes('spotify') ||
      lowerMessage.includes('stream') ||
      lowerMessage.includes('ecoute') ||
      lowerMessage.includes('playlist')) {
    return 'spotify';
  }

  // Confiance / Blocages (AVANT promo car "peur de sortir" doit aller vers Clarice)
  if (lowerMessage.includes('peur') ||
      lowerMessage.includes('doute') ||
      lowerMessage.includes('confiance') ||
      lowerMessage.includes('bloque') ||
      lowerMessage.includes('imposteur') ||
      lowerMessage.includes('stress') ||
      lowerMessage.includes('angoisse')) {
    return 'confiance';
  }

  // Plan promo / Sortie
  if (lowerMessage.includes('promo') ||
      lowerMessage.includes('sortie') ||
      lowerMessage.includes('sortir') ||
      lowerMessage.includes('lancement') ||
      lowerMessage.includes('single') ||
      lowerMessage.includes('album') ||
      lowerMessage.includes('ep')) {
    return 'promo';
  }

  return 'default';
}

export class MockAnthropic {
  messages = {
    create: async (params: {
      model: string;
      max_tokens: number;
      messages: Array<{ role: string; content: string }>;
      system?: string;
    }): Promise<MockResponse> => {
      // Simule un délai API réaliste
      const delay = 500 + Math.random() * 1000;
      await new Promise(resolve => setTimeout(resolve, delay));

      const userMessage = params.messages[params.messages.length - 1]?.content || '';
      const intent = detectIntent(userMessage);
      const responseText = MOCK_RESPONSES[intent] || MOCK_RESPONSES.default;

      console.log('\n🎭 ════════ MOCK ANTHROPIC ════════');
      console.log('📝 User message:', userMessage);
      console.log('🎯 Detected intent:', intent);
      console.log('⏱️  Response delay:', `${delay.toFixed(0)}ms`);
      console.log('💬 Response preview:', responseText.substring(0, 100) + '...');
      console.log('════════════════════════════════════\n');

      return {
        content: [
          {
            type: 'text',
            text: responseText,
          },
        ],
      };
    },
  };
}
