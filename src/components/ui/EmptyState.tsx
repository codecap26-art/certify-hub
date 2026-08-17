'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface Props {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export const EmptyState: React.FC<Props> = ({ icon: Icon, title, description, action }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className="flex flex-col items-center justify-center text-center p-12 my-2"
    >
      {/* Icon */}
      <div
        className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 border"
        style={{
          backgroundColor: 'var(--surface-subtle)',
          borderColor: 'var(--border)',
          color: 'var(--text-muted)',
        }}
      >
        <Icon className="w-7 h-7" />
      </div>

      {/* Text */}
      <div className="space-y-1.5 max-w-xs">
        <h3
          className="text-sm font-bold tracking-tight"
          style={{ color: 'var(--text-primary)' }}
        >
          {title}
        </h3>
        <p
          className="text-xs leading-relaxed"
          style={{ color: 'var(--text-muted)' }}
        >
          {description}
        </p>
      </div>

      {/* Optional CTA */}
      {action && <div className="mt-5">{action}</div>}
    </motion.div>
  );
};
