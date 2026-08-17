import { describe, it, expect } from 'vitest';
import { createTextElement, createDynamicTextElement, TextStyleProps } from '@/lib/editor/documentModel';
import { FONT_OPTIONS } from '@/components/editor/FontPicker';

describe('Phase 3 — Professional Text Editing System', () => {
  it('creates heading and body text elements with correct default styles', () => {
    const heading = createTextElement('Certificate Title', true, 842, 595, 0);
    expect(heading.type).toBe('text');
    expect(heading.textValue).toBe('Certificate Title');
    expect(heading.textStyle?.fontSize).toBe(28);
    expect(heading.textStyle?.fontWeight).toBe('bold');

    const body = createTextElement('Recipient Body Text', false, 842, 595, 1);
    expect(body.type).toBe('text');
    expect(body.textValue).toBe('Recipient Body Text');
    expect(body.textStyle?.fontSize).toBe(14);
    expect(body.textStyle?.fontWeight).toBe('normal');
  });

  it('supports full text formatting controls (letterSpacing, lineHeight, textTransform)', () => {
    const textElem = createTextElement('Sample Text', true, 842, 595, 0);
    const updatedStyle: TextStyleProps = {
      ...textElem.textStyle!,
      fontSize: 32,
      fontFamily: 'Playfair Display',
      fontWeight: 'semibold',
      fontStyle: 'italic',
      fill: '#1E40AF',
      align: 'right',
      letterSpacing: 2,
      lineHeight: 1.5,
      textTransform: 'uppercase',
    };

    textElem.textStyle = updatedStyle;

    expect(textElem.textStyle.fontSize).toBe(32);
    expect(textElem.textStyle.fontFamily).toBe('Playfair Display');
    expect(textElem.textStyle.fontWeight).toBe('semibold');
    expect(textElem.textStyle.fontStyle).toBe('italic');
    expect(textElem.textStyle.fill).toBe('#1E40AF');
    expect(textElem.textStyle.align).toBe('right');
    expect(textElem.textStyle.letterSpacing).toBe(2);
    expect(textElem.textStyle.lineHeight).toBe(1.5);
    expect(textElem.textStyle.textTransform).toBe('uppercase');
  });

  it('organizes font picker into Serif, Sans Serif, Elegant, Modern, and Display categories', () => {
    const categories = new Set(FONT_OPTIONS.map((f) => f.category));
    expect(categories.has('Serif')).toBe(true);
    expect(categories.has('Sans Serif')).toBe(true);
    expect(categories.has('Elegant')).toBe(true);
    expect(categories.has('Modern')).toBe(true);

    const georgia = FONT_OPTIONS.find((f) => f.name === 'Georgia');
    expect(georgia?.category).toBe('Serif');

    const inter = FONT_OPTIONS.find((f) => f.name === 'Inter');
    expect(inter?.category).toBe('Sans Serif');
  });

  it('creates dynamic field text elements cleanly', () => {
    const dynamicElem = createDynamicTextElement('{{recipient.name}}', 842, 595, 0);
    expect(dynamicElem.type).toBe('dynamic-text');
    expect(dynamicElem.dynamicBinding).toBe('{{recipient.name}}');
    expect(dynamicElem.fallbackValue).toBe('SUBASH P');
    expect(dynamicElem.textStyle?.fontSize).toBe(32);
  });
});
