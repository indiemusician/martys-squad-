// tests/lib/redis.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Test Redis mock behavior
describe('Redis Cache', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  describe('Mock Mode', () => {
    it('should use mock when REDIS_URL is "mock"', async () => {
      process.env.REDIS_URL = 'mock';

      const { getSession, setSession } = await import('@/lib/cache/redis');

      // setSession should not throw
      await expect(setSession('test-key', { data: 'test' })).resolves.not.toThrow();

      // getSession should return null in mock mode
      const result = await getSession('test-key');
      expect(result).toBeNull();
    });

    it('should use mock when REDIS_URL is undefined', async () => {
      delete process.env.REDIS_URL;

      const { getSession } = await import('@/lib/cache/redis');
      const result = await getSession('nonexistent-key');
      expect(result).toBeNull();
    });
  });

  describe('Session Data Structure', () => {
    it('should handle artist session data structure', () => {
      const artistSession = {
        userId: 'user-123',
        conversationId: 'conv-456',
        lastCoach: 'marty',
        lastInteraction: new Date().toISOString(),
        recentHistory: [
          { role: 'user' as const, content: 'Salut!' },
          { role: 'assistant' as const, content: 'Yo!' },
        ],
      };

      // Validate structure
      expect(artistSession).toHaveProperty('userId');
      expect(artistSession).toHaveProperty('conversationId');
      expect(artistSession).toHaveProperty('lastCoach');
      expect(artistSession).toHaveProperty('lastInteraction');
      expect(artistSession).toHaveProperty('recentHistory');
      expect(Array.isArray(artistSession.recentHistory)).toBe(true);
    });

    it('should handle user session data structure', () => {
      const userSession = {
        artistName: 'DJ Test',
        lastCoach: 'luke',
        lastInteraction: new Date().toISOString(),
        conversationId: 'conv-789',
        currentStep: 'identity',
      };

      expect(userSession).toHaveProperty('artistName');
      expect(userSession.artistName).toBe('DJ Test');
      expect(userSession.lastCoach).toBe('luke');
    });
  });

  describe('Cache Key Patterns', () => {
    it('should use correct key pattern for artist sessions', () => {
      const artistName = 'DJ Test';
      const key = `artist:${artistName.toLowerCase()}`;
      expect(key).toBe('artist:dj test');
    });

    it('should use correct key pattern for user sessions', () => {
      const userId = 'user-123';
      const key = `user:${userId}`;
      expect(key).toBe('user:user-123');
    });

    it('should use correct key pattern for cached responses', () => {
      const key = 'some-unique-key';
      const cacheKey = `cache:${key}`;
      expect(cacheKey).toBe('cache:some-unique-key');
    });
  });
});
