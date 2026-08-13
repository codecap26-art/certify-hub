import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import QRCode from 'qrcode';
import { CertificateRecord } from '@/types';
import { CustomTemplate, TemplateElement } from '@/types/template';

export async function generatePdfFromCustomTemplate(
  certificate: CertificateRecord,
  template: CustomTemplate
): Promise<Uint8Array> {
  const isLandscape = template.orientation === 'landscape';
  const width = isLandscape ? 842 : 595;
  const height = isLandscape ? 595 : 842;

  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([width, height]);

  // Standard Fonts
  const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const timesRoman = await pdfDoc.embedFont(StandardFonts.TimesRoman);
  const timesBold = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);

  // Helper: Hex Color to RGB
  const hexToRgb = (hexStr: string) => {
    if (!hexStr || hexStr === 'transparent') return null;
    const clean = hexStr.replace('#', '');
    const r = parseInt(clean.substring(0, 2), 16) / 255;
    const g = parseInt(clean.substring(2, 4), 16) / 255;
    const b = parseInt(clean.substring(4, 6), 16) / 255;
    return rgb(isNaN(r) ? 0 : r, isNaN(g) ? 0 : g, isNaN(b) ? 0 : b);
  };

  // 1. Solid Background Color
  if (template.backgroundColor && template.backgroundColor !== 'transparent') {
    const bgColor = hexToRgb(template.backgroundColor);
    if (bgColor) {
      page.drawRectangle({
        x: 0,
        y: 0,
        width,
        height,
        color: bgColor,
      });
    }
  }

  // 2. Background Image
  if (template.backgroundDataUrl && template.backgroundDataUrl.startsWith('data:image')) {
    try {
      const isPng = template.backgroundDataUrl.startsWith('data:image/png');
      const imageBytes = await fetch(template.backgroundDataUrl).then((res) => res.arrayBuffer());
      const embeddedBg = isPng ? await pdfDoc.embedPng(imageBytes) : await pdfDoc.embedJpg(imageBytes);
      page.drawImage(embeddedBg, {
        x: 0,
        y: 0,
        width,
        height,
      });
    } catch (err) {
      console.error('Failed to embed background image in PDF:', err);
    }
  }

  // Prepare Dynamic Sample Map
  const sampleMap: Record<string, string> = {
    '{{recipient.name}}': certificate.recipientSnapshot.fullName,
    '{{recipient.email}}': certificate.recipientSnapshot.email || '',
    '{{recipient.registrationNumber}}': certificate.recipientSnapshot.registrationNumber || '',
    '{{recipient.department}}': certificate.recipientSnapshot.department || '',
    '{{recipient.course}}': certificate.recipientSnapshot.course || certificate.eventSnapshot.name,
    '{{recipient.achievement}}': certificate.recipientSnapshot.achievement || '',

    '{{organization.name}}': certificate.organizationSnapshot.name,
    '{{event.name}}': certificate.eventSnapshot.name,
    '{{event.date}}': certificate.eventSnapshot.startDate,
    '{{event.venue}}': certificate.eventSnapshot.location,

    '{{certificate.type}}': certificate.eventSnapshot.certificateType || 'Certificate of Participation',
    '{{certificate.code}}': certificate.certificateCode,
    '{{certificate.issueDate}}': certificate.generatedAt.split('T')[0],

    '{{signatory.name}}': certificate.organizationSnapshot.signatoryName,
    '{{signatory.designation}}': certificate.organizationSnapshot.signatoryDesignation,
  };

  // 3. Render Elements Sorted by Z-Index
  const sortedElements = [...template.elements].sort((a, b) => a.zIndex - b.zIndex);

  for (const elem of sortedElements) {
    if (!elem.visible) continue;

    // Convert Canvas Y (Top-Left Origin) to PDF Y (Bottom-Left Origin)
    const pdfY = height - elem.y - elem.height;

    if (elem.type === 'text' || elem.type === 'dynamic-text') {
      let textContent = elem.textValue || '';
      if (elem.type === 'dynamic-text' && elem.dynamicBinding) {
        textContent = sampleMap[elem.dynamicBinding] || elem.fallbackValue || elem.dynamicBinding;
      }

      const fontObj =
        elem.textStyle?.fontFamily === 'Georgia' || elem.textStyle?.fontFamily === 'Times New Roman'
          ? elem.textStyle?.fontWeight === 'bold'
            ? timesBold
            : timesRoman
          : elem.textStyle?.fontWeight === 'bold'
          ? helveticaBold
          : helveticaFont;

      const fontSize = elem.textStyle?.fontSize || 16;
      const fontColor = hexToRgb(elem.textStyle?.fill || '#0F172A') || rgb(0, 0, 0);

      let pdfX = elem.x;
      const textWidth = fontObj.widthOfTextAtSize(textContent, fontSize);
      if (elem.textStyle?.align === 'center') {
        pdfX = elem.x + (elem.width - textWidth) / 2;
      } else if (elem.textStyle?.align === 'right') {
        pdfX = elem.x + elem.width - textWidth;
      }

      page.drawText(textContent, {
        x: pdfX,
        y: pdfY + (elem.height - fontSize) / 2,
        size: fontSize,
        font: fontObj,
        color: fontColor,
        opacity: elem.opacity,
      });
    } else if (elem.type === 'shape' && elem.shapeStyle?.shapeType === 'rectangle') {
      const fillColor = hexToRgb(elem.shapeStyle.fill);
      const strokeColor = hexToRgb(elem.shapeStyle.stroke);

      page.drawRectangle({
        x: elem.x,
        y: pdfY,
        width: elem.width,
        height: elem.height,
        color: fillColor || undefined,
        borderColor: strokeColor || undefined,
        borderWidth: elem.shapeStyle.strokeWidth || 0,
        opacity: elem.opacity,
      });
    } else if (elem.type === 'shape' && elem.shapeStyle?.shapeType === 'line') {
      const strokeColor = hexToRgb(elem.shapeStyle.stroke || '#0F172A');
      if (strokeColor) {
        page.drawLine({
          start: { x: elem.x, y: pdfY + elem.height / 2 },
          end: { x: elem.x + elem.width, y: pdfY + elem.height / 2 },
          thickness: elem.shapeStyle.strokeWidth || 2,
          color: strokeColor,
          opacity: elem.opacity,
        });
      }
    } else if (elem.type === 'qr') {
      try {
        const qrDataUrl = await QRCode.toDataURL(certificate.certificateCode, { margin: 1 });
        const qrImageBytes = await fetch(qrDataUrl).then((res) => res.arrayBuffer());
        const embeddedQr = await pdfDoc.embedPng(qrImageBytes);

        page.drawImage(embeddedQr, {
          x: elem.x,
          y: pdfY,
          width: elem.width,
          height: elem.height,
          opacity: elem.opacity,
        });
      } catch (err) {
        console.error('Failed to embed QR code in PDF:', err);
      }
    }
  }

  return await pdfDoc.save();
}
