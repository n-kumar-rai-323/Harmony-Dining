import Image from 'next/image';
import Link from 'next/link';

import {
  Box,
  Button,
  Container,
  Typography,
} from '@mui/material';

import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded';
import CelebrationRoundedIcon from '@mui/icons-material/CelebrationRounded';
import ArrowOutwardRoundedIcon from '@mui/icons-material/ArrowOutwardRounded';
import LocationOnRoundedIcon from '@mui/icons-material/LocationOnRounded';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';

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
   Admin Dashboard -> NestJS API -> PostgreSQL

   Content can change without changing the visual system.
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
        id: 'reserve-table',
        label: 'Reserve a Table',
        href: '/reservation',
        type: 'reservation',
        enabled: true,
      },
      {
        id: 'reserve-event',
        label: 'Plan an Event',
        href: '/events#enquiry',
        type: 'event',
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
      'Thoughtful dining, warm hospitality and memorable celebrations brought together in one Harmony experience.',
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
        href: '/offers',
        enabled: true,
      },
      {
        id: 'reviews',
        label: 'Reviews',
        href: '/reviews',
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
      primary: 'Kathmandu, Nepal',
      secondary:
        'View location & directions',
      href: '/#location',
    },

    hours: {
      enabled: true,
      primary: 'Opening Hours',
      secondary:
        'Available on our contact page',
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

  const showBrand =
    Boolean(
      content.brand?.logoSrc?.trim(),
    ) ||
    Boolean(
      content.brand?.name?.trim(),
    ) ||
    Boolean(
      content.brand?.subtitle?.trim(),
    ) ||
    Boolean(
      content.brand?.description?.trim(),
    );

  const showExplore =
    content.explore?.enabled !==
      false &&
    (Boolean(
      content.explore?.title?.trim(),
    ) ||
      exploreLinks.length > 0);

  const showExperience =
    content.experience?.enabled !==
      false &&
    (Boolean(
      content.experience?.title?.trim(),
    ) ||
      experienceLinks.length > 0);

  const showLocation =
    content.visit?.location
      ?.enabled !== false &&
    Boolean(
      content.visit?.location
        ?.primary?.trim() ||
        content.visit?.location
          ?.secondary?.trim(),
    );

  const showHours =
    content.visit?.hours
      ?.enabled !== false &&
    Boolean(
      content.visit?.hours
        ?.primary?.trim() ||
        content.visit?.hours
          ?.secondary?.trim(),
    );

  const showContact =
    content.visit?.contact
      ?.enabled !== false &&
    Boolean(
      content.visit?.contact
        ?.label?.trim(),
    ) &&
    Boolean(
      content.visit?.contact
        ?.href?.trim(),
    );

  const showVisit =
    content.visit?.enabled !==
      false &&
    (Boolean(
      content.visit?.title?.trim(),
    ) ||
      showLocation ||
      showHours ||
      showContact);

  const copyrightName =
    content.legal
      ?.copyrightName?.trim() ||
    'Harmony Dining & Event Center';

  return (
    <Box
      component="footer"
      sx={{
        bgcolor:
          'background.default',

        color: 'text.primary',

        borderTop: '1px solid',
        borderColor: 'divider',

        transition:
          'background-color 220ms ease, color 220ms ease, border-color 220ms ease',

        '@media (prefers-reduced-motion: reduce)': {
          transition: 'none',
        },
      }}
    >
      <Container maxWidth="xl">
        {/* =================================================
            TOP CTA
        ================================================== */}

        {content.topCta
          ?.enabled !== false &&
          (Boolean(
            content.topCta
              ?.eyebrow?.trim(),
          ) ||
            Boolean(
              content.topCta
                ?.title?.trim(),
            ) ||
            topActions.length >
              0) && (
            <Box
              sx={{
                py: {
                  xs: 3.5,
                  sm: 4,
                  md: 4.5,
                },

                display: 'grid',

                gridTemplateColumns:
                  {
                    xs: '1fr',
                    md: 'minmax(0,1fr) auto',
                  },

                alignItems:
                  'center',

                gap: {
                  xs: 2.2,
                  md: 4,
                },

                borderBottom:
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
                {content.topCta
                  ?.eyebrow && (
                  <Typography
                    variant="overline"
                    sx={{
                      display:
                        'block',

                      color:
                        'secondary.dark',

                      overflowWrap:
                        'break-word',
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
                    variant="h3"
                    sx={{
                      mt: content
                        .topCta
                        ?.eyebrow
                        ? 0.7
                        : 0,

                      maxWidth: 650,

                      color:
                        'text.primary',

                      overflowWrap:
                        'break-word',
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
                <Box
                  sx={{
                    display:
                      'flex',

                    flexDirection:
                      {
                        xs: 'column',
                        sm: 'row',
                      },

                    gap: 1,

                    minWidth: 0,
                  }}
                >
                  {topActions.map(
                    (action) => {
                      const isReservation =
                        action.type ===
                        'reservation';

                      return (
                        <Box
                          key={
                            action.id
                          }
                          sx={{
                            width: {
                              xs: '100%',
                              sm: 'auto',
                            },

                            minWidth: 0,
                          }}
                        >
                          <Link
                            href={
                              action.href
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
                                isReservation
                                  ? 'contained'
                                  : 'outlined'
                              }
                              startIcon={
                                isReservation ? (
                                  <CalendarMonthRoundedIcon
                                    aria-hidden
                                    sx={{
                                      fontSize:
                                        '19px !important',
                                    }}
                                  />
                                ) : (
                                  <CelebrationRoundedIcon
                                    aria-hidden
                                    sx={{
                                      fontSize:
                                        '19px !important',
                                    }}
                                  />
                                )
                              }
                              sx={{
                                minHeight:
                                  46,

                                px: 2.2,

                                bgcolor:
                                  isReservation
                                    ? 'secondary.main'
                                    : 'transparent',

                                color:
                                  isReservation
                                    ? 'secondary.contrastText'
                                    : 'text.primary',

                                borderColor:
                                  !isReservation
                                    ? 'divider'
                                    : undefined,

                                fontWeight:
                                  700,

                                whiteSpace:
                                  {
                                    xs: 'normal',
                                    sm: 'nowrap',
                                  },

                                overflowWrap:
                                  'break-word',

                                '&:hover':
                                  isReservation
                                    ? {
                                        bgcolor:
                                          'secondary.light',
                                      }
                                    : {
                                        borderColor:
                                          'secondary.main',

                                        bgcolor:
                                          'action.hover',
                                      },
                              }}
                            >
                              {
                                action.label
                              }
                            </Button>
                          </Link>
                        </Box>
                      );
                    },
                  )}
                </Box>
              )}
            </Box>
          )}

        {/* =================================================
            MAIN FOOTER
        ================================================== */}

        <Box
          sx={{
            py: {
              xs: 4.5,
              md: 5,
            },

            display: 'grid',

            gridTemplateColumns:
              {
                xs: '1fr',

                sm: 'minmax(0,1.3fr) minmax(130px,0.65fr) minmax(130px,0.65fr)',

                lg: 'minmax(300px,1.45fr) minmax(140px,0.55fr) minmax(140px,0.55fr) minmax(260px,0.9fr)',
              },

            gap: {
              xs: 3.8,
              sm: 3.5,
              lg: 5,
            },

            alignItems:
              'start',
          }}
        >
          {/* =================================================
              BRAND
          ================================================== */}

          {showBrand && (
            <Box
              sx={{
                maxWidth: 380,
                minWidth: 0,
              }}
            >
              {(content.brand
                ?.logoSrc ||
                content.brand
                  ?.name ||
                content.brand
                  ?.subtitle) && (
                <Link
                  href="/"
                  aria-label="Harmony Dining & Event Center home"
                  style={{
                    width:
                      'fit-content',

                    maxWidth:
                      '100%',

                    display:
                      'block',

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

                      gap: 1.25,

                      minWidth: 0,
                    }}
                  >
                    {content.brand
                      ?.logoSrc && (
                      <Box
                        sx={{
                          position:
                            'relative',

                          width: 58,

                          height: 58,

                          flexShrink:
                            0,

                          overflow:
                            'hidden',

                          borderRadius:
                            1,

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
                            content
                              .brand
                              .logoSrc
                          }
                          alt={
                            content
                              .brand
                              .logoAlt ??
                            ''
                          }
                          fill
                          sizes="58px"
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
                              'secondary.dark',

                            fontWeight:
                              800,

                            letterSpacing:
                              '0.035em',

                            lineHeight:
                              1,

                            overflowWrap:
                              'break-word',
                          }}
                        >
                          {
                            content
                              .brand
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

                            mt: content
                              .brand
                              ?.name
                              ? 0.4
                              : 0,

                            color:
                              'text.secondary',

                            fontWeight:
                              700,

                            letterSpacing:
                              '0.07em',

                            overflowWrap:
                              'break-word',
                          }}
                        >
                          {
                            content
                              .brand
                              .subtitle
                          }
                        </Typography>
                      )}
                    </Box>
                  </Box>
                </Link>
              )}

              {content.brand
                ?.description && (
                <Typography
                  variant="body2"
                  sx={{
                    mt: 1.8,

                    maxWidth: 350,

                    color:
                      'text.secondary',

                    overflowWrap:
                      'break-word',
                  }}
                >
                  {
                    content.brand
                      .description
                  }
                </Typography>
              )}
            </Box>
          )}

          {/* =================================================
              EXPLORE
          ================================================== */}

          {showExplore && (
            <Box
              sx={{
                minWidth: 0,
              }}
            >
              {content.explore
                ?.title && (
                <Typography
                  variant="overline"
                  sx={{
                    display:
                      'block',

                    color:
                      'secondary.dark',

                    overflowWrap:
                      'break-word',
                  }}
                >
                  {
                    content.explore
                      .title
                  }
                </Typography>
              )}

              {exploreLinks.length >
                0 && (
                <Box
                  component="nav"
                  aria-label="Footer explore navigation"
                  sx={{
                    mt: content
                      .explore
                      ?.title
                      ? 1.5
                      : 0,

                    display:
                      'grid',

                    gap: 0.9,
                  }}
                >
                  {exploreLinks.map(
                    (item) => (
                      <Link
                        key={
                          item.id
                        }
                        href={
                          item.href
                        }
                        style={{
                          width:
                            'fit-content',

                          maxWidth:
                            '100%',

                          textDecoration:
                            'none',
                        }}
                      >
                        <Typography
                          variant="body2"
                          sx={{
                            color:
                              'text.secondary',

                            fontWeight:
                              600,

                            overflowWrap:
                              'break-word',

                            transition:
                              'color 180ms ease',

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
                          {
                            item.label
                          }
                        </Typography>
                      </Link>
                    ),
                  )}
                </Box>
              )}
            </Box>
          )}

          {/* =================================================
              EXPERIENCE
          ================================================== */}

          {showExperience && (
            <Box
              sx={{
                minWidth: 0,
              }}
            >
              {content.experience
                ?.title && (
                <Typography
                  variant="overline"
                  sx={{
                    display:
                      'block',

                    color:
                      'secondary.dark',

                    overflowWrap:
                      'break-word',
                  }}
                >
                  {
                    content
                      .experience
                      .title
                  }
                </Typography>
              )}

              {experienceLinks.length >
                0 && (
                <Box
                  component="nav"
                  aria-label="Footer experience navigation"
                  sx={{
                    mt: content
                      .experience
                      ?.title
                      ? 1.5
                      : 0,

                    display:
                      'grid',

                    gap: 0.9,
                  }}
                >
                  {experienceLinks.map(
                    (item) => (
                      <Link
                        key={
                          item.id
                        }
                        href={
                          item.href
                        }
                        style={{
                          width:
                            'fit-content',

                          maxWidth:
                            '100%',

                          textDecoration:
                            'none',
                        }}
                      >
                        <Typography
                          variant="body2"
                          sx={{
                            color:
                              'text.secondary',

                            fontWeight:
                              600,

                            overflowWrap:
                              'break-word',

                            transition:
                              'color 180ms ease',

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
                          {
                            item.label
                          }
                        </Typography>
                      </Link>
                    ),
                  )}
                </Box>
              )}
            </Box>
          )}

          {/* =================================================
              VISIT
          ================================================== */}

          {showVisit && (
            <Box
              sx={{
                gridColumn: {
                  xs: 'auto',
                  sm: '1 / -1',
                  lg: 'auto',
                },

                minWidth: 0,
              }}
            >
              {content.visit
                ?.title && (
                <Typography
                  variant="overline"
                  sx={{
                    display:
                      'block',

                    color:
                      'secondary.dark',

                    overflowWrap:
                      'break-word',
                  }}
                >
                  {
                    content.visit
                      .title
                  }
                </Typography>
              )}

              <Box
                sx={{
                  mt: content
                    .visit
                    ?.title
                    ? 1.5
                    : 0,

                  display:
                    'grid',

                  gap: 1.3,

                  maxWidth: 330,
                }}
              >
                {/* LOCATION */}

                {showLocation && (
                  <Box
                    sx={{
                      display:
                        'grid',

                      gridTemplateColumns:
                        '36px minmax(0,1fr)',

                      gap: 1,

                      alignItems:
                        'center',
                    }}
                  >
                    <Box
                      aria-hidden
                      sx={{
                        width: 36,

                        height: 36,

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
                      {content.visit
                        ?.location
                        ?.href ? (
                        <Link
                          href={
                            content
                              .visit
                              .location
                              .href
                          }
                          style={{
                            color:
                              'inherit',

                            textDecoration:
                              'none',
                          }}
                        >
                          {content
                            .visit
                            .location
                            .primary && (
                            <Typography
                              variant="subtitle2"
                              sx={{
                                color:
                                  'text.primary',

                                overflowWrap:
                                  'break-word',
                              }}
                            >
                              {
                                content
                                  .visit
                                  .location
                                  .primary
                              }
                            </Typography>
                          )}

                          {content
                            .visit
                            .location
                            .secondary && (
                            <Typography
                              variant="caption"
                              sx={{
                                display:
                                  'block',

                                mt: 0.1,

                                color:
                                  'text.secondary',

                                overflowWrap:
                                  'break-word',
                              }}
                            >
                              {
                                content
                                  .visit
                                  .location
                                  .secondary
                              }
                            </Typography>
                          )}
                        </Link>
                      ) : (
                        <>
                          {content
                            .visit
                            ?.location
                            ?.primary && (
                            <Typography
                              variant="subtitle2"
                              sx={{
                                color:
                                  'text.primary',

                                overflowWrap:
                                  'break-word',
                              }}
                            >
                              {
                                content
                                  .visit
                                  .location
                                  .primary
                              }
                            </Typography>
                          )}

                          {content
                            .visit
                            ?.location
                            ?.secondary && (
                            <Typography
                              variant="caption"
                              sx={{
                                display:
                                  'block',

                                mt: 0.1,

                                color:
                                  'text.secondary',

                                overflowWrap:
                                  'break-word',
                              }}
                            >
                              {
                                content
                                  .visit
                                  .location
                                  .secondary
                              }
                            </Typography>
                          )}
                        </>
                      )}
                    </Box>
                  </Box>
                )}

                {/* HOURS */}

                {showHours && (
                  <Box
                    sx={{
                      display:
                        'grid',

                      gridTemplateColumns:
                        '36px minmax(0,1fr)',

                      gap: 1,

                      alignItems:
                        'center',
                    }}
                  >
                    <Box
                      aria-hidden
                      sx={{
                        width: 36,

                        height: 36,

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
                      {content.visit
                        ?.hours
                        ?.primary && (
                        <Typography
                          variant="subtitle2"
                          sx={{
                            color:
                              'text.primary',

                            overflowWrap:
                              'break-word',
                          }}
                        >
                          {
                            content
                              .visit
                              .hours
                              .primary
                          }
                        </Typography>
                      )}

                      {content.visit
                        ?.hours
                        ?.secondary && (
                        <Typography
                          variant="caption"
                          sx={{
                            display:
                              'block',

                            mt: 0.1,

                            color:
                              'text.secondary',

                            overflowWrap:
                              'break-word',
                          }}
                        >
                          {
                            content
                              .visit
                              .hours
                              .secondary
                          }
                        </Typography>
                      )}
                    </Box>
                  </Box>
                )}

                {/* CONTACT */}

                {showContact && (
                  <Link
                    href={
                      content.visit
                        ?.contact
                        ?.href ?? '#'
                    }
                    style={{
                      width:
                        'fit-content',

                      maxWidth:
                        '100%',

                      textDecoration:
                        'none',
                    }}
                  >
                    <Button
                      variant="text"
                      endIcon={
                        <ArrowOutwardRoundedIcon
                          aria-hidden
                        />
                      }
                      sx={{
                        minHeight:
                          'auto',

                        p: 0,

                        justifyContent:
                          'flex-start',

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
                          ?.contact
                          ?.label
                      }
                    </Button>
                  </Link>
                )}
              </Box>
            </Box>
          )}
        </Box>

        {/* =================================================
            BOTTOM
        ================================================== */}

        <Box
          sx={{
            py: 2,

            display: 'flex',

            flexDirection: {
              xs: 'column',
              sm: 'row',
            },

            justifyContent:
              'space-between',

            alignItems: {
              xs: 'flex-start',
              sm: 'center',
            },

            gap: 1.2,

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

              opacity: 0.72,

              overflowWrap:
                'break-word',
            }}
          >
            ©{' '}
            {new Date().getFullYear()}{' '}
            {copyrightName}. All
            rights reserved.
          </Typography>

          {legalLinks.length >
            0 && (
            <Box
              component="nav"
              aria-label="Legal navigation"
              sx={{
                display:
                  'flex',

                flexWrap:
                  'wrap',

                gap: {
                  xs: 1.4,
                  sm: 2,
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

                        opacity:
                          0.72,

                        transition:
                          'color 180ms ease, opacity 180ms ease',

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
            </Box>
          )}
        </Box>
      </Container>
    </Box>
  );
}