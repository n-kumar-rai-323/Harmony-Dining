'use client';

import {
  useMemo,
  useState,
} from 'react';

import Image from 'next/image';

import {
  alpha,
  Box,
  Button,
  Container,
  Dialog,
  DialogContent,
  IconButton,
  Stack,
  Typography,
  useTheme,
} from '@mui/material';

import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import CollectionsRoundedIcon from '@mui/icons-material/CollectionsRounded';
import ZoomInRoundedIcon from '@mui/icons-material/ZoomInRounded';

/* =========================================================
   TYPES
========================================================= */

type GalleryCategory =
  | 'ALL'
  | 'DINING'
  | 'EVENTS'
  | 'SPACES'
  | 'TEAM'
  | 'KITCHEN';

type PublicGalleryCategory =
  Exclude<
    GalleryCategory,
    'ALL'
  >;

type GalleryItem = {
  id: string;
  title: string;
  description: string;
  category: PublicGalleryCategory;
  image: string;
  alt: string;
  sortOrder: number;
};

/* =========================================================
   INITIAL DEVELOPMENT DATA

   Future:
   Harmony Admin
        ↓
   NestJS Gallery API
        ↓
   PostgreSQL + Object Storage
        ↓
   GET /gallery/public
========================================================= */

const galleryItems: GalleryItem[] = [
  {
    id: 'gallery-1',
    title: 'Harmony Dining Hall',
    description:
      'A welcoming dining space prepared for guests and gatherings.',
    category: 'DINING',
    image:
      '/images/home/harmony-gallery-dining-hall.jpg',
    alt: 'Harmony dining hall',
    sortOrder: 1,
  },
  {
    id: 'gallery-2',
    title: 'Celebration Setup',
    description:
      'Harmony event space prepared for memorable celebrations.',
    category: 'EVENTS',
    image:
      '/images/home/harmony-experience-event.jpg',
    alt:
      'Harmony event celebration setup',
    sortOrder: 2,
  },
  {
    id: 'gallery-3',
    title: 'Banquet Hall',
    description:
      'A flexible banquet space for larger gatherings and occasions.',
    category: 'SPACES',
    image:
      '/images/home/harmony-banquet-hall.jpg',
    alt: 'Harmony banquet hall',
    sortOrder: 3,
  },
  {
    id: 'gallery-4',
    title: 'Dining Experience',
    description:
      'The atmosphere and hospitality behind the Harmony dining experience.',
    category: 'DINING',
    image:
      '/images/home/harmony-dining-experience.jpg',
    alt:
      'Harmony dining experience',
    sortOrder: 4,
  },
  {
    id: 'gallery-5',
    title: 'Harmony Terrace',
    description:
      'A comfortable outdoor area for relaxed dining and gatherings.',
    category: 'SPACES',
    image:
      '/images/home/harmony-gallery-terrace.jpg',
    alt: 'Harmony terrace',
    sortOrder: 5,
  },
  {
    id: 'gallery-6',
    title: 'Harmony Kitchen',
    description:
      'A look inside the kitchen where Harmony dishes are prepared.',
    category: 'KITCHEN',
    image:
      '/images/home/harmony-gallery-kitchen.jpg',
    alt:
      'Harmony restaurant kitchen',
    sortOrder: 6,
  },
  {
    id: 'gallery-7',
    title: 'Harmony Team',
    description:
      'The people helping create the Harmony dining and hospitality experience.',
    category: 'TEAM',
    image:
      '/images/home/harmony-experience-team.jpg',
    alt:
      'Harmony restaurant team',
    sortOrder: 7,
  },
  {
    id: 'gallery-8',
    title: 'Kitchen Experience',
    description:
      'Behind the scenes of food preparation at Harmony.',
    category: 'KITCHEN',
    image:
      '/images/home/harmony-experience-kitchen.jpg',
    alt:
      'Harmony kitchen experience',
    sortOrder: 8,
  },
  {
    id: 'gallery-9',
    title: 'Harmony Entrance',
    description:
      'The welcoming entrance to Harmony Dining & Event Center.',
    category: 'SPACES',
    image:
      '/images/home/harmony-gallery-entrance.jpg',
    alt:
      'Harmony restaurant entrance',
    sortOrder: 9,
  },
];

/* =========================================================
   CATEGORIES
========================================================= */

const categories: {
  value: GalleryCategory;
  label: string;
}[] = [
  {
    value: 'ALL',
    label: 'All',
  },
  {
    value: 'DINING',
    label: 'Dining',
  },
  {
    value: 'EVENTS',
    label: 'Events',
  },
  {
    value: 'SPACES',
    label: 'Spaces',
  },
  {
    value: 'TEAM',
    label: 'Team',
  },
  {
    value: 'KITCHEN',
    label: 'Kitchen',
  },
];

const categoryLabels: Record<
  PublicGalleryCategory,
  string
> = {
  DINING: 'Dining',
  EVENTS: 'Events',
  SPACES: 'Spaces',
  TEAM: 'Team',
  KITCHEN: 'Kitchen',
};

/* =========================================================
   COMPONENT
========================================================= */

export default function GalleryExperience() {
  const theme = useTheme();

  const [
    category,
    setCategory,
  ] =
    useState<GalleryCategory>(
      'ALL',
    );

  const [
    selectedImage,
    setSelectedImage,
  ] =
    useState<GalleryItem | null>(
      null,
    );

  const visibleItems =
    useMemo(() => {
      const filtered =
        galleryItems.filter(
          (item) =>
            category ===
              'ALL' ||
            item.category ===
              category,
        );

      return [
        ...filtered,
      ].sort(
        (a, b) =>
          a.sortOrder -
          b.sortOrder,
      );
    }, [category]);

  return (
    <>
      <Container maxWidth="lg">
        {/* =====================================================
            INTRO + CATEGORY FILTER
        ===================================================== */}

        <Box
          sx={{
            display: 'grid',

            gridTemplateColumns: {
              xs: '1fr',

              md:
                'minmax(0,0.9fr) minmax(0,1.1fr)',
            },

            gap: {
              xs: 2.5,
              md: 4,
            },

            alignItems: 'end',
          }}
        >
          <Box
            sx={{
              maxWidth: 560,
            }}
          >
            <Typography
              variant="overline"
              sx={{
                color:
                  'secondary.dark',
              }}
            >
              Explore Harmony
            </Typography>

            <Typography
              component="h2"
              variant="h2"
              sx={{
                mt: 0.6,
              }}
            >
              A glimpse inside.
            </Typography>

            <Typography
              variant="body1"
              sx={{
                mt: 1.3,

                color:
                  'text.secondary',
              }}
            >
              From celebrations
              and dining spaces to
              the people and
              kitchen behind the
              experience.
            </Typography>
          </Box>

          <Stack
            direction="row"
            sx={{
              display: 'flex',

              flexWrap: 'wrap',

              gap: 0.8,

              justifyContent: {
                xs:
                  'flex-start',

                md:
                  'flex-end',
              },
            }}
          >
            {categories.map(
              (item) => {
                const active =
                  category ===
                  item.value;

                return (
                  <Button
                    key={
                      item.value
                    }
                    type="button"
                    onClick={() =>
                      setCategory(
                        item.value,
                      )
                    }
                    variant={
                      active
                        ? 'contained'
                        : 'outlined'
                    }
                    aria-pressed={
                      active
                    }
                    sx={{
                      minHeight:
                        42,

                      px: 2,

                      borderRadius:
                        999,

                      ...(active
                        ? {}
                        : {
                            color:
                              'text.secondary',

                            borderColor:
                              'divider',

                            bgcolor:
                              'background.paper',

                            '&:hover':
                              {
                                color:
                                  'primary.main',

                                borderColor:
                                  'primary.main',
                              },
                          }),
                    }}
                  >
                    {item.label}
                  </Button>
                );
              },
            )}
          </Stack>
        </Box>

        {/* =====================================================
            PHOTO GRID
        ===================================================== */}

        {visibleItems.length >
        0 ? (
          <Box
            sx={{
              mt: {
                xs: 3,
                md: 4,
              },

              display:
                'grid',

              gridTemplateColumns:
                {
                  xs: '1fr',

                  sm:
                    'repeat(2,minmax(0,1fr))',

                  lg:
                    'repeat(3,minmax(0,1fr))',
                },

              gap: 2,
            }}
          >
            {visibleItems.map(
              (
                item,
                index,
              ) => {
                const featured =
                  category ===
                    'ALL' &&
                  index === 0;

                return (
                  <Box
                    key={
                      item.id
                    }
                    component="article"
                    sx={{
                      position:
                        'relative',

                      overflow:
                        'hidden',

                      bgcolor:
                        'background.paper',

                      border:
                        '1px solid',

                      borderColor:
                        'divider',

                      borderRadius:
                        2,

                      gridColumn: {
                        xs: 'auto',

                        sm:
                          featured
                            ? 'span 2'
                            : 'auto',

                        lg:
                          featured
                            ? 'span 2'
                            : 'auto',
                      },

                      boxShadow:
                        theme
                          .shadows[1],

                      transition:
                        'transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease',

                      '&:hover': {
                        transform:
                          'translateY(-3px)',

                        boxShadow:
                          theme
                            .shadows[4],

                        borderColor:
                          'secondary.main',
                      },

                      '@media (prefers-reduced-motion: reduce)':
                        {
                          transition:
                            'none',

                          '&:hover':
                            {
                              transform:
                                'none',
                            },
                        },
                    }}
                  >
                    <Box
                      component="button"
                      type="button"
                      aria-label={`View ${item.title}`}
                      onClick={() =>
                        setSelectedImage(
                          item,
                        )
                      }
                      sx={{
                        position:
                          'relative',

                        display:
                          'block',

                        width:
                          '100%',

                        aspectRatio:
                          featured
                            ? {
                                xs:
                                  '4 / 3',

                                sm:
                                  '16 / 9',
                              }
                            : '4 / 3',

                        p: 0,

                        border: 0,

                        cursor:
                          'zoom-in',

                        overflow:
                          'hidden',

                        bgcolor:
                          'action.hover',

                        '&:focus-visible':
                          {
                            outline:
                              '3px solid',

                            outlineColor:
                              'secondary.main',

                            outlineOffset:
                              -3,
                          },

                        '&:hover img':
                          {
                            transform:
                              'scale(1.035)',
                          },

                        '&:hover .gallery-overlay':
                          {
                            opacity:
                              1,
                          },

                        '@media (prefers-reduced-motion: reduce)':
                          {
                            '&:hover img':
                              {
                                transform:
                                  'none',
                              },
                          },
                      }}
                    >
                      <Image
                        src={
                          item.image
                        }
                        alt={
                          item.alt
                        }
                        fill
                        quality={
                          featured
                            ? 82
                            : 78
                        }
                        sizes={
                          featured
                            ? '(max-width: 600px) 100vw, (max-width: 1200px) 100vw, 800px'
                            : '(max-width: 600px) 100vw, (max-width: 900px) 50vw, 33vw'
                        }
                        style={{
                          objectFit:
                            'cover',

                          transition:
                            'transform 250ms ease',
                        }}
                      />

                      {/* DARK PHOTO OVERLAY */}

                      <Box
                        aria-hidden
                        sx={{
                          position:
                            'absolute',

                          inset: 0,

                          bgcolor:
                            alpha(
                              theme
                                .palette
                                .primary
                                .dark,
                              0.18,
                            ),
                        }}
                      />

                      {/* ZOOM OVERLAY */}

                      <Box
                        className="gallery-overlay"
                        aria-hidden
                        sx={{
                          position:
                            'absolute',

                          inset: 0,

                          display:
                            'grid',

                          placeItems:
                            'center',

                          bgcolor:
                            alpha(
                              theme
                                .palette
                                .primary
                                .dark,
                              0.3,
                            ),

                          opacity:
                            0,

                          transition:
                            'opacity 180ms ease',

                          '@media (hover: none)':
                            {
                              display:
                                'none',
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
                              48,

                            height:
                              48,

                            display:
                              'grid',

                            placeItems:
                              'center',

                            borderRadius:
                              '50%',

                            bgcolor:
                              alpha(
                                theme
                                  .palette
                                  .background
                                  .paper,
                                0.94,
                              ),

                            color:
                              'primary.dark',

                            boxShadow:
                              theme
                                .shadows[4],
                          }}
                        >
                          <ZoomInRoundedIcon />
                        </Box>
                      </Box>

                      {/* CATEGORY BADGE */}

                      <Box
                        sx={{
                          position:
                            'absolute',

                          top: 14,

                          left: 14,

                          px: 1.2,

                          py: 0.55,

                          borderRadius:
                            999,

                          bgcolor:
                            alpha(
                              theme
                                .palette
                                .background
                                .paper,
                              0.92,
                            ),

                          color:
                            'primary.dark',

                          backdropFilter:
                            'blur(8px)',

                          boxShadow:
                            theme
                              .shadows[1],
                        }}
                      >
                        <Typography
                          variant="overline"
                          sx={{
                            display:
                              'block',

                            lineHeight:
                              1.2,
                          }}
                        >
                          {
                            categoryLabels[
                              item
                                .category
                            ]
                          }
                        </Typography>
                      </Box>
                    </Box>

                    {/* PHOTO DETAILS */}

                    <Box
                      sx={{
                        p: {
                          xs: 1.8,
                          sm: 2,
                        },
                      }}
                    >
                      <Typography
                        component="h3"
                        variant="h6"
                      >
                        {
                          item.title
                        }
                      </Typography>

                      <Typography
                        variant="body2"
                        sx={{
                          mt: 0.7,

                          color:
                            'text.secondary',

                          display:
                            '-webkit-box',

                          WebkitLineClamp:
                            2,

                          WebkitBoxOrient:
                            'vertical',

                          overflow:
                            'hidden',
                        }}
                      >
                        {
                          item.description
                        }
                      </Typography>
                    </Box>
                  </Box>
                );
              },
            )}
          </Box>
        ) : (
          /* ===================================================
             EMPTY STATE
          =================================================== */

          <Box
            sx={{
              mt: 4,

              py: {
                xs: 7,
                md: 9,
              },

              px: 3,

              textAlign:
                'center',

              bgcolor:
                'background.paper',

              border:
                '1px solid',

              borderColor:
                'divider',

              borderRadius:
                2,
            }}
          >
            <CollectionsRoundedIcon
              aria-hidden
              sx={{
                fontSize:
                  44,

                color:
                  'text.secondary',
              }}
            />

            <Typography
              variant="h5"
              sx={{
                mt: 1.3,
              }}
            >
              No photos available
            </Typography>

            <Typography
              variant="body2"
              sx={{
                mt: 0.7,

                color:
                  'text.secondary',
              }}
            >
              Try another
              gallery category.
            </Typography>

            <Button
              type="button"
              variant="outlined"
              onClick={() =>
                setCategory(
                  'ALL',
                )
              }
              sx={{
                mt: 2,
              }}
            >
              View All Photos
            </Button>
          </Box>
        )}
      </Container>

      {/* =====================================================
          LIGHTBOX
      ===================================================== */}

      <Dialog
        open={Boolean(
          selectedImage,
        )}
        onClose={() =>
          setSelectedImage(
            null,
          )
        }
        fullWidth
        maxWidth="lg"
        slotProps={{
          paper: {
            sx: {
              overflow:
                'hidden',

              bgcolor:
                'background.paper',

              backgroundImage:
                'none',

              boxShadow:
                theme
                  .shadows[24],
            },
          },
        }}
      >
        {selectedImage ? (
          <DialogContent
            sx={{
              position:
                'relative',

              p: {
                xs: 1,
                sm: 1.5,
              },
            }}
          >
            {/* CLOSE */}

            <IconButton
              type="button"
              aria-label="Close image"
              onClick={() =>
                setSelectedImage(
                  null,
                )
              }
              sx={{
                position:
                  'absolute',

                top: 18,
                right: 18,

                zIndex: 3,

                bgcolor:
                  alpha(
                    theme
                      .palette
                      .background
                      .paper,
                    0.94,
                  ),

                color:
                  'primary.dark',

                boxShadow:
                  theme
                    .shadows[3],

                '&:hover': {
                  bgcolor:
                    'background.paper',
                },
              }}
            >
              <CloseRoundedIcon />
            </IconButton>

            {/* IMAGE */}

            <Box
              sx={{
                position:
                  'relative',

                width:
                  '100%',

                minHeight: {
                  xs: 340,
                  sm: 520,
                  md: 650,
                },

                overflow:
                  'hidden',

                borderRadius:
                  1.5,

                bgcolor:
                  'action.hover',
              }}
            >
              <Image
                src={
                  selectedImage
                    .image
                }
                alt={
                  selectedImage
                    .alt
                }
                fill
                quality={85}
                sizes="(max-width: 1200px) 100vw, 1100px"
                style={{
                  objectFit:
                    'contain',
                }}
              />
            </Box>

            {/* DETAILS */}

            <Box
              sx={{
                px: {
                  xs: 1,
                  sm: 1.5,
                },

                pt: 2,
                pb: 1,
              }}
            >
              <Typography
                variant="overline"
                sx={{
                  color:
                    'secondary.dark',
                }}
              >
                {
                  categoryLabels[
                    selectedImage
                      .category
                  ]
                }
              </Typography>

              <Typography
                component="h2"
                variant="h5"
                sx={{
                  mt: 0.2,
                }}
              >
                {
                  selectedImage
                    .title
                }
              </Typography>

              <Typography
                variant="body2"
                sx={{
                  mt: 0.7,

                  maxWidth:
                    700,

                  color:
                    'text.secondary',
                }}
              >
                {
                  selectedImage
                    .description
                }
              </Typography>
            </Box>
          </DialogContent>
        ) : null}
      </Dialog>
    </>
  );
}