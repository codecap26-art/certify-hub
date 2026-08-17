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
    <div className="space-y-3">
      {/* ── Search & Filter Bar ── */}
      <div
        className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-2xl border"
        style={{
          backgroundColor: 'var(--surface)',
          borderColor: 'var(--border)',
          boxShadow: 'var(--shadow-xs)',
        }}
      >
        {searchKey && (
          <div className="relative flex-1">
            <Search
              className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
              style={{ color: 'var(--text-muted)' }}
            />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full pl-10 pr-4 py-2 rounded-xl border text-xs transition-all"
              style={{
                backgroundColor: 'var(--surface-subtle)',
                borderColor: 'var(--border)',
                color: 'var(--text-primary)',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = 'var(--primary)';
                e.currentTarget.style.boxShadow = 'var(--shadow-focus)';
                e.currentTarget.style.outline = 'none';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = 'var(--border)';
                e.currentTarget.style.boxShadow = '';
              }}
            />
          </div>
        )}

        <div className="flex items-center gap-2">
          {filterKey && filterOptions.length > 0 && (
            <div className="flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 shrink-0" style={{ color: 'var(--text-muted)' }} />
              <select
                value={filterValue}
                onChange={(e) => setFilterValue(e.target.value)}
                className="text-xs px-3 py-2 rounded-xl border transition-all"
                style={{
                  backgroundColor: 'var(--surface-subtle)',
                  borderColor: 'var(--border)',
                  color: 'var(--text-secondary)',
                  outline: 'none',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = 'var(--primary)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border)';
                }}
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

          <span
            className="text-[11px] font-semibold px-2.5 py-1 rounded-lg border"
            style={{
              color: 'var(--text-muted)',
              backgroundColor: 'var(--surface-subtle)',
              borderColor: 'var(--border)',
            }}
          >
            {sortedData.length} {sortedData.length === 1 ? 'record' : 'records'}
          </span>
        </div>
      </div>

      {/* ── Desktop Table ── */}
      <div
        className="hidden md:block rounded-2xl border overflow-hidden"
        style={{
          backgroundColor: 'var(--surface)',
          borderColor: 'var(--border)',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        {sortedData.length > 0 ? (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr
                className="border-b"
                style={{
                  backgroundColor: 'var(--surface-subtle)',
                  borderColor: 'var(--border)',
                }}
              >
                {columns.map((col) => (
                  <th
                    key={col.key}
                    onClick={() => col.sortable && handleSort(col.key)}
                    className={`py-3 px-4 text-[10px] font-bold uppercase tracking-widest ${
                      col.sortable ? 'cursor-pointer select-none' : ''
                    }`}
                    style={{ color: 'var(--text-muted)' }}
                    onMouseEnter={(e) => {
                      if (col.sortable) e.currentTarget.style.color = 'var(--text-primary)';
                    }}
                    onMouseLeave={(e) => {
                      if (col.sortable) e.currentTarget.style.color = 'var(--text-muted)';
                    }}
                  >
                    <div className="flex items-center gap-1.5">
                      <span>{col.header}</span>
                      {col.sortable && sortKey === col.key && (
                        <span style={{ color: 'var(--primary)' }}>
                          {sortOrder === 'asc' ? (
                            <ChevronUp className="w-3.5 h-3.5" />
                          ) : (
                            <ChevronDown className="w-3.5 h-3.5" />
                          )}
                        </span>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sortedData.map((item, idx) => (
                <tr
                  key={item.id}
                  onClick={() => onRowClick && onRowClick(item)}
                  className={`border-b last:border-b-0 text-xs transition-colors duration-100 ${
                    onRowClick ? 'cursor-pointer' : ''
                  }`}
                  style={{
                    borderColor: 'var(--border-subtle)',
                    color: 'var(--text-secondary)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--surface-hover)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '';
                  }}
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

      {/* ── Mobile Card View ── */}
      <div className="md:hidden space-y-2.5">
        {sortedData.length > 0 ? (
          sortedData.map((item) => (
            <div
              key={item.id}
              onClick={() => onRowClick && onRowClick(item)}
              className={`p-4 rounded-2xl border space-y-3 transition-all ${
                onRowClick ? 'cursor-pointer' : ''
              }`}
              style={{
                backgroundColor: 'var(--surface)',
                borderColor: 'var(--border)',
                boxShadow: 'var(--shadow-xs)',
              }}
              onMouseEnter={(e) => {
                if (onRowClick) {
                  e.currentTarget.style.borderColor = 'var(--border-strong)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border)';
                e.currentTarget.style.boxShadow = 'var(--shadow-xs)';
              }}
            >
              {columns.map((col) => (
                <div key={col.key} className="flex justify-between items-center gap-4 text-xs">
                  <span
                    className="text-[10px] font-bold uppercase tracking-widest shrink-0"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    {col.header}
                  </span>
                  <span className="text-right" style={{ color: 'var(--text-primary)' }}>
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
