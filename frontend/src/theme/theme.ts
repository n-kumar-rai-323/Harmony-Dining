'use client';

import { createTheme, type PaletteMode } from '@mui/material/styles';

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

   Developer can add/change colors here.

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

export type HarmonyThemeName =
  keyof typeof HARMONY_THEMES;

/* =========================================================
   DEFAULT THEME

   Developer side bata default change garna:

   'light'
   'warm'
   'sage'
   'dark'
   'emerald'
========================================================= */

export const DEFAULT_HARMONY_THEME: HarmonyThemeName =
  'light';

/* =========================================================
   CREATE HARMONY THEME

   Later Theme Provider / Theme Button le
   selected theme name yaha pass गर्छ.
========================================================= */

export function createHarmonyTheme(
  themeName: HarmonyThemeName,
) {
  const selectedTheme =
    HARMONY_THEMES[themeName];

  return createTheme({
    palette: {
      mode: selectedTheme.mode,

      /* =====================================================
         HARMONY BRAND
      ====================================================== */

      primary: {
        main: HARMONY_BRAND.emerald,
        light: HARMONY_BRAND.emeraldLight,
        dark: HARMONY_BRAND.emeraldDark,

        contrastText: '#FFFFFF',
      },

      secondary: {
        main: HARMONY_BRAND.gold,
        light: HARMONY_BRAND.goldLight,
        dark: HARMONY_BRAND.goldDark,

        contrastText: '#10251D',
      },

      /* =====================================================
         ACTIVE WEBSITE THEME
      ====================================================== */

      background: {
        default: selectedTheme.background,
        paper: selectedTheme.paper,
      },

      text: {
        primary: selectedTheme.textPrimary,
        secondary: selectedTheme.textSecondary,
      },

      divider: selectedTheme.divider,

      action: {
        hover: selectedTheme.hover,

        selected:
          selectedTheme.mode === 'dark'
            ? 'rgba(216,188,130,0.13)'
            : 'rgba(198,161,91,0.12)',
      },
    },

    /* =======================================================
       TYPOGRAPHY
    ======================================================= */

    typography: {
      fontFamily:
        'var(--font-inter), Arial, sans-serif',

      h1: {
        fontFamily:
          'var(--font-cormorant), Georgia, serif',

        fontWeight: 600,

        fontSize: '5.5rem',

        lineHeight: 0.96,

        letterSpacing: '-0.04em',

        '@media (max-width:1200px)': {
          fontSize: '4.9rem',
        },

        '@media (max-width:900px)': {
          fontSize: '4.1rem',
        },

        '@media (max-width:600px)': {
          fontSize: '3.15rem',

          lineHeight: 1,
        },
      },

      h2: {
        fontFamily:
          'var(--font-cormorant), Georgia, serif',

        fontWeight: 600,

        fontSize: '4.15rem',

        lineHeight: 1,

        letterSpacing: '-0.035em',

        '@media (max-width:900px)': {
          fontSize: '3.4rem',
        },

        '@media (max-width:600px)': {
          fontSize: '2.7rem',
        },
      },

      h3: {
        fontFamily:
          'var(--font-cormorant), Georgia, serif',

        fontWeight: 600,

        fontSize: '2.65rem',

        lineHeight: 1.05,

        letterSpacing: '-0.025em',

        '@media (max-width:600px)': {
          fontSize: '2.15rem',
        },
      },

      h4: {
        fontFamily:
          'var(--font-cormorant), Georgia, serif',

        fontWeight: 600,

        fontSize: '2.1rem',

        lineHeight: 1.1,
      },

      h5: {
        fontFamily:
          'var(--font-cormorant), Georgia, serif',

        fontWeight: 600,

        fontSize: '1.7rem',

        lineHeight: 1.15,
      },

      h6: {
        fontFamily:
          'var(--font-inter), Arial, sans-serif',

        fontWeight: 700,

        fontSize: '1.08rem',

        lineHeight: 1.45,
      },

      body1: {
        fontSize: '1.06rem',

        lineHeight: 1.78,
      },

      body2: {
        fontSize: '0.96rem',

        lineHeight: 1.7,
      },

      subtitle1: {
        fontSize: '1.05rem',

        fontWeight: 600,
      },

      subtitle2: {
        fontSize: '0.95rem',

        fontWeight: 600,
      },

      button: {
        fontSize: '0.9rem',

        fontWeight: 700,

        textTransform: 'none',
      },

      caption: {
        fontSize: '0.82rem',
      },

      overline: {
        fontSize: '0.76rem',

        fontWeight: 800,

        letterSpacing: '0.14em',

        textTransform: 'uppercase',
      },
    },

    /* =======================================================
       SHAPE
    ======================================================= */

    shape: {
      borderRadius: 6,
    },

    /* =======================================================
       COMPONENT DEFAULTS
    ======================================================= */

    components: {
      MuiCssBaseline: {
        styleOverrides: {
          html: {
            backgroundColor:
              selectedTheme.background,
          },

          body: {
            backgroundColor:
              selectedTheme.background,

            color:
              selectedTheme.textPrimary,

            transition:
              'background-color 220ms ease, color 220ms ease',
          },

          '::selection': {
            backgroundColor:
              'rgba(198,161,91,0.30)',

            color:
              selectedTheme.textPrimary,
          },

          '@media (prefers-reduced-motion: reduce)': {
            body: {
              transition: 'none',
            },
          },
        },
      },

      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
          },
        },
      },

      MuiButton: {
        defaultProps: {
          disableElevation: true,
        },

        styleOverrides: {
          root: {
            minHeight: 46,

            borderRadius: 6,

            paddingLeft: 22,

            paddingRight: 22,
          },
        },
      },

      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 8,

            backgroundImage: 'none',
          },
        },
      },
    },
  });
}

/* =========================================================
   FALLBACK THEME

   Existing imports break nahos भनेर default export राखिएको।
   Theme Provider update गरेपछि dynamic theme use हुन्छ।
========================================================= */

const theme = createHarmonyTheme(
  DEFAULT_HARMONY_THEME,
);

export default theme;