/**
 * Isolyne visual identity — design tokens.
 * Single source of truth for color, typography, spacing, and radius.
 */

export const color = {
  bg: '#07080F', // Richer deep dark
  bgElevated: '#11131A',
  bgQuiet: '#0A0C14',
  glass: 'rgba(17, 19, 26, 0.65)',
  glassStrong: 'rgba(17, 19, 26, 0.85)',
  line: 'rgba(255, 255, 255, 0.06)',
  lineStrong: 'rgba(255, 255, 255, 0.12)',
  lineHighlight: 'rgba(255, 255, 255, 0.20)',

  text: '#FFFFFF',
  textSecondary: '#A1A4B5',
  textMuted: '#6B6E80',
  textOnAccent: '#07080F',

  accent: '#8B83FF',
  accentSoft: '#E4E0FF',
  accentDim: '#2A2750',

  risk: '#f97316',
  riskSoft: '#431407',
  riskLine: '#c2410c',

  error: '#FF6B7A',
  errorSoft: '#3A1820',
  errorLine: '#5C2430',


  join: '#0f766e',
  joinSoft: '#042f2e',
  joinLine: '#115e59',

  caution: '#F0C14A',
  cautionSoft: '#2E2710',
  cautionLine: '#5A4A18',

  skip: '#FF8A9A',
  skipSoft: '#3A1820',
  skipLine: '#5C2430',

  lock: '#4ADEA8',
  lockSoft: '#102820',
  lockLine: '#1F4A38',
} as const

export const space = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  stage: 48,
  /** Vertical air on the Biggest Risk stage — tension, not chrome */
  heroAir: 56,
} as const

export const radius = {
  sm: 10,
  md: 14,
  lg: 18,
  xl: 24,
  pill: 999,
} as const

export const type = {
  /** Hero punchline — the artwork. Composed line rhythm on stage. */
  sentence: {
    fontSize: 36,
    lineHeight: 44,
    fontWeight: '800' as const,
    letterSpacing: -1.4,
  },
  display: { fontSize: 34, lineHeight: 40, fontWeight: '800' as const, letterSpacing: -1.2 },
  risk: { fontSize: 28, lineHeight: 36, fontWeight: '800' as const, letterSpacing: -0.8 },
  title: { fontSize: 22, lineHeight: 28, fontWeight: '800' as const, letterSpacing: -0.5 },
  body: { fontSize: 15, lineHeight: 22, fontWeight: '500' as const },
  bodyStrong: { fontSize: 15, lineHeight: 22, fontWeight: '700' as const },
  label: { fontSize: 11, lineHeight: 14, fontWeight: '800' as const, letterSpacing: 1.2 },
  meta: { fontSize: 13, lineHeight: 18, fontWeight: '600' as const },
  button: { fontSize: 15, lineHeight: 20, fontWeight: '800' as const },
} as const

/** Motion exists only to answer a user question. */
export const motion = {
  /** Why? / Continue — “show me the next answer” */
  discloseMs: 220,
  /** No bounce. Linear product energy. */
  easing: 'easeInEaseOut' as const,
} as const

export const hit = {
  min: 44,
} as const
