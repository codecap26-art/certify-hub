export type TemplateCategory = 'Built-in' | 'Imported' | 'Custom' | 'Smart Design';

export type Orientation = 'landscape' | 'portrait';

export type ElementType =
  | 'text'
  | 'dynamic-text'
  | 'image'
  | 'shape'
  | 'line'
  | 'logo'
  | 'signature'
  | 'qr'
  | 'border'
  | 'certificate-code'
  | 'group'
  | 'mask';

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
  category: 'Recipient' | 'Organization' | 'Event' | 'Certificate' | 'Signatory';
  sampleValue: string;
}

export const DYNAMIC_BINDING_OPTIONS: DynamicBindingOption[] = [
  { key: '{{recipient.name}}', label: 'Recipient Full Name', category: 'Recipient', sampleValue: 'Subash P' },
  { key: '{{recipient.email}}', label: 'Recipient Email', category: 'Recipient', sampleValue: 'subash@example.com' },
  { key: '{{recipient.registrationNumber}}', label: 'Reg / Roll Number', category: 'Recipient', sampleValue: '23CS101' },
  { key: '{{recipient.department}}', label: 'Department', category: 'Recipient', sampleValue: 'Computer Science & Engg' },
  { key: '{{recipient.course}}', label: 'Course / Program', category: 'Recipient', sampleValue: 'React Development Workshop' },
  { key: '{{recipient.achievement}}', label: 'Achievement / Position', category: 'Recipient', sampleValue: 'First Place - Hackathon' },

  { key: '{{organization.name}}', label: 'Organization Name', category: 'Organization', sampleValue: 'ABC Engineering College' },
  { key: '{{event.name}}', label: 'Event Name', category: 'Event', sampleValue: 'React Development Workshop 2026' },
  { key: '{{event.date}}', label: 'Event Date', category: 'Event', sampleValue: 'March 12, 2026' },
  { key: '{{event.venue}}', label: 'Event Location / Venue', category: 'Event', sampleValue: 'Main Auditorium, Hall B' },

  { key: '{{certificate.type}}', label: 'Certificate Type', category: 'Certificate', sampleValue: 'Certificate of Participation' },
  { key: '{{certificate.code}}', label: 'Certificate Code', category: 'Certificate', sampleValue: 'ABC-REACT-2026-0001' },
  { key: '{{certificate.issueDate}}', label: 'Issue Date', category: 'Certificate', sampleValue: '2026-03-12' },

  { key: '{{signatory.name}}', label: 'Signatory Name', category: 'Signatory', sampleValue: 'Dr. R. Sundaram' },
  { key: '{{signatory.designation}}', label: 'Signatory Designation', category: 'Signatory', sampleValue: 'Principal & Dean of Academics' },
];

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
  maxWidth?: number;
  autoFit?: boolean;
  minFontSize?: number;
  maxFontSize?: number;
}

export type ShapeVariant =
  | 'rectangle'
  | 'rounded-rectangle'
  | 'circle'
  | 'ellipse'
  | 'line'
  | 'triangle'
  | 'polygon'
  | 'star'
  | 'arrow';

export interface ShapeStyleProps {
  shapeType: ShapeVariant;
  fill: string;
  stroke: string;
  strokeWidth: number;
  strokeStyle?: 'solid' | 'dashed' | 'dotted';
  cornerRadius?: number;
  points?: number;
  innerRadiusRatio?: number;
}

export interface ImageStyleProps {
  src?: string;
  fitMode?: 'contain' | 'cover' | 'fill';
  cornerRadius?: number;
}

export interface QrStyleProps {
  size: number;
  fgColor: string;
  bgColor: string;
  displayCodeLabel: boolean;
}

export interface TemplateElement {
  id: string;
  type: ElementType;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  zIndex: number;
  visible: boolean;
  locked: boolean;
  opacity: number;

  // Type specific properties
  textValue?: string;
  textStyle?: TextStyleProps;
  shapeStyle?: ShapeStyleProps;
  imageStyle?: ImageStyleProps;
  qrStyle?: QrStyleProps;

  borderStyle?: {
    borderType: 'solid' | 'dashed' | 'dotted' | 'double' | 'ornate';
    color: string;
    width: number;
    cornerRadius?: number;
    padding?: number;
    inset?: number;
  };

  dynamicBinding?: DynamicBindingKey;
  fallbackValue?: string;
}

export interface CustomTemplate {
  id: string;
  name: string;
  description: string;
  category: TemplateCategory;
  orientation: Orientation;
  width: number; // e.g. 842 points for A4 landscape
  height: number; // e.g. 595 points for A4 landscape
  backgroundDataUrl?: string;
  backgroundColor: string;
  thumbnailDataUrl?: string;
  elements: TemplateElement[];
  createdAt: string;
  updatedAt: string;
  isBuiltIn?: boolean;
  isImported?: boolean;
  version: number;
}

export interface TemplatePackage {
  template: CustomTemplate;
  assets: Record<string, string>; // base64 string assets
  exportedAt: string;
  version: number;
}
