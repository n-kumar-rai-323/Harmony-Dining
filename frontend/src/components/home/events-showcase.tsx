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
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import CelebrationRoundedIcon from '@mui/icons-material/CelebrationRounded';
import EventAvailableRoundedIcon from '@mui/icons-material/EventAvailableRounded';
import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded';
import RestaurantRoundedIcon from '@mui/icons-material/RestaurantRounded';
import TuneRoundedIcon from '@mui/icons-material/TuneRounded';

/* =========================================================
   TYPES

   Later this data can come from:

   Admin Dashboard
        ↓
   NestJS API
        ↓
   PostgreSQL
        ↓
   Public homepage API
        ↓
   EventsShowcase
========================================================= */

type EventIconKey =
  | 'celebration'
  | 'groups'
  | 'restaurant'
  | 'tune';

type EventFeature = {
  id: string;
  title: string;
  description?: string;

  /**
   * Store only a serializable key in Admin/API data.
   * Never store a React component in PostgreSQL.
   */
  iconKey: EventIconKey;
};

type EventCta = {
  label: string;
  href: string;
};

export type EventsShowcaseData = {
  enabled?: boolean;

  eyebrow?: string;

  title: string;
  accentTitle?: string;
  closingTitle?: string;
  description?: string;

  image: string;
  imageAlt: string;
  imagePosition?: string;

  imageLabel?: string;
  imageMeta?: string;

  tags?: string[];
  features?: EventFeature[];

  primaryCta?: EventCta;
  secondaryCta?: EventCta;

  supportingNote?: string;
};

type EventsShowcaseProps = {
  /**
   * Development default: eventsData below.
   *
   * Production later:
   * Parent Server Component can fetch the published
   * homepage events configuration from NestJS and pass
   * the serializable data into this Client Component.
   */
  content?: EventsShowcaseData;
};

/* =========================================================
   INITIAL CONTENT

   Production architecture:
   This object is the development-time content source.

   Later the parent Server Component can fetch:
   getHomepageEventsSection()

   and pass the published object through the `content` prop.

   UI component does not need to be redesigned.
========================================================= */

const eventsData: EventsShowcaseData = {
  enabled: true,

  eyebrow: 'Events & Banquet',

  title: 'Your occasion.',

  accentTitle: 'Your people.',

  closingTitle: 'One memorable space.',

  description:
    'From intimate celebrations to larger group events, Harmony brings venue, dining and thoughtful hospitality together in one welcoming experience.',

  image:
    '/images/home/harmony-banquet-hall.jpg',

  imageAlt:
    'Banquet and event space at Harmony Dining & Event Center',

  imagePosition: 'center',

  imageLabel: 'Events at Harmony',

  imageMeta:
    'Dining • Venue • Hospitality',

  tags: [
    'Private Events',
    'Celebrations',
    'Group Dining',
  ],

  features: [
    {
      id: 'celebrations',
      title: 'Celebrations',
      description:
        'Birthdays, anniversaries and personal milestones.',
      iconKey: 'celebration',
    },
    {
      id: 'group-events',
      title: 'Group Events',
      description:
        'A flexible space for larger gatherings and occasions.',
      iconKey: 'groups',
    },
    {
      id: 'dining',
      title: 'Dining Included',
      description:
        'Food and hospitality planned together with your event.',
      iconKey: 'restaurant',
    },
    {
      id: 'custom-planning',
      title: 'Planned Your Way',
      description:
        'A setup shaped around your guests and your occasion.',
      iconKey: 'tune',
    },
  ],

  primaryCta: {
    label: 'Explore Events',
    href: '/events',
  },

  secondaryCta: {
    label: 'Plan Your Event',
    href: '/events#enquiry',
  },

  supportingNote:
    'Tell us about your occasion and our team can help with venue, dining and event planning.',
};

/* =========================================================
   ICON RESOLVER

   Admin/API stores iconKey as plain text.
   UI resolves that key to a local MUI icon.
========================================================= */

function getEventIcon(iconKey: EventIconKey) {
  switch (iconKey) {
    case 'celebration':
      return CelebrationRoundedIcon;

    case 'groups':
      return GroupsRoundedIcon;

    case 'restaurant':
      return RestaurantRoundedIcon;

    case 'tune':
      return TuneRoundedIcon;

    default:
      return CelebrationRoundedIcon;
  }
}

/* =========================================================
   EVENTS SHOWCASE
========================================================= */

export default function EventsShowcase({
  content = eventsData,
}: EventsShowcaseProps) {
  const {
    enabled = true,

    eyebrow,
    title,
    accentTitle,
    closingTitle,
    description,

    image,
    imageAlt,
    imagePosition = 'center',

    imageLabel,
    imageMeta,

    tags = [],
    features = [],

    primaryCta,
    secondaryCta,

    supportingNote,
  } = content;

  if (!enabled) {
    return null;
  }

  const validTags = tags.filter(
    (tag) => tag.trim().length > 0,
  );

  const validFeatures = features.filter(
    (feature) =>
      feature.id.trim().length > 0 &&
      feature.title.trim().length > 0,
  );

  const hasPrimaryCta =
    Boolean(primaryCta?.label?.trim()) &&
    Boolean(primaryCta?.href?.trim());

  const hasSecondaryCta =
    Boolean(secondaryCta?.label?.trim()) &&
    Boolean(secondaryCta?.href?.trim());

  return (
    <Box
      component="section"
      aria-labelledby="events-showcase-title"
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
      {/* =====================================================
          BACKGROUND DECORATION
      ====================================================== */}

      <Box
        aria-hidden
        sx={{
          position: 'absolute',

          width: {
            xs: 340,
            md: 500,
          },

          height: {
            xs: 340,
            md: 500,
          },

          right: {
            xs: -210,
            md: -250,
          },

          bottom: {
            xs: -220,
            md: -260,
          },

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
              lg: 8,
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
                lg: 'auto',
              },

              minHeight: {
                lg: 640,
              },

              overflow: 'hidden',

              borderRadius: {
                xs: 1.5,
                md: 2,
              },

              bgcolor: 'action.hover',

              boxShadow: (theme) =>
                theme.shadows[10],
            }}
          >
            <Image
              src={image}
              alt={imageAlt}
              fill
              quality={75}
              sizes="
                (max-width: 1199px) 100vw,
                52vw
              "
              style={{
                objectFit: 'cover',
                objectPosition: imagePosition,
              }}
            />

            {/* IMAGE OVERLAY */}

            <Box
              aria-hidden
              sx={{
                position: 'absolute',
                inset: 0,

                background: (theme) =>
                  `linear-gradient(
                    180deg,
                    ${alpha(
                      theme.palette.primary.dark,
                      0.02,
                    )} 28%,
                    ${alpha(
                      theme.palette.primary.dark,
                      0.18,
                    )} 65%,
                    ${alpha(
                      theme.palette.primary.dark,
                      0.62,
                    )} 100%
                  )`,

                pointerEvents: 'none',
              }}
            />

            {/* =============================================
                TAGS
            ============================================== */}

            {validTags.length > 0 && (
              <Box
                sx={{
                  position: 'absolute',

                  top: {
                    xs: 14,
                    sm: 18,
                    md: 22,
                  },

                  left: {
                    xs: 14,
                    sm: 18,
                    md: 22,
                  },

                  right: {
                    xs: 14,
                    sm: 18,
                    md: 22,
                  },

                  zIndex: 2,

                  display: 'flex',
                  flexWrap: 'wrap',

                  gap: {
                    xs: 0.65,
                    sm: 0.8,
                  },
                }}
              >
                {validTags.map((tag) => (
                  <Box
                    key={tag}
                    sx={{
                      display: 'inline-flex',
                      alignItems: 'center',

                      maxWidth: '100%',

                      px: {
                        xs: 1,
                        sm: 1.2,
                      },

                      py: {
                        xs: 0.65,
                        sm: 0.78,
                      },

                      borderRadius: 1,

                      bgcolor: (theme) =>
                        alpha(
                          theme.palette.background.paper,
                          0.94,
                        ),

                      border: '1px solid',

                      borderColor: (theme) =>
                        alpha(
                          theme.palette.common.white,
                          0.35,
                        ),

                      backdropFilter: 'blur(10px)',
                      WebkitBackdropFilter: 'blur(10px)',

                      boxShadow: (theme) =>
                        theme.shadows[4],
                    }}
                  >
                    <Typography
                      variant="caption"
                      sx={{
                        color: 'primary.main',
                        fontWeight: 800,
                        lineHeight: 1.2,
                        overflowWrap: 'anywhere',
                      }}
                    >
                      {tag}
                    </Typography>
                  </Box>
                ))}
              </Box>
            )}

            {/* =============================================
                BOTTOM LABEL
            ============================================== */}

            {(imageLabel || imageMeta) && (
              <Box
                sx={{
                  position: 'absolute',

                  left: {
                    xs: 14,
                    sm: 18,
                    md: 22,
                  },

                  right: {
                    xs: 14,
                    sm: 18,
                    md: 22,
                  },

                  bottom: {
                    xs: 14,
                    sm: 18,
                    md: 22,
                  },

                  zIndex: 2,

                  display: 'flex',
                  alignItems: 'flex-end',
                  justifyContent: 'space-between',

                  gap: 2,
                }}
              >
                {imageLabel && (
                  <Box
                    sx={{
                      display: 'inline-flex',
                      alignItems: 'center',

                      minWidth: 0,

                      gap: 0.85,

                      px: 1.4,
                      py: 1,

                      borderRadius: 1,

                      bgcolor: (theme) =>
                        alpha(
                          theme.palette.primary.dark,
                          0.9,
                        ),

                      border: '1px solid',

                      borderColor: (theme) =>
                        alpha(
                          theme.palette.secondary.light,
                          0.22,
                        ),

                      backdropFilter: 'blur(10px)',
                      WebkitBackdropFilter: 'blur(10px)',
                    }}
                  >
                    <EventAvailableRoundedIcon
                      sx={{
                        flexShrink: 0,
                        fontSize: 18,
                        color: 'secondary.light',
                      }}
                    />

                    <Typography
                      variant="caption"
                      sx={{
                        minWidth: 0,

                        color: 'primary.contrastText',

                        fontWeight: 800,
                        letterSpacing: '0.02em',

                        overflowWrap: 'anywhere',
                      }}
                    >
                      {imageLabel}
                    </Typography>
                  </Box>
                )}

                {imageMeta && (
                  <Box
                    sx={{
                      display: {
                        xs: 'none',
                        sm: 'flex',
                      },

                      alignItems: 'center',

                      gap: 0.75,

                      color: (theme) =>
                        alpha(
                          theme.palette.primary.contrastText,
                          0.82,
                        ),
                    }}
                  >
                    <AutoAwesomeRoundedIcon
                      sx={{
                        flexShrink: 0,
                        fontSize: 16,
                        color: 'secondary.light',
                      }}
                    />

                    <Typography
                      variant="caption"
                      sx={{
                        fontWeight: 700,
                        letterSpacing: '0.04em',
                        overflowWrap: 'anywhere',
                      }}
                    >
                      {imageMeta}
                    </Typography>
                  </Box>
                )}
              </Box>
            )}
          </Box>

          {/* =================================================
              CONTENT
          ================================================== */}

          <Box
            sx={{
              minWidth: 0,

              maxWidth: {
                xs: '100%',
                lg: 630,
              },
            }}
          >
            {/* EYEBROW */}

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

                    bgcolor: 'secondary.main',
                  }}
                />

                <Typography
                  variant="overline"
                  sx={{
                    minWidth: 0,

                    color: 'secondary.dark',

                    overflowWrap: 'anywhere',
                  }}
                >
                  {eyebrow}
                </Typography>
              </Box>
            )}

            {/* TITLE */}

            <Typography
              id="events-showcase-title"
              component="h2"
              variant="h2"
              sx={{
                mt: eyebrow
                  ? {
                      xs: 1.8,
                      md: 2.1,
                    }
                  : 0,

                color: 'text.primary',

                maxWidth: 620,

                overflowWrap: 'anywhere',
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

                    color: 'secondary.dark',
                  }}
                >
                  {' '}
                  {accentTitle}
                </Box>
              )}

              {closingTitle && (
                <Box
                  component="span"
                  sx={{
                    display: 'block',
                  }}
                >
                  {closingTitle}
                </Box>
              )}
            </Typography>

            {/* DESCRIPTION */}

            {description && (
              <Typography
                component="p"
                variant="body1"
                sx={{
                  mt: {
                    xs: 2.2,
                    md: 2.6,
                  },

                  maxWidth: 570,

                  color: 'text.secondary',

                  overflowWrap: 'anywhere',
                }}
              >
                {description}
              </Typography>
            )}

            {/* =============================================
                FEATURES
            ============================================== */}

            {validFeatures.length > 0 && (
              <Box
                sx={{
                  mt: {
                    xs: 3.5,
                    md: 4,
                  },

                  display: 'grid',

                  gridTemplateColumns: {
                    xs: '1fr',
                    sm:
                      'repeat(2, minmax(0, 1fr))',
                  },

                  gap: {
                    xs: 1.4,
                    md: 1.7,
                  },
                }}
              >
                {validFeatures.map((feature) => {
                  const Icon = getEventIcon(
                    feature.iconKey,
                  );

                  return (
                    <Box
                      key={feature.id}
                      sx={{
                        position: 'relative',

                        display: 'flex',
                        alignItems: 'flex-start',

                        minWidth: 0,

                        gap: 1.3,

                        p: {
                          xs: 1.7,
                          md: 1.9,
                        },

                        minHeight: {
                          sm: 118,
                        },

                        overflow: 'hidden',

                        borderRadius: 1,

                        bgcolor: 'background.paper',

                        border: '1px solid',
                        borderColor: 'divider',

                        boxShadow: (theme) =>
                          theme.shadows[2],

                        transition:
                          'transform 220ms ease, box-shadow 220ms ease, border-color 220ms ease, background-color 220ms ease',

                        '&::after': {
                          content: '""',

                          position: 'absolute',

                          left: 0,
                          top: 0,
                          bottom: 0,

                          width: 2,

                          bgcolor: 'transparent',

                          transition:
                            'background-color 220ms ease',
                        },

                        '&:hover': {
                          transform:
                            'translateY(-2px)',

                          borderColor:
                            'secondary.main',

                          boxShadow: (theme) =>
                            theme.shadows[6],

                          '&::after': {
                            bgcolor:
                              'secondary.main',
                          },

                          '& .event-feature-icon':
                            {
                              bgcolor:
                                'primary.main',

                              color:
                                'secondary.light',
                            },
                        },

                        '@media (prefers-reduced-motion: reduce)':
                          {
                            transition: 'none',

                            '&:hover': {
                              transform: 'none',
                            },

                            '&::after': {
                              transition:
                                'none',
                            },

                            '& .event-feature-icon':
                              {
                                transition:
                                  'none',
                              },
                          },
                      }}
                    >
                      {/* ICON */}

                      <Box
                        className="event-feature-icon"
                        sx={{
                          width: 44,
                          height: 44,

                          flexShrink: 0,

                          display: 'grid',
                          placeItems: 'center',

                          borderRadius: '50%',

                          bgcolor: (theme) =>
                            alpha(
                              theme.palette.secondary.main,
                              0.12,
                            ),

                          color: 'secondary.dark',

                          transition:
                            'background-color 220ms ease, color 220ms ease',
                        }}
                      >
                        <Icon
                          sx={{
                            fontSize: 20,
                          }}
                        />
                      </Box>

                      {/* CONTENT */}

                      <Box
                        sx={{
                          minWidth: 0,
                        }}
                      >
                        <Typography
                          variant="subtitle2"
                          sx={{
                            color: 'text.primary',

                            fontWeight: 800,

                            overflowWrap: 'anywhere',
                          }}
                        >
                          {feature.title}
                        </Typography>

                        {feature.description && (
                          <Typography
                            component="p"
                            variant="body2"
                            sx={{
                              mt: 0.55,
                              mb: 0,

                              color:
                                'text.secondary',

                              overflowWrap:
                                'anywhere',
                            }}
                          >
                            {feature.description}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  );
                })}
              </Box>
            )}

            {/* =============================================
                ACTIONS
            ============================================== */}

            {(hasPrimaryCta ||
              hasSecondaryCta) && (
              <Box
                sx={{
                  mt: {
                    xs: 3.8,
                    md: 4.4,
                  },

                  display: 'flex',

                  flexDirection: {
                    xs: 'column',
                    sm: 'row',
                  },

                  alignItems: {
                    xs: 'stretch',
                    sm: 'flex-start',
                  },

                  gap: 1.2,
                }}
              >
                {/* PRIMARY */}

                {hasPrimaryCta &&
                  primaryCta && (
                    <Box
                      sx={{
                        width: {
                          xs: '100%',
                          sm: 'auto',
                        },

                        maxWidth: '100%',
                      }}
                    >
                      <Link
                        href={primaryCta.href}
                        style={{
                          display: 'block',
                          width: '100%',
                          textDecoration: 'none',
                        }}
                      >
                        <Button
                          fullWidth
                          variant="contained"
                          endIcon={
                            <ArrowForwardRoundedIcon
                              sx={{
                                fontSize:
                                  '19px !important',
                              }}
                            />
                          }
                          sx={{
                            minHeight: 50,
                            px: 2.6,

                            bgcolor:
                              'primary.main',

                            color:
                              'primary.contrastText',

                            whiteSpace: {
                              xs: 'normal',
                              sm: 'nowrap',
                            },

                            textAlign: 'center',

                            overflowWrap:
                              'anywhere',

                            '&:hover': {
                              bgcolor:
                                'primary.dark',
                            },
                          }}
                        >
                          {primaryCta.label}
                        </Button>
                      </Link>
                    </Box>
                  )}

                {/* SECONDARY */}

                {hasSecondaryCta &&
                  secondaryCta && (
                    <Box
                      sx={{
                        width: {
                          xs: '100%',
                          sm: 'auto',
                        },

                        maxWidth: '100%',
                      }}
                    >
                      <Link
                        href={secondaryCta.href}
                        style={{
                          display: 'block',
                          width: '100%',
                          textDecoration: 'none',
                        }}
                      >
                        <Button
                          fullWidth
                          variant="outlined"
                          endIcon={
                            <EventAvailableRoundedIcon
                              sx={{
                                fontSize:
                                  '18px !important',
                              }}
                            />
                          }
                          sx={{
                            minHeight: 50,
                            px: 2.6,

                            color:
                              'text.primary',

                            borderColor:
                              'divider',

                            whiteSpace: {
                              xs: 'normal',
                              sm: 'nowrap',
                            },

                            textAlign: 'center',

                            overflowWrap:
                              'anywhere',

                            '&:hover': {
                              borderColor:
                                'primary.main',

                              bgcolor:
                                'action.hover',
                            },
                          }}
                        >
                          {secondaryCta.label}
                        </Button>
                      </Link>
                    </Box>
                  )}
              </Box>
            )}

            {/* =============================================
                SUPPORTING NOTE
            ============================================== */}

            {supportingNote && (
              <Typography
                component="p"
                variant="caption"
                sx={{
                  mt: 1.7,
                  mb: 0,

                  display: 'block',

                  maxWidth: 520,

                  color: 'text.secondary',

                  overflowWrap: 'anywhere',
                }}
              >
                {supportingNote}
              </Typography>
            )}
          </Box>
        </Box>
      </Container>
    </Box>
  );
}