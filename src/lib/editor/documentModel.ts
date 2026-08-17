// ============================================================================
// CertifyHub Certificate Studio — Document Model & Extended Types
// Normalized document model serving as single source of truth for:
// canvas rendering, saving, loading, undo/redo, preview, duplication,
// template export, and PDF generation.
// ============================================================================

// ---------------------------------------------------------------------------
// Element Types
// ---------------------------------------------------------------------------
export type ElementType =
  | 'text'
  | 'dynamic-text'
  | 'image'
  | 'logo'
  | 'signature'
  | 'shape'
  | 'line'
  | 'border'
  | 'qr'
  | 'certificate-code'
  | 'group'
  | 'mask'
  | 'ornament';

export type ShapeVariant =
  | 'rectangle'
  | 'rounded-rectangle'
  | 'circle'
  | 'ellipse'
  | 'triangle'
  | 'polygon'
  | 'star'
  | 'line'
  | 'arrow'
  | 'diamond'
  | 'heart'
  | 'badge'
  | 'ribbon'
  | 'seal'
  | 'medal'
  | 'hexagon'
  | 'octagon';

export type ImageMaskVariant =
  | 'none'
  | 'circle'
  | 'rounded'
  | 'square'
  | 'hexagon'
  | 'badge'
  | 'star'
  | 'seal';

export type CornerOrnamentStyle =
  | 'classic'
  | 'luxury'
  | 'minimal'
  | 'geometric'
  | 'academic'
  | 'corporate'
  | 'ornamental';

export type DynamicBindingKey =
  | '{{recipient.name}}'
  | '{{recipient.email}}'
  | '{{recipient.registrationNumber}}'
  | '{{recipient.department}}'
  | '{{recipient.course}}'
  | '{{recipient.achievement}}'
  | '{{recipient.rank}}'
  | '{{recipient.role}}'
  | '{{recipient.category}}'
  | '{{recipient.score}}'
  | '{{organization.name}}'
  | '{{organization.address}}'
  | '{{organization.affiliation}}'
  | '{{organization.accreditation}}'
  | '{{organization.slogan}}'
  | '{{organization.logo}}'
  | '{{organization.secondaryLogo}}'
  | '{{event.name}}'
  | '{{event.organizer}}'
  | '{{event.department}}'
  | '{{event.venue}}'
  | '{{event.startDate}}'
  | '{{event.endDate}}'
  | '{{event.dateRange}}'
  | '{{event.date}}'
  | '{{certificate.type}}'
  | '{{certificate.issueDate}}'
  | '{{certificate.code}}'
  | '{{certificate.verificationUrl}}'
  | '{{certificate.qrCode}}'
  | '{{signatory.name}}'
  | '{{signatory.designation}}'
  | '{{signatory.1.name}}'
  | '{{signatory.1.designation}}'
  | '{{signatory.1.signature}}'
  | '{{signatory.2.name}}'
  | '{{signatory.2.designation}}'
  | '{{signatory.2.signature}}'
  | '{{signatory.3.name}}'
  | '{{signatory.3.designation}}'
  | '{{signatory.3.signature}}'
  | '{{signatory.4.name}}'
  | '{{signatory.4.designation}}'
  | '{{signatory.4.signature}}'
  | '{{signatory.5.name}}'
  | '{{signatory.5.designation}}'
  | '{{signatory.5.signature}}'
  | '{{signatory.6.name}}'
  | '{{signatory.6.designation}}'
  | '{{signatory.6.signature}}'
  | '{{custom.department}}'
  | '{{custom.college}}'
  | '{{custom.mentor}}'
  | '{{custom.duration}}'
  | '{{custom.projectTitle}}'
  | '{{custom.score}}'
  | '{{custom.teamName}}'
  | '{{custom.awardCategory}}'
  | string;

export interface DynamicBindingOption {
  key: string;
  label: string;
  category: 'Recipient' | 'Organization' | 'Event' | 'Certificate' | 'Signatory' | 'Custom';
  sampleValue: string;
}

export const DYNAMIC_BINDING_OPTIONS: DynamicBindingOption[] = [
  { key: '{{recipient.name}}', label: 'Recipient Full Name', category: 'Recipient', sampleValue: 'SUBASH P' },
  { key: '{{recipient.email}}', label: 'Recipient Email', category: 'Recipient', sampleValue: 'subash@example.com' },
  { key: '{{recipient.registrationNumber}}', label: 'Reg / Roll Number', category: 'Recipient', sampleValue: '23CS101' },
  { key: '{{recipient.department}}', label: 'Department', category: 'Recipient', sampleValue: 'Computer Science & Engg' },
  { key: '{{recipient.course}}', label: 'Course / Program', category: 'Recipient', sampleValue: 'React 19 & Next.js App Router Workshop' },
  { key: '{{recipient.achievement}}', label: 'Achievement / Position', category: 'Recipient', sampleValue: 'First Place - Hackathon' },
  { key: '{{recipient.rank}}', label: 'Rank / Standing', category: 'Recipient', sampleValue: '1st Rank' },
  { key: '{{recipient.score}}', label: 'Score / Percentage', category: 'Recipient', sampleValue: '98%' },

  { key: '{{organization.name}}', label: 'Organization Name', category: 'Organization', sampleValue: 'ABC ENGINEERING COLLEGE' },
  { key: '{{organization.address}}', label: 'Organization Address', category: 'Organization', sampleValue: '123 University Campus, Innovation Way' },
  { key: '{{organization.affiliation}}', label: 'Affiliation Statement', category: 'Organization', sampleValue: 'Autonomous Institution Affiliated to State Technological University' },
  { key: '{{organization.accreditation}}', label: 'Accreditation Statement', category: 'Organization', sampleValue: 'Accredited with NAAC A+ Grade & NBA' },
  { key: '{{organization.slogan}}', label: 'Slogan / Motto', category: 'Organization', sampleValue: 'Excellence in Technology & Research' },

  { key: '{{event.name}}', label: 'Event Name', category: 'Event', sampleValue: 'SOFTWARE INNOVATION CHALLENGE 2026' },
  { key: '{{event.organizer}}', label: 'Event Organizer', category: 'Event', sampleValue: 'Department of Computer Science' },
  { key: '{{event.department}}', label: 'Organizing Department', category: 'Event', sampleValue: 'School of Computing' },
  { key: '{{event.venue}}', label: 'Venue Location', category: 'Event', sampleValue: 'Main University Auditorium' },
  { key: '{{event.startDate}}', label: 'Event Start Date', category: 'Event', sampleValue: 'March 10, 2026' },
  { key: '{{event.endDate}}', label: 'Event End Date', category: 'Event', sampleValue: 'March 12, 2026' },
  { key: '{{event.dateRange}}', label: 'Event Date Range', category: 'Event', sampleValue: 'March 10-12, 2026' },
  { key: '{{event.date}}', label: 'Event Date', category: 'Event', sampleValue: 'March 12, 2026' },

  { key: '{{certificate.type}}', label: 'Certificate Subtitle/Type', category: 'Certificate', sampleValue: 'OF APPRECIATION' },
  { key: '{{certificate.code}}', label: 'Certificate Code', category: 'Certificate', sampleValue: 'CERT-2026-REACT-0842' },
  { key: '{{certificate.issueDate}}', label: 'Issue Date', category: 'Certificate', sampleValue: 'March 12, 2026' },
  { key: '{{certificate.verificationUrl}}', label: 'Verification URL', category: 'Certificate', sampleValue: 'https://certifyhub.app/verify/CERT-2026-REACT-0842' },

  { key: '{{signatory.1.name}}', label: 'Signatory 1 Name', category: 'Signatory', sampleValue: 'Dr. R. Sundaram' },
  { key: '{{signatory.1.designation}}', label: 'Signatory 1 Designation', category: 'Signatory', sampleValue: 'Convener & Professor' },
  { key: '{{signatory.2.name}}', label: 'Signatory 2 Name', category: 'Signatory', sampleValue: 'Dr. M. Lakshmi' },
  { key: '{{signatory.2.designation}}', label: 'Signatory 2 Designation', category: 'Signatory', sampleValue: 'Head of Department' },
  { key: '{{signatory.3.name}}', label: 'Signatory 3 Name', category: 'Signatory', sampleValue: 'Prof. V. Anand' },
  { key: '{{signatory.3.designation}}', label: 'Signatory 3 Designation', category: 'Signatory', sampleValue: 'Dean of Academics' },
  { key: '{{signatory.4.name}}', label: 'Signatory 4 Name', category: 'Signatory', sampleValue: 'Dr. S. K. Verma' },
  { key: '{{signatory.4.designation}}', label: 'Signatory 4 Designation', category: 'Signatory', sampleValue: 'Registrar' },
  { key: '{{signatory.5.name}}', label: 'Signatory 5 Name', category: 'Signatory', sampleValue: 'Dr. K. Parthasarathy' },
  { key: '{{signatory.5.designation}}', label: 'Signatory 5 Designation', category: 'Signatory', sampleValue: 'Principal' },
  { key: '{{signatory.6.name}}', label: 'Signatory 6 Name', category: 'Signatory', sampleValue: 'Dr. A. B. Roy' },
  { key: '{{signatory.6.designation}}', label: 'Signatory 6 Designation', category: 'Signatory', sampleValue: 'Chairman' },

  { key: '{{custom.mentor}}', label: 'Custom: Mentor Name', category: 'Custom', sampleValue: 'Dr. Eleanor Vance' },
  { key: '{{custom.duration}}', label: 'Custom: Duration', category: 'Custom', sampleValue: '40 Hours / 4 Weeks' },
  { key: '{{custom.college}}', label: 'Custom: College / Institute', category: 'Custom', sampleValue: 'National Institute of Tech' },
  { key: '{{custom.projectTitle}}', label: 'Custom: Project Title', category: 'Custom', sampleValue: 'AI-Powered Certificate Studio' },
  { key: '{{custom.score}}', label: 'Custom: Score / Marks', category: 'Custom', sampleValue: '98/100' },
  { key: '{{custom.teamName}}', label: 'Custom: Team Name', category: 'Custom', sampleValue: 'Team CyberDevs' },
  { key: '{{custom.awardCategory}}', label: 'Custom: Award Category', category: 'Custom', sampleValue: 'Best Frontend Engineering' },
];

export const SAMPLE_DATA: Record<string, string> = Object.fromEntries(
  DYNAMIC_BINDING_OPTIONS.map((opt) => [opt.key, opt.sampleValue])
);

// ---------------------------------------------------------------------------
// Style Interfaces
// ---------------------------------------------------------------------------
export interface TextStyleProps {
  fontSize: number;
  fontFamily: string;
  fontWeight: string;
  fontStyle: string; // 'normal' | 'italic'
  fill: string;
  align: 'left' | 'center' | 'right';
  letterSpacing?: number;
  lineHeight?: number;
  textTransform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
  textDecoration?: 'none' | 'underline' | 'line-through';
  maxWidth?: number;

  // Advanced Text Effects
  shadowColor?: string;
  shadowBlur?: number;
  shadowOffsetX?: number;
  shadowOffsetY?: number;
  stroke?: string;
  strokeWidth?: number;
  backgroundColor?: string;

  // Auto-fit Engine
  autoFit?: boolean;
  minFontSize?: number;
  maxFontSize?: number;
}

export interface ShapeStyleProps {
  shapeType: ShapeVariant;
  fill: string;
  stroke: string;
  strokeWidth: number;
  strokeStyle?: 'solid' | 'dashed' | 'dotted';
  cornerRadius?: number;
  points?: number; // for polygon/star
  innerRadiusRatio?: number;

  // Advanced Effects
  shadowColor?: string;
  shadowBlur?: number;
  shadowOffsetX?: number;
  shadowOffsetY?: number;
  gradientType?: 'linear' | 'radial' | 'none';
  gradientColors?: string[];
}

export interface ImageStyleProps {
  src?: string;
  originalSrc?: string; // preserved for reversible cropping
  fitMode?: 'contain' | 'cover' | 'fill';
  cornerRadius?: number;
  flipH?: boolean;
  flipV?: boolean;
  cropX?: number;
  cropY?: number;
  cropWidth?: number;
  cropHeight?: number;

  // Mask & Border
  maskShape?: ImageMaskVariant;
  borderWidth?: number;
  borderColor?: string;
}

export interface QrStyleProps {
  size: number;
  fgColor: string;
  bgColor: string;
  displayCodeLabel: boolean;
}

export interface BorderStyleProps {
  borderType: 'solid' | 'dashed' | 'dotted' | 'double' | 'ornate' | 'modern' | 'minimal';
  color: string;
  width: number;
  cornerRadius?: number;
  padding?: number;
  inset?: number;
  opacity?: number;
}

// ---------------------------------------------------------------------------
// Document Element
// ---------------------------------------------------------------------------
export interface DocumentElement {
  id: string;
  type: ElementType;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  scale?: number;
  opacity: number;
  zIndex: number;
  visible: boolean;
  locked: boolean;
  groupId?: string;
  aspectRatioLocked?: boolean;

  // Centralized style and metadata
  style?: Record<string, unknown>;
  metadata?: Record<string, unknown>;

  // Type-specific style
  textValue?: string;
  textStyle?: TextStyleProps;
  shapeStyle?: ShapeStyleProps;
  imageStyle?: ImageStyleProps;
  qrStyle?: QrStyleProps;
  borderStyle?: BorderStyleProps;

  // Dynamic binding
  dynamicBinding?: string;
  fallbackValue?: string;
}

export const CANVAS_PRESETS = [
  { name: 'A4 Landscape', width: 842, height: 595, orientation: 'landscape' as const },
  { name: 'A4 Portrait', width: 595, height: 842, orientation: 'portrait' as const },
  { name: 'Letter Landscape', width: 792, height: 612, orientation: 'landscape' as const },
  { name: 'Letter Portrait', width: 612, height: 792, orientation: 'portrait' as const },
  { name: 'A5 Landscape', width: 595, height: 420, orientation: 'landscape' as const },
  { name: 'Custom Size', width: 842, height: 595, orientation: 'landscape' as const },
] as const;

// ---------------------------------------------------------------------------
// Guide
// ---------------------------------------------------------------------------
export interface Guide {
  id: string;
  orientation: 'horizontal' | 'vertical';
  position: number; // in document coordinates
}

// ---------------------------------------------------------------------------
// Brand Settings (stored per-document or globally)
// ---------------------------------------------------------------------------
export interface BrandSettings {
  organizationName: string;
  logoDataUrl?: string;
  secondaryLogoDataUrl?: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  headingFont: string;
  bodyFont: string;
  signatoryNames: string[];
  signatureDataUrls: string[];
  standardWording: string;
}

// ---------------------------------------------------------------------------
// Background Pattern & Gradient Configuration
// ---------------------------------------------------------------------------
export interface BackgroundGradient {
  type: 'linear' | 'radial' | 'none';
  angle?: number;
  stops: Array<{ offset: number; color: string }>;
}

export type BackgroundPatternType =
  | 'none'
  | 'guilloche'
  | 'waves'
  | 'geometric'
  | 'dots'
  | 'grid'
  | 'parchment';

export interface BackgroundPattern {
  type: BackgroundPatternType;
  color?: string;
  opacity?: number;
  scale?: number;
}

// ---------------------------------------------------------------------------
// Version History Snapshot
// ---------------------------------------------------------------------------
export interface VersionSnapshot {
  id: string;
  timestamp: number;
  label: string;
  document: CertificateDocument;
}

// ---------------------------------------------------------------------------
// Certificate Document (the complete design)
// ---------------------------------------------------------------------------
export type Orientation = 'landscape' | 'portrait';
export type TemplateCategory =
  | 'Achievement'
  | 'Participation'
  | 'Completion'
  | 'Appreciation'
  | 'Excellence'
  | 'Academic'
  | 'Competition'
  | 'Sports'
  | 'Workshop'
  | 'Internship'
  | 'Training'
  | 'Corporate'
  | 'Employee'
  | 'Volunteer'
  | 'Event'
  | 'Custom'
  | 'Built-in'
  | 'Imported'
  | 'Smart Design';

export interface CertificateDocument {
  id: string;
  name: string;
  description: string;
  category: TemplateCategory;
  orientation: Orientation;
  width: number;
  height: number;

  // Background
  backgroundColor: string;
  backgroundDataUrl?: string;
  backgroundOpacity: number;
  backgroundFit: 'fill' | 'fit' | 'center' | 'stretch';
  backgroundLocked: boolean;
  backgroundGradient?: BackgroundGradient;
  backgroundPattern?: BackgroundPattern;

  // Margins & Bleed
  safeMargin?: number;
  bleedArea?: number;

  // Elements
  elements: DocumentElement[];

  // Design aids
  guides: Guide[];

  // Custom Fields (user-defined keys)
  customFields?: Array<{ key: string; label: string; sampleValue: string }>;

  // Brand
  brandSettings?: BrandSettings;

  // Assets registry (key → indexedDB asset key)
  assets: Record<string, string>;

  // Metadata & Version History
  thumbnailDataUrl?: string;
  version: number;
  versionHistory?: VersionSnapshot[];
  createdAt: string;
  updatedAt: string;

  // Legacy compat
  isBuiltIn?: boolean;
  isImported?: boolean;
  folderId?: string;
}

// ---------------------------------------------------------------------------
// A4 Constants
// ---------------------------------------------------------------------------
export const A4_LANDSCAPE = { width: 842, height: 595 } as const;
export const A4_PORTRAIT = { width: 595, height: 842 } as const;

// ---------------------------------------------------------------------------
// Default Brand Settings
// ---------------------------------------------------------------------------
export const DEFAULT_BRAND: BrandSettings = {
  organizationName: '',
  primaryColor: '#1E40AF',
  secondaryColor: '#0F172A',
  accentColor: '#0EA5E9',
  headingFont: 'Georgia',
  bodyFont: 'Helvetica',
  signatoryNames: [],
  signatureDataUrls: [],
  standardWording: 'This is to certify that',
};

// ---------------------------------------------------------------------------
// Element Factory Functions
// ---------------------------------------------------------------------------
let _elementCounter = 0;
export function nextId(prefix: string): string {
  _elementCounter++;
  return `${prefix}-${Date.now()}-${_elementCounter}-${Math.random().toString(36).substring(2, 5)}`;
}

function baseElement(type: ElementType, name: string, overrides?: Partial<DocumentElement>): DocumentElement {
  return {
    id: nextId('el'),
    type,
    name,
    x: 0,
    y: 0,
    width: 200,
    height: 100,
    rotation: 0,
    scale: 1,
    opacity: 1,
    zIndex: 0,
    visible: true,
    locked: false,
    ...overrides,
  };
}

export function createTextElement(
  text: string,
  isHeading: boolean,
  docWidth: number,
  docHeight: number,
  maxZ: number,
  presetStyle?: Partial<TextStyleProps>,
): DocumentElement {
  return baseElement('text', isHeading ? 'Heading' : 'Body Text', {
    x: Math.round(docWidth / 2 - 175),
    y: Math.round(docHeight / 2 - 20),
    width: 350,
    height: isHeading ? 48 : 30,
    zIndex: maxZ + 1,
    textValue: text,
    textStyle: {
      fontSize: isHeading ? 28 : 14,
      fontFamily: isHeading ? 'Cinzel' : 'Inter',
      fontWeight: isHeading ? 'bold' : 'normal',
      fontStyle: 'normal',
      fill: '#0F172A',
      align: 'center',
      autoFit: false,
      minFontSize: 12,
      maxFontSize: isHeading ? 36 : 20,
      ...presetStyle,
    },
  });
}

export function createDynamicTextElement(
  key: string,
  docWidth: number,
  docHeight: number,
  maxZ: number,
  customLabel?: string,
  customSample?: string,
): DocumentElement {
  const opt = DYNAMIC_BINDING_OPTIONS.find((o) => o.key === key);
  const isName = key === '{{recipient.name}}';
  const label = customLabel || opt?.label || key;
  const sample = customSample || opt?.sampleValue || key;

  return baseElement('dynamic-text', label, {
    x: Math.round(docWidth / 2 - 180),
    y: Math.round(docHeight / 2 - 22),
    width: 360,
    height: isName ? 48 : 32,
    zIndex: maxZ + 1,
    dynamicBinding: key,
    fallbackValue: sample,
    textStyle: {
      fontSize: isName ? 32 : 16,
      fontFamily: isName ? 'Playfair Display' : 'Inter',
      fontWeight: isName ? 'bold' : 'normal',
      fontStyle: 'normal',
      fill: '#0F172A',
      align: 'center',
      autoFit: isName, // Auto-fit enabled by default for Recipient Name
      minFontSize: 16,
      maxFontSize: isName ? 40 : 24,
    },
  });
}

export function createShapeElement(
  shapeType: ShapeVariant,
  docWidth: number,
  docHeight: number,
  maxZ: number,
  isMask = false,
): DocumentElement {
  const isLine = shapeType === 'line' || shapeType === 'arrow';
  const isCircleOrSquare = ['circle', 'ellipse', 'star', 'diamond', 'badge', 'seal', 'medal', 'heart'].includes(shapeType);
  const defaultWidth = isLine ? 240 : isCircleOrSquare ? 110 : 160;
  const defaultHeight = isLine ? 2 : isCircleOrSquare ? 110 : 100;

  return baseElement('shape', isMask ? 'White Mask Box' : `${shapeType.charAt(0).toUpperCase() + shapeType.slice(1)} Shape`, {
    x: Math.round(docWidth / 2 - defaultWidth / 2),
    y: Math.round(docHeight / 2 - defaultHeight / 2),
    width: defaultWidth,
    height: defaultHeight,
    zIndex: maxZ + 1,
    shapeStyle: {
      shapeType,
      fill: isMask ? '#FFFFFF' : isLine ? 'transparent' : '#1E40AF',
      stroke: isMask ? 'transparent' : '#1E3A8A',
      strokeWidth: isMask ? 0 : isLine ? 2 : 1,
      strokeStyle: 'solid',
      cornerRadius: shapeType === 'rounded-rectangle' ? 12 : 0,
      points: shapeType === 'star' ? 5 : shapeType === 'polygon' || shapeType === 'hexagon' ? 6 : shapeType === 'octagon' ? 8 : shapeType === 'triangle' ? 3 : undefined,
    },
  });
}

export function createImageElement(
  dataUrl: string,
  name: string,
  docWidth: number,
  docHeight: number,
  maxZ: number,
): DocumentElement {
  return baseElement('image', name, {
    x: Math.round(docWidth / 2 - 75),
    y: Math.round(docHeight / 2 - 75),
    width: 150,
    height: 150,
    zIndex: maxZ + 1,
    aspectRatioLocked: true,
    imageStyle: {
      src: dataUrl,
      originalSrc: dataUrl,
      fitMode: 'contain',
      maskShape: 'none',
      borderWidth: 0,
      borderColor: '#E2E8F0',
    },
  });
}

export function createLogoElement(
  dataUrl: string,
  docWidth: number,
  docHeight: number,
  maxZ: number,
): DocumentElement {
  return baseElement('logo', 'Organization Logo', {
    x: Math.round(docWidth / 2 - 45),
    y: 35,
    width: 90,
    height: 90,
    zIndex: maxZ + 1,
    aspectRatioLocked: true,
    imageStyle: { src: dataUrl, originalSrc: dataUrl, fitMode: 'contain', maskShape: 'none' },
  });
}

export function createSignatureElement(
  dataUrl: string,
  docWidth: number,
  docHeight: number,
  maxZ: number,
  signatoryName = 'Signatory Name',
  signatoryDesignation = 'Authorized Signatory',
): DocumentElement {
  return baseElement('signature', `Signature - ${signatoryName}`, {
    x: Math.round(docWidth / 2 - 70),
    y: docHeight - 130,
    width: 140,
    height: 65,
    zIndex: maxZ + 1,
    aspectRatioLocked: true,
    imageStyle: { src: dataUrl, originalSrc: dataUrl, fitMode: 'contain' },
  });
}

export function createQrElement(
  docWidth: number,
  docHeight: number,
  maxZ: number,
): DocumentElement {
  return baseElement('qr', 'Verification QR Code', {
    x: docWidth - 115,
    y: docHeight - 115,
    width: 85,
    height: 85,
    zIndex: maxZ + 1,
    aspectRatioLocked: true,
    qrStyle: {
      size: 85,
      fgColor: '#0F172A',
      bgColor: '#FFFFFF',
      displayCodeLabel: true,
    },
  });
}

export function createBorderElement(
  docWidth: number,
  docHeight: number,
  maxZ: number,
  borderType: BorderStyleProps['borderType'] = 'double',
  color = '#1E40AF',
  width = 3,
): DocumentElement {
  return baseElement('border', 'Certificate Border', {
    x: 20,
    y: 20,
    width: docWidth - 40,
    height: docHeight - 40,
    zIndex: maxZ + 1,
    borderStyle: {
      borderType,
      color,
      width,
      cornerRadius: 4,
      padding: 0,
      inset: 6,
      opacity: 1,
    },
  });
}

export function createCertificateCodeElement(
  docWidth: number,
  docHeight: number,
  maxZ: number,
): DocumentElement {
  return baseElement('certificate-code', 'Certificate ID & Verification Token', {
    x: Math.round(docWidth / 2 - 140),
    y: docHeight - 38,
    width: 280,
    height: 20,
    zIndex: maxZ + 1,
    dynamicBinding: '{{certificate.code}}',
    textStyle: {
      fontSize: 10,
      fontFamily: 'Inter',
      fontWeight: 'bold',
      fontStyle: 'normal',
      fill: '#64748B',
      align: 'center',
      letterSpacing: 1,
    },
  });
}

// ---------------------------------------------------------------------------
// 4-Corner Decorative Ornament Set Generator
// ---------------------------------------------------------------------------
export function createCornerOrnamentSet(
  style: CornerOrnamentStyle,
  docWidth: number,
  docHeight: number,
  maxZ: number,
  color = '#D97706',
): DocumentElement[] {
  const size = 55;
  const padding = 28;

  const corners = [
    { name: 'Top-Left Ornament', x: padding, y: padding, rot: 0 },
    { name: 'Top-Right Ornament', x: docWidth - padding - size, y: padding, rot: 90 },
    { name: 'Bottom-Right Ornament', x: docWidth - padding - size, y: docHeight - padding - size, rot: 180 },
    { name: 'Bottom-Left Ornament', x: padding, y: docHeight - padding - size, rot: 270 },
  ];

  const groupId = nextId('group-ornaments');

  return corners.map((c, i) =>
    baseElement('shape', c.name, {
      x: c.x,
      y: c.y,
      width: size,
      height: size,
      rotation: c.rot,
      zIndex: maxZ + 1 + i,
      groupId,
      shapeStyle: {
        shapeType: 'rounded-rectangle',
        fill: 'transparent',
        stroke: color,
        strokeWidth: style === 'luxury' ? 2.5 : style === 'minimal' ? 1 : 2,
        cornerRadius: style === 'geometric' ? 0 : 6,
        strokeStyle: style === 'luxury' ? 'solid' : 'solid',
      },
    })
  );
}

export function createDecorativeShapePreset(
  presetType:
    | 'divider'
    | 'double-divider'
    | 'corner-ornament'
    | 'decorative-circle'
    | 'star-accent'
    | 'seal-placeholder'
    | 'ribbon-badge'
    | 'gold-medal',
  docWidth: number,
  docHeight: number,
  maxZ: number,
): DocumentElement {
  switch (presetType) {
    case 'divider':
      return baseElement('shape', 'Accent Divider Line', {
        x: Math.round(docWidth / 2 - 160),
        y: Math.round(docHeight / 2),
        width: 320,
        height: 2,
        zIndex: maxZ + 1,
        shapeStyle: { shapeType: 'line', fill: 'transparent', stroke: '#1E40AF', strokeWidth: 2, strokeStyle: 'solid' },
      });

    case 'double-divider':
      return baseElement('shape', 'Double Divider', {
        x: Math.round(docWidth / 2 - 160),
        y: Math.round(docHeight / 2),
        width: 320,
        height: 4,
        zIndex: maxZ + 1,
        shapeStyle: { shapeType: 'line', fill: 'transparent', stroke: '#1E40AF', strokeWidth: 3, strokeStyle: 'dashed' },
      });

    case 'corner-ornament':
      return baseElement('shape', 'Corner Ornament Frame', {
        x: 35,
        y: 35,
        width: 60,
        height: 60,
        zIndex: maxZ + 1,
        shapeStyle: { shapeType: 'rounded-rectangle', fill: 'transparent', stroke: '#D97706', strokeWidth: 2, cornerRadius: 4 },
      });

    case 'decorative-circle':
      return baseElement('shape', 'Decorative Dashed Ring', {
        x: Math.round(docWidth / 2 - 60),
        y: Math.round(docHeight / 2 - 60),
        width: 120,
        height: 120,
        zIndex: maxZ + 1,
        shapeStyle: { shapeType: 'circle', fill: 'transparent', stroke: '#1E40AF', strokeWidth: 2, strokeStyle: 'dashed' },
      });

    case 'star-accent':
      return baseElement('shape', 'Gold Star Accent', {
        x: Math.round(docWidth / 2 - 25),
        y: Math.round(docHeight / 2 - 25),
        width: 50,
        height: 50,
        zIndex: maxZ + 1,
        shapeStyle: { shapeType: 'star', fill: '#F59E0B', stroke: '#B45309', strokeWidth: 1, points: 5, innerRadiusRatio: 0.45 },
      });

    case 'seal-placeholder':
      return baseElement('shape', 'Official Seal Badge', {
        x: Math.round(docWidth - 145),
        y: Math.round(docHeight - 145),
        width: 95,
        height: 95,
        zIndex: maxZ + 1,
        shapeStyle: { shapeType: 'seal', fill: '#B45309', stroke: '#F59E0B', strokeWidth: 2, points: 16, innerRadiusRatio: 0.85 },
      });

    case 'ribbon-badge':
      return baseElement('shape', 'Honor Ribbon Banner', {
        x: Math.round(docWidth / 2 - 75),
        y: 110,
        width: 150,
        height: 45,
        zIndex: maxZ + 1,
        shapeStyle: { shapeType: 'ribbon', fill: '#1E40AF', stroke: '#38BDF8', strokeWidth: 1.5 },
      });

    case 'gold-medal':
      return baseElement('shape', 'Excellence Medal', {
        x: Math.round(docWidth - 130),
        y: 40,
        width: 75,
        height: 75,
        zIndex: maxZ + 1,
        shapeStyle: { shapeType: 'medal', fill: '#D97706', stroke: '#FDE68A', strokeWidth: 2 },
      });
  }
}

// ---------------------------------------------------------------------------
// Document Factory
// ---------------------------------------------------------------------------
export function createBlankDocument(
  name: string,
  orientation: Orientation = 'landscape',
): CertificateDocument {
  const dims = orientation === 'landscape' ? A4_LANDSCAPE : A4_PORTRAIT;
  return {
    id: `doc-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    name,
    description: '',
    category: 'Custom',
    orientation,
    width: dims.width,
    height: dims.height,
    backgroundColor: '#FFFFFF',
    backgroundOpacity: 1,
    backgroundFit: 'fill',
    backgroundLocked: false,
    elements: [],
    guides: [],
    customFields: [],
    assets: {},
    version: 1,
    versionHistory: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

// ---------------------------------------------------------------------------
// Utility: compute maxZ from elements
// ---------------------------------------------------------------------------
export function getMaxZ(elements: DocumentElement[]): number {
  return elements.length === 0 ? 0 : Math.max(...elements.map((e) => e.zIndex));
}

// ---------------------------------------------------------------------------
// Legacy Compatibility: convert old CustomTemplate → CertificateDocument
// ---------------------------------------------------------------------------
export function migrateFromLegacy(legacy: Record<string, unknown>): CertificateDocument {
  const elements: DocumentElement[] = ((legacy.elements as unknown[]) || []).map((el: unknown) => {
    const e = el as Record<string, unknown>;
    return {
      id: (e.id as string) || nextId('el'),
      type: (e.type as ElementType) || 'text',
      name: (e.name as string) || 'Element',
      x: (e.x as number) || 0,
      y: (e.y as number) || 0,
      width: (e.width as number) || 100,
      height: (e.height as number) || 50,
      rotation: (e.rotation as number) || 0,
      scale: (e.scale as number) || 1,
      opacity: (e.opacity as number) ?? 1,
      zIndex: (e.zIndex as number) || 0,
      visible: (e.visible as boolean) ?? true,
      locked: (e.locked as boolean) ?? false,
      groupId: e.groupId as string | undefined,
      aspectRatioLocked: e.aspectRatioLocked as boolean | undefined,
      textValue: e.textValue as string | undefined,
      textStyle: e.textStyle as TextStyleProps | undefined,
      shapeStyle: e.shapeStyle as ShapeStyleProps | undefined,
      imageStyle: e.imageStyle as ImageStyleProps | undefined,
      qrStyle: e.qrStyle as QrStyleProps | undefined,
      borderStyle: e.borderStyle as BorderStyleProps | undefined,
      dynamicBinding: (e.dynamicBinding as string) || undefined,
      fallbackValue: e.fallbackValue as string | undefined,
    };
  });

  return {
    id: (legacy.id as string) || `doc-migrated-${Date.now()}`,
    name: (legacy.name as string) || 'Migrated Design',
    description: (legacy.description as string) || '',
    category: (legacy.category as TemplateCategory) || 'Custom',
    orientation: (legacy.orientation as Orientation) || 'landscape',
    width: (legacy.width as number) || 842,
    height: (legacy.height as number) || 595,
    backgroundColor: (legacy.backgroundColor as string) || '#FFFFFF',
    backgroundDataUrl: legacy.backgroundDataUrl as string | undefined,
    backgroundOpacity: 1,
    backgroundFit: 'fill',
    backgroundLocked: false,
    elements,
    guides: [],
    customFields: [],
    assets: {},
    version: (legacy.version as number) || 1,
    versionHistory: [],
    createdAt: (legacy.createdAt as string) || new Date().toISOString(),
    updatedAt: (legacy.updatedAt as string) || new Date().toISOString(),
    isBuiltIn: legacy.isBuiltIn as boolean | undefined,
    isImported: legacy.isImported as boolean | undefined,
    folderId: legacy.folderId as string | undefined,
  };
}
