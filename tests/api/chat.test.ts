// tests/api/chat.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock dependencies before importing the route
vi.mock('@/lib/integrations/anthropic', () => ({
  sendMessage: vi.fn().mockResolvedValue('Yo ! Bienvenue dans la Squad !'),
}));

vi.mock('@/lib/db/prisma', () => ({
  prisma: {
    user: {
      findFirst: vi.fn().mockResolvedValue(null),
      create: vi.fn().mockResolvedValue({ id: 'test-user-id' }),
      update: vi.fn().mockResolvedValue({}),
    },
    conversation: {
      findUnique: vi.fn().mockResolvedValue(null),
      create: vi.fn().mockResolvedValue({ id: 'test-conv-id' }),
      update: vi.fn().mockResolvedValue({}),
    },
    message: {
      create: vi.fn().mockResolvedValue({}),
    },
  },
}));

vi.mock('@/lib/cache/redis', () => ({
  getSession: vi.fn().mockResolvedValue(null),
  setSession: vi.fn().mockResolvedValue(undefined),
}));

import { SYSTEM_PROMPTS } from '@/lib/prompts/system-prompts';
import { sendMessage } from '@/lib/integrations/anthropic';

describe('Chat API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('System Prompts', () => {
    it('should have all 6 coaches defined', () => {
      const coaches = Object.keys(SYSTEM_PROMPTS);
      expect(coaches).toContain('marty');
      expect(coaches).toContain('luke');
      expect(coaches).toContain('peter');
      expect(coaches).toContain('riplay');
      expect(coaches).toContain('april');
      expect(coaches).toContain('clarice');
      expect(coaches.length).toBe(6);
    });

    it('Marty should ask for artist name in workflow', () => {
      expect(SYSTEM_PROMPTS.marty).toContain('nom d\'artiste');
    });

    it('each coach should have distinct personality', () => {
      // Marty - Rock'n'roll
      expect(SYSTEM_PROMPTS.marty).toContain('Yo');
      expect(SYSTEM_PROMPTS.marty).toContain('Let\'s go');

      // Luke - Philosophe
      expect(SYSTEM_PROMPTS.luke).toContain('Intéressant');
      expect(SYSTEM_PROMPTS.luke).toContain('Creusons');

      // Peter - Grand frère
      expect(SYSTEM_PROMPTS.peter).toContain('Franchement');
      expect(SYSTEM_PROMPTS.peter).toContain('Fais-moi confiance');

      // Riplay - Stratège
      expect(SYSTEM_PROMPTS.riplay).toContain('Concrètement');
      expect(SYSTEM_PROMPTS.riplay).toContain('hacker l\'algo');

      // April - Chef de projet
      expect(SYSTEM_PROMPTS.april).toContain('Checklist');
      expect(SYSTEM_PROMPTS.april).toContain('Semaine par semaine');

      // Clarice - Thérapeute
      expect(SYSTEM_PROMPTS.clarice).toContain('Je t\'entends');
      expect(SYSTEM_PROMPTS.clarice).toContain('C\'est normal');
    });
  });

  describe('Coach Detection Keywords', () => {
    it('Marty should detect identity keywords for Luke', () => {
      expect(SYSTEM_PROMPTS.marty).toContain('"identité"');
      expect(SYSTEM_PROMPTS.marty).toContain('Luke');
    });

    it('Marty should detect social media keywords for Peter', () => {
      expect(SYSTEM_PROMPTS.marty).toContain('"Instagram"');
      expect(SYSTEM_PROMPTS.marty).toContain('"followers"');
      expect(SYSTEM_PROMPTS.marty).toContain('Peter');
    });

    it('Marty should detect Spotify keywords for Riplay', () => {
      expect(SYSTEM_PROMPTS.marty).toContain('"Spotify"');
      expect(SYSTEM_PROMPTS.marty).toContain('"streams"');
      expect(SYSTEM_PROMPTS.marty).toContain('Riplay');
    });

    it('Marty should detect promo keywords for April', () => {
      expect(SYSTEM_PROMPTS.marty).toContain('"sortie"');
      expect(SYSTEM_PROMPTS.marty).toContain('"promo"');
      expect(SYSTEM_PROMPTS.marty).toContain('April');
    });

    it('Marty should detect mental blockers for Clarice', () => {
      expect(SYSTEM_PROMPTS.marty).toContain('"peur"');
      expect(SYSTEM_PROMPTS.marty).toContain('"blocage"');
      expect(SYSTEM_PROMPTS.marty).toContain('Clarice');
    });
  });

  describe('Coach Methodologies', () => {
    it('Luke should have 6-step methodology', () => {
      expect(SYSTEM_PROMPTS.luke).toContain('Étape 1');
      expect(SYSTEM_PROMPTS.luke).toContain('Étape 2');
      expect(SYSTEM_PROMPTS.luke).toContain('Étape 3');
      expect(SYSTEM_PROMPTS.luke).toContain('Étape 4');
      expect(SYSTEM_PROMPTS.luke).toContain('Étape 5');
      expect(SYSTEM_PROMPTS.luke).toContain('Étape 6');
    });

    it('Peter should have emotional tunnel methodology', () => {
      expect(SYSTEM_PROMPTS.peter).toContain('TUNNEL ÉMOTIONNEL');
      expect(SYSTEM_PROMPTS.peter).toContain('Reels');
      expect(SYSTEM_PROMPTS.peter).toContain('Feed');
      expect(SYSTEM_PROMPTS.peter).toContain('Stories');
    });

    it('Riplay should have 2 parallel strategies', () => {
      expect(SYSTEM_PROMPTS.riplay).toContain('STRATÉGIE 1');
      expect(SYSTEM_PROMPTS.riplay).toContain('STRATÉGIE 2');
      expect(SYSTEM_PROMPTS.riplay).toContain('PLAYLIST');
      expect(SYSTEM_PROMPTS.riplay).toContain('MINI-CLIPS');
    });

    it('April should have 7-week plan', () => {
      expect(SYSTEM_PROMPTS.april).toContain('SEMAINE -4');
      expect(SYSTEM_PROMPTS.april).toContain('SEMAINE -3');
      expect(SYSTEM_PROMPTS.april).toContain('SEMAINE -2');
      expect(SYSTEM_PROMPTS.april).toContain('SEMAINE DE SORTIE');
      expect(SYSTEM_PROMPTS.april).toContain('SEMAINE +1');
      expect(SYSTEM_PROMPTS.april).toContain('SEMAINE +2');
      expect(SYSTEM_PROMPTS.april).toContain('SEMAINE +3');
    });

    it('Clarice should have therapeutic phases', () => {
      expect(SYSTEM_PROMPTS.clarice).toContain('Phase 1');
      expect(SYSTEM_PROMPTS.clarice).toContain('Phase 2');
      expect(SYSTEM_PROMPTS.clarice).toContain('Phase 3');
      expect(SYSTEM_PROMPTS.clarice).toContain('Phase 4');
      expect(SYSTEM_PROMPTS.clarice).toContain('Phase 5');
    });
  });

  describe('Resources and Links', () => {
    it('Luke should have YouTube video links', () => {
      expect(SYSTEM_PROMPTS.luke).toContain('https://youtu.be/');
    });

    it('Peter should have Canva and YouTube resources', () => {
      expect(SYSTEM_PROMPTS.peter).toContain('https://youtu.be/');
      expect(SYSTEM_PROMPTS.peter).toContain('canva');
    });

    it('Riplay should have SubmitHub resources', () => {
      expect(SYSTEM_PROMPTS.riplay).toContain('SubmitHub');
      expect(SYSTEM_PROMPTS.riplay).toContain('https://youtu.be/');
    });

    it('April should have Google resources', () => {
      expect(SYSTEM_PROMPTS.april).toContain('docs.google.com');
    });
  });

  describe('sendMessage mock', () => {
    it('should return mocked response', async () => {
      const result = await sendMessage(
        [{ role: 'user', content: 'Salut!' }],
        SYSTEM_PROMPTS.marty
      );
      expect(result).toBe('Yo ! Bienvenue dans la Squad !');
    });
  });
});
