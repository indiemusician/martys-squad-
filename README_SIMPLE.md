# 🎸 Marty's Squad - Mode d'Emploi Ultra-Simple

## C'est quoi ?

Un système de coaching musical avec 6 coachs AI qui parlent français et ont chacun leur spécialité.

**Marty** (le manager) → Route vers les spécialistes :
- **Luke** → Identité artistique
- **Peter** → Instagram/TikTok
- **Riplay** → Spotify
- **April** → Plan promo
- **Clarice** → Confiance & blocages

---

## Comment tester MAINTENANT (sans clés API) ?

```bash
# 1. Install (déjà fait normalement)
npm install

# 2. Teste en 10 secondes
npm run test-marty
```

**Résultat** : Tu verras 7 conversations simulées avec Marty qui route vers les bons coachs.

---

## Comment lancer le serveur web ?

```bash
npm run dev
```

Puis ouvre http://localhost:3000 (ou 3001 si 3000 est pris)

---

## Comment tester l'API ?

```bash
# Dans un autre terminal (avec le serveur qui tourne)
echo '{"message":"Salut Marty!"}' | curl -X POST http://localhost:3001/api/chat -H "Content-Type: application/json" -d @-
```

Tu verras la réponse de Marty en JSON.

---

## Ça coûte combien ?

**Maintenant** : 0€ (mode mock, aucune vraie API)

**Quand Clem met ses clés** : ~100-150€/mois
- Anthropic (Claude) : ~30-50€
- Railway (hébergement + DB) : ~10-20€
- Twilio (WhatsApp) : ~50-80€

---

## Comment passer en vrai (avec Claude) ?

1. Ouvre `.env.local`
2. Change ces 2 lignes :
```bash
ANTHROPIC_API_KEY=sk-ant-LA-VRAIE-CLE
USE_MOCK_ANTHROPIC=false
```
3. Relance `npm run dev`

C'est tout ! 🚀

---

## Fichiers importants

- **`lib/prompts/system-prompts.ts`** → Les personnalités des 6 coachs
- **`lib/mocks/mock-anthropic.ts`** → Le simulateur d'API
- **`app/api/chat/route.ts`** → L'API endpoint
- **`scripts/test-marty.ts`** → Les tests

---

## Documentation complète

- **[QUICK_SUMMARY.md](QUICK_SUMMARY.md)** → Résumé rapide
- **[WHAT_I_BUILT.md](WHAT_I_BUILT.md)** → Détails de ce qui a été codé
- **[VALIDATION_CHECKLIST.md](VALIDATION_CHECKLIST.md)** → Checklist de validation
- **[GETTING_STARTED_NOW.md](GETTING_STARTED_NOW.md)** → Guide complet sans credentials

---

## Problèmes ?

**Le serveur ne démarre pas** : `npm install` puis `npm run dev`

**Les tests échouent** : Vérifie que `.env.local` existe avec `USE_MOCK_ANTHROPIC=true`

**Port déjà utilisé** : Next.js essaiera automatiquement 3001, 3002, etc.

**Autre chose** : Regarde les logs, ils sont très verbeux et expliquent tout

---

## Prochaines étapes

1. **Interface de chat** (actuellement c'est juste une page d'accueil)
2. **Database** (pour persister les conversations)
3. **WhatsApp** (quand Clem a Twilio)
4. **Railway** (déploiement en production)

---

**Status** : ✅ MVP fonctionnel en mode mock
**Tests** : ✅ 7/7 scénarios passent
**API** : ✅ Fonctionne (GET + POST)
**Cost** : 0€ (mode dev)

**Prêt à coder ! 🚀**
