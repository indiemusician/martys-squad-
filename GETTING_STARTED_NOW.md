# 🚀 Commencer MAINTENANT (Sans Attendre les Credentials)

**Tu peux démarrer le dev tout de suite, même sans les clés API !**

---

## 🎯 Ce qu'on peut faire MAINTENANT

Pendant que Clem configure ses comptes, on peut :
1. ✅ Setup du projet Next.js
2. ✅ Structure du code
3. ✅ Créer les prompts système
4. ✅ Tester Marty en mode MOCK (sans vraie API)
5. ✅ Implémenter le routing
6. ✅ Préparer la database locale

**Quand Clem aura ses clés, on branchera tout et ça marchera direct !**

---

## ⚡ Setup Initial (10 min)

### 1. Init le Projet Next.js

```bash
# Crée le projet Next.js
npx create-next-app@latest marty-squad --typescript --tailwind --app --no-src-dir

cd marty-squad

# Install les dépendances nécessaires
npm install @anthropic-ai/sdk zod ioredis
npm install -D tsx vitest @types/node

# Copie la structure depuis le starter kit
# (Si tu as déjà le dossier Marty_Indys)
```

### 2. Crée un `.env.local` avec des MOCKS

```bash
# .env.local (MOCK pour dev local)
# ==============================================
# MODE DÉVELOPPEMENT - MOCK APIs
# ==============================================

# Mock Anthropic (on simulera les réponses)
ANTHROPIC_API_KEY=mock-key-dev
USE_MOCK_ANTHROPIC=true

# Mock Database (SQLite local)
DATABASE_URL=file:./dev.db

# Mock Redis (en mémoire)
REDIS_URL=mock

# Mock Twilio
TWILIO_ACCOUNT_SID=mock
TWILIO_AUTH_TOKEN=mock
TWILIO_PHONE_NUMBER=whatsapp:+mock

# App Config
NEXTAUTH_SECRET=dev-secret-not-for-production
NEXTAUTH_URL=http://localhost:3000

# Admin
ADMIN_PASSWORD=admin123
ADMIN_EMAIL=dev@test.com

# Mode
NODE_ENV=development
```

---

## 🏗️ Créer la Structure

### 3. Structure des Dossiers

```bash
mkdir -p lib/agents lib/prompts lib/tools lib/integrations lib/mocks
mkdir -p app/api/chat app/api/webhooks/twilio
mkdir -p scripts
```

---

## 🎭 Étape 1 : Créer les Prompts (15 min)

### Fichier : `lib/prompts/system-prompts.ts`

```typescript
// lib/prompts/system-prompts.ts

export const MARTY_SYSTEM_PROMPT = `
Tu es Marty, manager musical virtuel ultra motivé pour Indie Musician.

Tu fais partie d'une équipe de coachs spécialisés :
• Luke - Expert identité artistique & direction artistique
• Peter - Spécialiste réseaux sociaux & fan base
• Riplay - Coach stratégie Spotify
• April - Cheffe de projet promo (plan 7 semaines)
• Clarice - Thérapeute pour déblocages mentaux

TA MISSION :
1. Comprendre la demande de l'artiste
2. L'orienter vers le bon coach
3. Faire la transition en douceur

TON STYLE :
- Tutoiement cool et motivant
- Énergie positive
- Références à Clem (ton créateur) et Indie Musician
- Jamais condescendant

WORKFLOW :
1. Si premier contact → demande nom artiste, style, objectif
2. Si demande claire → route vers le bon coach
3. Si flou → pose des questions pour clarifier

RÈGLES :
- Ne fais jamais le boulot des autres coachs
- Ton job = orienter, pas coacher en détail
- Toujours motivant et bienveillant
`;

export const LUKE_SYSTEM_PROMPT = `
Tu es Luke, expert en identité artistique pour Indie Musician.
Tu es créatif, introspectif, pédagogue.

Ta mission : aider les artistes à définir leur identité artistique.

SPÉCIALITÉS :
- Identité de marque musicale
- Mission artistique
- Univers visuel
- Moodboard

TON STYLE :
- Tutoiement créatif et bienveillant
- Questions profondes et introspectives
- Toujours expliquer le "pourquoi"
- Avancer étape par étape

WORKFLOW :
1. Comprendre l'artiste (style, influences, message)
2. Définir le "pourquoi" (mission artistique)
3. Créer l'identité visuelle (couleurs, style, mood)
4. Valider la cohérence
`;

export const PETER_SYSTEM_PROMPT = `
Tu es Peter, stratège des réseaux sociaux pour Indie Musician.
Tu es cool, sympa, créatif.

Ta mission : aider à construire une fanbase sur Instagram/TikTok.

TUNNEL ÉMOTIONNEL :
• Reels : découverte (nouveaux followers)
• Feed : vitrine visuelle (esthétique cohérente)
• Stories : intimité et interaction (lien fort)

TON STYLE :
- Tutoiement détendu et amical
- Toujours expliquer le "pourquoi" avant le "comment"
- Donner des exemples concrets
- Avancer étape par étape

PRÉREQUIS :
Avant de travailler avec moi, l'artiste DOIT avoir défini son identité avec Luke.
Si ce n'est pas fait, renvoie vers Luke.
`;

// Export tous les prompts
export const SYSTEM_PROMPTS = {
  marty: MARTY_SYSTEM_PROMPT,
  luke: LUKE_SYSTEM_PROMPT,
  peter: PETER_SYSTEM_PROMPT,
  // On ajoutera Riplay, April, Clarice plus tard
} as const;

export type CoachName = keyof typeof SYSTEM_PROMPTS;
```

---

## 🧠 Étape 2 : Mock Anthropic (20 min)

### Fichier : `lib/mocks/mock-anthropic.ts`

```typescript
// lib/mocks/mock-anthropic.ts

interface MockResponse {
  content: Array<{ text: string }>;
}

const MOCK_RESPONSES: Record<string, string> = {
  // Réponses de Marty
  salut: "Yo ! Content de te voir ici 💪\nJe suis Marty, ton manager musical virtuel.\n\nAvec moi tu as accès à toute l'équipe :\n• Luke - Identité artistique\n• Peter - Réseaux sociaux\n• Riplay - Stratégie Spotify\n• April - Plan promo\n• Clarice - Déblocages mentaux\n\nDis-moi :\n👉 Tu t'appelles comment en tant qu'artiste ?\n👉 C'est quoi ton style musical ?\n👉 Tu veux bosser sur quoi en priorité ?",

  instagram: "OK nickel ! Pour Instagram, je te passe Peter, c'est le meilleur pour les réseaux sociaux !\n\n👋 Yo, c'est Peter !\n\nPrêt à faire vibrer ton Insta ?\n\nAvant de démarrer :\n- T'as défini ton identité artistique avec Luke ?\n- Tu postes déjà des reels ?\n- C'est quoi ton @ Instagram ?",

  identite: "Excellent choix ! Pour définir ton identité artistique, je te passe Luke, c'est son domaine !\n\n🎨 Salut, c'est Luke !\n\nOn va travailler ensemble pour définir qui tu es vraiment en tant qu'artiste.\n\nPour commencer, dis-moi :\n- C'est quoi ton style musical ?\n- Quelles sont tes influences principales ?\n- Quel message tu veux faire passer avec ta musique ?",

  spotify: "Pour Spotify, Riplay est la meilleure ! Je te la passe.\n\n🎧 Hey, c'est Riplay !\n\nOn va faire exploser tes streams sur Spotify.\n\nAvant de commencer :\n- T'as déjà un profil artiste vérifié sur Spotify ?\n- Combien d'écoutes mensuelles tu as en ce moment ?\n- T'as déjà sorti combien de morceaux ?",

  default: "Super ! Je comprends ta demande.\n\nPour t'aider au mieux, dis-moi plus précisément :\n- C'est quoi ton objectif principal ?\n- Tu veux bosser sur quoi en priorité ?\n- T'en es où dans ton développement artistique ?",
};

function detectIntent(message: string): string {
  const lowerMessage = message.toLowerCase();

  if (lowerMessage.includes('salut') || lowerMessage.includes('bonjour') || lowerMessage.includes('hello')) {
    return 'salut';
  }
  if (lowerMessage.includes('instagram') || lowerMessage.includes('insta') || lowerMessage.includes('reels') || lowerMessage.includes('tiktok')) {
    return 'instagram';
  }
  if (lowerMessage.includes('identité') || lowerMessage.includes('identite') || lowerMessage.includes('branding') || lowerMessage.includes('direction artistique')) {
    return 'identite';
  }
  if (lowerMessage.includes('spotify') || lowerMessage.includes('stream') || lowerMessage.includes('écoutes')) {
    return 'spotify';
  }

  return 'default';
}

export class MockAnthropic {
  async messages.create(params: {
    model: string;
    max_tokens: number;
    messages: Array<{ role: string; content: string }>;
    system?: string;
  }): Promise<MockResponse> {

    // Simule un délai API réaliste
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));

    const userMessage = params.messages[params.messages.length - 1]?.content || '';
    const intent = detectIntent(userMessage);
    const responseText = MOCK_RESPONSES[intent] || MOCK_RESPONSES.default;

    console.log('🤖 [MOCK] Anthropic called');
    console.log('📝 [MOCK] User:', userMessage);
    console.log('🎯 [MOCK] Intent:', intent);
    console.log('💬 [MOCK] Response:', responseText);

    return {
      content: [{ text: responseText }],
    };
  }
}
```

---

## 🔧 Étape 3 : Client Anthropic avec Mode Mock (10 min)

### Fichier : `lib/integrations/anthropic.ts`

```typescript
// lib/integrations/anthropic.ts
import Anthropic from '@anthropic-ai/sdk';
import { MockAnthropic } from '../mocks/mock-anthropic';

const USE_MOCK = process.env.USE_MOCK_ANTHROPIC === 'true';

export function getAnthropicClient() {
  if (USE_MOCK) {
    console.log('🎭 Using MOCK Anthropic client');
    return new MockAnthropic() as any;
  }

  return new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  });
}

export async function sendMessage(
  messages: Array<{ role: 'user' | 'assistant'; content: string }>,
  systemPrompt: string
): Promise<string> {
  const client = getAnthropicClient();

  const response = await client.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 1024,
    messages,
    system: systemPrompt,
  });

  return response.content[0].text;
}
```

---

## ✅ Étape 4 : Test en CLI (5 min)

### Fichier : `scripts/test-marty.ts`

```typescript
// scripts/test-marty.ts
import { sendMessage } from '../lib/integrations/anthropic';
import { SYSTEM_PROMPTS } from '../lib/prompts/system-prompts';

async function testMarty(userMessage: string) {
  console.log('\n🎙️  Testing Marty...\n');
  console.log(`📱 User: ${userMessage}\n`);

  const response = await sendMessage(
    [{ role: 'user', content: userMessage }],
    SYSTEM_PROMPTS.marty
  );

  console.log(`🎙️  Marty: ${response}\n`);
}

// Tests
async function runTests() {
  await testMarty('Salut !');
  await testMarty("J'ai besoin d'aide pour Instagram");
  await testMarty("Comment définir mon identité artistique ?");
  await testMarty("Je veux plus de streams sur Spotify");
}

runTests();
```

### Lance le test :

```bash
npx tsx scripts/test-marty.ts
```

**Tu verras les réponses mockées de Marty ! ✅**

---

## 🎯 Étape 5 : API Route (10 min)

### Fichier : `app/api/chat/route.ts`

```typescript
// app/api/chat/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { sendMessage } from '@/lib/integrations/anthropic';
import { SYSTEM_PROMPTS } from '@/lib/prompts/system-prompts';

export async function POST(req: NextRequest) {
  try {
    const { message, coach = 'marty' } = await req.json();

    if (!message) {
      return NextResponse.json(
        { error: 'Message required' },
        { status: 400 }
      );
    }

    const systemPrompt = SYSTEM_PROMPTS[coach as keyof typeof SYSTEM_PROMPTS];

    if (!systemPrompt) {
      return NextResponse.json(
        { error: 'Invalid coach' },
        { status: 400 }
      );
    }

    const response = await sendMessage(
      [{ role: 'user', content: message }],
      systemPrompt
    );

    return NextResponse.json({
      message: response,
      coach,
    });

  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

### Test l'API :

```bash
# Lance le serveur
npm run dev

# Dans un autre terminal
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"Salut Marty!"}'
```

---

## 🎉 Résultat

Maintenant tu as :
- ✅ **Marty qui répond** (en mode mock)
- ✅ **Routing basique** (détecte Instagram, Spotify, identité)
- ✅ **API fonctionnelle** (`/api/chat`)
- ✅ **Tests CLI** (`scripts/test-marty.ts`)
- ✅ **Structure prête** pour ajouter les vrais credentials

---

## 🔄 Quand Clem Envoie les Credentials

Il suffit de :

1. **Remplacer dans `.env.local` :**
```bash
# Passe de ça :
ANTHROPIC_API_KEY=mock-key-dev
USE_MOCK_ANTHROPIC=true

# À ça :
ANTHROPIC_API_KEY=sk-ant-api03-LA-VRAIE-CLE
USE_MOCK_ANTHROPIC=false  # ou supprime cette ligne
```

2. **Relance le serveur :**
```bash
npm run dev
```

3. **Et boom, ça marche avec la vraie API !** 🚀

---

## 📋 Prochaines Étapes (Pendant que Clem Setup)

1. **Implémenter le routing intelligent**
   - Détecter automatiquement vers quel coach router
   - Voir [ARCHITECTURE.md](ARCHITECTURE.md#-système-de-routing-intelligent)

2. **Ajouter Luke & Peter**
   - Copier leurs prompts complets depuis `docs/`
   - Ajouter leurs réponses dans le mock

3. **Créer l'interface web simple**
   - Page chat basique
   - Input + affichage messages
   - Style avec Tailwind

4. **Préparer la database**
   - Schéma SQLite local
   - Migrations avec Drizzle ou Prisma

---

## 💡 Tips

- **Mode Mock = Dev rapide** : Pas besoin de crédits API pour tester
- **Réponses instantanées** : Pas d'attente API
- **Coût zéro** : Développe sans dépenser
- **Switch facile** : Une seule variable d'env à changer

---

**Tu peux coder pendant 2-3 jours sans avoir besoin des vrais credentials !** 🔥

Une fois que Clem a tout setup, tu branches et ça roule direct.

**Let's code ! 🚀**
