'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface Props {
  items: BreadcrumbItem[];
}

export const Breadcrumbs: React.FC<Props> = ({ items }) => {
  return (
    <nav aria-label="Breadcrumb" className="flex items-center text-xs text-slate-500 space-x-1.5 mb-2">
      <Link href="/dashboard" className="hover:text-slate-900 transition flex items-center gap-1">
        <Home className="w-3.5 h-3.5" />
        <span className="sr-only">Dashboard Home</span>
      </Link>
      {items.map((item, index) => (
        <React.Fragment key={index}>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          {item.href ? (
            <Link href={item.href} className="hover:text-blue-600 transition">
              {item.label}
            </Link>
          ) : (
            <span className="font-semibold text-slate-800" aria-current="page">
              {item.label}
            </span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};
