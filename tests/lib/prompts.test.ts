// tests/lib/prompts.test.ts
import { describe, it, expect } from 'vitest';
import { SYSTEM_PROMPTS, CoachName } from '@/lib/prompts/system-prompts';

describe('System Prompts', () => {
  const coaches: CoachName[] = ['marty', 'luke', 'peter', 'riplay', 'april', 'clarice'];

  describe('Structure', () => {
    it.each(coaches)('%s prompt should be a non-empty string', (coach) => {
      expect(typeof SYSTEM_PROMPTS[coach]).toBe('string');
      expect(SYSTEM_PROMPTS[coach].length).toBeGreaterThan(100);
    });

    it.each(coaches)('%s prompt should have personality section', (coach) => {
      expect(SYSTEM_PROMPTS[coach]).toContain('PERSONNALITÉ');
    });

    it.each(coaches)('%s prompt should have mission section', (coach) => {
      expect(SYSTEM_PROMPTS[coach]).toMatch(/MISSION|RÔLE/);
    });

    it.each(coaches)('%s prompt should have rules section', (coach) => {
      expect(SYSTEM_PROMPTS[coach]).toMatch(/RÈGLES/);
    });
  });

  describe('Marty - Le Manager', () => {
    const prompt = SYSTEM_PROMPTS.marty;

    it('should reference Clem (creator)', () => {
      expect(prompt).toContain('Clem');
    });

    it('should reference Indie Musician', () => {
      expect(prompt).toContain('Indie Musician');
    });

    it('should list all team members', () => {
      expect(prompt).toContain('Luke');
      expect(prompt).toContain('Peter');
      expect(prompt).toContain('Riplay');
      expect(prompt).toContain('April');
      expect(prompt).toContain('Clarice');
    });

    it('should have workflow for first contact', () => {
      expect(prompt).toContain('WORKFLOW');
      expect(prompt).toContain('Premier contact');
    });

    it('should not give detailed advice (coaches job)', () => {
      expect(prompt).toContain('Ne JAMAIS donner de conseils détaillés');
    });
  });

  describe('Luke - Identity Coach', () => {
    const prompt = SYSTEM_PROMPTS.luke;

    it('should focus on identity/pourquoi', () => {
      expect(prompt).toContain('identité artistique');
      expect(prompt).toContain('Pourquoi');
    });

    it('should have introspective questions', () => {
      expect(prompt).toContain('Quand tu fermes les yeux');
      expect(prompt).toContain('Pourquoi c\'est important');
    });

    it('should have visual identity section', () => {
      expect(prompt).toContain('identité visuelle');
      expect(prompt).toContain('Code couleur');
    });
  });

  describe('Peter - Social Media Coach', () => {
    const prompt = SYSTEM_PROMPTS.peter;

    it('should focus on fan base creation', () => {
      expect(prompt).toContain('fan base');
      expect(prompt).toContain('communauté');
    });

    it('should explain Instagram tools', () => {
      expect(prompt).toContain('Reels');
      expect(prompt).toContain('Feed');
      expect(prompt).toContain('Stories');
    });

    it('should recommend Luke first', () => {
      expect(prompt).toContain('Luke');
      expect(prompt).toContain('PRÉREQUIS');
    });
  });

  describe('Riplay - Spotify Coach', () => {
    const prompt = SYSTEM_PROMPTS.riplay;

    it('should focus on Spotify strategy', () => {
      expect(prompt).toContain('Spotify');
      expect(prompt).toContain('streams');
      expect(prompt).toContain('algorithme');
    });

    it('should explain playlist strategy', () => {
      expect(prompt).toContain('playlist');
      expect(prompt).toContain('position 2');
    });

    it('should explain mini-clips strategy', () => {
      expect(prompt).toContain('mini-clips');
      expect(prompt).toContain('hook');
      expect(prompt).toContain('10-15 secondes');
    });

    it('should mention technical setup', () => {
      expect(prompt).toContain('Meta Business');
      expect(prompt).toContain('pixel');
    });
  });

  describe('April - Promo Coach', () => {
    const prompt = SYSTEM_PROMPTS.april;

    it('should have 7-week timeline', () => {
      expect(prompt).toContain('7 semaines');
      expect(prompt).toContain('SEMAINE -4');
      expect(prompt).toContain('SEMAINE +3');
    });

    it('should have checklist for each week', () => {
      expect(prompt).toContain('To-do');
      expect(prompt).toContain('Posts');
    });

    it('should mention release day specifics', () => {
      expect(prompt).toContain('JOUR J');
      expect(prompt).toContain('smartlink');
    });

    it('should have bilan section', () => {
      expect(prompt).toContain('BILAN');
      expect(prompt).toContain('followers gagnés');
    });
  });

  describe('Clarice - Therapist Coach', () => {
    const prompt = SYSTEM_PROMPTS.clarice;

    it('should focus on mental blockers', () => {
      expect(prompt).toContain('blocage');
      expect(prompt).toContain('confiance');
      expect(prompt).toContain('imposteur');
    });

    it('should have therapeutic approach', () => {
      expect(prompt).toContain('écoute');
      expect(prompt).toContain('safe');
    });

    it('should have disclaimer about professional help', () => {
      expect(prompt).toContain('psychologue');
      expect(prompt).toContain('DISCLAIMER');
    });

    it('should have exercises section', () => {
      expect(prompt).toContain('Exercices');
      expect(prompt).toContain('Lister');
    });
  });

  describe('YouTube Resources', () => {
    it.each(['luke', 'peter', 'riplay'] as CoachName[])(
      '%s should have YouTube links',
      (coach) => {
        expect(SYSTEM_PROMPTS[coach]).toContain('https://youtu.be/');
      }
    );

    it('april should have Google Docs links', () => {
      expect(SYSTEM_PROMPTS.april).toContain('docs.google.com');
    });
  });

  describe('Canva Resources', () => {
    it.each(['luke', 'peter'] as CoachName[])(
      '%s should have Canva links',
      (coach) => {
        expect(SYSTEM_PROMPTS[coach].toLowerCase()).toContain('canva');
      }
    );
  });
});
