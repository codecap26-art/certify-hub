'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { X, Award, LogOut, RefreshCw } from 'lucide-react';
import { navigationSections } from './Sidebar';
import { sessionRepository } from '@/lib/storage/sessionRepository';
import { APP_NAME } from '@/lib/constants';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onResetDemoData: () => void;
}

export const MobileDrawer: React.FC<Props> = ({ isOpen, onClose, onResetDemoData }) => {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    sessionRepository.logout();
    onClose();
    router.push('/login');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 backdrop-blur-xs"
            style={{ backgroundColor: 'rgba(15, 23, 42, 0.45)' }}
            onClick={onClose}
          />

          {/* Drawer Panel */}
          <motion.div
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            className="relative flex flex-col max-w-[280px] w-full z-10 border-r shadow-xl overflow-y-auto"
            style={{
              backgroundColor: 'var(--surface)',
              borderColor: 'var(--border)',
            }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-4 py-4 border-b"
              style={{ borderColor: 'var(--border)' }}
            >
              <div className="flex items-center gap-2.5">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-white"
                  style={{
                    background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)',
                  }}
                >
                  <Award className="w-4.5 h-4.5" />
                </div>
                <span className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>
                  {APP_NAME}
                </span>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg transition-colors"
                style={{ color: 'var(--text-muted)' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--surface-subtle)';
                  e.currentTarget.style.color = 'var(--text-primary)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '';
                  e.currentTarget.style.color = 'var(--text-muted)';
                }}
                aria-label="Close Navigation"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Navigation Links */}
            <nav className="flex-1 px-3 py-4 flex flex-col gap-4" aria-label="Mobile Navigation">
              {navigationSections.map((section) => (
                <div key={section.title} className="flex flex-col gap-0.5">
                  <p
                    className="px-2 text-[10px] font-bold uppercase tracking-widest mb-1"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    {section.title}
                  </p>

                  {section.items.map((item) => {
                    const Icon = item.icon;
                    const isActive =
                      pathname === item.href ||
                      (item.href !== '/dashboard' && pathname.startsWith(item.href));

                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        onClick={onClose}
                        className="flex items-center gap-2.5 px-2 py-2 rounded-xl text-xs font-semibold transition-all"
                        style={
                          isActive
                            ? {
                                backgroundColor: 'var(--primary-light)',
                                color: 'var(--primary)',
                                borderLeft: '2px solid var(--primary)',
                                paddingLeft: '6px',
                              }
                            : {
                                color: 'var(--text-secondary)',
                                borderLeft: '2px solid transparent',
                              }
                        }
                        onMouseEnter={(e) => {
                          if (!isActive) {
                            e.currentTarget.style.backgroundColor = 'var(--surface-subtle)';
                            e.currentTarget.style.color = 'var(--text-primary)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isActive) {
                            e.currentTarget.style.backgroundColor = '';
                            e.currentTarget.style.color = 'var(--text-secondary)';
                          }
                        }}
                        aria-current={isActive ? 'page' : undefined}
                      >
                        <Icon
                          className="w-4 h-4 shrink-0"
                          style={{ color: isActive ? 'var(--primary)' : 'var(--text-muted)' }}
                        />
                        <span>{item.name}</span>
                      </Link>
                    );
                  })}
                </div>
              ))}
            </nav>

            {/* Footer Actions */}
            <div className="px-3 py-4 border-t flex flex-col gap-2" style={{ borderColor: 'var(--border)' }}>
              <button
                onClick={() => {
                  onResetDemoData();
                  onClose();
                }}
                className="w-full flex items-center justify-center gap-2 text-xs font-semibold py-2 rounded-xl border transition-all"
                style={{
                  color: 'var(--warning-text)',
                  backgroundColor: 'var(--warning-light)',
                  borderColor: 'var(--warning-border)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--warning-border)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--warning-light)';
                }}
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reset Demo Data</span>
              </button>

              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 text-xs font-semibold py-2 rounded-xl border transition-all"
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
              >
                <LogOut className="w-4 h-4" />
                <span>Exit Demo Session</span>
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
