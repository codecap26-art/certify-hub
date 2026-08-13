'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Award, Lock, Mail, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';
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
    <div className="max-w-md mx-auto py-12 space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="bg-white border border-slate-200 p-8 rounded-2xl space-y-6 shadow-xl"
      >
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center mx-auto shadow-sm">
            <Award className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">{APP_NAME} Admin Login</h1>
          <p className="text-xs text-slate-600">
            Simulated Admin Demo Portal for Certificate Management
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1" htmlFor="login-email">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="login-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-lg pl-10 pr-4 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1" htmlFor="login-pass">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="login-pass"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-lg pl-10 pr-4 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg shadow-xs transition text-sm flex items-center justify-center gap-2"
          >
            <span>Sign In to Admin Portal</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="relative border-t border-slate-100 pt-4 text-center">
          <button
            onClick={handleQuickDemo}
            className="w-full bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold py-2.5 rounded-lg border border-slate-200 transition text-xs flex items-center justify-center gap-2"
          >
            <ShieldCheck className="w-4 h-4 text-teal-600" />
            <span>Continue with Demo Account</span>
          </button>
        </div>

        <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-[11px] text-slate-600 flex items-start gap-2">
          <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
          <span>Demo authentication uses browser `localStorage`. No real password check or backend connection is required.</span>
        </div>
      </motion.div>
    </div>
  );
}
