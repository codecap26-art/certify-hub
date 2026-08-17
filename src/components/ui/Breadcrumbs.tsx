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
    <nav aria-label="Breadcrumb" className="flex items-center flex-wrap gap-1 mb-2.5 text-xs">
      <Link
        href="/dashboard"
        className="flex items-center gap-1 transition-colors hover:text-blue-600"
        style={{ color: 'var(--text-muted)' }}
      >
        <Home className="w-3.5 h-3.5" />
        <span className="sr-only">Dashboard</span>
      </Link>

      {items.map((item, index) => (
        <React.Fragment key={index}>
          <ChevronRight className="w-3 h-3 shrink-0" style={{ color: 'var(--border-strong)' }} />
          {item.href ? (
            <Link
              href={item.href}
              className="font-medium transition-colors hover:text-blue-600"
              style={{ color: 'var(--text-muted)' }}
            >
              {item.label}
            </Link>
          ) : (
            <span
              className="font-semibold"
              style={{ color: 'var(--text-secondary)' }}
              aria-current="page"
            >
              {item.label}
            </span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};
