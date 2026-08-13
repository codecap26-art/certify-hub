'use client';

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Building2, CheckCircle2, Save } from 'lucide-react';
import { organizationRepository } from '@/lib/storage/organizationRepository';
import { Organization } from '@/types';
import { PageHeader } from '@/components/ui/PageHeader';
import { FileUploader } from '@/components/ui/FileUploader';

const orgSchema = z.object({
  name: z.string().min(2, 'Organization name must be at least 2 characters'),
  type: z.string().min(2, 'Organization type is required'),
  address: z.string().min(5, 'Address is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(5, 'Phone number is required'),
  website: z.string().url('Invalid website URL').or(z.literal('')),
  signatoryName: z.string().min(2, 'Signatory name is required'),
  signatoryDesignation: z.string().min(2, 'Designation is required'),
  footerText: z.string().min(5, 'Footer text is required'),
});

type OrgFormData = z.infer<typeof orgSchema>;

export default function OrganizationPage() {
  const [logoDataUrl, setLogoDataUrl] = useState<string>('');
  const [signatureDataUrl, setSignatureDataUrl] = useState<string>('');
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<OrgFormData>({
    resolver: zodResolver(orgSchema),
  });

  useEffect(() => {
    const org = organizationRepository.get();
    setValue('name', org.name);
    setValue('type', org.type);
    setValue('address', org.address);
    setValue('email', org.email);
    setValue('phone', org.phone);
    setValue('website', org.website);
    setValue('signatoryName', org.signatoryName);
    setValue('signatoryDesignation', org.signatoryDesignation);
    setValue('footerText', org.footerText);

    if (org.logoDataUrl) setLogoDataUrl(org.logoDataUrl);
    if (org.signatureDataUrl) setSignatureDataUrl(org.signatureDataUrl);
  }, [setValue]);

  const onSubmit = (data: OrgFormData) => {
    const current = organizationRepository.get();
    const updated: Organization = {
      ...current,
      ...data,
      logoDataUrl,
      signatureDataUrl,
    };

    organizationRepository.save(updated);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 4000);
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <PageHeader
        title="Organization Profile & Branding"
        description="Configure your institution name, logo, authorized signatory signature, and default certificate disclaimers."
        icon={Building2}
        breadcrumbs={[{ label: 'Organization' }]}
      />

      {saveSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-2xl flex items-center gap-3 text-xs font-semibold">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>Organization profile updated successfully! All future generated certificates will utilize these updated credentials.</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Basic Information */}
        <div className="bg-white border border-slate-200 p-6 rounded-2xl space-y-5 shadow-xs">
          <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">Basic Information</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="org-name">
                Organization / College Name *
              </label>
              <input
                id="org-name"
                {...register('name')}
                className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-lg px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
              {errors.name && <p className="text-xs text-rose-600 mt-1">{errors.name.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="org-type">
                Organization Type *
              </label>
              <input
                id="org-type"
                {...register('type')}
                className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-lg px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                placeholder="e.g. College / University / Training Center"
              />
              {errors.type && <p className="text-xs text-rose-600 mt-1">{errors.type.message}</p>}
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="org-address">
                Full Address *
              </label>
              <input
                id="org-address"
                {...register('address')}
                className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-lg px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
              {errors.address && <p className="text-xs text-rose-600 mt-1">{errors.address.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="org-email">
                Contact Email *
              </label>
              <input
                id="org-email"
                type="email"
                {...register('email')}
                className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-lg px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
              {errors.email && <p className="text-xs text-rose-600 mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="org-phone">
                Phone Number *
              </label>
              <input
                id="org-phone"
                {...register('phone')}
                className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-lg px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
              {errors.phone && <p className="text-xs text-rose-600 mt-1">{errors.phone.message}</p>}
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="org-website">
                Website URL
              </label>
              <input
                id="org-website"
                {...register('website')}
                className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-lg px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                placeholder="https://abccollege.edu"
              />
              {errors.website && <p className="text-xs text-rose-600 mt-1">{errors.website.message}</p>}
            </div>
          </div>
        </div>

        {/* Drag and Drop Branding Asset Uploaders */}
        <div className="bg-white border border-slate-200 p-6 rounded-2xl space-y-6 shadow-xs">
          <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">Branding Assets</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FileUploader
              label="Organization Logo"
              accept="image/png, image/jpeg, image/webp"
              maxSizeMB={2}
              value={logoDataUrl}
              onChange={setLogoDataUrl}
              helperText="PNG, JPEG, or WebP format (Max 2MB)"
            />

            <FileUploader
              label="Authorized Signature Image"
              accept="image/png, image/jpeg, image/webp"
              maxSizeMB={2}
              value={signatureDataUrl}
              onChange={setSignatureDataUrl}
              helperText="PNG, JPEG, or WebP format (Max 2MB)"
            />
          </div>
        </div>

        {/* Signatory & Footer */}
        <div className="bg-white border border-slate-200 p-6 rounded-2xl space-y-5 shadow-xs">
          <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">Signatory & Certificate Footer</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="sig-name">
                Signatory Full Name *
              </label>
              <input
                id="sig-name"
                {...register('signatoryName')}
                className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-lg px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                placeholder="e.g. Dr. R. Sundaram"
              />
              {errors.signatoryName && <p className="text-xs text-rose-600 mt-1">{errors.signatoryName.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="sig-designation">
                Signatory Designation *
              </label>
              <input
                id="sig-designation"
                {...register('signatoryDesignation')}
                className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-lg px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                placeholder="e.g. Principal & Dean of Academics"
              />
              {errors.signatoryDesignation && <p className="text-xs text-rose-600 mt-1">{errors.signatoryDesignation.message}</p>}
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="footer-text">
                Default Certificate Footer Disclaimer *
              </label>
              <textarea
                id="footer-text"
                rows={2}
                {...register('footerText')}
                className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-lg px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
              {errors.footerText && <p className="text-xs text-rose-600 mt-1">{errors.footerText.message}</p>}
            </div>
          </div>
        </div>

        {/* Submit Action */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg shadow-sm transition text-sm disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>Save Organization Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
}
