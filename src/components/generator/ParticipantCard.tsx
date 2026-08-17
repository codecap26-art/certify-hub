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
      className={`p-3.5 rounded-xl border cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all duration-200 focus:outline-none focus:ring-3 focus:ring-[rgba(37,99,235,0.15)] shadow-[0_1px_2px_rgba(15,23,42,0.04)] ${
        isChecked
          ? 'bg-[#EFF6FF] border-[#2563EB] text-[#0F172A]'
          : 'bg-[#FFFFFF] border-[#E2E8F0] text-[#0F172A] hover:bg-[#F8FAFC] hover:border-[#93C5FD]'
      }`}
    >
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div
          className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 transition-colors duration-200 ${
            isChecked
              ? 'bg-[#2563EB] border-[#2563EB] text-white'
              : 'border-[#CBD5E1] bg-white text-transparent'
          }`}
        >
          <Check className="w-3.5 h-3.5 stroke-[3]" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="font-bold text-xs text-[#0F172A] truncate">{participant.name}</p>
            {showCategoryBadge && (
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${badgeStyle.bg} ${badgeStyle.text} ${badgeStyle.border}`}>
                {getCategoryDisplayTitle(participant.category)}
              </span>
            )}
          </div>
          <p className="text-[11px] text-[#475569] truncate mt-0.5">
            {participant.email || 'No Email'}
            <span className="mx-1 text-[#CBD5E1]">•</span>
            {participant.department || 'General'}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-bold text-[#475569] uppercase tracking-wider">Role/Award:</span>
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
            <option value="winner" className="bg-white text-slate-900">Winner</option>
            <option value="runner" className="bg-white text-slate-900">Runner</option>
            <option value="participant" className="bg-white text-slate-900">Participated</option>
            {isCustomCategory && (
              <option value={participant.category} className="bg-white text-slate-900">
                {getCategoryDisplayTitle(participant.category)}
              </option>
            )}
          </select>
        </div>

        <span className="text-[11px] font-mono font-medium text-[#475569] bg-[#F8FAFC] px-2 py-0.5 rounded border border-[#E2E8F0] select-all">
          {participant.registrationNumber || 'N/A'}
        </span>
      </div>
    </div>
  );
};
