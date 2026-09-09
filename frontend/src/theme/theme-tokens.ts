import type { PaletteMode } from '@mui/material/styles';

/** localStorage key the theme choice is persisted under. */
export const THEME_STORAGE_KEY = 'harmony-theme';

/* =========================================================
   HARMONY BRAND COLORS
========================================================= */

export const HARMONY_BRAND = {
  emerald: '#0B3D2E',
  emeraldLight: '#245B49',
  emeraldDark: '#062A1F',

  gold: '#C6A15B',
  goldLight: '#D8BC82',
  goldDark: '#967536',
} as const;

/* =========================================================
   WEBSITE THEME PRESETS

   Each preset controls:
   - whole website background
   - cards/surfaces
   - primary text
   - secondary text
   - borders
   - hover states
========================================================= */

export const HARMONY_THEMES = {
  light: {
    label: 'Light',

    mode: 'light' as PaletteMode,

    background: '#FAF8F3',
    paper: '#FFFFFF',

    textPrimary: '#17211D',
    textSecondary: '#5D6862',

    divider: 'rgba(11,61,46,0.10)',

    hover: 'rgba(11,61,46,0.045)',
  },

  warm: {
    label: 'Warm',

    mode: 'light' as PaletteMode,

    background: '#F5EBDD',
    paper: '#FFF9F0',

    textPrimary: '#28221C',
    textSecondary: '#6B6258',

    divider: 'rgba(40,34,28,0.11)',

    hover: 'rgba(40,34,28,0.045)',
  },

  sage: {
    label: 'Sage',

    mode: 'light' as PaletteMode,

    background: '#E4EDE0',
    paper: '#F7FAF5',

    textPrimary: '#183229',
    textSecondary: '#5D6B64',

    divider: 'rgba(24,50,41,0.11)',

    hover: 'rgba(24,50,41,0.045)',
  },

  dark: {
    label: 'Dark',

    mode: 'dark' as PaletteMode,

    background: '#171A18',
    paper: '#202421',

    textPrimary: '#F7F4EE',
    textSecondary: 'rgba(255,255,255,0.66)',

    divider: 'rgba(255,255,255,0.10)',

    hover: 'rgba(255,255,255,0.055)',
  },

  emerald: {
    label: 'Emerald',

    mode: 'dark' as PaletteMode,

    background: '#082D22',
    paper: '#0D372B',

    textPrimary: '#F8F3E8',
    textSecondary: 'rgba(255,255,255,0.68)',

    divider: 'rgba(255,255,255,0.11)',

    hover: 'rgba(255,255,255,0.055)',
  },
} as const;

export type HarmonyThemeName = keyof typeof HARMONY_THEMES;

/* =========================================================
   DEFAULT THEME

   Change the site-wide default here:
   'light' | 'warm' | 'sage' | 'dark' | 'emerald'
========================================================= */

export const DEFAULT_HARMONY_THEME: HarmonyThemeName = 'light';

export const DARK_HARMONY_THEMES: ReadonlySet<HarmonyThemeName> =
  new Set(
    (
      Object.entries(HARMONY_THEMES) as Array<
        [HarmonyThemeName, (typeof HARMONY_THEMES)[HarmonyThemeName]]
      >
    )
      .filter(([, preset]) => preset.mode === 'dark')
      .map(([name]) => name),
  );

/* =========================================================
   PRE-HYDRATION GROUND COLOURS

   Serialisable {name: {background, color}} map used by the
   blocking theme script in the root layout so the page ground
   never flashes the default theme before MUI hydrates.
========================================================= */

export const HARMONY_THEME_GROUND = Object.fromEntries(
  Object.entries(HARMONY_THEMES).map(([name, preset]) => [
    name,
    {
      background: preset.background,
      color: preset.textPrimary,
    },
  ]),
) as Record<
  HarmonyThemeName,
  { background: string; color: string }
>;
