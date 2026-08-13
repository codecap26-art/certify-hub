// ============================================================================
// Signatory Manager Repository — Frontend Local Storage
// Reusable signatories (1 to 6) with permission confirmation
// ============================================================================

import { getItem, setItem } from './repository';
import { saveAssetToIndexedDB, getAssetFromIndexedDB, removeAssetFromIndexedDB } from './indexedDbStorage';

export interface SignatoryRecord {
  id: string;
  name: string;
  designation: string;
  department?: string;
  organization?: string;
  titlePrefix?: string; // e.g. "Dr.", "Prof."
  signatureDataUrl?: string;
  isActive: boolean;
  order: number;
  permissionConfirmed: boolean;
  lowResWarning?: boolean;
}

const STORAGE_KEY = 'signatories';

export const DEFAULT_SIGNATORIES: SignatoryRecord[] = [
  { id: 'sig-1', name: 'Dr. R. Sundaram', designation: 'Convener & Professor', department: 'Computer Science', organization: 'ABC Engineering College', titlePrefix: 'Dr.', isActive: true, order: 1, permissionConfirmed: true },
  { id: 'sig-2', name: 'Dr. M. Lakshmi', designation: 'Head of Department', department: 'Computer Science', organization: 'ABC Engineering College', titlePrefix: 'Dr.', isActive: true, order: 2, permissionConfirmed: true },
  { id: 'sig-3', name: 'Prof. V. Anand', designation: 'Dean of Academics', department: 'Academic Affairs', organization: 'ABC Engineering College', titlePrefix: 'Prof.', isActive: true, order: 3, permissionConfirmed: true },
  { id: 'sig-4', name: 'Dr. S. K. Verma', designation: 'Registrar', department: 'Administration', organization: 'ABC Engineering College', titlePrefix: 'Dr.', isActive: true, order: 4, permissionConfirmed: true },
  { id: 'sig-5', name: 'Dr. K. Parthasarathy', designation: 'Principal & Dean', department: 'Executive Management', organization: 'ABC Engineering College', titlePrefix: 'Dr.', isActive: true, order: 5, permissionConfirmed: true },
];

export const signatoryRepository = {
  getAll(): SignatoryRecord[] {
    const list = getItem<SignatoryRecord[]>(STORAGE_KEY, []);
    if (list.length === 0) {
      setItem(STORAGE_KEY, DEFAULT_SIGNATORIES);
      return DEFAULT_SIGNATORIES;
    }
    return list.sort((a, b) => a.order - b.order);
  },

  async getById(id: string): Promise<SignatoryRecord | null> {
    const list = this.getAll();
    const sig = list.find((s) => s.id === id);
    if (!sig) return null;

    if (sig.signatureDataUrl && sig.signatureDataUrl.startsWith('indexeddb:')) {
      const assetKey = sig.signatureDataUrl.replace('indexeddb:', '');
      const dataUrl = await getAssetFromIndexedDB(assetKey);
      if (dataUrl) sig.signatureDataUrl = dataUrl;
    }
    return sig;
  },

  async save(sig: SignatoryRecord): Promise<boolean> {
    const list = this.getAll();
    let lightweightSig = { ...sig };

    if (sig.signatureDataUrl && sig.signatureDataUrl.startsWith('data:')) {
      const assetKey = `sig_asset_${sig.id}`;
      await saveAssetToIndexedDB(assetKey, sig.signatureDataUrl);
      lightweightSig.signatureDataUrl = `indexeddb:${assetKey}`;
    }

    const idx = list.findIndex((s) => s.id === sig.id);
    if (idx >= 0) {
      list[idx] = lightweightSig;
    } else {
      list.push(lightweightSig);
    }
    return setItem(STORAGE_KEY, list);
  },

  async delete(id: string): Promise<boolean> {
    const list = this.getAll();
    const filtered = list.filter((s) => s.id !== id);
    await removeAssetFromIndexedDB(`sig_asset_${id}`);
    return setItem(STORAGE_KEY, filtered);
  },

  async reorder(orderedIds: string[]): Promise<boolean> {
    const list = this.getAll();
    const updated = list.map((sig) => {
      const newOrder = orderedIds.indexOf(sig.id);
      return newOrder >= 0 ? { ...sig, order: newOrder + 1 } : sig;
    });
    return setItem(STORAGE_KEY, updated);
  },
};
