import { alpha, createTheme, type Theme } from '@mui/material/styles';

const SANS =
  'var(--font-inter), system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';

/**
 * The admin panel is a tool, not the marketing site — swap the serif display
 * face for a clean sans, tighten headings, and give cards / controls a
 * consistent modern shape. Layered on top of the active Harmony theme so
 * light / dark and the brand palette still come through.
 */
export function adminTheme(base: Theme): Theme {
  return createTheme(base, {
    shape: { borderRadius: 10 },
    typography: {
      h1: { fontFamily: SANS, fontWeight: 700, letterSpacing: '-0.02em' },
      h2: { fontFamily: SANS, fontWeight: 700, letterSpacing: '-0.02em' },
      h3: { fontFamily: SANS, fontWeight: 700, letterSpacing: '-0.01em' },
      h4: { fontFamily: SANS, fontWeight: 700, fontSize: '1.6rem', letterSpacing: '-0.01em' },
      h5: { fontFamily: SANS, fontWeight: 700, fontSize: '1.3rem' },
      h6: { fontFamily: SANS, fontWeight: 700, fontSize: '1.05rem' },
      subtitle1: { fontFamily: SANS, fontWeight: 600 },
      subtitle2: { fontFamily: SANS, fontWeight: 600 },
      overline: { fontFamily: SANS, fontWeight: 600, letterSpacing: '0.08em' },
      button: { fontFamily: SANS, fontWeight: 600, textTransform: 'none' },
    },
    components: {
      MuiButton: {
        defaultProps: { disableElevation: true },
        styleOverrides: { root: { borderRadius: 8 } },
      },
      MuiCard: {
        defaultProps: { variant: 'outlined' },
        styleOverrides: { root: { borderRadius: 12 } },
      },
      MuiPaper: {
        styleOverrides: { outlined: { borderRadius: 12 } },
      },
      MuiChip: {
        styleOverrides: {
          root: { borderRadius: 7, fontWeight: 600 },
          sizeSmall: { height: 22 },
        },
      },
      MuiTextField: { defaultProps: { size: 'small' } },
      MuiTableHead: {
        styleOverrides: {
          root: {
            '& .MuiTableCell-root': {
              background: base.palette.action.hover,
              borderBottom: `1px solid ${base.palette.divider}`,
            },
          },
        },
      },
      MuiTab: {
        styleOverrides: { root: { textTransform: 'none', fontWeight: 600 } },
      },
      MuiAppBar: {
        styleOverrides: { root: { backgroundImage: 'none' } },
      },
      MuiDialog: {
        styleOverrides: { paper: { borderRadius: 14 } },
      },
      MuiDialogTitle: {
        styleOverrides: {
          root: { fontFamily: SANS, fontWeight: 700, fontSize: '1.15rem' },
        },
      },
      MuiListItemButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            '&.Mui-selected': {
              backgroundColor: alpha(base.palette.primary.main, 0.12),
              '&:hover': {
                backgroundColor: alpha(base.palette.primary.main, 0.18),
              },
            },
          },
        },
      },
      MuiOutlinedInput: {
        styleOverrides: { root: { borderRadius: 8 } },
      },
      MuiAlert: {
        styleOverrides: { root: { borderRadius: 10 } },
      },
    },
  });
}
