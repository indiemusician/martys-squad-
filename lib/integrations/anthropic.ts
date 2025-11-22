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

// Prix Claude 3 Haiku (en $ par million de tokens)
const HAIKU_PRICING = {
  input: 0.25 / 1_000_000,   // $0.25 per MTok
  output: 1.25 / 1_000_000,  // $1.25 per MTok
};

export interface SendMessageResult {
  content: string;
  tokensInput: number;
  tokensOutput: number;
  cost: number;
  responseTimeMs: number;
  model: string;
}

/**
 * Envoie un message à Claude et retourne la réponse avec les métriques
 * Compatible avec le mock et la vraie API
 */
export async function sendMessage(
  messages: Array<{ role: 'user' | 'assistant'; content: string }>,
  systemPrompt: string
): Promise<string> {
  const result = await sendMessageWithMetrics(messages, systemPrompt);
  return result.content;
}

/**
 * Envoie un message à Claude et retourne la réponse AVEC les métriques
 * (tokens, coût, temps de réponse)
 */
export async function sendMessageWithMetrics(
  messages: Array<{ role: 'user' | 'assistant'; content: string }>,
  systemPrompt: string
): Promise<SendMessageResult> {
  const client = getAnthropicClient();
  const startTime = Date.now();

  const response = await client.messages.create({
    model: 'claude-3-haiku-20240307', // Claude 3 Haiku (fastest, cheapest)
    max_tokens: 1024,
    messages,
    system: systemPrompt,
  });

  const responseTimeMs = Date.now() - startTime;

  // Extraire les tokens de la réponse
  const tokensInput = response.usage?.input_tokens || 0;
  const tokensOutput = response.usage?.output_tokens || 0;

  // Calculer le coût
  const cost = (tokensInput * HAIKU_PRICING.input) + (tokensOutput * HAIKU_PRICING.output);

  return {
    content: response.content[0].text,
    tokensInput,
    tokensOutput,
    cost,
    responseTimeMs,
    model: 'claude-3-haiku-20240307',
  };
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
