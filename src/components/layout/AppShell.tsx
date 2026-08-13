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
      <div className="min-h-screen bg-slate-100 text-slate-900 font-sans antialiased">
        {isClientLoaded ? children : <div className="animate-pulse h-screen bg-white" />}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col antialiased selection:bg-blue-100 selection:text-blue-900">
      {/* Top Sticky Light Navbar */}
      <Navbar
        onToggleMobileMenu={() => setMobileMenuOpen(true)}
        onResetDemoData={() => setResetModalOpen(true)}
      />

      {/* Main Container */}
      <div className="flex-1 flex w-full">
        {!isStandalonePage && <Sidebar />}

        {/* Page Viewport */}
        <main className={`flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full ${isStandalonePage ? 'px-4' : ''}`}>
          {isClientLoaded ? children : <div className="animate-pulse h-96 bg-white border border-slate-200 rounded-2xl" />}
        </main>
      </div>

      {/* Mobile Navigation Drawer */}
      <MobileDrawer
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        onResetDemoData={() => setResetModalOpen(true)}
      />

      {/* Confirmation Modal for Reset Demo Data */}
      {resetModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-amber-600">
                <AlertTriangle className="w-5 h-5" />
                <h3 className="font-bold text-lg text-slate-900">Reset Demo Data</h3>
              </div>
              <button
                onClick={() => setResetModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
                aria-label="Close dialog"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to reset all stored browser data? This will clear your custom events,
              recipients, organization branding, and restore default demo records.
            </p>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setResetModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg border border-slate-200 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReset}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-lg transition shadow-sm"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Confirm Reset</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
