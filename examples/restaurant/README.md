# Exemple: Restaurant "La Table du Chef"

Cet exemple montre comment adapter l'agent conversationnel pour un restaurant gastronomique.

## Configuration

### Services
- Menu Découverte: 45-55€ | 90min
- Menu Dégustation: 75-85€ | 120min
- Cours de Cuisine: 95€ | 180min
- Menu Enfant: 25€ | 45min

### Contraintes
- Allergies alimentaires (obligatoire à déclarer)
- Régimes spéciaux (végétarien, végan, sans gluten)
- Groupe max: 12 personnes
- Menu enfant: <12 ans

### Politique d'annulation
- >48h: Remboursement 100%
- 24h-48h: Report gratuit
- <24h: Perdu

## Installation

```bash
# Copier la configuration
cp starter-kit/examples/restaurant/business-config.json .
cp starter-kit/examples/restaurant/prompt.txt lib/agent/prompts.ts

# Tester
npx tsx starter-kit/scripts/test-prompt.ts
```

## Fichiers Inclus

- `business-config.json` - Configuration complète
- `prompt.txt` - Prompt système complet
- `validation-rules.ts` - Règles de validation spécifiques

## Personnalisation

1. Adaptez les noms de menus
2. Modifiez les prix
3. Ajustez la politique d'annulation
4. Personnalisez le ton (actuellement: professionnel mais chaleureux)
