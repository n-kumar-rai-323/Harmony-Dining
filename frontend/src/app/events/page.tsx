import type { Metadata } from 'next';

import Image from 'next/image';
import Link from 'next/link';

import {
  Box,
  Button,
  Container,
  Stack,
  Typography,
} from '@mui/material';

import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded';
import CelebrationRoundedIcon from '@mui/icons-material/CelebrationRounded';
import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded';
import RestaurantRoundedIcon from '@mui/icons-material/RestaurantRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import PhotoLibraryRoundedIcon from '@mui/icons-material/PhotoLibraryRounded';
import EventSeatRoundedIcon from '@mui/icons-material/EventSeatRounded';
import RestaurantMenuRoundedIcon from '@mui/icons-material/RestaurantMenuRounded';
import SupportAgentRoundedIcon from '@mui/icons-material/SupportAgentRounded';
import LocationOnRoundedIcon from '@mui/icons-material/LocationOnRounded';
import PeopleAltRoundedIcon from '@mui/icons-material/PeopleAltRounded';

import EventEnquiryForm from '@/components/events/event-enquiry-form';

export const metadata: Metadata = {
  title: 'Events',
  description:
    'Celebrate birthdays, private gatherings, corporate events and memorable occasions at Harmony Dining & Event Center.',
};

/* =========================================================
   DEVELOPMENT CONTENT

   Future source:
   NestJS Events API + Harmony Admin Dashboard
========================================================= */

const eventTypes = [
  {
    title: 'Birthday Celebrations',
    description:
      'Warm celebrations designed for family, friends and unforgettable birthday moments.',
    icon: CelebrationRoundedIcon,
  },
  {
    title: 'Corporate Events',
    description:
      'Professional spaces for meetings, company dinners and team gatherings.',
    icon: GroupsRoundedIcon,
  },
  {
    title: 'Private Dining',
    description:
      'A more intimate setting for families, friends and special occasions.',
    icon: RestaurantRoundedIcon,
  },
  {
    title: 'Custom Celebrations',
    description:
      'Tell us your idea and our team will help shape the experience around it.',
    icon: AutoAwesomeRoundedIcon,
  },
];

const pastEvents = [
  {
    title: 'Birthday Celebration',
    type: 'Celebration',
    guests: 'Family & Friends',
    image:
      '/images/home/harmony-experience-event.jpg',
    alt:
      'Birthday celebration hosted at Harmony',
  },
  {
    title: 'Banquet Gathering',
    type: 'Private Event',
    guests: 'Group Gathering',
    image:
      '/images/home/harmony-banquet-hall.jpg',
    alt:
      'Banquet event setup at Harmony',
  },
  {
    title: 'Dining Celebration',
    type: 'Dining Event',
    guests: 'Private Dining',
    image:
      '/images/home/harmony-gallery-dining-hall.jpg',
    alt:
      'Dining celebration at Harmony',
  },
];

const harmonyBenefits = [
  {
    title: 'Beautiful Venue',
    description:
      'A polished setting designed for dining, celebrations and memorable gatherings.',
    icon: LocationOnRoundedIcon,
  },
  {
    title: 'Flexible Setup',
    description:
      'Seating and event arrangements can be planned around your guest count.',
    icon: EventSeatRoundedIcon,
  },
  {
    title: 'Dining Together',
    description:
      'Coordinate your event experience with Harmony food and beverage options.',
    icon: RestaurantMenuRoundedIcon,
  },
  {
    title: 'Event Support',
    description:
      'Our team helps coordinate the important details before your event is confirmed.',
    icon: SupportAgentRoundedIcon,
  },
];

const enquirySteps = [
  'Share your event details',
  'We check your preferred date',
  'Our team contacts you',
  'Confirm the final plan',
];

export default function EventsPage() {
  return (
    <Box
      component="main"
      sx={{
        minHeight: '100vh',
        bgcolor: 'background.default',
        color: 'text.primary',
      }}
    >
      {/* =====================================================
          HERO
      ===================================================== */}

      <Box
        component="section"
        sx={{
          pt: {
            xs: 2,
            sm: 3,
            md: 4,
          },
          pb: {
            xs: 5,
            md: 7,
          },
        }}
      >
        <Container maxWidth="lg">
          <Box
            sx={{
              position: 'relative',
              minHeight: {
                xs: 600,
                sm: 620,
                md: 650,
              },
              overflow: 'hidden',
              borderRadius: {
                xs: 2,
                md: 3,
              },
              border: '1px solid',
              borderColor: 'divider',
              bgcolor: 'primary.dark',
            }}
          >
            <Image
              src="/images/home/harmony-experience-event.jpg"
              alt="Celebration event at Harmony Dining and Event Center"
              fill
              priority
              quality={80}
              sizes="(max-width: 1200px) 100vw, 1200px"
              style={{
                objectFit: 'cover',
                objectPosition: 'center',
              }}
            />

            {/* Theme-based image overlay */}
            <Box
              aria-hidden
              sx={{
                position: 'absolute',
                inset: 0,
                bgcolor: 'primary.dark',
                opacity: {
                  xs: 0.74,
                  md: 0.67,
                },
              }}
            />

            <Box
              sx={{
                position: 'relative',
                zIndex: 1,

                minHeight: {
                  xs: 600,
                  sm: 620,
                  md: 650,
                },

                display: 'flex',
                alignItems: 'center',

                px: {
                  xs: 2.5,
                  sm: 4,
                  md: 7,
                },

                py: {
                  xs: 5,
                  md: 7,
                },
              }}
            >
              <Box
                sx={{
                  maxWidth: 720,
                }}
              >
                <Typography
                  variant="overline"
                  sx={{
                    color: 'secondary.light',
                  }}
                >
                  Events at Harmony
                </Typography>

                <Typography
                  component="h1"
                  variant="h1"
                  sx={{
                    mt: 1,
                    maxWidth: 700,
                    color: 'primary.contrastText',
                  }}
                >
                  Celebrate beautifully.
                </Typography>

                <Typography
                  variant="h4"
                  sx={{
                    mt: 0.5,
                    maxWidth: 650,
                    color: 'secondary.light',
                  }}
                >
                  Host effortlessly.
                </Typography>

                <Typography
                  variant="body1"
                  sx={{
                    mt: 2.5,
                    maxWidth: 580,
                    color: 'primary.contrastText',
                    opacity: 0.82,
                  }}
                >
                  From intimate dinners to bigger
                  celebrations, Harmony brings together
                  beautiful spaces, dining and event
                  support for moments worth remembering.
                </Typography>

                <Stack
                  direction={{
                    xs: 'column',
                    sm: 'row',
                  }}
                  sx={{
                    mt: 4,
                    gap: 1.3,
                    alignItems: {
                      xs: 'stretch',
                      sm: 'center',
                    },
                  }}
                >
                  <Link
                    href="#enquiry"
                    style={{
                      textDecoration: 'none',
                    }}
                  >
                    <Button
                      variant="contained"
                      size="large"
                      startIcon={
                        <CalendarMonthRoundedIcon />
                      }
                      endIcon={
                        <ArrowForwardRoundedIcon />
                      }
                      sx={{
                        minHeight: 52,
                        px: 3,
                        width: {
                          xs: '100%',
                          sm: 'auto',
                        },
                      }}
                    >
                      Plan Your Event
                    </Button>
                  </Link>

                  <Link
                    href="#past-events"
                    style={{
                      textDecoration: 'none',
                    }}
                  >
                    <Button
                      variant="outlined"
                      size="large"
                      startIcon={
                        <PhotoLibraryRoundedIcon />
                      }
                      sx={{
                        minHeight: 52,
                        px: 3,

                        color: 'primary.contrastText',

                        borderColor:
                          'primary.contrastText',

                        width: {
                          xs: '100%',
                          sm: 'auto',
                        },

                        '&:hover': {
                          borderColor:
                            'secondary.light',

                          color:
                            'secondary.light',
                        },
                      }}
                    >
                      View Past Events
                    </Button>
                  </Link>
                </Stack>
              </Box>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* =====================================================
          EVENT TYPES
      ===================================================== */}

      <Box
        component="section"
        id="event-types"
        sx={{
          py: {
            xs: 6,
            md: 8,
          },
        }}
      >
        <Container maxWidth="lg">
          <Box
            sx={{
              maxWidth: 680,
              mb: {
                xs: 3,
                md: 4,
              },
            }}
          >
            <Typography
              variant="overline"
              sx={{
                color: 'secondary.dark',
              }}
            >
              Celebrate Your Way
            </Typography>

            <Typography
              component="h2"
              variant="h2"
              sx={{
                mt: 0.7,
              }}
            >
              An event built around your moment.
            </Typography>

            <Typography
              variant="body1"
              sx={{
                mt: 1.5,
                maxWidth: 610,
                color: 'text.secondary',
              }}
            >
              Choose the occasion you are planning.
              Harmony can help shape the venue, dining
              and event arrangement around your needs.
            </Typography>
          </Box>

          <Box
            sx={{
              display: 'grid',

              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2, minmax(0,1fr))',
                lg: 'repeat(4, minmax(0,1fr))',
              },

              gap: 2,
            }}
          >
            {eventTypes.map((eventType) => {
              const Icon = eventType.icon;

              return (
                <Box
                  key={eventType.title}
                  sx={{
                    p: {
                      xs: 2.4,
                      md: 2.7,
                    },

                    height: '100%',

                    bgcolor: 'background.paper',

                    border: '1px solid',
                    borderColor: 'divider',

                    borderRadius: 2,

                    transition:
                      'transform 180ms ease, border-color 180ms ease, box-shadow 180ms ease',

                    '&:hover': {
                      transform:
                        'translateY(-3px)',

                      borderColor:
                        'secondary.main',

                      boxShadow: 3,
                    },

                    '@media (prefers-reduced-motion: reduce)':
                      {
                        transition: 'none',

                        '&:hover': {
                          transform: 'none',
                        },
                      },
                  }}
                >
                  <Box
                    sx={{
                      width: 50,
                      height: 50,

                      display: 'grid',
                      placeItems: 'center',

                      borderRadius: '50%',

                      bgcolor: 'action.hover',

                      color: 'secondary.dark',
                    }}
                  >
                    <Icon aria-hidden />
                  </Box>

                  <Typography
                    component="h3"
                    variant="h5"
                    sx={{
                      mt: 2,
                    }}
                  >
                    {eventType.title}
                  </Typography>

                  <Typography
                    variant="body2"
                    sx={{
                      mt: 0.8,
                      color: 'text.secondary',
                    }}
                  >
                    {eventType.description}
                  </Typography>
                </Box>
              );
            })}
          </Box>
        </Container>
      </Box>

      {/* =====================================================
          PAST EVENTS
      ===================================================== */}

      <Box
        component="section"
        id="past-events"
        sx={{
          scrollMarginTop: 100,

          py: {
            xs: 7,
            md: 9,
          },

          bgcolor: 'background.paper',

          borderTop: '1px solid',
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Container maxWidth="lg">
          <Box
            sx={{
              display: 'grid',

              gridTemplateColumns: {
                xs: '1fr',

                md:
                  'minmax(0,1fr) auto',
              },

              gap: 2,

              alignItems: 'end',
            }}
          >
            <Box
              sx={{
                maxWidth: 700,
              }}
            >
              <Typography
                variant="overline"
                sx={{
                  color: 'secondary.dark',
                }}
              >
                Past Events
              </Typography>

              <Typography
                component="h2"
                variant="h2"
                sx={{
                  mt: 0.7,
                }}
              >
                Moments we’ve had the pleasure to host.
              </Typography>

              <Typography
                variant="body1"
                sx={{
                  mt: 1.4,
                  maxWidth: 620,
                  color: 'text.secondary',
                }}
              >
                Explore real Harmony spaces and
                celebration-style setups for inspiration
                before planning your own event.
              </Typography>
            </Box>

            <Link
              href="/gallery"
              style={{
                textDecoration: 'none',
              }}
            >
              <Button
                variant="text"
                endIcon={
                  <ArrowForwardRoundedIcon />
                }
              >
                View More Photos
              </Button>
            </Link>
          </Box>

          <Box
            sx={{
              mt: 4,

              display: 'grid',

              gridTemplateColumns: {
                xs: '1fr',

                md:
                  'repeat(3, minmax(0,1fr))',
              },

              gap: 2,
            }}
          >
            {pastEvents.map((event) => (
              <Box
                key={event.title}
                component="article"
                sx={{
                  overflow: 'hidden',

                  bgcolor:
                    'background.default',

                  border: '1px solid',
                  borderColor: 'divider',

                  borderRadius: 2,

                  transition:
                    'transform 180ms ease, box-shadow 180ms ease',

                  '&:hover': {
                    transform:
                      'translateY(-3px)',

                    boxShadow: 4,
                  },

                  '@media (prefers-reduced-motion: reduce)':
                    {
                      transition: 'none',

                      '&:hover': {
                        transform: 'none',
                      },
                    },
                }}
              >
                <Box
                  sx={{
                    position: 'relative',

                    aspectRatio: {
                      xs: '16 / 11',
                      md: '4 / 3',
                    },

                    bgcolor: 'action.hover',

                    overflow: 'hidden',
                  }}
                >
                  <Image
                    src={event.image}
                    alt={event.alt}
                    fill
                    quality={80}
                    sizes="(max-width: 900px) 100vw, 33vw"
                    style={{
                      objectFit: 'cover',
                    }}
                  />

                  <Box
                    aria-hidden
                    sx={{
                      position: 'absolute',
                      inset: 0,

                      bgcolor: 'primary.dark',

                      opacity: 0.1,
                    }}
                  />
                </Box>

                <Box
                  sx={{
                    p: 2.2,
                  }}
                >
                  <Typography
                    variant="overline"
                    sx={{
                      color: 'secondary.dark',
                    }}
                  >
                    {event.type}
                  </Typography>

                  <Typography
                    component="h3"
                    variant="h5"
                    sx={{
                      mt: 0.25,
                    }}
                  >
                    {event.title}
                  </Typography>

                  <Stack
                    direction="row"
                    sx={{
                      mt: 1,

                      alignItems: 'center',

                      gap: 0.7,

                      color: 'text.secondary',
                    }}
                  >
                    <PeopleAltRoundedIcon
                      aria-hidden
                      sx={{
                        fontSize: 18,
                      }}
                    />

                    <Typography variant="caption">
                      {event.guests}
                    </Typography>
                  </Stack>
                </Box>
              </Box>
            ))}
          </Box>

          <Box
            sx={{
              mt: 3,

              display: 'flex',

              justifyContent: 'center',
            }}
          >
            <Link
              href="#enquiry"
              style={{
                textDecoration: 'none',
              }}
            >
              <Button
                variant="outlined"
                endIcon={
                  <ArrowForwardRoundedIcon />
                }
              >
                Plan a Similar Event
              </Button>
            </Link>
          </Box>
        </Container>
      </Box>

      {/* =====================================================
          WHY HARMONY
      ===================================================== */}

      <Box
        component="section"
        sx={{
          py: {
            xs: 7,
            md: 9,
          },
        }}
      >
        <Container maxWidth="lg">
          <Box
            sx={{
              textAlign: 'center',

              maxWidth: 700,

              mx: 'auto',
            }}
          >
            <Typography
              variant="overline"
              sx={{
                color: 'secondary.dark',
              }}
            >
              Why Harmony
            </Typography>

            <Typography
              component="h2"
              variant="h2"
              sx={{
                mt: 0.7,
              }}
            >
              The essentials for a memorable celebration.
            </Typography>

            <Typography
              variant="body1"
              sx={{
                mt: 1.4,

                color: 'text.secondary',
              }}
            >
              Keep the planning simple while our team
              helps coordinate the venue, dining and
              event details that matter.
            </Typography>
          </Box>

          <Box
            sx={{
              mt: 4,

              display: 'grid',

              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2, minmax(0,1fr))',
                lg: 'repeat(4, minmax(0,1fr))',
              },

              gap: 2,
            }}
          >
            {harmonyBenefits.map((benefit) => {
              const Icon = benefit.icon;

              return (
                <Box
                  key={benefit.title}
                  sx={{
                    p: 2.5,

                    textAlign: 'center',

                    bgcolor:
                      'background.paper',

                    border: '1px solid',

                    borderColor:
                      'divider',

                    borderRadius: 2,
                  }}
                >
                  <Box
                    sx={{
                      width: 54,
                      height: 54,

                      mx: 'auto',

                      display: 'grid',
                      placeItems: 'center',

                      borderRadius: '50%',

                      bgcolor:
                        'action.hover',

                      color:
                        'secondary.dark',
                    }}
                  >
                    <Icon aria-hidden />
                  </Box>

                  <Typography
                    variant="subtitle1"
                    sx={{
                      mt: 1.6,

                      fontWeight: 800,
                    }}
                  >
                    {benefit.title}
                  </Typography>

                  <Typography
                    variant="body2"
                    sx={{
                      mt: 0.65,

                      color:
                        'text.secondary',
                    }}
                  >
                    {benefit.description}
                  </Typography>
                </Box>
              );
            })}
          </Box>
        </Container>
      </Box>

      {/* =====================================================
          ENQUIRY / CHECK DATE
      ===================================================== */}

      <Box
        component="section"
        id="enquiry"
        sx={{
          scrollMarginTop: {
            xs: 90,
            md: 110,
          },

          py: {
            xs: 7,
            md: 10,
          },

          bgcolor:
            'background.paper',

          borderTop:
            '1px solid',

          borderColor:
            'divider',
        }}
      >
        <Container maxWidth="lg">
          <Box
            sx={{
              display: 'grid',

              gridTemplateColumns: {
                xs: '1fr',

                lg:
                  'minmax(0,0.78fr) minmax(0,1.22fr)',
              },

              gap: {
                xs: 4,
                lg: 6,
              },

              alignItems: 'start',
            }}
          >
            <Box
              sx={{
                position: {
                  lg: 'sticky',
                },

                top: {
                  lg: 110,
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
                Check Your Date
              </Typography>

              <Typography
                component="h2"
                variant="h2"
                sx={{
                  mt: 0.8,

                  maxWidth: 520,
                }}
              >
                Planning something special?
              </Typography>

              <Typography
                variant="body1"
                sx={{
                  mt: 1.7,

                  maxWidth: 500,

                  color:
                    'text.secondary',
                }}
              >
                Tell us your preferred date,
                event type and estimated guest
                count. Our team will review the
                details and contact you before
                anything is confirmed.
              </Typography>

              <Stack
                sx={{
                  mt: 3,

                  gap: 1,
                }}
              >
                {enquirySteps.map(
                  (step, index) => (
                    <Box
                      key={step}
                      sx={{
                        display: 'grid',

                        gridTemplateColumns:
                          '38px minmax(0,1fr)',

                        gap: 1.2,

                        alignItems:
                          'center',
                      }}
                    >
                      <Box
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
                            'action.hover',

                          color:
                            'secondary.dark',
                        }}
                      >
                        <Typography
                          variant="caption"
                          sx={{
                            fontWeight:
                              900,
                          }}
                        >
                          {index + 1}
                        </Typography>
                      </Box>

                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight:
                            700,
                        }}
                      >
                        {step}
                      </Typography>
                    </Box>
                  ),
                )}
              </Stack>
            </Box>

            <EventEnquiryForm />
          </Box>
        </Container>
      </Box>

      {/* =====================================================
          FINAL CTA
      ===================================================== */}

      <Box
        component="section"
        sx={{
          py: {
            xs: 6,
            md: 8,
          },
        }}
      >
        <Container maxWidth="lg">
          <Box
            sx={{
              position: 'relative',

              overflow: 'hidden',

              bgcolor:
                'primary.dark',

              color:
                'primary.contrastText',

              borderRadius: {
                xs: 2,
                md: 3,
              },

              p: {
                xs: 3,
                sm: 4,
                md: 5,
              },
            }}
          >
            <Box
              aria-hidden
              sx={{
                position:
                  'absolute',

                width: 320,
                height: 320,

                right: -120,
                top: -170,

                borderRadius:
                  '50%',

                bgcolor:
                  'secondary.main',

                opacity: 0.1,
              }}
            />

            <Box
              sx={{
                position: 'relative',

                display: 'grid',

                gridTemplateColumns: {
                  xs: '1fr',

                  md:
                    'minmax(0,1fr) auto',
                },

                gap: 3,

                alignItems:
                  'center',
              }}
            >
              <Box
                sx={{
                  maxWidth: 650,
                }}
              >
                <Typography
                  variant="overline"
                  sx={{
                    color:
                      'secondary.light',
                  }}
                >
                  Your Celebration
                </Typography>

                <Typography
                  component="h2"
                  variant="h3"
                  sx={{
                    mt: 0.6,

                    color:
                      'primary.contrastText',
                  }}
                >
                  Your next memorable moment could be here.
                </Typography>

                <Typography
                  variant="body1"
                  sx={{
                    mt: 1.2,

                    maxWidth: 560,

                    color:
                      'primary.contrastText',

                    opacity: 0.75,
                  }}
                >
                  Share your event idea and preferred
                  date. Harmony will help you explore
                  the next steps.
                </Typography>
              </Box>

              <Link
                href="#enquiry"
                style={{
                  textDecoration: 'none',
                }}
              >
                <Button
                  variant="contained"
                  size="large"
                  startIcon={
                    <CelebrationRoundedIcon />
                  }
                  endIcon={
                    <ArrowForwardRoundedIcon />
                  }
                  sx={{
                    minHeight: 54,
                    px: 3,

                    whiteSpace:
                      'nowrap',
                  }}
                >
                  Plan Your Event
                </Button>
              </Link>
            </Box>
          </Box>
        </Container>
      </Box>
    </Box>
  );
}