'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Award, Menu, ShieldCheck, RefreshCw, UserCheck } from 'lucide-react';
import { APP_NAME } from '@/lib/constants';
import { sessionRepository } from '@/lib/storage/sessionRepository';

import { ThemeSwitcher } from '@/components/ui/ThemeSwitcher';

interface Props {
  onToggleMobileMenu: () => void;
  onResetDemoData: () => void;
}

export const Navbar: React.FC<Props> = ({ onToggleMobileMenu, onResetDemoData }) => {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [session, setSession] = useState<{ isLoggedIn: boolean; email: string } | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true);
      setSession(sessionRepository.get());
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const isPublicPage = pathname === '/' || pathname === '/login' || pathname.startsWith('/verify');
  const isLoggedIn = mounted && session?.isLoggedIn;

  return (
    <header
      className="sticky top-0 z-40 w-full backdrop-blur-md border-b transition-all"
      style={{
        backgroundColor: 'color-mix(in srgb, var(--surface) 96%, transparent)',
        borderColor: 'var(--border)',
        height: 'var(--navbar-height)',
      }}
    >
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between gap-4">
        {/* ── Left: Brand + Mobile Menu Toggle ── */}
        <div className="flex items-center gap-2 min-w-0">
          {!isPublicPage && (
            <button
              onClick={onToggleMobileMenu}
              className="lg:hidden p-2 rounded-lg transition-colors"
              style={{ color: 'var(--text-muted)' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--surface-subtle)';
                e.currentTarget.style.color = 'var(--text-primary)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '';
                e.currentTarget.style.color = 'var(--text-muted)';
              }}
              aria-label="Open Mobile Navigation Menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          <Link href="/" className="flex items-center gap-2.5 group shrink-0">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white shadow-sm transition-all group-hover:scale-105"
              style={{
                background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <Award className="w-4 h-4" />
            </div>
            <div className="flex items-center gap-2">
              <span
                className="font-bold text-base tracking-tight hidden sm:block"
                style={{ color: 'var(--text-primary)' }}
              >
                {APP_NAME}
              </span>
              <span
                className="hidden lg:inline-flex items-center text-[10px] font-bold tracking-widest uppercase px-2 py-0.5 rounded-full border"
                style={{
                  color: 'var(--secondary)',
                  backgroundColor: 'var(--secondary-light)',
                  borderColor: 'var(--info-border)',
                }}
              >
                Preview
              </span>
            </div>
          </Link>
        </div>

        {/* ── Center: Public Navigation Links ── */}
        {isPublicPage && (
          <nav
            className="hidden md:flex items-center gap-1"
            aria-label="Public Navigation"
          >
            {[
              { href: '/#features', label: 'Features' },
              { href: '/templates', label: 'Templates' },
              { href: '/#how-it-works', label: 'How It Works' },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30"
                style={{ color: 'var(--text-secondary)' }}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/verify"
              className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
              style={{ color: 'var(--success)' }}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Verify</span>
            </Link>
          </nav>
        )}

        {/* ── Right: Actions ── */}
        <div className="flex items-center gap-2 shrink-0">
          <ThemeSwitcher />

          {!isPublicPage && (
            <button
              onClick={onResetDemoData}
              className="hidden sm:flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors"
              style={{
                color: 'var(--text-secondary)',
                backgroundColor: 'var(--surface-subtle)',
                borderColor: 'var(--border)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--border)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--surface-subtle)';
              }}
              title="Clear all stored data and reset workspace"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Clear Data</span>
            </button>
          )}

          {isLoggedIn && session ? (
            <div
              className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-lg border font-medium"
              style={{
                color: 'var(--text-secondary)',
                backgroundColor: 'var(--surface-subtle)',
                borderColor: 'var(--border)',
              }}
            >
              <UserCheck className="w-3.5 h-3.5 shrink-0" style={{ color: 'var(--primary)' }} />
              <span className="hidden md:inline font-mono truncate max-w-[130px]">
                {session.email}
              </span>
            </div>
          ) : (
            <Link
              href="/login"
              className="text-xs font-semibold text-white px-4 py-1.5 rounded-lg transition-all shadow-sm hover:brightness-105 active:scale-[0.98]"
              style={{
                backgroundColor: 'var(--primary)',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              Admin Login
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};
