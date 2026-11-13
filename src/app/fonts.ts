/**
 * Font configuration using next/font for optimized font loading.
 * - Instrument Serif: distinctive serif for headings
 * - Space Grotesk: clean geometric sans for body text
 */

import { Instrument_Serif, Space_Grotesk } from 'next/font/google';

export const instrumentSerif = Instrument_Serif({
  subsets: ['latin'],
  weight: ['400'],
  display: 'swap',
  variable: '--font-heading',
  fallback: ['Georgia', 'serif'],
});

export const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-body',
  fallback: ['Inter', 'system-ui', 'sans-serif'],
});
