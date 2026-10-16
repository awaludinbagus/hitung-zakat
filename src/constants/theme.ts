/**
 * Tema aplikasi "Hitung Zakat" — dominan hijau cerah dengan aksen emas.
 * Warna didefinisikan untuk mode terang dan gelap.
 */

import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#0B2416',
    background: '#F4FBF6',
    backgroundElement: '#E3F3E8',
    backgroundSelected: '#CDEBD8',
    textSecondary: '#476952',
  },
  dark: {
    text: '#E8F6EC',
    background: '#08130C',
    backgroundElement: '#12251A',
    backgroundSelected: '#1C3826',
    textSecondary: '#9CBBA6',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

/** Warna merek (brand) aplikasi. */
export const Brand = {
  green: '#16A34A',
  greenBright: '#22C55E',
  greenLight: '#4ADE80',
  greenDark: '#15803D',
  greenDeep: '#14532D',
  mint: '#DCFCE7',
  mintSoft: '#F0FDF4',
  gold: '#F59E0B',
  goldSoft: '#FDE68A',
  white: '#FFFFFF',
  ink: '#052E16',
  /** Gradasi hijau cerah untuk header & kartu hasil. */
  gradient: 'linear-gradient(160deg, #4ADE80 0%, #22C55E 45%, #15803D 100%)',
} as const;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
