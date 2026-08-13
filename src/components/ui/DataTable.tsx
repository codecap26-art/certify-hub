'use client';

import React, { useState } from 'react';
import { Search, ChevronDown, ChevronUp, Filter, AlertCircle } from 'lucide-react';
import { StatusBadge } from './StatusBadge';
import { EmptyState } from './EmptyState';

export interface Column<T> {
  key: string;
  header: string;
  render?: (item: T) => React.ReactNode;
  sortable?: boolean;
}

interface Props<T> {
  data: T[];
  columns: Column<T>[];
  searchKey?: keyof T;
  searchPlaceholder?: string;
  filterKey?: keyof T;
  filterOptions?: { label: string; value: string }[];
  onRowClick?: (item: T) => void;
  emptyTitle?: string;
  emptyDescription?: string;
}

export function DataTable<T extends { id: string }>({
  data,
  columns,
  searchKey,
  searchPlaceholder = 'Search records...',
  filterKey,
  filterOptions = [],
  onRowClick,
  emptyTitle = 'No Records Found',
  emptyDescription = 'There are no items matching your criteria.',
}: Props<T>) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterValue, setFilterValue] = useState('ALL');
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Filter & Search Logic
  const filteredData = data.filter((item) => {
    let matchesSearch = true;
    if (searchKey && searchTerm.trim()) {
      const val = String(item[searchKey] || '').toLowerCase();
      matchesSearch = val.includes(searchTerm.toLowerCase());
    }

    let matchesFilter = true;
    if (filterKey && filterValue !== 'ALL') {
      matchesFilter = String(item[filterKey]) === filterValue;
    }

    return matchesSearch && matchesFilter;
  });

  // Sort Logic
  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortKey) return 0;
    const aVal = String((a as Record<string, unknown>)[sortKey] || '');
    const bVal = String((b as Record<string, unknown>)[sortKey] || '');
    if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortOrder('asc');
    }
  };

  return (
    <div className="space-y-4">
      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white border border-slate-200 p-3.5 rounded-2xl shadow-xs">
        {searchKey && (
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
        )}

        {filterKey && filterOptions.length > 0 && (
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <select
              value={filterValue}
              onChange={(e) => setFilterValue(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-xs text-slate-700 rounded-xl px-3 py-2 focus:outline-none focus:border-blue-500"
            >
              <option value="ALL">All Statuses</option>
              {filterOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        )}

        <span className="text-[11px] font-semibold text-slate-500 self-center px-2">
          {sortedData.length} {sortedData.length === 1 ? 'record' : 'records'}
        </span>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        {sortedData.length > 0 ? (
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[10px]">
                {columns.map((col) => (
                  <th
                    key={col.key}
                    onClick={() => col.sortable && handleSort(col.key)}
                    className={`py-3.5 px-4 ${col.sortable ? 'cursor-pointer hover:text-slate-900 select-none' : ''}`}
                  >
                    <div className="flex items-center gap-1.5">
                      <span>{col.header}</span>
                      {col.sortable && sortKey === col.key && (
                        <span>{sortOrder === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}</span>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {sortedData.map((item) => (
                <tr
                  key={item.id}
                  onClick={() => onRowClick && onRowClick(item)}
                  className={`transition hover:bg-slate-50/80 ${onRowClick ? 'cursor-pointer' : ''}`}
                >
                  {columns.map((col) => (
                    <td key={col.key} className="py-3.5 px-4">
                      {col.render
                        ? col.render(item)
                        : String((item as Record<string, unknown>)[col.key] || '')}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <EmptyState icon={AlertCircle} title={emptyTitle} description={emptyDescription} />
        )}
      </div>

      {/* Mobile Card List View */}
      <div className="md:hidden space-y-3">
        {sortedData.length > 0 ? (
          sortedData.map((item) => (
            <div
              key={item.id}
              onClick={() => onRowClick && onRowClick(item)}
              className={`bg-white border border-slate-200 p-4 rounded-2xl space-y-2.5 shadow-xs ${
                onRowClick ? 'cursor-pointer hover:border-slate-300' : ''
              }`}
            >
              {columns.map((col) => (
                <div key={col.key} className="flex justify-between items-center text-xs">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    {col.header}
                  </span>
                  <span className="text-right text-slate-800">
                    {col.render
                      ? col.render(item)
                      : String((item as Record<string, unknown>)[col.key] || '')}
                  </span>
                </div>
              ))}
            </div>
          ))
        ) : (
          <EmptyState icon={AlertCircle} title={emptyTitle} description={emptyDescription} />
        )}
      </div>
    </div>
  );
}
