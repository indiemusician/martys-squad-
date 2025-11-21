#!/usr/bin/env tsx
// scripts/test-marty.ts

/**
 * Script de test pour vérifier que Marty fonctionne
 * Lance des conversations simulées avec différents intents
 */

// Charge les variables d'environnement depuis .env.local
import { config } from 'dotenv';
config({ path: '.env.local' });

import { sendMessage } from '../lib/integrations/anthropic';
import { SYSTEM_PROMPTS } from '../lib/prompts/system-prompts';

const COLORS = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  magenta: '\x1b[35m',
};

function log(emoji: string, label: string, text: string, color = COLORS.reset) {
  console.log(`${color}${emoji} ${label}${COLORS.reset}`);
  console.log(`   ${text}\n`);
}

async function testMarty(userMessage: string, expectedIntent?: string) {
  log('📱', 'USER MESSAGE', userMessage, COLORS.cyan);

  const startTime = Date.now();

  try {
    const response = await sendMessage(
      [{ role: 'user', content: userMessage }],
      SYSTEM_PROMPTS.marty
    );

    const duration = Date.now() - startTime;

    log('🎙️', 'MARTY RESPONSE', response, COLORS.green);

    if (expectedIntent) {
      log('✅', 'EXPECTED INTENT', expectedIntent, COLORS.yellow);
    }

    console.log(`${COLORS.magenta}⏱️  Response time: ${duration}ms${COLORS.reset}\n`);
    console.log('─'.repeat(80) + '\n');

  } catch (error) {
    console.error('❌ ERROR:', error);
    console.log('─'.repeat(80) + '\n');
  }
}

async function runTests() {
  console.log('\n' + '═'.repeat(80));
  console.log(`${COLORS.bright}${COLORS.cyan}🎸 MARTY'S SQUAD - TEST SUITE${COLORS.reset}`);
  console.log('═'.repeat(80) + '\n');

  console.log(`${COLORS.yellow}Running tests with ${process.env.USE_MOCK_ANTHROPIC === 'true' ? 'MOCK' : 'REAL'} Anthropic API${COLORS.reset}\n`);

  // Test 1: Salutation initiale
  await testMarty('Salut !', 'greeting → introduction');

  // Test 2: Demande Instagram
  await testMarty("J'ai besoin d'aide pour Instagram", 'instagram → route to Peter');

  // Test 3: Demande identité artistique
  await testMarty("Comment définir mon identité artistique ?", 'identity → route to Luke');

  // Test 4: Demande Spotify
  await testMarty("Je veux plus de streams sur Spotify", 'spotify → route to Riplay');

  // Test 5: Demande plan promo
  await testMarty("Je sors un single dans 2 mois, il me faut un plan promo", 'promo → route to April');

  // Test 6: Demande confiance
  await testMarty("J'ai peur de sortir ma musique, je doute de moi", 'confidence → route to Clarice');

  // Test 7: Demande floue
  await testMarty("Je sais pas trop par où commencer", 'unclear → ask questions');

  console.log('═'.repeat(80));
  console.log(`${COLORS.bright}${COLORS.green}✅ All tests completed!${COLORS.reset}`);
  console.log('═'.repeat(80) + '\n');
}

// Lance les tests
runTests().catch(console.error);
