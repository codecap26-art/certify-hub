'use client';

import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  Plus,
  Trash2,
  Check,
  User,
  Building2,
  Calendar,
  ShieldCheck,
  PenTool,
  Search,
  Eye,
} from 'lucide-react';
import { useEditor } from '@/lib/editor/useEditorStore';
import { DYNAMIC_BINDING_OPTIONS } from '@/lib/editor/documentModel';

export const DynamicFieldsPanel: React.FC = () => {
  const { state, dispatch, addDynamicField } = useEditor();
  const [search, setSearch] = useState('');
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customKey, setCustomKey] = useState('');
  const [customLabel, setCustomLabel] = useState('');
  const [customSample, setCustomSample] = useState('');

  const { customFields = [] } = state.document;

  const allFields = useMemo(() => {
    return [
      ...DYNAMIC_BINDING_OPTIONS,
      ...customFields.map((f) => ({
        key: f.key,
        label: f.label,
        category: 'Custom' as const,
        sampleValue: f.sampleValue,
      })),
    ];
  }, [customFields]);

  const filtered = useMemo(() => {
    if (!search.trim()) return allFields;
    const q = search.toLowerCase();
    return allFields.filter(
      (f) => f.label.toLowerCase().includes(q) || f.key.toLowerCase().includes(q) || f.category.toLowerCase().includes(q)
    );
  }, [allFields, search]);

  const categories = ['Recipient', 'Organization', 'Event', 'Certificate', 'Signatory', 'Custom'] as const;

  const handleCreateCustomField = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customKey.trim() || !customLabel.trim()) return;

    let normalizedKey = customKey.trim();
    if (!normalizedKey.startsWith('{{')) normalizedKey = `{{${normalizedKey}`;
    if (!normalizedKey.endsWith('}}')) normalizedKey = `${normalizedKey}}}`;

    dispatch({
      type: 'ADD_CUSTOM_FIELD',
      key: normalizedKey,
      label: customLabel.trim(),
      sampleValue: customSample.trim() || 'Sample Data',
    });

    setCustomKey('');
    setCustomLabel('');
    setCustomSample('');
    setShowCustomModal(false);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-3 border-b border-slate-100 space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>Dynamic Data Fields</span>
          </h3>
          <button
            onClick={() => setShowCustomModal(true)}
            className="flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-[10px] font-bold transition"
          >
            <Plus className="w-3 h-3" />
            <span>New Field</span>
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search data fields..."
            className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>
      </div>

      {/* Field List Categorized */}
      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {categories.map((cat) => {
          const items = filtered.filter((f) => f.category === cat);
          if (items.length === 0) return null;

          const Icon =
            cat === 'Recipient'
              ? User
              : cat === 'Organization'
              ? Building2
              : cat === 'Event'
              ? Calendar
              : cat === 'Signatory'
              ? PenTool
              : ShieldCheck;

          return (
            <div key={cat} className="space-y-1.5">
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                <Icon className="w-3 h-3 text-slate-400" />
                <span>{cat} Fields</span>
              </div>

              <div className="space-y-1">
                {items.map((field) => (
                  <div
                    key={field.key}
                    className="flex items-center justify-between p-2 rounded-xl bg-slate-50 hover:bg-blue-50/70 border border-slate-200 hover:border-blue-300 transition group"
                  >
                    <button
                      onClick={() => addDynamicField(field.key, field.label, field.sampleValue)}
                      className="flex-1 text-left min-w-0"
                    >
                      <p className="font-bold text-xs text-slate-800 group-hover:text-blue-900 truncate">
                        {field.label}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="font-mono text-[10px] text-blue-600 bg-blue-50/80 px-1 rounded">
                          {field.key}
                        </span>
                        <span className="text-[10px] text-slate-400 truncate">
                          e.g. &ldquo;{field.sampleValue}&rdquo;
                        </span>
                      </div>
                    </button>

                    {cat === 'Custom' && (
                      <button
                        onClick={() => dispatch({ type: 'REMOVE_CUSTOM_FIELD', key: field.key })}
                        className="p-1 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded transition ml-1 shrink-0"
                        title="Delete custom field"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Custom Field Modal */}
      {showCustomModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-fade-in">
          <div className="w-full max-w-sm bg-white rounded-2xl border border-slate-200 shadow-2xl p-5 space-y-4">
            <h3 className="font-bold text-sm text-slate-900">Create Custom Dynamic Variable</h3>
            <form onSubmit={handleCreateCustomField} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Variable Key</label>
                <input
                  type="text"
                  required
                  value={customKey}
                  onChange={(e) => setCustomKey(e.target.value)}
                  placeholder="e.g. custom.mentor_name or college"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 font-mono text-xs focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Display Label</label>
                <input
                  type="text"
                  required
                  value={customLabel}
                  onChange={(e) => setCustomLabel(e.target.value)}
                  placeholder="e.g. Mentor Name"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Sample Value (for Preview)</label>
                <input
                  type="text"
                  value={customSample}
                  onChange={(e) => setCustomSample(e.target.value)}
                  placeholder="e.g. Dr. Eleanor Vance"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCustomModal(false)}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition shadow-xs"
                >
                  Create Variable
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
