import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CategoryHeader } from './CategoryHeader';
import { ParticipantCard } from './ParticipantCard';
import { ParticipantItem } from '@/lib/participantUtils';

interface ParticipantCategorySectionProps {
  categoryKey: string;
  displayTitle: string;
  participants: ParticipantItem[];
  isExpanded: boolean;
  onToggleExpand: () => void;
  onToggleParticipant: (id: string) => void;
  onToggleCategorySelectAll: (categoryKey: string) => void;
  onCategoryChange: (id: string, newCategory: string, newAchievement: string) => void;
}

export const ParticipantCategorySection: React.FC<ParticipantCategorySectionProps> = ({
  categoryKey,
  displayTitle,
  participants,
  isExpanded,
  onToggleExpand,
  onToggleParticipant,
  onToggleCategorySelectAll,
  onCategoryChange,
}) => {
  const selectedCount = participants.filter((p) => p.selected).length;
  const totalCount = participants.length;

  if (totalCount === 0) return null;

  return (
    <div
      className="space-y-2 border rounded-2xl p-2 shadow-2xs"
      style={{
        backgroundColor: 'var(--surface)',
        borderColor: 'var(--border)',
      }}
    >
      <CategoryHeader
        categoryKey={categoryKey}
        displayTitle={displayTitle}
        selectedCount={selectedCount}
        totalCount={totalCount}
        isExpanded={isExpanded}
        onToggleExpand={onToggleExpand}
        onToggleCategorySelectAll={() => onToggleCategorySelectAll(categoryKey)}
      />

      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="overflow-hidden space-y-2 pt-1 px-1 pb-1"
          >
            {participants.map((participant) => (
              <ParticipantCard
                key={participant.id}
                participant={participant}
                onToggle={onToggleParticipant}
                onCategoryChange={onCategoryChange}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
