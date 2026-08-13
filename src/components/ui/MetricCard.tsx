'use client';

import React, { useEffect, useState } from 'react';
import { motion, useInView } from 'framer-motion';

interface Props {
  label: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  trend?: string;
  color?: 'blue' | 'teal' | 'indigo' | 'emerald' | 'rose' | 'amber';
}

export const MetricCard: React.FC<Props> = ({
  label,
  value,
  icon: Icon,
  trend,
  color = 'blue',
}) => {
  const [displayValue, setDisplayValue] = useState(0);
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;
    if (value === 0) {
      const t = setTimeout(() => setDisplayValue(0), 0);
      return () => clearTimeout(t);
    }

    let start = 0;
    const end = value;
    const duration = 800; // ms
    const increment = Math.ceil(end / (duration / 16));

    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setDisplayValue(end);
        clearInterval(timer);
      } else {
        setDisplayValue(start);
      }
    }, 16);

    return () => clearInterval(timer);
  }, [isInView, value]);

  const colorStyles = {
    blue: 'bg-blue-50 border-blue-200 text-blue-700',
    teal: 'bg-teal-50 border-teal-200 text-teal-700',
    indigo: 'bg-indigo-50 border-indigo-200 text-indigo-700',
    emerald: 'bg-emerald-50 border-emerald-200 text-emerald-700',
    rose: 'bg-rose-50 border-rose-200 text-rose-700',
    amber: 'bg-amber-50 border-amber-200 text-amber-700',
  }[color];

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      whileHover={{ y: -2, transition: { duration: 0.15 } }}
      className="bg-white border border-slate-200 p-5 rounded-2xl space-y-2 shadow-xs hover:border-slate-300 transition"
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-600">{label}</span>
        <div className={`p-2 rounded-xl border ${colorStyles}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>

      <div className="flex items-baseline justify-between">
        <span className="text-3xl font-extrabold text-slate-900 tracking-tight">{displayValue}</span>
        {trend && <span className="text-[11px] font-medium text-slate-500">{trend}</span>}
      </div>
    </motion.div>
  );
};
