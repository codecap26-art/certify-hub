import { getItem, setItem } from './repository';
import { saveAssetToIndexedDB, getAssetFromIndexedDB, removeAssetFromIndexedDB } from './indexedDbStorage';
import { CustomTemplate, TemplatePackage } from '@/types/template';

import { BUILT_IN_TEMPLATES } from '@/lib/template/builtInTemplates';

const STORAGE_KEY = 'custom_templates';

export const templateRepository = {
  getAll(): CustomTemplate[] {
    const custom = getItem<CustomTemplate[]>(STORAGE_KEY, []);
    const builtInIds = new Set(BUILT_IN_TEMPLATES.map((t) => t.id));
    // Filter out any stale built-ins saved to custom storage
    const userCustomOnly = custom.filter((t) => !builtInIds.has(t.id) && !t.isBuiltIn);
    return [...BUILT_IN_TEMPLATES, ...userCustomOnly];
  },

  async getById(id: string): Promise<CustomTemplate | null> {
    // 1. Direct match in canonical built-ins first
    let t = BUILT_IN_TEMPLATES.find((item) => item.id === id);
    if (!t) {
      const list = this.getAll();
      t = list.find((item) => item.id === id);
    }

    // Fallback for legacy template string IDs to corresponding built-in templates
    if (!t) {
      if (id === 'modern-blue') {
        t = BUILT_IN_TEMPLATES.find((item) => item.id === 'tmpl-institutional-appreciation');
      } else if (id === 'classic-gold') {
        t = BUILT_IN_TEMPLATES.find((item) => item.id === 'tmpl-competition-winner');
      } else if (id === 'minimal-green') {
        t = BUILT_IN_TEMPLATES.find((item) => item.id === 'tmpl-academic-participation');
      } else if (id === 'academic-maroon') {
        t = BUILT_IN_TEMPLATES.find((item) => item.id === 'tmpl-training-completion');
      }
    }

    if (!t) return null;

    // Restore assets from IndexedDB if stored as references
    if (t.id) {
      const bg = await getAssetFromIndexedDB(`bg_${t.id}`);
      if (bg) t.backgroundDataUrl = bg;

      const thumb = await getAssetFromIndexedDB(`thumb_${t.id}`);
      if (thumb) t.thumbnailDataUrl = thumb;

      // Restore element image src data URLs from IndexedDB
      if (t.elements && Array.isArray(t.elements)) {
        t.elements = await Promise.all(
          t.elements.map(async (el) => {
            if (el.imageStyle?.src && el.imageStyle.src.startsWith('indexeddb:')) {
              const assetKey = el.imageStyle.src.replace('indexeddb:', '');
              const src = await getAssetFromIndexedDB(assetKey);
              if (src) {
                return {
                  ...el,
                  imageStyle: {
                    ...el.imageStyle,
                    src,
                    originalSrc: src,
                  },
                };
              }
            }
            return el;
          })
        );
      }
    }

    return t;
  },

  async save(template: CustomTemplate): Promise<boolean> {
    const list = this.getAll();

    // Store large background and thumbnail assets in IndexedDB
    if (template.backgroundDataUrl && !template.backgroundDataUrl.startsWith('indexeddb:')) {
      await saveAssetToIndexedDB(`bg_${template.id}`, template.backgroundDataUrl);
    }
    if (template.thumbnailDataUrl && !template.thumbnailDataUrl.startsWith('indexeddb:')) {
      await saveAssetToIndexedDB(`thumb_${template.id}`, template.thumbnailDataUrl);
    }

    // Offload embedded element image Data URLs to IndexedDB
    const lightweightElements = await Promise.all(
      (template.elements || []).map(async (el) => {
        if (el.imageStyle?.src && el.imageStyle.src.startsWith('data:')) {
          const assetKey = `img_${template.id}_${el.id}`;
          await saveAssetToIndexedDB(assetKey, el.imageStyle.src);
          return {
            ...el,
            imageStyle: {
              ...el.imageStyle,
              src: `indexeddb:${assetKey}`,
              originalSrc: `indexeddb:${assetKey}`,
            },
          };
        }
        return el;
      })
    );

    // Save lightweight metadata in localStorage
    const lightweightTemplate: CustomTemplate = {
      ...template,
      elements: lightweightElements,
      backgroundDataUrl: template.backgroundDataUrl ? `indexeddb:bg_${template.id}` : '',
      thumbnailDataUrl: template.thumbnailDataUrl ? `indexeddb:thumb_${template.id}` : '',
      updatedAt: new Date().toISOString(),
    };

    const existingIndex = list.findIndex((t) => t.id === template.id);
    if (existingIndex >= 0) {
      list[existingIndex] = lightweightTemplate;
    } else {
      list.push(lightweightTemplate);
    }

    return setItem(STORAGE_KEY, list);
  },

  async duplicate(id: string): Promise<CustomTemplate | null> {
    const original = await this.getById(id);
    if (!original) return null;

    const copyId = `tmpl-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const copy: CustomTemplate = {
      ...original,
      id: copyId,
      name: `${original.name} (Copy)`,
      category: 'Custom',
      isBuiltIn: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await this.save(copy);
    return copy;
  },

  async delete(id: string): Promise<boolean> {
    const list = this.getAll();
    const filtered = list.filter((t) => t.id !== id);

    await removeAssetFromIndexedDB(`bg_${id}`);
    await removeAssetFromIndexedDB(`thumb_${id}`);

    return setItem(STORAGE_KEY, filtered);
  },

  async exportPackage(id: string): Promise<string | null> {
    const template = await this.getById(id);
    if (!template) return null;

    const assets: Record<string, string> = {};
    if (template.backgroundDataUrl && !template.backgroundDataUrl.startsWith('indexeddb:')) {
      assets['background'] = template.backgroundDataUrl;
    }
    if (template.thumbnailDataUrl && !template.thumbnailDataUrl.startsWith('indexeddb:')) {
      assets['thumbnail'] = template.thumbnailDataUrl;
    }

    const pkg: TemplatePackage = {
      template,
      assets,
      exportedAt: new Date().toISOString(),
      version: 1,
    };

    return JSON.stringify(pkg, null, 2);
  },

  async importPackage(jsonString: string): Promise<CustomTemplate | null> {
    try {
      const pkg = JSON.parse(jsonString) as TemplatePackage;
      if (!pkg.template || !pkg.template.id || !pkg.template.name) {
        throw new Error('Invalid template package structure.');
      }

      const importedId = `tmpl-imp-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
      const templateToSave: CustomTemplate = {
        ...pkg.template,
        id: importedId,
        name: `${pkg.template.name} (Imported)`,
        category: 'Imported',
        isBuiltIn: false,
        isImported: true,
        backgroundDataUrl: pkg.assets?.background || pkg.template.backgroundDataUrl || '',
        thumbnailDataUrl: pkg.assets?.thumbnail || pkg.template.thumbnailDataUrl || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await this.save(templateToSave);
      return templateToSave;
    } catch (error) {
      console.error('Failed to import template package:', error);
      return null;
    }
  },
};
