/**
 * ND Styles catalog and ColorMatrix definitions.
 * ColorMatrix is a 4x5 matrix (20 floats) in row-major order:
 * [
 *   R_r, R_g, R_b, R_a, R_offset,
 *   G_r, G_g, G_b, G_a, G_offset,
 *   B_r, B_g, B_b, B_a, B_offset,
 *   A_r, A_g, A_b, A_a, A_offset
 * ]
 */

export type ColorMatrix = readonly number[];

export const IDENTITY_MATRIX: ColorMatrix = [
  1, 0, 0, 0, 0,
  0, 1, 0, 0, 0,
  0, 0, 1, 0, 0,
  0, 0, 0, 1, 0,
];

/**
 * ND Natural:
 * Balanced color and tone. Gentle contrast boost (+6%), slight shadow lift (+2%), natural skin preservation.
 */
export const NATURAL_MATRIX: ColorMatrix = [
  1.06, 0.00, 0.00, 0.00, 0.02,
  0.00, 1.05, 0.00, 0.00, 0.02,
  0.00, 0.00, 1.02, 0.00, 0.00,
  0.00, 0.00, 0.00, 1.00, 0.00,
];

/**
 * Warm Portrait:
 * A warmer portrait direction with subtle golden midtones (+12% red, -6% blue) and lifted shadows.
 */
export const WARM_PORTRAIT_MATRIX: ColorMatrix = [
  1.12, 0.02, 0.00, 0.00, 0.04,
  0.00, 1.06, 0.02, 0.00, 0.02,
  0.00, 0.00, 0.94, 0.00, -0.02,
  0.00, 0.00, 0.00, 1.00, 0.00,
];

/**
 * Rich Contrast:
 * A deeper tonal direction with richer blacks, punchy contrast (+20%), and cinematic depth.
 */
export const RICH_CONTRAST_MATRIX: ColorMatrix = [
  1.22, -0.04, -0.02, 0.00, -0.06,
  -0.02, 1.20, -0.02, 0.00, -0.06,
  -0.02, -0.04, 1.18, 0.00, -0.05,
  0.00,  0.00,  0.00, 1.00,  0.00,
];

export const PROFILE_MATRICES: Record<string, ColorMatrix> = {
  natural: NATURAL_MATRIX,
  warm: WARM_PORTRAIT_MATRIX,
  rich: RICH_CONTRAST_MATRIX,
};

export interface StyleDefinition {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly available: boolean;
}

export const ND_STYLES: readonly StyleDefinition[] = [
  { id: 'natural', name: 'ND Natural', description: 'Balanced color and tone', available: true },
  { id: 'warm', name: 'Warm Portrait', description: 'A warmer portrait direction', available: true },
  { id: 'rich', name: 'Rich Contrast', description: 'A deeper tonal direction', available: true },
] as const;

export interface EditRecipe {
  schemaVersion: 1;
  sourcePhotoId: string;
  profileId: string;
  strength: number;
}

/**
 * Linearly interpolate between the identity matrix and target matrix by strength (0..1).
 */
export function interpolateMatrix(target: ColorMatrix, strength: number): number[] {
  const clamped = Math.max(0, Math.min(1, strength));
  return target.map((value, idx) => {
    const base = IDENTITY_MATRIX[idx]!;
    return base + (value - base) * clamped;
  });
}

/**
 * Get the calculated 20-element color matrix for a profile at a specific strength.
 */
export function getStyleMatrix(profileId: string, strength = 1): number[] {
  if (profileId === 'original' || !(profileId in PROFILE_MATRICES)) {
    return [...IDENTITY_MATRIX];
  }
  return interpolateMatrix(PROFILE_MATRICES[profileId]!, strength);
}

export function isAvailableProfile(profileId: string): boolean {
  if (profileId === 'original') return true;
  return profileId in PROFILE_MATRICES;
}

/** Never silently export an original as though a requested effect was applied. */
export function requireAvailableProfile(profileId: string): void {
  if (!isAvailableProfile(profileId)) {
    throw new Error(`Profile "${profileId}" is not available or supported.`);
  }
}

export function createEditRecipe(sourcePhotoId: string, profileId: string, strength = 1): EditRecipe {
  requireAvailableProfile(profileId);
  return {
    schemaVersion: 1,
    sourcePhotoId,
    profileId,
    strength: Math.max(0, Math.min(1, strength)),
  };
}
