import { Organization, EventItem, Recipient, CertificateRecord } from '@/types';
import { EmailTemplate, EmailConfigSnapshot } from '@/types/distribution';
import { getNormalizedCategory, getCertificateCategoryTitle } from '@/lib/participantUtils';

export interface TemplateContext {
  recipient: Recipient;
  event: EventItem;
  organization: Organization;
  certificate?: CertificateRecord;
  downloadLink?: string;
  portalLink?: string;
  verifyUrl?: string;
  issueDate?: string;
}

/**
 * Replace dynamic tokens in any string.
 * Supports {{recipient.name}}, {{event.name}}, {{institution.name}}, etc.
 */
export function replaceVariables(text: string, context: TemplateContext): string {
  if (!text) return '';

  const { recipient, event, organization, certificate, downloadLink, portalLink, verifyUrl, issueDate } = context;
  const category = getNormalizedCategory(recipient);
  const certTitle = getCertificateCategoryTitle(category, event.certificateType);
  const formattedDate = issueDate || (certificate?.generatedAt ? new Date(certificate.generatedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }));

  const replacements: Record<string, string> = {
    '{{recipient.name}}': recipient.fullName || 'Recipient',
    '{{recipient.fullName}}': recipient.fullName || 'Recipient',
    '{{recipient.email}}': recipient.email || '',
    '{{recipient.register_number}}': recipient.registrationNumber || '',
    '{{recipient.registrationNumber}}': recipient.registrationNumber || '',
    '{{recipient.department}}': recipient.department || 'Academic Department',
    '{{recipient.course}}': recipient.course || event.name,
    '{{recipient.achievement}}': recipient.achievement || 'Participation',
    '{{recipient.category}}': category,

    '{{event.name}}': event.name,
    '{{event.type}}': event.eventType,
    '{{event.date}}': event.startDate,
    '{{event.startDate}}': event.startDate,
    '{{event.endDate}}': event.endDate || event.startDate,
    '{{event.location}}': event.location || 'Campus',

    '{{certificate.title}}': certTitle,
    '{{certificate.code}}': certificate?.certificateCode || 'PENDING-CODE',
    '{{certificate.status}}': certificate?.status || 'Valid',

    '{{institution.name}}': organization.name || 'CertifyHub Institution',
    '{{institution.type}}': organization.type || 'College / University',
    '{{institution.address}}': organization.address || '',
    '{{institution.email}}': organization.email || '',
    '{{institution.website}}': organization.website || '',

    '{{signatory.name}}': organization.signatoryName || 'Authorized Signatory',
    '{{signatory.designation}}': organization.signatoryDesignation || 'Principal',

    '{{issue_date}}': formattedDate,
    '{{issueDate}}': formattedDate,

    '{{download_link}}': downloadLink || '#download',
    '{{download_url}}': downloadLink || '#download',
    '{{downloadUrl}}': downloadLink || '#download',
    '{{certificate.download_url}}': downloadLink || '#download',
    '{{certificate.download_link}}': downloadLink || '#download',
    '{{certificate.downloadUrl}}': downloadLink || '#download',
    '{{portal_link}}': portalLink || '#portal',
    '{{verify_url}}': verifyUrl || '#verify',
  };

  let result = text;
  Object.entries(replacements).forEach(([key, val]) => {
    // Global replace case-insensitive key
    const escaped = key.replace(/[{}]/g, '\\$&');
    result = result.replace(new RegExp(escaped, 'gi'), val);
  });

  return result;
}

/**
 * Generate a clean and safe attachment filename based on database record values.
 * Subash P + AI Workshop 2026 => Subash_P_AI_Workshop_2026.pdf
 */
export function generateSafeAttachmentFilename(recipientName: string, eventName: string): string {
  const cleanRecipient = (recipientName || 'Recipient')
    .trim()
    .replace(/[^a-zA-Z0-9]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '');
  const cleanEvent = (eventName || 'Certificate')
    .trim()
    .replace(/[^a-zA-Z0-9]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '');

  return `${cleanRecipient}_${cleanEvent}.pdf`;
}

/**
 * Render a complete, responsive, beautifully styled HTML email with brand kit header and footer.
 */
export function renderFullHtmlEmail(
  config: EmailTemplate | EmailConfigSnapshot,
  context: TemplateContext
): string {
  const subject = replaceVariables(config.subject, context);
  const bodyHtml = replaceVariables(config.body, context);
  const { organization, downloadLink, portalLink, verifyUrl } = context;

  // Resolve CTA Link - Default to unique recipient download & preview URL
  let ctaLink = downloadLink || verifyUrl || portalLink || '#';
  if ('ctaButtonUrlType' in config && config.ctaButtonUrlType) {
    if (config.ctaButtonUrlType === 'download') ctaLink = downloadLink || '#';
    else if (config.ctaButtonUrlType === 'verify') ctaLink = verifyUrl || '#';
    else if (config.ctaButtonUrlType === 'portal') ctaLink = portalLink || '#';
  }

  const ctaText = replaceVariables(config.ctaButtonText || 'Access Certificate', context);

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
  <style>
    body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #1e293b; -webkit-font-smoothing: antialiased; }
    .container { max-width: 600px; margin: 30px auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 12px rgba(15, 23, 42, 0.05); }
    .header { padding: 32px 36px 24px; text-align: center; border-bottom: 1px solid #f1f5f9; background: #f8fafc; }
    .logo { max-height: 48px; max-width: 180px; margin-bottom: 12px; }
    .org-name { font-size: 17px; font-weight: 700; color: #0f172a; margin: 0; letter-spacing: -0.2px; }
    .org-type { font-size: 12px; color: #64748b; margin-top: 4px; }
    .content { padding: 36px; line-height: 1.65; font-size: 14.5px; color: #334155; }
    .content p { margin: 0 0 16px; }
    .content strong { color: #0f172a; }
    .btn-container { text-align: center; margin: 28px 0 24px; }
    .btn { display: inline-block; background: linear-gradient(135deg, #2563eb 0%, #0284c7 100%); color: #ffffff !important; text-decoration: none; padding: 13px 28px; border-radius: 10px; font-weight: 600; font-size: 14px; box-shadow: 0 2px 8px rgba(37, 99, 235, 0.25); }
    .card-highlight { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 16px; margin: 20px 0; text-align: center; }
    .card-highlight p { margin: 0; font-size: 13px; color: #15803d; font-weight: 600; }
    .footer { padding: 24px 36px; background-color: #f8fafc; border-top: 1px solid #e2e8f0; font-size: 11.5px; color: #64748b; text-align: center; line-height: 1.5; }
    .footer a { color: #2563eb; text-decoration: none; }
    .badge { display: inline-block; background: #eff6ff; color: #2563eb; font-size: 11px; font-weight: 700; padding: 3px 8px; border-radius: 6px; border: 1px solid #bfdbfe; margin-bottom: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <!-- Header -->
    <div class="header">
      <span class="badge">Official Digital Credential</span>
      ${config.includeLogo && organization.logoDataUrl ? `<br/><img src="${organization.logoDataUrl}" alt="${organization.name}" class="logo" />` : ''}
      <h1 class="org-name">${organization.name || 'ABC Engineering College'}</h1>
      <p class="org-type">${organization.type || 'Institutional Certification Center'}</p>
    </div>

    <!-- Body Content -->
    <div class="content">
      ${bodyHtml}

      <!-- Action Button -->
      <div class="btn-container">
        <a href="${ctaLink}" target="_blank" class="btn">
          ${ctaText || 'View & Download Certificate'}
        </a>
      </div>

      <!-- Direct PDF Attachment Notice Card -->
      <div style="background: #f0fdf4; border: 1.5px solid #86efac; border-radius: 12px; padding: 18px 20px; margin: 24px 0; text-align: center;">
        <p style="margin: 0; font-size: 15px; font-weight: 700; color: #166534;">
          📎 Your certificate is attached to this email as a PDF.
        </p>
        <p style="margin: 6px 0 0 0; font-size: 12.5px; color: #15803d;">
          Open the attached certificate in Gmail / Chrome to preview or download it directly to your device.
        </p>
      </div>

      ${verifyUrl ? `
      <div style="text-align: center; margin-top: 14px;">
        <a href="${verifyUrl}" target="_blank" style="color: #2563eb; font-size: 12px; text-decoration: underline;">
          🔍 Or click here to verify credential authenticity online
        </a>
      </div>` : ''}
    </div>

    <!-- Footer -->
    <div class="footer">
      <p style="margin-bottom: 6px;"><strong>${organization.name}</strong> • ${organization.address || 'Campus Center'}</p>
      ${organization.website ? `<p style="margin-bottom: 8px;"><a href="${organization.website}" target="_blank">${organization.website}</a></p>` : ''}
      <p style="color: #94a3b8; font-size: 10.5px; margin: 0;">${config.footerText || organization.footerText || 'This email was automatically generated by CertifyHub. Digitally verified & tamper-proof.'}</p>
    </div>
  </div>
</body>
</html>
  `.trim();
}
