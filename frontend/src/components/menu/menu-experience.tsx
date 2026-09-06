'use client';

import {
  useDeferredValue,
  useMemo,
  useState,
} from 'react';

import Image from 'next/image';

import {
  alpha,
  Box,
  Button,
  Container,
  IconButton,
  InputAdornment,
  MenuItem as MuiMenuItem,
  Select,
  Stack,
  TextField,
  Typography,
  useTheme,
} from '@mui/material';

import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import RestaurantMenuRoundedIcon from '@mui/icons-material/RestaurantMenuRounded';
import LocalDiningRoundedIcon from '@mui/icons-material/LocalDiningRounded';
import SoupKitchenRoundedIcon from '@mui/icons-material/SoupKitchenRounded';
import SpaRoundedIcon from '@mui/icons-material/SpaRounded';
import DinnerDiningRoundedIcon from '@mui/icons-material/DinnerDiningRounded';
import RamenDiningRoundedIcon from '@mui/icons-material/RamenDiningRounded';
import LocalPizzaRoundedIcon from '@mui/icons-material/LocalPizzaRounded';
import LunchDiningRoundedIcon from '@mui/icons-material/LunchDiningRounded';
import LocalBarRoundedIcon from '@mui/icons-material/LocalBarRounded';
import LocalCafeRoundedIcon from '@mui/icons-material/LocalCafeRounded';
import StarBorderRoundedIcon from '@mui/icons-material/StarBorderRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import HealthAndSafetyRoundedIcon from '@mui/icons-material/HealthAndSafetyRounded';
import WorkspacePremiumRoundedIcon from '@mui/icons-material/WorkspacePremiumRounded';
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';
import TuneRoundedIcon from '@mui/icons-material/TuneRounded';
import DeliveryDiningRoundedIcon from '@mui/icons-material/DeliveryDiningRounded';
import RedeemRoundedIcon from '@mui/icons-material/RedeemRounded';

import {
  menuData,
  type MenuGroup,
  type MenuItem,
} from '@/data/menu-data';

type FlatMenuItem = {
  id: string;
  categoryId: string;
  categoryName: string;
  group: MenuGroup;
  item: MenuItem;
};

const sidebarIcons = [
  RestaurantMenuRoundedIcon,
  LocalCafeRoundedIcon,
  SpaRoundedIcon,
  SoupKitchenRoundedIcon,
  LocalDiningRoundedIcon,
  RamenDiningRoundedIcon,
  DinnerDiningRoundedIcon,
  LocalPizzaRoundedIcon,
  LunchDiningRoundedIcon,
  LocalBarRoundedIcon,
  StarBorderRoundedIcon,
];

const groupImage: Record<MenuGroup, string> = {
  FOOD:
    '/images/menu/harmony-food-menu-bg.jpg',

  BEVERAGES:
    '/images/menu/harmony-beverages-menu-bg.jpg',

  BAR:
    '/images/menu/harmony-bar-menu-bg.jpg',
};

/* =========================================================
   HELPERS
========================================================= */

function getItemPrice(
  item: MenuItem,
) {
  if (
    typeof item.price ===
    'number'
  ) {
    return item.price;
  }

  if (
    item.variants &&
    item.variants.length > 0
  ) {
    return item.variants[0].price;
  }

  return 0;
}

function formatPrice(
  price: number,
) {
  return `NPR ${price.toLocaleString(
    'en-IN',
  )}`;
}

function getVisibleCategories() {
  return menuData
    .map((category) => ({
      ...category,

      items:
        category.items.filter(
          (item) =>
            item.status ===
            'VERIFIED',
        ),
    }))

    .filter(
      (category) =>
        category.items.length >
        0,
    );
}

/* =========================================================
   MAIN
========================================================= */

export default function MenuExperience() {
  const theme = useTheme();

  const categories =
    useMemo(
      () =>
        getVisibleCategories(),
      [],
    );

  const flatItems =
    useMemo<FlatMenuItem[]>(
      () =>
        categories.flatMap(
          (category) =>
            category.items.map(
              (item, index) => ({
                id: `${category.id}-${index}`,

                categoryId:
                  category.id,

                categoryName:
                  category.name,

                group:
                  category.group,

                item,
              }),
            ),
        ),
      [categories],
    );

  const [
    activeCategory,
    setActiveCategory,
  ] =
    useState('ALL');

  const [
    search,
    setSearch,
  ] = useState('');

  const deferredSearch =
    useDeferredValue(search);

  const [
    group,
    setGroup,
  ] =
    useState<
      'ALL' | MenuGroup
    >('ALL');

  const [
    sort,
    setSort,
  ] =
    useState('featured');

  /* =======================================================
     FILTERING
  ======================================================= */

  const filteredItems =
    useMemo(() => {
      const normalizedSearch =
        deferredSearch
          .toLowerCase()
          .trim();

      const hasSearch =
        normalizedSearch.length >
        0;

      let result =
        flatItems.filter(
          (entry) => {
            const matchesCategory =
              activeCategory ===
                'ALL' ||
              entry.categoryId ===
                activeCategory;

            const matchesGroup =
              group === 'ALL' ||
              entry.group === group;

            const searchableText =
              `
                ${entry.item.name}
                ${
                  entry.item
                    .description ??
                  ''
                }
                ${entry.categoryName}
                ${entry.group}
              `.toLowerCase();

            const matchesSearch =
              searchableText.includes(
                normalizedSearch,
              );

            return hasSearch
              ? matchesSearch
              : matchesCategory &&
                  matchesGroup;
          },
        );

      if (
        sort === 'price-low'
      ) {
        result = [
          ...result,
        ].sort(
          (a, b) =>
            getItemPrice(
              a.item,
            ) -
            getItemPrice(
              b.item,
            ),
        );
      }

      if (
        sort === 'price-high'
      ) {
        result = [
          ...result,
        ].sort(
          (a, b) =>
            getItemPrice(
              b.item,
            ) -
            getItemPrice(
              a.item,
            ),
        );
      }

      if (sort === 'name') {
        result = [
          ...result,
        ].sort((a, b) =>
          a.item.name.localeCompare(
            b.item.name,
          ),
        );
      }

      return result;
    }, [
      activeCategory,
      deferredSearch,
      flatItems,
      group,
      sort,
    ]);

  /* =======================================================
     SEARCH SUGGESTIONS
  ======================================================= */

  const searchSuggestions =
    useMemo(() => {
      const normalizedSearch =
        deferredSearch
          .toLowerCase()
          .trim();

      if (!normalizedSearch) {
        return [];
      }

      return flatItems
        .filter((entry) => {
          const searchableText =
            `
              ${entry.item.name}
              ${
                entry.item
                  .description ??
                ''
              }
              ${entry.categoryName}
            `.toLowerCase();

          return searchableText.includes(
            normalizedSearch,
          );
        })

        .sort((a, b) => {
          const aName =
            a.item.name.toLowerCase();

          const bName =
            b.item.name.toLowerCase();

          const aStarts =
            aName.startsWith(
              normalizedSearch,
            )
              ? 0
              : 1;

          const bStarts =
            bName.startsWith(
              normalizedSearch,
            )
              ? 0
              : 1;

          if (
            aStarts !== bStarts
          ) {
            return (
              aStarts - bStarts
            );
          }

          return aName.localeCompare(
            bName,
          );
        })

        .slice(0, 8);
    }, [
      deferredSearch,
      flatItems,
    ]);

  const allMenuActive =
    activeCategory ===
      'ALL' &&
    group === 'ALL';

  return (
    <Box
      component="main"
      sx={{
        bgcolor:
          'background.default',

        color:
          'text.primary',
      }}
    >
      {/* =====================================================
          PAGE LAYOUT
      ===================================================== */}

      <Box
        sx={{
          display: {
            xs: 'block',
            lg: 'grid',
          },

          gridTemplateColumns: {
            lg:
              '230px minmax(0, 1fr)',
          },

          minHeight: '100vh',
        }}
      >
        {/* =====================================================
            DESKTOP SIDEBAR
        ===================================================== */}

        <Box
          component="aside"
          aria-label="Menu categories"
          sx={{
            display: {
              xs: 'none',
              lg: 'flex',
            },

            position:
              'sticky',

            top: 68,

            alignSelf:
              'start',

            height:
              'calc(100vh - 68px)',

            flexDirection:
              'column',

            overflow:
              'hidden',

            bgcolor:
              'primary.dark',

            color:
              'primary.contrastText',

            borderRight:
              '1px solid',

            borderColor:
              alpha(
                theme.palette
                  .primary
                  .contrastText,
                0.07,
              ),
          }}
        >
          <Box
            sx={{
              p: 2,

              flex: 1,

              minHeight: 0,

              overflowY:
                'auto',

              scrollbarWidth:
                'thin',

              scrollbarColor: `${alpha(
                theme.palette
                  .secondary.light,
                0.55,
              )} transparent`,

              '&::-webkit-scrollbar':
                {
                  width: 6,
                },

              '&::-webkit-scrollbar-track':
                {
                  background:
                    'transparent',
                },

              '&::-webkit-scrollbar-thumb':
                {
                  bgcolor:
                    alpha(
                      theme
                        .palette
                        .secondary
                        .light,
                      0.48,
                    ),

                  borderRadius:
                    999,
                },

              '&::-webkit-scrollbar-thumb:hover':
                {
                  bgcolor:
                    alpha(
                      theme
                        .palette
                        .secondary
                        .light,
                      0.72,
                    ),
                },
            }}
          >
            <Button
              fullWidth
              startIcon={
                <RestaurantMenuRoundedIcon />
              }
              endIcon={
                <ArrowForwardRoundedIcon />
              }
              onClick={() => {
                setActiveCategory(
                  'ALL',
                );

                setGroup('ALL');
              }}
              sx={{
                justifyContent:
                  'flex-start',

                minHeight: 52,

                px: 2,

                mb: 2.5,

                color:
                  allMenuActive
                    ? 'secondary.contrastText'
                    : 'primary.contrastText',

                bgcolor:
                  allMenuActive
                    ? 'secondary.main'
                    : 'transparent',

                border:
                  '1px solid',

                borderColor:
                  allMenuActive
                    ? 'secondary.main'
                    : alpha(
                        theme
                          .palette
                          .primary
                          .contrastText,
                        0.12,
                      ),

                '&:hover': {
                  bgcolor:
                    allMenuActive
                      ? 'secondary.light'
                      : alpha(
                          theme
                            .palette
                            .primary
                            .contrastText,
                          0.07,
                        ),
                },
              }}
            >
              All Menu
            </Button>

            {(
              [
                'FOOD',
                'BEVERAGES',
                'BAR',
              ] as MenuGroup[]
            ).map(
              (
                menuGroup,
                groupIndex,
              ) => {
                const groupCategories =
                  categories.filter(
                    (category) =>
                      category.group ===
                      menuGroup,
                  );

                if (
                  groupCategories.length ===
                  0
                ) {
                  return null;
                }

                return (
                  <Box
                    key={
                      menuGroup
                    }
                    sx={{
                      mt:
                        groupIndex ===
                        0
                          ? 0
                          : 2.4,
                    }}
                  >
                    <Box
                      sx={{
                        mb: 0.9,

                        display:
                          'flex',

                        alignItems:
                          'center',

                        gap: 1.1,
                      }}
                    >
                      <Typography
                        variant="overline"
                        sx={{
                          flexShrink:
                            0,

                          color:
                            'secondary.light',
                        }}
                      >
                        {menuGroup ===
                        'FOOD'
                          ? 'Food'
                          : menuGroup ===
                              'BEVERAGES'
                            ? 'Beverages'
                            : 'Bar'}
                      </Typography>

                      <Box
                        aria-hidden
                        sx={{
                          height:
                            '1px',

                          flex: 1,

                          bgcolor:
                            alpha(
                              theme
                                .palette
                                .secondary
                                .light,
                              0.26,
                            ),
                        }}
                      />
                    </Box>

                    <Stack
                      sx={{
                        gap: 0.15,
                      }}
                    >
                      {groupCategories.map(
                        (
                          category,
                        ) => {
                          const originalIndex =
                            categories.findIndex(
                              (
                                entry,
                              ) =>
                                entry.id ===
                                category.id,
                            );

                          const Icon =
                            sidebarIcons[
                              Math.max(
                                originalIndex,
                                0,
                              ) %
                                sidebarIcons.length
                            ];

                          const active =
                            activeCategory ===
                            category.id;

                          return (
                            <Button
                              key={
                                category.id
                              }
                              startIcon={
                                <Icon />
                              }
                              onClick={() => {
                                setActiveCategory(
                                  category.id,
                                );

                                setGroup(
                                  menuGroup,
                                );
                              }}
                              sx={{
                                justifyContent:
                                  'flex-start',

                                minHeight:
                                  42,

                                px: 1.1,
                                py: 0.7,

                                color:
                                  active
                                    ? 'secondary.light'
                                    : alpha(
                                        theme
                                          .palette
                                          .primary
                                          .contrastText,
                                        0.82,
                                      ),

                                bgcolor:
                                  active
                                    ? alpha(
                                        theme
                                          .palette
                                          .secondary
                                          .light,
                                        0.1,
                                      )
                                    : 'transparent',

                                borderRadius:
                                  1,

                                fontWeight:
                                  active
                                    ? 800
                                    : 600,

                                textAlign:
                                  'left',

                                '& .MuiButton-startIcon':
                                  {
                                    minWidth:
                                      24,

                                    marginRight:
                                      0.75,
                                  },

                                '& .MuiButton-startIcon svg':
                                  {
                                    fontSize:
                                      18,
                                  },

                                '&:hover':
                                  {
                                    bgcolor:
                                      alpha(
                                        theme
                                          .palette
                                          .primary
                                          .contrastText,
                                        0.055,
                                      ),

                                    color:
                                      'primary.contrastText',
                                  },
                              }}
                            >
                              {
                                category.name
                              }
                            </Button>
                          );
                        },
                      )}
                    </Stack>
                  </Box>
                );
              },
            )}
          </Box>
        </Box>

        {/* =====================================================
            RIGHT CONTENT
        ===================================================== */}

        <Box
          sx={{
            minWidth: 0,
          }}
        >
          {/* =====================================================
              HERO
          ===================================================== */}

          <Box
            component="section"
            sx={{
              display: {
                xs: 'block',
                md: 'grid',
              },

              gridTemplateColumns:
                {
                  md:
                    '0.88fr 1.12fr',
                },

              minHeight: {
                md: 340,
              },

              borderBottom:
                '1px solid',

              borderColor:
                'divider',

              bgcolor:
                'background.paper',
            }}
          >
            <Box
              sx={{
                px: {
                  xs: 2,
                  sm: 4,
                  md: 5,
                  xl: 6,
                },

                py: {
                  xs: 5,
                  md: 6,
                },

                display: 'flex',

                flexDirection:
                  'column',

                justifyContent:
                  'center',
              }}
            >
              <Typography
                variant="overline"
                sx={{
                  color:
                    'secondary.dark',
                }}
              >
                Exquisite Flavors
              </Typography>

              <Typography
                component="h1"
                variant="h2"
                sx={{
                  mt: 1,

                  maxWidth: 520,

                  color:
                    'text.primary',
                }}
              >
                A Menu for
                <br />
                Every Moment
              </Typography>

              <Typography
                variant="body1"
                sx={{
                  mt: 2,

                  maxWidth:
                    520,

                  color:
                    'text.secondary',
                }}
              >
                Fresh ingredients.
                Thoughtful
                preparation.
                Memorable flavours
                for dining,
                celebrations and
                every Harmony
                moment.
              </Typography>

              <Box
                sx={{
                  mt: 3,

                  display: 'flex',

                  flexWrap:
                    'wrap',

                  gap: 2.2,
                }}
              >
                {[
                  {
                    icon:
                      SpaRoundedIcon,

                    text:
                      'Fresh & Local',
                  },

                  {
                    icon:
                      WorkspacePremiumRoundedIcon,

                    text:
                      'Chef Crafted',
                  },

                  {
                    icon:
                      HealthAndSafetyRoundedIcon,

                    text:
                      'Quality First',
                  },
                ].map(
                  ({
                    icon: Icon,
                    text,
                  }) => (
                    <Stack
                      key={text}
                      direction="row"
                      sx={{
                        alignItems:
                          'center',

                        gap: 0.7,

                        color:
                          'text.secondary',
                      }}
                    >
                      <Icon
                        aria-hidden
                        sx={{
                          color:
                            'primary.main',

                          fontSize:
                            20,
                        }}
                      />

                      <Typography
                        variant="caption"
                        sx={{
                          fontWeight:
                            700,
                        }}
                      >
                        {text}
                      </Typography>
                    </Stack>
                  ),
                )}
              </Box>
            </Box>

            <Box
              sx={{
                position:
                  'relative',

                minHeight: {
                  xs: 280,
                  md: 340,
                },

                overflow:
                  'hidden',
              }}
            >
              <Image
                src="/images/menu/harmony-food-menu-bg.jpg"
                alt="Harmony dining menu"
                fill
                priority
                quality={75}
                sizes="(max-width: 900px) 100vw, 55vw"
                style={{
                  objectFit:
                    'cover',

                  objectPosition:
                    'center',
                }}
              />

              <Box
                aria-hidden
                sx={{
                  position:
                    'absolute',

                  inset: 0,

                  background: `linear-gradient(
                    90deg,
                    ${alpha(
                      theme
                        .palette
                        .primary
                        .dark,
                      0.1,
                    )},
                    ${alpha(
                      theme
                        .palette
                        .primary
                        .dark,
                      0.02,
                    )}
                  )`,
                }}
              />
            </Box>
          </Box>

          {/* =====================================================
              MOBILE CATEGORY SELECTOR
          ===================================================== */}

          <Box
            sx={{
              display: {
                xs: 'block',
                lg: 'none',
              },

              px: {
                xs: 2,
                sm: 4,
              },

              pt: 3,
            }}
          >
            <Select
              fullWidth
              value={
                activeCategory
              }
              onChange={(event) => {
                const nextCategoryId =
                  event.target.value;

                setActiveCategory(
                  nextCategoryId,
                );

                if (
                  nextCategoryId ===
                  'ALL'
                ) {
                  setGroup('ALL');
                  return;
                }

                const nextCategory =
                  categories.find(
                    (category) =>
                      category.id ===
                      nextCategoryId,
                  );

                if (
                  nextCategory
                ) {
                  setGroup(
                    nextCategory.group,
                  );
                }
              }}
              size="small"
              inputProps={{
                'aria-label':
                  'Select menu category',
              }}
            >
              <MuiMenuItem value="ALL">
                All Menu
              </MuiMenuItem>

              {categories.map(
                (category) => (
                  <MuiMenuItem
                    key={
                      category.id
                    }
                    value={
                      category.id
                    }
                  >
                    {
                      category.name
                    }
                  </MuiMenuItem>
                ),
              )}
            </Select>
          </Box>

          {/* =====================================================
              SEARCH + FILTERS
          ===================================================== */}

          <Box
            sx={{
              position:
                'sticky',

              top: {
                xs: 64,
                md: 68,
              },

              zIndex: 15,

              bgcolor:
                'background.default',

              borderBottom:
                '1px solid',

              borderColor:
                'divider',
            }}
          >
            <Container
              maxWidth={false}
              sx={{
                px: {
                  xs: 2,
                  sm: 4,
                  md: 4,
                  xl: 5,
                },

                py: 2,
              }}
            >
              <Box
                sx={{
                  display:
                    'grid',

                  gridTemplateColumns:
                    {
                      xs: '1fr',

                      sm:
                        'minmax(0,1fr) auto auto',
                    },

                  gap: 1.2,
                }}
              >
                {/* SEARCH */}

                <Box
                  sx={{
                    position:
                      'relative',

                    minWidth: 0,
                  }}
                >
                  <TextField
                    fullWidth
                    value={search}
                    onChange={(
                      event,
                    ) =>
                      setSearch(
                        event.target
                          .value,
                      )
                    }
                    placeholder="Search menu items..."
                    size="small"
                    slotProps={{
                      htmlInput: {
                        'aria-label':
                          'Search Harmony menu',
                      },

                      input: {
                        startAdornment:
                          (
                            <InputAdornment position="start">
                              <SearchRoundedIcon
                                aria-hidden
                                sx={{
                                  fontSize:
                                    20,
                                }}
                              />
                            </InputAdornment>
                          ),

                        endAdornment:
                          search
                            ? (
                                <InputAdornment position="end">
                                  <IconButton
                                    size="small"
                                    aria-label="Clear menu search"
                                    onClick={() =>
                                      setSearch(
                                        '',
                                      )
                                    }
                                  >
                                    <CloseRoundedIcon
                                      sx={{
                                        fontSize:
                                          18,
                                      }}
                                    />
                                  </IconButton>
                                </InputAdornment>
                              )
                            : undefined,
                      },
                    }}
                  />

                  {search.trim() &&
                  searchSuggestions.length >
                    0 ? (
                    <Box
                      role="listbox"
                      aria-label="Menu search suggestions"
                      sx={{
                        position:
                          'absolute',

                        top:
                          'calc(100% + 8px)',

                        left: 0,
                        right: 0,

                        zIndex:
                          40,

                        maxHeight:
                          360,

                        overflowY:
                          'auto',

                        bgcolor:
                          'background.paper',

                        border:
                          '1px solid',

                        borderColor:
                          'divider',

                        borderRadius:
                          1.5,

                        boxShadow:
                          theme
                            .shadows[12],

                        scrollbarWidth:
                          'thin',

                        '&::-webkit-scrollbar':
                          {
                            width:
                              7,
                          },

                        '&::-webkit-scrollbar-thumb':
                          {
                            bgcolor:
                              alpha(
                                theme
                                  .palette
                                  .text
                                  .secondary,
                                0.38,
                              ),

                            borderRadius:
                              999,
                          },
                      }}
                    >
                      {searchSuggestions.map(
                        (
                          entry,
                        ) => {
                          const price =
                            getItemPrice(
                              entry.item,
                            );

                          return (
                            <Button
                              key={`search-${entry.id}`}
                              role="option"
                              fullWidth
                              onClick={() => {
                                setSearch(
                                  entry
                                    .item
                                    .name,
                                );

                                setActiveCategory(
                                  entry.categoryId,
                                );

                                setGroup(
                                  entry.group,
                                );
                              }}
                              sx={{
                                minHeight:
                                  62,

                                px: 1.6,

                                py: 1,

                                justifyContent:
                                  'space-between',

                                alignItems:
                                  'center',

                                gap: 2,

                                borderRadius:
                                  0,

                                borderBottom:
                                  '1px solid',

                                borderColor:
                                  'divider',

                                color:
                                  'text.primary',

                                textAlign:
                                  'left',

                                '&:last-of-type':
                                  {
                                    borderBottom:
                                      0,
                                  },

                                '&:hover':
                                  {
                                    bgcolor:
                                      'action.hover',
                                  },
                              }}
                            >
                              <Box
                                sx={{
                                  minWidth:
                                    0,
                                }}
                              >
                                <Typography
                                  variant="subtitle2"
                                  sx={{
                                    fontWeight:
                                      800,

                                    overflow:
                                      'hidden',

                                    textOverflow:
                                      'ellipsis',

                                    whiteSpace:
                                      'nowrap',
                                  }}
                                >
                                  {
                                    entry
                                      .item
                                      .name
                                  }
                                </Typography>

                                <Typography
                                  variant="caption"
                                  sx={{
                                    display:
                                      'block',

                                    mt: 0.2,

                                    color:
                                      'text.secondary',
                                  }}
                                >
                                  {
                                    entry.categoryName
                                  }{' '}
                                  •{' '}
                                  {
                                    entry.group
                                  }
                                </Typography>
                              </Box>

                              <Typography
                                variant="caption"
                                sx={{
                                  flexShrink:
                                    0,

                                  color:
                                    'secondary.dark',

                                  fontWeight:
                                    800,
                                }}
                              >
                                {price >
                                0
                                  ? formatPrice(
                                      price,
                                    )
                                  : entry
                                      .item
                                      .priceLabel ??
                                    'Ask'}
                              </Typography>
                            </Button>
                          );
                        },
                      )}
                    </Box>
                  ) : null}
                </Box>

                {/* GROUP FILTER */}

                <Select
                  size="small"
                  value={group}
                  onChange={(
                    event,
                  ) => {
                    const nextGroup =
                      event.target
                        .value as
                        | 'ALL'
                        | MenuGroup;

                    setGroup(
                      nextGroup,
                    );

                    if (
                      nextGroup ===
                      'ALL'
                    ) {
                      return;
                    }

                    const activeCategoryEntry =
                      categories.find(
                        (
                          category,
                        ) =>
                          category.id ===
                          activeCategory,
                      );

                    if (
                      activeCategory !==
                        'ALL' &&
                      activeCategoryEntry?.group !==
                        nextGroup
                    ) {
                      setActiveCategory(
                        'ALL',
                      );
                    }
                  }}
                  inputProps={{
                    'aria-label':
                      'Filter menu by type',
                  }}
                  sx={{
                    minWidth:
                      145,
                  }}
                >
                  <MuiMenuItem value="ALL">
                    All Types
                  </MuiMenuItem>

                  <MuiMenuItem value="FOOD">
                    Food
                  </MuiMenuItem>

                  <MuiMenuItem value="BEVERAGES">
                    Beverages
                  </MuiMenuItem>

                  <MuiMenuItem value="BAR">
                    Bar
                  </MuiMenuItem>
                </Select>

                {/* SORT */}

                <Select
                  size="small"
                  value={sort}
                  onChange={(
                    event,
                  ) =>
                    setSort(
                      event.target
                        .value,
                    )
                  }
                  inputProps={{
                    'aria-label':
                      'Sort menu items',
                  }}
                  sx={{
                    minWidth:
                      150,
                  }}
                >
                  <MuiMenuItem value="featured">
                    Sort
                  </MuiMenuItem>

                  <MuiMenuItem value="name">
                    Name
                  </MuiMenuItem>

                  <MuiMenuItem value="price-low">
                    Price: Low
                  </MuiMenuItem>

                  <MuiMenuItem value="price-high">
                    Price: High
                  </MuiMenuItem>
                </Select>
              </Box>
            </Container>
          </Box>

          {/* =====================================================
              MENU LIST
          ===================================================== */}

          <Container
            maxWidth={false}
            sx={{
              px: {
                xs: 2,
                sm: 4,
                md: 4,
                xl: 5,
              },

              py: {
                xs: 4,
                md: 5,
              },
            }}
          >
            <Box
              id="menu-list"
              sx={{
                minWidth: 0,

                scrollMarginTop: {
                  xs: 150,
                  md: 160,
                },
              }}
            >
              <Box
                sx={{
                  display: 'flex',

                  justifyContent:
                    'space-between',

                  alignItems:
                    'baseline',

                  gap: 2,

                  mb: 2.5,
                }}
              >
                <Box>
                  <Typography
                    component="h2"
                    variant="h4"
                  >
                    {activeCategory ===
                    'ALL'
                      ? 'Our Menu'
                      : categories.find(
                            (
                              category,
                            ) =>
                              category.id ===
                              activeCategory,
                          )?.name ??
                        'Menu'}
                  </Typography>

                  <Typography
                    variant="body2"
                    sx={{
                      mt: 0.5,

                      color:
                        'text.secondary',
                    }}
                  >
                    {
                      filteredItems.length
                    }{' '}
                    dishes available
                  </Typography>
                </Box>

                <TuneRoundedIcon
                  aria-hidden
                  sx={{
                    color:
                      'secondary.dark',
                  }}
                />
              </Box>

              {/* EMPTY STATE */}

              {filteredItems.length ===
              0 ? (
                <Box
                  sx={{
                    py: 10,

                    px: 2,

                    textAlign:
                      'center',

                    border:
                      '1px solid',

                    borderColor:
                      'divider',

                    bgcolor:
                      'background.paper',

                    borderRadius:
                      1,
                  }}
                >
                  <Typography variant="h5">
                    No dishes found
                  </Typography>

                  <Typography
                    variant="body2"
                    sx={{
                      mt: 1,

                      color:
                        'text.secondary',
                    }}
                  >
                    Try another
                    search, category
                    or menu type.
                  </Typography>

                  <Button
                    variant="outlined"
                    onClick={() => {
                      setSearch('');

                      setActiveCategory(
                        'ALL',
                      );

                      setGroup(
                        'ALL',
                      );

                      setSort(
                        'featured',
                      );
                    }}
                    sx={{
                      mt: 2.2,
                    }}
                  >
                    Clear Filters
                  </Button>
                </Box>
              ) : (
                <Box
                  sx={{
                    display:
                      'grid',

                    gridTemplateColumns:
                      {
                        xs:
                          '1fr',

                        md:
                          'repeat(2,minmax(0,1fr))',

                        lg:
                          'repeat(3,minmax(0,1fr))',

                        xl:
                          'repeat(3,minmax(0,1fr))',

                        '@media (min-width:1600px)':
                          {
                            gridTemplateColumns:
                              'repeat(4,minmax(0,1fr))',
                          },
                      },

                    gap: 2,
                  }}
                >
                  {filteredItems.map(
                    (entry) => {
                      const price =
                        getItemPrice(
                          entry.item,
                        );

                      return (
                        <Box
                          key={
                            entry.id
                          }
                          component="article"
                          sx={{
                            contentVisibility:
                              'auto',

                            containIntrinsicSize:
                              '420px',

                            overflow:
                              'hidden',

                            height:
                              '100%',

                            display:
                              'flex',

                            flexDirection:
                              'column',

                            bgcolor:
                              'background.paper',

                            border:
                              '1px solid',

                            borderColor:
                              'divider',

                            borderRadius:
                              1.25,

                            boxShadow:
                              theme
                                .shadows[1],

                            transition:
                              'transform 180ms ease, border-color 180ms ease, box-shadow 180ms ease',

                            '&:hover':
                              {
                                transform:
                                  'translateY(-2px)',

                                borderColor:
                                  'secondary.main',

                                boxShadow:
                                  theme
                                    .shadows[4],
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
                          {/* IMAGE */}

                          <Box
                            sx={{
                              position:
                                'relative',

                              aspectRatio:
                                '4 / 3',

                              overflow:
                                'hidden',
                            }}
                          >
                            <Image
                              src={
                                groupImage[
                                  entry
                                    .group
                                ]
                              }
                              alt={
                                entry
                                  .item
                                  .name
                              }
                              fill
                              loading="lazy"
                              quality={75}
                              sizes="(max-width: 600px) 100vw, (max-width: 1200px) 50vw, (max-width: 1600px) 40vw, 28vw"
                              style={{
                                objectFit:
                                  'cover',
                              }}
                            />

                            <Box
                              sx={{
                                position:
                                  'absolute',

                                top: 10,
                                right: 10,

                                px: 1,
                                py: 0.45,

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

                                boxShadow:
                                  theme
                                    .shadows[3],

                                backdropFilter:
                                  'blur(8px)',

                                WebkitBackdropFilter:
                                  'blur(8px)',
                              }}
                            >
                              <Typography
                                variant="overline"
                                sx={{
                                  fontWeight:
                                    900,
                                }}
                              >
                                {entry.group ===
                                'FOOD'
                                  ? 'FOOD'
                                  : entry.group ===
                                      'BEVERAGES'
                                    ? 'DRINK'
                                    : 'BAR'}
                              </Typography>
                            </Box>
                          </Box>

                          {/* CARD CONTENT */}

                          <Box
                            sx={{
                              p: 1.45,

                              flex: 1,

                              display:
                                'flex',

                              flexDirection:
                                'column',
                            }}
                          >
                            <Typography
                              variant="overline"
                              sx={{
                                color:
                                  'secondary.dark',

                                fontWeight:
                                  800,
                              }}
                            >
                              {
                                entry.categoryName
                              }
                            </Typography>

                            <Typography
                              component="h3"
                              variant="h6"
                              sx={{
                                mt: 0.5,
                              }}
                            >
                              {
                                entry
                                  .item
                                  .name
                              }
                            </Typography>

                            <Typography
                              variant="overline"
                              sx={{
                                mt: 0.65,

                                color:
                                  'secondary.dark',

                                fontWeight:
                                  800,
                              }}
                            >
                              Ingredients
                            </Typography>

                            <Typography
                              variant="caption"
                              sx={{
                                mt: 0.25,

                                minHeight:
                                  38,

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
                              {entry
                                .item
                                .description ??
                                'Ingredient details will be available soon.'}
                            </Typography>

                            <Box
                              sx={{
                                mt: 'auto',

                                pt: 1.1,

                                display:
                                  'flex',

                                alignItems:
                                  'center',

                                justifyContent:
                                  'space-between',

                                gap: 1,
                              }}
                            >
                              <Typography
                                variant="subtitle2"
                                sx={{
                                  fontWeight:
                                    800,

                                  color:
                                    'text.primary',
                                }}
                              >
                                {price >
                                0
                                  ? formatPrice(
                                      price,
                                    )
                                  : entry
                                      .item
                                      .priceLabel ??
                                    'Ask'}
                              </Typography>
                            </Box>
                          </Box>
                        </Box>
                      );
                    },
                  )}
                </Box>
              )}
            </Box>
          </Container>

          {/* =====================================================
              BENEFITS
          ===================================================== */}

          <Box
            component="section"
            aria-label="Harmony menu benefits"
            sx={{
              borderTop:
                '1px solid',

              borderColor:
                'divider',

              bgcolor:
                'background.paper',
            }}
          >
            <Container
              maxWidth={false}
              sx={{
                px: {
                  xs: 2,
                  sm: 4,
                  md: 5,
                },

                py: {
                  xs: 4,
                  md: 5,
                },
              }}
            >
              <Box
                sx={{
                  display:
                    'grid',

                  gridTemplateColumns:
                    {
                      xs: '1fr',

                      sm:
                        'repeat(2,1fr)',

                      lg:
                        'repeat(4,1fr)',
                    },

                  gap: 2,
                }}
              >
                {[
                  {
                    icon:
                      ShoppingBagOutlinedIcon,

                    title:
                      'Easy Online Ordering',

                    text:
                      'Quick & secure ordering',
                  },

                  {
                    icon:
                      SearchRoundedIcon,

                    title:
                      'Fast Menu Search',

                    text:
                      'Find dishes, drinks & categories quickly',
                  },

                  {
                    icon:
                      DeliveryDiningRoundedIcon,

                    title:
                      'Dine In or Takeaway',

                    text:
                      'Enjoy Harmony your way',
                  },

                  {
                    icon:
                      RedeemRoundedIcon,

                    title:
                      'Loyalty & Rewards',

                    text:
                      'Designed for returning guests',
                  },
                ].map(
                  ({
                    icon: Icon,
                    title,
                    text,
                  }) => (
                    <Box
                      key={title}
                      sx={{
                        px: 2,

                        py: 2,

                        textAlign:
                          'center',
                      }}
                    >
                      <Icon
                        aria-hidden
                        sx={{
                          fontSize:
                            30,

                          color:
                            'secondary.dark',
                        }}
                      />

                      <Typography
                        variant="subtitle2"
                        sx={{
                          mt: 1,

                          fontWeight:
                            800,
                        }}
                      >
                        {title}
                      </Typography>

                      <Typography
                        variant="caption"
                        sx={{
                          display:
                            'block',

                          mt: 0.4,

                          color:
                            'text.secondary',
                        }}
                      >
                        {text}
                      </Typography>
                    </Box>
                  ),
                )}
              </Box>
            </Container>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
