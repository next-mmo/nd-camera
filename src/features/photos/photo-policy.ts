/** Pure validation shared by native adapters and dependency-free tests. */
export const MAX_IMAGE_BYTES = 40 * 1024 * 1024;

const extensions: Record<string, string> = {
  'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp',
  'image/heic': 'heic', 'image/heif': 'heif',
};

export interface PhotoInput {
  uri: string;
  mimeType: string;
  name?: string;
}

export interface ImportedPhoto extends PhotoInput {
  id: string;
  width: number;
  height: number;
  byteSize: number;
  origin: 'picker' | 'share';
}

export function imageExtension(mimeType: string): string {
  const normalized = mimeType.split(';')[0]?.trim().toLowerCase();
  const extension = normalized ? extensions[normalized] : undefined;
  if (!extension) throw new Error('Use a JPEG, PNG, WebP, HEIC, or HEIF photo. RAW and video are not supported yet.');
  return extension;
}

export function normalizeImageMime(mimeType?: string | null, name?: string | null): string {
  let normalized = mimeType?.split(';')[0]?.trim().toLowerCase();
  if (normalized === 'image/jpg') normalized = 'image/jpeg';
  if (!normalized || normalized === 'image/*' || normalized === 'application/octet-stream') {
    const extension = name?.split(/[?#]/)[0]?.split('.').pop()?.toLowerCase();
    normalized = ({jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp', heic: 'image/heic', heif: 'image/heif'} as Record<string, string>)[extension ?? ''];
  }
  imageExtension(normalized ?? '');
  return normalized!;
}

export function assertLocalUri(uri: string): void {
  // Do not fetch remote URLs or accept arbitrary paths/deep links as images.
  if (!/^(file:\/\/\/|content:\/\/)[^\s]+$/i.test(uri)) {
    throw new Error('Share a local image file, not a web link. Download it first or use Import a photo.');
  }
}

export function assertImageSize(bytes: number): void {
  if (!Number.isFinite(bytes) || bytes <= 0 || bytes > MAX_IMAGE_BYTES) {
    throw new Error('Choose a readable photo smaller than 40 MB.');
  }
}

export function displayName(name: string | undefined, fallback: string): string {
  const clean = name?.split(/[\\/]/).pop()?.replace(/[\u0000-\u001f\u007f\u202a-\u202e\u2066-\u2069]/g, '').trim();
  return clean?.slice(0, 120) || fallback;
}

export function parseSharedImage(payloads: unknown): PhotoInput {
  if (!Array.isArray(payloads) || payloads.length !== 1) {
    throw new Error('Share one photo at a time with ND Camera.');
  }
  const payload = payloads[0] as Record<string, unknown> | null;
  if (!payload || typeof payload !== 'object' ||
      (payload.shareType !== 'image' && payload.shareType !== 'file') ||
      typeof payload.value !== 'string') {
    throw new Error('ND Camera currently accepts image files only.');
  }
  assertLocalUri(payload.value);
  const mimeType = normalizeImageMime(typeof payload.mimeType === 'string' ? payload.mimeType : null, payload.value);
  return { uri: payload.value, mimeType };
}

export function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'The photo could not be opened. Try importing it from your gallery.';
}
