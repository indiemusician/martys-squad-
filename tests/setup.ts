// tests/setup.ts
import { vi } from 'vitest';

// Mock environment variables for tests
process.env.NODE_ENV = 'test';
process.env.ANTHROPIC_API_KEY = 'test-api-key';
process.env.REDIS_URL = 'mock';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';

// Mock console.log/error to reduce noise in tests (optional)
// vi.spyOn(console, 'log').mockImplementation(() => {});
// vi.spyOn(console, 'error').mockImplementation(() => {});

// Global test utilities
export const createMockRequest = (body: unknown, method = 'POST') => {
  return {
    json: vi.fn().mockResolvedValue(body),
    method,
  };
};
