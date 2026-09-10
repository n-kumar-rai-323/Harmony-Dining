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
  type Theme,
} from '@mui/material/styles';

import ArrowOutwardRoundedIcon from '@mui/icons-material/ArrowOutwardRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded';
import CelebrationRoundedIcon from '@mui/icons-material/CelebrationRounded';
import PlaceRoundedIcon from '@mui/icons-material/PlaceRounded';
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

/**
 * Store only a serialisable key in Admin/API data — the UI resolves it to a
 * local MUI icon. Never store a React component in PostgreSQL.
 */
export type HeroActionIconKey =
  | 'celebration'
  | 'calendar'
  | 'menu';

type HeroAction = {
  label: string;
  href: string;
  iconKey?: HeroActionIconKey;
  variant:
    | 'primary'
    | 'secondary'
    | 'tertiary';
};

function getHeroActionIcon(
  iconKey?: HeroActionIconKey,
): SvgIconComponent | undefined {
  switch (iconKey) {
    case 'celebration':
      return CelebrationRoundedIcon;
    case 'calendar':
      return CalendarMonthRoundedIcon;
    case 'menu':
      return RestaurantMenuRoundedIcon;
    default:
      return undefined;
  }
}

export type HeroContent = {
  eyebrow?: string;

  title: string;

  accentTitle?: string;

  description?: string;

  image: string;

  imageAlt: string;

  imagePosition?: string;

  /*
   * Optional rotating hero photos (max 5). When present the
   * background becomes a gentle sliding carousel; when empty
   * it falls back to the single `image` above.
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

      iconKey:
        'celebration',

      variant:
        'primary',
    },

    {
      label:
        'Reserve a Table',

      href:
        '/reservation',

      iconKey:
        'calendar',

      variant:
        'secondary',
    },

    {
      label:
        'Explore Menu',

      href:
        '/menu',

      iconKey:
        'menu',

      variant:
        'tertiary',
    },
  ],
};

/* =========================================================
   BUTTON STYLE

   One filled gold CTA, the rest translucent glass so the
   copy stays readable on top of the background photo.
========================================================= */

function heroButtonSx(
  variant: HeroAction['variant'],
) {
  if (variant === 'primary') {
    return {
      bgcolor:
        'secondary.main',

      color:
        'secondary.contrastText',

      '&:hover': {
        bgcolor:
          'secondary.dark',
      },
    };
  }

  return {
    color:
      'common.white',

    borderColor:
      (theme: Theme) =>
        alpha(
          theme.palette.common.white,
          0.4,
        ),

    bgcolor:
      (theme: Theme) =>
        alpha(
          theme.palette.primary.dark,
          0.35,
        ),

    backdropFilter:
      'blur(8px)',

    WebkitBackdropFilter:
      'blur(8px)',

    '&:hover': {
      borderColor:
        'secondary.main',

      bgcolor:
        (theme: Theme) =>
          alpha(
            theme.palette.primary.dark,
            0.6,
          ),
    },
  };
}

/* =========================================================
   HERO SECTION
========================================================= */

type HeroSectionProps = {
  /** Parent Server Component can pass published hero content. */
  content?: HeroContent;
};

export default function HeroSection({
  content = heroContent,
}: HeroSectionProps) {
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
  } = content;

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

        display:
          'flex',

        alignItems:
          'center',

        minHeight: {
          xs:
            '88vh',

          sm:
            '90vh',

          md:
            '90vh',
        },

        bgcolor:
          'primary.dark',

        color:
          'common.white',
      }}
    >
      {/* =====================================================
          FULL-BLEED BACKGROUND PHOTO
      ===================================================== */}

      <Box
        aria-hidden
        sx={{
          position:
            'absolute',

          inset:
            0,

          zIndex:
            0,
        }}
      >
        <ImageCarousel
          slides={heroSlides}
          sizes="100vw"
          controls={false}
          ignoreReducedMotion
        />
      </Box>

      {/* =====================================================
          GRADIENT SCRIM

          Keeps the copy legible on top of the photo. On phones
          the content is centred and full-width, so the wash is
          vertical; from tablet up it darkens the left and foot
          of the frame and fades to near-clear elsewhere.
      ===================================================== */}

      <Box
        aria-hidden
        sx={{
          position:
            'absolute',

          inset:
            0,

          zIndex:
            1,

          pointerEvents:
            'none',

          display: {
            xs:
              'block',

            sm:
              'none',
          },

          background:
            (theme) => `
              linear-gradient(
                180deg,
                ${alpha(
                  theme.palette
                    .primary.dark,
                  0.52,
                )} 0%,
                ${alpha(
                  theme.palette
                    .primary.dark,
                  0.44,
                )} 45%,
                ${alpha(
                  theme.palette
                    .primary.dark,
                  0.78,
                )} 100%
              )
            `,
        }}
      />

      <Box
        aria-hidden
        sx={{
          position:
            'absolute',

          inset:
            0,

          zIndex:
            1,

          pointerEvents:
            'none',

          display: {
            xs:
              'none',

            sm:
              'block',
          },

          background:
            (theme) => `
              linear-gradient(
                90deg,
                ${alpha(
                  theme.palette
                    .primary.dark,
                  0.74,
                )} 0%,
                ${alpha(
                  theme.palette
                    .primary.dark,
                  0.44,
                )} 42%,
                ${alpha(
                  theme.palette
                    .primary.dark,
                  0.12,
                )} 100%
              ),
              linear-gradient(
                0deg,
                ${alpha(
                  theme.palette
                    .primary.dark,
                  0.55,
                )} 0%,
                ${alpha(
                  theme.palette
                    .primary.dark,
                  0,
                )} 46%
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
            2,

          py: {
            xs:
              7,

            sm:
              8,

            md:
              10,
          },
        }}
      >
        <Box
          sx={{
            maxWidth: {
              xs:
                '100%',

              md:
                640,
            },
          }}
        >
          {/* EYEBROW */}

          {eyebrow ? (
            <Box
              sx={{
                display:
                  'inline-flex',

                alignItems:
                  'center',

                gap:
                  1,

                maxWidth:
                  '100%',

                px:
                  1.6,

                py:
                  0.7,

                borderRadius:
                  '999px',

                bgcolor:
                  (theme) =>
                    alpha(
                      theme.palette
                        .primary.dark,
                      0.55,
                    ),

                border:
                  '1px solid',

                borderColor:
                  (theme) =>
                    alpha(
                      theme.palette
                        .secondary.main,
                      0.4,
                    ),

                backdropFilter:
                  'blur(8px)',

                WebkitBackdropFilter:
                  'blur(8px)',
              }}
            >
              <AutoAwesomeRoundedIcon
                sx={{
                  fontSize:
                    16,

                  flexShrink:
                    0,

                  color:
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
                'common.white',

              textShadow:
                '0 2px 24px rgba(0,0,0,0.45)',

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
                  (theme) =>
                    alpha(
                      theme.palette
                        .common.white,
                      0.88,
                    ),

                textShadow:
                  '0 1px 12px rgba(0,0,0,0.4)',

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
                    getHeroActionIcon(action.iconKey);

                  const isPrimary =
                    action.variant ===
                    'primary';

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

                          whiteSpace:
                            'normal',

                          textAlign:
                            'center',

                          ...heroButtonSx(
                            action.variant,
                          ),
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
                    getHeroActionIcon(action.iconKey);

                  const isPrimary =
                    action.variant ===
                    'primary';

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

                          whiteSpace:
                            'nowrap',

                          ...heroButtonSx(
                            action.variant,
                          ),
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

          {/* =================================================
              LOCATION / CAPTION
          ================================================= */}

          {(imageLabel ||
            imageCaption) ? (
            <Box
              sx={{
                mt: {
                  xs:
                    3.5,

                  md:
                    4,
                },
              }}
            >
              {imageLabel &&
              imageCaption ? (
                <Typography
                  variant="overline"
                  sx={{
                    display:
                      'block',

                    mb:
                      0.5,

                    color:
                      'secondary.light',

                    overflowWrap:
                      'anywhere',
                  }}
                >
                  {imageLabel}
                </Typography>
              ) : null}

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
                    display:
                      'inline-flex',

                    alignItems:
                      'center',

                    justifyContent:
                      'center',

                    flexShrink:
                      0,

                    width:
                      34,

                    height:
                      34,

                    borderRadius:
                      '50%',

                    bgcolor:
                      (theme) =>
                        alpha(
                          theme.palette
                            .primary.dark,
                          0.6,
                        ),

                    border:
                      '1px solid',

                    borderColor:
                      (theme) =>
                        alpha(
                          theme.palette
                            .secondary.main,
                          0.4,
                        ),

                    backdropFilter:
                      'blur(8px)',

                    WebkitBackdropFilter:
                      'blur(8px)',
                  }}
                >
                  <PlaceRoundedIcon
                    sx={{
                      fontSize:
                        18,

                      color:
                        'secondary.main',
                    }}
                  />
                </Box>

                <Typography
                  variant="body2"
                  sx={{
                    minWidth:
                      0,

                    color:
                      (theme) =>
                        alpha(
                          theme.palette
                            .common.white,
                          0.85,
                        ),

                    overflowWrap:
                      'anywhere',
                  }}
                >
                  {imageCaption ||
                    imageLabel}
                </Typography>
              </Box>
            </Box>
          ) : null}
        </Box>
      </Container>
    </Box>
  );
}
