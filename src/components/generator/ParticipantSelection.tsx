import React, { useState, useMemo, useEffect } from 'react';
import { Recipient, Participant } from '@/types';
import {
  getNormalizedCategory,
  groupParticipantsByCategory,
  ParticipantItem,
} from '@/lib/participantUtils';
import { SelectionSummary } from './SelectionSummary';
import { ParticipantSearch } from './ParticipantSearch';
import { ParticipantCategorySection } from './ParticipantCategorySection';

interface ParticipantSelectionProps {
  eventName?: string;
  recipients: Recipient[];
  selectedRecipientIds: string[];
  onSelectionChange: (selectedIds: string[], selectedParticipants: Participant[]) => void;
  onUpdateRecipient?: (updatedRecipient: Recipient) => void;
}

export const ParticipantSelection: React.FC<ParticipantSelectionProps> = ({
  eventName,
  recipients,
  selectedRecipientIds,
  onSelectionChange,
  onUpdateRecipient,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});

  // Prepare normalized participant items
  const allParticipantItems: ParticipantItem[] = useMemo(() => {
    return recipients.map((r) => {
      const category = getNormalizedCategory(r);
      return {
        id: r.id,
        name: r.fullName,
        email: r.email || '',
        department: r.department || '',
        registrationNumber: r.registrationNumber || '',
        category,
        selected: selectedRecipientIds.includes(r.id),
        achievement: r.achievement,
        rawRecipient: r,
      };
    });
  }, [recipients, selectedRecipientIds]);

  // Group all participants by category
  const groupedCategories = useMemo(() => {
    return groupParticipantsByCategory(allParticipantItems);
  }, [allParticipantItems]);

  // Initialize collapse states (default all categories to expanded)
  useEffect(() => {
    const initialMap: Record<string, boolean> = {};
    groupedCategories.forEach((group) => {
      // Default behavior: expanded unless explicitly set to false
      if (expandedCategories[group.categoryKey] === undefined) {
        initialMap[group.categoryKey] = true;
      }
    });
    if (Object.keys(initialMap).length > 0) {
      setExpandedCategories((prev) => ({ ...initialMap, ...prev }));
    }
  }, [groupedCategories]);

  // Auto-expand categories on search
  useEffect(() => {
    if (searchQuery.trim()) {
      const searchExpansions: Record<string, boolean> = {};
      groupedCategories.forEach((group) => {
        const hasMatch = group.items.some((p) =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.registrationNumber.toLowerCase().includes(searchQuery.toLowerCase())
        );
        if (hasMatch) {
          searchExpansions[group.categoryKey] = true;
        }
      });
      setExpandedCategories((prev) => ({ ...prev, ...searchExpansions }));
    }
  }, [searchQuery, groupedCategories]);

  // Filtered grouped categories based on search query
  const filteredGroupedCategories = useMemo(() => {
    if (!searchQuery.trim()) return groupedCategories;

    const query = searchQuery.toLowerCase();
    return groupedCategories
      .map((group) => ({
        ...group,
        items: group.items.filter(
          (p) =>
            p.name.toLowerCase().includes(query) ||
            p.email.toLowerCase().includes(query) ||
            p.department.toLowerCase().includes(query) ||
            p.registrationNumber.toLowerCase().includes(query)
        ),
      }))
      .filter((group) => group.items.length > 0);
  }, [groupedCategories, searchQuery]);

  // Total metrics calculation
  const totalSelected = allParticipantItems.filter((p) => p.selected).length;
  const totalCount = allParticipantItems.length;

  const categorySummaries = useMemo(() => {
    return groupedCategories.map((group) => ({
      categoryKey: group.categoryKey,
      displayTitle: group.displayTitle,
      selectedCount: group.items.filter((p) => p.selected).length,
      totalCount: group.items.length,
    }));
  }, [groupedCategories]);

  // Helper to emit selection changes upward
  const notifySelectionChange = (newSelectedIds: string[]) => {
    const selectedParticipantsList: Participant[] = allParticipantItems
      .filter((p) => newSelectedIds.includes(p.id))
      .map((p) => ({
        id: p.id,
        name: p.name,
        email: p.email,
        department: p.department,
        registrationNumber: p.registrationNumber,
        category: p.category,
        selected: true,
      }));
    onSelectionChange(newSelectedIds, selectedParticipantsList);
  };

  // Toggle individual participant
  const handleToggleParticipant = (id: string) => {
    const newSelected = selectedRecipientIds.includes(id)
      ? selectedRecipientIds.filter((item) => item !== id)
      : [...selectedRecipientIds, id];
    notifySelectionChange(newSelected);
  };

  // Toggle category select all
  const handleToggleCategorySelectAll = (categoryKey: string) => {
    const categoryParticipantIds = allParticipantItems
      .filter((p) => p.category === categoryKey)
      .map((p) => p.id);

    const isCategoryAllSelected = categoryParticipantIds.every((id) =>
      selectedRecipientIds.includes(id)
    );

    let newSelected: string[];
    if (isCategoryAllSelected) {
      // Deselect all in this category only
      newSelected = selectedRecipientIds.filter((id) => !categoryParticipantIds.includes(id));
    } else {
      // Select all in this category only, preserving other selections
      const combined = new Set([...selectedRecipientIds, ...categoryParticipantIds]);
      newSelected = Array.from(combined);
    }

    notifySelectionChange(newSelected);
  };

  // Global select all / deselect all
  const handleGlobalSelectAllToggle = () => {
    if (totalSelected === totalCount) {
      notifySelectionChange([]);
    } else {
      notifySelectionChange(allParticipantItems.map((p) => p.id));
    }
  };

  // Toggle expand / collapse for category
  const handleToggleExpandCategory = (categoryKey: string) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [categoryKey]: !prev[categoryKey],
    }));
  };

  // Handle category/achievement change for a participant
  const handleCategoryChange = (id: string, newCategory: string, newAchievement: string) => {
    const recipientToUpdate = recipients.find((r) => r.id === id);
    if (recipientToUpdate && onUpdateRecipient) {
      onUpdateRecipient({
        ...recipientToUpdate,
        category: newCategory,
        achievement: newAchievement,
        updatedAt: new Date().toISOString(),
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Global Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#E2E8F0] pb-4">
        <div>
          <h2 className="text-base font-bold text-[#0F172A]">
            Step 2: Select Participants ({totalSelected} Selected)
          </h2>
          <p className="text-xs text-[#475569] mt-0.5">
            Select participants category-wise before generating certificates for event:{' '}
            <strong className="text-[#0F172A]">{eventName || 'Selected Event'}</strong>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleGlobalSelectAllToggle}
            className="text-xs font-semibold text-[#2563EB] hover:bg-[#EFF6FF] bg-[#FFFFFF] px-3.5 py-2 rounded-xl border border-[#93C5FD] shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-all duration-200"
          >
            {totalSelected === totalCount ? 'Deselect All Categories' : 'Select All Categories'}
          </button>
        </div>
      </div>

      {/* Instant Summary Header */}
      <SelectionSummary
        totalSelected={totalSelected}
        totalParticipants={totalCount}
        categorySummaries={categorySummaries}
      />

      {/* Cross-Category Search */}
      <ParticipantSearch value={searchQuery} onChange={setSearchQuery} />

      {/* Category Sections */}
      {filteredGroupedCategories.length > 0 ? (
        <div className="space-y-4">
          {filteredGroupedCategories.map((group) => (
            <ParticipantCategorySection
              key={group.categoryKey}
              categoryKey={group.categoryKey}
              displayTitle={group.displayTitle}
              participants={group.items}
              isExpanded={expandedCategories[group.categoryKey] ?? true}
              onToggleExpand={() => handleToggleExpandCategory(group.categoryKey)}
              onToggleParticipant={handleToggleParticipant}
              onToggleCategorySelectAll={handleToggleCategorySelectAll}
              onCategoryChange={handleCategoryChange}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-10 space-y-2 bg-slate-50 border border-slate-200 rounded-2xl">
          <p className="text-xs font-bold text-slate-700">No matching participants found</p>
          <p className="text-[11px] text-slate-500">
            No participants match your query &quot;{searchQuery}&quot;. Try adjusting your search term.
          </p>
        </div>
      )}
    </div>
  );
};
