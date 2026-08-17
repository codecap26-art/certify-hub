import { describe, it, expect } from 'vitest';
import { THEME_CONFIGS } from '../context/ThemeContext';

describe('Global Theme System', () => {
  it('provides 5 curated color themes', () => {
    expect(THEME_CONFIGS.length).toBe(5);
    const themeIds = THEME_CONFIGS.map((t) => t.id);
    expect(themeIds).toContain('dark-violet-sky');
    expect(themeIds).toContain('dark');
    expect(themeIds).toContain('violet');
    expect(themeIds).toContain('sunset');
    expect(themeIds).toContain('indigo');
  });

  it('contains valid visual preview metadata for every theme', () => {
    THEME_CONFIGS.forEach((config) => {
      expect(config.id).toBeTruthy();
      expect(config.name).toBeTruthy();
      expect(config.badge).toBeTruthy();
      expect(config.previewBg).toBeTruthy();
      expect(config.previewPrimary).toMatch(/^#/);
    });
  });

  it('has default Modern Indigo theme as primary theme fallback', () => {
    const defaultTheme = THEME_CONFIGS[0];
    expect(defaultTheme.id).toBe('indigo');
    expect(defaultTheme.previewPrimary).toBe('#2563EB');
  });
});
