'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Palette,
  Search,
  Filter,
  PlusCircle,
  Upload,
  Edit3,
  Eye,
  Copy,
  Download,
  Trash2,
  LayoutGrid,
  List,
  AlertTriangle,
  HardDrive,
  Check,
  X,
  FileText,
} from 'lucide-react';
import { CustomTemplate, TemplateCategory } from '@/types/template';
import { templateRepository } from '@/lib/storage/templateRepository';
import { PageHeader } from '@/components/ui/PageHeader';

type FilterType = 'ALL' | 'Custom' | 'Imported' | 'Smart Design' | 'landscape' | 'portrait';
type SortType = 'newest' | 'oldest' | 'name';

export default function MyDesignsPage() {
  const router = useRouter();

  const [designs, setDesigns] = useState<CustomTemplate[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('ALL');
  const [sortBy, setSortBy] = useState<SortType>('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Rename Modal State
  const [renameTarget, setRenameTarget] = useState<CustomTemplate | null>(null);
  const [newNameInput, setNewNameInput] = useState('');

  // Delete Modal State
  const [deleteTarget, setDeleteTarget] = useState<CustomTemplate | null>(null);

  const loadDesigns = () => {
    const list = templateRepository.getAll();
    setDesigns(list);
  };

  useEffect(() => {
    loadDesigns();
  }, []);

  const handleDuplicate = async (id: string) => {
    await templateRepository.duplicate(id);
    loadDesigns();
  };

  const handleExport = async (id: string) => {
    const pkgJson = await templateRepository.exportPackage(id);
    if (!pkgJson) return;

    const blob = new Blob([pkgJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `CertifyHub_Design_${id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleConfirmRename = async () => {
    if (!renameTarget || !newNameInput.trim()) return;
    const updated = { ...renameTarget, name: newNameInput.trim() };
    await templateRepository.save(updated);
    setRenameTarget(null);
    loadDesigns();
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    await templateRepository.delete(deleteTarget.id);
    setDeleteTarget(null);
    loadDesigns();
  };

  // Filter & Search Logic
  const filteredDesigns = designs.filter((d) => {
    const matchesFilter =
      activeFilter === 'ALL'
        ? true
        : activeFilter === 'landscape' || activeFilter === 'portrait'
        ? d.orientation === activeFilter
        : d.category === activeFilter;

    const matchesSearch =
      d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.description.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  // Sorting
  const sortedDesigns = [...filteredDesigns].sort((a, b) => {
    if (sortBy === 'newest') return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    if (sortBy === 'oldest') return new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
    if (sortBy === 'name') return a.name.localeCompare(b.name);
    return 0;
  });

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <PageHeader
        title="My Studio Certificate Designs"
        description="Manage all user-created, imported Canva designs, and smart-generated layouts."
        icon={Palette}
        breadcrumbs={[
          { label: 'Certificate Studio', href: '/studio' },
          { label: 'My Designs' },
        ]}
        action={
          <div className="flex items-center gap-2">
            <Link
              href="/studio/import"
              className="flex items-center gap-1.5 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs py-2.5 px-3.5 rounded-lg border border-slate-200 shadow-xs transition"
            >
              <Upload className="w-4 h-4 text-teal-600" />
              <span>Import Design</span>
            </Link>
            <Link
              href="/studio/new"
              className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2.5 px-4 rounded-lg shadow-xs transition"
            >
              <PlusCircle className="w-4 h-4" />
              <span>New Design</span>
            </Link>
          </div>
        }
      />

      {/* Filter, Search & View Bar */}
      <div className="space-y-4">
        {/* Category Pill Filters */}
        <div
          className="flex flex-wrap items-center gap-2 p-2 rounded-2xl border shadow-xs"
          style={{
            backgroundColor: 'var(--surface)',
            borderColor: 'var(--border)',
          }}
        >
          {[
            { id: 'ALL', label: 'All Designs' },
            { id: 'Custom', label: 'Custom' },
            { id: 'Imported', label: 'Imported' },
            { id: 'Smart Design', label: 'Smart-Generated' },
            { id: 'landscape', label: 'Landscape' },
            { id: 'portrait', label: 'Portrait' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id as FilterType)}
              className="py-2 px-3.5 rounded-xl text-xs font-bold transition"
              style={{
                backgroundColor: activeFilter === tab.id ? 'var(--primary)' : 'transparent',
                color: activeFilter === tab.id ? 'var(--text-inverse)' : 'var(--text-secondary)',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search, Sort & Grid Toggle */}
        <div
          className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3.5 rounded-2xl border shadow-xs"
          style={{
            backgroundColor: 'var(--surface)',
            borderColor: 'var(--border)',
          }}
        >
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--text-muted)' }} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by design name or description..."
              className="w-full rounded-xl pl-10 pr-4 py-2 text-xs border focus:outline-none transition"
              style={{
                backgroundColor: 'var(--surface-subtle)',
                borderColor: 'var(--border)',
                color: 'var(--text-primary)',
              }}
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 shrink-0" style={{ color: 'var(--text-muted)' }} />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortType)}
              className="text-xs rounded-xl px-3 py-2 border focus:outline-none transition"
              style={{
                backgroundColor: 'var(--surface-subtle)',
                borderColor: 'var(--border)',
                color: 'var(--text-primary)',
              }}
            >
              <option value="newest" style={{ backgroundColor: 'var(--surface)', color: 'var(--text-primary)' }}>Sort: Newly Updated</option>
              <option value="oldest" style={{ backgroundColor: 'var(--surface)', color: 'var(--text-primary)' }}>Sort: Oldest First</option>
              <option value="name" style={{ backgroundColor: 'var(--surface)', color: 'var(--text-primary)' }}>Sort: Alphabetical</option>
            </select>

            <div
              className="flex items-center border rounded-xl overflow-hidden p-0.5 ml-2"
              style={{
                backgroundColor: 'var(--surface-subtle)',
                borderColor: 'var(--border)',
              }}
            >
              <button
                onClick={() => setViewMode('grid')}
                className="p-1.5 rounded-lg transition"
                style={{
                  backgroundColor: viewMode === 'grid' ? 'var(--surface)' : 'transparent',
                  color: viewMode === 'grid' ? 'var(--primary)' : 'var(--text-muted)',
                }}
                title="Grid View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className="p-1.5 rounded-lg transition"
                style={{
                  backgroundColor: viewMode === 'list' ? 'var(--surface)' : 'transparent',
                  color: viewMode === 'list' ? 'var(--primary)' : 'var(--text-muted)',
                }}
                title="List View"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Designs Content */}
      {sortedDesigns.length > 0 ? (
        viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedDesigns.map((tmpl) => (
              <div
                key={tmpl.id}
                className="rounded-2xl p-5 space-y-4 border shadow-xs transition flex flex-col justify-between"
                style={{
                  backgroundColor: 'var(--surface)',
                  borderColor: 'var(--border)',
                }}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span
                      className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border"
                      style={{
                        backgroundColor: 'var(--primary-light)',
                        borderColor: 'var(--primary-border)',
                        color: 'var(--primary)',
                      }}
                    >
                      {tmpl.category}
                    </span>
                    <span className="text-[10px] uppercase font-mono" style={{ color: 'var(--text-muted)' }}>{tmpl.orientation}</span>
                  </div>

                  <h3 className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>{tmpl.name}</h3>
                  <p className="text-xs line-clamp-2" style={{ color: 'var(--text-secondary)' }}>{tmpl.description}</p>
                  <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                    {tmpl.elements.length} elements • Updated {new Date(tmpl.updatedAt).toLocaleDateString()}
                  </p>
                </div>

                {/* Grid Card Actions */}
                <div className="pt-3 space-y-2 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/studio/editor/${tmpl.id}`}
                      className="flex-1 flex items-center justify-center gap-1.5 text-white font-bold py-2 rounded-lg text-xs shadow-xs transition"
                      style={{ backgroundColor: 'var(--primary)' }}
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Open Editor</span>
                    </Link>

                    <Link
                      href={`/studio/preview/${tmpl.id}`}
                      className="p-2 rounded-lg border transition"
                      style={{
                        backgroundColor: 'var(--surface-subtle)',
                        borderColor: 'var(--border)',
                        color: 'var(--text-secondary)',
                      }}
                      title="Preview Sample"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>
                  </div>

                  <div className="flex items-center justify-between pt-1 text-xs">
                    <button
                      onClick={() => {
                        setRenameTarget(tmpl);
                        setNewNameInput(tmpl.name);
                      }}
                      className="font-semibold transition"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      Rename
                    </button>
                    <button onClick={() => handleDuplicate(tmpl.id)} className="font-semibold transition" style={{ color: 'var(--text-secondary)' }}>
                      Duplicate
                    </button>
                    <button onClick={() => handleExport(tmpl.id)} className="font-semibold transition" style={{ color: 'var(--text-secondary)' }}>
                      Export
                    </button>
                    <button
                      onClick={() => setDeleteTarget(tmpl)}
                      className="text-rose-400 hover:text-rose-300 font-semibold"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div
            className="rounded-2xl overflow-hidden border shadow-xs"
            style={{
              backgroundColor: 'var(--surface)',
              borderColor: 'var(--border)',
            }}
          >
            <table className="w-full text-left text-xs">
              <thead
                className="border-b text-[11px] font-bold uppercase tracking-wider"
                style={{
                  backgroundColor: 'var(--surface-subtle)',
                  borderColor: 'var(--border)',
                  color: 'var(--text-muted)',
                }}
              >
                <tr>
                  <th className="py-3 px-4">Design Name</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Orientation</th>
                  <th className="py-3 px-4">Last Updated</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: 'var(--border-subtle)' }}>
                {sortedDesigns.map((tmpl) => (
                  <tr
                    key={tmpl.id}
                    className="transition"
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--surface-hover)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    <td className="py-3 px-4 font-bold" style={{ color: 'var(--text-primary)' }}>{tmpl.name}</td>
                    <td className="py-3 px-4">
                      <span
                        className="text-[10px] font-bold px-2 py-0.5 rounded-full border"
                        style={{
                          backgroundColor: 'var(--primary-light)',
                          borderColor: 'var(--primary-border)',
                          color: 'var(--primary)',
                        }}
                      >
                        {tmpl.category}
                      </span>
                    </td>
                    <td className="py-3 px-4 uppercase font-mono" style={{ color: 'var(--text-muted)' }}>{tmpl.orientation}</td>
                    <td className="py-3 px-4" style={{ color: 'var(--text-muted)' }}>{new Date(tmpl.updatedAt).toLocaleDateString()}</td>
                    <td className="py-3 px-4 text-right space-x-2">
                      <Link
                        href={`/studio/editor/${tmpl.id}`}
                        className="inline-flex items-center gap-1 text-white font-bold py-1.5 px-3 rounded-lg text-xs"
                        style={{ backgroundColor: 'var(--primary)' }}
                      >
                        <Edit3 className="w-3 h-3" />
                        <span>Edit</span>
                      </Link>
                      <button
                        onClick={() => handleDuplicate(tmpl.id)}
                        className="p-1.5 rounded-lg border transition"
                        style={{
                          backgroundColor: 'var(--surface-subtle)',
                          borderColor: 'var(--border)',
                          color: 'var(--text-secondary)',
                        }}
                        title="Duplicate"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(tmpl)}
                        className="p-1.5 rounded-lg bg-rose-950/40 text-rose-300 hover:bg-rose-900/60 border border-rose-800/50"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      ) : (
        <div
          className="p-12 rounded-2xl text-center space-y-4 border shadow-xs"
          style={{
            backgroundColor: 'var(--surface)',
            borderColor: 'var(--border)',
          }}
        >
          <div
            className="w-12 h-12 rounded-xl border flex items-center justify-center mx-auto"
            style={{
              backgroundColor: 'var(--surface-subtle)',
              borderColor: 'var(--border)',
              color: 'var(--text-muted)',
            }}
          >
            <Palette className="w-6 h-6" />
          </div>
          <div className="space-y-1 max-w-sm mx-auto">
            <h3 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>No Studio Designs Found</h3>
            <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
              Create a custom certificate design from scratch or import a background layout from Canva or Figma.
            </p>
          </div>

          <div className="flex justify-center gap-3 pt-2">
            <Link
              href="/studio/import"
              className="bg-teal-600 hover:bg-teal-700 text-white font-bold py-2.5 px-4 rounded-lg text-xs"
            >
              Import Design
            </Link>
            <Link
              href="/studio/new"
              className="text-white font-bold py-2.5 px-4 rounded-lg text-xs"
              style={{ backgroundColor: 'var(--primary)' }}
            >
              Create Blank Design
            </Link>
          </div>
        </div>
      )}

      {/* Rename Modal */}
      {renameTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div
            className="rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4 border"
            style={{
              backgroundColor: 'var(--surface-elevated)',
              borderColor: 'var(--border-strong)',
            }}
          >
            <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: 'var(--border-subtle)' }}>
              <h3 className="font-bold text-base" style={{ color: 'var(--text-primary)' }}>Rename Design</h3>
              <button onClick={() => setRenameTarget(null)} className="text-slate-400 hover:text-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold" style={{ color: 'var(--text-secondary)' }}>Design Name</label>
              <input
                type="text"
                value={newNameInput}
                onChange={(e) => setNewNameInput(e.target.value)}
                className="w-full rounded-xl px-4 py-2.5 text-xs focus:outline-none border transition"
                style={{
                  backgroundColor: 'var(--surface-subtle)',
                  borderColor: 'var(--border)',
                  color: 'var(--text-primary)',
                }}
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setRenameTarget(null)}
                className="px-4 py-2 text-xs font-semibold rounded-lg border transition"
                style={{
                  backgroundColor: 'var(--surface-subtle)',
                  borderColor: 'var(--border)',
                  color: 'var(--text-secondary)',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmRename}
                className="px-4 py-2 text-xs font-bold text-white rounded-lg shadow-xs transition"
                style={{ backgroundColor: 'var(--primary)' }}
              >
                Save Name
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div
            className="rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4 border"
            style={{
              backgroundColor: 'var(--surface-elevated)',
              borderColor: 'var(--border-strong)',
            }}
          >
            <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: 'var(--border-subtle)' }}>
              <div className="flex items-center gap-2 text-rose-400">
                <AlertTriangle className="w-5 h-5" />
                <h3 className="font-bold text-base" style={{ color: 'var(--text-primary)' }}>Delete Studio Design</h3>
              </div>
              <button onClick={() => setDeleteTarget(null)} className="text-slate-400 hover:text-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
              Are you sure you want to delete <span className="font-bold" style={{ color: 'var(--text-primary)' }}>"{deleteTarget.name}"</span>?
              This action will remove the local design layout and stored image background.
            </p>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 text-xs font-semibold rounded-lg border transition"
                style={{
                  backgroundColor: 'var(--surface-subtle)',
                  borderColor: 'var(--border)',
                  color: 'var(--text-secondary)',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-xs transition"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
