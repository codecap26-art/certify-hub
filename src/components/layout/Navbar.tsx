'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Award, Menu, ShieldCheck, RefreshCw, UserCheck } from 'lucide-react';
import { APP_NAME } from '@/lib/constants';
import { sessionRepository } from '@/lib/storage/sessionRepository';

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
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-slate-200 text-slate-800 transition-all shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Left Brand */}
        <div className="flex items-center gap-3">
          {!isPublicPage && (
            <button
              onClick={onToggleMobileMenu}
              className="lg:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              aria-label="Open Mobile Navigation Menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-sm group-hover:bg-blue-700 transition">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-lg tracking-tight text-slate-900">{APP_NAME}</span>
              <span className="hidden sm:inline-block ml-2 text-[10px] uppercase font-bold tracking-widest text-teal-700 px-2 py-0.5 bg-teal-50 border border-teal-200 rounded-full">
                Frontend Prototype
              </span>
            </div>
          </Link>
        </div>

        {/* Public Navigation Links */}
        {isPublicPage && (
          <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-600" aria-label="Public Navigation">
            <Link href="/#features" className="hover:text-blue-600 transition">
              Features
            </Link>
            <Link href="/templates" className="hover:text-blue-600 transition">
              Templates Showcase
            </Link>
            <Link href="/#how-it-works" className="hover:text-blue-600 transition">
              How It Works
            </Link>
            <Link href="/verify" className="hover:text-blue-600 transition flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
              <span>Verify Certificate</span>
            </Link>
          </nav>
        )}

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {!isPublicPage && (
            <button
              onClick={onResetDemoData}
              className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-amber-700 hover:bg-amber-100 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-lg transition"
              title="Reset all browser storage data to initial demo state"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset Data</span>
            </button>
          )}

          {isLoggedIn && session ? (
            <div className="flex items-center gap-2 bg-slate-100 border border-slate-200 text-slate-700 text-xs px-3 py-1.5 rounded-lg">
              <UserCheck className="w-4 h-4 text-blue-600 shrink-0" />
              <span className="hidden md:inline font-mono truncate max-w-[140px]">{session.email}</span>
            </div>
          ) : (
            <Link
              href="/login"
              className="text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition shadow-xs"
            >
              Admin Demo Login
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};
