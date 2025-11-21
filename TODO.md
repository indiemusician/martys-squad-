# 📝 TODO - Marty's Squad

Roadmap et tâches pour construire le système de coaching musical.

---

## 🎯 Phase 1 : MVP (Semaines 1-4)

### Semaine 1 : Infrastructure de Base

**Backend Core**
- [ ] Initialiser projet Next.js 14 (App Router)
- [ ] Configurer TypeScript strict
- [ ] Setup Anthropic SDK
- [ ] Créer structure de dossiers (`lib/`, `app/`, `config/`)
- [ ] Configurer variables d'environnement
- [ ] Setup Prettier + ESLint

**Database**
- [ ] Créer compte Supabase
- [ ] Définir schéma PostgreSQL (students, conversations, messages)
- [ ] Créer migrations initiales
- [ ] Setup client Supabase
- [ ] Créer fonctions CRUD basiques

**Redis**
- [ ] Créer compte Upstash
- [ ] Configurer client Redis
- [ ] Implémenter session management

---

### Semaine 2 : Marty + Routing

**Marty (Orchestrateur)**
- [ ] Créer `lib/prompts/marty.ts` avec prompt système complet
- [ ] Implémenter `lib/agents/marty.ts`
- [ ] Tester Marty en CLI (`scripts/test-marty.ts`)
- [ ] Valider que Marty accueille correctement

**Routing Intelligence**
- [ ] Créer `lib/tools/routing.ts`
- [ ] Implémenter analyse d'intention (keywords + semantic)
- [ ] Mapper topics → coachs
- [ ] Tester routing avec différents messages
- [ ] Créer `scripts/test-routing.ts`

**Context Management**
- [ ] Définir interface `StudentContext`
- [ ] Implémenter `lib/tools/student-context.ts`
- [ ] Fonctions : loadContext, saveContext, updateContext
- [ ] Tester persistance Redis + PostgreSQL

---

### Semaine 3 : Luke + Peter

**Luke (Identité Artistique)**
- [ ] Extraire prompt depuis `docs/Luke - le pro de la direction artistique.txt`
- [ ] Créer `lib/prompts/luke.ts`
- [ ] Créer `lib/agents/luke.ts`
- [ ] Implémenter logique de conversation
- [ ] Tester transition Marty → Luke
- [ ] Valider que Luke pose les bonnes questions

**Peter (Réseaux Sociaux)**
- [ ] Extraire prompt depuis `docs/Peter - le pro des réseaux sociaux.txt`
- [ ] Créer `lib/prompts/peter.ts`
- [ ] Créer `lib/agents/peter.ts`
- [ ] Vérifier prérequis (identity_defined)
- [ ] Tester redirection vers Luke si identité non définie
- [ ] Valider méthodologie étape par étape

**Transitions Between Coaches**
- [ ] Implémenter `switchToCoach()` dans routing
- [ ] Messages de transition personnalisés
- [ ] Sauvegarder coach actuel dans contexte
- [ ] Tester scénarios : Marty → Luke → Peter

---

### Semaine 4 : WhatsApp + Tests

**Twilio Integration**
- [ ] Créer compte Twilio
- [ ] Acheter numéro WhatsApp Business
- [ ] Créer `app/api/webhooks/twilio/route.ts`
- [ ] Implémenter validation signature Twilio
- [ ] Parser messages entrants
- [ ] Envoyer réponses via Twilio API
- [ ] Tester avec Twilio Sandbox

**Authentication & Whitelist**
- [ ] Créer table `students` avec whitelist
- [ ] Implémenter `authenticateStudent()`
- [ ] Messages d'erreur personnalisés (not_enrolled, expired)
- [ ] Créer script `scripts/add-student.ts`
- [ ] Tester avec 3-5 numéros test

**Testing**
- [ ] Créer scénarios de test
- [ ] Test : Premier contact
- [ ] Test : Routing vers Luke
- [ ] Test : Routing vers Peter avec prérequis
- [ ] Test : WhatsApp end-to-end
- [ ] Inviter 3 beta testeurs (élèves Clem)

---

## 🚀 Phase 2 : Extension (Semaines 5-8)

### Semaine 5 : Riplay + April

**Riplay (Spotify)**
- [ ] Extraire prompt depuis `docs/Riplay - la pro de spoify.txt`
- [ ] Créer `lib/agents/riplay.ts`
- [ ] Implémenter logique stratégie Spotify
- [ ] Vérifier prérequis (identity + Spotify profile)
- [ ] Mapper ressources vidéos Spotify

**April (Plan Promo)**
- [ ] Extraire prompt depuis `docs/April - la cheffe de projet.txt`
- [ ] Créer `lib/agents/april.ts`
- [ ] Implémenter plan 7 semaines
- [ ] Parser rétroplanning depuis `docs/Plan promo 7 semaines.txt`
- [ ] Avancer semaine par semaine

---

### Semaine 6 : Clarice + Knowledge Base

**Clarice (Thérapeute)**
- [ ] Extraire prompt depuis `docs/Clarice - la thérapeute d_artiste.txt`
- [ ] Créer `lib/agents/clarice.ts`
- [ ] Ton bienveillant et rassurant
- [ ] Accessible à tout moment (pas de prérequis)

**Knowledge Base Setup**
- [ ] Choisir vector store (Pinecone ou Supabase Vector)
- [ ] Créer embeddings des PDFs
- [ ] Implémenter `lib/tools/knowledge-search.ts`
- [ ] Fonction de recherche sémantique
- [ ] Tester retrieval pertinence

---

### Semaine 7 : RAG + Ressources

**RAG Implementation**
- [ ] Intégrer knowledge search dans agents
- [ ] Enrichir prompts avec passages pertinents
- [ ] Extraction automatique liens YouTube
- [ ] Extraction automatique templates Canva
- [ ] Tester cohérence réponses avec sources

**Resources Mapping**
- [ ] Finaliser `config/resources.json`
- [ ] Mapper toutes les vidéos YT par coach
- [ ] Mapper tous les templates Canva
- [ ] Créer fonction `getResourcesForTopic()`

---

### Semaine 8 : Interface Web + Analytics

**Web Interface**
- [ ] Créer `app/(dashboard)/chat/page.tsx`
- [ ] UI chat style ChatGPT (Tailwind + Shadcn)
- [ ] Affichage historique conversation
- [ ] Indicateur coach actuel
- [ ] Markdown rendering des réponses

**Analytics Dashboard**
- [ ] Créer `app/admin/page.tsx`
- [ ] Métriques : élèves actifs, messages par coach
- [ ] Top topics demandés
- [ ] Taux complétion modules
- [ ] Graphiques (Recharts ou similar)

---

## 🎨 Phase 3 : Polish & Features (Semaines 9-12)

### Semaine 9 : UX Improvements

**Conversational UX**
- [ ] Quick replies (boutons suggestions)
- [ ] Indicateurs de typing
- [ ] Formatage messages (bold, lists)
- [ ] Envoi de médias (images pochettes, etc.)

**Context Enrichment**
- [ ] Détecter et sauvegarder @ Instagram
- [ ] Détecter et sauvegarder liens Spotify
- [ ] Auto-complétion profil élève
- [ ] Dashboard progression élève

---

### Semaine 10 : Advanced Features

**Proactive Coaching**
- [ ] Rappels automatiques ("Ça fait 3 jours...")
- [ ] Suggestions contextuelles
- [ ] Milestone celebrations
- [ ] Weekly check-ins

**Multi-Modal**
- [ ] Support images (pochettes, moodboards)
- [ ] Support audio (extraits de morceaux)
- [ ] Analyse de contenu visuel (screenshot Instagram)

---

### Semaine 11 : Testing & Optimization

**Load Testing**
- [ ] Test 50 élèves simultanés
- [ ] Optimiser temps de réponse
- [ ] Monitoring performance
- [ ] Rate limiting ajusté

**Prompt Optimization**
- [ ] A/B testing prompts
- [ ] Fine-tuning longueur réponses
- [ ] Améliorer routing accuracy
- [ ] Feedback élèves intégré

---

### Semaine 12 : Deployment & Launch

**Production Setup**
- [ ] Déployer sur Vercel (frontend)
- [ ] Déployer sur Railway (backend)
- [ ] Configurer domaine indiemusician.fr/coach
- [ ] SSL certificates
- [ ] Monitoring (Sentry, logs)

**Documentation**
- [ ] Guide élèves (comment utiliser)
- [ ] Guide admin (gestion whitelist)
- [ ] Runbook incident response
- [ ] FAQ

**Launch**
- [ ] Onboard premiers 20 élèves
- [ ] Email d'annonce Clem
- [ ] Tutoriel vidéo
- [ ] Support 24/7 première semaine

---

## 💡 Backlog (Ideas)

**Nice to Have**
- [ ] Multi-langue (EN/FR)
- [ ] Voice messages WhatsApp
- [ ] Integration Spotify API (stats réelles)
- [ ] Integration Instagram API (analytics)
- [ ] Gamification (badges, levels)
- [ ] Community features (partage entre élèves)
- [ ] Mobile app (React Native)
- [ ] Slack integration (pour Clem)

---

## 🐛 Bugs Tracking

**Known Issues**
- [ ] TBD après premiers tests

**To Fix**
- [ ] TBD

---

## 📊 Success Metrics

**MVP Success (Fin Phase 1)**
- [ ] 10 élèves actifs
- [ ] 500+ messages échangés
- [ ] 80%+ satisfaction (feedback)
- [ ] 0 downtime critique

**Phase 2 Success**
- [ ] 50 élèves actifs
- [ ] Tous les coachs utilisés
- [ ] 5+ modules complétés par élève en moyenne
- [ ] RAG fonctionne (ressources pertinentes)

**Phase 3 Success**
- [ ] 100+ élèves actifs
- [ ] Temps de réponse < 3s
- [ ] 90%+ satisfaction
- [ ] Features avancées utilisées

---

## 📝 Notes

- Priorité = MVP fonctionnel rapidement
- Tester avec vrais élèves dès semaine 4
- Itérer selon feedback
- Clem doit valider chaque coach avant déploiement

---

**Dernière mise à jour : 2025-01-15**
