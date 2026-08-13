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
      className="bg-white border border-slate-200 p-10 rounded-2xl text-center space-y-4 shadow-xs my-4"
    >
      <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 text-slate-500 flex items-center justify-center mx-auto">
        <Icon className="w-6 h-6" />
      </div>

      <div className="space-y-1 max-w-sm mx-auto">
        <h3 className="text-base font-bold text-slate-900 tracking-tight">{title}</h3>
        <p className="text-xs text-slate-600 leading-relaxed">{description}</p>
      </div>

      {action && <div className="pt-2 flex justify-center">{action}</div>}
    </motion.div>
  );
};
