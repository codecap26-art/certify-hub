'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { X, Award, LogOut } from 'lucide-react';
import { navigationSections } from './Sidebar';
import { sessionRepository } from '@/lib/storage/sessionRepository';
import { APP_NAME } from '@/lib/constants';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onResetDemoData: () => void;
}

export const MobileDrawer: React.FC<Props> = ({ isOpen, onClose, onResetDemoData }) => {
  const pathname = usePathname();
  const router = useRouter();

  if (!isOpen) return null;

  const handleLogout = () => {
    sessionRepository.logout();
    onClose();
    router.push('/login');
  };

  return (
    <div className="fixed inset-0 z-50 lg:hidden flex">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs" onClick={onClose} />

      {/* Drawer */}
      <div className="relative flex-1 max-w-xs w-full bg-white text-slate-800 flex flex-col justify-between p-4 z-10 border-r border-slate-200 shadow-xl overflow-y-auto">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold">
                <Award className="w-5 h-5" />
              </div>
              <span className="font-bold text-lg text-slate-900">{APP_NAME}</span>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              aria-label="Close Navigation"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Navigation Links grouped by Section */}
          <nav className="space-y-4">
            {navigationSections.map((section) => (
              <div key={section.title} className="space-y-1">
                <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  {section.title}
                </p>
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive =
                    pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));

                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={onClose}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition ${
                        isActive
                          ? 'bg-blue-50 text-blue-700 border border-blue-200 font-bold'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                      }`}
                    >
                      <Icon className="w-4 h-4 text-slate-500 shrink-0" />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </div>
            ))}
          </nav>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-200 pt-4 space-y-2">
          <button
            onClick={() => {
              onResetDemoData();
              onClose();
            }}
            className="w-full text-xs font-semibold text-amber-700 hover:bg-amber-100 bg-amber-50 border border-amber-200 py-2 rounded-lg"
          >
            Reset Demo Data
          </button>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200 py-2 rounded-lg"
          >
            <LogOut className="w-4 h-4" />
            <span>Exit Demo Session</span>
          </button>
        </div>
      </div>
    </div>
  );
};
