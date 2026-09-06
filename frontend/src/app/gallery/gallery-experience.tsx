'use client';

import {
  useDeferredValue,
  useMemo,
  useState,
} from 'react';

import Image from 'next/image';

import {
  Box,
  Button,
  Container,
  Dialog,
  DialogContent,
  IconButton,
  InputAdornment,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';

import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import CollectionsRoundedIcon from '@mui/icons-material/CollectionsRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import ZoomInRoundedIcon from '@mui/icons-material/ZoomInRounded';

type GalleryCategory =
  | 'ALL'
  | 'DINING'
  | 'EVENTS'
  | 'SPACES'
  | 'TEAM'
  | 'KITCHEN';

type PublicGalleryCategory =
  Exclude<GalleryCategory, 'ALL'>;

type GalleryItem = {
  id: string;
  title: string;
  description: string;
  category: PublicGalleryCategory;
  image: string;
  alt: string;
  sortOrder: number;
};

type SortOption =
  | 'FEATURED'
  | 'TITLE_ASC'
  | 'TITLE_DESC';

/* =========================================================
   INITIAL PUBLIC GALLERY DATA

   FUTURE:
   Admin Gallery
        ↓
   NestJS
        ↓
   PostgreSQL + Object Storage
        ↓
   GET /gallery/public
        ↓
   This component
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
    alt: 'Harmony event celebration setup',
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
    alt: 'Harmony dining experience',
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
    alt: 'Harmony restaurant kitchen',
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
    alt: 'Harmony restaurant team',
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
    alt: 'Harmony kitchen experience',
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
    alt: 'Harmony restaurant entrance',
    sortOrder: 9,
  },
];

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

export default function GalleryExperience() {
  const [category, setCategory] =
    useState<GalleryCategory>('ALL');

  const [search, setSearch] =
    useState('');

  const [sort, setSort] =
    useState<SortOption>('FEATURED');

  const [selectedImage, setSelectedImage] =
    useState<GalleryItem | null>(null);

  const deferredSearch =
    useDeferredValue(search);

  const visibleItems =
    useMemo(() => {
      const normalizedSearch =
        deferredSearch
          .trim()
          .toLowerCase();

      const filtered =
        galleryItems.filter(
          (item) => {
            const categoryMatches =
              category === 'ALL' ||
              item.category ===
                category;

            if (!categoryMatches) {
              return false;
            }

            if (!normalizedSearch) {
              return true;
            }

            const searchableText = [
              item.title,
              item.description,
              categoryLabels[
                item.category
              ],
            ]
              .join(' ')
              .toLowerCase();

            return searchableText.includes(
              normalizedSearch,
            );
          },
        );

      const sorted = [...filtered];

      if (
        sort === 'TITLE_ASC'
      ) {
        sorted.sort((a, b) =>
          a.title.localeCompare(
            b.title,
          ),
        );
      }

      if (
        sort === 'TITLE_DESC'
      ) {
        sorted.sort((a, b) =>
          b.title.localeCompare(
            a.title,
          ),
        );
      }

      if (
        sort === 'FEATURED'
      ) {
        sorted.sort(
          (a, b) =>
            a.sortOrder -
            b.sortOrder,
        );
      }

      return sorted;
    }, [
      category,
      deferredSearch,
      sort,
    ]);

  function clearFilters() {
    setCategory('ALL');
    setSearch('');
    setSort('FEATURED');
  }

  return (
    <>
      <Container maxWidth="lg">
        {/* TOOLBAR */}

        <Box
          sx={{
            display: 'grid',

            gridTemplateColumns: {
              xs: '1fr',
              lg: 'minmax(0, 1fr) auto',
            },

            gap: 2.2,

            alignItems: 'center',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 0.8,
            }}
          >
            {categories.map(
              (item) => {
                const active =
                  category ===
                  item.value;

                return (
                  <Button
                    key={item.value}
                    type="button"
                    onClick={() =>
                      setCategory(
                        item.value,
                      )
                    }
                    variant={
                      active
                        ? 'contained'
                        : 'text'
                    }
                    sx={{
                      minHeight: 42,
                      px: 2,
                      borderRadius: 1.5,
                      fontWeight: 800,

                      color: active
                        ? undefined
                        : 'text.secondary',

                      bgcolor: active
                        ? undefined
                        : 'background.paper',

                      border: active
                        ? undefined
                        : '1px solid',

                      borderColor: active
                        ? undefined
                        : 'divider',
                    }}
                  >
                    {item.label}
                  </Button>
                );
              },
            )}
          </Box>

          <Stack
            direction={{
              xs: 'column',
              sm: 'row',
            }}
            sx={{
              gap: 1.2,

              alignItems: {
                xs: 'stretch',
                sm: 'center',
              },
            }}
          >
            <TextField
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value,
                )
              }
              placeholder="Search gallery..."
              size="small"
              aria-label="Search Harmony gallery"
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchRoundedIcon
                        sx={{
                          color:
                            'text.secondary',
                        }}
                      />
                    </InputAdornment>
                  ),
                },
              }}
              sx={{
                minWidth: {
                  sm: 260,
                },

                '& .MuiOutlinedInput-root':
                  {
                    minHeight: 44,
                    bgcolor:
                      'background.paper',
                  },
              }}
            />

            <Select
              size="small"
              value={sort}
              onChange={(event) =>
                setSort(
                  event.target
                    .value as SortOption,
                )
              }
              aria-label="Sort gallery"
              sx={{
                minWidth: {
                  sm: 145,
                },

                minHeight: 44,

                bgcolor:
                  'background.paper',
              }}
            >
              <MenuItem value="FEATURED">
                Featured
              </MenuItem>

              <MenuItem value="TITLE_ASC">
                A–Z
              </MenuItem>

              <MenuItem value="TITLE_DESC">
                Z–A
              </MenuItem>
            </Select>
          </Stack>
        </Box>

        {/* RESULT COUNT */}

        <Stack
          direction="row"
          sx={{
            mt: 3,

            alignItems: 'center',

            justifyContent:
              'space-between',

            gap: 2,
          }}
        >
          <Typography
            sx={{
              color: 'text.secondary',
              fontSize: '0.88rem',
            }}
          >
            Showing{' '}
            <Box
              component="span"
              sx={{
                color: 'text.primary',
                fontWeight: 800,
              }}
            >
              {visibleItems.length}
            </Box>{' '}
            {visibleItems.length === 1
              ? 'photo'
              : 'photos'}
          </Typography>

          {(category !== 'ALL' ||
            search ||
            sort !==
              'FEATURED') && (
            <Button
              type="button"
              size="small"
              onClick={clearFilters}
              sx={{
                fontWeight: 800,
              }}
            >
              Clear Filters
            </Button>
          )}
        </Stack>

        {/* GRID */}

        {visibleItems.length >
        0 ? (
          <Box
            sx={{
              mt: 2,

              display: 'grid',

              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2, minmax(0, 1fr))',
                md: 'repeat(3, minmax(0, 1fr))',
                lg: 'repeat(4, minmax(0, 1fr))',
              },

              gap: 2,
            }}
          >
            {visibleItems.map(
              (item) => (
                <Box
                  key={item.id}
                  component="article"
                  sx={{
                    overflow: 'hidden',

                    bgcolor:
                      'background.paper',

                    border: '1px solid',

                    borderColor:
                      'divider',

                    borderRadius: 2,

                    transition:
                      'transform 180ms ease, box-shadow 180ms ease',

                    '@media (prefers-reduced-motion: reduce)':
                      {
                        transition:
                          'none',
                      },

                    '&:hover': {
                      transform:
                        'translateY(-3px)',

                      boxShadow: 4,

                      '@media (prefers-reduced-motion: reduce)':
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
                    aria-label={`View ${item.title} photo`}
                    onClick={() =>
                      setSelectedImage(
                        item,
                      )
                    }
                    sx={{
                      position:
                        'relative',

                      display: 'block',

                      width: '100%',

                      aspectRatio:
                        '4 / 3',

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

                          outlineOffset: 2,
                        },

                      '&:hover img': {
                        transform:
                          'scale(1.035)',

                        '@media (prefers-reduced-motion: reduce)':
                          {
                            transform:
                              'none',
                          },
                      },

                      '&:hover .gallery-overlay':
                        {
                          opacity: 1,
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
                      quality={75}
                      sizes="(max-width: 600px) 100vw, (max-width: 900px) 50vw, (max-width: 1200px) 33vw, 25vw"
                      style={{
                        objectFit:
                          'cover',
                        transition:
                          'transform 250ms ease',
                      }}
                    />

                    <Box
                      className="gallery-overlay"
                      aria-hidden="true"
                      sx={{
                        position:
                          'absolute',

                        inset: 0,

                        display:
                          'grid',

                        placeItems:
                          'center',

                        bgcolor:
                          'rgba(0,0,0,0.22)',

                        opacity: 0,

                        transition:
                          'opacity 180ms ease',

                        '@media (prefers-reduced-motion: reduce)':
                          {
                            transition:
                              'none',
                          },
                      }}
                    >
                      <Box
                        sx={{
                          width: 46,
                          height: 46,

                          display:
                            'grid',

                          placeItems:
                            'center',

                          borderRadius:
                            '50%',

                          bgcolor:
                            'rgba(255,255,255,0.92)',

                          color:
                            'primary.dark',
                        }}
                      >
                        <ZoomInRoundedIcon />
                      </Box>
                    </Box>
                  </Box>

                  <Box
                    sx={{
                      p: 1.8,
                    }}
                  >
                    <Typography
                      sx={{
                        fontWeight:
                          800,

                        lineHeight:
                          1.35,
                      }}
                    >
                      {item.title}
                    </Typography>

                    <Box
                      sx={{
                        mt: 1,

                        display:
                          'inline-flex',

                        px: 1,
                        py: 0.45,

                        borderRadius:
                          999,

                        bgcolor:
                          'action.hover',

                        color:
                          'secondary.dark',

                        fontWeight:
                          800,

                        fontSize:
                          '0.7rem',
                      }}
                    >
                      {
                        categoryLabels[
                          item
                            .category
                        ]
                      }
                    </Box>

                    <Typography
                      sx={{
                        mt: 1,

                        color:
                          'text.secondary',

                        fontSize:
                          '0.82rem',

                        lineHeight:
                          1.6,

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
              ),
            )}
          </Box>
        ) : (
          <Box
            sx={{
              mt: 3,

              py: {
                xs: 7,
                md: 10,
              },

              px: 3,

              textAlign: 'center',

              bgcolor:
                'background.paper',

              border: '1px solid',

              borderColor:
                'divider',

              borderRadius: 2,
            }}
          >
            <CollectionsRoundedIcon
              sx={{
                fontSize: 46,
                color:
                  'text.secondary',
              }}
            />

            <Typography
              variant="h5"
              sx={{
                mt: 1.5,
              }}
            >
              No photos found
            </Typography>

            <Typography
              sx={{
                mt: 0.8,
                color:
                  'text.secondary',
              }}
            >
              Try another category
              or search term.
            </Typography>

            <Button
              type="button"
              variant="outlined"
              onClick={
                clearFilters
              }
              sx={{
                mt: 2,
              }}
            >
              Clear Filters
            </Button>
          </Box>
        )}
      </Container>

      {/* LIGHTBOX */}

      <Dialog
        open={Boolean(
          selectedImage,
        )}
        onClose={() =>
          setSelectedImage(null)
        }
        fullWidth
        maxWidth="lg"
        slotProps={{
          paper: {
            sx: {
              overflow: 'hidden',
              bgcolor:
                'background.paper',
              backgroundImage:
                'none',
            },
          },
        }}
      >
        {selectedImage && (
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
                  'rgba(255,255,255,0.92)',

                color:
                  'primary.dark',

                '&:hover': {
                  bgcolor:
                    'common.white',
                },
              }}
            >
              <CloseRoundedIcon />
            </IconButton>

            <Box
              sx={{
                position:
                  'relative',

                width: '100%',

                minHeight: {
                  xs: 360,
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
                quality={75}
                sizes="100vw"
                style={{
                  objectFit:
                    'contain',
                }}
              />
            </Box>

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
              <Typography variant="h5">
                {
                  selectedImage
                    .title
                }
              </Typography>

              <Typography
                sx={{
                  mt: 0.7,

                  color:
                    'text.secondary',

                  lineHeight: 1.7,
                }}
              >
                {
                  selectedImage
                    .description
                }
              </Typography>
            </Box>
          </DialogContent>
        )}
      </Dialog>
    </>
  );
}