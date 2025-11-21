# ⚡ Quick Start - Marty's Squad

Guide de démarrage rapide pour lancer ton premier agent de coaching musical.

---

## 🎯 Objectif

En 30 minutes, tu auras :
- ✅ L'environnement configuré
- ✅ Marty opérationnel localement
- ✅ Un test de conversation réussi
- ✅ Compris comment ajouter les autres coachs

---

## 📋 Checklist Avant de Commencer

```bash
# Vérifier Node.js version
node --version  # Doit être >= 18

# Vérifier que tu as les clés API
# - Anthropic API key : https://console.anthropic.com/
# - (Optionnel pour test local) Twilio, Supabase
```

---

## 🚀 Installation (5 min)

### 1. Clone & Install

```bash
# Clone le repo
git clone <ton-repo-url>
cd indie-musician-coach

# Install dependencies
npm install
# ou
pnpm install
# ou
yarn install
```

### 2. Configuration Environnement

```bash
# Copie le fichier d'exemple
cp config/example.env .env.local

# Édite .env.local et remplis AU MINIMUM :
# - ANTHROPIC_API_KEY=sk-ant-xxxxx
```

**Configuration minimale pour test local :**

```env
# .env.local
ANTHROPIC_API_KEY=sk-ant-ta-vraie-clé-ici

# Pour test local, tu peux utiliser des mocks pour le reste
DATABASE_URL=postgresql://localhost:5432/test
REDIS_URL=redis://localhost:6379
```

---

## 🧪 Test Rapide (10 min)

### Option 1 : Test Marty en CLI (Le Plus Simple)

Crée un fichier de test :

```typescript
// scripts/test-marty.ts
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const MARTY_PROMPT = `
Tu es Marty, manager musical virtuel ultra motivé pour Indie Musician.

Ta mission : guider les artistes vers le bon coach de l'équipe.

L'équipe disponible :
• Luke - Identité artistique
• Peter - Réseaux sociaux
• Riplay - Stratégie Spotify
• April - Plan promo
• Clarice - Déblocages mentaux

Réponds de manière cool et motivante, et oriente vers le bon expert.
`;

async function testMarty(userMessage: string) {
  const response = await anthropic.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 1024,
    messages: [
      {
        role: 'user',
        content: userMessage,
      },
    ],
    system: MARTY_PROMPT,
  });

  console.log('🎙️ Marty :', response.content[0].text);
}

// Test
testMarty('Salut, j\'ai besoin d\'aide pour Instagram !');
```

```bash
# Lance le test
npx tsx scripts/test-marty.ts
```

**Résultat attendu :**
```
🎙️ Marty : Yo ! Pour Instagram, je te passe Peter,
c'est le meilleur pour les réseaux sociaux !
```

✅ **Si tu vois ce message, Marty fonctionne !**

---

### Option 2 : Test avec Interface Simple

Crée une API route basique :

```typescript
// app/api/chat/route.ts
import { Anthropic } from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

export async function POST(req: NextRequest) {
  const { message } = await req.json();

  const response = await anthropic.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 1024,
    messages: [{ role: 'user', content: message }],
    system: `Tu es Marty, manager musical pour Indie Musician.`,
  });

  return NextResponse.json({
    message: response.content[0].text,
  });
}
```

```bash
# Lance le serveur
npm run dev

# Dans un autre terminal, test avec curl
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"Salut Marty!"}'
```

---

## 🎓 Comprendre la Structure (5 min)

### Fichiers Clés à Connaître

```
indie-musician-coach/
├── config/
│   ├── coaches.json          ← Config de chaque coach
│   └── example.env           ← Variables d'environnement
│
├── docs/
│   └── [PDFs Clem]           ← Knowledge base
│
├── lib/
│   ├── agents/
│   │   ├── marty.ts          ← À créer : logique Marty
│   │   ├── luke.ts           ← À créer : logique Luke
│   │   └── ...
│   │
│   ├── prompts/
│   │   └── system-prompts.ts ← À créer : tous les prompts
│   │
│   └── tools/
│       └── routing.ts        ← À créer : logique de routing
│
└── app/api/
    └── chat/route.ts         ← Point d'entrée API
```

---

## 🏗️ Construire Marty (10 min)

### 1. Créer le Prompt Système

```typescript
// lib/prompts/system-prompts.ts
export const MARTY_SYSTEM_PROMPT = `
Tu es Marty, manager musical virtuel ultra motivé, toujours dispo,
qui aide les artistes à promouvoir leur musique et à construire leur fanbase.

Tu fais partie d'une équipe de coachs spécialisés :

• Luke - Expert identité artistique & direction artistique
  → Quand : questions sur "qui je suis", branding, univers visuel

• Peter - Spécialiste réseaux sociaux & fan base
  → Quand : Instagram, TikTok, Reels, créer du contenu

• Riplay - Coach stratégie Spotify
  → Quand : streams, playlists, algorithme Spotify

• April - Cheffe de projet promo (plan 7 semaines)
  → Quand : sortie prévue, besoin d'un rétroplanning

• Clarice - Thérapeute pour déblocages mentaux
  → Quand : peur, doute, syndrome de l'imposteur

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
[... à compléter avec le contenu de docs/Luke - le pro de la direction artistique.txt]
`;

// ... etc pour les autres coachs
```

### 2. Créer la Logique de Routing

```typescript
// lib/tools/routing.ts
import Anthropic from '@anthropic-ai/sdk';

type Coach = 'marty' | 'luke' | 'peter' | 'riplay' | 'april' | 'clarice';

interface RoutingDecision {
  targetCoach: Coach;
  reason: string;
  transitionMessage: string;
}

export async function analyzeIntent(
  message: string,
  anthropic: Anthropic
): Promise<RoutingDecision> {
  const analysisPrompt = `
Analyse ce message d'un artiste et détermine vers quel coach le router :

MESSAGE : "${message}"

COACHS DISPONIBLES :
- luke : identité artistique, branding, univers visuel
- peter : réseaux sociaux, Instagram, TikTok, fan base
- riplay : Spotify, streams, playlists
- april : plan promo, sortie, rétroplanning
- clarice : confiance, peurs, doutes

Réponds au format JSON :
{
  "targetCoach": "nom_du_coach",
  "reason": "pourquoi ce coach",
  "keywords": ["mots", "clés", "détectés"]
}
`;

  const response = await anthropic.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 256,
    messages: [{ role: 'user', content: analysisPrompt }],
  });

  const analysis = JSON.parse(response.content[0].text);

  return {
    targetCoach: analysis.targetCoach,
    reason: analysis.reason,
    transitionMessage: `OK ! Pour ça je te passe ${analysis.targetCoach.toUpperCase()}, ${analysis.reason} 👋`,
  };
}
```

### 3. Tester le Routing

```typescript
// scripts/test-routing.ts
import { analyzeIntent } from '../lib/tools/routing';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

async function test() {
  const tests = [
    "J'ai besoin d'aide pour créer du contenu Instagram",
    "Comment définir mon identité artistique ?",
    "Je veux plus de streams sur Spotify",
    "J'ai peur de sortir ma musique",
  ];

  for (const message of tests) {
    console.log(`\n📱 Message : "${message}"`);
    const decision = await analyzeIntent(message, anthropic);
    console.log(`🎯 Coach : ${decision.targetCoach}`);
    console.log(`💡 Raison : ${decision.reason}`);
  }
}

test();
```

```bash
npx tsx scripts/test-routing.ts
```

---

## ✅ Checklist de Validation

Avant de passer à la suite, assure-toi que :

- [ ] Marty répond correctement en CLI
- [ ] Le routing détecte le bon coach
- [ ] Tu comprends la structure du projet
- [ ] Les variables d'environnement sont configurées

---

## 🎯 Prochaines Étapes

Maintenant que Marty fonctionne, tu peux :

1. **Ajouter Luke** (identité artistique)
   - Copier le prompt depuis `docs/Luke - le pro de la direction artistique.txt`
   - Créer `lib/agents/luke.ts`
   - Tester la transition Marty → Luke

2. **Ajouter Peter** (réseaux sociaux)
   - Idem avec `docs/Peter - le pro des réseaux sociaux.txt`

3. **Connecter WhatsApp**
   - Voir [docs/deployment/twilio-setup.md](docs/deployment/twilio-setup.md)

4. **Ajouter la base de données**
   - Pour sauvegarder l'historique
   - Voir [ARCHITECTURE.md](ARCHITECTURE.md#-gestion-du-contexte-élève)

5. **Implémenter le RAG**
   - Pour utiliser les PDFs comme knowledge base
   - Voir [ARCHITECTURE.md](ARCHITECTURE.md#-système-rag-knowledge-base)

---

## 🆘 Problèmes Courants

### "ANTHROPIC_API_KEY is not defined"

```bash
# Vérifie que .env.local existe
ls -la .env.local

# Vérifie que la variable est bien définie
cat .env.local | grep ANTHROPIC

# Redémarre le serveur après modification
```

### "Module not found"

```bash
# Réinstalle les dépendances
rm -rf node_modules package-lock.json
npm install
```

### Marty ne route pas correctement

```typescript
// Ajoute des logs pour débugger
console.log('Message reçu :', message);
const decision = await analyzeIntent(message, anthropic);
console.log('Décision routing :', decision);
```

---

## 💡 Tips

1. **Utilise tsx pour les tests rapides**
   ```bash
   npx tsx scripts/ton-test.ts
   ```

2. **Teste d'abord en CLI avant l'API**
   - Plus rapide pour itérer
   - Pas besoin de serveur web

3. **Commence simple**
   - Marty seul d'abord
   - Puis ajoute 1 coach à la fois
   - Teste chaque transition

4. **Utilise les prompts existants**
   - Tout est dans `docs/`
   - Copie-colle et adapte

---

## 🎉 Tu es Prêt !

Si tu as passé toutes les étapes, tu as maintenant :
- ✅ Un Marty fonctionnel
- ✅ Un système de routing
- ✅ La structure pour ajouter les autres coachs

**Next : Construis Luke, puis Peter, puis connecte WhatsApp !**

Pour toute question : [ARCHITECTURE.md](ARCHITECTURE.md) ou `clem@indiemusician.fr`

🚀 **Let's build Marty's Squad !**
