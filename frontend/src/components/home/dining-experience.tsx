'use client';

import Image from 'next/image';
import Link from 'next/link';

import {
  Box,
  Button,
  Container,
  Typography,
} from '@mui/material';

import { alpha } from '@mui/material/styles';

import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import RestaurantRoundedIcon from '@mui/icons-material/RestaurantRounded';

import type { SvgIconComponent } from '@mui/icons-material';

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
   DiningExperience
========================================================= */

type DiningDetail = {
  title: string;
  subtitle?: string;
  icon?: SvgIconComponent;
};

type DiningCta = {
  label: string;
  href: string;
};

type DiningExperienceContent = {
  eyebrow?: string;

  title: string;
  description?: string;

  image: string;
  imageAlt: string;
  imagePosition?: string;

  detail?: DiningDetail;

  cta?: DiningCta;
};

/* =========================================================
   INITIAL CONTENT

   Development-time source only.

   Later this can become:

   const diningContent =
     await getHomepageDiningExperience();

   The UI below does not need redesign.

   Admin can control:
   - eyebrow
   - title
   - description
   - image
   - image alt
   - image focal position
   - detail content
   - CTA label
   - CTA route

   Admin must NOT control:
   - brand colors
   - fonts
   - typography scale
   - section layout system
========================================================= */

const diningContent: DiningExperienceContent = {
  eyebrow: 'Dining Experience',

  title:
    'Good food feels better in the right place.',

  description:
    'A welcoming setting designed for relaxed meals, family gatherings and memorable moments with the people who matter.',

  image:
    '/images/home/harmony-dining-experience.jpg',

  imageAlt:
    'Warm dining environment at Harmony Dining & Event Center',

  imagePosition: 'center',

  detail: {
    title: 'Dining',
    subtitle: 'Premium Space',
    icon: RestaurantRoundedIcon,
  },

  cta: {
    label: 'Discover Harmony',
    href: '/gallery',
  },
};

/* =========================================================
   DINING EXPERIENCE
========================================================= */

export default function DiningExperience() {
  const {
    eyebrow,
    title,
    description,

    image,
    imageAlt,
    imagePosition = 'center',

    detail,
    cta,
  } = diningContent;

  const DetailIcon = detail?.icon;

  const hasDetail =
    Boolean(detail?.title?.trim()) ||
    Boolean(detail?.subtitle?.trim());

  const hasCta =
    Boolean(cta?.label?.trim()) &&
    Boolean(cta?.href?.trim());

  return (
    <Box
      component="section"
      aria-labelledby="dining-experience-title"
      sx={{
        position: 'relative',
        overflow: 'hidden',

        bgcolor: 'background.default',
        color: 'text.primary',

        py: {
          xs: 7,
          sm: 8,
          md: 10,
          lg: 11,
        },
      }}
    >
      <Container maxWidth="xl">
        <Box
          sx={{
            display: 'grid',

            gridTemplateColumns: {
              xs: 'minmax(0, 1fr)',
              lg:
                'minmax(0, 1.05fr) minmax(0, 0.95fr)',
            },

            alignItems: 'center',

            gap: {
              xs: 4.5,
              md: 6,
              lg: 9,
            },
          }}
        >
          {/* =================================================
              IMAGE
          ================================================== */}

          <Box
            sx={{
              position: 'relative',

              width: '100%',
              minWidth: 0,

              aspectRatio: {
                xs: '4 / 3',
                sm: '16 / 10',
                md: '16 / 10',
                lg: 'auto',
              },

              minHeight: {
                lg: 610,
              },

              overflow: 'hidden',

              bgcolor: 'action.hover',

              borderRadius: {
                xs: 1.5,
                md: 2,
              },

              boxShadow: (theme) =>
                theme.shadows[10],
            }}
          >
            <Image
              src={image}
              alt={imageAlt}
              fill
              quality={75}
              sizes="(max-width: 1199px) 100vw, 52vw"
              style={{
                objectFit: 'cover',
                objectPosition: imagePosition,
              }}
            />

            <Box
              aria-hidden
              sx={{
                position: 'absolute',

                inset: 0,

                background: (theme) => `
                  linear-gradient(
                    180deg,
                    ${alpha(
                      theme.palette.primary.dark,
                      0,
                    )} 58%,
                    ${alpha(
                      theme.palette.primary.dark,
                      0.2,
                    )} 100%
                  )
                `,

                pointerEvents: 'none',
              }}
            />
          </Box>

          {/* =================================================
              CONTENT
          ================================================== */}

          <Box
            sx={{
              minWidth: 0,

              maxWidth: {
                xs: '100%',
                lg: 610,
              },
            }}
          >
            {/* =================================================
                EYEBROW
            ================================================== */}

            {eyebrow && (
              <Box
                sx={{
                  display: 'flex',

                  alignItems: 'center',

                  minWidth: 0,

                  gap: 1.15,
                }}
              >
                <Box
                  aria-hidden
                  sx={{
                    width: 34,

                    height: 1,

                    flexShrink: 0,

                    bgcolor:
                      'secondary.main',
                  }}
                />

                <Typography
                  variant="overline"
                  sx={{
                    minWidth: 0,

                    color:
                      'secondary.main',

                    overflowWrap:
                      'anywhere',
                  }}
                >
                  {eyebrow}
                </Typography>
              </Box>
            )}

            {/* =================================================
                TITLE
            ================================================== */}

            <Typography
              id="dining-experience-title"
              component="h2"
              variant="h2"
              sx={{
                mt: eyebrow
                  ? {
                      xs: 1.8,
                      md: 2.1,
                    }
                  : 0,

                maxWidth: 610,

                color: 'text.primary',

                overflowWrap:
                  'break-word',

                hyphens: 'auto',
              }}
            >
              {title}
            </Typography>

            {/* =================================================
                DESCRIPTION
            ================================================== */}

            {description && (
              <Typography
                component="p"
                variant="body1"
                sx={{
                  mt: {
                    xs: 2.2,
                    md: 2.7,
                  },

                  maxWidth: 545,

                  color:
                    'text.secondary',

                  overflowWrap:
                    'break-word',
                }}
              >
                {description}
              </Typography>
            )}

            {/* =================================================
                DETAIL + CTA
            ================================================== */}

            {(hasDetail || hasCta) && (
              <Box
                sx={{
                  mt: {
                    xs: 3,
                    md: 3.6,
                  },

                  display: 'flex',

                  flexDirection: {
                    xs: 'column',
                    sm: 'row',
                  },

                  alignItems: {
                    xs: 'stretch',
                    sm: 'center',
                  },

                  flexWrap: {
                    sm: 'wrap',
                  },

                  gap: {
                    xs: 1.5,
                    md: 1.8,
                  },
                }}
              >
                {/* =============================================
                    DETAIL
                ============================================== */}

                {hasDetail && detail && (
                  <Box
                    sx={{
                      display: 'flex',

                      alignItems:
                        'center',

                      width: {
                        xs: '100%',
                        sm: 'auto',
                      },

                      maxWidth:
                        '100%',

                      minWidth: 0,

                      gap: 1.15,

                      pr: 2.2,

                      overflow:
                        'hidden',

                      borderRadius: 1,

                      bgcolor:
                        'background.paper',

                      border:
                        '1px solid',

                      borderColor:
                        'divider',
                    }}
                  >
                    <Box
                      aria-hidden
                      sx={{
                        width: 52,
                        height: 52,

                        display:
                          'grid',

                        placeItems:
                          'center',

                        flexShrink: 0,

                        bgcolor:
                          (theme) =>
                            alpha(
                              theme.palette
                                .secondary
                                .main,
                              0.13,
                            ),

                        color:
                          'secondary.main',
                      }}
                    >
                      {DetailIcon ? (
                        <DetailIcon
                          sx={{
                            fontSize: 22,
                          }}
                        />
                      ) : (
                        <RestaurantRoundedIcon
                          sx={{
                            fontSize: 22,
                          }}
                        />
                      )}
                    </Box>

                    <Box
                      sx={{
                        minWidth: 0,

                        py: 0.85,
                      }}
                    >
                      {detail.title && (
                        <Typography
                          variant="subtitle2"
                          sx={{
                            color:
                              'text.primary',

                            overflowWrap:
                              'anywhere',
                          }}
                        >
                          {detail.title}
                        </Typography>
                      )}

                      {detail.subtitle && (
                        <Typography
                          variant="caption"
                          sx={{
                            display:
                              'block',

                            mt: 0.3,

                            color:
                              'text.secondary',

                            overflowWrap:
                              'anywhere',
                          }}
                        >
                          {
                            detail.subtitle
                          }
                        </Typography>
                      )}
                    </Box>
                  </Box>
                )}

                {/* =============================================
                    CTA
                ============================================== */}

                {hasCta && cta && (
                  <Box
                    sx={{
                      width: {
                        xs: '100%',
                        sm: 'auto',
                      },

                      maxWidth:
                        '100%',

                      flexShrink: 0,
                    }}
                  >
                    <Link
                      href={cta.href}
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
                        variant="outlined"
                        endIcon={
                          <ArrowForwardRoundedIcon />
                        }
                        sx={{
                          minHeight:
                            52,

                          maxWidth:
                            '100%',

                          px: {
                            xs: 2.2,
                            md: 2.5,
                          },

                          color:
                            'secondary.main',

                          borderColor:
                            'divider',

                          whiteSpace: {
                            xs: 'normal',
                            sm: 'nowrap',
                          },

                          textAlign:
                            'center',

                          overflowWrap:
                            'anywhere',

                          '&:hover': {
                            borderColor:
                              'secondary.main',

                            bgcolor:
                              'action.hover',
                          },

                          '@media (prefers-reduced-motion: reduce)':
                            {
                              transition:
                                'none',
                            },
                        }}
                      >
                        {cta.label}
                      </Button>
                    </Link>
                  </Box>
                )}
              </Box>
            )}
          </Box>
        </Box>
      </Container>
    </Box>
  );
}