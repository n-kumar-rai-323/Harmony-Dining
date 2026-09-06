'use client';
import Link from 'next/link';

import {
  Box,
  Button,
  Container,
  Typography,
} from '@mui/material';

import { alpha } from '@mui/material/styles';

import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import RestaurantMenuRoundedIcon from '@mui/icons-material/RestaurantMenuRounded';

import {
  menuData,
  type MenuCategory,
  type MenuItem,
} from '@/data/menu-data';

/* =========================================================
   TYPES
========================================================= */

type FeaturedMenuEntry = {
  id: string;
  number: string;
  category: string;
  item: MenuItem;
};

export type FeaturedMenuConfig = {
  eyebrow: string;
  title: string;
  accentTitle?: string;
  description?: string;

  heroItemName: string;
  featuredItemNames: readonly string[];

  desktopCtaLabel: string;
  mobileCtaLabel: string;
  footerCtaLabel: string;
  menuHref: string;
};

type FeaturedMenuProps = {
  /**
   * Development default: local menuData.
   *
   * Production later:
   * The parent Server Component can fetch the published menu
   * from the NestJS API and pass it here.
   */
  menuSource?: readonly MenuCategory[];

  /**
   * Development default: DEFAULT_FEATURED_CONFIG.
   *
   * Production later:
   * Admin-controlled homepage configuration can be fetched
   * server-side and passed here without making this component
   * a Client Component.
   */
  config?: FeaturedMenuConfig;
};

/* =========================================================
   VERIFIED HOMEPAGE MENU SELECTION

   Important:
   - Development defaults live in DEFAULT_FEATURED_CONFIG
   - Production can pass Admin-published selection/config as props
   - Prices still come from the menu source, never homepage copy
   - Only VERIFIED items are eligible
   - No fake discount / fake availability / fake popularity
========================================================= */

const DEFAULT_FEATURED_CONFIG: FeaturedMenuConfig = {
  eyebrow: 'Featured Menu',

  title: 'A taste of Harmony.',
  accentTitle: 'Selected from our menu.',

  description:
    'Explore a curated selection of verified dishes from the Harmony menu. Visit the full menu for all available categories and options.',

  heroItemName: 'Tandoori Non-Veg Platter',

  featuredItemNames: [
    'Butter Chicken',
    'Paneer Tikka',
    'Chicken Dum Biryani',
    'Tandoori Prawns',
    'Kesari Matka Kulfi',
  ],

  desktopCtaLabel: 'Explore Full Menu',
  mobileCtaLabel: 'Explore Full Menu',
  footerCtaLabel: 'Discover the complete menu',

  menuHref: '/menu',
};

/* =========================================================
   HELPERS
========================================================= */

function formatPrice(price: number) {
  return new Intl.NumberFormat(
    'en-NP',
  ).format(price);
}

function findVerifiedMenuEntry(
  itemName: string,
  sourceMenuData: readonly MenuCategory[],
): {
  category: MenuCategory;
  item: MenuItem;
} | null {
  for (const category of sourceMenuData) {
    const item =
      category.items.find(
        (candidate) =>
          candidate.name === itemName &&
          candidate.status ===
            'VERIFIED',
      );

    if (item) {
      return {
        category,
        item,
      };
    }
  }

  return null;
}

function formatMenuPrice(
  item: MenuItem,
) {
  if (item.priceLabel) {
    return item.priceLabel;
  }

  if (
    typeof item.price === 'number'
  ) {
    return `Rs. ${formatPrice(
      item.price,
    )}`;
  }

  if (
    item.variants &&
    item.variants.length > 0
  ) {
    const prices =
      item.variants.map(
        (variant) =>
          variant.price,
      );

    const minPrice =
      Math.min(...prices);

    const maxPrice =
      Math.max(...prices);

    if (minPrice === maxPrice) {
      return `Rs. ${formatPrice(
        minPrice,
      )}`;
    }

    return `Rs. ${formatPrice(
      minPrice,
    )} – ${formatPrice(
      maxPrice,
    )}`;
  }

  return 'Price on request';
}

function buildFeaturedItems(
  sourceMenuData: readonly MenuCategory[],
  itemNames: readonly string[],
): FeaturedMenuEntry[] {
  return itemNames.flatMap(
    (itemName, index) => {
      const entry =
        findVerifiedMenuEntry(
          itemName,
          sourceMenuData,
        );

      if (!entry) {
        return [];
      }

      return [
        {
          id: `${entry.category.id}-${entry.item.name}`,

          number: String(
            index + 1,
          ).padStart(
            2,
            '0',
          ),

          category:
            entry.category.name,

          item:
            entry.item,
        },
      ];
    },
  );
}

/* =========================================================
   FEATURED MENU
========================================================= */

export default function FeaturedMenu({
  menuSource = menuData,
  config = DEFAULT_FEATURED_CONFIG,
}: FeaturedMenuProps) {
  const {
    eyebrow,
    title,
    accentTitle,
    description,
    heroItemName,
    featuredItemNames,
    desktopCtaLabel,
    mobileCtaLabel,
    footerCtaLabel,
    menuHref,
  } = config;

  const heroEntry =
    findVerifiedMenuEntry(
      heroItemName,
      menuSource,
    );

  const featuredItems =
    buildFeaturedItems(
      menuSource,
      featuredItemNames,
    );

  /*
   * Fail safely:
   * If verified source data changes
   * and the selected homepage item no
   * longer exists, do not render
   * unverified fallback commercial
   * information.
   */

  if (!heroEntry) {
    return null;
  }

  return (
    <Box
      component="section"
      aria-labelledby="featured-menu-title"
      sx={{
        position: 'relative',

        overflow: 'hidden',

        bgcolor:
          'background.default',

        color:
          'text.primary',

        py: {
          xs: 7,
          sm: 8,
          md: 10,
          lg: 12,
        },
      }}
    >
      {/* =====================================================
          DECORATIVE BACKGROUND
      ====================================================== */}

      <Box
        aria-hidden
        sx={{
          position: 'absolute',

          width: {
            xs: 340,
            md: 560,
          },

          height: {
            xs: 340,
            md: 560,
          },

          top: {
            xs: -220,
            md: -320,
          },

          right: {
            xs: -190,
            md: -190,
          },

          borderRadius: '50%',

          background:
            (theme) =>
              `radial-gradient(
                circle,
                ${alpha(
                  theme.palette
                    .secondary.main,
                  0.11,
                )} 0%,
                ${alpha(
                  theme.palette
                    .secondary.main,
                  0,
                )} 70%
              )`,

          pointerEvents:
            'none',
        }}
      />

      <Container
        maxWidth="xl"
        sx={{
          position: 'relative',

          zIndex: 1,
        }}
      >
        {/* ===================================================
            SECTION HEADING
        ==================================================== */}

        <Box
          sx={{
            display: 'grid',

            gridTemplateColumns: {
              xs: '1fr',

              md:
                'minmax(0,1fr) auto',
            },

            alignItems: 'end',

            gap: {
              xs: 3,
              md: 5,
            },

            mb: {
              xs: 4,
              md: 6,
            },
          }}
        >
          <Box
            sx={{
              maxWidth: 820,

              minWidth: 0,
            }}
          >
            <Box
              sx={{
                display: 'flex',

                alignItems: 'center',

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
                  color:
                    'secondary.dark',

                  overflowWrap:
                    'anywhere',
                }}
              >
                {eyebrow}
              </Typography>
            </Box>

            <Typography
              id="featured-menu-title"
              component="h2"
              variant="h2"
              sx={{
                mt: {
                  xs: 1.8,
                  md: 2,
                },

                maxWidth: 800,

                color:
                  'text.primary',
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

            {description && (
              <Typography
                component="p"
                variant="body1"
                sx={{
                  mt: {
                    xs: 2,
                    md: 2.4,
                  },

                  maxWidth: 620,

                  color:
                    'text.secondary',

                  overflowWrap:
                    'break-word',
                }}
              >
                {description}
              </Typography>
            )}
          </Box>

          {/* DESKTOP CTA */}

          <Box
            sx={{
              display: {
                xs: 'none',
                md: 'block',
              },
            }}
          >
            <Link
              href={menuHref}
              style={{
                display: 'block',

                textDecoration:
                  'none',
              }}
            >
              <Button
                variant="outlined"
                endIcon={
                  <ArrowForwardRoundedIcon />
                }
                sx={{
                  minHeight: 48,

                  px: 2.6,

                  color:
                    'text.primary',

                  borderColor:
                    'divider',

                  whiteSpace:
                    'nowrap',

                  '&:hover': {
                    borderColor:
                      'secondary.main',

                    bgcolor:
                      'action.hover',
                  },
                }}
              >
                {desktopCtaLabel}
              </Button>
            </Link>
          </Box>
        </Box>

        {/* ===================================================
            CONTENT GRID
        ==================================================== */}

        <Box
          sx={{
            display: 'grid',

            gridTemplateColumns: {
              xs: '1fr',

              lg:
                featuredItems.length >
                0
                  ? '0.9fr 1.1fr'
                  : '1fr',
            },

            gap: {
              xs: 2.5,
              md: 3,
              lg: 4,
            },

            alignItems:
              'stretch',
          }}
        >
          {/* =================================================
              VERIFIED FEATURE CARD
          ================================================== */}

          <Box
            component="article"
            sx={{
              position: 'relative',

              display: 'flex',

              flexDirection:
                'column',

              minHeight: {
                xs: 'auto',
                lg: 620,
              },

              overflow: 'hidden',

              borderRadius: {
                xs: 1.5,
                md: 2,
              },

              bgcolor:
                'background.paper',

              border:
                '1px solid',

              borderColor:
                'divider',

              boxShadow:
                (theme) =>
                  theme.shadows[10],

              transition:
                'background-color 220ms ease, border-color 220ms ease',

              '@media (prefers-reduced-motion: reduce)':
                {
                  transition:
                    'none',
                },
            }}
          >
            {/* DECORATIVE BACKGROUND */}

            <Box
              aria-hidden
              sx={{
                position:
                  'absolute',

                inset: 0,

                background:
                  (theme) => `
                    radial-gradient(
                      circle at 82% 14%,
                      ${alpha(
                        theme.palette
                          .secondary
                          .light,
                        0.22,
                      )},
                      transparent 34%
                    ),
                    radial-gradient(
                      circle at 8% 94%,
                      ${alpha(
                        theme.palette
                          .secondary
                          .main,
                        0.07,
                      )},
                      transparent 40%
                    )
                  `,

                pointerEvents:
                  'none',
              }}
            />

            {/* DECORATIVE PLATE */}

            <Box
              aria-hidden
              sx={{
                position:
                  'absolute',

                width: {
                  xs: 220,
                  sm: 300,
                  lg: 340,
                },

                height: {
                  xs: 220,
                  sm: 300,
                  lg: 340,
                },

                top: {
                  xs: 86,
                  sm: 78,
                  lg: 100,
                },

                right: {
                  xs: -110,
                  sm: -125,
                  lg: -145,
                },

                display:
                  'grid',

                placeItems:
                  'center',

                borderRadius:
                  '50%',

                border:
                  '1px solid',

                borderColor:
                  'divider',

                boxShadow:
                  (theme) =>
                    `inset 0 0 0 24px ${alpha(
                      theme.palette
                        .secondary
                        .main,
                      0.025,
                    )}`,

                pointerEvents:
                  'none',
              }}
            >
              <Box
                sx={{
                  width: '68%',

                  height: '68%',

                  display:
                    'grid',

                  placeItems:
                    'center',

                  borderRadius:
                    '50%',

                  border:
                    '1px solid',

                  borderColor:
                    'divider',

                  color:
                    'secondary.main',
                }}
              >
                <RestaurantMenuRoundedIcon
                  sx={{
                    fontSize: {
                      xs: 46,
                      md: 56,
                    },

                    opacity: 0.5,
                  }}
                />
              </Box>
            </Box>

            {/* BADGE */}

            <Box
              sx={{
                position:
                  'relative',

                zIndex: 2,

                p: {
                  xs: 2.25,
                  sm: 3,
                  md: 3.5,
                },
              }}
            >
              <Box
                sx={{
                  display:
                    'inline-flex',

                  alignItems:
                    'center',

                  gap: 0.7,

                  maxWidth:
                    '100%',

                  px: 1.25,

                  py: 0.75,

                  borderRadius: 1,

                  bgcolor:
                    'action.hover',

                  color:
                    'text.primary',

                  border:
                    '1px solid',

                  borderColor:
                    'divider',
                }}
              >
                <AutoAwesomeRoundedIcon
                  sx={{
                    flexShrink: 0,

                    fontSize: 16,

                    color:
                      'secondary.main',
                  }}
                />

                <Typography
                  variant="caption"
                  sx={{
                    minWidth: 0,

                    fontWeight: 800,

                    letterSpacing:
                      '0.02em',
                  }}
                >
                  Harmony Selection
                </Typography>
              </Box>
            </Box>

            {/* MAIN CONTENT
                Normal flow — no absolute bottom positioning.
                Safe for future API-controlled longer content.
            */}

            <Box
              sx={{
                position:
                  'relative',

                zIndex: 3,

                display:
                  'flex',

                flexDirection:
                  'column',

                justifyContent: {
                  xs:
                    'flex-start',

                  lg:
                    'flex-end',
                },

                flexGrow: 1,

                minWidth: 0,

                p: {
                  xs: 2.25,
                  sm: 3,
                  md: 3.5,
                },

                pt: {
                  xs: 8,
                  sm: 10,
                  lg: 8,
                },
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
                  heroEntry
                    .category
                    .name
                }
              </Typography>

              <Typography
                component="h3"
                variant="h3"
                sx={{
                  mt: 1.2,

                  maxWidth: 470,

                  color:
                    'text.primary',

                  overflowWrap:
                    'anywhere',
                }}
              >
                {
                  heroEntry
                    .item.name
                }
              </Typography>

              {heroEntry.item
                .description && (
                <Typography
                  component="p"
                  variant="body1"
                  sx={{
                    mt: 1.8,

                    maxWidth: 440,

                    color:
                      'text.secondary',
                  }}
                >
                  {
                    heroEntry
                      .item
                      .description
                  }
                </Typography>
              )}

              <Box
                sx={{
                  mt: {
                    xs: 2.8,
                    md: 3.2,
                  },

                  pt: 2.4,

                  display:
                    'flex',

                  alignItems:
                    'flex-end',

                  justifyContent:
                    'space-between',

                  gap: 2,

                  borderTop:
                    '1px solid',

                  borderColor:
                    'divider',
                }}
              >
                <Box
                  sx={{
                    minWidth: 0,
                  }}
                >
                  <Typography
                    variant="overline"
                    sx={{
                      color:
                        'text.secondary',
                    }}
                  >
                    Menu Price
                  </Typography>

                  <Typography
                    variant="h4"
                    sx={{
                      mt: 0.45,

                      color:
                        'secondary.dark',

                      overflowWrap:
                        'anywhere',
                    }}
                  >
                    {formatMenuPrice(
                      heroEntry.item,
                    )}
                  </Typography>
                </Box>

                <Box
                  aria-hidden
                  sx={{
                    width: 42,

                    height: 42,

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
                      'action.hover',

                    color:
                      'secondary.dark',
                  }}
                >
                  <RestaurantMenuRoundedIcon
                    sx={{
                      fontSize: 19,
                    }}
                  />
                </Box>
              </Box>
            </Box>
          </Box>

          {/* =================================================
              RIGHT — FEATURED VERIFIED ITEMS
          ================================================== */}

          {featuredItems.length >
            0 && (
            <Box
              sx={{
                overflow:
                  'hidden',

                borderRadius: {
                  xs: 1.5,
                  md: 2,
                },

                bgcolor:
                  'background.paper',

                border:
                  '1px solid',

                borderColor:
                  'divider',

                boxShadow:
                  (theme) =>
                    theme
                      .shadows[8],
              }}
            >
              {/* HEADER */}

              <Box
                sx={{
                  px: {
                    xs: 2.2,
                    sm: 2.8,
                    md: 3.2,
                  },

                  pt: {
                    xs: 2.5,
                    md: 3,
                  },

                  pb: {
                    xs: 2,
                    md: 2.4,
                  },

                  borderBottom:
                    '1px solid',

                  borderColor:
                    'divider',
                }}
              >
                <Typography
                  variant="overline"
                  sx={{
                    color:
                      'secondary.dark',
                  }}
                >
                  Selected from the menu
                </Typography>

                <Typography
                  component="h3"
                  variant="h4"
                  sx={{
                    mt: 0.7,

                    color:
                      'text.primary',
                  }}
                >
                  More dishes to explore.
                </Typography>
              </Box>

              {/* ITEMS */}

              {featuredItems.map(
                (
                  entry,
                  index,
                ) => (
                  <Box
                    key={
                      entry.id
                    }
                    sx={{
                      display:
                        'grid',

                      gridTemplateColumns:
                        {
                          xs:
                            '38px minmax(0,1fr)',

                          sm:
                            '42px minmax(0,1fr) auto',
                        },

                      alignItems:
                        'center',

                      columnGap: {
                        xs: 1.25,
                        sm: 1.8,
                      },

                      px: {
                        xs: 1.8,
                        sm: 2.8,
                        md: 3.2,
                      },

                      py: {
                        xs: 2.1,
                        sm: 2.35,
                        md: 2.5,
                      },

                      borderBottom:
                        index !==
                        featuredItems.length -
                          1
                          ? '1px solid'
                          : 'none',

                      borderColor:
                        'divider',

                      transition:
                        'background-color 220ms ease',

                      '&:hover': {
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
                    {/* NUMBER */}

                    <Box
                      aria-hidden
                      sx={{
                        width: {
                          xs: 34,
                          sm: 38,
                        },

                        height: {
                          xs: 34,
                          sm: 38,
                        },

                        display:
                          'grid',

                        placeItems:
                          'center',

                        borderRadius:
                          '50%',

                        border:
                          '1px solid',

                        borderColor:
                          'divider',

                        color:
                          'text.secondary',
                      }}
                    >
                      <Typography
                        variant="caption"
                        sx={{
                          fontWeight:
                            800,

                          letterSpacing:
                            '0.06em',
                        }}
                      >
                        {
                          entry.number
                        }
                      </Typography>
                    </Box>

                    {/* DETAILS */}

                    <Box
                      sx={{
                        minWidth: 0,
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
                          entry.category
                        }
                      </Typography>

                      <Typography
                        component="h4"
                        variant="h5"
                        sx={{
                          mt: 0.4,

                          color:
                            'text.primary',

                          overflowWrap:
                            'anywhere',
                        }}
                      >
                        {
                          entry.item
                            .name
                        }
                      </Typography>

                      {entry.item
                        .description && (
                        <Typography
                          component="p"
                          variant="body2"
                          sx={{
                            mt: 0.65,

                            mb: 0,

                            maxWidth:
                              470,

                            color:
                              'text.secondary',
                          }}
                        >
                          {
                            entry.item
                              .description
                          }
                        </Typography>
                      )}

                      {/* MOBILE PRICE */}

                      <Typography
                        variant="subtitle2"
                        sx={{
                          display: {
                            xs:
                              'block',

                            sm:
                              'none',
                          },

                          mt: 0.9,

                          color:
                            'secondary.dark',

                          fontWeight:
                            800,

                          overflowWrap:
                            'anywhere',
                        }}
                      >
                        {formatMenuPrice(
                          entry.item,
                        )}
                      </Typography>
                    </Box>

                    {/* TABLET / DESKTOP PRICE */}

                    <Typography
                      variant="subtitle2"
                      sx={{
                        display: {
                          xs:
                            'none',

                          sm:
                            'block',
                        },

                        pl: 2,

                        color:
                          'secondary.dark',

                        fontWeight:
                          800,

                        whiteSpace:
                          'nowrap',
                      }}
                    >
                      {formatMenuPrice(
                        entry.item,
                      )}
                    </Typography>
                  </Box>
                ),
              )}

              {/* FOOTER LINK */}

              <Link
                href={menuHref}
                style={{
                  display:
                    'block',

                  color:
                    'inherit',

                  textDecoration:
                    'none',
                }}
              >
                <Box
                  sx={{
                    px: {
                      xs: 2.2,
                      sm: 2.8,
                      md: 3.2,
                    },

                    py: 2.3,

                    display:
                      'flex',

                    alignItems:
                      'center',

                    justifyContent:
                      'space-between',

                    gap: 2,

                    bgcolor:
                      'action.hover',

                    borderTop:
                      '1px solid',

                    borderColor:
                      'divider',

                    transition:
                      'background-color 220ms ease',

                    '&:hover': {
                      bgcolor:
                        'action.selected',

                      '& .featured-menu-arrow':
                        {
                          transform:
                            'translateX(4px)',
                        },
                    },

                    '@media (prefers-reduced-motion: reduce)':
                      {
                        transition:
                          'none',

                        '&:hover .featured-menu-arrow':
                          {
                            transform:
                              'none',
                          },
                      },
                  }}
                >
                  <Typography
                    variant="subtitle2"
                    sx={{
                      minWidth: 0,

                      fontWeight:
                        800,
                    }}
                  >
                    {
                      footerCtaLabel
                    }
                  </Typography>

                  <ArrowForwardRoundedIcon
                    className="featured-menu-arrow"
                    sx={{
                      flexShrink: 0,

                      fontSize: 19,

                      transition:
                        'transform 220ms ease',

                      '@media (prefers-reduced-motion: reduce)':
                        {
                          transition:
                            'none',
                        },
                    }}
                  />
                </Box>
              </Link>
            </Box>
          )}
        </Box>

        {/* ===================================================
            MOBILE MAIN CTA
        ==================================================== */}

        <Box
          sx={{
            display: {
              xs: 'block',
              md: 'none',
            },

            mt: 3.5,
          }}
        >
          <Link
            href={menuHref}
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
              endIcon={
                <ArrowForwardRoundedIcon />
              }
              sx={{
                minHeight: 50,

                color:
                  'text.primary',

                borderColor:
                  'divider',

                '&:hover': {
                  borderColor:
                    'secondary.main',

                  bgcolor:
                    'action.hover',
                },
              }}
            >
              {mobileCtaLabel}
            </Button>
          </Link>
        </Box>
      </Container>
    </Box>
  );
}