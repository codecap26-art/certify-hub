import { STORAGE_PREFIX } from '../constants';

export function isClient(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

export function getItem<T>(key: string, defaultValue: T): T {
  if (!isClient()) return defaultValue;
  try {
    const raw = window.localStorage.getItem(`${STORAGE_PREFIX}${key}`);
    if (!raw) return defaultValue;
    return JSON.parse(raw) as T;
  } catch (error) {
    console.error(`Error reading key "${key}" from localStorage:`, error);
    return defaultValue;
  }
}

export function setItem<T>(key: string, value: T): boolean {
  if (!isClient()) return false;
  try {
    const serialized = JSON.stringify(value);
    window.localStorage.setItem(`${STORAGE_PREFIX}${key}`, serialized);
    return true;
  } catch (error: unknown) {
    const errName = (error as { name?: string })?.name || '';
    const isQuotaError =
      errName === 'QuotaExceededError' ||
      errName === 'NS_ERROR_DOM_QUOTA_REACHED' ||
      (error instanceof DOMException && error.code === 22);

    if (isQuotaError) {
      console.warn(
        `LocalStorage quota exceeded while setting key "${key}". Attempting optimization...`
      );

      // If value is an array (like custom_templates or certificates), strip image Base64 data URLs
      if (Array.isArray(value)) {
        const lightweightValue = value.map((item) => {
          if (item && typeof item === 'object') {
            const copy = { ...item };
            if ('organizationSnapshot' in copy && copy.organizationSnapshot) {
              copy.organizationSnapshot = {
                ...copy.organizationSnapshot,
                logoDataUrl: '',
                signatureDataUrl: '',
              };
            }
            if ('elements' in copy && Array.isArray(copy.elements)) {
              copy.elements = copy.elements.map((el: Record<string, unknown>) => {
                if (el && typeof el === 'object' && el.imageStyle && typeof el.imageStyle === 'object') {
                  const imgStyle = { ...(el.imageStyle as Record<string, unknown>) };
                  if (typeof imgStyle.src === 'string' && imgStyle.src.startsWith('data:')) {
                    imgStyle.src = '';
                    imgStyle.originalSrc = '';
                  }
                  return { ...el, imageStyle: imgStyle };
                }
                return el;
              });
            }
            return copy;
          }
          return item;
        });

        try {
          window.localStorage.setItem(
            `${STORAGE_PREFIX}${key}`,
            JSON.stringify(lightweightValue)
          );
          console.info(`Successfully saved lightweight version of "${key}" after quota check.`);
          return true;
        } catch (retryErr) {
          console.error(`Retry setItem for "${key}" failed after stripping heavy assets:`, retryErr);
        }
      }
    }

    console.error(`Error writing key "${key}" to localStorage:`, error);
    return false;
  }
}

export function removeItem(key: string): void {
  if (!isClient()) return;
  try {
    window.localStorage.removeItem(`${STORAGE_PREFIX}${key}`);
  } catch (error) {
    console.error(`Error removing key "${key}" from localStorage:`, error);
  }
}

export function clearAllCertifyHubKeys(): void {
  if (!isClient()) return;
  try {
    const keysToRemove: string[] = [];
    for (let i = 0; i < window.localStorage.length; i++) {
      const k = window.localStorage.key(i);
      if (k && k.startsWith(STORAGE_PREFIX)) {
        keysToRemove.push(k);
      }
    }
    keysToRemove.forEach((k) => window.localStorage.removeItem(k));
  } catch (error) {
    console.error('Error clearing CertifyHub storage keys:', error);
  }
}
