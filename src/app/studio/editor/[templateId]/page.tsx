'use client';

import React, { useEffect, useState, use } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CustomTemplate } from '@/types/template';
import { templateRepository } from '@/lib/storage/templateRepository';
import { EditorContainer } from '@/components/editor/EditorContainer';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface Props {
  params: Promise<{ templateId: string }>;
}

export default function StudioEditorRoute({ params }: Props) {
  const { templateId } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const fromParam = searchParams.get('from');
  const eventId = searchParams.get('eventId');

  const [template, setTemplate] = useState<CustomTemplate | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadTemplate() {
      const tmpl = await templateRepository.getById(templateId);
      if (tmpl) {
        setTemplate(tmpl);
      } else {
        router.push('/studio');
      }
      setIsLoading(false);
    }
    loadTemplate();
  }, [templateId, router]);

  if (isLoading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-slate-100 space-y-3">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-bold text-slate-700">Loading Certificate Studio Editor Workspace...</p>
      </div>
    );
  }

  if (!template) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-slate-100 space-y-4">
        <p className="text-sm font-bold text-slate-800">Template not found.</p>
        <Link
          href="/studio"
          className="flex items-center gap-2 text-xs font-bold text-white bg-blue-600 px-4 py-2 rounded-xl"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Certificate Studio</span>
        </Link>
      </div>
    );
  }

  const handleExit = () => {
    if (fromParam === 'generate') {
      const url = eventId ? `/generate?eventId=${eventId}&templateId=${template.id}` : `/generate?templateId=${template.id}`;
      router.push(url);
    } else if (fromParam === 'templates') {
      router.push('/templates');
    } else {
      router.push('/studio');
    }
  };

  return (
    <EditorContainer
      initialTemplate={template}
      onExit={handleExit}
    />
  );
}
