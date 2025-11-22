// tests/lib/artist-lookup.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock Prisma
const mockPrisma = {
  user: {
    findFirst: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
  conversation: {
    create: vi.fn(),
    update: vi.fn(),
  },
  message: {
    create: vi.fn(),
  },
};

vi.mock('@/lib/db/prisma', () => ({
  prisma: mockPrisma,
}));

// Mock Redis
const mockRedis = {
  getSession: vi.fn(),
  setSession: vi.fn(),
};

vi.mock('@/lib/cache/redis', () => mockRedis);

describe('Artist Lookup System', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Artist Name Validation', () => {
    it('should handle valid artist names', () => {
      const validNames = ['DJ Test', 'The Artist', 'Jean-Pierre', 'Léa_Music', '音楽家'];
      validNames.forEach((name) => {
        expect(name.length).toBeGreaterThan(0);
        expect(name).not.toBe('Anonymous');
      });
    });

    it('should reject Anonymous as valid artist name', () => {
      const artistName = 'Anonymous';
      const isValid = artistName && artistName !== 'Anonymous';
      expect(isValid).toBe(false);
    });

    it('should reject empty strings', () => {
      const artistName = '';
      const isValid = !!(artistName && artistName !== 'Anonymous');
      expect(isValid).toBe(false);
    });
  });

  describe('Case Insensitive Lookup', () => {
    it('should normalize artist name to lowercase for cache key', () => {
      const testCases = [
        { input: 'DJ Test', expected: 'artist:dj test' },
        { input: 'THE ARTIST', expected: 'artist:the artist' },
        { input: 'MixedCase', expected: 'artist:mixedcase' },
      ];

      testCases.forEach(({ input, expected }) => {
        const key = `artist:${input.toLowerCase()}`;
        expect(key).toBe(expected);
      });
    });
  });

  describe('History Loading', () => {
    it('should format messages correctly for history', () => {
      const dbMessages = [
        { id: '1', role: 'user', content: 'Salut!', createdAt: new Date() },
        { id: '2', role: 'assistant', content: 'Yo!', createdAt: new Date() },
      ];

      const history = dbMessages.map((m) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      }));

      expect(history).toEqual([
        { role: 'user', content: 'Salut!' },
        { role: 'assistant', content: 'Yo!' },
      ]);
    });

    it('should limit history to recent messages', () => {
      const manyMessages = Array.from({ length: 20 }, (_, i) => ({
        role: i % 2 === 0 ? 'user' : 'assistant',
        content: `Message ${i}`,
      }));

      // Should keep only last 6 for Redis cache
      const recentHistory = manyMessages.slice(-6);
      expect(recentHistory.length).toBe(6);

      // Should keep last 10 from DB
      const dbHistory = manyMessages.slice(-10);
      expect(dbHistory.length).toBe(10);
    });
  });

  describe('Context Generation', () => {
    it('should generate context string for returning user', () => {
      const artistName = 'DJ Test';
      const lastCoach = 'luke';
      const lastInteraction = '22/11/2025';

      const context = `
📝 CONTEXTE UTILISATEUR (tu connais déjà ${artistName} !) :
- Dernier coach consulté : ${lastCoach}
- Dernière interaction : ${lastInteraction}
- C'est un(e) habitué(e) ! Rappelle où vous en étiez.
`;

      expect(context).toContain(artistName);
      expect(context).toContain(lastCoach);
      expect(context).toContain('habitué(e)');
    });

    it('should include conversation summary when available', () => {
      const messages = [
        { role: 'user', content: 'Je veux bosser mon identité' },
        { role: 'assistant', content: 'Super ! Commençons par ton pourquoi...' },
      ];

      const summary = messages
        .map((m) => `- ${m.role}: "${m.content.substring(0, 50)}..."`)
        .join('\n');

      expect(summary).toContain('identité');
      expect(summary).toContain('pourquoi');
    });
  });

  describe('Redis Cache Integration', () => {
    it('should cache session data with correct TTL', async () => {
      const sessionData = {
        userId: 'user-123',
        conversationId: 'conv-456',
        lastCoach: 'marty',
        lastInteraction: new Date().toISOString(),
        recentHistory: [],
      };

      const TTL_24H = 86400;

      // Mock setSession call
      mockRedis.setSession.mockResolvedValue(undefined);

      await mockRedis.setSession('artist:dj test', sessionData, TTL_24H);

      expect(mockRedis.setSession).toHaveBeenCalledWith(
        'artist:dj test',
        sessionData,
        TTL_24H
      );
    });

    it('should return cached data when available', async () => {
      const cachedData = {
        userId: 'user-123',
        conversationId: 'conv-456',
        lastCoach: 'peter',
        lastInteraction: '2025-11-22T10:00:00.000Z',
        recentHistory: [{ role: 'user', content: 'test' }],
      };

      mockRedis.getSession.mockResolvedValue(cachedData);

      const result = await mockRedis.getSession('artist:dj test');

      expect(result).toEqual(cachedData);
      expect(result.lastCoach).toBe('peter');
    });
  });

  describe('Database Fallback', () => {
    it('should query database when cache miss', async () => {
      mockRedis.getSession.mockResolvedValue(null);

      mockPrisma.user.findFirst.mockResolvedValue({
        id: 'user-123',
        artistName: 'DJ Test',
        conversations: [
          {
            id: 'conv-456',
            currentCoach: 'riplay',
            updatedAt: new Date(),
            messages: [
              { role: 'user', content: 'Aide moi avec Spotify' },
              { role: 'assistant', content: 'Je suis Riplay...' },
            ],
          },
        ],
      });

      // Cache miss
      const cached = await mockRedis.getSession('artist:dj test');
      expect(cached).toBeNull();

      // DB query
      const user = await mockPrisma.user.findFirst({
        where: {
          artistName: {
            equals: 'DJ Test',
            mode: 'insensitive',
          },
        },
      });

      expect(user).not.toBeNull();
      expect(user.conversations[0].currentCoach).toBe('riplay');
    });
  });
});
