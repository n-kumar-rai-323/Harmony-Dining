'use client';

import { useState } from 'react';

import {
  Box,
  Typography,
} from '@mui/material';

import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import NorthEastRoundedIcon from '@mui/icons-material/NorthEastRounded';

import {
  FaFacebookF,
  FaInstagram,
  FaTiktok,
} from 'react-icons/fa';

/* =========================================================
   SOCIAL LINKS
========================================================= */

const socialLinks = [
  {
    label: 'TikTok',
    href:
      'https://www.tiktok.com/@harmonydiningeventcenter',
    icon: FaTiktok,
    brandColor: '#111111',
  },
  {
    label: 'Facebook',
    href:
      'https://www.facebook.com/people/Harmony-Dining-Event-Center/61593063557390/',
    icon: FaFacebookF,
    brandColor: '#1877F2',
  },
  {
    label: 'Instagram',
    href:
      'https://www.instagram.com/harmonydiningandevent',
    icon: FaInstagram,
    brandColor: '#E1306C',
  },
] as const;

/* =========================================================
   COMPONENT
========================================================= */

export default function SocialFloatingBar() {
  const [mobileOpen, setMobileOpen] =
    useState(false);

  return (
    <>
      {/* =====================================================
          DESKTOP SOCIAL RIBBON
      ===================================================== */}

      <Box
        component="aside"
        aria-label="Harmony social media links"
        sx={{
          position: 'fixed',

          right: 0,
          top: '50%',

          transform:
            'translateY(-50%)',

          zIndex: 1800,

          width: 58,

          py: 2,

          display: 'flex',

          flexDirection: 'column',

          alignItems: 'center',

          bgcolor:
            'primary.dark',

          color:
            'primary.contrastText',

          borderTopLeftRadius: 2,

          borderBottomLeftRadius: 2,

          borderLeft:
            '1px solid',

          borderTop:
            '1px solid',

          borderBottom:
            '1px solid',

          borderColor:
            'secondary.main',

          boxShadow: (theme) =>
            theme.shadows[8],

          transition:
            'width 180ms ease, box-shadow 180ms ease',

          overflow: 'hidden',

          '&:hover': {
            width: 72,

            boxShadow: (theme) =>
              theme.shadows[12],
          },

          '@media (max-width: 899.95px)': {
            display: 'none',
          },

          '@media (prefers-reduced-motion: reduce)': {
            transition: 'none',
          },
        }}
      >
        {/* TOP GOLD ACCENT */}

        <Box
          aria-hidden
          sx={{
            width: 24,
            height: 2,

            mb: 1.5,

            bgcolor:
              'secondary.main',
          }}
        />

        {/* LABEL */}

        <Typography
          variant="caption"
          sx={{
            writingMode:
              'vertical-rl',

            transform:
              'rotate(180deg)',

            textTransform:
              'uppercase',

            fontWeight: 800,

            letterSpacing:
              '0.16em',

            color:
              'secondary.light',

            mb: 1.75,
          }}
        >
          Follow Harmony
        </Typography>

        {/* ICONS */}

        <Box
          sx={{
            display: 'flex',

            flexDirection: 'column',

            alignItems: 'center',

            gap: 0.75,
          }}
        >
          {socialLinks.map(
            ({
              label,
              href,
              icon: Icon,
              brandColor,
            }) => (
              <Box
                key={label}
                component="a"
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Visit Harmony on ${label}`}
                sx={{
                  width: 40,
                  height: 40,

                  display: 'grid',

                  placeItems: 'center',

                  borderRadius:
                    '50%',

                  bgcolor:
                    'background.paper',

                  color:
                    brandColor,

                  textDecoration:
                    'none',

                  border:
                    '1px solid',

                  borderColor:
                    'divider',

                  transition:
                    'transform 180ms ease, background-color 180ms ease',

                  '&:hover': {
                    transform:
                      'translateX(-3px) scale(1.04)',

                    bgcolor:
                      'background.default',
                  },

                  '@media (prefers-reduced-motion: reduce)': {
                    transition: 'none',

                    '&:hover': {
                      transform:
                        'none',
                    },
                  },
                }}
              >
                <Icon
                  size={18}
                  aria-hidden
                />
              </Box>
            ),
          )}
        </Box>

        {/* BOTTOM GOLD ACCENT */}

        <Box
          aria-hidden
          sx={{
            width: 24,
            height: 2,

            mt: 1.5,

            bgcolor:
              'secondary.main',
          }}
        />
      </Box>

      {/* =====================================================
          MOBILE SOCIAL CONTROL

          Explicit media query is used so it cannot disappear
          because of breakpoint resolution issues.
      ===================================================== */}

      <Box
        component="aside"
        aria-label="Harmony social media links"
        sx={{
          position: 'fixed',

          right: 12,

          bottom:
            'calc(18px + env(safe-area-inset-bottom))',

          zIndex: 999999,

          display: 'none',

          flexDirection: 'column',

          alignItems: 'flex-end',

          gap: 0.7,

          pointerEvents: 'auto',

          '@media (max-width: 899.95px)': {
            display: 'flex',
          },
        }}
      >
        {/* =================================================
            EXPANDED MOBILE LINKS
        ================================================= */}

        <Box
          sx={{
            display: 'flex',

            flexDirection: 'column',

            alignItems: 'flex-end',

            gap: 0.6,

            opacity:
              mobileOpen ? 1 : 0,

            visibility:
              mobileOpen
                ? 'visible'
                : 'hidden',

            transform:
              mobileOpen
                ? 'translateY(0)'
                : 'translateY(8px)',

            pointerEvents:
              mobileOpen
                ? 'auto'
                : 'none',

            transition:
              'opacity 180ms ease, transform 180ms ease, visibility 180ms ease',

            '@media (prefers-reduced-motion: reduce)': {
              transition: 'none',
            },
          }}
        >
          {socialLinks.map(
            ({
              label,
              href,
              icon: Icon,
              brandColor,
            }) => (
              <Box
                key={label}
                component="a"
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Visit Harmony on ${label}`}
                sx={{
                  minHeight: 46,

                  display: 'flex',

                  alignItems: 'center',

                  gap: 1,

                  pl: 0.7,
                  pr: 1.25,

                  bgcolor:
                    'background.paper',

                  color:
                    'text.primary',

                  border:
                    '1px solid',

                  borderColor:
                    'divider',

                  borderRadius: 999,

                  boxShadow: (theme) =>
                    theme.shadows[8],

                  textDecoration:
                    'none',

                  WebkitTapHighlightColor:
                    'transparent',

                  transition:
                    'transform 150ms ease',

                  '&:active': {
                    transform:
                      'scale(0.97)',
                  },

                  '@media (prefers-reduced-motion: reduce)': {
                    transition: 'none',
                  },
                }}
              >
                {/* BRAND ICON */}

                <Box
                  sx={{
                    width: 34,
                    height: 34,

                    flexShrink: 0,

                    display: 'grid',

                    placeItems: 'center',

                    borderRadius:
                      '50%',

                    bgcolor:
                      'background.default',

                    border:
                      '1px solid',

                    borderColor:
                      'divider',

                    color:
                      brandColor,
                  }}
                >
                  <Icon
                    size={17}
                    aria-hidden
                  />
                </Box>

                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: 700,

                    whiteSpace:
                      'nowrap',
                  }}
                >
                  {label}
                </Typography>

                <NorthEastRoundedIcon
                  aria-hidden
                  sx={{
                    ml: 0.15,

                    fontSize: 16,

                    color:
                      'text.secondary',
                  }}
                />
              </Box>
            ),
          )}
        </Box>

        {/* =================================================
            MAIN MOBILE FOLLOW BUTTON
        ================================================= */}

        <Box
          component="button"
          type="button"
          aria-expanded={
            mobileOpen
          }
          aria-label={
            mobileOpen
              ? 'Close Harmony social media links'
              : 'Open Harmony social media links'
          }
          onClick={() =>
            setMobileOpen(
              (current) =>
                !current,
            )
          }
          sx={{
            appearance: 'none',

            minHeight: 50,

            display: 'flex',

            alignItems: 'center',

            justifyContent:
              'center',

            gap: 0.8,

            px: 1.5,

            bgcolor:
              'primary.dark',

            color:
              'primary.contrastText',

            border:
              '1px solid',

            borderColor:
              'secondary.main',

            borderRadius: 999,

            boxShadow: (theme) =>
              theme.shadows[10],

            cursor: 'pointer',

            font: 'inherit',

            touchAction:
              'manipulation',

            WebkitTapHighlightColor:
              'transparent',

            transition:
              'transform 160ms ease, background-color 160ms ease',

            '&:active': {
              transform:
                'scale(0.97)',
            },

            '&:focus-visible': {
              outline:
                '2px solid',

              outlineColor:
                'secondary.main',

              outlineOffset: 3,
            },

            '@media (prefers-reduced-motion: reduce)': {
              transition: 'none',
            },
          }}
        >
          {/* MINI SOCIAL DOTS */}

          {!mobileOpen ? (
            <Box
              sx={{
                display: 'flex',

                alignItems:
                  'center',

                gap: 0.35,
              }}
            >
              {socialLinks.map(
                ({
                  label,
                  icon: Icon,
                  brandColor,
                }) => (
                  <Box
                    key={label}
                    sx={{
                      width: 24,

                      height: 24,

                      display:
                        'grid',

                      placeItems:
                        'center',

                      borderRadius:
                        '50%',

                      bgcolor:
                        'background.paper',

                      color:
                        brandColor,
                    }}
                  >
                    <Icon
                      size={12}
                      aria-hidden
                    />
                  </Box>
                ),
              )}
            </Box>
          ) : null}

          <Typography
            variant="caption"
            sx={{
              fontWeight: 800,

              letterSpacing:
                '0.04em',

              textTransform:
                'uppercase',

              whiteSpace:
                'nowrap',
            }}
          >
            {mobileOpen
              ? 'Close'
              : 'Follow'}
          </Typography>

          {mobileOpen ? (
            <CloseRoundedIcon
              sx={{
                fontSize: 19,
              }}
            />
          ) : (
            <NorthEastRoundedIcon
              sx={{
                fontSize: 18,

                color:
                  'secondary.light',
              }}
            />
          )}
        </Box>
      </Box>
    </>
  );
}