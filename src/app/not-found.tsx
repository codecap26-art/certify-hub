import React from 'react';
import Link from 'next/link';
import { Award, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center text-center p-4">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 p-8 rounded-3xl space-y-6 shadow-2xl">
        <div className="w-16 h-16 rounded-2xl bg-blue-600/10 border border-blue-500/30 text-blue-400 flex items-center justify-center mx-auto">
          <Award className="w-10 h-10" />
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-black text-white">404 - Page Not Found</h1>
          <p className="text-xs text-slate-400">
            The page or certificate route you requested could not be located on CertifyHub.
          </p>
        </div>

        <Link
          href="/"
          className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-6 rounded-xl shadow-lg transition text-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Homepage</span>
        </Link>
      </div>
    </div>
  );
}
