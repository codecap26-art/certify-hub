// ============================================================================
// Logo & Partner Manager Repository — Frontend Local Storage
// Category logos: Main Org, Secondary Inst, Department, Organizer, Sponsor, Partner, Accreditation
// ============================================================================

import { getItem, setItem } from './repository';
import { saveAssetToIndexedDB, getAssetFromIndexedDB, removeAssetFromIndexedDB } from './indexedDbStorage';

export type LogoCategory =
  | 'Main Organization'
  | 'Secondary Institution'
  | 'Department'
  | 'Organizer'
  | 'Sponsor'
  | 'Partner'
  | 'Accreditation';

export interface LogoRecord {
  id: string;
  name: string;
  category: LogoCategory;
  dataUrl?: string;
  aspectRatio: number; // width / height
  lowResWarning?: boolean;
  permissionConfirmed: boolean;
  createdAt: string;
}

const STORAGE_KEY = 'organization_logos';

export const logoRepository = {
  getAll(): LogoRecord[] {
    return getItem<LogoRecord[]>(STORAGE_KEY, []);
  },

  async getById(id: string): Promise<LogoRecord | null> {
    const list = this.getAll();
    const logo = list.find((l) => l.id === id);
    if (!logo) return null;

    if (logo.dataUrl && logo.dataUrl.startsWith('indexeddb:')) {
      const assetKey = logo.dataUrl.replace('indexeddb:', '');
      const dataUrl = await getAssetFromIndexedDB(assetKey);
      if (dataUrl) logo.dataUrl = dataUrl;
    }
    return logo;
  },

  async save(logo: LogoRecord): Promise<boolean> {
    const list = this.getAll();
    let lightweight = { ...logo };

    if (logo.dataUrl && logo.dataUrl.startsWith('data:')) {
      const assetKey = `logo_asset_${logo.id}`;
      await saveAssetToIndexedDB(assetKey, logo.dataUrl);
      lightweight.dataUrl = `indexeddb:${assetKey}`;
    }

    const idx = list.findIndex((l) => l.id === logo.id);
    if (idx >= 0) {
      list[idx] = lightweight;
    } else {
      list.push(lightweight);
    }
    return setItem(STORAGE_KEY, list);
  },

  async delete(id: string): Promise<boolean> {
    const list = this.getAll();
    const filtered = list.filter((l) => l.id !== id);
    await removeAssetFromIndexedDB(`logo_asset_${id}`);
    return setItem(STORAGE_KEY, filtered);
  },
};
