// lib/integrations/anthropic.ts
import Anthropic from '@anthropic-ai/sdk';
import { MockAnthropic } from '../mocks/mock-anthropic';

/**
 * Retourne le client Anthropic (réel ou mock selon la config)
 * En mode mock, aucune vraie API n'est appelée
 */
export function getAnthropicClient() {
  // Vérifie dynamiquement (pas au chargement du module)
  const USE_MOCK = process.env.USE_MOCK_ANTHROPIC === 'true';

  if (USE_MOCK) {
    console.log('🎭 [DEV] Using MOCK Anthropic client (no real API calls)');
    return new MockAnthropic() as any;
  }

  if (!process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY === 'mock-key-dev') {
    throw new Error('ANTHROPIC_API_KEY is required when USE_MOCK_ANTHROPIC is not true. Please set a real API key or set USE_MOCK_ANTHROPIC=true');
  }

  console.log('🤖 [PROD] Using REAL Anthropic client');
  return new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  });
}

/**
 * Envoie un message à Claude et retourne la réponse
 * Compatible avec le mock et la vraie API
 */
export async function sendMessage(
  messages: Array<{ role: 'user' | 'assistant'; content: string }>,
  systemPrompt: string
): Promise<string> {
  const client = getAnthropicClient();

  const response = await client.messages.create({
    model: 'claude-3-haiku-20240307', // Claude 3 Haiku (fastest, cheapest)
    max_tokens: 1024,
    messages,
    system: systemPrompt,
  });

  // Les deux (mock et real) retournent le même format
  return response.content[0].text;
}

/**
 * Envoie un message avec streaming (pour l'UI en temps réel)
 * TODO: À implémenter plus tard pour l'UI web
 */
export async function sendMessageStream(
  messages: Array<{ role: 'user' | 'assistant'; content: string }>,
  systemPrompt: string
): Promise<ReadableStream> {
  throw new Error('Streaming not implemented yet - coming in Phase 2');
}
