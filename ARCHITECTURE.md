# 🏗️ Architecture Technique - Marty's Squad

Documentation technique détaillée du système de coaching musical multi-agents.

---

## 📐 Vue d'Ensemble

### Principe de Fonctionnement

Le système fonctionne comme une **équipe de coachs IA spécialisés** avec un orchestrateur central (Marty) qui route intelligemment les conversations vers les bons experts.

```
┌──────────────────────────────────────────────────────────────┐
│                         ÉLÈVE                                 │
│              (WhatsApp ou Interface Web)                      │
└───────────────────────┬──────────────────────────────────────┘
                        │
                        ▼
┌──────────────────────────────────────────────────────────────┐
│                   POINTS D'ENTRÉE                             │
├──────────────────────────────────────────────────────────────┤
│  • Twilio Webhook (/api/webhooks/twilio)                     │
│  • Web Chat API (/api/chat)                                  │
└───────────────────────┬──────────────────────────────────────┘
                        │
                        ▼
┌──────────────────────────────────────────────────────────────┐
│              AUTHENTIFICATION & CONTEXTE                      │
├──────────────────────────────────────────────────────────────┤
│  1. Vérifier whitelist (numéro/email)                        │
│  2. Charger contexte élève (Redis)                           │
│  3. Récupérer historique conversation (PostgreSQL)           │
└───────────────────────┬──────────────────────────────────────┘
                        │
                        ▼
┌──────────────────────────────────────────────────────────────┐
│                  ORCHESTRATEUR MARTY                          │
├──────────────────────────────────────────────────────────────┤
│  • Analyser l'intention du message                           │
│  • Déterminer le coach approprié                             │
│  • Gérer les transitions entre coachs                        │
│  • Maintenir le contexte conversationnel                     │
└───────────────────────┬──────────────────────────────────────┘
                        │
           ┌────────────┼────────────┐
           │            │            │
           ▼            ▼            ▼
    ┌──────────┐  ┌─────────┐  ┌─────────┐
    │   LUKE   │  │  PETER  │  │ RIPLAY  │
    │ Identity │  │ Social  │  │ Spotify │
    └──────────┘  └─────────┘  └────┬────┘
                                     │
                                ┌────▼────┐
                                │  APRIL  │
                                │  Promo  │
                                └────┬────┘
                                     │
                                ┌────▼────┐
                                │ CLARICE │
                                │ Therapy │
                                └─────────┘
                        │
                        ▼
┌──────────────────────────────────────────────────────────────┐
│                    KNOWLEDGE BASE (RAG)                       │
├──────────────────────────────────────────────────────────────┤
│  • Vector Store (embeddings des PDFs)                        │
│  • Recherche sémantique dans ressources Clem                 │
│  • Extraction passages pertinents                            │
│  • Mapping vers vidéos YT / templates Canva                  │
└───────────────────────┬──────────────────────────────────────┘
                        │
                        ▼
┌──────────────────────────────────────────────────────────────┐
│                   GÉNÉRATION RÉPONSE                          │
├──────────────────────────────────────────────────────────────┤
│  • Claude 3.5 Sonnet (Anthropic API)                         │
│  • Prompt système du coach actif                             │
│  • Contexte élève injecté dynamiquement                      │
│  • Ressources pertinentes (RAG)                              │
└───────────────────────┬──────────────────────────────────────┘
                        │
                        ▼
┌──────────────────────────────────────────────────────────────┐
│                  SAUVEGARDE & RÉPONSE                         │
├──────────────────────────────────────────────────────────────┤
│  1. Sauvegarder message dans historique (PostgreSQL)         │
│  2. Mettre à jour contexte (Redis)                           │
│  3. Tracker analytics (coach utilisé, sujet, durée)          │
│  4. Envoyer réponse (Twilio ou HTTP)                         │
└──────────────────────────────────────────────────────────────┘
```

---

## 🧠 Système de Routing Intelligent

### Analyse d'Intention

Marty utilise une analyse en 2 passes pour router :

```typescript
interface Intent {
  topic: 'identity' | 'social_media' | 'spotify' | 'promo' | 'mental' | 'general';
  confidence: number;
  keywords: string[];
  suggestedCoach: CoachPersonality;
}

async function analyzeIntent(
  message: string,
  context: StudentContext
): Promise<Intent> {
  // Pass 1 : Détection par mots-clés
  const keywordMatch = detectKeywords(message);

  // Pass 2 : Analyse sémantique via Claude
  const semanticAnalysis = await claudeAnalyze(message, context);

  // Fusion des résultats
  return combineIntents(keywordMatch, semanticAnalysis);
}
```

### Mapping Topic → Coach

```typescript
const TOPIC_TO_COACH: Record<string, CoachPersonality> = {
  identity: 'luke',
  branding: 'luke',
  artistic_identity: 'luke',
  visual_identity: 'luke',

  social_media: 'peter',
  instagram: 'peter',
  tiktok: 'peter',
  reels: 'peter',
  fanbase: 'peter',
  followers: 'peter',

  spotify: 'riplay',
  streams: 'riplay',
  playlist: 'riplay',
  mini_clips: 'riplay',

  promo: 'april',
  release: 'april',
  plan: 'april',
  launch: 'april',

  mental: 'clarice',
  confidence: 'clarice',
  fear: 'clarice',
  doubt: 'clarice',
  impostor: 'clarice'
};
```

### Transitions de Coach

```typescript
async function switchToCoach(
  targetCoach: CoachPersonality,
  context: StudentContext
): Promise<string> {
  // Vérifier prérequis
  if (targetCoach === 'peter' && !context.identityDefined) {
    return {
      coach: 'marty',
      message: "Avant de bosser sur les réseaux avec Peter, " +
               "il faut définir ton identité artistique avec Luke. " +
               "Tu veux qu'on fasse ça maintenant ?"
    };
  }

  // Message de transition
  const transitionMessage = getTransitionMessage(
    context.currentCoach,
    targetCoach
  );

  // Mise à jour contexte
  context.currentCoach = targetCoach;
  await saveContext(context);

  return {
    coach: targetCoach,
    message: transitionMessage
  };
}
```

---

## 💾 Gestion du Contexte Élève

### Structure de Données

```typescript
interface StudentContext {
  // Identité
  studentId: string;
  phone: string;
  email: string;
  artistName?: string;
  musicalStyle?: string;

  // État de progression
  currentStage: 'identity' | 'fanbase' | 'spotify' | 'promo' | 'ongoing';
  identityDefined: boolean;
  hasSpotifyProfile: boolean;
  hasInstagram: boolean;

  // Profils sociaux
  instagramHandle?: string;
  spotifyArtistId?: string;

  // Modules complétés
  completedModules: string[];
  /*
    Exemples :
    - 'identity_workshop'
    - 'first_reel_posted'
    - 'spotify_profile_optimized'
    - 'playlist_created'
    - 'promo_plan_7weeks'
  */

  // Conversation
  currentCoach: CoachPersonality;
  lastMessageAt: Date;
  conversationId: string;

  // Métadonnées
  enrollmentDate: Date;
  subscriptionStatus: 'active' | 'expired' | 'suspended';
  totalMessages: number;
  lastActiveCoaches: CoachPersonality[];
}
```

### Stockage Multi-Niveaux

**Redis (Session active - TTL 24h) :**
```typescript
// Key : student:{phone}
{
  currentCoach: "peter",
  conversationId: "conv_abc123",
  lastMessageAt: "2025-01-15T14:30:00Z",
  quickContext: {
    artistName: "DJ Nova",
    identityDefined: true
  }
}
```

**PostgreSQL (Persistance long terme) :**

```sql
-- Table : students
CREATE TABLE students (
  id UUID PRIMARY KEY,
  phone VARCHAR(20) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  artist_name VARCHAR(100),
  musical_style VARCHAR(50),
  current_stage VARCHAR(20),
  identity_defined BOOLEAN DEFAULT FALSE,
  instagram_handle VARCHAR(100),
  spotify_artist_id VARCHAR(100),
  completed_modules JSONB DEFAULT '[]',
  subscription_status VARCHAR(20) DEFAULT 'active',
  enrollment_date TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Table : conversations
CREATE TABLE conversations (
  id UUID PRIMARY KEY,
  student_id UUID REFERENCES students(id),
  coach VARCHAR(20) NOT NULL,
  started_at TIMESTAMP DEFAULT NOW(),
  ended_at TIMESTAMP,
  message_count INTEGER DEFAULT 0
);

-- Table : messages
CREATE TABLE messages (
  id UUID PRIMARY KEY,
  conversation_id UUID REFERENCES conversations(id),
  role VARCHAR(10) NOT NULL, -- 'user' | 'assistant'
  content TEXT NOT NULL,
  coach VARCHAR(20), -- Quel coach a répondu
  timestamp TIMESTAMP DEFAULT NOW(),
  metadata JSONB
);

-- Table : analytics
CREATE TABLE analytics (
  id UUID PRIMARY KEY,
  student_id UUID REFERENCES students(id),
  event_type VARCHAR(50), -- 'coach_switch', 'module_completed', etc.
  event_data JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 🎭 Système de Prompts

### Prompts Système Modulaires

Chaque coach a un prompt système composé de :
1. **Personnalité de base** (fixe)
2. **Contexte élève** (dynamique)
3. **Knowledge base** (RAG)

```typescript
function buildSystemPrompt(
  coach: CoachPersonality,
  context: StudentContext,
  relevantKnowledge: string[]
): string {
  const basePrompt = COACH_BASE_PROMPTS[coach];
  const studentContext = buildStudentContext(context);
  const knowledge = relevantKnowledge.join('\n\n');

  return `
${basePrompt}

═══ CONTEXTE ÉLÈVE ═══
${studentContext}

═══ RESSOURCES DISPONIBLES ═══
${knowledge}

═══ INSTRUCTIONS FINALES ═══
- Tutoiement ${coach === 'clarice' ? 'bienveillant' : 'cool'}
- Avancer étape par étape, jamais tout d'un coup
- Donner des liens YouTube/Canva quand pertinent
- Toujours expliquer le "pourquoi" avant le "comment"
- Référencer Clem et Indie Musician régulièrement
`;
}
```

### Exemple : Prompt de Peter

```typescript
const PETER_BASE_PROMPT = `
Tu es Peter, stratège des réseaux sociaux pour Indie Musician.
Tu es cool, sympa, créatif. Tu parles en tutoiement détendu.

Ta mission : aider les artistes à construire une fanbase engagée
sur Instagram/TikTok grâce à du contenu authentique et émotionnel.

Tu t'appuies sur le tunnel émotionnel à 3 étages :
• Reels : découverte (nouveaux followers)
• Feed : vitrine visuelle (esthétique cohérente)
• Stories : intimité et interaction (lien fort)

Tu ne donnes JAMAIS toute la stratégie d'un coup.
Tu avances étape par étape, tu valides chaque action avant de passer à la suivante.
`;

function buildPeterPrompt(context: StudentContext): string {
  const studentContext = `
NOM ARTISTE : ${context.artistName || "non défini - demande-le"}
STYLE MUSICAL : ${context.musicalStyle || "non défini - demande-le"}
IDENTITÉ DÉFINIE : ${context.identityDefined ? "✅ OUI" : "❌ NON - renvoie vers Luke"}
INSTAGRAM : ${context.instagramHandle || "non communiqué - demande-le"}
MODULES COMPLÉTÉS : ${context.completedModules.join(', ') || "aucun"}
`;

  return `${PETER_BASE_PROMPT}\n\n${studentContext}`;
}
```

---

## 🔍 Système RAG (Knowledge Base)

### Pipeline de Recherche

```typescript
interface KnowledgeSearchResult {
  source: string; // Nom du fichier PDF/TXT
  content: string; // Passage extrait
  relevanceScore: number;
  youtubeLinks?: string[];
  canvaLinks?: string[];
}

async function searchKnowledge(
  query: string,
  coach: CoachPersonality
): Promise<KnowledgeSearchResult[]> {
  // 1. Générer embedding de la question
  const queryEmbedding = await generateEmbedding(query);

  // 2. Recherche vectorielle (filtré par coach)
  const results = await vectorStore.search({
    embedding: queryEmbedding,
    filter: { coach: coach },
    topK: 5
  });

  // 3. Extraction des liens (YouTube, Canva)
  const enrichedResults = results.map(result => ({
    ...result,
    youtubeLinks: extractYoutubeLinks(result.content),
    canvaLinks: extractCanvaLinks(result.content)
  }));

  return enrichedResults;
}
```

### Mapping Ressources

```json
// config/resources.json
{
  "peter": {
    "knowledgeBase": [
      "docs/knowledge-base/Peter - le pro des réseaux sociaux.txt",
      "docs/knowledge-base/Le feed.txt",
      "docs/knowledge-base/Le reel.txt",
      "docs/knowledge-base/Les Story.txt",
      "docs/knowledge-base/regles reels.txt"
    ],
    "videoTutorials": {
      "creer_reel_emotionnel": "https://youtu.be/3mBEam8uw18",
      "programmer_reels": "https://youtu.be/Sz6XR43XWGk",
      "creer_carrousel": "https://youtu.be/Bv0NGxJmW2M"
    },
    "canvaTemplates": {
      "100_hooks_reels": "https://www.canva.com/design/DAGfEGeQikU/...",
      "annonce_sortie_single": "https://www.canva.com/design/DAGmTBeKdD4/..."
    }
  },
  "riplay": {
    "knowledgeBase": [
      "docs/knowledge-base/Riplay - la pro de spoify.txt",
      "docs/knowledge-base/Exploser sur Spotify.txt"
    ],
    "videoTutorials": {
      "strategie_globale": "https://youtu.be/hW7st0x29zs",
      "creer_playlist": "https://youtu.be/lT9cBAe19Mc",
      "mini_clips": "https://youtu.be/xKF53hH3Ipk"
    }
  }
}
```

---

## 🔐 Authentification & Sécurité

### Whitelist Management

```typescript
interface WhitelistEntry {
  phone: string;
  email: string;
  studentId: string;
  subscriptionStatus: 'active' | 'expired' | 'suspended';
  allowedUntil?: Date;
}

async function authenticateStudent(
  phone: string
): Promise<AuthResult> {
  // Normaliser le numéro
  const normalizedPhone = normalizePhoneNumber(phone);

  // Chercher dans la whitelist
  const student = await db.students.findByPhone(normalizedPhone);

  if (!student) {
    return {
      authenticated: false,
      reason: 'not_enrolled',
      message: "🚫 Ce numéro n'est pas dans la team Indie Musician. " +
               "Rejoins la formation sur indiemusician.fr !"
    };
  }

  // Vérifier statut abonnement
  if (student.subscriptionStatus === 'expired') {
    return {
      authenticated: false,
      reason: 'expired',
      message: "⏰ Ton accès a expiré. Reconnecte-toi sur le site !"
    };
  }

  if (student.subscriptionStatus === 'suspended') {
    return {
      authenticated: false,
      reason: 'suspended',
      message: "⚠️ Ton compte est suspendu. Contacte Clem."
    };
  }

  // Vérifier date d'expiration (si applicable)
  if (student.allowedUntil && new Date() > student.allowedUntil) {
    await db.students.update(student.id, {
      subscriptionStatus: 'expired'
    });

    return {
      authenticated: false,
      reason: 'expired',
      message: "⏰ Ta période d'accès est terminée !"
    };
  }

  // Authentifié ✅
  return {
    authenticated: true,
    student: student
  };
}
```

### Rate Limiting

```typescript
// Limite par élève : 50 messages / heure
const RATE_LIMIT = {
  maxMessages: 50,
  windowMs: 60 * 60 * 1000 // 1 heure
};

async function checkRateLimit(studentId: string): Promise<boolean> {
  const key = `ratelimit:${studentId}`;
  const current = await redis.incr(key);

  if (current === 1) {
    await redis.expire(key, RATE_LIMIT.windowMs / 1000);
  }

  if (current > RATE_LIMIT.maxMessages) {
    return false; // Rate limit dépassé
  }

  return true;
}
```

---

## 📱 Intégration WhatsApp (Twilio)

### Webhook Handler

```typescript
// app/api/webhooks/twilio/route.ts
export async function POST(req: Request) {
  // 1. Valider la signature Twilio
  const signature = req.headers.get('x-twilio-signature');
  if (!validateTwilioSignature(signature, req.body)) {
    return new Response('Unauthorized', { status: 401 });
  }

  // 2. Parser le message
  const { From, Body } = await req.formData();
  const phone = From.replace('whatsapp:', '');
  const message = Body;

  // 3. Authentifier l'élève
  const authResult = await authenticateStudent(phone);
  if (!authResult.authenticated) {
    await sendWhatsAppMessage(phone, authResult.message);
    return new Response('OK', { status: 200 });
  }

  // 4. Rate limiting
  const allowed = await checkRateLimit(authResult.student.id);
  if (!allowed) {
    await sendWhatsAppMessage(
      phone,
      "⏸️ Tu as envoyé beaucoup de messages. Prends une pause, on se retrouve dans 1h !"
    );
    return new Response('OK', { status: 200 });
  }

  // 5. Charger le contexte
  const context = await loadStudentContext(authResult.student.id);

  // 6. Router vers le bon coach
  const response = await processMessage(message, context);

  // 7. Sauvegarder et répondre
  await saveMessage(context.conversationId, 'user', message);
  await saveMessage(context.conversationId, 'assistant', response.message, response.coach);
  await sendWhatsAppMessage(phone, response.message);

  return new Response('OK', { status: 200 });
}
```

### Envoi de Messages

```typescript
async function sendWhatsAppMessage(
  to: string,
  message: string
): Promise<void> {
  const client = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
  );

  await client.messages.create({
    from: `whatsapp:${process.env.TWILIO_PHONE_NUMBER}`,
    to: `whatsapp:${to}`,
    body: message
  });
}
```

---

## 🧪 Testing Strategy

### Tests Unitaires (Vitest)

```typescript
// lib/agents/__tests__/routing.test.ts
describe('Routing Intelligence', () => {
  test('should route Instagram question to Peter', async () => {
    const intent = await analyzeIntent(
      "Comment créer du contenu Instagram ?",
      mockContext
    );

    expect(intent.suggestedCoach).toBe('peter');
    expect(intent.confidence).toBeGreaterThan(0.8);
  });

  test('should require identity before Peter', async () => {
    const context = { ...mockContext, identityDefined: false };
    const result = await switchToCoach('peter', context);

    expect(result.coach).toBe('marty');
    expect(result.message).toContain('Luke');
  });
});
```

### Tests d'Intégration

```typescript
// __tests__/integration/conversation-flow.test.ts
describe('Conversation Flow', () => {
  test('first contact → identity workshop → Peter redirect', async () => {
    const student = await createTestStudent();

    // Premier message
    const r1 = await sendMessage(student.phone, "Salut !");
    expect(r1.coach).toBe('marty');
    expect(r1.message).toContain('équipe');

    // Demande identité
    const r2 = await sendMessage(student.phone, "J'ai besoin d'aide pour mon identité artistique");
    expect(r2.coach).toBe('luke');

    // Après identité définie
    await markModuleCompleted(student.id, 'identity_workshop');

    const r3 = await sendMessage(student.phone, "Comment créer du contenu Instagram ?");
    expect(r3.coach).toBe('peter');
  });
});
```

---

## 📊 Analytics & Monitoring

### Métriques Collectées

```typescript
interface Analytics {
  // Utilisation globale
  totalStudents: number;
  activeStudents: number; // Actifs dans les 7 derniers jours
  totalMessages: number;
  averageMessagesPerStudent: number;

  // Par coach
  messagesPerCoach: Record<CoachPersonality, number>;
  averageSessionDuration: Record<CoachPersonality, number>;

  // Topics
  mostAskedTopics: Array<{ topic: string; count: number }>;

  // Progression
  completionRates: {
    identityModule: number;
    firstReelPosted: number;
    spotifyProfileOptimized: number;
    promoPlans: number;
  };

  // Engagement
  studentsWithMultipleSessions: number;
  averageTimeBetweenSessions: number;

  // Ressources
  mostSharedVideos: Array<{ url: string; count: number }>;
  mostUsedTemplates: Array<{ url: string; count: number }>;
}
```

### Dashboard Admin

Accessible sur `/admin` (protégé par mot de passe) :

```typescript
// app/admin/page.tsx
export default async function AdminDashboard() {
  const analytics = await getAnalytics();

  return (
    <div>
      <h1>Dashboard Admin - Marty's Squad</h1>

      <StatsCards>
        <Card title="Élèves Actifs" value={analytics.activeStudents} />
        <Card title="Messages Totaux" value={analytics.totalMessages} />
        <Card title="Taux Identité Complétée" value={`${analytics.completionRates.identityModule}%`} />
      </StatsCards>

      <CoachUsageChart data={analytics.messagesPerCoach} />
      <TopicsChart data={analytics.mostAskedTopics} />
      <StudentProgressTable />
    </div>
  );
}
```

---

## 🚀 Déploiement

### Architecture de Déploiement

```
┌─────────────────────────────────────────┐
│         Vercel (Frontend + API)         │
│  - Next.js App Router                   │
│  - Web Chat Interface                   │
│  - API Routes (/api/chat)               │
└─────────────┬───────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────┐
│      Railway (Backend Services)         │
│  - Webhook Twilio (/api/webhooks/twilio)│
│  - Background jobs                      │
│  - Admin dashboard                      │
└─────────────┬───────────────────────────┘
              │
    ┌─────────┼─────────┐
    ▼         ▼         ▼
┌─────────┐ ┌──────┐ ┌────────┐
│Supabase │ │Upstash│ │Pinecone│
│PostgreSQL Redis    │ Vectors│
└─────────┘ └──────┘ └────────┘
```

### Variables d'Environnement

```env
# Claude API
ANTHROPIC_API_KEY=sk-ant-xxx

# Twilio WhatsApp
TWILIO_ACCOUNT_SID=ACxxx
TWILIO_AUTH_TOKEN=xxx
TWILIO_PHONE_NUMBER=whatsapp:+14155238886

# Database
DATABASE_URL=postgresql://xxx
REDIS_URL=redis://xxx

# Vector Store
PINECONE_API_KEY=xxx
PINECONE_INDEX_NAME=indie-musician-knowledge

# Auth
NEXTAUTH_SECRET=xxx
NEXTAUTH_URL=https://indiemusician.fr

# Admin
ADMIN_PASSWORD=xxx
```

---

## 🔄 Workflow de Développement

### Structure Git

```
main
├── development
│   ├── feature/marty-routing
│   ├── feature/peter-coach
│   └── feature/knowledge-base-rag
└── staging
```

### CI/CD Pipeline

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install
      - run: npm run build
      - run: npm run test
      - name: Deploy to Vercel
        run: vercel deploy --prod
      - name: Deploy to Railway
        run: railway up
```

---

## 📚 Prochaines Étapes

### Phase 1 : MVP (4 semaines)
- ✅ Architecture définie
- [ ] Marty + Luke + Peter implémentés
- [ ] WhatsApp fonctionnel
- [ ] Base de données configurée
- [ ] 10 premiers élèves en beta

### Phase 2 : Extension (4 semaines)
- [ ] Riplay + April + Clarice
- [ ] RAG Knowledge Base
- [ ] Interface web
- [ ] Dashboard admin
- [ ] Analytics basiques

### Phase 3 : Optimisation (ongoing)
- [ ] Fine-tuning des prompts
- [ ] A/B testing routing
- [ ] Feedback élèves
- [ ] Features avancées (rappels, gamification)

---

**Architecture conçue pour scale et évoluer avec les besoins d'Indie Musician 🚀**
