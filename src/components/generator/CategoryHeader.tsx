import React from 'react';
import { ChevronDown, Trophy, Award, Users } from 'lucide-react';
import { getCategoryBadgeStyle } from '@/lib/participantUtils';

interface CategoryHeaderProps {
  categoryKey: string;
  displayTitle: string;
  selectedCount: number;
  totalCount: number;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onToggleCategorySelectAll: () => void;
}

export const CategoryHeader: React.FC<CategoryHeaderProps> = ({
  categoryKey,
  displayTitle,
  selectedCount,
  totalCount,
  isExpanded,
  onToggleExpand,
  onToggleCategorySelectAll,
}) => {
  const isAllSelected = totalCount > 0 && selectedCount === totalCount;
  const badgeStyle = getCategoryBadgeStyle(categoryKey);

  const getCategoryIcon = () => {
    const norm = categoryKey.toLowerCase();
    if (norm === 'winner' || norm === 'winners') return <Trophy className="w-4 h-4 text-[#F59E0B]" />;
    if (norm === 'runner' || norm === 'runners') return <Award className="w-4 h-4 text-[#8B5CF6]" />;
    return <Users className="w-4 h-4 text-[#0284C7]" />;
  };

  return (
    <div
      onClick={onToggleExpand}
      className={`p-3.5 sm:p-4 border rounded-xl cursor-pointer flex flex-wrap items-center justify-between gap-3 transition-all duration-200 select-none ${badgeStyle.bg} ${badgeStyle.border}`}
      style={{ boxShadow: 'var(--shadow-xs)' }}
    >
      <div className="flex items-center gap-3">
        {/* Icon container */}
        <div
          className={`w-9 h-9 rounded-xl flex items-center justify-center border ${badgeStyle.border}`}
          style={{ backgroundColor: 'var(--surface)', boxShadow: 'var(--shadow-xs)' }}
        >
          {getCategoryIcon()}
        </div>

        <div>
          <div className="flex items-center gap-2">
            <h3 className={`font-bold text-sm ${badgeStyle.text}`}>{displayTitle}</h3>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${badgeStyle.text} ${badgeStyle.border}`}
              style={{ backgroundColor: 'var(--surface)' }}
            >
              {selectedCount} Selected
            </span>
          </div>
          <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
            {totalCount} participant{totalCount === 1 ? '' : 's'} in category
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleCategorySelectAll();
          }}
          className="text-xs font-semibold px-3.5 py-1.5 rounded-lg border transition-all duration-200"
          style={
            isAllSelected
              ? {
                  backgroundColor: 'var(--primary)',
                  color: 'white',
                  borderColor: 'var(--primary)',
                }
              : {
                  backgroundColor: 'var(--surface)',
                  color: 'var(--primary)',
                  borderColor: 'var(--primary-border)',
                }
          }
          onMouseEnter={(e) => {
            if (isAllSelected) {
              e.currentTarget.style.backgroundColor = 'var(--primary-hover)';
            } else {
              e.currentTarget.style.backgroundColor = 'var(--primary-light)';
            }
          }}
          onMouseLeave={(e) => {
            if (isAllSelected) {
              e.currentTarget.style.backgroundColor = 'var(--primary)';
            } else {
              e.currentTarget.style.backgroundColor = 'var(--surface)';
            }
          }}
        >
          {isAllSelected ? 'Deselect All' : 'Select All'}
        </button>

        <div
          className={`p-1 rounded-lg transition-all duration-200 ${isExpanded ? 'rotate-180' : ''}`}
          style={{ color: 'var(--text-muted)' }}
        >
          <ChevronDown className="w-4 h-4" />
        </div>
      </div>
    </div>
  );
};
