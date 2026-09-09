'use client';

import { createTheme } from '@mui/material/styles';

import {
  DEFAULT_HARMONY_THEME,
  HARMONY_BRAND,
  HARMONY_THEMES,
  type HarmonyThemeName,
} from './theme-tokens';

/* Re-exported so existing `@/theme/theme` imports keep working. */
export {
  DARK_HARMONY_THEMES,
  DEFAULT_HARMONY_THEME,
  HARMONY_BRAND,
  HARMONY_THEME_GROUND,
  HARMONY_THEMES,
  THEME_STORAGE_KEY,
  type HarmonyThemeName,
} from './theme-tokens';

/* =========================================================
   CREATE HARMONY THEME

   The Theme Provider / theme switcher passes the selected
   theme name here.
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