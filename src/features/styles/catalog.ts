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

// --- iOS Photographic Styles ---

/**
 * iOS Standard:
 * Apple natural look with subtle highlight roll-off and natural skin tones.
 */
export const IOS_STANDARD_MATRIX: ColorMatrix = [
  1.04, 0.00, 0.00, 0.00, 0.02,
  0.00, 1.03, 0.00, 0.00, 0.01,
  0.00, 0.00, 0.99, 0.00, 0.00,
  0.00, 0.00, 0.00, 1.00, 0.00,
];

/**
 * iOS Rich Contrast:
 * Iconic Apple Photographic Style. Deeper shadows, richer contrast, punchy blacks without oversaturating colors.
 */
export const IOS_RICH_CONTRAST_MATRIX: ColorMatrix = [
  1.20, -0.04, -0.02, 0.00, -0.06,
  -0.02, 1.18, -0.02, 0.00, -0.06,
  -0.02, -0.03, 1.16, 0.00, -0.05,
  0.00,  0.00,  0.00, 1.00,  0.00,
];

/**
 * iOS Vibrant:
 * Bright, vivid, cheerful colors with lifted midtones while preserving natural skin tones.
 */
export const IOS_VIBRANT_MATRIX: ColorMatrix = [
  1.15, -0.06, -0.04, 0.00, 0.03,
  -0.04, 1.15, -0.04, 0.00, 0.03,
  -0.04, -0.06, 1.18, 0.00, 0.02,
  0.00,  0.00,  0.00, 1.00, 0.00,
];

/**
 * iOS Warm:
 * Golden amber undertones and soft warm highlights for cozy portrait feel.
 */
export const IOS_WARM_MATRIX: ColorMatrix = [
  1.15, 0.02, 0.00, 0.00, 0.05,
  0.00, 1.08, 0.01, 0.00, 0.03,
  0.00, 0.00, 0.90, 0.00, -0.03,
  0.00, 0.00, 0.00, 1.00, 0.00,
];

/**
 * iOS Cool:
 * Clean, crisp Nordic blue highlights and modern cool tones.
 */
export const IOS_COOL_MATRIX: ColorMatrix = [
  0.96, 0.00, 0.00, 0.00, -0.02,
  0.00, 1.02, 0.01, 0.00, 0.01,
  0.00, 0.01, 1.14, 0.00, 0.04,
  0.00, 0.00, 0.00, 1.00, 0.00,
];

// --- Leica Camera Styles ---

/**
 * Leica Authentic:
 * Classic Leica M look: high micro-contrast, organic deep shadows, filmic highlight compression, and slight vignette.
 */
export const LEICA_AUTHENTIC_MATRIX: ColorMatrix = [
  1.18, -0.06, -0.02, 0.00, -0.08,
  -0.03, 1.17, -0.02, 0.00, -0.07,
  -0.03, -0.05, 1.12, 0.00, -0.06,
  0.00,  0.00,  0.00, 1.00,  0.00,
];

/**
 * Leica Vibrant:
 * Modern Leica look with deep blacks combined with rich, saturated Leica red and blue primaries.
 */
export const LEICA_VIBRANT_MATRIX: ColorMatrix = [
  1.22, -0.08, -0.04, 0.00, -0.04,
  -0.05, 1.20, -0.05, 0.00, -0.04,
  -0.04, -0.07, 1.22, 0.00, -0.03,
  0.00,  0.00,  0.00, 1.00,  0.00,
];

/**
 * Leica Monochrom:
 * Legendary Leica black-and-white. Red-filtered luminance weighting with rich silvers and velvety blacks.
 */
export const LEICA_MONO_MATRIX: ColorMatrix = [
  0.38, 0.60, 0.12, 0.00, -0.05,
  0.38, 0.60, 0.12, 0.00, -0.05,
  0.38, 0.60, 0.12, 0.00, -0.05,
  0.00, 0.00, 0.00, 1.00,  0.00,
];

// --- ND Core Styles ---

export const NATURAL_MATRIX: ColorMatrix = [
  1.06, 0.00, 0.00, 0.00, 0.02,
  0.00, 1.05, 0.00, 0.00, 0.02,
  0.00, 0.00, 1.02, 0.00, 0.00,
  0.00, 0.00, 0.00, 1.00, 0.00,
];

export const WARM_PORTRAIT_MATRIX: ColorMatrix = [
  1.12, 0.02, 0.00, 0.00, 0.04,
  0.00, 1.06, 0.02, 0.00, 0.02,
  0.00, 0.00, 0.94, 0.00, -0.02,
  0.00, 0.00, 0.00, 1.00, 0.00,
];

export const RICH_CONTRAST_MATRIX: ColorMatrix = [
  1.22, -0.04, -0.02, 0.00, -0.06,
  -0.02, 1.20, -0.02, 0.00, -0.06,
  -0.02, -0.04, 1.18, 0.00, -0.05,
  0.00,  0.00,  0.00, 1.00,  0.00,
];

export const PROFILE_MATRICES: Record<string, ColorMatrix> = {
  // iOS Styles
  'ios-standard': IOS_STANDARD_MATRIX,
  'ios-rich-contrast': IOS_RICH_CONTRAST_MATRIX,
  'ios-vibrant': IOS_VIBRANT_MATRIX,
  'ios-warm': IOS_WARM_MATRIX,
  'ios-cool': IOS_COOL_MATRIX,

  // Leica Styles
  'leica-authentic': LEICA_AUTHENTIC_MATRIX,
  'leica-vibrant': LEICA_VIBRANT_MATRIX,
  'leica-mono': LEICA_MONO_MATRIX,

  // ND Core
  natural: NATURAL_MATRIX,
  warm: WARM_PORTRAIT_MATRIX,
  rich: RICH_CONTRAST_MATRIX,
};

export interface StyleDefinition {
  readonly id: string;
  readonly name: string;
  readonly subtitle: string;
  readonly description: string;
  readonly category: 'ios' | 'leica' | 'nd';
  readonly defaultVignette: number;
  readonly available: boolean;
}

export const ND_STYLES: readonly StyleDefinition[] = [
  // iOS Photographic Styles
  {
    id: 'ios-rich-contrast',
    name: 'iOS Rich Contrast',
    subtitle: 'Signature iPhone Look',
    description: 'Deeper shadows, rich midtone contrast, and controlled highlights without over-saturation.',
    category: 'ios',
    defaultVignette: 0.0,
    available: true,
  },
  {
    id: 'ios-standard',
    name: 'iOS Standard',
    subtitle: 'Clean & Lifelike',
    description: 'Natural Apple photographic tone curve with gentle highlight roll-off and faithful skin tones.',
    category: 'ios',
    defaultVignette: 0.0,
    available: true,
  },
  {
    id: 'ios-vibrant',
    name: 'iOS Vibrant',
    subtitle: 'Vivid & Cheerful',
    description: 'Luminous colors, bright open shadows, and punchy vibrance while protecting natural skin tones.',
    category: 'ios',
    defaultVignette: 0.0,
    available: true,
  },
  {
    id: 'ios-warm',
    name: 'iOS Warm',
    subtitle: 'Golden Amber Glow',
    description: 'Warm golden undertones and soft amber highlights for flattering portraits and sunsets.',
    category: 'ios',
    defaultVignette: 0.0,
    available: true,
  },
  {
    id: 'ios-cool',
    name: 'iOS Cool',
    subtitle: 'Nordic Clean',
    description: 'Subtle cyan and crisp blue undertones for modern architecture and clinical clarity.',
    category: 'ios',
    defaultVignette: 0.0,
    available: true,
  },

  // Leica Camera Profiles
  {
    id: 'leica-authentic',
    name: 'Leica Authentic',
    subtitle: 'Classic M Character',
    description: 'High micro-contrast, organic deep shadows, filmic highlight falloff, and subtle lens vignette.',
    category: 'leica',
    defaultVignette: 0.35,
    available: true,
  },
  {
    id: 'leica-vibrant',
    name: 'Leica Vibrant',
    subtitle: 'Rich & Dynamic',
    description: 'Iconic saturated Leica reds and blues combined with punchy contrast and deep velvety blacks.',
    category: 'leica',
    defaultVignette: 0.20,
    available: true,
  },
  {
    id: 'leica-mono',
    name: 'Leica Monochrom',
    subtitle: 'Velvety Black & White',
    description: 'Red-filtered luminance with deep silver highlights, velvety blacks, and dramatic sky contrast.',
    category: 'leica',
    defaultVignette: 0.25,
    available: true,
  },

  // ND Core Styles
  {
    id: 'natural',
    name: 'ND Natural',
    subtitle: 'Balanced Dynamic Range',
    description: 'Balanced color and tone curve with gentle shadow lift.',
    category: 'nd',
    defaultVignette: 0.0,
    available: true,
  },
  {
    id: 'warm',
    name: 'Warm Portrait',
    subtitle: 'Soft Golden Tones',
    description: 'A warmer portrait direction with gentle amber bias.',
    category: 'nd',
    defaultVignette: 0.0,
    available: true,
  },
  {
    id: 'rich',
    name: 'Rich Contrast',
    subtitle: 'Deep Tonal Depth',
    description: 'Deeper tonal direction with rich cinematic contrast.',
    category: 'nd',
    defaultVignette: 0.0,
    available: true,
  },
] as const;

export interface EditRecipe {
  schemaVersion: 1;
  sourcePhotoId: string;
  profileId: string;
  strength: number;
  tone: number;     // -1..1
  warmth: number;   // -1..1
  vignette: number; // 0..1
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
 * Apply fine-tuning adjustments (tone and warmth) to a base matrix.
 * Tone (-1..1): pulls down / lifts shadows and contrast.
 * Warmth (-1..1): shifts red positive and blue negative (or vice versa).
 */
export function adjustMatrix(matrix: number[], tone = 0, warmth = 0): number[] {
  const result = [...matrix];
  const t = Math.max(-1, Math.min(1, tone));
  const w = Math.max(-1, Math.min(1, warmth));

  if (t !== 0) {
    // Tone: contrast and shadow offset
    const c = 1 + t * 0.15;
    result[0] = result[0]! * c;
    result[6] = result[6]! * c;
    result[12] = result[12]! * c;
    result[4] = result[4]! - t * 0.04;
    result[9] = result[9]! - t * 0.04;
    result[14] = result[14]! - t * 0.04;
  }

  if (w !== 0) {
    // Warmth: warmer = +R, -B; cooler = -R, +B
    result[0] = result[0]! + w * 0.08;
    result[4] = result[4]! + w * 0.02;
    result[12] = result[12]! - w * 0.08;
    result[14] = result[14]! - w * 0.02;
  }

  return result;
}

/**
 * Get the calculated 20-element color matrix for a profile at a specific strength and fine-tuning.
 */
export function getStyleMatrix(
  profileId: string,
  strength = 1,
  tone = 0,
  warmth = 0,
): number[] {
  if (profileId === 'original' || !(profileId in PROFILE_MATRICES)) {
    return adjustMatrix([...IDENTITY_MATRIX], tone, warmth);
  }
  const base = interpolateMatrix(PROFILE_MATRICES[profileId]!, strength);
  return adjustMatrix(base, tone, warmth);
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

export function createEditRecipe(
  sourcePhotoId: string,
  profileId: string,
  strength = 1,
  tone = 0,
  warmth = 0,
  vignette = 0,
): EditRecipe {
  requireAvailableProfile(profileId);
  return {
    schemaVersion: 1,
    sourcePhotoId,
    profileId,
    strength: Math.max(0, Math.min(1, strength)),
    tone: Math.max(-1, Math.min(1, tone)),
    warmth: Math.max(-1, Math.min(1, warmth)),
    vignette: Math.max(0, Math.min(1, vignette)),
  };
}
