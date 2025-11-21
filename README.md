# 🎵 Marty's Squad - Coaching Musical IA pour Indie Musician

**Système de coaching musical multi-agents accessible via WhatsApp et Web**
Conçu pour les élèves de la formation Indie Musician de Clem.

---

## 🎯 Vision du Projet

**Marty's Squad** est une équipe de coachs IA spécialisés qui accompagnent les artistes musicaux indépendants dans leur développement professionnel :

- 🎙️ **Marty** - Manager général & orchestrateur
- 🎨 **Luke** - Expert identité artistique & direction artistique
- 📱 **Peter** - Spécialiste réseaux sociaux & fan base
- 🎧 **Riplay** - Coach stratégie Spotify
- 📅 **April** - Cheffe de projet promo (plan 7 semaines)
- 💭 **Clarice** - Thérapeute pour déblocages mentaux

### Caractéristiques Clés

✅ **Multi-personnalités** - Chaque coach a son ton, son expertise, sa manière de parler
✅ **Routing intelligent** - Marty analyse et délègue aux bons experts
✅ **Contexte persistant** - Le système se souvient de chaque élève et de sa progression
✅ **WhatsApp + Web** - Accessible sur mobile et navigateur
✅ **Accès contrôlé** - Réservé aux élèves inscrits (whitelist)
✅ **Knowledge Base** - Alimenté par les ressources pédagogiques de Clem (PDFs, vidéos YT, templates Canva)

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────┐
│         PLATEFORME INDYS (Web)                  │
│         TWILIO WHATSAPP                         │
└─────────────────┬───────────────────────────────┘
                  │
          ┌───────▼────────┐
          │  ORCHESTRATEUR │
          │     MARTY      │ ◄── Analyse & Route
          └───────┬────────┘
                  │
      ┌───────────┼───────────┐
      │           │           │
  ┌───▼──┐   ┌───▼──┐   ┌───▼──┐
  │ LUKE │   │PETER │   │RIPLAY│
  └──────┘   └──────┘   └──┬───┘
                           │
                      ┌────▼────┐
                      │  APRIL  │
                      └────┬────┘
                           │
                      ┌────▼────┐
                      │ CLARICE │
                      └─────────┘
```

**Fonctionnement :**
1. L'élève envoie un message (WhatsApp ou Web)
2. Marty analyse l'intention et route vers le bon coach
3. Le coach répond avec sa personnalité unique
4. Le contexte est sauvegardé pour la continuité

---

## 📁 Structure du Projet

```
indie-musician-coach/
├── README.md                    # Ce fichier
├── ARCHITECTURE.md              # Architecture technique détaillée
├── QUICKSTART.md                # Guide de démarrage rapide
│
├── docs/
│   ├── knowledge-base/          # PDFs et ressources de Clem
│   │   ├── Marty - le manager général.txt
│   │   ├── Peter - le pro des réseaux sociaux.txt
│   │   ├── Riplay - la pro de spoify.txt
│   │   ├── April - la cheffe de projet.txt
│   │   ├── Clarice - la thérapeute d_artiste.txt
│   │   └── [autres PDFs...]
│   │
│   └── deployment/
│       ├── railway-setup.md
│       ├── twilio-setup.md
│       └── database-setup.md
│
├── config/
│   ├── coaches.json             # Configuration des personnalités
│   ├── resources.json           # Mapping ressources (vidéos, templates)
│   └── example.env              # Variables d'environnement
│
├── lib/
│   ├── agents/
│   │   ├── marty.ts             # Orchestrateur principal
│   │   ├── luke.ts              # Identité artistique
│   │   ├── peter.ts             # Réseaux sociaux
│   │   ├── riplay.ts            # Spotify
│   │   ├── april.ts             # Plan promo
│   │   └── clarice.ts           # Thérapie
│   │
│   ├── prompts/
│   │   ├── system-prompts.ts    # Prompts système par coach
│   │   └── context-builder.ts   # Construction contexte dynamique
│   │
│   ├── tools/
│   │   ├── routing.ts           # Logique de routing intelligent
│   │   ├── knowledge-search.ts  # RAG sur knowledge base
│   │   └── student-context.ts   # Gestion contexte élève
│   │
│   └── integrations/
│       ├── twilio.ts            # WhatsApp
│       ├── anthropic.ts         # Claude API
│       └── database.ts          # Supabase/PostgreSQL
│
├── app/                         # Next.js App Router (Web UI)
│   ├── (auth)/
│   │   └── login/
│   ├── (dashboard)/
│   │   ├── chat/                # Interface chat web
│   │   └── profile/             # Profil élève
│   └── api/
│       ├── webhooks/
│       │   └── twilio/          # Webhook WhatsApp
│       └── chat/
│
└── scripts/
    ├── seed-students.ts         # Import élèves (whitelist)
    └── test-coach.ts            # Tester un coach localement
```

---

## 🚀 Démarrage Rapide

### Prérequis

- Node.js 18+
- Compte Anthropic (Claude API)
- Compte Twilio (WhatsApp)
- Base de données PostgreSQL (Supabase recommandé)
- Redis (Upstash pour sessions)

### Installation

```bash
# Cloner le repo
git clone <repo-url>
cd indie-musician-coach

# Installer les dépendances
npm install

# Configurer les variables d'environnement
cp config/example.env .env.local
# Éditer .env.local avec tes clés

# Lancer en dev
npm run dev
```

### Configuration

1. **Variables d'environnement** (`.env.local`) :
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

# App
NEXTAUTH_SECRET=xxx
NEXTAUTH_URL=http://localhost:3000
```

2. **Whitelist élèves** :
```bash
# Import depuis CSV
npm run seed-students -- --file students.csv
```

3. **Tester localement** :
```bash
# Tester Marty
npm run test-coach marty "Salut, j'ai besoin d'aide !"

# Tester Peter
npm run test-coach peter "Comment créer du contenu Instagram ?"
```

---

## 🎭 Les Coachs

### 🎙️ Marty - Manager Général
**Rôle** : Orchestrateur principal, oriente vers les bons experts
**Ton** : Motivant, franc, organisé
**Spécialités** : Vision d'ensemble, priorisation, coordination
**Délégation** : Analyse l'intention et route automatiquement

### 🎨 Luke - Jedi de l'Identité Artistique
**Rôle** : Aide à définir l'identité artistique et la direction artistique
**Ton** : Créatif, introspectif, pédagogue
**Spécialités** : Identité de marque, mission artistique, univers visuel
**Prérequis** : Aucun (première étape recommandée)

### 📱 Peter - Tisseur de Liens sur les Réseaux
**Rôle** : Expert réseaux sociaux et construction de fan base
**Ton** : Cool, sympa, créatif
**Spécialités** : Instagram, TikTok, Reels, Stories, Feed
**Prérequis** : Identité artistique définie

### 🎧 Riplay - Coach Spotify
**Rôle** : Stratégie Spotify pour exploser les streams
**Ton** : Jeune, cool, stratégique
**Spécialités** : Playlists, mini-clips, pub Meta vers Spotify
**Prérequis** : Identité définie, compte Spotify actif

### 📅 April - Cheffe de Projet Promo
**Rôle** : Plan promotionnel 7 semaines pour sorties
**Ton** : Dynamique, organisée, motivante
**Spécialités** : Rétroplanning, checklist promo, objectifs clairs
**Prérequis** : Fan base démarrée, sortie prévue

### 💭 Clarice - Thérapeute d'Artiste
**Rôle** : Déblocages mentaux, confiance en soi
**Ton** : Bienveillant, rassurant, introspectif
**Spécialités** : Peurs, doutes, syndrome de l'imposteur
**Prérequis** : Aucun (accessible à tout moment)

---

## 💡 Flow Conversationnel Type

### Premier Contact

```
📱 Élève : "Salut !"

🎙️ Marty : "Yo ! Content de te voir ici 💪
            Je suis Marty, ton manager musical virtuel.

            Avec moi tu as accès à toute l'équipe :
            • Luke - Identité artistique
            • Peter - Réseaux sociaux
            • Riplay - Stratégie Spotify
            • April - Plan promo
            • Clarice - Déblocages mentaux

            Dis-moi :
            👉 Tu t'appelles comment en tant qu'artiste ?
            👉 C'est quoi ton style musical ?
            👉 Tu veux bosser sur quoi en priorité ?"
```

### Redirection Automatique

```
📱 Élève : "Je galère à créer du contenu Instagram"

🎙️ Marty : "OK nickel, pour ça je te passe Peter !

            👋 Yo, c'est Peter !"

[SWITCH VERS PETER]

📱 Peter : "Prêt à faire vibrer ton Insta ?

           Avant de démarrer :
           - T'as défini ton identité artistique avec Luke ?
           - Tu postes déjà des reels ?
           - C'est quoi ton @ Instagram ?"
```

---

## 🔐 Sécurité & Accès

### Système de Whitelist

Seuls les élèves inscrits peuvent accéder au système :

```typescript
// Vérification automatique à chaque message
const student = await authenticateStudent(phoneNumber);

if (!student) {
  return "🚫 Ce numéro n'est pas dans la team Indie Musician. " +
         "Rejoins la formation sur indiemusician.fr !";
}

if (student.subscriptionExpired) {
  return "⏰ Ton accès a expiré. Reconnecte-toi pour continuer !";
}
```

### Gestion des Élèves

```bash
# Ajouter un élève
npm run add-student -- \
  --name "John Doe" \
  --phone "+33612345678" \
  --email "john@example.com"

# Désactiver un accès
npm run deactivate-student -- --phone "+33612345678"

# Voir tous les élèves actifs
npm run list-students
```

---

## 📊 Contexte Élève

Chaque élève a un profil qui évolue :

```typescript
interface StudentContext {
  // Identité
  artistName?: string;
  musicalStyle?: string;

  // Progression
  currentStage: 'identity' | 'fanbase' | 'spotify' | 'promo';
  identityDefined: boolean;
  hasSpotifyProfile: boolean;

  // Réseaux
  instagramHandle?: string;
  spotifyArtistId?: string;

  // Modules complétés
  completedModules: string[];

  // Coach actuel
  currentCoach: CoachPersonality;

  // Historique
  conversationHistory: Message[];
}
```

---

## 🛠️ Stack Technique

```yaml
Frontend:
  - Next.js 14 (App Router)
  - TailwindCSS
  - Shadcn/ui components

Backend:
  - Node.js + TypeScript
  - Hono / tRPC
  - Claude 3.5 Sonnet (Anthropic)

Messaging:
  - Twilio WhatsApp API

Database:
  - PostgreSQL (Supabase)
  - Redis (Upstash)

Deployment:
  - Vercel (Frontend)
  - Railway (Backend + Webhooks)

Knowledge Base:
  - Vector Store (Pinecone ou Supabase Vector)
  - RAG pour recherche dans PDFs
```

---

## 📚 Knowledge Base

Le système utilise les ressources pédagogiques de Clem :

### Documents Disponibles

- **Prompts originaux** : Marty, Luke, Peter, Riplay, April, Clarice
- **Guides** : Identité artistique, réseaux sociaux, Spotify, plan promo
- **Tutoriels** : Liens YouTube, templates Canva
- **Stratégies** : Pub Meta, playlists Spotify, mini-clips

### Recherche Intelligente

Le système utilise RAG (Retrieval-Augmented Generation) pour :
1. Chercher dans les PDFs pertinents selon la question
2. Extraire les passages utiles
3. Générer une réponse avec sources
4. Fournir les liens YouTube/Canva appropriés

---

## 🚢 Déploiement

### Option 1 : Railway (Recommandé)

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Deploy
railway up
```

### Option 2 : Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel deploy --prod
```

### Configuration Twilio

1. Acheter un numéro WhatsApp Business sur Twilio
2. Configurer le webhook :
   - URL : `https://ton-domaine.com/api/webhooks/twilio`
   - Method : POST
3. Activer le numéro pour WhatsApp

Voir [docs/deployment/twilio-setup.md](docs/deployment/twilio-setup.md) pour plus de détails.

---

## 🧪 Tests

```bash
# Test unitaire d'un coach
npm run test:unit

# Test d'intégration routing
npm run test:routing

# Test conversation complète
npm run test:conversation -- --scenario "first-contact"

# Test WhatsApp (sandbox)
npm run test:whatsapp
```

---

## 📈 Analytics & Monitoring

### Dashboard Admin

Accessible sur `/admin` :
- Nombre d'élèves actifs
- Messages par coach
- Sujets les plus demandés
- Taux de complétion des modules
- Temps moyen de réponse

### Logs

```bash
# Voir les logs en temps réel
npm run logs

# Logs d'un élève spécifique
npm run logs:student -- --phone "+33612345678"
```

---

## 🎓 Guide pour les Élèves

### Accès WhatsApp

1. Enregistre le numéro : **+XX XXX XXX XXX**
2. Envoie "Salut" pour commencer
3. Marty te guidera !

### Accès Web

1. Va sur **indiemusician.fr/coach**
2. Connecte-toi avec ton email
3. Commence à chatter !

### Bonnes Pratiques

✅ **Sois précis** - Dis clairement ce que tu veux bosser
✅ **Suis les étapes** - Commence par l'identité avec Luke
✅ **Prends ton temps** - Les coachs avancent pas à pas
✅ **Partage ton avancement** - Dis quand tu as fini une action
✅ **Demande des ressources** - Les coachs ont plein de liens utiles

---

## 🤝 Contribution

Ce projet est maintenu par l'équipe Indie Musician.

Pour toute question ou amélioration :
- Contact : clem@indiemusician.fr
- Créé avec ❤️ par Clem (et sa touffe de cheveux légendaire)

---

## 📄 Licence

Propriété d'Indie Musician - Tous droits réservés
Réservé aux élèves inscrits uniquement.

---

**Prêt à faire vibrer ta carrière musicale ? Let's go ! 🚀🎵**
