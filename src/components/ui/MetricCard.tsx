'use client';

import React, { useEffect, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { TrendingUp } from 'lucide-react';

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
    const duration = 800;
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

  // Map color to semantic CSS variables
  const colorMap: Record<string, { bg: string; icon: string; border: string }> = {
    blue:    { bg: 'var(--primary-light)',   icon: 'var(--primary)',  border: 'var(--primary-border)' },
    teal:    { bg: 'var(--info-light)',       icon: 'var(--info)',     border: 'var(--info-border)' },
    indigo:  { bg: 'var(--primary-light)',   icon: 'var(--primary)',  border: 'var(--primary-border)' },
    emerald: { bg: 'var(--success-light)',   icon: 'var(--success)',  border: 'var(--success-border)' },
    rose:    { bg: 'var(--error-light)',     icon: 'var(--error)',    border: 'var(--error-border)' },
    amber:   { bg: 'var(--warning-light)',   icon: 'var(--warning)',  border: 'var(--warning-border)' },
  };

  const c = colorMap[color] || colorMap.blue;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      whileHover={{ y: -2, transition: { duration: 0.15 } }}
      className="relative overflow-hidden rounded-2xl border p-5 space-y-3 transition-all duration-200"
      style={{
        backgroundColor: 'var(--surface)',
        borderColor: 'var(--border)',
        boxShadow: 'var(--shadow-sm)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'var(--border-strong)';
        e.currentTarget.style.boxShadow = 'var(--shadow-md)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'var(--border)';
        e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
      }}
    >
      {/* Top accent strip */}
      <div
        className="absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl"
        style={{ backgroundColor: c.icon }}
      />

      {/* Label + Icon */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold tracking-wide" style={{ color: 'var(--text-muted)' }}>
          {label}
        </span>
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center border"
          style={{
            backgroundColor: c.bg,
            borderColor: c.border,
            color: c.icon,
          }}
        >
          <Icon className="w-4 h-4" />
        </div>
      </div>

      {/* Value + Trend */}
      <div className="flex items-baseline justify-between gap-2">
        <span
          className="text-3xl font-extrabold tracking-tight tabular-nums"
          style={{ color: 'var(--text-primary)' }}
        >
          {displayValue.toLocaleString()}
        </span>
        {trend && (
          <span
            className="flex items-center gap-1 text-[11px] font-semibold"
            style={{ color: 'var(--text-muted)' }}
          >
            <TrendingUp className="w-3 h-3" />
            {trend}
          </span>
        )}
      </div>
    </motion.div>
  );
};
