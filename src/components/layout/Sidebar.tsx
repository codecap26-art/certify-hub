'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Calendar,
  Users,
  Layers,
  Palette,
  Sparkles,
  FileCheck,
  ShieldCheck,
  LogOut,
  PlusCircle,
  ChevronLeft,
  ChevronRight,
  LucideIcon,
} from 'lucide-react';
import { sessionRepository } from '@/lib/storage/sessionRepository';

export interface NavItem {
  name: string;
  href: string;
  icon: LucideIcon;
}

export interface NavSection {
  title: string;
  items: NavItem[];
}

export const navigationSections: NavSection[] = [
  {
    title: 'OVERVIEW',
    items: [
      { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    ],
  },
  {
    title: 'MANAGEMENT',
    items: [
      { name: 'Events', href: '/events', icon: Calendar },
      { name: 'Recipients', href: '/recipients', icon: Users },
    ],
  },
  {
    title: 'DESIGN',
    items: [
      { name: 'Templates', href: '/templates', icon: Layers },
      { name: 'Certificate Studio', href: '/studio', icon: Palette },
    ],
  },
  {
    title: 'ISSUING',
    items: [
      { name: 'Generate Certificates', href: '/generate', icon: Sparkles },
      { name: 'Certificates History', href: '/certificates', icon: FileCheck },
      { name: 'Verification Lookup', href: '/verify', icon: ShieldCheck },
    ],
  },
];

export const navigationItems: NavItem[] = navigationSections.flatMap((s) => s.items);

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleLogout = () => {
    sessionRepository.logout();
    router.push('/login');
  };

  return (
    <aside
      className={`hidden lg:flex flex-col min-h-[calc(100vh-var(--navbar-height))] border-r justify-between transition-all duration-300 ${
        isCollapsed ? 'w-[72px]' : 'w-60'
      }`}
      style={{
        backgroundColor: 'var(--surface)',
        borderColor: 'var(--border)',
      }}
    >
      {/* ── Top: Nav sections ── */}
      <div className="flex flex-col gap-1 overflow-y-auto py-4 px-3">
        {/* Collapse Toggle */}
        <div className={`flex mb-2 ${isCollapsed ? 'justify-center' : 'justify-end'}`}>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5 rounded-lg border transition-all"
            style={{
              color: 'var(--text-muted)',
              backgroundColor: 'var(--surface-subtle)',
              borderColor: 'var(--border)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'var(--text-primary)';
              e.currentTarget.style.backgroundColor = 'var(--border)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'var(--text-muted)';
              e.currentTarget.style.backgroundColor = 'var(--surface-subtle)';
            }}
            title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            aria-label={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {isCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Quick Action CTA */}
        <div className="mb-3">
          <Link
            href="/generate"
            className={`flex items-center justify-center gap-2 text-white font-semibold py-2 rounded-xl transition-all duration-150 shadow-sm text-xs hover:brightness-110 active:scale-[0.98] ${
              isCollapsed ? 'px-2' : 'px-3'
            }`}
            style={{
              background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)',
              boxShadow: 'var(--shadow-sm)',
            }}
            title="Generate Certificate"
          >
            <PlusCircle className="w-4 h-4 shrink-0" />
            {!isCollapsed && <span>Generate Cert</span>}
          </Link>
        </div>

        {/* Navigation Sections */}
        <nav className="flex flex-col gap-4" aria-label="Sidebar Navigation">
          {navigationSections.map((section) => (
            <div key={section.title} className="flex flex-col gap-0.5">
              {!isCollapsed && (
                <p
                  className="px-2 text-[10px] font-bold uppercase tracking-widest mb-1"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {section.title}
                </p>
              )}

              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive =
                  pathname === item.href ||
                  (item.href !== '/dashboard' && pathname.startsWith(item.href));

                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center gap-2.5 px-2 py-2 rounded-xl text-xs font-semibold transition-all duration-150 hover:bg-slate-100/60 dark:hover:bg-slate-800/60 ${
                      isCollapsed ? 'justify-center' : ''
                    }`}
                    style={
                      isActive
                        ? {
                            backgroundColor: 'var(--primary-light)',
                            color: 'var(--primary)',
                            borderLeft: !isCollapsed ? `2px solid var(--primary)` : 'none',
                            paddingLeft: !isCollapsed ? '6px' : '',
                          }
                        : {
                            color: 'var(--text-secondary)',
                            borderLeft: '2px solid transparent',
                          }
                    }
                    title={isCollapsed ? item.name : undefined}
                    aria-label={item.name}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <Icon
                      className="w-4 h-4 shrink-0"
                      style={{ color: isActive ? 'var(--primary)' : 'var(--text-muted)' }}
                    />
                    {!isCollapsed && <span className="truncate">{item.name}</span>}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>
      </div>

      {/* ── Bottom: Local storage note + Logout ── */}
      <div className="px-3 py-4 border-t" style={{ borderColor: 'var(--border)' }}>
        {!isCollapsed && (
          <div
            className="rounded-xl p-3 border mb-3 space-y-0.5"
            style={{
              backgroundColor: 'var(--surface-subtle)',
              borderColor: 'var(--border)',
            }}
          >
            <p className="text-[11px] font-bold" style={{ color: 'var(--text-secondary)' }}>
              Local Storage Mode
            </p>
            <p className="text-[10px] leading-relaxed" style={{ color: 'var(--text-muted)' }}>
              Data saved in browser (`certifyhub:v1:`).
            </p>
          </div>
        )}

        <button
          onClick={handleLogout}
          className={`w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-semibold border transition-all ${
            isCollapsed ? 'px-2' : 'px-3'
          }`}
          style={{
            color: 'var(--error-text)',
            backgroundColor: 'var(--error-light)',
            borderColor: 'var(--error-border)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--error-border)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--error-light)';
          }}
          title="Exit Demo Session"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          {!isCollapsed && <span>Exit Demo</span>}
        </button>
      </div>
    </aside>
  );
};
