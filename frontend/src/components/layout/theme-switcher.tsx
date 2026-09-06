'use client';

import {
  useState,
  type MouseEvent,
  type ReactNode,
} from 'react';

import {
  Box,
  IconButton,
  Menu,
  MenuItem,
  Tooltip,
  Typography,
} from '@mui/material';

import PaletteRoundedIcon from '@mui/icons-material/PaletteRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import LightModeRoundedIcon from '@mui/icons-material/LightModeRounded';
import DarkModeRoundedIcon from '@mui/icons-material/DarkModeRounded';
import SpaRoundedIcon from '@mui/icons-material/SpaRounded';
import WbSunnyRoundedIcon from '@mui/icons-material/WbSunnyRounded';
import ForestRoundedIcon from '@mui/icons-material/ForestRounded';

import { useHarmonyTheme } from '@/theme/theme-provider';
import type { HarmonyThemeName } from '@/theme/theme';

/* =========================================================
   TYPES
========================================================= */

type ThemeOption = {
  value: HarmonyThemeName;
  label: string;
  description: string;
  icon: ReactNode;
};

/* =========================================================
   THEME OPTIONS
========================================================= */

const THEME_OPTIONS: ThemeOption[] = [
  {
    value: 'light',
    label: 'Light',
    description: 'Clean ivory surface',
    icon: (
      <LightModeRoundedIcon
        sx={{
          fontSize: 19,
        }}
      />
    ),
  },
  {
    value: 'warm',
    label: 'Warm',
    description:
      'Soft restaurant warmth',
    icon: (
      <WbSunnyRoundedIcon
        sx={{
          fontSize: 19,
        }}
      />
    ),
  },
  {
    value: 'sage',
    label: 'Sage',
    description:
      'Calm natural green',
    icon: (
      <SpaRoundedIcon
        sx={{
          fontSize: 19,
        }}
      />
    ),
  },
  {
    value: 'dark',
    label: 'Dark',
    description:
      'Modern dark surface',
    icon: (
      <DarkModeRoundedIcon
        sx={{
          fontSize: 19,
        }}
      />
    ),
  },
  {
    value: 'emerald',
    label: 'Emerald',
    description:
      'Harmony signature green',
    icon: (
      <ForestRoundedIcon
        sx={{
          fontSize: 19,
        }}
      />
    ),
  },
];

/* =========================================================
   THEME SWITCHER
========================================================= */

export default function ThemeSwitcher() {
  const {
    themeName,
    setThemeName,
  } = useHarmonyTheme();

  const [anchorEl, setAnchorEl] =
    useState<HTMLElement | null>(
      null,
    );

  const open = Boolean(anchorEl);

  function handleOpen(
    event: MouseEvent<HTMLElement>,
  ) {
    setAnchorEl(
      event.currentTarget,
    );
  }

  function handleClose() {
    setAnchorEl(null);
  }

  function handleThemeChange(
    nextTheme: HarmonyThemeName,
  ) {
    setThemeName(nextTheme);
    handleClose();
  }

  const activeTheme =
    THEME_OPTIONS.find(
      (option) =>
        option.value === themeName,
    );

  return (
    <>
      {/* =====================================================
          TRIGGER
      ====================================================== */}

      <Tooltip
        title={`Appearance: ${
          activeTheme?.label ??
          'Theme'
        }`}
      >
        <IconButton
          onClick={handleOpen}
          aria-label="Change website appearance"
          aria-controls={
            open
              ? 'harmony-theme-menu'
              : undefined
          }
          aria-haspopup="menu"
          aria-expanded={
            open
              ? 'true'
              : undefined
          }
          sx={{
            width: 42,
            height: 42,

            border:
              '1px solid',

            borderColor:
              'divider',

            bgcolor:
              'background.paper',

            color:
              'text.primary',

            borderRadius: 1,

            transition:
              'background-color 180ms ease, border-color 180ms ease, color 180ms ease',

            '&:hover': {
              bgcolor:
                'action.hover',

              borderColor:
                'secondary.main',
            },

            '@media (prefers-reduced-motion: reduce)': {
              transition: 'none',
            },
          }}
        >
          <PaletteRoundedIcon
            sx={{
              fontSize: 20,
            }}
          />
        </IconButton>
      </Tooltip>

      {/* =====================================================
          THEME MENU
      ====================================================== */}

      <Menu
        id="harmony-theme-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        slotProps={{
          list: {
            'aria-label':
              'Harmony appearance themes',
          },

          paper: {
            sx: {
              mt: 1,

              width: 270,

              p: 0.8,

              borderRadius: 1.5,

              border:
                '1px solid',

              borderColor:
                'divider',

              bgcolor:
                'background.paper',

              color:
                'text.primary',

              boxShadow: (
                theme,
              ) =>
                theme.shadows[12],
            },
          },
        }}
      >
        {/* =================================================
            MENU HEADER
        ================================================== */}

        <Box
          sx={{
            px: 1.4,
            pt: 1.1,
            pb: 1.2,
          }}
        >
          <Typography
            variant="overline"
            sx={{
              display: 'block',

              color:
                'secondary.main',
            }}
          >
            Appearance
          </Typography>

          <Typography
            variant="caption"
            sx={{
              display: 'block',

              mt: 0.4,

              color:
                'text.secondary',
            }}
          >
            Choose your Harmony
            experience.
          </Typography>
        </Box>

        {/* =================================================
            OPTIONS
        ================================================== */}

        {THEME_OPTIONS.map(
          (option) => {
            const isActive =
              option.value ===
              themeName;

            return (
              <MenuItem
                key={
                  option.value
                }
                selected={
                  isActive
                }
                onClick={() =>
                  handleThemeChange(
                    option.value,
                  )
                }
                sx={{
                  minHeight: 56,

                  px: 1.3,
                  py: 0.85,

                  gap: 1.2,

                  borderRadius: 1,

                  '& + &': {
                    mt: 0.3,
                  },

                  '&.Mui-selected':
                    {
                      bgcolor:
                        'action.selected',
                    },

                  '&.Mui-selected:hover':
                    {
                      bgcolor:
                        'action.selected',
                    },
                }}
              >
                {/* =========================================
                    ICON
                ========================================== */}

                <Box
                  sx={{
                    width: 34,
                    height: 34,

                    display:
                      'grid',

                    placeItems:
                      'center',

                    flexShrink: 0,

                    borderRadius:
                      '50%',

                    border:
                      '1px solid',

                    borderColor:
                      'divider',

                    bgcolor:
                      'background.default',

                    color:
                      isActive
                        ? 'secondary.main'
                        : 'text.secondary',
                  }}
                >
                  {option.icon}
                </Box>

                {/* =========================================
                    LABEL + DESCRIPTION
                ========================================== */}

                <Box
                  sx={{
                    minWidth: 0,
                    flex: 1,
                  }}
                >
                  <Typography
                    variant="subtitle2"
                    sx={{
                      color:
                        'text.primary',

                      fontWeight:
                        700,

                      lineHeight:
                        1.25,

                      overflowWrap:
                        'break-word',
                    }}
                  >
                    {
                      option.label
                    }
                  </Typography>

                  <Typography
                    variant="caption"
                    sx={{
                      display:
                        'block',

                      mt: 0.3,

                      color:
                        'text.secondary',

                      lineHeight:
                        1.4,

                      overflowWrap:
                        'break-word',
                    }}
                  >
                    {
                      option.description
                    }
                  </Typography>
                </Box>

                {/* =========================================
                    ACTIVE CHECK
                ========================================== */}

                <Box
                  sx={{
                    width: 24,
                    height: 24,

                    display:
                      'grid',

                    placeItems:
                      'center',

                    flexShrink: 0,
                  }}
                >
                  {isActive && (
                    <CheckRoundedIcon
                      aria-hidden
                      sx={{
                        fontSize:
                          18,

                        color:
                          'secondary.main',
                      }}
                    />
                  )}
                </Box>
              </MenuItem>
            );
          },
        )}
      </Menu>
    </>
  );
}