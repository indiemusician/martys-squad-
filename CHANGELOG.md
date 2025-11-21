# 📝 Changelog - Marty's Squad

Historique des versions et modifications du projet.

---

## [0.1.0] - 2025-01-15

### 🎉 Initial Setup

**Documentation**
- ✅ README.md principal créé
- ✅ ARCHITECTURE.md détaillée
- ✅ QUICKSTART.md pour démarrage rapide
- ✅ TODO.md roadmap 12 semaines
- ✅ Mise en place structure projet

**Configuration**
- ✅ `config/coaches.json` avec toutes les personnalités
- ✅ `config/example.env` template variables d'environnement
- ✅ Structure dossiers créée (`lib/`, `app/`, `docs/`)

**Knowledge Base**
- ✅ Migration de tous les prompts originaux dans `docs/`
- ✅ Organisation par coach (Marty, Luke, Peter, Riplay, April, Clarice)
- ✅ Mapping des ressources (vidéos YT, templates Canva)

**Prochaines Étapes**
- 🔜 Implémenter Marty (orchestrateur)
- 🔜 Setup base de données PostgreSQL
- 🔜 Intégration Anthropic Claude API
- 🔜 Premier test CLI

---

## [Unreleased]

### À Venir

**v0.2.0 - Marty MVP**
- [ ] Marty fonctionnel en CLI
- [ ] Routing intelligent vers coachs
- [ ] Tests unitaires routing
- [ ] Documentation API

**v0.3.0 - Database & Context**
- [ ] PostgreSQL setup (Supabase)
- [ ] Redis sessions (Upstash)
- [ ] Student context management
- [ ] Whitelist authentication

**v0.4.0 - Luke + Peter**
- [ ] Luke agent complet
- [ ] Peter agent complet
- [ ] Transitions entre coachs
- [ ] Tests conversation flow

**v0.5.0 - WhatsApp Integration**
- [ ] Twilio webhook
- [ ] Messages entrants/sortants
- [ ] Validation signature
- [ ] Tests end-to-end WhatsApp

**v1.0.0 - MVP Production**
- [ ] Marty + Luke + Peter opérationnels
- [ ] WhatsApp fonctionnel
- [ ] 10 premiers élèves en beta
- [ ] Monitoring basique

---

## Format

Le format s'inspire de [Keep a Changelog](https://keepachangelog.com/).

Types de changements :
- `Added` - Nouvelles fonctionnalités
- `Changed` - Modifications de fonctionnalités existantes
- `Deprecated` - Fonctionnalités dépréciées
- `Removed` - Fonctionnalités supprimées
- `Fixed` - Corrections de bugs
- `Security` - Corrections de sécurité

---

**Projet maintenu par Indie Musician - Créé avec ❤️ par Clem**
