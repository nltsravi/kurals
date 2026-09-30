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
    background: '#FFF2E5',
    card: '#FFFFFF',
    text: '#1C1917',
    textSecondary: '#57534E',
    textMuted: '#8C7E72',
    primary: '#FF7C0A',
    primaryLight: '#FFE4CC',
    accent: '#B45309',
    border: '#EAD7C5',
    borderLight: '#F5E8DC',
    surface: '#FAECE0',
    tint: '#FF7C0A',
    tabIconDefault: '#9C8E82',
    tabIconSelected: '#FF7C0A',
    danger: '#EF4444',
    success: '#10B981',
  },
  dark: {
    background: '#261405',
    card: '#381F0A',
    text: '#FFF8F0',
    textSecondary: '#D6C4B4',
    textMuted: '#A69180',
    primary: '#FF8D29',
    primaryLight: '#4D280B',
    accent: '#F59E0B',
    border: '#543012',
    borderLight: '#42240B',
    surface: '#47260C',
    tint: '#FF8D29',
    tabIconDefault: '#A69180',
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
    light: { bg: '#FFE4CC', text: '#C2410C' },
    dark: { bg: '#4D280B', text: '#FF8D29' },
  },
  2: {
    light: { bg: '#FEF3C7', text: '#B45309' },
    dark: { bg: '#472E08', text: '#FCD34D' },
  },
  3: {
    light: { bg: '#FFE4E6', text: '#BE123C' },
    dark: { bg: '#451722', text: '#FDA4AF' },
  },
};
