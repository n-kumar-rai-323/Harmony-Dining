'use client';

import { useState } from 'react';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import {
  AppBar,
  Box,
  Button,
  Container,
  Divider,
  Drawer,
  IconButton,
  Stack,
  Toolbar,
  Typography,
} from '@mui/material';

import ArrowOutwardRoundedIcon from '@mui/icons-material/ArrowOutwardRounded';
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded';
import CelebrationRoundedIcon from '@mui/icons-material/CelebrationRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import CollectionsRoundedIcon from '@mui/icons-material/CollectionsRounded';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import LocationOnRoundedIcon from '@mui/icons-material/LocationOnRounded';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import RateReviewRoundedIcon from '@mui/icons-material/RateReviewRounded';
import RestaurantMenuRoundedIcon from '@mui/icons-material/RestaurantMenuRounded';

import ThemeSwitcher from './theme-switcher';

/* =========================================================
   NAVIGATION
========================================================= */

const navItems = [
  {
    label: 'Home',
    href: '/',
    icon: HomeRoundedIcon,
  },
  {
    label: 'Menu',
    href: '/menu',
    icon: RestaurantMenuRoundedIcon,
  },
  {
    label: 'Events',
    href: '/events',
    icon: CelebrationRoundedIcon,
  },
  {
    label: 'Gallery',
    href: '/gallery',
    icon: CollectionsRoundedIcon,
  },
  {
    label: 'Reviews',
    href: '/reviews',
    icon: RateReviewRoundedIcon,
  },
  {
    label: 'Location',
    href: '/#location',
    icon: LocationOnRoundedIcon,
  },
] as const;

/* =========================================================
   ACTIVE NAVIGATION
========================================================= */

function isNavActive(
  pathname: string,
  href: string,
) {
  if (href === '/') {
    return pathname === '/';
  }

  if (href.startsWith('/#')) {
    return false;
  }

  return pathname.startsWith(href);
}

/* =========================================================
   NAVBAR
========================================================= */

export default function Navbar() {
  const pathname = usePathname();

  const [
    mobileOpen,
    setMobileOpen,
  ] = useState(false);

  function closeMobileMenu() {
    setMobileOpen(false);
  }

  return (
    <>
      {/* =====================================================
          MAIN NAVBAR
      ===================================================== */}

      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          bgcolor:
            'background.default',

          color:
            'text.primary',

          borderBottom:
            '1px solid',

          borderColor:
            'divider',

          backdropFilter:
            'blur(18px)',

          WebkitBackdropFilter:
            'blur(18px)',

          zIndex:
            (theme) =>
              theme.zIndex
                .appBar,

          transition:
            'background-color 220ms ease, color 220ms ease, border-color 220ms ease',

          '@media (prefers-reduced-motion: reduce)':
            {
              transition:
                'none',
            },
        }}
      >
        <Container maxWidth="xl">
          <Toolbar
            disableGutters
            sx={{
              minHeight: {
                xs:
                  '68px !important',

                md:
                  '74px !important',
              },

              display:
                'grid',

              gridTemplateColumns:
                {
                  xs:
                    '1fr auto',

                  lg:
                    'auto 1fr auto',
                },

              gap: {
                xs:
                  1.25,

                lg:
                  2.5,
              },
            }}
          >
            {/* =================================================
                BRAND
            ================================================= */}

            <Link
              href="/"
              style={{
                textDecoration:
                  'none',

                color:
                  'inherit',
              }}
            >
              <Box
                sx={{
                  display:
                    'flex',

                  alignItems:
                    'center',

                  gap: {
                    xs:
                      1,

                    md:
                      1.25,
                  },

                  width:
                    'fit-content',
                }}
              >
                <Box
                  sx={{
                    position:
                      'relative',

                    width: {
                      xs:
                        42,

                      md:
                        46,
                    },

                    height: {
                      xs:
                        42,

                      md:
                        46,
                    },

                    flexShrink:
                      0,

                    overflow:
                      'hidden',

                    borderRadius:
                      1,

                    bgcolor:
                      'primary.main',

                    border:
                      '1px solid',

                    borderColor:
                      'secondary.main',
                  }}
                >
                  <Image
                    src="/images/harmony-logo.jpeg"
                    alt="Harmony Dining & Event Center"
                    fill
                    priority
                    sizes="46px"
                    style={{
                      objectFit:
                        'cover',
                    }}
                  />
                </Box>

                <Box>
                  <Typography
                    variant="subtitle2"
                    sx={{
                      color:
                        (
                          theme,
                        ) =>
                          theme
                            .palette
                            .mode ===
                          'dark'
                            ? 'secondary.light'
                            : 'primary.main',

                      fontWeight:
                        800,

                      lineHeight:
                        1,

                      letterSpacing:
                        '0.035em',
                    }}
                  >
                    HARMONY
                  </Typography>

                  <Typography
                    variant="caption"
                    sx={{
                      display:
                        'block',

                      mt:
                        0.4,

                      color:
                        'text.secondary',

                      fontSize: {
                        xs:
                          '0.56rem',

                        md:
                          '0.62rem',
                      },

                      fontWeight:
                        700,

                      lineHeight:
                        1,

                      letterSpacing:
                        '0.07em',

                      whiteSpace:
                        'nowrap',
                    }}
                  >
                    DINING & EVENT CENTER
                  </Typography>
                </Box>
              </Box>
            </Link>

            {/* =================================================
                DESKTOP NAVIGATION
            ================================================= */}

            <Box
              component="nav"
              aria-label="Main navigation"
              sx={{
                display: {
                  xs:
                    'none',

                  lg:
                    'flex',
                },

                justifyContent:
                  'center',
              }}
            >
              <Box
                sx={{
                  display:
                    'flex',

                  alignItems:
                    'center',

                  gap:
                    0.4,

                  p:
                    0.4,

                  borderRadius:
                    2,

                  bgcolor:
                    'action.hover',

                  border:
                    '1px solid',

                  borderColor:
                    'divider',
                }}
              >
                {navItems.map(
                  (item) => {
                    const Icon =
                      item.icon;

                    const active =
                      isNavActive(
                        pathname,
                        item.href,
                      );

                    return (
                      <Link
                        key={
                          item.href
                        }
                        href={
                          item.href
                        }
                        aria-current={
                          active
                            ? 'page'
                            : undefined
                        }
                        style={{
                          textDecoration:
                            'none',
                        }}
                      >
                        <Box
                          sx={{
                            position:
                              'relative',

                            minHeight:
                              40,

                            display:
                              'flex',

                            alignItems:
                              'center',

                            justifyContent:
                              'center',

                            gap:
                              0.7,

                            px:
                              1.6,

                            borderRadius:
                              1.5,

                            bgcolor:
                              active
                                ? 'primary.main'
                                : 'transparent',

                            color:
                              active
                                ? 'primary.contrastText'
                                : 'text.secondary',

                            transition:
                              'background-color 180ms ease, color 180ms ease',

                            '&:hover':
                              {
                                bgcolor:
                                  active
                                    ? 'primary.dark'
                                    : 'action.hover',

                                color:
                                  active
                                    ? 'primary.contrastText'
                                    : (
                                        theme,
                                      ) =>
                                        theme
                                          .palette
                                          .mode ===
                                        'dark'
                                          ? theme
                                              .palette
                                              .secondary
                                              .light
                                          : theme
                                              .palette
                                              .primary
                                              .main,
                              },

                            '@media (prefers-reduced-motion: reduce)':
                              {
                                transition:
                                  'none',
                              },
                          }}
                        >
                          <Icon
                            sx={{
                              fontSize:
                                18,
                            }}
                          />

                          <Typography
                            variant="button"
                            component="span"
                            sx={{
                              fontSize:
                                {
                                  lg:
                                    '0.8rem',

                                  xl:
                                    '0.85rem',
                                },

                              fontWeight:
                                700,

                              lineHeight:
                                1,

                              whiteSpace:
                                'nowrap',
                            }}
                          >
                            {
                              item.label
                            }
                          </Typography>

                          {active ? (
                            <Box
                              aria-hidden
                              sx={{
                                position:
                                  'absolute',

                                bottom:
                                  3,

                                left:
                                  '50%',

                                width:
                                  3,

                                height:
                                  3,

                                borderRadius:
                                  '50%',

                                bgcolor:
                                  'secondary.light',

                                transform:
                                  'translateX(-50%)',
                              }}
                            />
                          ) : null}
                        </Box>
                      </Link>
                    );
                  },
                )}
              </Box>
            </Box>

            {/* =================================================
                DESKTOP ACTIONS
            ================================================= */}

            <Box
              sx={{
                display: {
                  xs:
                    'none',

                  lg:
                    'flex',
                },

                justifyContent:
                  'flex-end',

                alignItems:
                  'center',

                gap:
                  0.7,

                minWidth:
                  0,
              }}
            >
              <ThemeSwitcher />

              {/* EVENT / HALL — PRIMARY */}

              <Button
                component={Link}
                href="/events#enquiry"
                variant="contained"
                startIcon={
                  <CelebrationRoundedIcon
                    sx={{
                      fontSize:
                        '18px !important',
                    }}
                  />
                }
                endIcon={
                  <ArrowOutwardRoundedIcon
                    sx={{
                      fontSize:
                        '17px !important',
                    }}
                  />
                }
                sx={{
                  minHeight:
                    44,

                  px: {
                    lg:
                      1.5,

                    xl:
                      2,
                  },

                  bgcolor:
                    'primary.main',

                  color:
                    'primary.contrastText',

                  fontWeight:
                    700,

                  lineHeight:
                    1.2,

                  whiteSpace:
                    'nowrap',

                  '&:hover':
                    {
                      bgcolor:
                        'primary.dark',
                    },
                }}
              >
                Book Event / Hall
              </Button>

              {/* TABLE — SECONDARY */}

              <Button
                component={Link}
                href="/reservation"
                variant="outlined"
                startIcon={
                  <CalendarMonthRoundedIcon
                    sx={{
                      fontSize:
                        '18px !important',
                    }}
                  />
                }
                sx={{
                  minHeight:
                    44,

                  px: {
                    lg:
                      1.25,

                    xl:
                      1.6,
                  },

                  color:
                    'text.primary',

                  borderColor:
                    'divider',

                  fontWeight:
                    700,

                  lineHeight:
                    1.2,

                  whiteSpace:
                    'nowrap',

                  '&:hover':
                    {
                      borderColor:
                        'secondary.main',

                      bgcolor:
                        'action.hover',
                    },
                }}
              >
                Reserve a Table
              </Button>
            </Box>

            {/* =================================================
                MOBILE ACTIONS
            ================================================= */}

            <Box
              sx={{
                display: {
                  xs:
                    'flex',

                  lg:
                    'none',
                },

                justifyContent:
                  'flex-end',

                alignItems:
                  'center',

                gap:
                  0.7,
              }}
            >
              <ThemeSwitcher />

              <IconButton
                aria-label="Open navigation menu"
                aria-expanded={
                  mobileOpen
                }
                aria-controls="mobile-navigation-drawer"
                onClick={() =>
                  setMobileOpen(
                    true,
                  )
                }
                sx={{
                  width:
                    44,

                  height:
                    44,

                  color:
                    (
                      theme,
                    ) =>
                      theme
                        .palette
                        .mode ===
                      'dark'
                        ? 'secondary.light'
                        : 'primary.main',

                  border:
                    '1px solid',

                  borderColor:
                    'divider',

                  bgcolor:
                    'action.hover',

                  borderRadius:
                    1,

                  '&:hover':
                    {
                      bgcolor:
                        'action.selected',
                    },
                }}
              >
                <MenuRoundedIcon
                  sx={{
                    fontSize:
                      23,
                  }}
                />
              </IconButton>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      {/* =====================================================
          MOBILE DRAWER
      ===================================================== */}

      <Drawer
        id="mobile-navigation-drawer"
        anchor="right"
        open={mobileOpen}
        onClose={
          closeMobileMenu
        }
        slotProps={{
          paper: {
            sx: {
              width:
                'min(300px, 100vw)',

              bgcolor:
                'background.default',

              color:
                'text.primary',

              borderLeft:
                '1px solid',

              borderColor:
                'divider',

              boxShadow:
                (
                  theme,
                ) =>
                  theme
                    .shadows[12],

              transition:
                'background-color 220ms ease, color 220ms ease',

              '@media (prefers-reduced-motion: reduce)':
                {
                  transition:
                    'none',
                },
            },
          },
        }}
      >
        <Box
          sx={{
            minHeight:
              '100%',

            display:
              'flex',

            flexDirection:
              'column',

            p:
              2,
          }}
        >
          {/* =================================================
              DRAWER HEADER
          ================================================= */}

          <Box
            sx={{
              display:
                'flex',

              alignItems:
                'center',

              justifyContent:
                'space-between',

              gap:
                1,
            }}
          >
            <Link
              href="/"
              onClick={
                closeMobileMenu
              }
              style={{
                textDecoration:
                  'none',

                color:
                  'inherit',
              }}
            >
              <Box
                sx={{
                  display:
                    'flex',

                  alignItems:
                    'center',

                  gap:
                    1,
                }}
              >
                <Box
                  sx={{
                    position:
                      'relative',

                    width:
                      42,

                    height:
                      42,

                    overflow:
                      'hidden',

                    borderRadius:
                      1,

                    border:
                      '1px solid',

                    borderColor:
                      'secondary.main',
                  }}
                >
                  <Image
                    src="/images/harmony-logo.jpeg"
                    alt="Harmony Dining & Event Center"
                    fill
                    sizes="42px"
                    style={{
                      objectFit:
                        'cover',
                    }}
                  />
                </Box>

                <Box>
                  <Typography
                    variant="subtitle2"
                    sx={{
                      color:
                        (
                          theme,
                        ) =>
                          theme
                            .palette
                            .mode ===
                          'dark'
                            ? 'secondary.light'
                            : 'primary.main',

                      fontWeight:
                        800,

                      lineHeight:
                        1,
                    }}
                  >
                    HARMONY
                  </Typography>

                  <Typography
                    variant="caption"
                    sx={{
                      display:
                        'block',

                      mt:
                        0.35,

                      color:
                        'text.secondary',

                      fontSize:
                        '0.55rem',

                      fontWeight:
                        700,

                      lineHeight:
                        1,

                      letterSpacing:
                        '0.065em',

                      whiteSpace:
                        'nowrap',
                    }}
                  >
                    DINING & EVENT CENTER
                  </Typography>
                </Box>
              </Box>
            </Link>

            <IconButton
              aria-label="Close navigation menu"
              onClick={
                closeMobileMenu
              }
              sx={{
                width:
                  42,

                height:
                  42,

                color:
                  (
                    theme,
                  ) =>
                    theme
                      .palette
                      .mode ===
                    'dark'
                      ? 'secondary.light'
                      : 'primary.main',

                border:
                  '1px solid',

                borderColor:
                  'divider',

                bgcolor:
                  'action.hover',

                borderRadius:
                  1,

                '&:hover':
                  {
                    bgcolor:
                      'action.selected',
                  },
              }}
            >
              <CloseRoundedIcon
                sx={{
                  fontSize:
                    22,
                }}
              />
            </IconButton>
          </Box>

          <Divider
            sx={{
              my:
                2.2,

              borderColor:
                'divider',
            }}
          />

          {/* =================================================
              MOBILE NAVIGATION
          ================================================= */}

          <Stack
            sx={{
              gap:
                0.65,
            }}
          >
            {navItems.map(
              (item) => {
                const Icon =
                  item.icon;

                const active =
                  isNavActive(
                    pathname,
                    item.href,
                  );

                return (
                  <Link
                    key={
                      item.href
                    }
                    href={
                      item.href
                    }
                    aria-current={
                      active
                        ? 'page'
                        : undefined
                    }
                    onClick={
                      closeMobileMenu
                    }
                    style={{
                      textDecoration:
                        'none',
                    }}
                  >
                    <Box
                      sx={{
                        minHeight:
                          54,

                        display:
                          'grid',

                        gridTemplateColumns:
                          '42px minmax(0,1fr) auto',

                        alignItems:
                          'center',

                        gap:
                          1,

                        px:
                          1,

                        borderRadius:
                          1,

                        bgcolor:
                          active
                            ? 'primary.main'
                            : 'transparent',

                        border:
                          '1px solid',

                        borderColor:
                          active
                            ? 'primary.main'
                            : 'transparent',

                        transition:
                          'background-color 180ms ease, border-color 180ms ease',

                        '&:hover':
                          {
                            bgcolor:
                              active
                                ? 'primary.dark'
                                : 'action.hover',
                          },

                        '@media (prefers-reduced-motion: reduce)':
                          {
                            transition:
                              'none',
                          },
                      }}
                    >
                      <Box
                        sx={{
                          width:
                            38,

                          height:
                            38,

                          display:
                            'grid',

                          placeItems:
                            'center',

                          borderRadius:
                            1,

                          bgcolor:
                            active
                              ? 'action.selected'
                              : 'action.hover',

                          color:
                            active
                              ? 'secondary.light'
                              : (
                                  theme,
                                ) =>
                                  theme
                                    .palette
                                    .mode ===
                                  'dark'
                                    ? theme
                                        .palette
                                        .secondary
                                        .light
                                    : theme
                                        .palette
                                        .primary
                                        .main,
                        }}
                      >
                        <Icon
                          sx={{
                            fontSize:
                              20,
                          }}
                        />
                      </Box>

                      <Typography
                        variant="button"
                        component="span"
                        sx={{
                          color:
                            active
                              ? 'primary.contrastText'
                              : 'text.primary',

                          fontWeight:
                            700,
                        }}
                      >
                        {
                          item.label
                        }
                      </Typography>

                      <ArrowOutwardRoundedIcon
                        sx={{
                          fontSize:
                            17,

                          color:
                            active
                              ? 'secondary.light'
                              : 'text.secondary',
                        }}
                      />
                    </Box>
                  </Link>
                );
              },
            )}
          </Stack>

          {/* =================================================
              MOBILE CTA
          ================================================= */}

          <Box
            sx={{
              mt:
                'auto',

              pt:
                3,
            }}
          >
            <Stack
              sx={{
                gap:
                  1,
              }}
            >
              {/* EVENT / HALL — PRIMARY */}

              <Button
                component={Link}
                href="/events#enquiry"
                onClick={
                  closeMobileMenu
                }
                fullWidth
                variant="contained"
                startIcon={
                  <CelebrationRoundedIcon />
                }
                endIcon={
                  <ArrowOutwardRoundedIcon />
                }
                sx={{
                  minHeight:
                    52,

                  bgcolor:
                    'primary.main',

                  color:
                    'primary.contrastText',

                  fontWeight:
                    700,

                  lineHeight:
                    1.25,

                  whiteSpace:
                    'normal',

                  '&:hover':
                    {
                      bgcolor:
                        'primary.dark',
                    },
                }}
              >
                Book Event / Hall
              </Button>

              {/* TABLE — SECONDARY */}

              <Button
                component={Link}
                href="/reservation"
                onClick={
                  closeMobileMenu
                }
                fullWidth
                variant="outlined"
                startIcon={
                  <CalendarMonthRoundedIcon />
                }
                endIcon={
                  <ArrowOutwardRoundedIcon />
                }
                sx={{
                  minHeight:
                    50,

                  color:
                    'text.primary',

                  borderColor:
                    'divider',

                  fontWeight:
                    700,

                  lineHeight:
                    1.25,

                  whiteSpace:
                    'normal',

                  '&:hover':
                    {
                      borderColor:
                        'secondary.main',

                      bgcolor:
                        'action.hover',
                    },
                }}
              >
                Reserve a Table
              </Button>
            </Stack>

            <Typography
              variant="caption"
              sx={{
                display:
                  'block',

                mt:
                  1.4,

                textAlign:
                  'center',

                color:
                  'text.secondary',

                lineHeight:
                  1.5,
              }}
            >
              Events • Hall Booking • Dining
            </Typography>
          </Box>
        </Box>
      </Drawer>
    </>
  );
}