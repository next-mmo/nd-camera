export type SnapseedCategory = 'all' | 'film' | 'portrait' | 'bw' | 'aesthetic';

export interface SnapseedQRPreset {
  id: string;
  title: string;
  category: 'film' | 'portrait' | 'bw' | 'aesthetic';
  tagline: string;
  description: string;
  bestFor: string;
  recipeHighlights: string[];
}

export const SNAPSEED_QR_PRESETS: SnapseedQRPreset[] = [
  {
    id: 'film-portra',
    title: 'Kodak Portra 400',
    category: 'film',
    tagline: 'Analog warm skin tones & muted organic greens',
    description:
      'Emulates the classic 35mm Kodak Portra film stock known worldwide for creamy skin tones, gentle highlight roll-off, and subtle pastel midtones.',
    bestFor: 'Outdoor portraits, daylight fashion, natural lifestyle',
    recipeHighlights: [
      'Tune Image: Warmth +14, Ambience +18, Highlights -22',
      'Curves: Soft S-curve with lifted toe (+12 black level)',
      'Film Grain: Fine grain intensity +18, roughness 25%',
    ],
  },
  {
    id: 'film-kodachrome',
    title: 'Kodachrome 64',
    category: 'film',
    tagline: 'Vivid retro contrast & deep rich primaries',
    description:
      'Inspired by the legendary slide film used in classic National Geographic spreads. Delivers punchy reds, distinct yellows, and signature deep cyan-tinted blues.',
    bestFor: 'Street photography, travel, vintage architecture, signage',
    recipeHighlights: [
      'Tune Image: Contrast +24, Saturation +16, Shadows -10',
      'Curves: Steep RGB contrast with red boost in highlights',
      'Vintage: Style 2, Vignette intensity +15',
    ],
  },
  {
    id: 'film-retro',
    title: 'Retro 35mm Analog',
    category: 'film',
    tagline: 'Faded matte shadows & nostalgic warmth',
    description:
      'Recreates the nostalgic texture of 1980s point-and-shoot camera prints with raised shadow floor, mellow saturation, and tactile film grain.',
    bestFor: 'Candid moments, coffee shops, everyday memories',
    recipeHighlights: [
      'Tune Image: Shadows +28, Contrast -12, Warmth +8',
      'Curves: Matte crushed blacks lifted to deep charcoal',
      'Grainy Film: Style X02, Grain +35',
    ],
  },
  {
    id: 'polaroid-light-leak',
    title: 'Polaroid Light Leak',
    category: 'film',
    tagline: 'Instant film aesthetic with soft edge luminescence',
    description:
      'Combines authentic instant chemical film dyes with warm peripheral light refraction for an effortless analog snapshot mood.',
    bestFor: 'Sunlit road trips, casual portraits, festivals',
    recipeHighlights: [
      'Tune Image: Ambience +25, Warmth +12, Highlights -15',
      'Vintage: Color wash preset with corner light leak overlay',
      'Curves: Slight green/magenta cross-process curve',
    ],
  },
  {
    id: 'portrait-soft-glow',
    title: 'Soft Glow Portrait',
    category: 'portrait',
    tagline: 'Dreamy highlight diffusion & porcelain skin',
    description:
      'A flattering, delicate look that subtly diffuses specular highlights to produce a luminous ethereal aura while preserving facial texture.',
    bestFor: 'Close-up portraits, beauty shots, golden hour sunlight',
    recipeHighlights: [
      'Glamour Glow: Glow intensity +35, Warmth +10',
      'Tune Image: Highlights -18, Shadows +14, Saturation -5',
      'Tonal Contrast: High tones -15, Midtones +10',
    ],
  },
  {
    id: 'portrait-warm-glow',
    title: 'Warm Golden Portrait',
    category: 'portrait',
    tagline: 'Sun-drenched radiance & honeyed complexion',
    description:
      'Infuses skin and hair with natural golden hour warmth, smoothing harsh midday shadows and giving subjects a healthy sunlit glow.',
    bestFor: 'Beach portraits, sunset sessions, outdoor lifestyle',
    recipeHighlights: [
      'Tune Image: Warmth +22, Ambience +20, Saturation +8',
      'White Balance: Temperature +12, Tint +4',
      'Lens Blur: Gentle transition blur with optical vignette',
    ],
  },
  {
    id: 'portrait-moody',
    title: 'Moody Editorial Portrait',
    category: 'portrait',
    tagline: 'Desaturated ambiance with focused subject pop',
    description:
      'Mutes distracting background colors into cool slate tones while maintaining rich, warm skin tones for high-fashion editorial impact.',
    bestFor: 'Studio portraits, urban modeling, dramatic lighting',
    recipeHighlights: [
      'Tune Image: Saturation -18, Contrast +16, Shadows -8',
      'Selective / Brush: Skin tone saturation preserved',
      'Vignette: Outer brightness -25, Inner brightness +8',
    ],
  },
  {
    id: 'bw-moody',
    title: 'Leica Moody B&W',
    category: 'bw',
    tagline: 'Velvety deep shadows & high dynamic range monochrome',
    description:
      'Tuned to match the iconic Leica Monochrom aesthetic with true velvety blacks, smooth graduation through middle grays, and crisp highlights.',
    bestFor: 'Street photography, expressive portraits, architecture',
    recipeHighlights: [
      'Black & White: Dark style with neutral color filter',
      'Curves: High contrast S-curve with deep black point',
      'Structure: Details structure +15, sharpening +12',
    ],
  },
  {
    id: 'bw-urban',
    title: 'Urban Street Contrast B&W',
    category: 'bw',
    tagline: 'High impact graphic shadows & silver highlights',
    description:
      'A punchy, dynamic black and white preset designed to make city geometry, concrete, silhouettes, and dramatic sunlight pop with graphic authority.',
    bestFor: 'Cityscapes, geometric silhouettes, harsh direct sun',
    recipeHighlights: [
      'Black & White: High contrast film simulation',
      'Tune Image: Contrast +38, Highlights +15, Shadows -24',
      'Tonal Contrast: High tones +30, Low tones +25',
    ],
  },
  {
    id: 'summer-golden-hour',
    title: 'Golden Hour Sunset',
    category: 'aesthetic',
    tagline: 'Amber radiance & honey twilight gradient',
    description:
      'Captures that magical 15-minute window before sunset when the world turns golden, enriching warm tones and softening sky transitions.',
    bestFor: 'Sunset landscapes, beach evenings, golden hour scenery',
    recipeHighlights: [
      'Tune Image: Warmth +28, Ambience +16, Highlights -12',
      'Curves: Custom red and green channel warm lift',
      'White Balance: Temperature +18, Tint +6',
    ],
  },
  {
    id: 'cool-moody-blues',
    title: 'Cinematic Cool Blues',
    category: 'aesthetic',
    tagline: 'Teal & cyan shadow split with modern cinema grade',
    description:
      'Applies a Hollywood-inspired teal & slate color grading to shadows and foliage, creating dramatic tension and clean visual atmosphere.',
    bestFor: 'Night cityscapes, rainy days, automotive, modern interiors',
    recipeHighlights: [
      'Curves: Blue channel lifted in shadows, Green balanced',
      'Tune Image: Saturation -10, Contrast +20, Warmth -14',
      'Drama: Dark 1 preset with 40% filter strength',
    ],
  },
  {
    id: 'beige-paris',
    title: 'Minimal Parisian Beige',
    category: 'aesthetic',
    tagline: 'Neutral earth tones & editorial minimalism',
    description:
      'An understated European editorial palette with warm stone neutrals, lowered digital sharpness, and muted secondary colors.',
    bestFor: 'Interior design, cafe aesthetics, flat-lays, fashion',
    recipeHighlights: [
      'Tune Image: Saturation -22, Warmth +10, Brightness +8',
      'Curves: Matte shadow curve with soft highlight shoulder',
      'Grain: Minimal micro-texture grain +10',
    ],
  },
];
