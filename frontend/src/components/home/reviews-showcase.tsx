'use client';

import {
  useEffect,
  useMemo,
  useState,
} from 'react';

import Link from 'next/link';

import {
  Avatar,
  Box,
  Button,
  Container,
  Rating,
  Typography,
} from '@mui/material';

import { alpha } from '@mui/material/styles';

import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import FormatQuoteRoundedIcon from '@mui/icons-material/FormatQuoteRounded';
import StarRoundedIcon from '@mui/icons-material/StarRounded';

import {
  AnimatePresence,
  motion,
  useReducedMotion,
} from 'motion/react';

/* =========================================================
   TYPES

   Future production flow:

   Admin Dashboard
        ↓
   NestJS API
        ↓
   PostgreSQL
        ↓
   Parent Server Component
        ↓
   ReviewsShowcase content prop
========================================================= */

type ReviewItem = {
  id: string;
  name: string;
  occasion?: string;
  rating: number;
  review: string;
  avatarUrl?: string | null;
};

export type ReviewsShowcaseContent = {
  enabled?: boolean;

  eyebrow?: string;
  title: string;
  accentTitle?: string;
  description?: string;

  reviews: ReviewItem[];

  footerText?: string;

  cta?: {
    label: string;
    href: string;
  };
};

type ReviewsShowcaseProps = {
  /**
   * Development default:
   * initialReviewsContent below.
   *
   * Production later:
   * Parent Server Component can fetch approved/published
   * reviews + homepage copy from NestJS and pass the
   * serializable content into this Client Component.
   */
  content?: ReviewsShowcaseContent;
};

/* =========================================================
   DEVELOPMENT CONTENT

   IMPORTANT:
   Replace these with real approved/published reviews
   before production public launch.
========================================================= */

const initialReviewsContent: ReviewsShowcaseContent = {
  enabled: true,

  eyebrow: 'Guest Stories',

  title: 'Moments that',

  accentTitle: 'stay with you.',

  description:
    'Every table has a story and every celebration leaves a memory. Discover moments shared by guests at Harmony.',

  reviews: [
    {
      id: 'r1',
      name: 'Aarav',
      occasion: 'Family Dinner',
      rating: 5,
      review:
        'The atmosphere felt warm, elegant and relaxed. It gave us exactly the kind of family evening we were hoping for.',
      avatarUrl: null,
    },
    {
      id: 'r2',
      name: 'Maya',
      occasion: 'Birthday Celebration',
      rating: 5,
      review:
        'Our celebration felt beautifully handled. The space, hospitality and overall experience came together naturally.',
      avatarUrl: null,
    },
    {
      id: 'r3',
      name: 'Sujan',
      occasion: 'Dinner With Friends',
      rating: 5,
      review:
        'A place where you actually want to stay a little longer. The ambience was comfortable, polished and welcoming.',
      avatarUrl: null,
    },
    {
      id: 'r4',
      name: 'Anisha',
      occasion: 'Anniversary Dinner',
      rating: 5,
      review:
        'The evening felt intimate without being too formal. Harmony gave the occasion a beautiful sense of warmth.',
      avatarUrl: null,
    },
    {
      id: 'r5',
      name: 'Rohan',
      occasion: 'Group Event',
      rating: 5,
      review:
        'Everything felt thoughtfully arranged for our group. The venue gave us enough space while still feeling personal.',
      avatarUrl: null,
    },
    {
      id: 'r6',
      name: 'Priya',
      occasion: 'Weekend Dining',
      rating: 5,
      review:
        'A calm and refined place to enjoy good food and conversation. The whole experience felt easy and comfortable.',
      avatarUrl: null,
    },
    {
      id: 'r7',
      name: 'Nabin',
      occasion: 'Celebration Dinner',
      rating: 5,
      review:
        'The setting gave our celebration the right atmosphere. It felt special without trying too hard.',
      avatarUrl: null,
    },
  ],

  footerText:
    'Experiences shared by Harmony guests',

  cta: {
    label: 'Read Guest Stories',
    href: '/reviews',
  },
};

const AUTO_ROTATE_MS = 3000;

/* =========================================================
   HELPERS
========================================================= */

function getInitials(name: string) {
  const normalizedName = name.trim();

  if (!normalizedName) {
    return 'H';
  }

  return normalizedName
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function normalizeRating(rating: number) {
  if (!Number.isFinite(rating)) {
    return 0;
  }

  return Math.min(
    5,
    Math.max(0, rating),
  );
}

function getOrbitPositions(count: number) {
  /**
   * Preserve the approved 7-review composition.
   */
  if (count === 7) {
    return [
      {
        top: '8%',
        left: '50%',
      },
      {
        top: '25%',
        left: '81%',
      },
      {
        top: '61%',
        left: '88%',
      },
      {
        top: '88%',
        left: '67%',
      },
      {
        top: '88%',
        left: '31%',
      },
      {
        top: '61%',
        left: '12%',
      },
      {
        top: '25%',
        left: '19%',
      },
    ];
  }

  /**
   * Admin may publish a different review count.
   * Distribute them around the same elliptical orbit.
   */
  return Array.from(
    {
      length: count,
    },
    (_, index) => {
      const angle =
        -Math.PI / 2 +
        (index * 2 * Math.PI) /
          Math.max(count, 1);

      const radiusX = 38;
      const radiusY = 40;

      return {
        top: `${
          50 +
          Math.sin(angle) *
            radiusY
        }%`,

        left: `${
          50 +
          Math.cos(angle) *
            radiusX
        }%`,
      };
    },
  );
}

/* =========================================================
   REVIEWS SHOWCASE
========================================================= */

export default function ReviewsShowcase({
  content = initialReviewsContent,
}: ReviewsShowcaseProps) {
  const {
    enabled = true,

    eyebrow,

    title,

    accentTitle,

    description,

    reviews,

    footerText,

    cta,
  } = content;

  const validReviews = useMemo(
    () =>
      reviews.filter(
        (review) =>
          review.id.trim().length > 0 &&
          review.name.trim().length > 0 &&
          review.review.trim().length > 0,
      ),
    [reviews],
  );

  const hasCta =
    Boolean(cta?.label?.trim()) &&
    Boolean(cta?.href?.trim());

  const [activeIndex, setActiveIndex] =
    useState(0);

  const [isPaused, setIsPaused] =
    useState(false);

  const shouldReduceMotion =
    useReducedMotion();

  /* =======================================================
     AUTO ROTATION
  ======================================================= */

  useEffect(() => {
    if (
      shouldReduceMotion ||
      isPaused ||
      validReviews.length <= 1
    ) {
      return;
    }

    const timer =
      window.setTimeout(() => {
        setActiveIndex(
          (current) =>
            (current + 1) %
            validReviews.length,
        );
      }, AUTO_ROTATE_MS);

    return () => {
      window.clearTimeout(timer);
    };
  }, [
    activeIndex,
    isPaused,
    shouldReduceMotion,
    validReviews.length,
  ]);

  const safeActiveIndex =
    validReviews.length === 0
      ? 0
      : Math.min(
          activeIndex,
          validReviews.length - 1,
        );

  const activeReview =
    validReviews[safeActiveIndex] ??
    null;

  const positions = useMemo(
    () =>
      getOrbitPositions(
        validReviews.length,
      ),
    [validReviews.length],
  );

  if (
    !enabled ||
    !activeReview ||
    validReviews.length === 0
  ) {
    return null;
  }

  return (
    <Box
      component="section"
      id="reviews"
      aria-labelledby="reviews-showcase-title"
      onMouseEnter={() =>
        setIsPaused(true)
      }
      onMouseLeave={() =>
        setIsPaused(false)
      }
      onFocusCapture={() =>
        setIsPaused(true)
      }
      onBlurCapture={() =>
        setIsPaused(false)
      }
      sx={{
        position: 'relative',

        overflow: 'hidden',

        bgcolor:
          'background.default',

        color: 'text.primary',

        py: {
          xs: 8,
          sm: 9,
          md: 11,
          lg: 12,
        },

        transition:
          'background-color 220ms ease, color 220ms ease',

        '@media (prefers-reduced-motion: reduce)':
          {
            transition: 'none',
          },
      }}
    >
      {/* =====================================================
          BACKGROUND
      ====================================================== */}

      <Box
        aria-hidden
        sx={{
          position: 'absolute',

          inset: 0,

          pointerEvents: 'none',

          background: (theme) => `
            radial-gradient(
              circle at 50% 45%,
              ${alpha(
                theme.palette.secondary.main,
                0.13,
              )},
              ${alpha(
                theme.palette.secondary.main,
                0,
              )} 30%
            ),

            radial-gradient(
              circle at 10% 8%,
              ${alpha(
                theme.palette.secondary.main,
                0.05,
              )},
              ${alpha(
                theme.palette.secondary.main,
                0,
              )} 23%
            ),

            radial-gradient(
              circle at 90% 92%,
              ${alpha(
                theme.palette.primary.main,
                0.06,
              )},
              ${alpha(
                theme.palette.primary.main,
                0,
              )} 27%
            )
          `,
        }}
      />

      <Box
        aria-hidden
        sx={{
          position: 'absolute',

          inset: 0,

          opacity: 0.22,

          pointerEvents: 'none',

          backgroundImage: (theme) =>
            `linear-gradient(
              ${alpha(
                theme.palette.secondary.main,
                0.035,
              )} 1px,
              transparent 1px
            )`,

          backgroundSize:
            '100% 68px',
        }}
      />

      <Container
        maxWidth="xl"
        sx={{
          position: 'relative',

          zIndex: 1,
        }}
      >
        {/* =====================================================
            HEADER
        ====================================================== */}

        <Box
          sx={{
            maxWidth: 820,

            mx: 'auto',

            textAlign: 'center',
          }}
        >
          {eyebrow && (
            <Box
              sx={{
                display:
                  'inline-flex',

                alignItems: 'center',

                gap: 1.2,

                maxWidth: '100%',
              }}
            >
              <Box
                aria-hidden
                sx={{
                  width: 32,

                  height: 1,

                  bgcolor:
                    'secondary.main',

                  opacity: 0.7,
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

              <Box
                aria-hidden
                sx={{
                  width: 32,

                  height: 1,

                  bgcolor:
                    'secondary.main',

                  opacity: 0.7,
                }}
              />
            </Box>
          )}

          <Typography
            id="reviews-showcase-title"
            component="h2"
            variant="h2"
            sx={{
              mt: eyebrow ? 1.8 : 0,

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
                mt: 2,

                maxWidth: 600,

                mx: 'auto',

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

        {/* =====================================================
            ORBIT EXPERIENCE
        ====================================================== */}

        <Box
          sx={{
            position: 'relative',

            mt: {
              xs: 4.5,
              sm: 5.5,
              md: 6,
            },

            minHeight: {
              xs: 525,
              sm: 700,
              md: 780,
            },

            display: 'grid',

            placeItems: 'center',
          }}
        >
          {/* OUTER RING */}

          <Box
            aria-hidden
            sx={{
              display: {
                xs: 'none',
                sm: 'block',
              },

              position: 'absolute',

              width: {
                sm: 590,
                md: 710,
                lg: 750,
              },

              aspectRatio: '1',

              borderRadius: '50%',

              border:
                '1px solid',

              borderColor:
                'divider',
            }}
          />

          {/* INNER RING */}

          <Box
            aria-hidden
            sx={{
              display: {
                xs: 'none',
                sm: 'block',
              },

              position: 'absolute',

              width: {
                sm: 500,
                md: 600,
                lg: 630,
              },

              aspectRatio: '1',

              borderRadius: '50%',

              border:
                '1px solid',

              borderColor:
                'divider',

              opacity: 0.72,
            }}
          />

          {/* GOLD ORBIT ACCENT */}

          <Box
            aria-hidden
            sx={{
              display: {
                xs: 'none',
                sm: 'block',
              },

              position: 'absolute',

              width: {
                sm: 590,
                md: 710,
                lg: 750,
              },

              aspectRatio: '1',

              borderRadius: '50%',

              border:
                '1px solid transparent',

              borderTopColor:
                (theme) =>
                  alpha(
                    theme.palette
                      .secondary.main,
                    0.52,
                  ),

              borderRightColor:
                (theme) =>
                  alpha(
                    theme.palette
                      .secondary.main,
                    0.1,
                  ),

              transform:
                'rotate(-34deg)',

              filter: (theme) =>
                `drop-shadow(
                  0 0 10px
                  ${alpha(
                    theme.palette
                      .secondary.main,
                    0.08,
                  )}
                )`,
            }}
          />

          {/* ===================================================
              ORBIT PEOPLE
          ==================================================== */}

          <Box
            sx={{
              display: {
                xs: 'none',
                sm: 'block',
              },

              position: 'absolute',

              inset: 0,
            }}
          >
            {validReviews.map(
              (review, index) => {
                const active =
                  index === safeActiveIndex;

                const position =
                  positions[index] ?? {
                    top: '50%',
                    left: '50%',
                  };

                return (
                  <motion.button
                    key={review.id}
                    type="button"
                    onClick={() =>
                      setActiveIndex(index)
                    }
                    aria-label={`Read ${review.name}'s review`}
                    aria-pressed={active}
                    animate={{
                      scale: active
                        ? 1.08
                        : 1,
                    }}
                    transition={{
                      duration: 0.35,

                      ease: [
                        0.22,
                        1,
                        0.36,
                        1,
                      ],
                    }}
                    style={{
                      position:
                        'absolute',

                      top:
                        position.top,

                      left:
                        position.left,

                      transform:
                        'translate(-50%, -50%)',

                      border: 0,

                      padding: 0,

                      background:
                        'transparent',

                      cursor:
                        'pointer',

                      zIndex: active
                        ? 5
                        : 3,
                    }}
                  >
                    <Box
                      sx={{
                        position:
                          'relative',

                        width: {
                          sm: active
                            ? 78
                            : 58,

                          md: active
                            ? 90
                            : 66,
                        },

                        height: {
                          sm: active
                            ? 78
                            : 58,

                          md: active
                            ? 90
                            : 66,
                        },

                        borderRadius:
                          '50%',

                        display:
                          'grid',

                        placeItems:
                          'center',

                        bgcolor:
                          active
                            ? 'background.paper'
                            : 'action.hover',

                        border:
                          '1px solid',

                        borderWidth:
                          active
                            ? 3
                            : 1,

                        borderColor:
                          active
                            ? 'secondary.main'
                            : 'divider',

                        boxShadow:
                          (theme) =>
                            active
                              ? theme
                                  .shadows[10]
                              : theme
                                  .shadows[4],

                        transition:
                          'width 350ms ease, height 350ms ease, background-color 350ms ease, box-shadow 350ms ease, border-color 350ms ease',
                      }}
                    >
                      <Avatar
                        src={
                          review.avatarUrl ??
                          undefined
                        }
                        alt={`${review.name} profile`}
                        sx={{
                          width: active
                            ? '82%'
                            : '78%',

                          height: active
                            ? '82%'
                            : '78%',

                          bgcolor:
                            active
                              ? 'primary.main'
                              : 'action.hover',

                          color:
                            active
                              ? 'primary.contrastText'
                              : 'secondary.dark',

                          typography:
                            'caption',

                          fontWeight:
                            800,
                        }}
                      >
                        {getInitials(
                          review.name,
                        )}
                      </Avatar>

                      {active && (
                        <>
                          <Box
                            aria-hidden
                            sx={{
                              position:
                                'absolute',

                              inset: -10,

                              borderRadius:
                                '50%',

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
                                    0.42,
                                  ),
                            }}
                          />

                          {!shouldReduceMotion && (
                            <motion.div
                              aria-hidden
                              animate={{
                                scale: [
                                  1,
                                  1.12,
                                  1,
                                ],

                                opacity: [
                                  0.5,
                                  0.1,
                                  0.5,
                                ],
                              }}
                              transition={{
                                duration:
                                  3,

                                repeat:
                                  Infinity,

                                ease:
                                  'easeInOut',
                              }}
                              style={{
                                position:
                                  'absolute',

                                inset:
                                  -18,

                                borderRadius:
                                  '50%',

                                pointerEvents:
                                  'none',
                              }}
                            >
                              <Box
                                sx={{
                                  position:
                                    'absolute',

                                  inset: 0,

                                  borderRadius:
                                    '50%',

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
                                        0.25,
                                      ),
                                }}
                              />
                            </motion.div>
                          )}

                          <Box
                            sx={{
                              position:
                                'absolute',

                              right: -1,

                              bottom: 2,

                              width: 23,

                              height: 23,

                              display:
                                'grid',

                              placeItems:
                                'center',

                              borderRadius:
                                '50%',

                              bgcolor:
                                'secondary.main',

                              border:
                                '2px solid',

                              borderColor:
                                'background.default',
                            }}
                          >
                            <StarRoundedIcon
                              sx={{
                                fontSize:
                                  13,

                                color:
                                  'secondary.contrastText',
                              }}
                            />
                          </Box>
                        </>
                      )}
                    </Box>
                  </motion.button>
                );
              },
            )}
          </Box>

          {/* ===================================================
              MAIN TESTIMONIAL
          ==================================================== */}

          <Box
            sx={{
              position: 'relative',

              zIndex: 4,

              width: {
                xs: '100%',
                sm: 455,
                md: 510,
              },

              minHeight: {
                xs: 445,
                sm: 485,
                md: 525,
              },

              maxWidth: '94vw',

              px: {
                xs: 2.7,
                sm: 4.5,
                md: 5.5,
              },

              py: {
                xs: 3.8,
                sm: 4.5,
                md: 5.4,
              },

              display: 'flex',

              alignItems:
                'center',

              overflow: 'hidden',

              borderRadius: {
                xs: 4,
                sm: '50%',
              },

              bgcolor:
                'background.paper',

              border:
                '1px solid',

              borderColor:
                'divider',

              boxShadow:
                (theme) =>
                  theme.shadows[12],

              transition:
                'background-color 220ms ease, border-color 220ms ease',

              '@media (prefers-reduced-motion: reduce)':
                {
                  transition:
                    'none',
                },
            }}
          >
            {/* INNER FRAME */}

            <Box
              aria-hidden
              sx={{
                position:
                  'absolute',

                inset: 12,

                borderRadius: {
                  xs: 3.2,
                  sm: '50%',
                },

                border:
                  '1px solid',

                borderColor:
                  'divider',

                opacity: 0.65,

                pointerEvents:
                  'none',
              }}
            />

            {/* STORY COUNTER */}

            <Box
              sx={{
                position:
                  'absolute',

                top: {
                  xs: 20,
                  sm: 34,
                  md: 38,
                },

                left: '50%',

                transform:
                  'translateX(-50%)',

                zIndex: 3,

                display:
                  'inline-flex',

                alignItems:
                  'center',

                gap: 0.65,

                px: 1.15,

                py: 0.65,

                borderRadius:
                  999,

                bgcolor:
                  'action.hover',
              }}
            >
              <AutoAwesomeRoundedIcon
                sx={{
                  fontSize: 13,

                  color:
                    'secondary.dark',
                }}
              />

              <Typography
                variant="caption"
                sx={{
                  color:
                    'text.secondary',

                  fontWeight:
                    800,

                  letterSpacing:
                    '0.08em',

                  textTransform:
                    'uppercase',
                }}
              >
                Story{' '}
                {String(
                  safeActiveIndex + 1,
                ).padStart(
                  2,
                  '0',
                )}
                {' / '}
                {String(
                  validReviews.length,
                ).padStart(
                  2,
                  '0',
                )}
              </Typography>
            </Box>

            {/* ACTIVE REVIEW */}

            <AnimatePresence
              mode="wait"
              initial={false}
            >
              <motion.div
                key={activeReview.id}
                initial={
                  shouldReduceMotion
                    ? {
                        opacity: 0,
                      }
                    : {
                        opacity: 0,

                        y: 18,

                        scale:
                          0.987,
                      }
                }
                animate={{
                  opacity: 1,

                  y: 0,

                  scale: 1,
                }}
                exit={
                  shouldReduceMotion
                    ? {
                        opacity: 0,
                      }
                    : {
                        opacity: 0,

                        y: -16,

                        scale:
                          0.987,
                      }
                }
                transition={{
                  duration:
                    shouldReduceMotion
                      ? 0.15
                      : 0.48,

                  ease: [
                    0.22,
                    1,
                    0.36,
                    1,
                  ],
                }}
                style={{
                  width: '100%',

                  position:
                    'relative',

                  zIndex: 2,
                }}
              >
                <Box
                  sx={{
                    maxWidth:
                      390,

                    minWidth: 0,

                    mx: 'auto',

                    pt: {
                      xs: 3.5,
                      sm: 2.5,
                    },

                    textAlign:
                      'center',
                  }}
                >
                  <Box
                    aria-hidden
                    sx={{
                      width: 48,

                      height: 48,

                      mx: 'auto',

                      display:
                        'grid',

                      placeItems:
                        'center',

                      borderRadius:
                        '50%',

                      bgcolor:
                        'action.hover',

                      color:
                        'primary.main',
                    }}
                  >
                    <FormatQuoteRoundedIcon
                      sx={{
                        fontSize:
                          25,
                      }}
                    />
                  </Box>

                  <Rating
                    value={normalizeRating(
                      activeReview.rating,
                    )}
                    readOnly
                    size="small"
                    sx={{
                      mt: 2,

                      '& .MuiRating-iconFilled':
                        {
                          color:
                            'secondary.main',
                        },
                    }}
                  />

                  <Typography
                    component="blockquote"
                    variant="h4"
                    sx={{
                      mt: 1.9,

                      mb: 0,

                      color:
                        'text.primary',

                      overflowWrap:
                        'break-word',

                      hyphens:
                        'auto',
                    }}
                  >
                    “{activeReview.review}”
                  </Typography>

                  <Box
                    aria-hidden
                    sx={{
                      width: 28,

                      height: 1,

                      bgcolor:
                        'secondary.main',

                      mx: 'auto',

                      mt: 2.4,

                      mb: 1.5,
                    }}
                  />

                  <Typography
                    variant="subtitle2"
                    sx={{
                      color:
                        'text.primary',

                      fontWeight:
                        800,

                      overflowWrap:
                        'anywhere',
                    }}
                  >
                    {activeReview.name}
                  </Typography>

                  {activeReview.occasion && (
                    <Typography
                      variant="overline"
                      sx={{
                        display:
                          'block',

                        mt: 0.45,

                        color:
                          'text.secondary',

                        overflowWrap:
                          'anywhere',
                      }}
                    >
                      {
                        activeReview.occasion
                      }
                    </Typography>
                  )}
                </Box>
              </motion.div>
            </AnimatePresence>

            {/* AUTO ROTATE PROGRESS */}

            {!shouldReduceMotion &&
              !isPaused &&
              validReviews.length >
                1 && (
                <Box
                  sx={{
                    position:
                      'absolute',

                    left: '50%',

                    bottom: {
                      xs: 20,
                      sm: 34,
                    },

                    width: {
                      xs: 90,
                      sm: 105,
                    },

                    height: 2,

                    transform:
                      'translateX(-50%)',

                    overflow:
                      'hidden',

                    borderRadius:
                      999,

                    bgcolor:
                      'action.hover',
                  }}
                >
                  <motion.div
                    key={`progress-${activeReview.id}`}
                    initial={{
                      width: '0%',
                    }}
                    animate={{
                      width: '100%',
                    }}
                    transition={{
                      duration:
                        AUTO_ROTATE_MS /
                        1000,

                      ease:
                        'linear',
                    }}
                    style={{
                      height:
                        '100%',

                      borderRadius:
                        999,
                    }}
                  >
                    <Box
                      sx={{
                        width:
                          '100%',

                        height:
                          '100%',

                        bgcolor:
                          'secondary.main',
                      }}
                    />
                  </motion.div>
                </Box>
              )}
          </Box>
        </Box>

        {/* =====================================================
            MOBILE SELECTOR
        ====================================================== */}

        {validReviews.length >
          1 && (
          <Box
            sx={{
              display: {
                xs: 'flex',
                sm: 'none',
              },

              alignItems:
                'center',

              justifyContent:
                'center',

              gap: 0.8,

              mt: 1.8,
            }}
          >
            {validReviews.map(
              (review, index) => {
                const active =
                  activeIndex ===
                  index;

                return (
                  <Box
                    key={`${review.id}-mobile`}
                    component="button"
                    type="button"
                    onClick={() =>
                      setActiveIndex(index)
                    }
                    aria-label={`Show review ${
                      index + 1
                    }`}
                    aria-pressed={
                      active
                    }
                    sx={{
                      width:
                        active
                          ? 30
                          : 7,

                      height: 5,

                      border: 0,

                      p: 0,

                      borderRadius:
                        999,

                      bgcolor:
                        active
                          ? 'secondary.main'
                          : 'divider',

                      cursor:
                        'pointer',

                      transition:
                        'width 300ms ease, background-color 300ms ease',

                      '@media (prefers-reduced-motion: reduce)':
                        {
                          transition:
                            'none',
                        },
                    }}
                  />
                );
              },
            )}
          </Box>
        )}

        {/* =====================================================
            FOOTER CTA
        ====================================================== */}

        {(footerText ||
          hasCta) && (
          <Box
            sx={{
              mt: {
                xs: 3.7,
                md: 3,
              },

              display: 'flex',

              flexDirection: {
                xs: 'column',
                sm: 'row',
              },

              justifyContent:
                'center',

              alignItems:
                'center',

              gap: 1.8,
            }}
          >
            {footerText && (
              <Typography
                variant="caption"
                sx={{
                  color:
                    'text.secondary',

                  textAlign:
                    'center',

                  overflowWrap:
                    'break-word',
                }}
              >
                {footerText}
              </Typography>
            )}

            {hasCta &&
              cta && (
                <Link
                  href={cta.href}
                  style={{
                    maxWidth:
                      '100%',

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
                            '18px !important',
                        }}
                      />
                    }
                    sx={{
                      minHeight:
                        46,

                      maxWidth:
                        '100%',

                      px: 2.4,

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

                      '&:hover':
                        {
                          bgcolor:
                            'action.hover',

                          borderColor:
                            'secondary.main',
                        },
                    }}
                  >
                    {cta.label}
                  </Button>
                </Link>
              )}
          </Box>
        )}
      </Container>
    </Box>
  );
}