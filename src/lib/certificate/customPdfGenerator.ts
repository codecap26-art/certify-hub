import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import QRCode from 'qrcode';
import { CertificateRecord } from '@/types';
import { CustomTemplate } from '@/types/template';
import {
  getNormalizedCategory,
  getCertificateCategoryTitle,
  getCertificateMainTitle,
  getCertificateRoleLabel,
  getCertificateRankLabel,
  getCategoryDisplayTitle,
} from '@/lib/participantUtils';

export async function generatePdfFromCustomTemplate(
  certificate: CertificateRecord,
  template: CustomTemplate
): Promise<Uint8Array> {
  const isLandscape = template.orientation === 'landscape';
  const width = template.width || (isLandscape ? 842 : 595);
  const height = template.height || (isLandscape ? 595 : 842);

  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([width, height]);

  // Standard Fonts
  const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const timesRoman = await pdfDoc.embedFont(StandardFonts.TimesRoman);
  const timesBold = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);

  const hexToRgb = (hexStr?: string) => {
    if (!hexStr || hexStr === 'transparent') return null;
    const clean = hexStr.replace('#', '');
    const r = parseInt(clean.substring(0, 2), 16) / 255;
    const g = parseInt(clean.substring(2, 4), 16) / 255;
    const b = parseInt(clean.substring(4, 6), 16) / 255;
    return rgb(isNaN(r) ? 0 : r, isNaN(g) ? 0 : g, isNaN(b) ? 0 : b);
  };

  // 1. Background Color
  if (template.backgroundColor && template.backgroundColor !== 'transparent') {
    const bgColor = hexToRgb(template.backgroundColor);
    if (bgColor) page.drawRectangle({ x: 0, y: 0, width, height, color: bgColor });
  }

  // 2. Background Image
  if (template.backgroundDataUrl && template.backgroundDataUrl.startsWith('data:image')) {
    try {
      const isPng = template.backgroundDataUrl.startsWith('data:image/png');
      const imgBytes = await fetch(template.backgroundDataUrl).then((r) => r.arrayBuffer());
      const embeddedBg = isPng ? await pdfDoc.embedPng(imgBytes) : await pdfDoc.embedJpg(imgBytes);
      page.drawImage(embeddedBg, { x: 0, y: 0, width, height });
    } catch (e) {
      console.error(e);
    }
  }

  const category = getNormalizedCategory(certificate.recipientSnapshot);
  const certCategoryTitle = getCertificateCategoryTitle(category, certificate.eventSnapshot.certificateType);
  const certMainTitle = getCertificateMainTitle(category, certificate.eventSnapshot.certificateType);
  const roleLabel = getCertificateRoleLabel(category, certificate.recipientSnapshot.achievement);
  const rankLabel = getCertificateRankLabel(category, certificate.recipientSnapshot.achievement);

  const sampleMap: Record<string, string> = {
    '{{recipient.name}}': certificate.recipientSnapshot.fullName,
    '{{recipient.email}}': certificate.recipientSnapshot.email || '',
    '{{recipient.registrationNumber}}': certificate.recipientSnapshot.registrationNumber || '',
    '{{recipient.department}}': certificate.recipientSnapshot.department || '',
    '{{recipient.course}}': certificate.recipientSnapshot.course || certificate.eventSnapshot.name,
    '{{recipient.achievement}}': roleLabel,
    '{{recipient.category}}': getCategoryDisplayTitle(category),
    '{{recipient.role}}': roleLabel,
    '{{recipient.rank}}': rankLabel,
    '{{organization.name}}': certificate.organizationSnapshot.name,
    '{{organization.address}}': certificate.organizationSnapshot.address || '',
    '{{event.name}}': certificate.eventSnapshot.name,
    '{{event.date}}': certificate.eventSnapshot.startDate,
    '{{event.dateRange}}': certificate.eventSnapshot.startDate ? `${certificate.eventSnapshot.startDate}${certificate.eventSnapshot.endDate ? ` - ${certificate.eventSnapshot.endDate}` : ''}` : '',
    '{{event.venue}}': certificate.eventSnapshot.location,
    '{{certificate.type}}': certCategoryTitle,
    '{{certificate.title}}': certMainTitle,
    '{{certificate.code}}': certificate.certificateCode,
    '{{certificate.issueDate}}': certificate.generatedAt.split('T')[0],
    '{{signatory.name}}': certificate.organizationSnapshot.signatoryName,
    '{{signatory.designation}}': certificate.organizationSnapshot.signatoryDesignation,
  };

  const sortedElements = [...template.elements].sort((a, b) => a.zIndex - b.zIndex);

  for (const elem of sortedElements) {
    if (!elem.visible) continue;
    const pdfY = height - elem.y - elem.height;

    if (elem.type === 'text' || elem.type === 'dynamic-text' || elem.type === 'certificate-code') {
      let textContent = elem.textValue || '';
      if (elem.type === 'dynamic-text' && elem.dynamicBinding) {
        textContent = sampleMap[elem.dynamicBinding] || elem.fallbackValue || elem.dynamicBinding;
      } else if (elem.type === 'certificate-code') {
        textContent = certificate.certificateCode;
      }

      if (elem.textStyle?.textTransform === 'uppercase') textContent = textContent.toUpperCase();
      else if (elem.textStyle?.textTransform === 'lowercase') textContent = textContent.toLowerCase();
      else if (elem.textStyle?.textTransform === 'capitalize') textContent = textContent.replace(/\b\w/g, (l) => l.toUpperCase());

      const isSerif = ['Cinzel', 'Playfair Display', 'Times New Roman', 'Georgia'].some((f) => elem.textStyle?.fontFamily?.includes(f));
      const isBold = elem.textStyle?.fontWeight === 'bold' || elem.textStyle?.fontWeight === '700';
      const fontObj = isSerif ? (isBold ? timesBold : timesRoman) : (isBold ? helveticaBold : helveticaFont);

      let fontSize = elem.textStyle?.fontSize || 16;
      if (elem.textStyle?.autoFit) {
        let textWidth = fontObj.widthOfTextAtSize(textContent, fontSize);
        const minSize = elem.textStyle.minFontSize || 14;
        while (textWidth > elem.width && fontSize > minSize) {
          fontSize -= 1;
          textWidth = fontObj.widthOfTextAtSize(textContent, fontSize);
        }
      }

      const fontColor = hexToRgb(elem.textStyle?.fill || '#0F172A') || rgb(0, 0, 0);
      let pdfX = elem.x;
      const textWidth = fontObj.widthOfTextAtSize(textContent, fontSize);
      if (elem.textStyle?.align === 'center') pdfX = elem.x + (elem.width - textWidth) / 2;
      else if (elem.textStyle?.align === 'right') pdfX = elem.x + elem.width - textWidth;

      page.drawText(textContent, {
        x: pdfX,
        y: pdfY + (elem.height - fontSize) / 2,
        size: fontSize,
        font: fontObj,
        color: fontColor,
        opacity: elem.opacity ?? 1,
      });
    } else if (elem.type === 'shape' && elem.shapeStyle) {
      const fillColor = hexToRgb(elem.shapeStyle.fill);
      const strokeColor = hexToRgb(elem.shapeStyle.stroke);
      const strokeWidth = elem.shapeStyle.strokeWidth || 0;

      if (['rectangle', 'rounded-rectangle', 'square'].includes(elem.shapeStyle.shapeType)) {
        page.drawRectangle({
          x: elem.x,
          y: pdfY,
          width: elem.width,
          height: elem.height,
          color: fillColor || undefined,
          borderColor: strokeColor || undefined,
          borderWidth: strokeWidth,
          opacity: elem.opacity ?? 1,
        });
      } else if (['circle', 'ellipse'].includes(elem.shapeStyle.shapeType)) {
        page.drawEllipse({
          x: elem.x + elem.width / 2,
          y: pdfY + elem.height / 2,
          xScale: elem.width / 2,
          yScale: elem.height / 2,
          color: fillColor || undefined,
          borderColor: strokeColor || undefined,
          borderWidth: strokeWidth,
          opacity: elem.opacity ?? 1,
        });
      } else if (['line', 'arrow'].includes(elem.shapeStyle.shapeType) && strokeColor) {
        page.drawLine({
          start: { x: elem.x, y: pdfY + elem.height / 2 },
          end: { x: elem.x + elem.width, y: pdfY + elem.height / 2 },
          thickness: strokeWidth || 2,
          color: strokeColor,
          opacity: elem.opacity ?? 1,
        });
      }
    } else if (elem.type === 'border' && elem.borderStyle) {
      const borderColor = hexToRgb(elem.borderStyle.color) || rgb(0.12, 0.25, 0.69);
      const borderWidth = elem.borderStyle.width || 3;
      page.drawRectangle({ x: elem.x, y: pdfY, width: elem.width, height: elem.height, borderColor, borderWidth, opacity: elem.opacity ?? 1 });
      if (elem.borderStyle.borderType === 'double' || elem.borderStyle.borderType === 'ornate') {
        const inset = elem.borderStyle.inset || 6;
        page.drawRectangle({
          x: elem.x + inset,
          y: pdfY + inset,
          width: Math.max(10, elem.width - inset * 2),
          height: Math.max(10, elem.height - inset * 2),
          borderColor,
          borderWidth: Math.max(1, borderWidth - 1.5),
          opacity: elem.opacity ?? 1,
        });
      }
    } else if ((elem.type === 'image' || elem.type === 'logo' || elem.type === 'signature') && elem.imageStyle?.src) {
      try {
        const isPng = elem.imageStyle.src.startsWith('data:image/png');
        const imgBytes = await fetch(elem.imageStyle.src).then((r) => r.arrayBuffer());
        const embeddedImg = isPng ? await pdfDoc.embedPng(imgBytes) : await pdfDoc.embedJpg(imgBytes);
        page.drawImage(embeddedImg, { x: elem.x, y: pdfY, width: elem.width, height: elem.height, opacity: elem.opacity ?? 1 });
      } catch (e) {
        console.error(e);
      }
    } else if (elem.type === 'qr') {
      try {
        const qrDataUrl = await QRCode.toDataURL(`https://certifyhub.app/verify/${certificate.certificateCode}`, { margin: 1 });
        const qrImageBytes = await fetch(qrDataUrl).then((res) => res.arrayBuffer());
        const embeddedQr = await pdfDoc.embedPng(qrImageBytes);
        page.drawImage(embeddedQr, { x: elem.x, y: pdfY, width: elem.width, height: elem.height, opacity: elem.opacity ?? 1 });
      } catch (e) {
        console.error(e);
      }
    }
  }

  return await pdfDoc.save();
}
