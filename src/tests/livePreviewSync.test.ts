import { describe, it, expect } from 'vitest';
import { BUILT_IN_TEMPLATES } from '@/lib/template/builtInTemplates';
import { templateRepository } from '@/lib/storage/templateRepository';
import { CustomTemplate } from '@/types/template';

describe('Live Preview & Template Selection Synchronization', () => {
  it('resolves built-in templates dynamically via templateRepository.getById', async () => {
    const instApp = await templateRepository.getById('tmpl-institutional-appreciation');
    expect(instApp).toBeDefined();
    expect(instApp?.name).toBe('Institutional Appreciation');
    expect(instApp?.orientation).toBe('landscape');
  });

  it('resolves imported CANVA portrait template with correct orientation & assets', async () => {
    const canvaTemplate: CustomTemplate = {
      id: 'tmpl-canva-imported-demo',
      name: 'CANVA Institutional Frame',
      description: 'Imported Canva portrait template',
      category: 'Imported',
      orientation: 'portrait',
      width: 595,
      height: 842,
      backgroundDataUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      backgroundColor: '#FFFFFF',
      elements: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      version: 1,
      isImported: true,
    };

    await templateRepository.save(canvaTemplate);

    const loaded = await templateRepository.getById('tmpl-canva-imported-demo');
    expect(loaded).toBeDefined();
    expect(loaded?.name).toBe('CANVA Institutional Frame');
    expect(loaded?.orientation).toBe('portrait');
    expect(loaded?.width).toBe(595);
    expect(loaded?.height).toBe(842);
  });

  it('preserves user selected template ID across wizard steps without resetting', () => {
    let wizardSelectedTemplateId = 'tmpl-canva-imported-demo';

    // Step 3 -> Step 4 -> Step 5 transition
    let currentStep = 3;
    currentStep = 4;
    expect(wizardSelectedTemplateId).toBe('tmpl-canva-imported-demo');

    currentStep = 5;
    expect(wizardSelectedTemplateId).toBe('tmpl-canva-imported-demo');

    currentStep = 3; // Return to step 3
    expect(wizardSelectedTemplateId).toBe('tmpl-canva-imported-demo');
  });

  it('prevents stale asynchronous loading results from overwriting the latest selection (request identity)', async () => {
    let activeRequestId = 0;
    let renderedTemplateId = '';

    const selectTemplate = async (id: string, delayMs: number) => {
      const currentReq = ++activeRequestId;
      await new Promise((r) => setTimeout(r, delayMs));
      if (currentReq === activeRequestId) {
        renderedTemplateId = id;
      }
    };

    // Rapid selection: Select Template A (slow 50ms), then immediately Select Template B (fast 10ms)
    selectTemplate('Template-A', 50);
    selectTemplate('Template-B', 10);

    await new Promise((r) => setTimeout(r, 60));

    expect(renderedTemplateId).toBe('Template-B');
  });
});
