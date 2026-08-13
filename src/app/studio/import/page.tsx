'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Upload,
  ArrowLeft,
  FileImage,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Info,
  RefreshCw,
  Trash2,
  FileText,
} from 'lucide-react';
import { CustomTemplate, Orientation, TemplateElement } from '@/types/template';
import { templateRepository } from '@/lib/storage/templateRepository';
import { PageHeader } from '@/components/ui/PageHeader';

export default function ImportDesignPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [designName, setDesignName] = useState('Imported Canva Design');
  const [description, setDescription] = useState('Certificate template imported from Canva / Figma design export');

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [fileSize, setFileSize] = useState<string>('');
  const [orientation, setOrientation] = useState<Orientation>('landscape');
  const [imageWidth, setImageWidth] = useState<number>(842);
  const [imageHeight, setImageHeight] = useState<number>(595);

  const [isDragOver, setIsDragOver] = useState(false);
  const [permissionConfirmed, setPermissionConfirmed] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const processFile = (file: File) => {
    setErrorMessage(null);

    // Validate size (10 MB max)
    if (file.size > 10 * 1024 * 1024) {
      setErrorMessage('File size exceeds the 10 MB limit. Please upload a smaller image file.');
      return;
    }

    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'application/pdf'];
    if (!validTypes.includes(file.type) && !file.name.endsWith('.pdf')) {
      setErrorMessage('Invalid file format. Only PNG, JPG, WebP, and single-page PDF files are supported.');
      return;
    }

    setFileName(file.name);
    setFileSize(`${(file.size / 1024).toFixed(1)} KB`);

    if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
      // PDF placeholder preview fallback
      setPreviewUrl('/placeholder-pdf.png');
      setOrientation('landscape');
      setImageWidth(842);
      setImageHeight(595);
      return;
    }

    // Read image as Data URL
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setPreviewUrl(dataUrl);

      // Auto orientation detection via HTML Image element
      const img = new Image();
      img.onload = () => {
        const isLandscape = img.width >= img.height;
        setOrientation(isLandscape ? 'landscape' : 'portrait');
        setImageWidth(isLandscape ? 842 : 595);
        setImageHeight(isLandscape ? 595 : 842);
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleSaveAndOpen = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!previewUrl) {
      setErrorMessage('Please upload a valid background image or PDF design first.');
      return;
    }
    if (!permissionConfirmed) {
      setErrorMessage('You must confirm ownership or permission before proceeding.');
      return;
    }

    setIsProcessing(true);

    const isLandscape = orientation === 'landscape';
    const width = isLandscape ? 842 : 595;
    const height = isLandscape ? 595 : 842;

    const initialElements: TemplateElement[] = [
      // Recipient Name Field positioned over center
      {
        id: 'el-imp-rec-name',
        type: 'dynamic-text',
        name: 'Recipient Name Overlay',
        x: width / 2 - 250,
        y: height / 2 - 25,
        width: 500,
        height: 50,
        rotation: 0,
        zIndex: 1,
        visible: true,
        locked: false,
        opacity: 1,
        dynamicBinding: '{{recipient.name}}',
        textStyle: {
          fontSize: 32,
          fontFamily: 'Helvetica',
          fontWeight: 'bold',
          fontStyle: 'normal',
          fill: '#0F172A',
          align: 'center',
        },
      },
      // Event Name Field
      {
        id: 'el-imp-event-name',
        type: 'dynamic-text',
        name: 'Event Name Overlay',
        x: width / 2 - 250,
        y: height / 2 + 35,
        width: 500,
        height: 35,
        rotation: 0,
        zIndex: 2,
        visible: true,
        locked: false,
        opacity: 1,
        dynamicBinding: '{{event.name}}',
        textStyle: {
          fontSize: 16,
          fontFamily: 'Helvetica',
          fontWeight: 'normal',
          fontStyle: 'normal',
          fill: '#334155',
          align: 'center',
        },
      },
      // QR Code Field positioned bottom right
      {
        id: 'el-imp-qr',
        type: 'qr',
        name: 'Verification QR Code Overlay',
        x: width - 130,
        y: height - 130,
        width: 80,
        height: 80,
        rotation: 0,
        zIndex: 3,
        visible: true,
        locked: false,
        opacity: 1,
        qrStyle: {
          size: 80,
          fgColor: '#0F172A',
          bgColor: '#FFFFFF',
          displayCodeLabel: true,
        },
      },
    ];

    const newTemplate: CustomTemplate = {
      id: `tmpl-imp-${Date.now()}`,
      name: designName || 'Imported Design',
      description,
      category: 'Imported',
      orientation,
      width,
      height,
      backgroundColor: '#FFFFFF',
      backgroundDataUrl: previewUrl,
      isImported: true,
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      elements: initialElements,
    };

    await templateRepository.save(newTemplate);
    router.push(`/studio/editor/${newTemplate.id}`);
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <PageHeader
        title="Import Canva / Figma Design"
        description="Upload a blank certificate background image exported from Canva, Figma, Photoshop, or PDF."
        icon={Upload}
        breadcrumbs={[
          { label: 'Certificate Studio', href: '/studio' },
          { label: 'Import Design' },
        ]}
      />

      {/* Helpful Instructions Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 space-y-3">
        <div className="flex items-center gap-2 text-blue-900 font-bold text-xs">
          <Info className="w-4 h-4 text-blue-600 shrink-0" />
          <span>Best Practices for Importing Canva or Figma Designs</span>
        </div>
        <p className="text-xs text-blue-800 leading-relaxed">
          For the best result, remove sample names, registration numbers, dates and QR codes before exporting from
          Canva or Figma. Keep the background, border, decorations and fixed titles.
        </p>
        <p className="text-[11px] text-blue-700 leading-relaxed italic">
          Text already inside an uploaded image is part of the image and cannot be edited directly. You can add
          dynamic fields over blank areas or cover sample text with a masking shape inside the Studio editor.
        </p>
      </div>

      <form onSubmit={handleSaveAndOpen} className="space-y-8">
        {/* Upload Drop Zone */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-6 shadow-xs">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100 pb-3">
            1. Select or Drop Design File
          </h2>

          {!previewUrl ? (
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragOver(true);
              }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition space-y-4 ${
                isDragOver
                  ? 'border-blue-500 bg-blue-50/70'
                  : 'border-slate-300 hover:border-slate-400 bg-slate-50/50'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png, image/jpeg, image/jpg, image/webp, application/pdf"
                onChange={handleFileChange}
                className="hidden"
              />

              <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200 text-teal-600 flex items-center justify-center mx-auto shadow-xs">
                <Upload className="w-7 h-7" />
              </div>

              <div className="space-y-1">
                <p className="font-bold text-sm text-slate-900">
                  Click to choose file or drag and drop here
                </p>
                <p className="text-xs text-slate-500">
                  Supported formats: PNG, JPG, JPEG, WebP, single-page PDF (Max 10 MB)
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-slate-50 border border-slate-200 p-4 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center shrink-0">
                    <FileImage className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-bold text-xs text-slate-900">{fileName}</p>
                    <p className="text-[11px] text-slate-500">
                      {fileSize} • Auto-detected Orientation: <span className="font-bold uppercase text-teal-700">{orientation}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-1 bg-white hover:bg-slate-100 text-slate-700 font-semibold text-xs py-1.5 px-3 rounded-lg border border-slate-200 transition"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Replace</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setPreviewUrl(null);
                      setFileName('');
                    }}
                    className="p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200"
                    title="Remove File"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Live Preview Box */}
              <div className="bg-slate-100 p-4 rounded-xl border border-slate-200 text-center">
                <p className="text-[11px] font-bold text-slate-500 mb-2 uppercase tracking-wider">
                  Imported Design Background Preview
                </p>
                <div className="max-h-72 flex justify-center items-center overflow-hidden rounded-lg border border-slate-300 bg-white p-2">
                  <img
                    src={previewUrl}
                    alt="Imported preview"
                    className="max-h-64 object-contain shadow-xs rounded"
                  />
                </div>
              </div>
            </div>
          )}

          {errorMessage && (
            <div className="flex items-center gap-2 text-xs text-rose-600 bg-rose-50 border border-rose-200 p-3 rounded-xl">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}
        </div>

        {/* Step 2: Design Details & Permissions */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-6 shadow-xs">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100 pb-3">
            2. Design Details & Ownership Confirmation
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-800">
                Design Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={designName}
                onChange={(e) => setDesignName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-800">Description</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none"
              />
            </div>
          </div>

          {/* Ownership Checkbox */}
          <div className="pt-2">
            <label className="flex items-start gap-3 cursor-pointer bg-slate-50 border border-slate-200 p-4 rounded-xl hover:bg-slate-100/80 transition">
              <input
                type="checkbox"
                checked={permissionConfirmed}
                onChange={(e) => setPermissionConfirmed(e.target.checked)}
                className="mt-0.5 w-4 h-4 text-blue-600 rounded focus:ring-blue-500 border-slate-300"
              />
              <span className="text-xs text-slate-700 leading-relaxed font-semibold">
                I confirm that I own this design or have permission to use it.
              </span>
            </label>
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex items-center justify-between pt-2">
          <Link
            href="/studio"
            className="flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Certificate Studio</span>
          </Link>

          <button
            type="submit"
            disabled={!previewUrl || !permissionConfirmed || isProcessing}
            className={`flex items-center gap-2 font-bold text-xs py-3 px-6 rounded-xl shadow-md transition ${
              previewUrl && permissionConfirmed && !isProcessing
                ? 'bg-teal-600 hover:bg-teal-700 text-white cursor-pointer'
                : 'bg-slate-300 text-slate-500 cursor-not-allowed'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Save & Open Certificate Studio</span>
          </button>
        </div>
      </form>
    </div>
  );
}
