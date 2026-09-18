'use client';

import { useState } from 'react';

import {
  alpha,
  Box,
  Typography,
  useTheme,
} from '@mui/material';

import FlightTakeoffRoundedIcon from '@mui/icons-material/FlightTakeoffRounded';
import AccountBalanceRoundedIcon from '@mui/icons-material/AccountBalanceRounded';
import ExploreRoundedIcon from '@mui/icons-material/ExploreRounded';
import LocationOnRoundedIcon from '@mui/icons-material/LocationOnRounded';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';

import HarmonyMap from './harmony-map';

import type {
  LocationData,
  NearbyPlace,
} from './location-types';

type LocationExperienceProps = {
  location: LocationData;
  nearbyPlaces: NearbyPlace[];
};

/* =========================================================
   PLACE ICON
========================================================= */

function getPlaceIcon(category: string) {
  const normalizedCategory =
    category.trim().toLowerCase();

  if (normalizedCategory === 'travel') {
    return FlightTakeoffRoundedIcon;
  }

  if (normalizedCategory === 'landmark') {
    return AccountBalanceRoundedIcon;
  }

  return ExploreRoundedIcon;
}

/* =========================================================
   MAIN COMPONENT
========================================================= */

export default function LocationExperience({
  location,
  nearbyPlaces,
}: LocationExperienceProps) {
  const theme = useTheme();

  const [
    selectedPlaceId,
    setSelectedPlaceId,
  ] = useState<string | null>(null);

  const selectedPlace =
    nearbyPlaces.find(
      (place) =>
        place.id === selectedPlaceId,
    ) ?? null;

  function handleSelectPlace(
    place: NearbyPlace | null,
  ) {
    setSelectedPlaceId(
      place?.id ?? null,
    );
  }

  return (
    <Box
      sx={{
        display: 'grid',

        gridTemplateColumns: {
          xs: '1fr',
          lg: '320px minmax(0, 1fr)',
        },

        gridTemplateAreas: {
          xs: `
            "map"
            "sidebar"
          `,

          lg: `
            "sidebar map"
          `,
        },

        alignItems: 'stretch',

        overflow: 'hidden',
      }}
    >
      {/* =================================================
          SIDEBAR
      ================================================== */}

      <Box
        component="aside"
        aria-label="Harmony location details"
        sx={{
          gridArea: 'sidebar',

          display: 'flex',
          flexDirection: 'column',

          p: {
            xs: 2.5,
            sm: 2.8,
            md: 3,
          },

          bgcolor: 'primary.main',

          color:
            'primary.contrastText',
        }}
      >
        {/* =================================================
            LOCATION
        ================================================== */}

        <Box>
          <Box
            sx={{
              width: 46,
              height: 46,

              display: 'grid',

              placeItems: 'center',

              borderRadius: '50%',

              bgcolor: alpha(
                theme.palette
                  .secondary.main,
                0.13,
              ),

              color:
                'secondary.light',
            }}
          >
            <LocationOnRoundedIcon
              aria-hidden
              sx={{
                fontSize: 23,
              }}
            />
          </Box>

          <Typography
            variant="overline"
            sx={{
              display: 'block',

              mt: 2,

              color:
                'secondary.light',

              fontWeight: 800,
            }}
          >
            Our Location
          </Typography>

          <Typography
            component="h3"
            variant="h4"
            sx={{
              mt: 0.8,

              color:
                'primary.contrastText',
            }}
          >
            {location.name}
          </Typography>

          <Typography
            variant="body2"
            sx={{
              mt: 1.25,

              color: alpha(
                theme.palette.primary
                  .contrastText,
                0.68,
              ),
            }}
          >
            {location.address}
          </Typography>
        </Box>

        {/* =================================================
            DIVIDER
        ================================================== */}

        <Box
          aria-hidden
          sx={{
            my: 2.6,

            height: '1px',

            bgcolor: alpha(
              theme.palette.primary
                .contrastText,
              0.1,
            ),
          }}
        />

        {/* =================================================
            NEARBY
        ================================================== */}

        <Box>
          <Typography
            variant="overline"
            sx={{
              color: alpha(
                theme.palette.primary
                  .contrastText,
                0.52,
              ),

              fontWeight: 800,
            }}
          >
            Nearby
          </Typography>

          <Box
            sx={{
              mt: 1.3,

              display: 'grid',

              gap: 0.8,
            }}
          >
            {nearbyPlaces.map(
              (place) => {
                const Icon =
                  getPlaceIcon(
                    place.category,
                  );

                const active =
                  selectedPlaceId ===
                  place.id;

                return (
                  <Box
                    key={place.id}

                    component="button"

                    type="button"

                    onClick={() =>
                      handleSelectPlace(
                        place,
                      )
                    }

                    aria-pressed={active}

                    aria-label={`Show route to ${place.name}`}

                    sx={{
                      width: '100%',

                      display: 'grid',

                      gridTemplateColumns:
                        '40px minmax(0, 1fr)',

                      gap: 1.2,

                      alignItems:
                        'center',

                      p: 1.15,

                      borderRadius: 1,

                      textAlign:
                        'left',

                      font: 'inherit',

                      color: 'inherit',

                      cursor:
                        'pointer',

                      appearance:
                        'none',

                      bgcolor:
                        active
                          ? alpha(
                              theme.palette
                                .secondary
                                .main,
                              0.15,
                            )
                          : alpha(
                              theme.palette
                                .primary
                                .contrastText,
                              0.035,
                            ),

                      border: `1px solid ${
                        active
                          ? alpha(
                              theme.palette
                                .secondary
                                .light,
                              0.36,
                            )
                          : alpha(
                              theme.palette
                                .primary
                                .contrastText,
                              0.07,
                            )
                      }`,

                      transition:
                        'background-color 180ms ease, border-color 180ms ease, transform 180ms ease',

                      '&:hover': {
                        bgcolor:
                          active
                            ? alpha(
                                theme.palette
                                  .secondary
                                  .main,
                                0.18,
                              )
                            : alpha(
                                theme.palette
                                  .primary
                                  .contrastText,
                                0.065,
                              ),

                        borderColor:
                          alpha(
                            theme.palette
                              .secondary
                              .light,
                            0.25,
                          ),

                        transform:
                          'translateX(2px)',
                      },

                      '&:focus-visible': {
                        outline: `2px solid ${theme.palette.secondary.light}`,

                        outlineOffset: 2,
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
                    {/* ICON */}

                    <Box
                      sx={{
                        width: 40,
                        height: 40,

                        display:
                          'grid',

                        placeItems:
                          'center',

                        borderRadius:
                          '50%',

                        bgcolor:
                          active
                            ? 'secondary.main'
                            : alpha(
                                theme.palette
                                  .secondary
                                  .main,
                                0.1,
                              ),

                        color:
                          active
                            ? 'primary.dark'
                            : 'secondary.light',

                        transition:
                          'background-color 180ms ease, color 180ms ease',

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
                          fontSize: 18,
                        }}
                      />
                    </Box>

                    {/* PLACE */}

                    <Box
                      sx={{
                        minWidth: 0,
                      }}
                    >
                      <Typography
                        variant="subtitle2"
                        sx={{
                          color:
                            'primary.contrastText',

                          fontWeight: 750,

                          lineHeight: 1.3,
                        }}
                      >
                        {place.shortName}
                      </Typography>

                      <Typography
                        variant="caption"
                        sx={{
                          display:
                            'block',

                          mt: 0.2,

                          color: alpha(
                            theme.palette
                              .primary
                              .contrastText,
                            0.5,
                          ),
                        }}
                      >
                        {place.category}
                      </Typography>
                    </Box>
                  </Box>
                );
              },
            )}
          </Box>
        </Box>

        {/* =================================================
            OPENING HOURS
        ================================================== */}

        <Box
          sx={{
            mt: 'auto',

            pt: 2.6,
          }}
        >
          <Box
            sx={{
              p: 1.5,

              borderRadius: 1,

              bgcolor: alpha(
                theme.palette
                  .secondary.main,
                0.085,
              ),

              border: `1px solid ${alpha(
                theme.palette.secondary
                  .light,
                0.14,
              )}`,
            }}
          >
            <Box
              sx={{
                display: 'flex',

                alignItems:
                  'center',

                gap: 0.8,
              }}
            >
              <AccessTimeRoundedIcon
                aria-hidden
                sx={{
                  fontSize: 18,

                  color:
                    'secondary.light',
                }}
              />

              <Typography
                variant="overline"
                sx={{
                  color:
                    'secondary.light',

                  fontWeight: 800,
                }}
              >
                Opening Hours
              </Typography>
            </Box>

            <Typography
              variant="body2"
              sx={{
                mt: 0.85,

                color: alpha(
                  theme.palette.primary
                    .contrastText,
                  0.66,
                ),
              }}
            >
              {location.openingHours ??
                'Please call us for our current opening hours.'}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* =================================================
          MAP
      ================================================== */}

      <Box
        sx={{
          gridArea: 'map',

          position: 'relative',

          minWidth: 0,

          minHeight: {
            xs: 500,
            sm: 570,
            md: 620,
            lg: 680,
          },

          overflow: 'hidden',

          bgcolor:
            'background.paper',
        }}
      >
        <Box
          sx={{
            position: 'absolute',

            inset: 0,
          }}
        >
          <HarmonyMap
            location={location}

            nearbyPlaces={
              nearbyPlaces
            }

            selectedPlace={
              selectedPlace
            }

            onSelectPlace={
              handleSelectPlace
            }
          />
        </Box>

        {/* =================================================
            MAP LABEL
        ================================================== */}

        <Box
          sx={{
            position: 'absolute',

            top: {
              xs: 14,
              md: 18,
            },

            left: {
              xs: 14,
              md: 18,
            },

            zIndex: 500,

            display:
              'inline-flex',

            alignItems:
              'center',

            gap: 0.75,

            px: 1.2,
            py: 0.8,

            borderRadius: 1,

            bgcolor: alpha(
              theme.palette
                .background.paper,
              0.93,
            ),

            border: `1px solid ${alpha(
              theme.palette.primary.main,
              0.09,
            )}`,

            backdropFilter:
              'blur(10px)',

            WebkitBackdropFilter:
              'blur(10px)',

            boxShadow:
              theme.shadows[8],

            pointerEvents:
              'none',
          }}
        >
          <LocationOnRoundedIcon
            aria-hidden
            sx={{
              fontSize: 18,

              color:
                'primary.main',
            }}
          />

          <Typography
            variant="subtitle2"
            sx={{
              color:
                'primary.main',

              fontWeight: 800,

              whiteSpace:
                'nowrap',
            }}
          >
            Harmony
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}