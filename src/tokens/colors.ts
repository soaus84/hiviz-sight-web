export const colors = {
  bg: '#FAFAF7',
  panel: '#FFFFFF',
  ink: '#0A0A0A',
  inkSoft: '#525252',
  inkMuted: '#A3A3A3',
  rule: '#E5E5E2',
  ruleSoft: '#F1F0EC',
  fill: '#F7F6F2',
  hi: '#FFFC36',
  hiInk: '#1A1F00',
  red: '#E63946',
  amber: '#D97706',
  green: '#22875A',
  blue: '#1E40AF',
  side: '#0C0C0C',
  sidePanel: '#161615',
  sideText: '#EDEDEA',
  sideMuted: '#85847E',
  sideRule: 'rgba(255,255,255,0.08)',
} as const;

export type ColorToken = keyof typeof colors;

/** Soft-tinted chip background: status hex + ~10% alpha suffix. */
export const softTone = (hex: string) => `${hex}1A`;

export type Tone = 'error' | 'warning' | 'success' | 'info' | 'primary' | 'hi';

/** tone key -> [background, foreground] for solid Badge chips. */
export const TONE: Record<Tone, [string, string]> = {
  error: [colors.red, '#FFFFFF'],
  warning: [colors.amber, '#FFFFFF'],
  success: [colors.green, '#FFFFFF'],
  info: [colors.blue, '#FFFFFF'],
  primary: [colors.ink, '#FFFFFF'],
  hi: [colors.hi, colors.hiInk],
};
