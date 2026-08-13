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
  | 'mask';

export type ShapeVariant =
  | 'rectangle'
  | 'rounded-rectangle'
  | 'circle'
  | 'ellipse'
  | 'triangle'
  | 'polygon'
  | 'star'
  | 'line'
  | 'arrow';

export type DynamicBindingKey =
  | '{{recipient.name}}'
  | '{{recipient.email}}'
  | '{{recipient.registrationNumber}}'
  | '{{recipient.department}}'
  | '{{recipient.course}}'
  | '{{recipient.achievement}}'
  | '{{recipient.rank}}'
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
  | '{{custom.projectTitle}}'
  | '{{custom.score}}'
  | '{{custom.teamName}}'
  | '{{custom.awardCategory}}';

export interface DynamicBindingOption {
  key: DynamicBindingKey;
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
  textDecoration?: 'none' | 'underline';
  maxWidth?: number;
}

export interface ShapeStyleProps {
  shapeType: ShapeVariant;
  fill: string;
  stroke: string;
  strokeWidth: number;
  cornerRadius?: number;
  points?: number; // for polygon/star
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
}

export interface QrStyleProps {
  size: number;
  fgColor: string;
  bgColor: string;
  displayCodeLabel: boolean;
}

export interface BorderStyleProps {
  borderType: 'solid' | 'dashed' | 'dotted' | 'double' | 'ornate';
  color: string;
  width: number;
  cornerRadius?: number;
  padding?: number;
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

  // Type-specific style
  textValue?: string;
  textStyle?: TextStyleProps;
  shapeStyle?: ShapeStyleProps;
  imageStyle?: ImageStyleProps;
  qrStyle?: QrStyleProps;
  borderStyle?: BorderStyleProps;

  // Dynamic binding
  dynamicBinding?: DynamicBindingKey;
  fallbackValue?: string;
}

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
// Certificate Document (the complete design)
// ---------------------------------------------------------------------------
export type Orientation = 'landscape' | 'portrait';
export type TemplateCategory = 'Built-in' | 'Imported' | 'Custom' | 'Smart Design';

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

  // Elements
  elements: DocumentElement[];

  // Design aids
  guides: Guide[];

  // Brand
  brandSettings?: BrandSettings;

  // Assets registry (key → indexedDB asset key)
  assets: Record<string, string>;

  // Metadata
  thumbnailDataUrl?: string;
  version: number;
  createdAt: string;
  updatedAt: string;

  // Legacy compat
  isBuiltIn?: boolean;
  isImported?: boolean;

  // Project/folder
  folderId?: string;
}

// ---------------------------------------------------------------------------
// Project Folder
// ---------------------------------------------------------------------------
export interface ProjectFolder {
  id: string;
  name: string;
  createdAt: string;
}

// ---------------------------------------------------------------------------
// Template Package (for export/import)
// ---------------------------------------------------------------------------
export interface TemplatePackage {
  template: CertificateDocument;
  assets: Record<string, string>;
  exportedAt: string;
  version: number;
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
function nextId(prefix: string): string {
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
): DocumentElement {
  return baseElement('text', isHeading ? 'Heading' : 'Body Text', {
    x: docWidth / 2 - 150,
    y: docHeight / 2 - 20,
    width: 300,
    height: isHeading ? 45 : 28,
    zIndex: maxZ + 1,
    textValue: text,
    textStyle: {
      fontSize: isHeading ? 28 : 14,
      fontFamily: isHeading ? 'Georgia' : 'Helvetica',
      fontWeight: isHeading ? 'bold' : 'normal',
      fontStyle: 'normal',
      fill: '#0F172A',
      align: 'center',
    },
  });
}

export function createDynamicTextElement(
  key: DynamicBindingKey,
  docWidth: number,
  docHeight: number,
  maxZ: number,
): DocumentElement {
  const opt = DYNAMIC_BINDING_OPTIONS.find((o) => o.key === key);
  const isName = key === '{{recipient.name}}';
  return baseElement('dynamic-text', opt?.label || key, {
    x: docWidth / 2 - 175,
    y: docHeight / 2 - 20,
    width: 350,
    height: isName ? 45 : 30,
    zIndex: maxZ + 1,
    dynamicBinding: key,
    fallbackValue: opt?.sampleValue || key,
    textStyle: {
      fontSize: isName ? 32 : 16,
      fontFamily: isName ? 'Georgia' : 'Helvetica',
      fontWeight: isName ? 'bold' : 'normal',
      fontStyle: 'normal',
      fill: '#0F172A',
      align: 'center',
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
  return baseElement('shape', isMask ? 'White Mask Box' : `${shapeType} Shape`, {
    x: docWidth / 2 - 100,
    y: docHeight / 2 - (isLine ? 1 : 50),
    width: 200,
    height: isLine ? 2 : 100,
    zIndex: maxZ + 1,
    shapeStyle: {
      shapeType,
      fill: isMask ? '#FFFFFF' : isLine ? 'transparent' : '#2563EB',
      stroke: isMask ? 'transparent' : '#0F172A',
      strokeWidth: isMask ? 0 : isLine ? 2 : 1,
      cornerRadius: shapeType === 'rounded-rectangle' ? 12 : 0,
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
    x: docWidth / 2 - 75,
    y: docHeight / 2 - 75,
    width: 150,
    height: 150,
    zIndex: maxZ + 1,
    imageStyle: {
      src: dataUrl,
      originalSrc: dataUrl,
      fitMode: 'contain',
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
    x: docWidth / 2 - 50,
    y: 30,
    width: 100,
    height: 100,
    zIndex: maxZ + 1,
    imageStyle: { src: dataUrl, originalSrc: dataUrl, fitMode: 'contain' },
  });
}

export function createSignatureElement(
  dataUrl: string,
  docWidth: number,
  docHeight: number,
  maxZ: number,
): DocumentElement {
  return baseElement('signature', 'Signature', {
    x: docWidth / 2 - 60,
    y: docHeight - 120,
    width: 120,
    height: 60,
    zIndex: maxZ + 1,
    imageStyle: { src: dataUrl, originalSrc: dataUrl, fitMode: 'contain' },
  });
}

export function createQrElement(
  docWidth: number,
  docHeight: number,
  maxZ: number,
): DocumentElement {
  return baseElement('qr', 'Verification QR Code', {
    x: docWidth - 110,
    y: docHeight - 110,
    width: 80,
    height: 80,
    zIndex: maxZ + 1,
    qrStyle: {
      size: 80,
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
): DocumentElement {
  return baseElement('border', 'Certificate Border', {
    x: 20,
    y: 20,
    width: docWidth - 40,
    height: docHeight - 40,
    zIndex: maxZ + 1,
    borderStyle: {
      borderType: 'solid',
      color: '#1E40AF',
      width: 2,
      cornerRadius: 0,
      padding: 0,
    },
  });
}

export function createCertificateCodeElement(
  docWidth: number,
  docHeight: number,
  maxZ: number,
): DocumentElement {
  return baseElement('certificate-code', 'Certificate Code', {
    x: docWidth / 2 - 100,
    y: docHeight - 40,
    width: 200,
    height: 20,
    zIndex: maxZ + 1,
    dynamicBinding: '{{certificate.code}}',
    textStyle: {
      fontSize: 10,
      fontFamily: 'Courier New',
      fontWeight: 'normal',
      fontStyle: 'normal',
      fill: '#64748B',
      align: 'center',
    },
  });
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
    assets: {},
    version: 1,
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
      textValue: e.textValue as string | undefined,
      textStyle: e.textStyle as TextStyleProps | undefined,
      shapeStyle: e.shapeStyle as ShapeStyleProps | undefined,
      imageStyle: e.imageStyle as ImageStyleProps | undefined,
      qrStyle: e.qrStyle as QrStyleProps | undefined,
      borderStyle: e.borderStyle as BorderStyleProps | undefined,
      dynamicBinding: e.dynamicBinding as DynamicBindingKey | undefined,
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
    assets: {},
    version: (legacy.version as number) || 1,
    createdAt: (legacy.createdAt as string) || new Date().toISOString(),
    updatedAt: (legacy.updatedAt as string) || new Date().toISOString(),
    isBuiltIn: legacy.isBuiltIn as boolean | undefined,
    isImported: legacy.isImported as boolean | undefined,
    folderId: legacy.folderId as string | undefined,
  };
}
