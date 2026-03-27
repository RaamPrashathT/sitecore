import { TinyColor } from '@ctrl/tinycolor';

/**
 * Generates a "Google-soft" color from any string.
 */
export const getSeededColor = (str: string): string => {
  // 1. Simple hash to get a consistent number from the string
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }

  // 2. Map the hash to a Hue (0 - 360)
  const h = Math.abs(hash) % 360;

  // 3. Force "Soft/Pastel" constraints:
  // Saturation: 40-50% (Not too grey, not too vibrant)
  // Lightness: 85-90% (This gives the 'Google Account' airy feel)
  const softColor = new TinyColor({ h, s: 45, l: 85 });

  return softColor.toHexString();
};