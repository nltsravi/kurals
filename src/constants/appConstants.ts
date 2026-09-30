export const APP_CONFIG = {
  name: 'திருக்குறள்',
  nameEnglish: 'Thirukkural',
  version: '1.0.0',
  author: 'Thiruvalluvar',
  totalKurals: 1330,
  totalChapters: 133,
  totalCategories: 3,
  repoUrl: 'https://github.com/tk120404/thirukkural',
};

export const PALETTE = {
  light: {
    background: '#FAFAF9',
    card: '#FFFFFF',
    text: '#1C1917',
    textSecondary: '#57534E',
    textMuted: '#A8A29E',
    primary: '#FF7C0A',
    primaryLight: '#FFF2E5',
    accent: '#B45309',
    border: '#E7E5E4',
    borderLight: '#F5F5F4',
    surface: '#F5F5F4',
    tint: '#FF7C0A',
    tabIconDefault: '#A8A29E',
    tabIconSelected: '#FF7C0A',
    danger: '#EF4444',
    success: '#10B981',
  },
  dark: {
    background: '#0C0A09',
    card: '#1C1917',
    text: '#FAFAF9',
    textSecondary: '#A8A29E',
    textMuted: '#78716C',
    primary: '#FF8D29',
    primaryLight: '#381C04',
    accent: '#F59E0B',
    border: '#292524',
    borderLight: '#1F1B18',
    surface: '#262220',
    tint: '#FF8D29',
    tabIconDefault: '#78716C',
    tabIconSelected: '#FF8D29',
    danger: '#F87171',
    success: '#34D399',
  },
};

export const CATEGORY_COLORS: Record<
  number,
  { light: { bg: string; text: string }; dark: { bg: string; text: string } }
> = {
  1: {
    light: { bg: '#FFF2E5', text: '#EA580C' },
    dark: { bg: '#381C04', text: '#FF8D29' },
  },
  2: {
    light: { bg: '#FEF3C7', text: '#B45309' },
    dark: { bg: '#3B2205', text: '#FCD34D' },
  },
  3: {
    light: { bg: '#FFE4E6', text: '#BE123C' },
    dark: { bg: '#36111D', text: '#FDA4AF' },
  },
};
