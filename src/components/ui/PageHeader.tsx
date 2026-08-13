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
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className="bg-white border border-slate-200 p-6 rounded-2xl shadow-xs space-y-2 mb-6"
    >
      {breadcrumbs && <Breadcrumbs items={breadcrumbs} />}

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            {Icon && <Icon className="w-6 h-6 text-blue-600 shrink-0" />}
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">{title}</h1>
          </div>
          {description && <p className="text-xs text-slate-600 max-w-2xl">{description}</p>}
        </div>

        {action && <div className="shrink-0">{action}</div>}
      </div>
    </motion.div>
  );
};
