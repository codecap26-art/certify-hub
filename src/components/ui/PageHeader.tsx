'use client';

import React from 'react';
import { Breadcrumbs, BreadcrumbItem } from './Breadcrumbs';
import { motion } from 'framer-motion';

interface Props {
  title: string;
  description?: string;
  breadcrumbs?: BreadcrumbItem[];
  icon?: React.ComponentType<{ className?: string }>;
  action?: React.ReactNode;
}

export const PageHeader: React.FC<Props> = ({
  title,
  description,
  breadcrumbs,
  icon: Icon,
  action,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className="relative overflow-hidden rounded-2xl border p-6 mb-6"
      style={{
        backgroundColor: 'var(--surface)',
        borderColor: 'var(--border)',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      {/* Left accent bar */}
      <div
        className="absolute left-0 top-4 bottom-4 w-1 rounded-r-full"
        style={{ backgroundColor: 'var(--primary)' }}
      />

      <div className="pl-4">
        {breadcrumbs && <Breadcrumbs items={breadcrumbs} />}

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-1">
          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-2.5">
              {Icon && (
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                  style={{
                    backgroundColor: 'var(--primary-light)',
                    color: 'var(--primary)',
                  }}
                >
                  <Icon className="w-5 h-5" />
                </div>
              )}
              <h1
                className="text-xl font-extrabold tracking-tight truncate"
                style={{ color: 'var(--text-primary)' }}
              >
                {title}
              </h1>
            </div>
            {description && (
              <p
                className="text-xs leading-relaxed max-w-2xl"
                style={{ color: 'var(--text-muted)' }}
              >
                {description}
              </p>
            )}
          </div>

          {action && <div className="shrink-0">{action}</div>}
        </div>
      </div>
    </motion.div>
  );
};
