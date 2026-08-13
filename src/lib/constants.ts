import { CertificateTemplate } from '@/types';

export const APP_NAME = 'CertifyHub';
export const STORAGE_PREFIX = 'certifyhub:v1:';

export const TEMPLATES: CertificateTemplate[] = [
  {
    id: 'modern-blue',
    name: 'Modern Blue',
    description: 'Sleek, vibrant professional design with rich blue accents and clean typography.',
    theme: {
      primary: '#2563EB',
      secondary: '#0F172A',
      accent: '#14B8A6',
      cardBg: '#F8FAFC',
    },
  },
  {
    id: 'classic-gold',
    name: 'Classic Gold',
    description: 'Traditional academic elegance featuring gold filigree borders and deep royal styling.',
    theme: {
      primary: '#D97706',
      secondary: '#1E293B',
      accent: '#B45309',
      cardBg: '#FFFBEB',
    },
  },
  {
    id: 'minimal-green',
    name: 'Minimal Green',
    description: 'Clean contemporary aesthetic with emerald borders and refined corporate layout.',
    theme: {
      primary: '#059669',
      secondary: '#111827',
      accent: '#10B981',
      cardBg: '#ECFDF5',
    },
  },
  {
    id: 'academic-maroon',
    name: 'Academic Maroon',
    description: 'Formal collegiate heritage style with deep burgundy accents and seal frame.',
    theme: {
      primary: '#9F1239',
      secondary: '#18181B',
      accent: '#BE123C',
      cardBg: '#FFF1F2',
    },
  },
];
