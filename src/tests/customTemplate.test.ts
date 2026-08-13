import { describe, it, expect, beforeEach } from 'vitest';
import { LocalSmartDesignProvider } from '../lib/template/smartDesignProvider';
import { templateRepository } from '../lib/storage/templateRepository';
import { CustomTemplate, TemplatePackage } from '../types/template';

describe('Custom Template & Smart Assistant System', () => {
  beforeEach(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.clear();
    }
  });

  it('should generate 3 editable layout variations via Smart Design Assistant', async () => {
    const provider = new LocalSmartDesignProvider();
    const layouts = await provider.generateLayouts({
      purpose: 'React 19 Workshop',
      style: 'Academic',
      orientation: 'landscape',
      primaryColor: '#0F172A',
      secondaryColor: '#2563EB',
      organizationType: 'College',
      signatoriesCount: 1,
      hasLogo: true,
      hasQrCode: true,
    });

    expect(layouts.length).toBe(3);
    expect(layouts[0].category).toBe('Smart Design');
    expect(layouts[0].orientation).toBe('landscape');

    // Check dynamic placeholders
    const recNameElem = layouts[0].elements.find((e) => e.dynamicBinding === '{{recipient.name}}');
    expect(recNameElem).toBeDefined();
    expect(recNameElem?.type).toBe('dynamic-text');

    const qrElem = layouts[0].elements.find((e) => e.type === 'qr');
    expect(qrElem).toBeDefined();
  });

  it('should duplicate a custom template correctly', async () => {
    const tmpl: CustomTemplate = {
      id: 'tmpl-test-01',
      name: 'Test Workshop Template',
      description: 'Test template description',
      category: 'Custom',
      orientation: 'landscape',
      width: 842,
      height: 595,
      backgroundColor: '#FFFFFF',
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      elements: [
        {
          id: 'el-1',
          type: 'dynamic-text',
          name: 'Recipient Name',
          x: 100,
          y: 100,
          width: 300,
          height: 40,
          rotation: 0,
          zIndex: 1,
          visible: true,
          locked: false,
          opacity: 1,
          dynamicBinding: '{{recipient.name}}',
        },
      ],
    };

    await templateRepository.save(tmpl);
    const duplicated = await templateRepository.duplicate('tmpl-test-01');

    expect(duplicated).not.toBeNull();
    expect(duplicated?.name).toContain('(Copy)');
    expect(duplicated?.id).not.toBe('tmpl-test-01');
  });

  it('should export and import a template package JSON cleanly', async () => {
    const tmpl: CustomTemplate = {
      id: 'tmpl-export-01',
      name: 'Exportable Template',
      description: 'Export description',
      category: 'Custom',
      orientation: 'portrait',
      width: 595,
      height: 842,
      backgroundColor: '#FFFFFF',
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      elements: [],
    };

    await templateRepository.save(tmpl);
    const pkgJson = await templateRepository.exportPackage('tmpl-export-01');

    expect(pkgJson).not.toBeNull();
    expect(pkgJson).toContain('Exportable Template');

    const imported = await templateRepository.importPackage(pkgJson!);
    expect(imported).not.toBeNull();
    expect(imported?.name).toContain('(Imported)');
    expect(imported?.category).toBe('Imported');
  });
});
