/** Product roadmap, not calibrated profiles or a working rendering engine. */
export const ND_STYLES = [
  { id: 'natural', name: 'ND Natural', description: 'Balanced color and tone', available: false },
  { id: 'warm', name: 'Warm Portrait', description: 'A warmer portrait direction', available: false },
  { id: 'rich', name: 'Rich Contrast', description: 'A deeper tonal direction', available: false },
] as const;

export interface EditRecipe {
  schemaVersion: 1;
  sourcePhotoId: string;
  profileId: string;
  strength: number;
}

/** Never silently export an original as though a requested effect was applied. */
export function requireAvailableProfile(profileId: string): void {
  if (profileId !== 'original') {
    throw new Error('ND style processing is not implemented in this starter. Only the original can be shared.');
  }
}
