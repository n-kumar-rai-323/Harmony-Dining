'use client';

import Image from 'next/image';
import Link from 'next/link';

import {
  Box,
  Button,
  Container,
  Stack,
  Typography,
} from '@mui/material';

import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import ArrowOutwardRoundedIcon from '@mui/icons-material/ArrowOutwardRounded';
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded';
import CelebrationRoundedIcon from '@mui/icons-material/CelebrationRounded';
import ContactSupportOutlinedIcon from '@mui/icons-material/ContactSupportOutlined';
import EventRoundedIcon from '@mui/icons-material/EventRounded';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import LocalOfferOutlinedIcon from '@mui/icons-material/LocalOfferOutlined';
import LocationOnRoundedIcon from '@mui/icons-material/LocationOnRounded';
import PhotoLibraryOutlinedIcon from '@mui/icons-material/PhotoLibraryOutlined';
import RestaurantMenuRoundedIcon from '@mui/icons-material/RestaurantMenuRounded';
import ReviewsOutlinedIcon from '@mui/icons-material/ReviewsOutlined';

import {
  FaFacebookF,
  FaInstagram,
  FaTiktok,
} from 'react-icons/fa';

/* =========================================================
   TYPES
========================================================= */

type FooterLinkItem = {
  id: string;
  label: string;
  href: string;
  enabled?: boolean;
};

type FooterCta = {
  id: string;
  label: string;
  href: string;
  type: 'reservation' | 'event';
  enabled?: boolean;
};

export type FooterContent = {
  enabled?: boolean;

  topCta?: {
    enabled?: boolean;
    eyebrow?: string;
    title?: string;
    actions?: FooterCta[];
  };

  brand?: {
    logoSrc?: string;
    logoAlt?: string;
    name?: string;
    subtitle?: string;
    description?: string;
  };

  explore?: {
    enabled?: boolean;
    title?: string;
    links?: FooterLinkItem[];
  };

  experience?: {
    enabled?: boolean;
    title?: string;
    links?: FooterLinkItem[];
  };

  visit?: {
    enabled?: boolean;
    title?: string;

    location?: {
      enabled?: boolean;
      primary?: string;
      secondary?: string;
      href?: string;
    };

    hours?: {
      enabled?: boolean;
      primary?: string;
      secondary?: string;
    };

    contact?: {
      enabled?: boolean;
      label?: string;
      href?: string;
    };
  };

  legal?: {
    copyrightName?: string;
    links?: FooterLinkItem[];
  };
};

type FooterProps = {
  content?: FooterContent;
};

/* =========================================================
   DEVELOPMENT CONTENT

   Later:
   Admin Dashboard
        ↓
   NestJS API
        ↓
   PostgreSQL
========================================================= */

const initialFooterContent: FooterContent = {
  enabled: true,

  topCta: {
    enabled: true,

    eyebrow:
      'Dining • Events • Celebrations',

    title:
      'Plan your next Harmony moment.',

    actions: [
      {
        id: 'reserve-event',
        label: 'Plan an Event',
        href: '/events#enquiry',
        type: 'event',
        enabled: true,
      },
      {
        id: 'reserve-table',
        label: 'Reserve a Table',
        href: '/reservation',
        type: 'reservation',
        enabled: true,
      },
    ],
  },

  brand: {
    logoSrc:
      '/images/harmony-logo.jpeg',

    logoAlt:
      'Harmony Dining & Event Center',

    name: 'HARMONY',

    subtitle:
      'DINING & EVENT CENTER',

    description:
      'Thoughtful dining, warm hospitality and memorable celebrations in one Harmony experience.',
  },

  explore: {
    enabled: true,
    title: 'Explore',

    links: [
      {
        id: 'home',
        label: 'Home',
        href: '/',
        enabled: true,
      },
      {
        id: 'about',
        label: 'About',
        href: '/about',
        enabled: true,
      },
      {
        id: 'menu',
        label: 'Menu',
        href: '/menu',
        enabled: true,
      },
      {
        id: 'events',
        label: 'Events',
        href: '/events',
        enabled: true,
      },
    ],
  },

  experience: {
    enabled: true,
    title: 'Experience',

    links: [
      {
        id: 'gallery',
        label: 'Gallery',
        href: '/gallery',
        enabled: true,
      },
      {
        id: 'offers',
        label: 'Offers',
        href: '/menu',
        enabled: true,
      },
      {
        id: 'reviews',
        label: 'Reviews',
        href: '/#reviews',
        enabled: true,
      },
      {
        id: 'contact',
        label: 'Contact',
        href: '/contact',
        enabled: true,
      },
    ],
  },

  visit: {
    enabled: true,
    title: 'Visit Harmony',

    location: {
      enabled: true,
      primary: 'Kumaripati, Lalitpur',
      secondary:
        'View location & directions',
      href: '/#location',
    },

    hours: {
      enabled: true,
      primary: 'Opening Hours',
      secondary:
        'Contact us for today’s hours',
    },

    contact: {
      enabled: true,
      label: 'Contact Harmony',
      href: '/contact',
    },
  },

  legal: {
    copyrightName:
      'Harmony Dining & Event Center',

    links: [
      {
        id: 'privacy',
        label: 'Privacy',
        href: '/privacy',
        enabled: true,
      },
      {
        id: 'terms',
        label: 'Terms',
        href: '/terms',
        enabled: true,
      },
      {
        id: 'contact',
        label: 'Contact',
        href: '/contact',
        enabled: true,
      },
    ],
  },
};

/* =========================================================
   SOCIAL LINKS
========================================================= */

const socialLinks = [
  {
    label: 'TikTok',
    href:
      'https://www.tiktok.com/@harmonydiningeventcenter',
    icon: FaTiktok,
    color: '#111111',
  },
  {
    label: 'Facebook',
    href:
      'https://www.facebook.com/people/Harmony-Dining-Event-Center/61593063557390/',
    icon: FaFacebookF,
    color: '#1877F2',
  },
  {
    label: 'Instagram',
    href:
      'https://www.instagram.com/harmonydiningandevent',
    icon: FaInstagram,
    color: '#E1306C',
  },
] as const;

/* =========================================================
   HELPERS
========================================================= */

function getVisibleLinks(
  links: FooterLinkItem[] | undefined,
) {
  return (links ?? []).filter(
    (item) =>
      item.enabled !== false &&
      Boolean(item.label?.trim()) &&
      Boolean(item.href?.trim()),
  );
}

function getFooterLinkIcon(
  id: string,
) {
  switch (id) {
    case 'home':
      return HomeRoundedIcon;

    case 'about':
      return InfoOutlinedIcon;

    case 'menu':
      return RestaurantMenuRoundedIcon;

    case 'events':
      return EventRoundedIcon;

    case 'gallery':
      return PhotoLibraryOutlinedIcon;

    case 'offers':
      return LocalOfferOutlinedIcon;

    case 'reviews':
      return ReviewsOutlinedIcon;

    case 'contact':
      return ContactSupportOutlinedIcon;

    default:
      return ArrowOutwardRoundedIcon;
  }
}

/* =========================================================
   FOOTER
========================================================= */

export default function Footer({
  content = initialFooterContent,
}: FooterProps) {
  if (content.enabled === false) {
    return null;
  }

  const topActions = (
    content.topCta?.actions ?? []
  ).filter(
    (item) =>
      item.enabled !== false &&
      Boolean(item.label?.trim()) &&
      Boolean(item.href?.trim()),
  );

  const exploreLinks =
    getVisibleLinks(
      content.explore?.links,
    );

  const experienceLinks =
    getVisibleLinks(
      content.experience?.links,
    );

  const legalLinks =
    getVisibleLinks(
      content.legal?.links,
    );

  const copyrightName =
    content.legal?.copyrightName?.trim() ||
    'Harmony Dining & Event Center';

  return (
    <Box
      component="footer"
      sx={{
        bgcolor:
          'background.default',

        color:
          'text.primary',

        borderTop:
          '1px solid',

        borderColor:
          'divider',
      }}
    >
      <Container maxWidth="xl">

        {/* =====================================================
            TOP CTA
        ===================================================== */}

        {content.topCta?.enabled !==
          false &&
          (Boolean(
            content.topCta?.title?.trim(),
          ) ||
            Boolean(
              content.topCta?.eyebrow?.trim(),
            ) ||
            topActions.length > 0) && (
            <Box
              sx={{
                py: {
                  xs: 2.25,
                  sm: 2.75,
                  md: 3.5,
                },

                display: 'grid',

                gridTemplateColumns: {
                  xs: '1fr',
                  md:
                    'minmax(0,1fr) auto',
                },

                alignItems:
                  'center',

                gap: {
                  xs: 1.4,
                  md: 3,
                },

                borderBottom:
                  '1px solid',

                borderColor:
                  'divider',
              }}
            >
              <Box>
                {content.topCta
                  ?.eyebrow && (
                  <Typography
                    variant="overline"
                    component="p"
                    sx={{
                      m: 0,

                      color:
                        'secondary.dark',
                    }}
                  >
                    {
                      content.topCta
                        .eyebrow
                    }
                  </Typography>
                )}

                {content.topCta
                  ?.title && (
                  <Typography
                    component="h2"
                    variant="h4"
                    sx={{
                      mt: content
                        .topCta
                        ?.eyebrow
                        ? 0.35
                        : 0,

                      maxWidth:
                        600,
                    }}
                  >
                    {
                      content.topCta
                        .title
                    }
                  </Typography>
                )}
              </Box>

              {topActions.length >
                0 && (
                <Stack
                  direction="row"
                  sx={{
                    flexWrap:
                      'wrap',

                    gap: 1,
                  }}
                >
                  {topActions.map(
                    (action) => {
                      const isEvent =
                        action.type ===
                        'event';

                      return (
                        <Link
                          key={
                            action.id
                          }
                          href={
                            action.href
                          }
                          style={{
                            textDecoration:
                              'none',
                          }}
                        >
                          <Button
                            variant={
                              isEvent
                                ? 'contained'
                                : 'outlined'
                            }
                            disableElevation
                            startIcon={
                              isEvent ? (
                                <CelebrationRoundedIcon />
                              ) : (
                                <CalendarMonthRoundedIcon />
                              )
                            }
                            sx={{
                              minHeight:
                                42,

                              px: {
                                xs: 1.4,
                                sm: 2,
                              },

                              fontWeight:
                                700,

                              whiteSpace:
                                'nowrap',
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
              )}
            </Box>
          )}

        {/* =====================================================
            MAIN FOOTER
        ===================================================== */}

        <Box
          sx={{
            py: {
              xs: 2.75,
              md: 4,
            },

            display: 'grid',

            gridTemplateColumns: {
              xs:
                'repeat(2, minmax(0, 1fr))',

              md:
                'minmax(260px,1.4fr) minmax(130px,0.6fr) minmax(130px,0.6fr) minmax(250px,0.9fr)',
            },

            columnGap: {
              xs: 1.6,
              md: 4,
            },

            rowGap: {
              xs: 2.4,
              md: 3,
            },

            alignItems:
              'start',
          }}
        >
          {/* =================================================
              BRAND
          ================================================= */}

          <Box
            sx={{
              gridColumn: {
                xs: '1 / -1',
                md: 'auto',
              },

              maxWidth: 390,

              minWidth: 0,
            }}
          >
            <Link
              href="/"
              aria-label="Harmony Dining & Event Center home"
              style={{
                color: 'inherit',
                textDecoration: 'none',
              }}
            >
              <Box
                sx={{
                  display: 'flex',

                  alignItems:
                    'center',

                  gap: 1,

                  minWidth: 0,
                }}
              >
                {content.brand
                  ?.logoSrc && (
                  <Box
                    sx={{
                      position:
                        'relative',

                      width: {
                        xs: 46,
                        md: 54,
                      },

                      height: {
                        xs: 46,
                        md: 54,
                      },

                      flexShrink: 0,

                      overflow:
                        'hidden',

                      borderRadius: 1,

                      border:
                        '1px solid',

                      borderColor:
                        'divider',

                      bgcolor:
                        'background.paper',
                    }}
                  >
                    <Image
                      src={
                        content.brand
                          .logoSrc
                      }
                      alt={
                        content.brand
                          .logoAlt ??
                        ''
                      }
                      fill
                      sizes="54px"
                      style={{
                        objectFit:
                          'cover',
                      }}
                    />
                  </Box>
                )}

                <Box
                  sx={{
                    minWidth: 0,
                  }}
                >
                  {content.brand
                    ?.name && (
                    <Typography
                      variant="subtitle1"
                      sx={{
                        color:
                          'primary.main',

                        fontWeight:
                          800,

                        lineHeight: 1,

                        letterSpacing:
                          '0.035em',
                      }}
                    >
                      {
                        content.brand
                          .name
                      }
                    </Typography>
                  )}

                  {content.brand
                    ?.subtitle && (
                    <Typography
                      variant="caption"
                      sx={{
                        display:
                          'block',

                        mt: 0.35,

                        color:
                          'text.secondary',

                        fontWeight:
                          700,

                        letterSpacing:
                          '0.06em',
                      }}
                    >
                      {
                        content.brand
                          .subtitle
                      }
                    </Typography>
                  )}
                </Box>
              </Box>
            </Link>

            {content.brand
              ?.description && (
              <Typography
                variant="body2"
                sx={{
                  mt: 1.2,

                  maxWidth:
                    350,

                  color:
                    'text.secondary',

                  lineHeight:
                    1.6,
                }}
              >
                {
                  content.brand
                    .description
                }
              </Typography>
            )}

            {/* =================================================
                SOCIAL MEDIA
            ================================================= */}

            <Box
              sx={{
                mt: 1.75,
              }}
            >
              <Typography
                variant="overline"
                component="p"
                sx={{
                  m: 0,

                  color:
                    'secondary.dark',
                }}
              >
                Follow Harmony
              </Typography>

              <Stack
                direction="row"
                sx={{
                  mt: 0.7,

                  gap: 0.7,

                  flexWrap:
                    'wrap',
                }}
              >
                {socialLinks.map(
                  ({
                    label,
                    href,
                    icon: Icon,
                    color,
                  }) => (
                    <Box
                      key={label}
                      component="a"
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`Visit Harmony on ${label}`}
                      sx={{
                        width: 38,
                        height: 38,

                        display:
                          'grid',

                        placeItems:
                          'center',

                        borderRadius:
                          '50%',

                        bgcolor:
                          'background.paper',

                        color,

                        border:
                          '1px solid',

                        borderColor:
                          'divider',

                        boxShadow: 1,

                        textDecoration:
                          'none',

                        transition:
                          'transform 160ms ease, border-color 160ms ease',

                        '&:hover':
                          {
                            transform:
                              'translateY(-2px)',

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
                      <Icon
                        size={17}
                        aria-hidden
                      />
                    </Box>
                  ),
                )}
              </Stack>
            </Box>
          </Box>

          {/* =================================================
              EXPLORE
          ================================================= */}

          <Box
            sx={{
              minWidth: 0,
            }}
          >
            <Typography
              variant="overline"
              component="p"
              sx={{
                m: 0,

                color:
                  'secondary.dark',
              }}
            >
              {content.explore
                ?.title ??
                'Explore'}
            </Typography>

            <Stack
              sx={{
                mt: 0.8,

                gap: {
                  xs: 0.25,
                  md: 0.55,
                },
              }}
            >
              {exploreLinks.map(
                (item) => {
                  const Icon =
                    getFooterLinkIcon(
                      item.id,
                    );

                  return (
                    <Link
                      key={
                        item.id
                      }
                      href={
                        item.href
                      }
                      style={{
                        color:
                          'inherit',

                        textDecoration:
                          'none',
                      }}
                    >
                      <Box
                        sx={{
                          display:
                            'flex',

                          alignItems:
                            'center',

                          gap: 0.65,

                          minHeight:
                            32,

                          color:
                            'text.secondary',

                          transition:
                            'color 160ms ease',

                          '&:hover':
                            {
                              color:
                                'text.primary',
                            },

                          '@media (prefers-reduced-motion: reduce)':
                            {
                              transition:
                                'none',
                            },
                        }}
                      >
                        <Icon
                          aria-hidden
                          sx={{
                            fontSize:
                              16,

                            color:
                              'secondary.dark',

                            flexShrink:
                              0,
                          }}
                        />

                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight:
                              600,
                          }}
                        >
                          {
                            item.label
                          }
                        </Typography>
                      </Box>
                    </Link>
                  );
                },
              )}
            </Stack>
          </Box>

          {/* =================================================
              EXPERIENCE
          ================================================= */}

          <Box
            sx={{
              minWidth: 0,
            }}
          >
            <Typography
              variant="overline"
              component="p"
              sx={{
                m: 0,

                color:
                  'secondary.dark',
              }}
            >
              {content.experience
                ?.title ??
                'Experience'}
            </Typography>

            <Stack
              sx={{
                mt: 0.8,

                gap: {
                  xs: 0.25,
                  md: 0.55,
                },
              }}
            >
              {experienceLinks.map(
                (item) => {
                  const Icon =
                    getFooterLinkIcon(
                      item.id,
                    );

                  return (
                    <Link
                      key={
                        item.id
                      }
                      href={
                        item.href
                      }
                      style={{
                        color:
                          'inherit',

                        textDecoration:
                          'none',
                      }}
                    >
                      <Box
                        sx={{
                          display:
                            'flex',

                          alignItems:
                            'center',

                          gap: 0.65,

                          minHeight:
                            32,

                          color:
                            'text.secondary',

                          transition:
                            'color 160ms ease',

                          '&:hover':
                            {
                              color:
                                'text.primary',
                            },

                          '@media (prefers-reduced-motion: reduce)':
                            {
                              transition:
                                'none',
                            },
                        }}
                      >
                        <Icon
                          aria-hidden
                          sx={{
                            fontSize:
                              16,

                            color:
                              'secondary.dark',

                            flexShrink:
                              0,
                          }}
                        />

                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight:
                              600,
                          }}
                        >
                          {
                            item.label
                          }
                        </Typography>
                      </Box>
                    </Link>
                  );
                },
              )}
            </Stack>
          </Box>

          {/* =================================================
              VISIT HARMONY
          ================================================= */}

          <Box
            sx={{
              gridColumn: {
                xs: '1 / -1',
                md: 'auto',
              },

              minWidth: 0,
            }}
          >
            <Typography
              variant="overline"
              component="p"
              sx={{
                m: 0,

                color:
                  'secondary.dark',
              }}
            >
              {content.visit
                ?.title ??
                'Visit Harmony'}
            </Typography>

            <Box
              sx={{
                mt: 0.8,

                display: 'grid',

                gridTemplateColumns: {
                  xs:
                    'repeat(2, minmax(0,1fr))',

                  md: '1fr',
                },

                gap: {
                  xs: 1,
                  md: 1.1,
                },
              }}
            >
              {/* LOCATION */}

              {content.visit
                ?.location
                ?.enabled !==
                false &&
                Boolean(
                  content.visit
                    ?.location
                    ?.primary,
                ) && (
                  <Link
                    href={
                      content.visit
                        ?.location
                        ?.href ??
                      '/#location'
                    }
                    style={{
                      color:
                        'inherit',

                      textDecoration:
                        'none',
                    }}
                  >
                    <Box
                      sx={{
                        display:
                          'flex',

                        gap: 0.75,

                        alignItems:
                          'center',

                        minWidth: 0,
                      }}
                    >
                      <Box
                        aria-hidden
                        sx={{
                          width: 34,
                          height: 34,

                          flexShrink:
                            0,

                          display:
                            'grid',

                          placeItems:
                            'center',

                          borderRadius:
                            '50%',

                          bgcolor:
                            'action.hover',

                          color:
                            'secondary.dark',
                        }}
                      >
                        <LocationOnRoundedIcon
                          sx={{
                            fontSize:
                              18,
                          }}
                        />
                      </Box>

                      <Box
                        sx={{
                          minWidth: 0,
                        }}
                      >
                        <Typography
                          variant="caption"
                          sx={{
                            display:
                              'block',

                            color:
                              'text.primary',

                            fontWeight:
                              700,
                          }}
                        >
                          {
                            content
                              .visit
                              ?.location
                              ?.primary
                          }
                        </Typography>

                        <Typography
                          variant="caption"
                          sx={{
                            display:
                              'block',

                            color:
                              'text.secondary',
                          }}
                        >
                          Directions
                        </Typography>
                      </Box>
                    </Box>
                  </Link>
                )}

              {/* HOURS */}

              {content.visit
                ?.hours?.enabled !==
                false &&
                Boolean(
                  content.visit
                    ?.hours
                    ?.primary,
                ) && (
                  <Box
                    sx={{
                      display:
                        'flex',

                      gap: 0.75,

                      alignItems:
                        'center',

                      minWidth: 0,
                    }}
                  >
                    <Box
                      aria-hidden
                      sx={{
                        width: 34,
                        height: 34,

                        flexShrink:
                          0,

                        display:
                          'grid',

                        placeItems:
                          'center',

                        borderRadius:
                          '50%',

                        bgcolor:
                          'action.hover',

                        color:
                          'secondary.dark',
                      }}
                    >
                      <AccessTimeRoundedIcon
                        sx={{
                          fontSize: 18,
                        }}
                      />
                    </Box>

                    <Box
                      sx={{
                        minWidth: 0,
                      }}
                    >
                      <Typography
                        variant="caption"
                        sx={{
                          display:
                            'block',

                          color:
                            'text.primary',

                          fontWeight:
                            700,
                        }}
                      >
                        {
                          content
                            .visit
                            ?.hours
                            ?.primary
                        }
                      </Typography>

                      <Typography
                        variant="caption"
                        sx={{
                          display:
                            'block',

                          color:
                            'text.secondary',
                        }}
                      >
                        Contact us
                      </Typography>
                    </Box>
                  </Box>
                )}
            </Box>

            {/* CONTACT */}

            {content.visit
              ?.contact?.enabled !==
              false &&
              content.visit
                ?.contact?.href &&
              content.visit
                ?.contact?.label && (
                <Link
                  href={
                    content.visit
                      .contact
                      .href
                  }
                  style={{
                    display:
                      'inline-flex',

                    marginTop: 10,

                    textDecoration:
                      'none',
                  }}
                >
                  <Button
                    variant="text"
                    endIcon={
                      <ArrowOutwardRoundedIcon />
                    }
                    sx={{
                      p: 0,

                      minHeight:
                        'auto',

                      color:
                        'secondary.dark',

                      fontWeight:
                        700,

                      '&:hover': {
                        bgcolor:
                          'transparent',

                        color:
                          'text.primary',
                      },
                    }}
                  >
                    {
                      content.visit
                        .contact
                        .label
                    }
                  </Button>
                </Link>
              )}
          </Box>
        </Box>

        {/* =====================================================
            BOTTOM LEGAL
        ===================================================== */}

        <Box
          sx={{
            py: {
              xs: 1.5,
              md: 1.8,
            },

            display: 'flex',

            flexDirection: {
              xs: 'column',
              sm: 'row',
            },

            justifyContent:
              'space-between',

            alignItems: {
              xs: 'center',
              sm: 'center',
            },

            gap: 0.9,

            borderTop:
              '1px solid',

            borderColor:
              'divider',
          }}
        >
          <Typography
            variant="caption"
            sx={{
              color:
                'text.secondary',

              textAlign: {
                xs: 'center',
                sm: 'left',
              },

              opacity: 0.8,
            }}
          >
            ©{' '}
            {new Date().getFullYear()}{' '}
            {copyrightName}. All rights
            reserved.
          </Typography>

          {legalLinks.length >
            0 && (
            <Stack
              direction="row"
              sx={{
                flexWrap:
                  'wrap',

                justifyContent:
                  'center',

                gap: {
                  xs: 1.2,
                  sm: 1.6,
                },
              }}
            >
              {legalLinks.map(
                (item) => (
                  <Link
                    key={
                      item.id
                    }
                    href={
                      item.href
                    }
                    style={{
                      textDecoration:
                        'none',
                    }}
                  >
                    <Typography
                      variant="caption"
                      sx={{
                        color:
                          'text.secondary',

                        opacity: 0.8,

                        transition:
                          'color 160ms ease, opacity 160ms ease',

                        '&:hover':
                          {
                            color:
                              'text.primary',

                            opacity:
                              1,
                          },

                        '@media (prefers-reduced-motion: reduce)':
                          {
                            transition:
                              'none',
                          },
                      }}
                    >
                      {
                        item.label
                      }
                    </Typography>
                  </Link>
                ),
              )}
            </Stack>
          )}
        </Box>
      </Container>
    </Box>
  );
}