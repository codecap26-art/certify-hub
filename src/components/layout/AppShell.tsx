'use client';

import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { MobileDrawer } from './MobileDrawer';
import { resetDemoData, seedDemoDataIfNeeded } from '@/lib/demo-data';
import { RefreshCw, AlertTriangle, X } from 'lucide-react';

interface Props {
  children: React.ReactNode;
}

export const AppShell: React.FC<Props> = ({ children }) => {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [isClientLoaded, setIsClientLoaded] = useState(false);

  useEffect(() => {
    seedDemoDataIfNeeded();
    const timer = setTimeout(() => setIsClientLoaded(true), 0);
    return () => clearTimeout(timer);
  }, []);

  const handleConfirmReset = () => {
    resetDemoData();
    setResetModalOpen(false);
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  const isEditorPage = pathname.startsWith('/studio/editor');
  const isStandalonePage = pathname === '/' || pathname === '/login' || pathname.startsWith('/verify');

  if (isEditorPage) {
    return (
      <div className="min-h-screen font-sans antialiased" style={{ backgroundColor: '#F1F5F9', color: '#0F172A' }}>
        {isClientLoaded ? children : (
          <div
            className="animate-pulse h-screen"
            style={{ backgroundColor: 'var(--surface)' }}
          />
        )}
      </div>
    );
  }

  return (
    <div
      className="min-h-screen font-sans flex flex-col antialiased"
      style={{
        backgroundColor: 'var(--background)',
        color: 'var(--text-primary)',
      }}
    >
      {/* Sticky Navbar */}
      <Navbar
        onToggleMobileMenu={() => setMobileMenuOpen(true)}
        onResetDemoData={() => setResetModalOpen(true)}
      />

      {/* Main Layout */}
      <div className="flex-1 flex w-full">
        {!isStandalonePage && <Sidebar />}

        {/* Page Content */}
        <main
          className={`flex-1 p-4 sm:p-6 lg:p-8 min-w-0 ${isStandalonePage ? 'max-w-7xl mx-auto w-full' : ''}`}
        >
          {isClientLoaded ? (
            children
          ) : (
            <div
              className="animate-pulse h-96 rounded-2xl border"
              style={{
                backgroundColor: 'var(--surface)',
                borderColor: 'var(--border)',
              }}
            />
          )}
        </main>
      </div>

      {/* Mobile Navigation Drawer */}
      <MobileDrawer
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        onResetDemoData={() => setResetModalOpen(true)}
      />

      {/* Reset Demo Data Confirmation Modal */}
      {resetModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
          style={{ backgroundColor: 'rgba(15, 23, 42, 0.5)', backdropFilter: 'blur(4px)' }}
        >
          <div
            className="max-w-md w-full p-6 rounded-2xl border space-y-4"
            style={{
              backgroundColor: 'var(--surface)',
              borderColor: 'var(--border)',
              boxShadow: 'var(--shadow-xl)',
            }}
          >
            {/* Modal Header */}
            <div
              className="flex items-center justify-between pb-4 border-b"
              style={{ borderColor: 'var(--border)' }}
            >
              <div className="flex items-center gap-2.5">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{
                    backgroundColor: 'var(--warning-light)',
                    color: 'var(--warning)',
                  }}
                >
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-base" style={{ color: 'var(--text-primary)' }}>
                  Clear All Data
                </h3>
              </div>
              <button
                onClick={() => setResetModalOpen(false)}
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
                aria-label="Close dialog"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              Are you sure you want to clear all stored browser data? This will remove all custom
              events, recipients, campaigns, deliveries, and certificates, giving you a fresh workspace.
            </p>

            {/* Modal Footer */}
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setResetModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold rounded-xl border transition-all"
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
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReset}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white rounded-xl transition-all"
                style={{
                  backgroundColor: 'var(--danger, #EF4444)',
                  boxShadow: 'var(--shadow-sm)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.filter = 'brightness(0.9)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.filter = '';
                }}
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Confirm Clear</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
