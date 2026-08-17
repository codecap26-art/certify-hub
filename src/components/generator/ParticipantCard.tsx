import React from 'react';
import { ParticipantItem, getCategoryBadgeStyle, getCategoryDisplayTitle } from '@/lib/participantUtils';
import { Check } from 'lucide-react';

interface ParticipantCardProps {
  participant: ParticipantItem;
  onToggle: (id: string) => void;
  showCategoryBadge?: boolean;
  onCategoryChange?: (id: string, newCategory: string, newAchievement: string) => void;
}

export const ParticipantCard: React.FC<ParticipantCardProps> = ({
  participant,
  onToggle,
  showCategoryBadge = false,
  onCategoryChange,
}) => {
  const isChecked = participant.selected;
  const badgeStyle = getCategoryBadgeStyle(participant.category);
  const isCustomCategory = !['winner', 'runner', 'participant'].includes(participant.category);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      onToggle(participant.id);
    }
  };

  return (
    <div
      tabIndex={0}
      role="checkbox"
      aria-checked={isChecked}
      onClick={() => onToggle(participant.id)}
      onKeyDown={handleKeyDown}
      className="p-3.5 rounded-xl border cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all duration-200 focus:outline-none focus:ring-3 shadow-xs"
      style={{
        backgroundColor: isChecked ? 'var(--surface-elevated)' : 'var(--surface)',
        borderColor: isChecked ? 'var(--primary)' : 'var(--border)',
        color: 'var(--text-primary)',
        boxShadow: isChecked ? '0 0 0 1px var(--primary)' : 'var(--shadow-xs)',
      }}
    >
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div
          className="w-5 h-5 rounded border flex items-center justify-center shrink-0 transition-colors duration-200"
          style={
            isChecked
              ? {
                  backgroundColor: 'var(--primary)',
                  borderColor: 'var(--primary)',
                  color: 'white',
                }
              : {
                  borderColor: 'var(--border-strong)',
                  backgroundColor: 'var(--surface-subtle)',
                  color: 'transparent',
                }
          }
        >
          <Check className="w-3.5 h-3.5 stroke-[3]" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="font-bold text-xs truncate" style={{ color: 'var(--text-primary)' }}>{participant.name}</p>
            {showCategoryBadge && (
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${badgeStyle.bg} ${badgeStyle.text} ${badgeStyle.border}`}>
                {getCategoryDisplayTitle(participant.category)}
              </span>
            )}
          </div>
          <p className="text-[11px] truncate mt-0.5" style={{ color: 'var(--text-muted)' }}>
            {participant.email || 'No Email'}
            <span className="mx-1" style={{ color: 'var(--border-strong)' }}>•</span>
            {participant.department || 'General'}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Role/Award:</span>
          <select
            value={participant.category}
            onChange={(e) => {
              const val = e.target.value;
              let achievementVal = 'Participant';
              if (val === 'winner') achievementVal = 'Winner';
              if (val === 'runner') achievementVal = 'Runner';
              if (onCategoryChange) {
                onCategoryChange(participant.id, val, achievementVal);
              }
            }}
            className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 cursor-pointer ${
              participant.category === 'winner'
                ? 'bg-[#FFFBEB] text-[#92400E] border-[#FCD34D] focus:ring-[#FCD34D]/50'
                : participant.category === 'runner'
                ? 'bg-[#F5F3FF] text-[#5B21B6] border-[#C4B5FD] focus:ring-[#C4B5FD]/50'
                : 'bg-[#ECFEFF] text-[#155E75] border-[#67E8F9] focus:ring-[#67E8F9]/50'
            }`}
          >
            <option value="winner" style={{ backgroundColor: 'var(--surface)', color: 'var(--text-primary)' }}>Winner</option>
            <option value="runner" style={{ backgroundColor: 'var(--surface)', color: 'var(--text-primary)' }}>Runner</option>
            <option value="participant" style={{ backgroundColor: 'var(--surface)', color: 'var(--text-primary)' }}>Participated</option>
            {isCustomCategory && (
              <option value={participant.category} style={{ backgroundColor: 'var(--surface)', color: 'var(--text-primary)' }}>
                {getCategoryDisplayTitle(participant.category)}
              </option>
            )}
          </select>
        </div>

        <span
          className="text-[11px] font-mono font-medium px-2 py-0.5 rounded border select-all"
          style={{
            backgroundColor: 'var(--surface-subtle)',
            borderColor: 'var(--border-subtle)',
            color: 'var(--text-secondary)',
          }}
        >
          {participant.registrationNumber || 'N/A'}
        </span>
      </div>
    </div>
  );
};
