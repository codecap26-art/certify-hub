import React from 'react';
import Link from 'next/link';
import { Award, ArrowLeft, Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center text-center p-4">
      <div
        className="max-w-sm w-full rounded-2xl border p-10 space-y-6"
        style={{
          backgroundColor: 'var(--surface)',
          borderColor: 'var(--border)',
          boxShadow: 'var(--shadow-xl)',
        }}
      >
        {/* Icon */}
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto border"
          style={{
            backgroundColor: 'var(--primary-light)',
            borderColor: 'var(--primary-border)',
            color: 'var(--primary)',
          }}
        >
          <Award className="w-8 h-8" />
        </div>

        {/* Text */}
        <div className="space-y-2">
          <p
            className="text-xs font-bold uppercase tracking-widest"
            style={{ color: 'var(--text-muted)' }}
          >
            Error 404
          </p>
          <h1 className="text-2xl font-extrabold tracking-tight" style={{ color: 'var(--text-primary)' }}>
            Page Not Found
          </h1>
          <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
            The page or certificate route you requested could not be located on CertifyHub.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2.5">
          <Link
            href="/"
            className="flex items-center justify-center gap-2 font-bold py-2.5 px-5 rounded-xl text-sm text-white transition-all hover:brightness-105 active:scale-[0.98]"
            style={{ backgroundColor: 'var(--primary)', boxShadow: 'var(--shadow-sm)' }}
          >
            <Home className="w-4 h-4" />
            <span>Return to Homepage</span>
          </Link>
          <Link
            href="/dashboard"
            className="flex items-center justify-center gap-2 font-semibold py-2.5 px-5 rounded-xl text-sm border transition-all hover:bg-slate-100 dark:hover:bg-slate-800"
            style={{
              color: 'var(--text-secondary)',
              backgroundColor: 'var(--surface-subtle)',
              borderColor: 'var(--border)',
            }}
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Go to Dashboard</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
