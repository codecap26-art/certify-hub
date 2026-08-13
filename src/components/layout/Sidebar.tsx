'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Building2,
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
      { name: 'Organization', href: '/organization', icon: Building2 },
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
      className={`hidden lg:flex flex-col bg-white border-r border-slate-200 text-slate-700 min-h-[calc(100vh-4rem)] p-4 justify-between transition-all duration-300 shadow-xs ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      <div className="space-y-6 overflow-y-auto">
        {/* Collapse Toggle Button */}
        <div className="flex items-center justify-end">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition cursor-pointer"
            title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            aria-label={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Quick Action Button */}
        <div>
          <Link
            href="/generate"
            className={`flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg shadow-sm transition text-xs ${
              isCollapsed ? 'px-2' : 'px-4'
            }`}
            title="Generate Certificate"
          >
            <PlusCircle className="w-4 h-4 shrink-0" />
            {!isCollapsed && <span>Generate Cert</span>}
          </Link>
        </div>

        {/* Sectioned Navigation Links */}
        <nav className="space-y-4" aria-label="Sidebar Navigation">
          {navigationSections.map((section) => (
            <div key={section.title} className="space-y-1">
              {!isCollapsed && (
                <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  {section.title}
                </p>
              )}
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive =
                  pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));

                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition ${
                      isActive
                        ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-xs font-bold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                    } ${isCollapsed ? 'justify-center' : ''}`}
                    title={isCollapsed ? item.name : undefined}
                    aria-label={item.name}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-blue-600' : 'text-slate-500'}`} />
                    {!isCollapsed && <span className="truncate">{item.name}</span>}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>
      </div>

      {/* Footer / Demo Logout */}
      <div className="border-t border-slate-200 pt-4 space-y-3">
        {!isCollapsed && (
          <div className="bg-slate-50 rounded-lg p-3 border border-slate-200 text-xs">
            <p className="font-bold text-slate-800">Local Storage Mode</p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Data is saved in browser (`certifyhub:v1:`).
            </p>
          </div>
        )}

        <button
          onClick={handleLogout}
          className={`w-full flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200 transition ${
            isCollapsed ? 'px-2' : 'px-3'
          }`}
          title="Exit Demo Session"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          {!isCollapsed && <span>Exit Demo</span>}
        </button>
      </div>
    </aside>
  );
};
