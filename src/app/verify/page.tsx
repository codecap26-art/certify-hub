'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Search, Award, AlertCircle } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { motion } from 'framer-motion';

export default function VerifyLookupPage() {
  const router = useRouter();
  const [tokenInput, setTokenInput] = useState('');
  const [error, setError] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tokenInput.trim()) {
      setError('Please enter a Certificate Code or Verification Token.');
      return;
    }
    setError('');
    router.push(`/verify/${encodeURIComponent(tokenInput.trim())}`);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 py-4">
      <PageHeader
        title="Credential Authenticity Verification"
        description="Verify official certificates issued by accredited educational institutions and training partners."
        icon={ShieldCheck}
      />

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="p-8 rounded-2xl space-y-6 border shadow-xs"
        style={{
          backgroundColor: 'var(--surface)',
          borderColor: 'var(--border)',
        }}
      >
        <div className="space-y-2 text-center">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto border"
            style={{
              backgroundColor: 'var(--primary-light)',
              borderColor: 'var(--primary-border)',
              color: 'var(--primary)',
            }}
          >
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>Lookup Certificate Authenticity</h2>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            Enter the Certificate Code (e.g. <span className="font-mono font-bold" style={{ color: 'var(--primary)' }}>ABC-REACT-2026-0001</span>) or scan the QR verification token.
          </p>
        </div>

        <form onSubmit={handleSearch} className="space-y-4">
          <div>
            <label htmlFor="token-input" className="block text-xs font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>
              Certificate Code or Verification Token ID *
            </label>
            <div className="relative">
              <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--text-muted)' }} />
              <input
                id="token-input"
                type="text"
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value)}
                placeholder="e.g. ABC-REACT-2026-0001 or 550e8400-e29b-41d4-a716-446655440000"
                className="w-full rounded-xl pl-12 pr-4 py-3.5 text-sm focus:outline-none font-mono border transition"
                style={{
                  backgroundColor: 'var(--surface-subtle)',
                  borderColor: 'var(--border)',
                  color: 'var(--text-primary)',
                }}
              />
            </div>
            {error && <p className="text-xs text-rose-500 mt-2 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5"/><span>{error}</span></p>}
          </div>

          <button
            type="submit"
            className="w-full text-white font-bold py-3.5 rounded-xl shadow-xs transition text-sm flex items-center justify-center gap-2"
            style={{ backgroundColor: 'var(--primary)' }}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Verify Credential Authenticity</span>
          </button>
        </form>
      </motion.div>

      {/* Verification Instructions */}
      <div
        className="p-6 rounded-2xl space-y-3 text-xs border shadow-xs"
        style={{
          backgroundColor: 'var(--surface)',
          borderColor: 'var(--border)',
          color: 'var(--text-muted)',
        }}
      >
        <h3 className="font-bold text-sm flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
          <Award className="w-4 h-4" style={{ color: 'var(--primary)' }} />
          <span>How Verification Works</span>
        </h3>
        <p className="leading-relaxed">
          CertifyHub embeds cryptographic verification tokens into issued PDF certificates and vector QR codes. Anyone can scan or query the token to view authenticated details frozen at the time of issuance.
        </p>
      </div>
    </div>
  );
}
