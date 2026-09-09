'use client';

import Link from 'next/link';

import {
  Box,
  Button,
  Container,
  Stack,
  Typography,
} from '@mui/material';

import {
  alpha,
} from '@mui/material/styles';

import ArrowOutwardRoundedIcon from '@mui/icons-material/ArrowOutwardRounded';
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded';
import CelebrationRoundedIcon from '@mui/icons-material/CelebrationRounded';
import RestaurantMenuRoundedIcon from '@mui/icons-material/RestaurantMenuRounded';

import type {
  SvgIconComponent,
} from '@mui/icons-material';

import ImageCarousel, {
  type CarouselSlide,
} from '@/components/common/image-carousel';

/* =========================================================
   TYPES

   Future flow:

   Admin Dashboard
        ↓
   NestJS API
        ↓
   PostgreSQL
        ↓
   Public Homepage API
        ↓
   HeroSection
========================================================= */

type HeroAction = {
  label: string;
  href: string;
  icon?: SvgIconComponent;
  variant:
    | 'primary'
    | 'secondary'
    | 'tertiary';
};

type HeroContent = {
  eyebrow?: string;

  title: string;

  accentTitle?: string;

  description?: string;

  image: string;

  imageAlt: string;

  imagePosition?: string;

  /*
   * Optional rotating hero photos (max 5). When present the
   * right-hand image becomes a gentle sliding carousel; when
   * empty it falls back to the single `image` above.
   *
   * Later: populated by the admin-managed homepage API.
   */
  images?: CarouselSlide[];

  imageLabel?: string;

  imageCaption?: string;

  actions?: HeroAction[];
};

/* =========================================================
   INITIAL CONTENT

   Later this object can come from Admin/API.

   Admin can control:
   - text
   - image
   - image focal point
   - CTA labels
   - CTA routes

   Admin must NOT control:
   - global fonts
   - theme colors
   - typography hierarchy
   - page layout system
========================================================= */

const heroContent: HeroContent = {
  eyebrow:
    'Dining • Events • Celebration',

  title:
    'Taste. Celebrate.',

  accentTitle:
    'Remember.',

  description:
    'Exceptional dining, warm hospitality and memorable celebrations in one refined destination.',

  image:
    '/images/home/harmony-hero-dining.jpg',

  imageAlt:
    'Harmony Dining & Event Center dining space',

  imagePosition:
    'center',

  /*
   * TEST DATA — swap for the admin/API payload later.
   * Up to 5 photos; the carousel clamps anything beyond that.
   */
  images: [
    {
      src: '/images/home/harmony-hero-dining.jpg',
      alt: 'Guests dining at Harmony Dining & Event Center',
      position: 'center',
    },
    {
      src: '/images/home/harmony-hero-restaurant.jpg',
      alt: 'The Harmony restaurant interior',
      position: 'center',
    },
    {
      src: '/images/home/harmony-gallery-dining-hall.jpg',
      alt: 'Harmony dining hall set for service',
      position: 'center',
    },
    {
      src: '/images/home/harmony-banquet-hall.jpg',
      alt: 'Harmony banquet hall arranged for an event',
      position: 'center',
    },
    {
      src: '/images/home/harmony-experience-event.jpg',
      alt: 'A celebration underway at Harmony',
      position: 'center',
    },
  ],

  imageLabel:
    'Harmony Experience',

  imageCaption:
    'Dining with distinction',

  actions: [
    {
      label:
        'Book Event / Hall',

      href:
        '/events#enquiry',

      icon:
        CelebrationRoundedIcon,

      variant:
        'primary',
    },

    {
      label:
        'Reserve a Table',

      href:
        '/reservation',

      icon:
        CalendarMonthRoundedIcon,

      variant:
        'secondary',
    },

    {
      label:
        'Explore Menu',

      href:
        '/menu',

      icon:
        RestaurantMenuRoundedIcon,

      variant:
        'tertiary',
    },
  ],
};

/* =========================================================
   HERO SECTION
========================================================= */

export default function HeroSection() {
  const {
    eyebrow,

    title,

    accentTitle,

    description,

    image,

    imageAlt,

    imagePosition =
      'center',

    images = [],

    imageLabel,

    imageCaption,

    actions = [],
  } = heroContent;

  const validActions =
    actions.filter(
      (action) =>
        Boolean(
          action.label?.trim(),
        ) &&
        Boolean(
          action.href?.trim(),
        ),
    );

  /* Validated hero photos, capped at 5, with a single-image fallback. */
  const heroSlides: CarouselSlide[] = (() => {
    const cleaned = images
      .filter(
        (slide) =>
          Boolean(slide?.src?.trim()) &&
          Boolean(slide?.alt?.trim()),
      )
      .slice(0, 5);

    if (cleaned.length > 0) {
      return cleaned;
    }

    return [
      {
        src: image,
        alt: imageAlt,
        position: imagePosition,
      },
    ];
  })();

  return (
    <Box
      component="section"
      aria-labelledby="home-hero-title"
      sx={{
        position:
          'relative',

        overflow:
          'hidden',

        bgcolor:
          'background.default',

        color:
          'text.primary',
      }}
    >
      {/* =====================================================
          DECORATIVE BACKGROUND
      ===================================================== */}

      <Box
        aria-hidden
        sx={{
          position:
            'absolute',

          inset:
            0,

          pointerEvents:
            'none',

          background:
            (theme) => `
              radial-gradient(
                circle at 12% 18%,
                ${alpha(
                  theme.palette
                    .secondary.main,
                  0.13,
                )},
                transparent 30%
              ),
              radial-gradient(
                circle at 82% 20%,
                ${alpha(
                  theme.palette
                    .secondary.main,
                  0.05,
                )},
                transparent 28%
              )
            `,
        }}
      />

      {/* =====================================================
          HERO CONTENT
      ===================================================== */}

      <Container
        maxWidth="xl"
        sx={{
          position:
            'relative',

          zIndex:
            1,

          py: {
            xs:
              5,

            sm:
              6,

            md:
              7,

            lg:
              8,
          },
        }}
      >
        <Box
          sx={{
            display:
              'grid',

            gridTemplateColumns:
              {
                xs:
                  'minmax(0,1fr)',

                lg:
                  'minmax(0,0.9fr) minmax(0,1.1fr)',
              },

            alignItems:
              'center',

            gap: {
              xs:
                4,

              md:
                5,

              lg:
                7,
            },

            minHeight: {
              xs:
                'auto',

              lg:
                620,
            },
          }}
        >
          {/* =================================================
              LEFT CONTENT
          ================================================= */}

          <Box
            sx={{
              position:
                'relative',

              zIndex:
                2,

              minWidth:
                0,

              maxWidth: {
                xs:
                  '100%',

                lg:
                  680,
              },

              py: {
                xs:
                  1,

                sm:
                  2,

                lg:
                  3,
              },
            }}
          >
            {/* EYEBROW */}

            {eyebrow ? (
              <Box
                sx={{
                  display:
                    'flex',

                  alignItems:
                    'center',

                  gap:
                    1.2,

                  minWidth:
                    0,
                }}
              >
                <Box
                  aria-hidden
                  sx={{
                    width:
                      36,

                    height:
                      1,

                    flexShrink:
                      0,

                    bgcolor:
                      'secondary.main',
                  }}
                />

                <Typography
                  variant="overline"
                  sx={{
                    minWidth:
                      0,

                    color:
                      'secondary.main',

                    overflowWrap:
                      'anywhere',
                  }}
                >
                  {eyebrow}
                </Typography>
              </Box>
            ) : null}

            {/* TITLE */}

            <Typography
              id="home-hero-title"
              component="h1"
              variant="h1"
              sx={{
                mt:
                  eyebrow
                    ? {
                        xs:
                          2,

                        md:
                          2.5,
                      }
                    : 0,

                maxWidth:
                  680,

                color:
                  'text.primary',

                overflowWrap:
                  'break-word',

                hyphens:
                  'auto',
              }}
            >
              {title}

              {accentTitle ? (
                <Box
                  component="span"
                  sx={{
                    display:
                      'block',

                    color:
                      'secondary.main',
                  }}
                >
                  {accentTitle}
                </Box>
              ) : null}
            </Typography>

            {/* DESCRIPTION */}

            {description ? (
              <Typography
                component="p"
                variant="body1"
                sx={{
                  mt: {
                    xs:
                      2.5,

                    md:
                      3,
                  },

                  maxWidth:
                    565,

                  color:
                    'text.secondary',

                  overflowWrap:
                    'break-word',
                }}
              >
                {description}
              </Typography>
            ) : null}

            {/* =================================================
                MOBILE CTA

                Priority:
                1. Event / Hall
                2. Table
                3. Menu
            ================================================= */}

            {validActions.length >
            0 ? (
              <Stack
                sx={{
                  display: {
                    xs:
                      'flex',

                    sm:
                      'none',
                  },

                  mt:
                    3.5,

                  gap:
                    1.1,
                }}
              >
                {validActions.map(
                  (
                    action,
                  ) => {
                    const Icon =
                      action.icon;

                    const isPrimary =
                      action.variant ===
                      'primary';

                    const isSecondary =
                      action.variant ===
                      'secondary';

                    return (
                      <Link
                        key={`${action.href}-${action.label}`}
                        href={
                          action.href
                        }
                        style={{
                          display:
                            'block',

                          width:
                            '100%',

                          textDecoration:
                            'none',
                        }}
                      >
                        <Button
                          fullWidth
                          size="large"
                          variant={
                            isPrimary
                              ? 'contained'
                              : 'outlined'
                          }
                          startIcon={
                            Icon ? (
                              <Icon />
                            ) : undefined
                          }
                          endIcon={
                            isPrimary ? (
                              <ArrowOutwardRoundedIcon />
                            ) : undefined
                          }
                          sx={{
                            minHeight:
                              isPrimary
                                ? 56
                                : 52,

                            px:
                              2.5,

                            ...(isPrimary
                              ? {
                                  bgcolor:
                                    'primary.main',

                                  color:
                                    'primary.contrastText',

                                  '&:hover':
                                    {
                                      bgcolor:
                                        'primary.dark',
                                    },
                                }
                              : isSecondary
                                ? {
                                    color:
                                      'text.primary',

                                    borderColor:
                                      'secondary.main',

                                    bgcolor:
                                      'background.paper',

                                    '&:hover':
                                      {
                                        borderColor:
                                          'secondary.dark',

                                        bgcolor:
                                          'action.hover',
                                      },
                                  }
                                : {
                                    color:
                                      'text.secondary',

                                    borderColor:
                                      'divider',

                                    bgcolor:
                                      'transparent',

                                    '&:hover':
                                      {
                                        color:
                                          'primary.main',

                                        borderColor:
                                          'primary.main',

                                        bgcolor:
                                          'action.hover',
                                      },
                                  }),

                            whiteSpace:
                              'normal',

                            textAlign:
                              'center',
                          }}
                        >
                          {
                            action.label
                          }
                        </Button>
                      </Link>
                    );
                  },
                )}
              </Stack>
            ) : null}

            {/* =================================================
                TABLET / DESKTOP CTA
            ================================================= */}

            {validActions.length >
            0 ? (
              <Box
                sx={{
                  display: {
                    xs:
                      'none',

                    sm:
                      'flex',
                  },

                  mt:
                    4,

                  alignItems:
                    'center',

                  flexWrap:
                    'wrap',

                  gap:
                    1.25,
                }}
              >
                {validActions.map(
                  (
                    action,
                  ) => {
                    const Icon =
                      action.icon;

                    const isPrimary =
                      action.variant ===
                      'primary';

                    const isSecondary =
                      action.variant ===
                      'secondary';

                    return (
                      <Link
                        key={`${action.href}-${action.label}`}
                        href={
                          action.href
                        }
                        style={{
                          display:
                            'inline-flex',

                          textDecoration:
                            'none',
                        }}
                      >
                        <Button
                          variant={
                            isPrimary
                              ? 'contained'
                              : 'outlined'
                          }
                          size="large"
                          startIcon={
                            Icon ? (
                              <Icon />
                            ) : undefined
                          }
                          endIcon={
                            isPrimary ? (
                              <ArrowOutwardRoundedIcon />
                            ) : undefined
                          }
                          sx={{
                            minHeight:
                              52,

                            px: {
                              sm:
                                2.4,

                              md:
                                3,
                            },

                            ...(isPrimary
                              ? {
                                  bgcolor:
                                    'primary.main',

                                  color:
                                    'primary.contrastText',

                                  '&:hover':
                                    {
                                      bgcolor:
                                        'primary.dark',
                                    },
                                }
                              : isSecondary
                                ? {
                                    color:
                                      'text.primary',

                                    borderColor:
                                      'secondary.main',

                                    '&:hover':
                                      {
                                        borderColor:
                                          'secondary.dark',

                                        bgcolor:
                                          'action.hover',
                                      },
                                  }
                                : {
                                    color:
                                      'text.secondary',

                                    borderColor:
                                      'divider',

                                    '&:hover':
                                      {
                                        color:
                                          'primary.main',

                                        borderColor:
                                          'primary.main',

                                        bgcolor:
                                          'action.hover',
                                      },
                                  }),

                            whiteSpace:
                              'nowrap',
                          }}
                        >
                          {
                            action.label
                          }
                        </Button>
                      </Link>
                    );
                  },
                )}
              </Box>
            ) : null}
          </Box>

          {/* =================================================
              RIGHT IMAGE
          ================================================= */}

          <Box
            sx={{
              position:
                'relative',

              width:
                '100%',

              minWidth:
                0,

              aspectRatio: {
                xs:
                  '4 / 3',

                sm:
                  '16 / 11',

                md:
                  '16 / 10',

                lg:
                  'auto',
              },

              minHeight: {
                lg:
                  620,
              },

              overflow:
                'hidden',

              bgcolor:
                'action.hover',

              borderRadius: {
                xs:
                  1.5,

                md:
                  2,
              },

              boxShadow:
                (theme) =>
                  theme
                    .shadows[12],
            }}
          >
            <ImageCarousel
              slides={heroSlides}
              sizes="(max-width: 1199px) 100vw, 55vw"
            />

            {/* IMAGE GRADIENT */}

            <Box
              aria-hidden
              sx={{
                position:
                  'absolute',

                inset:
                  0,

                background:
                  (
                    theme,
                  ) => `
                    linear-gradient(
                      180deg,
                      ${alpha(
                        theme
                          .palette
                          .primary
                          .dark,
                        0.02,
                      )} 0%,
                      ${alpha(
                        theme
                          .palette
                          .primary
                          .dark,
                        0.02,
                      )} 48%,
                      ${alpha(
                        theme
                          .palette
                          .primary
                          .dark,
                        0.42,
                      )} 100%
                    )
                  `,

                pointerEvents:
                  'none',
              }}
            />

            {/* =================================================
                IMAGE LABEL
            ================================================= */}

            {(imageLabel ||
              imageCaption) ? (
              <Box
                sx={{
                  position:
                    'absolute',

                  left: {
                    xs:
                      14,

                    sm:
                      22,

                    md:
                      26,
                  },

                  right: {
                    xs:
                      14,

                    sm:
                      'auto',
                  },

                  bottom: {
                    xs:
                      14,

                    sm:
                      22,

                    md:
                      26,
                  },

                  maxWidth: {
                    xs:
                      'calc(100% - 28px)',

                    sm:
                      310,
                  },

                  minWidth:
                    0,

                  px: {
                    xs:
                      1.6,

                    md:
                      2.1,
                  },

                  py: {
                    xs:
                      1.3,

                    md:
                      1.6,
                  },

                  borderRadius:
                    1,

                  bgcolor:
                    (
                      theme,
                    ) =>
                      alpha(
                        theme
                          .palette
                          .primary
                          .dark,
                        0.9,
                      ),

                  border:
                    '1px solid',

                  borderColor:
                    (
                      theme,
                    ) =>
                      alpha(
                        theme
                          .palette
                          .secondary
                          .main,
                        0.28,
                      ),

                  backdropFilter:
                    'blur(12px)',

                  WebkitBackdropFilter:
                    'blur(12px)',

                  boxShadow:
                    (
                      theme,
                    ) =>
                      theme
                        .shadows[8],
                }}
              >
                {imageLabel ? (
                  <Typography
                    variant="overline"
                    sx={{
                      display:
                        'block',

                      color:
                        'secondary.light',

                      overflowWrap:
                        'anywhere',
                    }}
                  >
                    {
                      imageLabel
                    }
                  </Typography>
                ) : null}

                {imageCaption ? (
                  <Typography
                    variant="subtitle2"
                    sx={{
                      mt:
                        imageLabel
                          ? 0.6
                          : 0,

                      color:
                        'primary.contrastText',

                      overflowWrap:
                        'anywhere',
                    }}
                  >
                    {
                      imageCaption
                    }
                  </Typography>
                ) : null}
              </Box>
            ) : null}
          </Box>
        </Box>
      </Container>
    </Box>
  );
}