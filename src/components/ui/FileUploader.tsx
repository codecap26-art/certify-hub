'use client';

import React, { useState } from 'react';
import { Upload, AlertCircle, X, ImageIcon } from 'lucide-react';
import { compressImageDataUrl } from '@/lib/utils/imageCompressor';

interface Props {
  accept: string;
  maxSizeMB?: number;
  value?: string;
  onChange: (dataUrl: string) => void;
  label: string;
  helperText?: string;
}

export const FileUploader: React.FC<Props> = ({
  accept,
  maxSizeMB = 2,
  value,
  onChange,
  label,
  helperText,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState('');

  const processFile = async (file: File) => {
    setError('');
    const maxSizeBytes = maxSizeMB * 1024 * 1024;

    if (file.size > maxSizeBytes) {
      setError(`File exceeds ${maxSizeMB}MB size limit.`);
      return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
      const rawResult = reader.result as string;
      if (file.type.startsWith('image/')) {
        const compressed = await compressImageDataUrl(rawResult, 300, 300, 0.75);
        onChange(compressed);
      } else {
        onChange(rawResult);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  return (
    <div className="space-y-2">
      <label
        className="block text-xs font-semibold"
        style={{ color: 'var(--text-secondary)' }}
      >
        {label}
      </label>

      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className="relative rounded-xl border-2 border-dashed transition-all min-h-[160px] flex flex-col items-center justify-center text-center p-5 space-y-3"
        style={{
          borderColor: isDragging
            ? 'var(--primary)'
            : error
            ? 'var(--error)'
            : value
            ? 'var(--border-strong)'
            : 'var(--border)',
          backgroundColor: isDragging
            ? 'var(--primary-light)'
            : value
            ? 'var(--surface)'
            : 'var(--surface-subtle)',
        }}
      >
        {value ? (
          <div className="flex flex-col items-center gap-3">
            {/* Preview image */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={value}
              alt="Upload Preview"
              className="h-20 w-auto object-contain rounded-lg border"
              style={{ borderColor: 'var(--border)' }}
            />
            <div className="flex items-center gap-3">
              <label
                className="cursor-pointer text-xs font-semibold transition-colors flex items-center gap-1"
                style={{ color: 'var(--primary)' }}
                onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--primary-hover)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--primary)'; }}
              >
                <ImageIcon className="w-3 h-3" />
                <span>Replace</span>
                <input
                  type="file"
                  accept={accept}
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) processFile(f);
                  }}
                  className="hidden"
                />
              </label>
              <span style={{ color: 'var(--border-strong)' }}>·</span>
              <button
                type="button"
                onClick={() => onChange('')}
                className="text-xs font-semibold transition-colors flex items-center gap-1"
                style={{ color: 'var(--error-text)' }}
                onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--error)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--error-text)'; }}
              >
                <X className="w-3 h-3" />
                <span>Remove</span>
              </button>
            </div>
          </div>
        ) : (
          <>
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center border"
              style={{
                backgroundColor: isDragging ? 'var(--primary-light)' : 'var(--surface)',
                borderColor: isDragging ? 'var(--primary-border)' : 'var(--border)',
                color: isDragging ? 'var(--primary)' : 'var(--text-muted)',
              }}
            >
              <Upload className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <p className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>
                Drag & drop or{' '}
                <label
                  className="cursor-pointer font-bold transition-colors"
                  style={{ color: 'var(--primary)' }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--primary-hover)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--primary)'; }}
                >
                  browse file
                  <input
                    type="file"
                    accept={accept}
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) processFile(f);
                    }}
                    className="hidden"
                  />
                </label>
              </p>
              {helperText && (
                <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                  {helperText}
                </p>
              )}
            </div>
          </>
        )}
      </div>

      {error && (
        <p className="text-xs flex items-center gap-1.5" style={{ color: 'var(--error-text)' }}>
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{error}</span>
        </p>
      )}
    </div>
  );
};
