# 🎁 Agent Starter Kit - Instructions

## 📦 Contenu Livré

Tu trouveras à la racine du projet:
- **`starter-kit/`** - Dossier complet avec templates et exemples
- **`agent-starter-kit.zip`** - Archive ZIP prête à partager

## 🚀 Pour Ton Pote

### Option 1: Partager le ZIP
```bash
# Lui envoyer le fichier
agent-starter-kit.zip (10 KB)
```

Il doit:
1. Télécharger son propre code du projet (git clone)
2. Extraire le ZIP à la racine: `unzip agent-starter-kit.zip`
3. Suivre le README dans `starter-kit/README.md`

### Option 2: Partager le Dossier
```bash
# Copier le dossier starter-kit/ dans son projet
cp -r starter-kit/ /path/to/his/project/
```

---

## 📚 Contenu du Starter Kit

### 1. README Principal
`starter-kit/README.md`
- Guide complet de démarrage rapide (5 min)
- Checklist complète de migration
- Exemples par type de business
- Documentation détaillée

### 2. Templates
`starter-kit/templates/`

**prompt-template.md**
- Template de prompt avec variables `{{VARIABLE}}`
- Exemples de valeurs pour chaque type de business (Restaurant, Hôtel, Spa)
- Instructions de personnalisation

**business-config.json**
- Configuration JSON structurée
- Services, contraintes, politique d'annulation
- Workflow et style de l'agent

### 3. Exemples Complets
`starter-kit/examples/restaurant/`
- Configuration complète pour un restaurant
- Prompt personnalisé ready-to-use
- README avec instructions spécifiques

---

## 🎯 Workflow de Personnalisation

### Étape 1: Analyser le Business (30 min)
Ton pote doit répondre à ces questions:
1. Quels services/produits vendez-vous?
2. Quels sont les prix et durées?
3. Quelles sont les contraintes de sécurité/santé?
4. Quelle est votre politique d'annulation?
5. Quelles informations client sont obligatoires?

### Étape 2: Remplir les Templates (20 min)
1. Ouvrir `templates/business-config.json`
2. Remplacer toutes les variables
3. Ouvrir `templates/prompt-template.md`
4. Personnaliser selon son business

### Étape 3: Appliquer les Changements (10 min)
```bash
# Mettre à jour le prompt système
cp starter-kit/templates/prompt-template.md lib/agent/prompts.ts

# Adapter les validations si besoin
# Éditer lib/agent/tools/validation.ts
```

### Étape 4: Tester (30 min)
```bash
# Build local
npm run build

# Test en dev
npm run dev

# Tester les scénarios dans le chat
```

---

## 🔧 Fichiers à Modifier

Pour adapter complètement le projet:

### 1. Prompt Système (OBLIGATOIRE)
**Fichier**: `lib/agent/prompts.ts`
**Ligne**: ~55 (DEFAULT_SYSTEM_PROMPT)
**Action**: Remplacer par le prompt personnalisé

### 2. Services/Produits (OBLIGATOIRE)
**Fichier**: `lib/validations/booking.ts`
**Ligne**: ~10 (FLIGHT_INFO)
**Action**: Renommer "FLIGHT_INFO" en "SERVICE_INFO" et adapter

Exemple:
```typescript
export const SERVICE_INFO = {
  menu_decouverte: {
    name: 'Menu Découverte',
    price: { min: 45, max: 55 },
    duration: { min: 90, max: 90 },
    description: 'Découverte de notre carte'
  },
  // ... autres services
}
```

### 3. Validation des Contraintes (SI NÉCESSAIRE)
**Fichier**: `lib/agent/tools/validation.ts`
**Action**: Adapter les règles de validation

Exemple pour un restaurant:
```typescript
// Remplacer la validation poids/âge par validation allergies
export async function validateConstraints(params: {
  allergies?: string[];
  dietaryRestrictions?: string[];
  groupSize: number;
}) {
  // Logique de validation spécifique
}
```

### 4. Schémas Zod (SI STRUCTURE CHANGE)
**Fichiers**:
- `lib/agent/tools/calcom.ts` (schemas de booking)
- `lib/validations/booking.ts` (types de services)

---

## ⚠️ Points d'Attention

### Variables d'Environnement
Ton pote devra configurer:
```env
# Cal.com
CAL_COM_API_KEY=xxx
CAL_EVENT_TYPE_ID=xxx

# Twilio (si WhatsApp)
TWILIO_ACCOUNT_SID=xxx
TWILIO_AUTH_TOKEN=xxx
TWILIO_PHONE_NUMBER=xxx

# Email (si confirmation)
RESEND_API_KEY=xxx

# Database
DATABASE_URL=xxx

# Redis
UPSTASH_REDIS_REST_URL=xxx
UPSTASH_REDIS_REST_TOKEN=xxx
```

### Déploiement
Railway ou Vercel:
```bash
# Railway
railway up

# Vercel
vercel deploy
```

---

## 📖 Exemples de Business Supportés

Le starter kit inclut des guides pour:
- ✅ **Restaurant** - Réservations de tables, menus, allergies
- 🏨 **Hôtel** - Chambres, check-in/out, options
- 💆 **Spa/Bien-être** - Soins, massages, contre-indications
- 🧘 **Cours** - Yoga, danse, fitness, niveau
- 🎨 **Autres** - Adaptable à n'importe quel business de service

---

## 🆘 Support

Si ton pote a des questions:
1. Lire `starter-kit/README.md`
2. Consulter l'exemple restaurant dans `examples/restaurant/`
3. Vérifier les templates dans `templates/`

---

## ✅ Checklist de Validation

Avant de mettre en production, vérifier:
- [ ] Le prompt reflète bien le business
- [ ] Les services et prix sont corrects
- [ ] Les contraintes de sécurité sont adaptées
- [ ] La politique d'annulation est claire
- [ ] Le workflow de réservation fonctionne end-to-end
- [ ] Les variables d'environnement sont configurées
- [ ] Cal.com est connecté et testé
- [ ] Le build local passe: `npm run build`
- [ ] Le ton et style sont appropriés

---

## 🎉 C'est Prêt!

Le starter kit est complet et prêt à être partagé. Ton pote peut l'adapter à son business en quelques heures avec une bonne compréhension de son métier.

**Fichier à partager**: `agent-starter-kit.zip` (10 KB)

Bonne chance! 🚀
