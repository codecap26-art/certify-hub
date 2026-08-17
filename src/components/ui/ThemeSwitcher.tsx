'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useTheme, THEME_CONFIGS, AppTheme } from '@/context/ThemeContext';
import { Palette, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const ThemeSwitcher: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const { theme, setTheme, activeThemeConfig } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block text-left" ref={menuRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 rounded-xl border transition-all duration-200 cursor-pointer ${
          compact ? 'p-2' : 'px-3 py-1.5'
        }`}
        style={{
          backgroundColor: 'var(--surface-subtle)',
          borderColor: 'var(--border)',
          color: 'var(--text-secondary)',
          boxShadow: 'var(--shadow-xs)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = 'var(--border-strong)';
          e.currentTarget.style.backgroundColor = 'var(--surface)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = 'var(--border)';
          e.currentTarget.style.backgroundColor = 'var(--surface-subtle)';
        }}
        title={`Active Theme: ${activeThemeConfig.name}`}
        aria-label="Change color theme"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <div
          className={`w-3.5 h-3.5 rounded-full shrink-0 border-2 ${activeThemeConfig.previewBg}`}
          style={{ borderColor: 'var(--surface)' }}
        />
        {!compact && (
          <span className="truncate max-w-[90px] hidden sm:inline text-xs font-semibold">
            {activeThemeConfig.name.split(' ').slice(0, 2).join(' ')}
          </span>
        )}
        <Palette
          className="w-3.5 h-3.5 shrink-0"
          style={{ color: 'var(--text-muted)' }}
        />
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            role="listbox"
            aria-label="Select color theme"
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute right-0 mt-2 w-60 rounded-2xl border z-50 p-1.5 overflow-hidden"
            style={{
              backgroundColor: 'var(--surface)',
              borderColor: 'var(--border)',
              boxShadow: 'var(--shadow-xl)',
            }}
          >
            {/* Header */}
            <div
              className="flex items-center gap-2 px-3 py-2 mb-1 border-b"
              style={{ borderColor: 'var(--border)' }}
            >
              <Palette className="w-3.5 h-3.5" style={{ color: 'var(--primary)' }} />
              <span className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>
                Color Theme
              </span>
            </div>

            {/* Theme Options */}
            {THEME_CONFIGS.map((t) => (
              <button
                key={t.id}
                role="option"
                aria-selected={theme === t.id}
                type="button"
                onClick={() => {
                  setTheme(t.id);
                  setIsOpen(false);
                }}
                className="w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-all cursor-pointer group"
                style={
                  theme === t.id
                    ? {
                        backgroundColor: 'var(--primary-light)',
                        color: 'var(--primary)',
                      }
                    : {
                        color: 'var(--text-secondary)',
                      }
                }
                onMouseEnter={(e) => {
                  if (theme !== t.id) {
                    e.currentTarget.style.backgroundColor = 'var(--surface-subtle)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (theme !== t.id) {
                    e.currentTarget.style.backgroundColor = '';
                  }
                }}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span
                    className={`w-4 h-4 rounded-full shrink-0 ${t.previewBg} ring-2 ring-slate-300 dark:ring-slate-700`}
                  />
                  <div className="min-w-0">
                    <p className="text-xs font-semibold truncate">{t.name}</p>
                    <p
                      className="text-[10px] truncate mt-0.5"
                      style={{ color: theme === t.id ? 'var(--primary)' : 'var(--text-muted)' }}
                    >
                      {t.badge}
                    </p>
                  </div>
                </div>
                {theme === t.id && (
                  <Check className="w-3.5 h-3.5 shrink-0 ml-2" style={{ color: 'var(--primary)' }} />
                )}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
