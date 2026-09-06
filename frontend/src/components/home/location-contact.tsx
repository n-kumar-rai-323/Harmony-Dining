'use client';

import {
  Box,
  Button,
  Container,
  Typography,
} from '@mui/material';

import { alpha } from '@mui/material/styles';

import ArrowOutwardRoundedIcon from '@mui/icons-material/ArrowOutwardRounded';
import DirectionsRoundedIcon from '@mui/icons-material/DirectionsRounded';
import ExploreRoundedIcon from '@mui/icons-material/ExploreRounded';
import LocationOnRoundedIcon from '@mui/icons-material/LocationOnRounded';
import PlaceRoundedIcon from '@mui/icons-material/PlaceRounded';

import LocationExperience from './location-experience';

import type {
  LocationData,
  NearbyPlace,
} from './location-types';

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
   LocationContact content prop

   Parent Server Component can fetch published location data
   and pass serializable content into this Client Component.
========================================================= */

export type LocationContactContent = {
  enabled?: boolean;

  eyebrow?: string;

  title: string;

  accentTitle?: string;

  description?: string;

  location: LocationData;

  nearbyPlaces?: NearbyPlace[];

  directionsCta?: {
    label: string;
    enabled?: boolean;
  };

  mapCta?: {
    label: string;
    enabled?: boolean;
  };

  helperText?: string;

  estimateNote?: string;
};

type LocationContactProps = {
  content?: LocationContactContent;
};

/* =========================================================
   DEVELOPMENT-TIME CONTENT

   Current content/data is intentionally preserved.
   Later Admin/API can replace these values without changing
   the approved visual design.
========================================================= */

const initialLocationContent: LocationContactContent = {
  enabled: true,

  eyebrow: 'Find Harmony',

  title: 'Closer than',

  accentTitle: 'you think.',

  description:
    'Find Harmony easily, explore nearby landmarks and view routes for your next dining experience or celebration.',

  location: {
    id: 'harmony-main',

    name:
      'Harmony Dining & Event Center',

    address:
      'Kathmandu, Nepal',

    latitude: 27.6718846,

    longitude: 85.3195215,

    openingHours: null,
  },

  nearbyPlaces: [
    {
      id: 'airport',

      name:
        'Tribhuvan International Airport',

      shortName: 'Airport',

      category: 'Travel',

      latitude: 27.6966,

      longitude: 85.3591,
    },
    {
      id: 'durbar-square',

      name:
        'Kathmandu Durbar Square',

      shortName:
        'Durbar Square',

      category:
        'Landmark',

      latitude:
        27.7048,

      longitude:
        85.3076,
    },
    {
      id: 'thamel',

      name: 'Thamel',

      shortName:
        'Thamel',

      category:
        'City',

      latitude:
        27.7154,

      longitude:
        85.3123,
    },
  ],

  directionsCta: {
    label:
      'Get Directions',

    enabled: true,
  },

  mapCta: {
    label:
      'Open Map',

    enabled: true,
  },

  helperText:
    'Select a nearby place to explore the route from Harmony.',

  estimateNote:
    'Distance and travel time are route-based estimates.',
};

/* =========================================================
   URL HELPERS

   URL generation stays in frontend code.
   Admin/API stores plain coordinates/content only.
========================================================= */

function buildGoogleDirectionsUrl(
  latitude: number,
  longitude: number,
) {
  const destination =
    `${latitude},${longitude}`;

  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
    destination,
  )}`;
}

function buildGoogleMapUrl(
  latitude: number,
  longitude: number,
) {
  const query =
    `${latitude},${longitude}`;

  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    query,
  )}`;
}

/* =========================================================
   LOCATION CONTACT
========================================================= */

export default function LocationContact({
  content = initialLocationContent,
}: LocationContactProps) {
  const {
    enabled = true,

    eyebrow,

    title,

    accentTitle,

    description,

    location,

    nearbyPlaces = [],

    directionsCta,

    mapCta,

    helperText,

    estimateNote,
  } = content;

  if (!enabled) {
    return null;
  }

  const googleDirectionsUrl =
    buildGoogleDirectionsUrl(
      location.latitude,
      location.longitude,
    );

  const googleMapUrl =
    buildGoogleMapUrl(
      location.latitude,
      location.longitude,
    );

  const showDirections =
    directionsCta?.enabled !== false &&
    Boolean(
      directionsCta?.label?.trim(),
    );

  const showMap =
    mapCta?.enabled !== false &&
    Boolean(
      mapCta?.label?.trim(),
    );

  return (
    <Box
      component="section"
      id="location"
      aria-labelledby="location-contact-title"
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
          xs: 7,
          sm: 8,
          md: 10,
          lg: 11,
        },
      }}
    >
      {/* =====================================================
          BACKGROUND DETAIL
      ====================================================== */}

      <Box
        aria-hidden
        sx={{
          position:
            'absolute',

          inset: 0,

          pointerEvents:
            'none',

          background:
            (theme) => `
              radial-gradient(
                circle at 91% 6%,
                ${alpha(
                  theme.palette.secondary.main,
                  0.1,
                )},
                ${alpha(
                  theme.palette.secondary.main,
                  0,
                )} 27%
              ),

              radial-gradient(
                circle at 7% 92%,
                ${alpha(
                  theme.palette.primary.main,
                  0.045,
                )},
                ${alpha(
                  theme.palette.primary.main,
                  0,
                )} 27%
              )
            `,
        }}
      />

      <Container
        maxWidth="xl"
        sx={{
          position:
            'relative',

          zIndex: 1,
        }}
      >
        {/* =====================================================
            HEADER
        ====================================================== */}

        <Box
          sx={{
            display:
              'grid',

            gridTemplateColumns:
              {
                xs:
                  'minmax(0, 1fr)',

                lg:
                  'minmax(0,1fr) minmax(340px,0.64fr)',
              },

            gap: {
              xs: 3,
              lg: 7,
            },

            alignItems:
              'end',

            mb: {
              xs: 4,
              md: 5,
            },
          }}
        >
          {/* LEFT */}

          <Box
            sx={{
              maxWidth:
                800,

              minWidth: 0,
            }}
          >
            {eyebrow && (
              <Box
                sx={{
                  display:
                    'flex',

                  alignItems:
                    'center',

                  gap: 1.15,

                  minWidth:
                    0,
                }}
              >
                <Box
                  aria-hidden
                  sx={{
                    width: 34,

                    height: 1,

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
              </Box>
            )}

            <Typography
              id="location-contact-title"
              component="h2"
              variant="h2"
              sx={{
                mt: eyebrow
                  ? 1.8
                  : 0,

                maxWidth:
                  760,

                color:
                  'text.primary',

                overflowWrap:
                  'break-word',

                hyphens:
                  'auto',
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

            {/* LOCATION IDENTITY */}

            <Box
              sx={{
                mt: 2.3,

                display:
                  'flex',

                alignItems:
                  'center',

                gap: 1.25,

                width:
                  'fit-content',

                maxWidth:
                  '100%',

                minWidth:
                  0,
              }}
            >
              <Box
                aria-hidden
                sx={{
                  width: 38,

                  height: 38,

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
                        theme
                          .palette
                          .secondary
                          .main,
                        0.13,
                      ),

                  color:
                    'secondary.dark',
                }}
              >
                <PlaceRoundedIcon
                  sx={{
                    fontSize:
                      20,
                  }}
                />
              </Box>

              <Box
                sx={{
                  minWidth:
                    0,
                }}
              >
                <Typography
                  variant="subtitle2"
                  sx={{
                    color:
                      'text.primary',

                    fontWeight:
                      800,

                    overflowWrap:
                      'break-word',
                  }}
                >
                  {location.name}
                </Typography>

                <Typography
                  variant="caption"
                  sx={{
                    display:
                      'block',

                    mt: 0.25,

                    color:
                      'text.secondary',

                    overflowWrap:
                      'break-word',
                  }}
                >
                  {location.address}
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* RIGHT */}

          <Box
            sx={{
              maxWidth:
                520,

              minWidth: 0,

              justifySelf:
                {
                  lg: 'end',
                },
            }}
          >
            {description && (
              <Typography
                component="p"
                variant="body1"
                sx={{
                  m: 0,

                  color:
                    'text.secondary',

                  overflowWrap:
                    'break-word',
                }}
              >
                {description}
              </Typography>
            )}

            {(showDirections ||
              showMap) && (
              <Box
                sx={{
                  mt: description
                    ? 2.4
                    : 0,

                  display:
                    'flex',

                  flexDirection:
                    {
                      xs:
                        'column',

                      sm:
                        'row',
                    },

                  alignItems:
                    {
                      xs:
                        'stretch',

                      sm:
                        'center',
                    },

                  gap: 1,

                  minWidth:
                    0,
                }}
              >
                {/* GOOGLE DIRECTIONS */}

                {showDirections && (
                  <Box
                    component="a"
                    href={
                      googleDirectionsUrl
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{
                      display:
                        {
                          xs:
                            'block',

                          sm:
                            'inline-block',
                        },

                      maxWidth:
                        '100%',

                      textDecoration:
                        'none',
                    }}
                  >
                    <Button
                      fullWidth
                      variant="contained"
                      startIcon={
                        <DirectionsRoundedIcon
                          sx={{
                            fontSize:
                              '19px !important',
                          }}
                        />
                      }
                      endIcon={
                        <ArrowOutwardRoundedIcon
                          sx={{
                            fontSize:
                              '17px !important',
                          }}
                        />
                      }
                      sx={{
                        minHeight:
                          49,

                        px: 2.4,

                        bgcolor:
                          'primary.main',

                        color:
                          'primary.contrastText',

                        textAlign:
                          'center',

                        whiteSpace:
                          {
                            xs:
                              'normal',

                            sm:
                              'nowrap',
                          },

                        overflowWrap:
                          'anywhere',

                        '&:hover':
                          {
                            bgcolor:
                              'primary.dark',
                          },
                      }}
                    >
                      {
                        directionsCta
                          ?.label
                      }
                    </Button>
                  </Box>
                )}

                {/* GOOGLE MAP */}

                {showMap && (
                  <Box
                    component="a"
                    href={
                      googleMapUrl
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{
                      display:
                        {
                          xs:
                            'block',

                          sm:
                            'inline-block',
                        },

                      maxWidth:
                        '100%',

                      textDecoration:
                        'none',
                    }}
                  >
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={
                        <LocationOnRoundedIcon
                          sx={{
                            fontSize:
                              '19px !important',
                          }}
                        />
                      }
                      sx={{
                        minHeight:
                          49,

                        px: 2.4,

                        color:
                          'text.primary',

                        borderColor:
                          'divider',

                        textAlign:
                          'center',

                        whiteSpace:
                          {
                            xs:
                              'normal',

                            sm:
                              'nowrap',
                          },

                        overflowWrap:
                          'anywhere',

                        '&:hover':
                          {
                            borderColor:
                              'secondary.main',

                            bgcolor:
                              'action.hover',
                          },
                      }}
                    >
                      {
                        mapCta?.label
                      }
                    </Button>
                  </Box>
                )}
              </Box>
            )}
          </Box>
        </Box>

        {/* =====================================================
            INTERACTIVE LOCATION EXPERIENCE

            Existing component remains responsible for
            map rendering / nearby-route interaction.
        ====================================================== */}

        <Box
          sx={{
            position:
              'relative',

            overflow:
              'hidden',

            borderRadius:
              {
                xs: 1.5,
                md: 2,
              },

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
          <LocationExperience
            location={
              location
            }
            nearbyPlaces={
              nearbyPlaces
            }
          />
        </Box>

        {/* =====================================================
            MAP HELPER
        ====================================================== */}

        {(helperText ||
          estimateNote) && (
          <Box
            sx={{
              mt: 2.2,

              display:
                'flex',

              flexDirection:
                {
                  xs:
                    'column',

                  sm: 'row',
                },

              justifyContent:
                'space-between',

              alignItems:
                {
                  xs:
                    'flex-start',

                  sm:
                    'center',
                },

              gap: 1.2,

              minWidth: 0,
            }}
          >
            {helperText && (
              <Box
                sx={{
                  display:
                    'inline-flex',

                  alignItems:
                    'center',

                  gap: 0.8,

                  minWidth:
                    0,
                }}
              >
                <ExploreRoundedIcon
                  aria-hidden
                  sx={{
                    flexShrink:
                      0,

                    fontSize:
                      17,

                    color:
                      'secondary.dark',
                  }}
                />

                <Typography
                  variant="caption"
                  sx={{
                    minWidth:
                      0,

                    color:
                      'text.secondary',

                    fontWeight:
                      600,

                    overflowWrap:
                      'break-word',
                  }}
                >
                  {helperText}
                </Typography>
              </Box>
            )}

            {estimateNote && (
              <Typography
                variant="caption"
                sx={{
                  minWidth:
                    0,

                  color:
                    'text.secondary',

                  opacity:
                    0.72,

                  textAlign:
                    {
                      xs:
                        'left',

                      sm:
                        'right',
                    },

                  overflowWrap:
                    'break-word',
                }}
              >
                {estimateNote}
              </Typography>
            )}
          </Box>
        )}
      </Container>
    </Box>
  );
}