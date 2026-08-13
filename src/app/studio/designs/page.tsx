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
        <div className="flex flex-wrap items-center gap-2 bg-white border border-slate-200 p-2 rounded-2xl shadow-xs">
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
              className={`py-2 px-3.5 rounded-xl text-xs font-bold transition ${
                activeFilter === tab.id
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search, Sort & Grid Toggle */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white border border-slate-200 p-3.5 rounded-2xl shadow-xs">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by design name or description..."
              className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-800 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortType)}
              className="bg-slate-50 border border-slate-200 text-xs text-slate-700 rounded-xl px-3 py-2 focus:outline-none"
            >
              <option value="newest">Sort: Newly Updated</option>
              <option value="oldest">Sort: Oldest First</option>
              <option value="name">Sort: Alphabetical</option>
            </select>

            <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden bg-slate-50 p-0.5 ml-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition ${
                  viewMode === 'grid' ? 'bg-white shadow-xs text-blue-600 font-bold' : 'text-slate-500'
                }`}
                title="Grid View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-lg transition ${
                  viewMode === 'list' ? 'bg-white shadow-xs text-blue-600 font-bold' : 'text-slate-500'
                }`}
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
                className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-xs hover:border-slate-300 transition flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded-full">
                      {tmpl.category}
                    </span>
                    <span className="text-[10px] text-slate-400 uppercase font-mono">{tmpl.orientation}</span>
                  </div>

                  <h3 className="font-bold text-sm text-slate-900">{tmpl.name}</h3>
                  <p className="text-xs text-slate-600 line-clamp-2">{tmpl.description}</p>
                  <p className="text-[10px] text-slate-400">
                    {tmpl.elements.length} elements • Updated {new Date(tmpl.updatedAt).toLocaleDateString()}
                  </p>
                </div>

                {/* Grid Card Actions */}
                <div className="border-t border-slate-100 pt-3 space-y-2">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/studio/editor/${tmpl.id}`}
                      className="flex-1 flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-lg text-xs shadow-xs transition"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Open Editor</span>
                    </Link>

                    <Link
                      href={`/studio/preview/${tmpl.id}`}
                      className="p-2 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200"
                      title="Preview Sample"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>
                  </div>

                  <div className="flex items-center justify-between pt-1 text-xs text-slate-500">
                    <button
                      onClick={() => {
                        setRenameTarget(tmpl);
                        setNewNameInput(tmpl.name);
                      }}
                      className="hover:text-slate-900 font-semibold"
                    >
                      Rename
                    </button>
                    <button onClick={() => handleDuplicate(tmpl.id)} className="hover:text-slate-900 font-semibold">
                      Duplicate
                    </button>
                    <button onClick={() => handleExport(tmpl.id)} className="hover:text-slate-900 font-semibold">
                      Export
                    </button>
                    <button
                      onClick={() => setDeleteTarget(tmpl)}
                      className="text-rose-600 hover:text-rose-700 font-semibold"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="py-3 px-4">Design Name</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Orientation</th>
                  <th className="py-3 px-4">Last Updated</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sortedDesigns.map((tmpl) => (
                  <tr key={tmpl.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 px-4 font-bold text-slate-900">{tmpl.name}</td>
                    <td className="py-3 px-4">
                      <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
                        {tmpl.category}
                      </span>
                    </td>
                    <td className="py-3 px-4 uppercase font-mono text-slate-500">{tmpl.orientation}</td>
                    <td className="py-3 px-4 text-slate-500">{new Date(tmpl.updatedAt).toLocaleDateString()}</td>
                    <td className="py-3 px-4 text-right space-x-2">
                      <Link
                        href={`/studio/editor/${tmpl.id}`}
                        className="inline-flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-1.5 px-3 rounded-lg text-xs"
                      >
                        <Edit3 className="w-3 h-3" />
                        <span>Edit</span>
                      </Link>
                      <button
                        onClick={() => handleDuplicate(tmpl.id)}
                        className="p-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200"
                        title="Duplicate"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(tmpl)}
                        className="p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100"
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
        <div className="bg-white border border-slate-200 p-12 rounded-2xl text-center space-y-4 shadow-xs">
          <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 text-slate-500 flex items-center justify-center mx-auto">
            <Palette className="w-6 h-6" />
          </div>
          <div className="space-y-1 max-w-sm mx-auto">
            <h3 className="text-base font-bold text-slate-900">No Studio Designs Found</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
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
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-4 rounded-lg text-xs"
            >
              Create Blank Design
            </Link>
          </div>
        </div>
      )}

      {/* Rename Modal */}
      {renameTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-base text-slate-900">Rename Design</h3>
              <button onClick={() => setRenameTarget(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-800">Design Name</label>
              <input
                type="text"
                value={newNameInput}
                onChange={(e) => setNewNameInput(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setRenameTarget(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg border border-slate-200"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmRename}
                className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs"
              >
                Save Name
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-rose-600">
                <AlertTriangle className="w-5 h-5" />
                <h3 className="font-bold text-base text-slate-900">Delete Studio Design</h3>
              </div>
              <button onClick={() => setDeleteTarget(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to delete <span className="font-bold text-slate-900">"{deleteTarget.name}"</span>?
              This action will remove the local design layout and stored image background.
            </p>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg border border-slate-200"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-xs"
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
