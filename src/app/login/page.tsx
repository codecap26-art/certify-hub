'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Award, Lock, Mail, ArrowRight, ShieldCheck, Info } from 'lucide-react';
import { sessionRepository } from '@/lib/storage/sessionRepository';
import { APP_NAME } from '@/lib/constants';
import { motion } from 'framer-motion';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('admin@abccollege.edu');
  const [password, setPassword] = useState('demo123');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    sessionRepository.login(email.trim() || 'admin@abccollege.edu');
    router.push('/dashboard');
  };

  const handleQuickDemo = () => {
    sessionRepository.login('admin@abccollege.edu');
    router.push('/dashboard');
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-5rem)] py-12 px-4">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.28, ease: 'easeOut' }}
        className="w-full max-w-md"
      >
        {/* Card */}
        <div
          className="rounded-2xl border p-8 space-y-7"
          style={{
            backgroundColor: 'var(--surface)',
            borderColor: 'var(--border)',
            boxShadow: 'var(--shadow-xl)',
          }}
        >
          {/* Header */}
          <div className="text-center space-y-3">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center text-white mx-auto"
              style={{
                background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)',
                boxShadow: 'var(--shadow-primary)',
              }}
            >
              <Award className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h1 className="text-xl font-extrabold tracking-tight" style={{ color: 'var(--text-primary)' }}>
                {APP_NAME}
              </h1>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                Admin Demo Portal · Certificate Management
              </p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email */}
            <div className="space-y-1.5">
              <label
                htmlFor="login-email"
                className="block text-xs font-semibold"
                style={{ color: 'var(--text-secondary)' }}
              >
                Email Address
              </label>
              <div className="relative">
                <Mail
                  className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                  style={{ color: 'var(--text-muted)' }}
                />
                <input
                  id="login-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm transition-all"
                  style={{
                    backgroundColor: 'var(--surface-subtle)',
                    borderColor: 'var(--border)',
                    color: 'var(--text-primary)',
                    outline: 'none',
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = 'var(--primary)';
                    e.currentTarget.style.boxShadow = 'var(--shadow-focus)';
                    e.currentTarget.style.backgroundColor = 'var(--surface)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border)';
                    e.currentTarget.style.boxShadow = '';
                    e.currentTarget.style.backgroundColor = 'var(--surface-subtle)';
                  }}
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label
                htmlFor="login-pass"
                className="block text-xs font-semibold"
                style={{ color: 'var(--text-secondary)' }}
              >
                Password
              </label>
              <div className="relative">
                <Lock
                  className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                  style={{ color: 'var(--text-muted)' }}
                />
                <input
                  id="login-pass"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm transition-all"
                  style={{
                    backgroundColor: 'var(--surface-subtle)',
                    borderColor: 'var(--border)',
                    color: 'var(--text-primary)',
                    outline: 'none',
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = 'var(--primary)';
                    e.currentTarget.style.boxShadow = 'var(--shadow-focus)';
                    e.currentTarget.style.backgroundColor = 'var(--surface)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border)';
                    e.currentTarget.style.boxShadow = '';
                    e.currentTarget.style.backgroundColor = 'var(--surface-subtle)';
                  }}
                />
              </div>
            </div>

            {/* Primary CTA */}
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold text-white transition-all"
              style={{
                backgroundColor: 'var(--primary)',
                boxShadow: 'var(--shadow-sm)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--primary-hover)';
                e.currentTarget.style.boxShadow = 'var(--shadow-primary)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--primary)';
                e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
              }}
            >
              <span>Sign In to Admin Portal</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px" style={{ backgroundColor: 'var(--border)' }} />
            <span className="text-[11px] font-medium" style={{ color: 'var(--text-muted)' }}>
              or
            </span>
            <div className="flex-1 h-px" style={{ backgroundColor: 'var(--border)' }} />
          </div>

          {/* Quick Demo */}
          <button
            onClick={handleQuickDemo}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border text-xs font-semibold transition-all"
            style={{
              backgroundColor: 'var(--surface-subtle)',
              borderColor: 'var(--border)',
              color: 'var(--text-secondary)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--success-light)';
              e.currentTarget.style.borderColor = 'var(--success-border)';
              e.currentTarget.style.color = 'var(--success-text)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--surface-subtle)';
              e.currentTarget.style.borderColor = 'var(--border)';
              e.currentTarget.style.color = 'var(--text-secondary)';
            }}
          >
            <ShieldCheck className="w-4 h-4" style={{ color: 'var(--success)' }} />
            <span>Continue with Demo Account</span>
          </button>

          {/* Info note */}
          <div
            className="flex items-start gap-2.5 rounded-xl p-3 border text-[11px] leading-relaxed"
            style={{
              backgroundColor: 'var(--info-light)',
              borderColor: 'var(--info-border)',
              color: 'var(--info-text)',
            }}
          >
            <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
            <span>
              Demo authentication uses browser localStorage. No real password check or backend connection required.
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
