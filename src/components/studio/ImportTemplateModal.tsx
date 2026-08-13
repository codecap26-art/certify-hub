// ============================================================================
// Import Organization Template Modal — Workflow 2
// Upload PNG/JPG/WebP/PDF -> ownership confirmation -> locked background setup
// ============================================================================

'use client';

import React, { useState } from 'react';
import { Upload, X, ShieldAlert, CheckSquare, Square, ArrowRight, FileCheck, Layers } from 'lucide-react';
import { createBlankDocument, createDynamicTextElement, createQrElement, createCertificateCodeElement, CertificateDocument } from '@/lib/editor/documentModel';
import { templateRepository } from '@/lib/storage/templateRepository';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onImportComplete: (doc: CertificateDocument) => void;
}

export const ImportTemplateModal: React.FC<Props> = ({ isOpen, onClose, onImportComplete }) => {
  const [file, setFile] = useState<File | null>(null);
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [orientation, setOrientation] = useState<'landscape' | 'portrait'>('landscape');
  const [hasSampleText, setHasSampleText] = useState(false);
  const [permissionConfirmed, setPermissionConfirmed] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const handleFileChange = (selectedFile: File) => {
    setFile(selectedFile);
    setTemplateName(selectedFile.name.replace(/\.[^/.]+$/, ''));

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setDataUrl(result);

      // Detect aspect ratio from image
      const img = new window.Image();
      img.src = result;
      img.onload = () => {
        if (img.height > img.width) setOrientation('portrait');
        else setOrientation('landscape');
      };
    };
    reader.readAsDataURL(selectedFile);
  };

  const handleImport = async () => {
    if (!dataUrl || !permissionConfirmed) return;
    setIsProcessing(true);

    try {
      const doc = createBlankDocument(templateName || 'Imported Template', orientation);
      doc.category = 'Imported';
      doc.isImported = true;
      doc.backgroundDataUrl = dataUrl;
      doc.backgroundLocked = true;

      // Add default recipient name and QR code over imported canvas
      const width = doc.width;
      const height = doc.height;

      // Layer recipient name field
      const recNameEl = createDynamicTextElement('{{recipient.name}}', width, height, 1);
      recNameEl.y = height / 2;
      doc.elements.push(recNameEl);

      // Add QR Code token
      doc.elements.push(createQrElement(width, height, 2));
      doc.elements.push(createCertificateCodeElement(width, height, 3));

      await templateRepository.save(doc as any);
      onImportComplete(doc);
      onClose();
    } catch (err) {
      console.error('Import failed:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Upload className="w-5 h-5 text-blue-600" />
            <h2 className="font-bold text-base text-slate-900">Import Organization Template</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4 text-xs">
          {/* Informational Disclaimer Box */}
          <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl text-amber-900 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-xs">
              <ShieldAlert className="w-4 h-4 text-amber-600" />
              <span>Important Raster Image Notice</span>
            </div>
            <p className="text-[11px] leading-relaxed text-amber-800">
              Text inside an uploaded JPG or PNG is part of the image and cannot be edited directly. For the best result, upload a blank design and place CertifyHub fields over the empty areas.
            </p>
          </div>

          {/* Upload Area */}
          {!dataUrl ? (
            <label className="w-full p-8 border-2 border-dashed border-slate-300 hover:border-blue-500 hover:bg-blue-50/30 rounded-2xl flex flex-col items-center justify-center gap-2 cursor-pointer transition text-center">
              <Upload className="w-8 h-8 text-blue-600" />
              <span className="font-bold text-sm text-slate-800">Browse PNG, JPG, WebP, or Single-Page PDF</span>
              <span className="text-[10px] text-slate-400">Export from Canva, Figma, PowerPoint, Photoshop or Illustrator</span>
              <input
                type="file"
                accept="image/png, image/jpeg, image/webp, application/pdf"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleFileChange(f);
                }}
                className="hidden"
              />
            </label>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-slate-50 border rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-9 bg-white border rounded overflow-hidden">
                    <img src={dataUrl} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <p className="font-bold text-xs text-slate-900 truncate max-w-[200px]">{file?.name}</p>
                    <p className="text-[10px] text-slate-400 uppercase font-semibold">{orientation} Orientation</p>
                  </div>
                </div>
                <button onClick={() => { setDataUrl(null); setFile(null); }} className="text-xs font-bold text-rose-600 hover:underline">
                  Change File
                </button>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Design Name</label>
                <input
                  type="text"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  className="w-full bg-slate-50 border rounded-lg p-2 text-xs font-semibold"
                />
              </div>

              {/* Sample text option */}
              <div className="p-3 bg-slate-50 border rounded-xl space-y-1.5">
                <p className="font-bold text-slate-800">Does this template already contain sample text?</p>
                <div className="flex gap-3">
                  <label className="flex items-center gap-1.5 cursor-pointer text-slate-700 font-medium">
                    <input
                      type="radio"
                      name="sampleText"
                      checked={!hasSampleText}
                      onChange={() => setHasSampleText(false)}
                    />
                    No, it is a blank background design
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer text-slate-700 font-medium">
                    <input
                      type="radio"
                      name="sampleText"
                      checked={hasSampleText}
                      onChange={() => setHasSampleText(true)}
                    />
                    Yes, contains sample text (adds masking tools)
                  </label>
                </div>
              </div>

              {/* Permission Confirmation Requirement */}
              <div className="p-3.5 bg-blue-50/60 border border-blue-200 rounded-xl space-y-2">
                <label className="flex items-start gap-2 cursor-pointer font-bold text-blue-900 text-xs">
                  <input
                    type="checkbox"
                    checked={permissionConfirmed}
                    onChange={(e) => setPermissionConfirmed(e.target.checked)}
                    className="mt-0.5 rounded text-blue-600 shrink-0"
                  />
                  <span>I confirm that I own this design or have permission to use it.</span>
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <button onClick={onClose} className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100">
            Cancel
          </button>
          <button
            onClick={handleImport}
            disabled={!dataUrl || !permissionConfirmed || isProcessing}
            className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition disabled:opacity-40"
          >
            <span>{isProcessing ? 'Importing...' : 'Lock Background & Edit'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
