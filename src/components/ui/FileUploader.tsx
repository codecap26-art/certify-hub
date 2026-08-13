'use client';

import React, { useState } from 'react';
import { Upload, AlertCircle } from 'lucide-react';
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
      <label className="block text-xs font-semibold text-slate-700">{label}</label>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center text-center space-y-3 min-h-[160px] transition ${
          isDragging
            ? 'border-blue-500 bg-blue-50'
            : value
            ? 'border-slate-300 bg-white'
            : 'border-slate-300 hover:border-blue-400 bg-slate-50'
        }`}
      >
        {value ? (
          <div className="relative group flex flex-col items-center space-y-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={value} alt="Upload Preview" className="h-24 w-auto object-contain rounded-lg border border-slate-200 shadow-xs" />
            <div className="flex items-center gap-2">
              <label className="cursor-pointer text-[11px] font-semibold text-blue-600 hover:text-blue-700 underline">
                <span>Replace File</span>
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
              <button
                type="button"
                onClick={() => onChange('')}
                className="text-[11px] font-semibold text-rose-600 hover:text-rose-700 underline"
              >
                Remove
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="w-10 h-10 rounded-full bg-slate-200/80 flex items-center justify-center text-slate-600">
              <Upload className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <p className="text-xs font-semibold text-slate-700">
                Drag & drop or{' '}
                <label className="text-blue-600 hover:underline cursor-pointer font-bold">
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
              {helperText && <p className="text-[11px] text-slate-500">{helperText}</p>}
            </div>
          </>
        )}
      </div>

      {error && (
        <p className="text-xs text-rose-600 flex items-center gap-1">
          <AlertCircle className="w-3.5 h-3.5" />
          <span>{error}</span>
        </p>
      )}
    </div>
  );
};
