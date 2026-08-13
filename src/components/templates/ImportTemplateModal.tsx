'use client';

import React, { useState } from 'react';
import {
  Upload,
  X,
  ShieldAlert,
  CheckCircle2,
  FileSpreadsheet,
  Layers,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Info,
} from 'lucide-react';
import { CustomTemplate, Orientation, TemplateElement } from '@/types/template';
import { templateRepository } from '@/lib/storage/templateRepository';
import * as pdfjsLib from 'pdfjs-dist';

// Configure PDF.js worker
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccessOpenEditor: (template: CustomTemplate) => void;
}

export const ImportTemplateModal: React.FC<Props> = ({ isOpen, onClose, onSuccessOpenEditor }) => {
  const [step, setStep] = useState<number>(1);

  // File Uploaded Data
  const [backgroundDataUrl, setBackgroundDataUrl] = useState<string>('');
  const [fileName, setFileName] = useState<string>('');
  const [fileType, setFileType] = useState<string>('');
  const [orientation, setOrientation] = useState<Orientation>('landscape');
  const [copyrightConfirmed, setCopyrightConfirmed] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  // Metadata
  const [templateName, setTemplateName] = useState<string>('Canva Imported Design');
  const [category, setCategory] = useState<string>('Imported');

  if (!isOpen) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setError('');
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setFileType(file.type);

    if (file.type === 'application/pdf') {
      try {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        if (pdf.numPages > 1) {
          setError(`Notice: This PDF has ${pdf.numPages} pages. Page 1 will be used as the certificate background.`);
        }
        const page = await pdf.getPage(1);
        const viewport = page.getViewport({ scale: 2.0 });

        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = viewport.width;
        canvas.height = viewport.height;

        if (context) {
          // @ts-ignore
          await page.render({ canvasContext: context, viewport, canvas }).promise;
          const dataUrl = canvas.toDataURL('image/png');
          setBackgroundDataUrl(dataUrl);

          // Detect Orientation from PDF Aspect Ratio
          if (viewport.width >= viewport.height) {
            setOrientation('landscape');
          } else {
            setOrientation('portrait');
          }
        }
      } catch (err) {
        console.error(err);
        setError('Failed to render PDF page. Please upload a valid single-page PDF or PNG image.');
      }
    } else if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        setBackgroundDataUrl(dataUrl);

        // Detect Image Orientation
        const img = new Image();
        img.src = dataUrl;
        img.onload = () => {
          if (img.width >= img.height) {
            setOrientation('landscape');
          } else {
            setOrientation('portrait');
          }
        };
      };
      reader.readAsDataURL(file);
    } else {
      setError('Unsupported file type. Please upload PNG, JPG, WebP, or single-page PDF.');
    }
  };

  const handleCompleteImport = async () => {
    if (!copyrightConfirmed) {
      setError('You must confirm ownership or license permission to save this design.');
      return;
    }

    const width = orientation === 'landscape' ? 842 : 595;
    const height = orientation === 'landscape' ? 595 : 842;
    const centerX = width / 2;

    const newTemplate: CustomTemplate = {
      id: `tmpl-imp-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: templateName.trim() || 'Imported Design',
      description: 'Imported certificate design background',
      category: 'Imported',
      orientation,
      width,
      height,
      backgroundDataUrl,
      backgroundColor: '#FFFFFF',
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isBuiltIn: false,
      isImported: true,
      elements: [
        // Default Dynamic Recipient Name Field positioned over imported background
        {
          id: 'elem-imp-rec-name',
          type: 'dynamic-text',
          name: 'Recipient Name',
          x: centerX - 250,
          y: height / 2 - 20,
          width: 500,
          height: 45,
          rotation: 0,
          zIndex: 1,
          visible: true,
          locked: false,
          opacity: 1,
          dynamicBinding: '{{recipient.name}}',
          textStyle: {
            fontSize: 32,
            fontFamily: 'Georgia',
            fontWeight: 'bold',
            fontStyle: 'normal',
            fill: '#0F172A',
            align: 'center',
          },
        },
        // QR Code
        {
          id: 'elem-imp-qr',
          type: 'qr',
          name: 'Verification QR Code',
          x: width - 110,
          y: height - 110,
          width: 80,
          height: 80,
          rotation: 0,
          zIndex: 2,
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
      ],
    };

    await templateRepository.save(newTemplate);
    onSuccessOpenEditor(newTemplate);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 p-6 rounded-2xl max-w-2xl w-full space-y-6 shadow-xl max-h-[90vh] overflow-y-auto text-slate-800 text-xs">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-teal-50 border border-teal-200 text-teal-600 flex items-center justify-center">
              <Upload className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900">Import Certificate Design (Canva / Figma)</h3>
              <p className="text-[11px] text-slate-500">Step {step} of 3: Upload background & confirm ownership</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Section 4 Explanation Banner */}
        <div className="bg-blue-50 border border-blue-200 p-3.5 rounded-xl text-blue-900 text-xs space-y-1">
          <p className="font-bold flex items-center gap-1.5">
            <Info className="w-4 h-4 text-blue-600 shrink-0" />
            <span>How Imported Blank Backgrounds Work:</span>
          </p>
          <ul className="list-disc list-inside text-[11px] text-blue-800 space-y-0.5 pt-0.5">
            <li>Uploaded PNG/JPG files act as flat canvas background graphics.</li>
            <li>Existing text embedded inside images cannot be edited directly.</li>
            <li>We recommend exporting a <strong>blank certificate background</strong> from Canva without the sample student name.</li>
            <li>If your template has old sample text, use our <strong>White Masking Box tool</strong> in the canvas editor to cover it.</li>
          </ul>
        </div>

        {/* STEP 1: Upload File & Copyright Confirmation */}
        {step === 1 && (
          <div className="space-y-5">
            <label className="block text-xs font-semibold text-slate-700">Select Blank Certificate Design File *</label>
            <div className="border-2 border-dashed border-slate-300 rounded-2xl p-6 text-center space-y-3 bg-slate-50 hover:border-blue-400 transition">
              {backgroundDataUrl ? (
                <div className="space-y-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={backgroundDataUrl} alt="Import Preview" className="h-40 mx-auto rounded-lg border border-slate-200 shadow-xs object-contain" />
                  <p className="font-semibold text-slate-800">{fileName} ({fileType})</p>
                  <button
                    onClick={() => {
                      setBackgroundDataUrl('');
                      setFileName('');
                    }}
                    className="text-xs text-rose-600 hover:underline font-semibold"
                  >
                    Replace Image
                  </button>
                </div>
              ) : (
                <>
                  <Upload className="w-8 h-8 text-blue-600 mx-auto" />
                  <div>
                    <p className="font-bold text-slate-900">Drag & drop or browse design file</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">Supports PNG, JPG, WebP, single-page PDF (Max 10MB)</p>
                  </div>
                  <label className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-5 rounded-lg cursor-pointer transition">
                    <span>Choose Design File</span>
                    <input
                      type="file"
                      accept="image/png, image/jpeg, image/webp, application/pdf"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                </>
              )}
            </div>

            {/* Orientation Detection Option */}
            {backgroundDataUrl && (
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-700">Detected Canvas Orientation</label>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 font-semibold text-slate-800 cursor-pointer">
                    <input
                      type="radio"
                      name="orientation"
                      value="landscape"
                      checked={orientation === 'landscape'}
                      onChange={() => setOrientation('landscape')}
                      className="text-blue-600"
                    />
                    <span>A4 Landscape (842 × 595 pt)</span>
                  </label>
                  <label className="flex items-center gap-2 font-semibold text-slate-800 cursor-pointer">
                    <input
                      type="radio"
                      name="orientation"
                      value="portrait"
                      checked={orientation === 'portrait'}
                      onChange={() => setOrientation('portrait')}
                      className="text-blue-600"
                    />
                    <span>A4 Portrait (595 × 842 pt)</span>
                  </label>
                </div>
              </div>
            )}

            {/* Copyright Confirmation Checkbox */}
            <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl space-y-2">
              <div className="flex items-start gap-2.5">
                <input
                  type="checkbox"
                  id="copyright-chk"
                  checked={copyrightConfirmed}
                  onChange={(e) => setCopyrightConfirmed(e.target.checked)}
                  className="mt-0.5 rounded border-amber-400 text-amber-600 focus:ring-amber-500/20"
                />
                <label htmlFor="copyright-chk" className="font-bold text-amber-900 cursor-pointer">
                  I confirm that I own this design or have permission to use it.
                </label>
              </div>
              <p className="text-[10px] text-amber-700 pl-6">
                You must possess lawful authorization or ownership rights to utilize imported branding graphics.
              </p>
            </div>

            {error && <p className="text-xs text-rose-600 font-semibold">{error}</p>}
          </div>
        )}

        {/* STEP 2: Configure Template Name & Category */}
        {step === 2 && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Custom Template Name *</label>
              <input
                type="text"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 font-bold text-slate-900 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Category Badge</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-900"
              >
                <option value="Imported">Imported (Canva / Figma)</option>
                <option value="Custom">Custom Organizational</option>
                <option value="Built-in">Academic Program</option>
              </select>
            </div>
          </div>
        )}

        {/* Modal Controls */}
        <div className="flex items-center justify-between border-t border-slate-100 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200"
          >
            Cancel
          </button>

          <div className="flex items-center gap-2">
            {step === 1 ? (
              <button
                type="button"
                disabled={!backgroundDataUrl || !copyrightConfirmed}
                onClick={() => setStep(2)}
                className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-5 rounded-lg shadow-xs transition disabled:opacity-40"
              >
                <span>Continue to Configure</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleCompleteImport}
                className="flex items-center gap-1.5 bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 px-6 rounded-lg shadow-xs transition"
              >
                <Sparkles className="w-4 h-4" />
                <span>Save & Open Visual Editor</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
