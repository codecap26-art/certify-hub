import { describe, it, expect } from 'vitest';
import {
  createShapeElement,
  createDecorativeShapePreset,
  DocumentElement,
  ShapeVariant,
} from '@/lib/editor/documentModel';
import { BUILT_IN_TEMPLATES } from '@/lib/template/builtInTemplates';

describe('Phase 2 — Customizable Shape System', () => {
  it('creates all 8 required shape types with valid default properties', () => {
    const shapeTypes: ShapeVariant[] = [
      'rectangle',
      'rounded-rectangle',
      'circle',
      'ellipse',
      'line',
      'triangle',
      'star',
      'polygon',
    ];

    shapeTypes.forEach((type) => {
      const shape = createShapeElement(type, 842, 595, 5);
      expect(shape.id).toBeDefined();
      expect(shape.type).toBe('shape');
      expect(shape.zIndex).toBe(6);
      expect(shape.visible).toBe(true);
      expect(shape.locked).toBe(false);
      expect(shape.shapeStyle?.shapeType).toBe(type);
      expect(shape.shapeStyle?.fill).toBeDefined();
      expect(shape.shapeStyle?.stroke).toBeDefined();
      expect(shape.shapeStyle?.strokeWidth).toBeGreaterThanOrEqual(0);
    });
  });

  it('creates rounded-rectangle with custom corner radius', () => {
    const shape = createShapeElement('rounded-rectangle', 842, 595, 0);
    expect(shape.shapeStyle?.cornerRadius).toBe(12);
  });

  it('creates star and polygon with custom point counts', () => {
    const star = createShapeElement('star', 842, 595, 0);
    expect(star.shapeStyle?.points).toBe(5);

    const polygon = createShapeElement('polygon', 842, 595, 0);
    expect(polygon.shapeStyle?.points).toBe(6);
  });

  it('creates certificate decorative shape presets cleanly', () => {
    const presets = [
      'divider',
      'double-divider',
      'corner-ornament',
      'decorative-circle',
      'star-accent',
      'seal-placeholder',
    ] as const;

    presets.forEach((preset) => {
      const elem = createDecorativeShapePreset(preset, 842, 595, 10);
      expect(elem.id).toBeDefined();
      expect(elem.type).toBe('shape');
      expect(elem.zIndex).toBe(11);
      expect(elem.shapeStyle).toBeDefined();
    });
  });

  it('includes Phase 2 shape showcase template in built-in templates', () => {
    const showcase = BUILT_IN_TEMPLATES.find((t) => t.id === 'tmpl-phase2-shape-showcase');
    expect(showcase).toBeDefined();
    expect(showcase?.elements.length).toBeGreaterThanOrEqual(10);
    
    // Check that it contains required shape types
    const shapeTypesInShowcase = showcase?.elements
      .filter((e) => e.type === 'shape')
      .map((e) => e.shapeStyle?.shapeType);

    expect(shapeTypesInShowcase).toContain('rectangle');
    expect(shapeTypesInShowcase).toContain('rounded-rectangle');
    expect(shapeTypesInShowcase).toContain('line');
    expect(shapeTypesInShowcase).toContain('circle');
    expect(shapeTypesInShowcase).toContain('star');
    expect(shapeTypesInShowcase).toContain('triangle');
    expect(shapeTypesInShowcase).toContain('polygon');
  });
});
