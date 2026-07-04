export const fontSans = '"GT Walsheim", "Hanken Grotesk", system-ui, -apple-system, sans-serif';
export const fontMono = '"Geist Mono", ui-monospace, monospace';

/** Named type-scale steps matching the design reference (README "Typography"). */
export const type = {
  title28: { fontSize: 28, fontWeight: 700, letterSpacing: -0.7 },
  heading22: { fontSize: 22, fontWeight: 700, letterSpacing: -0.4 },
  cardHeadline19: { fontSize: 19, fontWeight: 700, letterSpacing: -0.3 },
  body14: { fontSize: 14, fontWeight: 600 },
  body13: { fontSize: 13.5, fontWeight: 500 },
  secondary12: { fontSize: 12, fontWeight: 500 },
  eyebrow10: { fontSize: 10.5, fontWeight: 700, letterSpacing: 0.6, textTransform: 'uppercase' as const },
} as const;
