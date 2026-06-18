/**
 * InCircle design tokens — frontend only
 */
export const colors = {
  background: '#020617',
  surface: 'rgba(255,255,255,0.05)',
  surfaceStrong: 'rgba(255,255,255,0.08)',
  primary: '#8CFF4F',
  secondary: '#4DB5FF',
  text: '#FFFFFF',
  textSecondary: '#D0D8E3',
  muted: '#8A94A7',
  danger: '#FF5A5F',
  warning: '#FFB020',
  success: '#22C55E',
  border: 'rgba(255,255,255,0.08)',
} as const;

export const radii = { sm: 8, md: 14, lg: 20, xl: 28, pill: 999 } as const;
export const spacing = { xs: 6, sm: 10, md: 16, lg: 24, xl: 32 } as const;

export const typography = {
  display: { fontSize: 28, fontWeight: '700' as const, letterSpacing: -0.5 },
  title: { fontSize: 20, fontWeight: '600' as const },
  subtitle: { fontSize: 16, fontWeight: '600' as const },
  body: { fontSize: 15, fontWeight: '400' as const },
  caption: { fontSize: 12, fontWeight: '500' as const, letterSpacing: 0.5 },
};
