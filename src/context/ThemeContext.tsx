'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

export type AppTheme = 'dark-violet-sky' | 'dark' | 'violet' | 'sunset' | 'emerald' | 'indigo';

export interface ThemeConfig {
  id: AppTheme;
  name: string;
  badge: string;
  previewBg: string;
  previewPrimary: string;
  description: string;
}

export const THEME_CONFIGS: ThemeConfig[] = [
  {
    id: 'dark-violet-sky',
    name: 'Dark Violet & Sky Blue',
    badge: '🌌 Cosmic Dark Glow',
    previewBg: 'bg-gradient-to-r from-purple-600 to-sky-400',
    previewPrimary: '#8B5CF6',
    description: 'Deep cosmic dark background with vibrant violet & sky blue neon gradients.',
  },
  {
    id: 'dark',
    name: 'Midnight Luxury',
    badge: '🌙 Midnight Dark',
    previewBg: 'bg-slate-900',
    previewPrimary: '#38BDF8',
    description: 'Sleek dark mode aesthetic with glowing cyan accents and deep contrast.',
  },
  {
    id: 'violet',
    name: 'Royal Violet Rose',
    badge: '👑 Royal Purple',
    previewBg: 'bg-purple-900',
    previewPrimary: '#7C3AED',
    description: 'Royal purple velvet tones with pink & sky blue accents.',
  },
  {
    id: 'sunset',
    name: 'Sunset Cyber Gold',
    badge: '🌅 High Vibrancy',
    previewBg: 'bg-amber-700',
    previewPrimary: '#D97706',
    description: 'Warm amber filigree styling for high-honor award visual impact.',
  },
  {
    id: 'indigo',
    name: 'Modern Indigo',
    badge: '🌊 Clean Corporate',
    previewBg: 'bg-blue-600',
    previewPrimary: '#2563EB',
    description: 'Clean, professional corporate design with rich blue accents.',
  },
];

interface ThemeContextType {
  theme: AppTheme;
  setTheme: (theme: AppTheme) => void;
  activeThemeConfig: ThemeConfig;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const STORAGE_KEY = 'certifyhub:v1:app_theme';

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<AppTheme>('dark-violet-sky');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY) as AppTheme;
      if (saved && THEME_CONFIGS.some((t) => t.id === saved)) {
        setThemeState(saved);
        document.documentElement.setAttribute('data-theme', saved);
      } else {
        document.documentElement.setAttribute('data-theme', 'dark-violet-sky');
      }
    }
  }, []);

  const setTheme = (newTheme: AppTheme) => {
    setThemeState(newTheme);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, newTheme);
      document.documentElement.setAttribute('data-theme', newTheme);
    }
  };

  const activeThemeConfig = THEME_CONFIGS.find((t) => t.id === theme) || THEME_CONFIGS[0];

  return (
    <ThemeContext.Provider value={{ theme, setTheme, activeThemeConfig }}>
      <div className={`theme-${theme} transition-colors duration-300`}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
};

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (!context) {
    return {
      theme: 'dark-violet-sky',
      setTheme: () => {},
      activeThemeConfig: THEME_CONFIGS[0],
    };
  }
  return context;
}
