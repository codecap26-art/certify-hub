import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';
import { getCategoryBadgeStyle } from '@/lib/participantUtils';

interface CategorySummaryCount {
  categoryKey: string;
  displayTitle: string;
  selectedCount: number;
  totalCount: number;
}

interface SelectionSummaryProps {
  totalSelected: number;
  totalParticipants: number;
  categorySummaries: CategorySummaryCount[];
}

export const SelectionSummary: React.FC<SelectionSummaryProps> = ({
  totalSelected,
  totalParticipants,
  categorySummaries,
}) => {
  return (
    <div
      className="rounded-xl border p-3.5 sm:p-4"
      style={{
        backgroundColor: 'var(--surface-subtle)',
        borderColor: 'var(--border)',
        boxShadow: 'var(--shadow-xs)',
      }}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Total Selected */}
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center border"
            style={{
              backgroundColor: 'var(--primary-light)',
              color: 'var(--primary)',
              borderColor: 'var(--primary-border)',
            }}
          >
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
              Total Selected:{' '}
            </span>
            <span className="inline-flex items-center gap-1 font-bold text-sm" style={{ color: 'var(--text-primary)' }}>
              <AnimatePresence mode="wait">
                <motion.span
                  key={totalSelected}
                  initial={{ y: -4, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 4, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="inline-block"
                >
                  {totalSelected}
                </motion.span>
              </AnimatePresence>
              <span className="text-xs font-normal" style={{ color: 'var(--text-muted)' }}>
                / {totalParticipants}
              </span>
            </span>
          </div>
        </div>

        {/* Category breakdown pills */}
        <div className="flex flex-wrap items-center gap-2">
          {categorySummaries.map((cat) => {
            const badgeStyle = getCategoryBadgeStyle(cat.categoryKey);
            return (
              <div
                key={cat.categoryKey}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold ${badgeStyle.bg} ${badgeStyle.border} ${badgeStyle.text}`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${badgeStyle.dot} shrink-0`} />
                <span>{cat.displayTitle}:</span>
                <AnimatePresence mode="wait">
                  <motion.span
                    key={cat.selectedCount}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="font-bold"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {cat.selectedCount}
                  </motion.span>
                </AnimatePresence>
                <span className="text-[10px] font-normal" style={{ color: 'var(--text-muted)' }}>
                  ({cat.totalCount})
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
