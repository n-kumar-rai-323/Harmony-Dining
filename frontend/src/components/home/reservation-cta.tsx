'use client';

import Link from 'next/link';

import {
  Box,
  Button,
  Container,
  Typography,
} from '@mui/material';

import { alpha } from '@mui/material/styles';

import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded';
import CelebrationRoundedIcon from '@mui/icons-material/CelebrationRounded';
import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded';
import RestaurantRoundedIcon from '@mui/icons-material/RestaurantRounded';

/* =========================================================
   TYPES

   Future production flow:

   Admin Dashboard
        ↓
   NestJS API
        ↓
   PostgreSQL
        ↓
   Server Component fetch
        ↓
   ReservationCta content prop
========================================================= */

type ReservationIconKey =
  | 'calendar'
  | 'celebration'
  | 'clock'
  | 'groups'
  | 'restaurant';

type ReservationBadge = {
  id: string;
  label: string;
  iconKey: ReservationIconKey;
};

type ReservationActionCard = {
  id: string;

  enabled?: boolean;

  eyebrow?: string;

  title: string;

  description?: string;

  iconKey: ReservationIconKey;

  badges?: ReservationBadge[];

  cta?: {
    label: string;
    href: string;
    variant: 'contained' | 'outlined';
  };
};

export type ReservationCtaContent = {
  enabled?: boolean;

  eyebrow?: string;

  title: string;

  accentTitle?: string;

  description?: string;

  cards?: ReservationActionCard[];

  supportingNote?: string;
};

type ReservationCtaProps = {
  /**
   * Parent Server Component can fetch published content
   * and pass serializable data into this Client Component.
   */
  content?: ReservationCtaContent;
};

/* =========================================================
   INITIAL DEVELOPMENT CONTENT

   Event / Hall is intentionally primary.

   Later Admin/API can replace this object without
   redesigning the UI.
========================================================= */

const initialReservationContent: ReservationCtaContent = {
  enabled: true,

  eyebrow: 'Plan Your Visit',

  title: 'Make your next moment',

  accentTitle: 'a Harmony moment.',

  description:
    'Plan a memorable celebration with our event team or reserve a table for your next dining experience.',

  cards: [
    {
      id: 'event-planning',

      eyebrow: 'Events & Hall Booking',

      title: 'Book Event / Hall',

      description:
        'Tell us about your occasion and let our team help shape the right venue, dining experience and event setup.',

      iconKey: 'celebration',

      badges: [
        {
          id: 'group-occasions',
          label: 'Group occasions',
          iconKey: 'groups',
        },
        {
          id: 'venue-dining',
          label: 'Venue & dining',
          iconKey: 'restaurant',
        },
      ],

      cta: {
        label: 'Plan Your Event',
        href: '/events#enquiry',
        variant: 'contained',
      },
    },

    {
      id: 'dining-reservation',

      eyebrow: 'Dining Reservation',

      title: 'Reserve a Table',

      description:
        'Choose your preferred date, time and number of guests for your next visit to Harmony.',

      iconKey: 'calendar',

      badges: [
        {
          id: 'choose-time',
          label: 'Choose your time',
          iconKey: 'clock',
        },
        {
          id: 'dining-harmony',
          label: 'Dining at Harmony',
          iconKey: 'restaurant',
        },
      ],

      cta: {
        label: 'Reserve a Table',
        href: '/reservation',
        variant: 'outlined',
      },
    },
  ],

  supportingNote:
    'Event enquiries and dining reservations are handled separately so we can give each visit the right attention.',
};

/* =========================================================
   ICON COMPONENT

   Important:
   We do NOT dynamically create a React component during
   render.

   API/Admin stores only string icon keys.
========================================================= */

function ReservationIcon({
  iconKey,
  size = 24,
}: {
  iconKey: ReservationIconKey;
  size?: number;
}) {
  const iconSx = {
    fontSize: size,
  };

  switch (iconKey) {
    case 'calendar':
      return (
        <CalendarMonthRoundedIcon
          aria-hidden
          sx={iconSx}
        />
      );

    case 'celebration':
      return (
        <CelebrationRoundedIcon
          aria-hidden
          sx={iconSx}
        />
      );

    case 'clock':
      return (
        <AccessTimeRoundedIcon
          aria-hidden
          sx={iconSx}
        />
      );

    case 'groups':
      return (
        <GroupsRoundedIcon
          aria-hidden
          sx={iconSx}
        />
      );

    case 'restaurant':
      return (
        <RestaurantRoundedIcon
          aria-hidden
          sx={iconSx}
        />
      );

    default:
      return (
        <CalendarMonthRoundedIcon
          aria-hidden
          sx={iconSx}
        />
      );
  }
}

/* =========================================================
   CARD
========================================================= */

function ReservationActionCardView({
  card,
}: {
  card: ReservationActionCard;
}) {
  const badges = (
    card.badges ?? []
  ).filter(
    (badge) =>
      badge.id.trim().length >
        0 &&
      badge.label.trim().length >
        0,
  );

  const hasCta =
    Boolean(
      card.cta?.label?.trim(),
    ) &&
    Boolean(
      card.cta?.href?.trim(),
    );

  return (
    <Box
      component="article"
      sx={{
        position: 'relative',

        minWidth: 0,

        overflow: 'hidden',

        p: {
          xs: 2.5,
          sm: 3.2,
          md: 3.6,
        },

        minHeight: {
          md: 370,
        },

        display: 'flex',

        flexDirection: 'column',

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
            theme.shadows[5],

        transition:
          'transform 250ms ease, border-color 250ms ease, background-color 250ms ease, box-shadow 250ms ease',

        '&:hover': {
          transform:
            'translateY(-3px)',

          bgcolor:
            'action.hover',

          borderColor:
            'secondary.main',

          boxShadow:
            (theme) =>
              theme.shadows[8],
        },

        '@media (prefers-reduced-motion: reduce)':
          {
            transition:
              'none',

            '&:hover': {
              transform:
                'none',
            },
          },
      }}
    >
      {/* DECORATION */}

      <Box
        aria-hidden
        sx={{
          position:
            'absolute',

          width:
            230,

          height:
            230,

          top:
            -115,

          right:
            -110,

          borderRadius:
            '50%',

          background:
            (theme) =>
              `radial-gradient(
                circle,
                ${alpha(
                  theme.palette
                    .secondary.main,
                  0.16,
                )} 0%,
                ${alpha(
                  theme.palette
                    .secondary.main,
                  0,
                )} 68%
              )`,

          pointerEvents:
            'none',
        }}
      />

      {/* CONTENT */}

      <Box
        sx={{
          position:
            'relative',

          zIndex:
            1,

          minWidth:
            0,
        }}
      >
        {/* ICON + EYEBROW */}

        <Box
          sx={{
            display:
              'flex',

            alignItems:
              'center',

            justifyContent:
              'space-between',

            gap:
              2,

            minWidth:
              0,
          }}
        >
          <Box
            aria-hidden
            sx={{
              width:
                56,

              height:
                56,

              display:
                'grid',

              placeItems:
                'center',

              flexShrink:
                0,

              borderRadius:
                '50%',

              bgcolor:
                (theme) =>
                  alpha(
                    theme.palette
                      .secondary
                      .main,
                    0.13,
                  ),

              color:
                'secondary.dark',

              border:
                '1px solid',

              borderColor:
                'divider',
            }}
          >
            <ReservationIcon
              iconKey={
                card.iconKey
              }
              size={26}
            />
          </Box>

          {card.eyebrow ? (
            <Typography
              variant="overline"
              sx={{
                minWidth:
                  0,

                color:
                  'secondary.dark',

                textAlign:
                  'right',

                overflowWrap:
                  'anywhere',
              }}
            >
              {
                card.eyebrow
              }
            </Typography>
          ) : null}
        </Box>

        {/* TITLE */}

        <Typography
          component="h3"
          variant="h3"
          sx={{
            mt:
              2.3,

            color:
              'text.primary',

            overflowWrap:
              'break-word',

            hyphens:
              'auto',
          }}
        >
          {card.title}
        </Typography>

        {/* DESCRIPTION */}

        {card.description ? (
          <Typography
            component="p"
            variant="body2"
            sx={{
              mt:
                1.4,

              mb:
                0,

              maxWidth:
                420,

              color:
                'text.secondary',

              overflowWrap:
                'break-word',
            }}
          >
            {
              card.description
            }
          </Typography>
        ) : null}

        {/* BADGES */}

        {badges.length >
        0 ? (
          <Box
            sx={{
              mt:
                2.4,

              display:
                'flex',

              flexWrap:
                'wrap',

              gap:
                0.9,
            }}
          >
            {badges.map(
              (badge) => (
                <Box
                  key={
                    badge.id
                  }
                  sx={{
                    display:
                      'inline-flex',

                    alignItems:
                      'center',

                    maxWidth:
                      '100%',

                    minWidth:
                      0,

                    gap:
                      0.6,

                    px:
                      1.1,

                    py:
                      0.72,

                    borderRadius:
                      1,

                    bgcolor:
                      'action.hover',

                    border:
                      '1px solid',

                    borderColor:
                      'divider',
                  }}
                >
                  <Box
                    sx={{
                      display:
                        'grid',

                      placeItems:
                        'center',

                      flexShrink:
                        0,

                      color:
                        'secondary.dark',
                    }}
                  >
                    <ReservationIcon
                      iconKey={
                        badge.iconKey
                      }
                      size={
                        15
                      }
                    />
                  </Box>

                  <Typography
                    variant="caption"
                    sx={{
                      minWidth:
                        0,

                      color:
                        'text.secondary',

                      fontWeight:
                        700,

                      overflowWrap:
                        'anywhere',
                    }}
                  >
                    {
                      badge.label
                    }
                  </Typography>
                </Box>
              ),
            )}
          </Box>
        ) : null}
      </Box>

      {/* CTA */}

      {hasCta &&
      card.cta ? (
        <Box
          sx={{
            mt:
              'auto',

            pt:
              3,

            width: {
              xs:
                '100%',

              sm:
                'auto',
            },

            maxWidth:
              '100%',
          }}
        >
          <Link
            href={
              card.cta.href
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
              variant={
                card.cta
                  .variant
              }
              endIcon={
                <ArrowForwardRoundedIcon
                  sx={{
                    fontSize:
                      '19px !important',
                  }}
                />
              }
              sx={{
                minHeight:
                  50,

                px:
                  2.5,

                ...(card.cta
                  .variant ===
                'contained'
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
                  : {
                      color:
                        'text.primary',

                      borderColor:
                        'divider',

                      '&:hover':
                        {
                          borderColor:
                            'secondary.main',

                          bgcolor:
                            'action.hover',
                        },
                    }),

                textAlign:
                  'center',

                whiteSpace: {
                  xs:
                    'normal',

                  sm:
                    'nowrap',
                },

                overflowWrap:
                  'anywhere',

                '@media (min-width:600px)':
                  {
                    width:
                      'auto',
                  },
              }}
            >
              {
                card.cta
                  .label
              }
            </Button>
          </Link>
        </Box>
      ) : null}
    </Box>
  );
}

/* =========================================================
   RESERVATION CTA
========================================================= */

export default function ReservationCta({
  content = initialReservationContent,
}: ReservationCtaProps) {
  const {
    enabled = true,

    eyebrow,

    title,

    accentTitle,

    description,

    cards = [],

    supportingNote,
  } = content;

  const visibleCards =
    cards.filter(
      (card) =>
        card.enabled !==
          false &&
        card.id.trim()
          .length > 0 &&
        card.title
          .trim()
          .length > 0,
    );

  if (!enabled) {
    return null;
  }

  return (
    <Box
      component="section"
      aria-labelledby="reservation-cta-title"
      sx={{
        position:
          'relative',

        overflow:
          'hidden',

        bgcolor:
          'background.default',

        color:
          'text.primary',

        py: {
          xs:
            7,

          sm:
            8,

          md:
            10,

          lg:
            11,
        },

        transition:
          'background-color 220ms ease, color 220ms ease',

        '@media (prefers-reduced-motion: reduce)':
          {
            transition:
              'none',
          },
      }}
    >
      {/* BACKGROUND */}

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
                  0.16,
                )},
                ${alpha(
                  theme.palette
                    .secondary.main,
                  0,
                )} 30%
              ),
              radial-gradient(
                circle at 88% 78%,
                ${alpha(
                  theme.palette
                    .primary.main,
                  0.055,
                )},
                ${alpha(
                  theme.palette
                    .primary.main,
                  0,
                )} 28%
              )
            `,
        }}
      />

      <Box
        aria-hidden
        sx={{
          position:
            'absolute',

          width: {
            xs:
              280,

            md:
              360,
          },

          height: {
            xs:
              280,

            md:
              360,
          },

          top: {
            xs:
              -170,

            md:
              -220,
          },

          right: {
            xs:
              -150,

            md:
              -180,
          },

          borderRadius:
            '50%',

          border:
            '1px solid',

          borderColor:
            'divider',

          opacity:
            0.55,

          pointerEvents:
            'none',
        }}
      />

      <Container
        maxWidth="xl"
        sx={{
          position:
            'relative',

          zIndex:
            1,
        }}
      >
        {/* HEADER */}

        <Box
          sx={{
            maxWidth:
              850,

            mx:
              'auto',

            textAlign:
              'center',

            minWidth:
              0,
          }}
        >
          {eyebrow ? (
            <Box
              sx={{
                display:
                  'flex',

                alignItems:
                  'center',

                justifyContent:
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
                  width: {
                    xs:
                      24,

                    sm:
                      30,
                  },

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
                  width: {
                    xs:
                      24,

                    sm:
                      30,
                  },

                  height:
                    1,

                  flexShrink:
                    0,

                  bgcolor:
                    'secondary.main',
                }}
              />
            </Box>
          ) : null}

          {/* TITLE */}

          <Typography
            id="reservation-cta-title"
            component="h2"
            variant="h2"
            sx={{
              mt:
                eyebrow
                  ? 1.8
                  : 0,

              mx:
                'auto',

              maxWidth:
                800,

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
                  display: {
                    xs:
                      'inline',

                    sm:
                      'block',
                  },

                  color:
                    'secondary.dark',
                }}
              >
                {' '}
                {
                  accentTitle
                }
              </Box>
            ) : null}
          </Typography>

          {/* DESCRIPTION */}

          {description ? (
            <Typography
              component="p"
              variant="body1"
              sx={{
                mt:
                  2.2,

                mb:
                  0,

                maxWidth:
                  640,

                mx:
                  'auto',

                color:
                  'text.secondary',

                overflowWrap:
                  'break-word',
              }}
            >
              {description}
            </Typography>
          ) : null}
        </Box>

        {/* ACTION CARDS */}

        {visibleCards.length >
        0 ? (
          <Box
            sx={{
              mt: {
                xs:
                  4.5,

                md:
                  5.5,
              },

              display:
                'grid',

              gridTemplateColumns:
                {
                  xs:
                    'minmax(0, 1fr)',

                  md:
                    visibleCards.length ===
                    1
                      ? 'minmax(0, 760px)'
                      : 'repeat(2, minmax(0, 1fr))',
                },

              justifyContent:
                'center',

              gap: {
                xs:
                  1.8,

                md:
                  2.2,
              },

              maxWidth:
                1000,

              mx:
                'auto',
            }}
          >
            {visibleCards.map(
              (card) => (
                <ReservationActionCardView
                  key={
                    card.id
                  }
                  card={
                    card
                  }
                />
              ),
            )}
          </Box>
        ) : null}

        {/* BOTTOM CONTEXT */}

        {supportingNote ? (
          <Box
            sx={{
              mt: {
                xs:
                  2.4,

                md:
                  2.8,
              },

              maxWidth:
                1000,

              mx:
                'auto',

              display:
                'flex',

              justifyContent:
                'center',

              alignItems:
                'center',

              gap:
                1,

              textAlign:
                'center',

              minWidth:
                0,
            }}
          >
            <Box
              aria-hidden
              sx={{
                width:
                  4,

                height:
                  4,

                flexShrink:
                  0,

                borderRadius:
                  '50%',

                bgcolor:
                  'secondary.main',
              }}
            />

            <Typography
              component="p"
              variant="caption"
              sx={{
                m:
                  0,

                minWidth:
                  0,

                color:
                  'text.secondary',

                overflowWrap:
                  'break-word',
              }}
            >
              {
                supportingNote
              }
            </Typography>

            <Box
              aria-hidden
              sx={{
                width:
                  4,

                height:
                  4,

                flexShrink:
                  0,

                borderRadius:
                  '50%',

                bgcolor:
                  'secondary.main',
              }}
            />
          </Box>
        ) : null}
      </Container>
    </Box>
  );
}