export const colors = {
  // Base Backgrounds (Dark Navy / Deep Space)
  background: '#0B1020',
  backgroundSecondary: '#10162B',
  backgroundTertiary: '#151D38',
  backgroundElevated: '#1A2445',

  // Glassmorphism surfaces
  glassSurface: 'rgba(22, 31, 56, 0.75)',
  glassSurfaceLight: 'rgba(30, 41, 75, 0.55)',
  glassHighlight: 'rgba(255, 255, 255, 0.05)',

  // Borders
  border: 'rgba(255, 255, 255, 0.08)',
  borderLight: 'rgba(255, 255, 255, 0.14)',
  borderCyan: 'rgba(0, 245, 212, 0.35)',
  borderBlue: 'rgba(0, 210, 255, 0.35)',
  borderPurple: 'rgba(139, 92, 246, 0.35)',

  // Accents & Gradients
  cyan: '#00F5D4',
  electricBlue: '#00D2FF',
  primaryBlue: '#3B82F6',
  deepPurple: '#7928CA',
  purpleAccent: '#8B5CF6',
  neonViolet: '#A855F7',

  // Text Colors
  textPrimary: '#FFFFFF',
  textSecondary: '#94A3B8',
  textMuted: '#64748B',
  textCyan: '#00F5D4',
  textBlue: '#38BDF8',

  // Status & Priority Colors
  statusSubmitted: '#F59E0B',    // Amber
  statusAIVerified: '#00F5D4',   // Neon Cyan
  statusInProgress: '#3B82F6',   // Electric Blue
  statusResolved: '#10B981',     // Emerald
  statusRejected: '#EF4444',     // Crimson

  priorityLow: '#10B981',
  priorityMedium: '#F59E0B',
  priorityHigh: '#F97316',
  priorityCritical: '#EF4444',

  // Utility
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
  overlay: 'rgba(11, 16, 32, 0.85)',
  cardShadow: '#000000',
};

export type Colors = typeof colors;
