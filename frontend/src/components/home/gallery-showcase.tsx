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
import CollectionsRoundedIcon from '@mui/icons-material/CollectionsRounded';

/* =========================================================
   TYPES

   Admin Dashboard
        ↓
   NestJS API
        ↓
   PostgreSQL
        ↓
   Parent Server Component
        ↓
   GalleryShowcase content prop
========================================================= */

export type GalleryItem = {
  id: string;
  src: string;
  alt: string;
  label: string;
  description?: string;
  imagePosition?: string;
};

export type GalleryShowcaseContent = {
  enabled?: boolean;
  eyebrow?: string;
  title: string;
  accentTitle?: string;
  description?: string;
  items?: GalleryItem[];
  cta?: {
    label: string;
    href: string;
  };
  footerBrand?: string;
  footerMeta?: string;
};

type GalleryShowcaseProps = {
  /**
   * Parent Server Component can fetch published gallery content
   * and pass serializable data into this Client Component.
   */
  content?: GalleryShowcaseContent;
};

/* =========================================================
   DEVELOPMENT-TIME CONTENT

   Current photos/text are intentionally kept.
   Later Admin/API can replace/reorder these values without
   redesigning the component.
========================================================= */

const initialGalleryContent: GalleryShowcaseContent = {
  enabled: true,

  eyebrow: 'Inside Harmony',

  title: 'More than a place',

  accentTitle: 'to dine.',

  description:
    'Step inside Harmony and discover the spaces behind every meal, celebration and memorable visit.',

  items: [
    {
      id: 'terrace',
      src: '/images/home/harmony-gallery-terrace.jpg',
      alt: 'Harmony outdoor terrace area',
      label: 'The Terrace',
      description:
        'Open-air moments at Harmony.',
      imagePosition: 'center',
    },
    {
      id: 'dining-hall',
      src:
        '/images/home/harmony-gallery-dining-hall.jpg',
      alt: 'Harmony dining hall',
      label: 'Dining Hall',
      description:
        'A warm setting made for gathering.',
      imagePosition: 'center',
    },
    {
      id: 'kitchen',
      src:
        '/images/home/harmony-gallery-kitchen.jpg',
      alt: 'Harmony kitchen area',
      label: 'The Kitchen',
      description:
        'Where every plate begins.',
      imagePosition: 'center',
    },
    {
      id: 'entrance',
      src:
        '/images/home/harmony-gallery-entrance.jpg',
      alt: 'Harmony entrance',
      label: 'Welcome to Harmony',
      description:
        'The first step into the experience.',
      imagePosition: 'center',
    },
  ],

  cta: {
    label: 'Explore Full Gallery',
    href: '/gallery',
  },

  footerBrand:
    'Harmony Dining & Event Center',

  footerMeta:
    'Dining • Celebrations • Hospitality',
};

/* =========================================================
   GALLERY SHOWCASE
========================================================= */

export default function GalleryShowcase({
  content = initialGalleryContent,
}: GalleryShowcaseProps) {
  const {
    enabled = true,

    eyebrow,

    title,

    accentTitle,

    description,

    items = [],

    cta,

    footerBrand,

    footerMeta,
  } = content;

  const validItems = items.filter(
    (item) =>
      item.id.trim().length > 0 &&
      item.src.trim().length > 0 &&
      item.alt.trim().length > 0 &&
      item.label.trim().length > 0,
  );

  const hasCta =
    Boolean(cta?.label?.trim()) &&
    Boolean(cta?.href?.trim());

  if (!enabled || validItems.length === 0) {
    return null;
  }

  const [featuredItem, ...secondaryItems] =
    validItems;

  const topSecondaryItem =
    secondaryItems[0];

  const compactItems =
    secondaryItems.slice(1, 3);

  return (
    <Box
      component="section"
      aria-labelledby="gallery-showcase-title"
      sx={{
        position: 'relative',

        overflow: 'hidden',

        bgcolor: 'background.default',

        color: 'text.primary',

        py: {
          xs: 7,
          sm: 8,
          md: 10,
          lg: 12,
        },
      }}
    >
      {/* BACKGROUND DECORATION */}

      <Box
        aria-hidden
        sx={{
          position: 'absolute',

          width: {
            xs: 320,
            md: 520,
          },

          height: {
            xs: 320,
            md: 520,
          },

          top: -280,

          right: -220,

          borderRadius: '50%',

          background: (theme) =>
            `radial-gradient(
              circle,
              ${alpha(
                theme.palette.secondary.main,
                0.1,
              )} 0%,
              ${alpha(
                theme.palette.secondary.main,
                0,
              )} 70%
            )`,

          pointerEvents: 'none',
        }}
      />

      <Container
        maxWidth="xl"
        sx={{
          position: 'relative',

          zIndex: 1,
        }}
      >
        {/* HEADER */}

        <Box
          sx={{
            display: 'grid',

            gridTemplateColumns: {
              xs: 'minmax(0, 1fr)',

              md:
                'minmax(0,1fr) minmax(280px,420px)',
            },

            alignItems: 'end',

            gap: {
              xs: 2.5,
              md: 6,
            },

            mb: {
              xs: 4,
              md: 5.5,
            },
          }}
        >
          <Box
            sx={{
              maxWidth: 780,

              minWidth: 0,
            }}
          >
            {eyebrow && (
              <Box
                sx={{
                  display: 'flex',

                  alignItems: 'center',

                  gap: 1.2,

                  minWidth: 0,
                }}
              >
                <Box
                  aria-hidden
                  sx={{
                    width: 34,

                    height: 1,

                    bgcolor:
                      'secondary.main',

                    flexShrink: 0,
                  }}
                />

                <Typography
                  variant="overline"
                  sx={{
                    minWidth: 0,

                    color:
                      'secondary.dark',

                    overflowWrap:
                      'anywhere',
                  }}
                >
                  {eyebrow}
                </Typography>
              </Box>
            )}

            <Typography
              id="gallery-showcase-title"
              component="h2"
              variant="h2"
              sx={{
                mt: eyebrow
                  ? {
                      xs: 1.7,
                      md: 2,
                    }
                  : 0,

                maxWidth: 760,

                color: 'text.primary',

                overflowWrap:
                  'break-word',

                hyphens: 'auto',
              }}
            >
              {title}

              {accentTitle && (
                <Box
                  component="span"
                  sx={{
                    display: {
                      xs: 'inline',
                      sm: 'block',
                    },

                    color:
                      'secondary.dark',
                  }}
                >
                  {' '}
                  {accentTitle}
                </Box>
              )}
            </Typography>
          </Box>

          <Box
            sx={{
              minWidth: 0,
            }}
          >
            {description && (
              <Typography
                component="p"
                variant="body1"
                sx={{
                  m: 0,

                  color:
                    'text.secondary',

                  overflowWrap:
                    'break-word',
                }}
              >
                {description}
              </Typography>
            )}

            {hasCta && cta && (
              <Box
                sx={{
                  display: {
                    xs: 'none',
                    md: 'block',
                  },

                  mt: description
                    ? 2.4
                    : 0,
                }}
              >
                <Link
                  href={cta.href}
                  style={{
                    display:
                      'inline-block',

                    maxWidth: '100%',

                    textDecoration:
                      'none',
                  }}
                >
                  <Button
                    variant="outlined"
                    endIcon={
                      <ArrowForwardRoundedIcon
                        sx={{
                          fontSize:
                            '19px !important',
                        }}
                      />
                    }
                    sx={{
                      minHeight: 48,

                      maxWidth: '100%',

                      px: 2.5,

                      color:
                        'text.primary',

                      borderColor:
                        'divider',

                      textAlign:
                        'center',

                      whiteSpace:
                        'normal',

                      overflowWrap:
                        'anywhere',

                      '&:hover': {
                        borderColor:
                          'secondary.main',

                        bgcolor:
                          'action.hover',
                      },
                    }}
                  >
                    {cta.label}
                  </Button>
                </Link>
              </Box>
            )}
          </Box>
        </Box>

        {/* =====================================================
            DYNAMIC EDITORIAL GALLERY

            Admin may publish 1–4+ items without producing
            empty frames.
        ====================================================== */}

        <Box
          sx={{
            display: 'grid',

            gridTemplateColumns: {
              xs:
                'minmax(0, 1fr)',

              lg:
                secondaryItems.length > 0
                  ? 'minmax(0,1.18fr) minmax(0,0.82fr)'
                  : 'minmax(0,1fr)',
            },

            gap: {
              xs: 1.5,
              md: 2,
            },
          }}
        >
          <GalleryFrame
            item={featuredItem}
            featured
          />

          {secondaryItems.length > 0 && (
            <Box
              sx={{
                display: 'grid',

                gridTemplateRows: {
                  xs: 'auto',

                  lg:
                    compactItems.length > 0
                      ? '1.08fr 0.92fr'
                      : '1fr',
                },

                gap: {
                  xs: 1.5,
                  md: 2,
                },

                minWidth: 0,
              }}
            >
              {topSecondaryItem && (
                <GalleryFrame
                  item={topSecondaryItem}
                />
              )}

              {compactItems.length > 0 && (
                <Box
                  sx={{
                    display: 'grid',

                    gridTemplateColumns:
                      {
                        xs:
                          'minmax(0,1fr)',

                        sm:
                          compactItems.length >
                          1
                            ? 'repeat(2, minmax(0,1fr))'
                            : 'minmax(0,1fr)',
                      },

                    gap: {
                      xs: 1.5,
                      md: 2,
                    },

                    minWidth: 0,
                  }}
                >
                  {compactItems.map(
                    (item) => (
                      <GalleryFrame
                        key={item.id}
                        item={item}
                        compact
                      />
                    ),
                  )}
                </Box>
              )}
            </Box>
          )}
        </Box>

        {/* FOOTER BRAND CONTEXT */}

        {(footerBrand || footerMeta) && (
          <Box
            sx={{
              mt: {
                xs: 2.4,
                md: 3,
              },

              pt: {
                xs: 2.2,
                md: 2.7,
              },

              display: {
                xs: 'none',
                md: 'grid',
              },

              gridTemplateColumns:
                footerBrand && footerMeta
                  ? 'auto minmax(40px,1fr) auto'
                  : 'minmax(0,1fr)',

              alignItems: 'center',

              gap: 2,

              borderTop: '1px solid',

              borderColor: 'divider',
            }}
          >
            {footerBrand && (
              <Typography
                variant="overline"
                sx={{
                  minWidth: 0,

                  color:
                    'secondary.dark',

                  overflowWrap:
                    'anywhere',
                }}
              >
                {footerBrand}
              </Typography>
            )}

            {footerBrand &&
              footerMeta && (
                <Box
                  aria-hidden
                  sx={{
                    height: 1,

                    bgcolor:
                      'divider',
                  }}
                />
              )}

            {footerMeta && (
              <Typography
                variant="caption"
                sx={{
                  minWidth: 0,

                  color:
                    'text.secondary',

                  overflowWrap:
                    'anywhere',
                }}
              >
                {footerMeta}
              </Typography>
            )}
          </Box>
        )}

        {/* MOBILE CTA */}

        {hasCta && cta && (
          <Box
            sx={{
              display: {
                xs: 'block',
                md: 'none',
              },

              mt: 3,
            }}
          >
            <Link
              href={cta.href}
              style={{
                display: 'block',

                width: '100%',

                textDecoration:
                  'none',
              }}
            >
              <Button
                fullWidth
                variant="outlined"
                startIcon={
                  <CollectionsRoundedIcon />
                }
                endIcon={
                  <ArrowForwardRoundedIcon />
                }
                sx={{
                  minHeight: 50,

                  color:
                    'text.primary',

                  borderColor:
                    'divider',

                  textAlign:
                    'center',

                  whiteSpace:
                    'normal',

                  overflowWrap:
                    'anywhere',

                  '&:hover': {
                    borderColor:
                      'secondary.main',

                    bgcolor:
                      'action.hover',
                  },
                }}
              >
                {cta.label}
              </Button>
            </Link>
          </Box>
        )}
      </Container>
    </Box>
  );
}

/* =========================================================
   GALLERY FRAME
========================================================= */

function GalleryFrame({
  item,

  featured = false,

  compact = false,
}: {
  item: GalleryItem;

  featured?: boolean;

  compact?: boolean;
}) {
  return (
    <Box
      component="article"
      sx={{
        position: 'relative',

        width: '100%',

        minWidth: 0,

        aspectRatio: featured
          ? {
              xs: '4 / 5',
              sm: '4 / 3',
              lg: '5 / 6',
            }
          : compact
            ? {
                xs: '4 / 3',
                sm: '4 / 3',
                lg: '1 / 1',
              }
            : {
                xs: '4 / 3',
                sm: '16 / 10',
                lg: '16 / 10',
              },

        minHeight: {
          xs: compact ? 300 : 340,

          sm: compact ? 300 : 360,
        },

        overflow: 'hidden',

        isolation: 'isolate',

        bgcolor: 'action.hover',

        borderRadius: {
          xs: 1.5,
          md: 2,
        },

        boxShadow: (theme) =>
          featured
            ? theme.shadows[10]
            : theme.shadows[6],

        '& .gallery-photo': {
          transition:
            'transform 700ms cubic-bezier(0.22,1,0.36,1)',
        },

        '& .gallery-line': {
          transition:
            'width 300ms ease',
        },

        '&:hover .gallery-photo': {
          transform:
            'scale(1.035)',
        },

        '&:hover .gallery-line': {
          width: 46,
        },

        '@media (prefers-reduced-motion: reduce)':
          {
            '& .gallery-photo': {
              transition: 'none',
            },

            '& .gallery-line': {
              transition: 'none',
            },

            '&:hover .gallery-photo':
              {
                transform: 'none',
              },
          },
      }}
    >
      <Image
        className="gallery-photo"
        src={item.src}
        alt={item.alt}
        fill
        quality={75}
        sizes={
          featured
            ? '(max-width: 1199px) 100vw, 58vw'
            : compact
              ? '(max-width: 599px) 100vw, (max-width: 1199px) 50vw, 20vw'
              : '(max-width: 1199px) 100vw, 40vw'
        }
        style={{
          objectFit: 'cover',

          objectPosition:
            item.imagePosition ??
            'center',

          transform: 'scale(1.001)',
        }}
      />

      {/* IMAGE OVERLAY */}

      <Box
        aria-hidden
        sx={{
          position: 'absolute',

          inset: 0,

          zIndex: 1,

          background: (theme) =>
            featured
              ? `linear-gradient(
                  180deg,
                  ${alpha(
                    theme.palette.primary.dark,
                    0.01,
                  )} 25%,
                  ${alpha(
                    theme.palette.primary.dark,
                    0.12,
                  )} 56%,
                  ${alpha(
                    theme.palette.primary.dark,
                    0.82,
                  )} 100%
                )`
              : `linear-gradient(
                  180deg,
                  ${alpha(
                    theme.palette.primary.dark,
                    0,
                  )} 30%,
                  ${alpha(
                    theme.palette.primary.dark,
                    0.1,
                  )} 58%,
                  ${alpha(
                    theme.palette.primary.dark,
                    0.76,
                  )} 100%
                )`,

          pointerEvents: 'none',
        }}
      />

      {/* TOP LABEL */}

      <Box
        sx={{
          position: 'absolute',

          top: {
            xs: 18,
            md: 22,
          },

          left: {
            xs: 18,
            md: 22,
          },

          right: {
            xs: 18,
            md: 22,
          },

          zIndex: 2,

          display: 'flex',

          alignItems: 'center',

          gap: 1,

          minWidth: 0,
        }}
      >
        <Typography
          variant="overline"
          sx={{
            minWidth: 0,

            color:
              'primary.contrastText',

            textShadow: (theme) =>
              `0 2px 12px ${alpha(
                theme.palette.common.black,
                0.28,
              )}`,

            overflowWrap:
              'anywhere',
          }}
        >
          {item.label}
        </Typography>

        <Box
          className="gallery-line"
          aria-hidden
          sx={{
            width: 28,

            height: 1,

            flexShrink: 0,

            bgcolor:
              'secondary.light',
          }}
        />
      </Box>

      {/* BOTTOM CONTENT */}

      <Box
        sx={{
          position: 'absolute',

          left: {
            xs: 18,
            sm: 22,
            md: 26,
          },

          right: {
            xs: 18,
            sm: 22,
            md: 26,
          },

          bottom: {
            xs: 18,
            sm: 22,
            md: 26,
          },

          zIndex: 2,

          minWidth: 0,
        }}
      >
        <Typography
          component="h3"
          variant={
            featured
              ? 'h3'
              : compact
                ? 'h5'
                : 'h4'
          }
          sx={{
            color:
              'primary.contrastText',

            overflowWrap:
              'break-word',

            hyphens: 'auto',
          }}
        >
          {item.label}
        </Typography>

        {item.description && (
          <Typography
            component="p"
            variant={
              compact
                ? 'caption'
                : 'body2'
            }
            sx={{
              mt: 0.8,

              mb: 0,

              display: 'block',

              maxWidth: featured
                ? 420
                : 320,

              color: (theme) =>
                alpha(
                  theme.palette.primary.contrastText,
                  0.78,
                ),

              overflowWrap:
                'break-word',
            }}
          >
            {item.description}
          </Typography>
        )}
      </Box>
    </Box>
  );
}