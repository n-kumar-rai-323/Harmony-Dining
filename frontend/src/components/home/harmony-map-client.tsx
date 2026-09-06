'use client';

import {
  useEffect,
  useMemo,
  useState,
} from 'react';

import Image from 'next/image';

import {
  alpha,
  Box,
  CircularProgress,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';

import DirectionsRoundedIcon from '@mui/icons-material/DirectionsRounded';
import LocationOnRoundedIcon from '@mui/icons-material/LocationOnRounded';

import L, {
  type LatLngBoundsExpression,
  type LatLngExpression,
} from 'leaflet';

import {
  MapContainer,
  Marker,
  Polyline,
  Popup,
  TileLayer,
  useMap,
} from 'react-leaflet';

import type {
  LocationData,
  NearbyPlace,
  RouteApiResponse,
  RouteData,
} from './location-types';

type HarmonyMapClientProps = {
  location: LocationData;
  nearbyPlaces: NearbyPlace[];

  selectedPlace:
    | NearbyPlace
    | null;

  onSelectPlace: (
    place: NearbyPlace | null,
  ) => void;
};

/* =========================================================
   FORMATTERS
========================================================= */

function formatDistance(
  distanceMeters: number,
) {
  if (distanceMeters < 1000) {
    return `${Math.round(
      distanceMeters,
    )} m`;
  }

  return `${(
    distanceMeters / 1000
  ).toFixed(1)} km`;
}

function formatDuration(
  durationSeconds: number,
) {
  const minutes = Math.max(
    1,
    Math.round(
      durationSeconds / 60,
    ),
  );

  if (minutes < 60) {
    return `${minutes} min`;
  }

  const hours = Math.floor(
    minutes / 60,
  );

  const remainingMinutes =
    minutes % 60;

  if (remainingMinutes === 0) {
    return `${hours} hr`;
  }

  return `${hours} hr ${remainingMinutes} min`;
}

/* =========================================================
   VALIDATION
========================================================= */

function isFiniteCoordinatePair(
  coordinate: unknown,
): coordinate is [number, number] {
  if (
    !Array.isArray(coordinate) ||
    coordinate.length < 2
  ) {
    return false;
  }

  const longitude = Number(
    coordinate[0],
  );

  const latitude = Number(
    coordinate[1],
  );

  return (
    Number.isFinite(longitude) &&
    Number.isFinite(latitude) &&
    longitude >= -180 &&
    longitude <= 180 &&
    latitude >= -90 &&
    latitude <= 90
  );
}

/* =========================================================
   MAP CAMERA
========================================================= */

function MapCamera({
  location,
  selectedPlace,
  route,
  shouldReduceMotion,
}: {
  location: LocationData;

  selectedPlace:
    | NearbyPlace
    | null;

  route: RouteData | null;

  shouldReduceMotion: boolean;
}) {
  const map = useMap();

  useEffect(() => {
    const timer =
      window.setTimeout(
        () => {
          map.invalidateSize();
        },
        250,
      );

    function handleResize() {
      map.invalidateSize();
    }

    window.addEventListener(
      'resize',
      handleResize,
    );

    return () => {
      window.clearTimeout(timer);

      window.removeEventListener(
        'resize',
        handleResize,
      );
    };
  }, [map]);

  useEffect(() => {
    const duration =
      shouldReduceMotion
        ? 0
        : 1;

    if (!selectedPlace) {
      map.flyTo(
        [
          location.latitude,
          location.longitude,
        ],
        14,
        {
          duration,
          animate:
            !shouldReduceMotion,
        },
      );

      return;
    }

    if (
      route &&
      route.coordinates.length > 1
    ) {
      const bounds =
        L.latLngBounds(
          route.coordinates,
        );

      map.flyToBounds(
        bounds,
        {
          padding: [
            50,
            50,
          ],

          maxZoom: 15,

          duration:
            shouldReduceMotion
              ? 0
              : 1.1,

          animate:
            !shouldReduceMotion,
        },
      );

      return;
    }

    const bounds: LatLngBoundsExpression =
      [
        [
          location.latitude,
          location.longitude,
        ],

        [
          selectedPlace.latitude,
          selectedPlace.longitude,
        ],
      ];

    map.flyToBounds(
      bounds,
      {
        padding: [
          55,
          55,
        ],

        maxZoom: 15,

        duration,

        animate:
          !shouldReduceMotion,
      },
    );
  }, [
    location.latitude,
    location.longitude,
    map,
    route,
    selectedPlace,
    shouldReduceMotion,
  ]);

  return null;
}

/* =========================================================
   MAIN
========================================================= */

export default function HarmonyMapClient({
  location,
  nearbyPlaces,
  selectedPlace,
  onSelectPlace,
}: HarmonyMapClientProps) {
  const theme = useTheme();

  const isMobile =
    useMediaQuery(
      theme.breakpoints.down('sm'),
    );

  const shouldReduceMotion =
    useMediaQuery(
      '(prefers-reduced-motion: reduce)',
    );

  const [
    route,
    setRoute,
  ] =
    useState<RouteData | null>(
      null,
    );

  const [
    isLoadingRoute,
    setIsLoadingRoute,
  ] = useState(false);

  const [
    routeError,
    setRouteError,
  ] =
    useState<string | null>(
      null,
    );

  const mapCenter =
    useMemo<LatLngExpression>(
      () => [
        location.latitude,
        location.longitude,
      ],
      [
        location.latitude,
        location.longitude,
      ],
    );

  /* =======================================================
     THEME-AWARE LEAFLET ICONS
  ======================================================= */

  const harmonyIcon = useMemo(
    () =>
      L.divIcon({
        className:
          'harmony-map-marker',

        iconSize: [48, 58],

        iconAnchor: [24, 54],

        popupAnchor: [0, -48],

        html: `
          <div
            style="
              width:48px;
              height:48px;

              border-radius:
                50% 50% 50% 8px;

              transform:
                rotate(-45deg);

              background:
                ${theme.palette.primary.main};

              border:
                3px solid
                ${theme.palette.secondary.light};

              box-shadow:
                0 12px 30px
                rgba(0,0,0,0.28);

              display:flex;

              align-items:center;
              justify-content:center;
            "
          >
            <div
              style="
                transform:
                  rotate(45deg);

                color:
                  ${theme.palette.primary.contrastText};

                font-family:
                  Inter,
                  Arial,
                  sans-serif;

                font-size:
                  12px;

                font-weight:
                  800;
              "
            >
              H
            </div>
          </div>
        `,
      }),
    [
      theme.palette.primary
        .contrastText,
      theme.palette.primary.main,
      theme.palette.secondary
        .light,
    ],
  );

  const destinationIcon =
    useMemo(
      () =>
        L.divIcon({
          className:
            'harmony-destination-marker',

          iconSize: [40, 48],

          iconAnchor: [20, 44],

          popupAnchor: [0, -38],

          html: `
            <div
              style="
                width:40px;
                height:40px;

                border-radius:
                  50% 50% 50% 8px;

                transform:
                  rotate(-45deg);

                background:
                  ${theme.palette.secondary.main};

                border:
                  3px solid
                  ${theme.palette.background.paper};

                box-shadow:
                  0 9px 24px
                  rgba(0,0,0,0.22);

                display:flex;

                align-items:center;
                justify-content:center;
              "
            >
              <div
                style="
                  width:10px;
                  height:10px;

                  border-radius:
                    50%;

                  background:
                    ${theme.palette.primary.main};
                "
              ></div>
            </div>
          `,
        }),
      [
        theme.palette.background
          .paper,
        theme.palette.primary.main,
        theme.palette.secondary.main,
      ],
    );

  /* =======================================================
     LOAD ROUTE
  ======================================================= */

  useEffect(() => {
    const controller =
      new AbortController();

    async function loadRoute() {
      if (!selectedPlace) {
        setRoute(null);

        setRouteError(null);

        setIsLoadingRoute(false);

        return;
      }

      try {
        setIsLoadingRoute(true);

        setRouteError(null);

        setRoute(null);

        const params =
          new URLSearchParams({
            startLat:
              location.latitude.toString(),

            startLng:
              location.longitude.toString(),

            endLat:
              selectedPlace.latitude.toString(),

            endLng:
              selectedPlace.longitude.toString(),
          });

        const response =
          await fetch(
            `/api/route?${params.toString()}`,
            {
              method: 'GET',

              cache:
                'no-store',

              signal:
                controller.signal,
            },
          );

        if (!response.ok) {
          throw new Error(
            `Route request failed: ${response.status}`,
          );
        }

        const data =
          (await response.json()) as RouteApiResponse;

        if (
          !data ||
          !Array.isArray(
            data.coordinates,
          ) ||
          data.coordinates.length < 2
        ) {
          throw new Error(
            'Invalid route response.',
          );
        }

        const validCoordinates =
          data.coordinates.every(
            isFiniteCoordinatePair,
          );

        if (!validCoordinates) {
          throw new Error(
            'Route contains invalid coordinates.',
          );
        }

        /**
         * API / OSRM:
         * [longitude, latitude]
         *
         * Leaflet:
         * [latitude, longitude]
         */
        const coordinates: [
          number,
          number,
        ][] =
          data.coordinates.map(
            (coordinate) => [
              Number(
                coordinate[1],
              ),

              Number(
                coordinate[0],
              ),
            ],
          );

        const distanceMeters =
          Number(
            data.distanceMeters,
          );

        const durationSeconds =
          Number(
            data.durationSeconds,
          );

        if (
          !Number.isFinite(
            distanceMeters,
          ) ||
          !Number.isFinite(
            durationSeconds,
          ) ||
          distanceMeters < 0 ||
          durationSeconds < 0
        ) {
          throw new Error(
            'Invalid route metadata.',
          );
        }

        setRoute({
          distanceMeters,

          durationSeconds,

          coordinates,
        });
      } catch (error) {
        if (
          error instanceof
            DOMException &&
          error.name ===
            'AbortError'
        ) {
          return;
        }

        console.error(
          'Harmony route error:',
          error,
        );

        setRoute(null);

        setRouteError(
          'Route information is temporarily unavailable.',
        );
      } finally {
        if (
          !controller.signal
            .aborted
        ) {
          setIsLoadingRoute(
            false,
          );
        }
      }
    }

    void loadRoute();

    return () => {
      controller.abort();
    };
  }, [
    location.latitude,
    location.longitude,
    selectedPlace,
  ]);

  return (
    <Box
      role="region"
      aria-label="Interactive map showing Harmony Dining & Event Center and nearby places"
      sx={{
        position: 'relative',

        width: '100%',
        height: '100%',

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
      {/* =================================================
          MAP
      ================================================== */}

      <MapContainer
        center={mapCenter}

        zoom={14}

        scrollWheelZoom

        zoomControl

        style={{
          width: '100%',
          height: '100%',

          minHeight:
            'inherit',

          zIndex: 1,
        }}
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"

          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapCamera
          location={location}

          selectedPlace={
            selectedPlace
          }

          route={route}

          shouldReduceMotion={
            shouldReduceMotion
          }
        />

        {/* =================================================
            HARMONY MARKER
        ================================================== */}

        <Marker
          position={[
            location.latitude,
            location.longitude,
          ]}

          icon={harmonyIcon}

          eventHandlers={{
            click: () => {
              onSelectPlace(null);
            },
          }}
        >
          <Popup
            minWidth={240}

            maxWidth={280}
          >
            <Box
              sx={{
                width: 240,
              }}
            >
              <Box
                sx={{
                  position:
                    'relative',

                  width:
                    '100%',

                  height: 125,

                  overflow:
                    'hidden',

                  borderRadius:
                    1,

                  bgcolor:
                    'background.default',
                }}
              >
                <Image
                  src="/images/home/harmony-gallery-entrance.jpg"

                  alt={location.name}

                  fill

                  sizes="240px"

                  style={{
                    objectFit:
                      'cover',
                  }}
                />
              </Box>

              <Typography
                variant="subtitle2"
                sx={{
                  mt: 1.2,

                  color:
                    'text.primary',

                  fontWeight:
                    800,
                }}
              >
                {location.name}
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
                {location.address}
              </Typography>
            </Box>
          </Popup>
        </Marker>

        {/* =================================================
            DESTINATION MARKER
        ================================================== */}

        {selectedPlace && (
          <Marker
            position={[
              selectedPlace.latitude,
              selectedPlace.longitude,
            ]}

            icon={
              destinationIcon
            }
          >
            <Popup>
              <Box
                sx={{
                  minWidth: 175,
                }}
              >
                <Typography
                  variant="subtitle2"
                  sx={{
                    color:
                      'text.primary',

                    fontWeight:
                      800,
                  }}
                >
                  {
                    selectedPlace.name
                  }
                </Typography>

                <Typography
                  variant="caption"
                  sx={{
                    display:
                      'block',

                    mt: 0.25,

                    color:
                      'text.secondary',
                  }}
                >
                  {
                    selectedPlace.category
                  }
                </Typography>
              </Box>
            </Popup>
          </Marker>
        )}

        {/* =================================================
            ROUTE
        ================================================== */}

        {route &&
          route.coordinates
            .length > 1 && (
            <>
              <Polyline
                positions={
                  route.coordinates
                }

                pathOptions={{
                  color:
                    theme.palette
                      .background.paper,

                  weight: 9,

                  opacity: 0.9,

                  lineCap:
                    'round',

                  lineJoin:
                    'round',
                }}
              />

              <Polyline
                positions={
                  route.coordinates
                }

                pathOptions={{
                  color:
                    theme.palette
                      .primary.main,

                  weight: 5,

                  opacity: 0.96,

                  lineCap:
                    'round',

                  lineJoin:
                    'round',
                }}
              />
            </>
          )}
      </MapContainer>

      {/* =================================================
          DESTINATION SELECTOR

          Desktop:
          always visible.

          Mobile:
          visible only before a place is selected.
      ================================================== */}

      {(
        !isMobile ||
        !selectedPlace
      ) && (
        <Box
          sx={{
            position:
              'absolute',

            top: {
              xs: 72,
              md: 18,
            },

            right: {
              xs: 12,
              md: 18,
            },

            zIndex: 500,

            width: {
              xs:
                'calc(100% - 24px)',

              sm: 225,
            },

            maxWidth: 340,

            p: 1,

            display:
              'grid',

            gap: 0.65,

            borderRadius:
              1,

            bgcolor: alpha(
              theme.palette
                .background.paper,
              0.94,
            ),

            border: `1px solid ${alpha(
              theme.palette
                .primary.main,
              0.09,
            )}`,

            backdropFilter:
              'blur(14px)',

            WebkitBackdropFilter:
              'blur(14px)',

            boxShadow:
              theme.shadows[12],
          }}
        >
          <Typography
            variant="overline"
            sx={{
              px: 0.8,

              pt: 0.35,
              pb: 0.2,

              color:
                'text.secondary',

              fontWeight:
                800,
            }}
          >
            Explore from Harmony
          </Typography>

          {nearbyPlaces.map(
            (place) => {
              const active =
                selectedPlace?.id ===
                place.id;

              return (
                <Box
                  key={place.id}

                  component="button"

                  type="button"

                  onClick={() =>
                    onSelectPlace(
                      place,
                    )
                  }

                  aria-pressed={
                    active
                  }

                  aria-label={`Show driving route from Harmony to ${place.name}`}

                  sx={{
                    width:
                      '100%',

                    display:
                      'grid',

                    gridTemplateColumns:
                      '36px minmax(0,1fr)',

                    gap: 1,

                    alignItems:
                      'center',

                    p: 0.85,

                    borderRadius:
                      1,

                    textAlign:
                      'left',

                    font:
                      'inherit',

                    border: `1px solid ${
                      active
                        ? alpha(
                            theme.palette
                              .primary
                              .main,
                            0.16,
                          )
                        : 'transparent'
                    }`,

                    bgcolor:
                      active
                        ? alpha(
                            theme.palette
                              .primary
                              .main,
                            0.075,
                          )
                        : 'transparent',

                    color:
                      'text.primary',

                    cursor:
                      'pointer',

                    transition:
                      'background-color 180ms ease, border-color 180ms ease',

                    '&:hover':
                      {
                        bgcolor:
                          alpha(
                            theme.palette
                              .primary
                              .main,
                            0.06,
                          ),
                      },

                    '&:focus-visible':
                      {
                        outline: `2px solid ${theme.palette.primary.main}`,

                        outlineOffset:
                          1,
                      },

                    '@media (prefers-reduced-motion: reduce)':
                      {
                        transition:
                          'none',
                      },
                  }}
                >
                  <Box
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
                        active
                          ? 'primary.main'
                          : alpha(
                              theme.palette
                                .secondary
                                .main,
                              0.14,
                            ),

                      color:
                        active
                          ? 'primary.contrastText'
                          : 'secondary.dark',
                    }}
                  >
                    <LocationOnRoundedIcon
                      sx={{
                        fontSize:
                          17,
                      }}
                    />
                  </Box>

                  <Box
                    sx={{
                      minWidth: 0,
                    }}
                  >
                    <Typography
                      variant="subtitle2"
                      sx={{
                        color:
                          'text.primary',

                        fontWeight:
                          800,

                        lineHeight:
                          1.2,
                      }}
                    >
                      {
                        place.shortName
                      }
                    </Typography>

                    <Typography
                      variant="caption"
                      sx={{
                        display:
                          'block',

                        mt: 0.15,

                        color:
                          'text.secondary',
                      }}
                    >
                      {
                        place.category
                      }
                    </Typography>
                  </Box>
                </Box>
              );
            },
          )}
        </Box>
      )}

      {/* =================================================
          ROUTE STATUS
      ================================================== */}

      {selectedPlace && (
        <Box
          aria-live="polite"
          sx={{
            position:
              'absolute',

            zIndex: 500,

            left: {
              xs: 12,
              md: 18,
            },

            bottom: {
              xs: 12,
              md: 18,
            },

            width: {
              xs:
                'calc(100% - 24px)',

              sm: 'auto',
            },

            maxWidth: 340,

            px: 1.6,
            py: 1.35,

            borderRadius:
              1,

            bgcolor: alpha(
              theme.palette
                .primary.dark,
              0.95,
            ),

            color:
              'primary.contrastText',

            border: `1px solid ${alpha(
              theme.palette
                .secondary.light,
              0.2,
            )}`,

            backdropFilter:
              'blur(14px)',

            WebkitBackdropFilter:
              'blur(14px)',

            boxShadow:
              theme.shadows[12],
          }}
        >
          {isLoadingRoute ? (
            <Box
              sx={{
                display:
                  'flex',

                alignItems:
                  'center',

                gap: 1.1,
              }}
            >
              <CircularProgress
                size={18}

                thickness={5}

                aria-label="Calculating route"

                sx={{
                  color:
                    'secondary.light',
                }}
              />

              <Typography
                variant="caption"
                sx={{
                  color: alpha(
                    theme.palette
                      .primary
                      .contrastText,
                    0.76,
                  ),

                  fontWeight:
                    700,
                }}
              >
                Calculating route...
              </Typography>
            </Box>
          ) : routeError ? (
            <Typography
              variant="caption"
              sx={{
                display:
                  'block',

                color: alpha(
                  theme.palette
                    .primary
                    .contrastText,
                  0.74,
                ),
              }}
            >
              {routeError}
            </Typography>
          ) : route ? (
            <>
              <Box
                sx={{
                  display:
                    'flex',

                  alignItems:
                    'center',

                  gap: 0.7,
                }}
              >
                <DirectionsRoundedIcon
                  sx={{
                    color:
                      'secondary.light',

                    fontSize: 18,
                  }}
                />

                <Typography
                  variant="overline"
                  sx={{
                    color:
                      'secondary.light',

                    fontWeight:
                      800,
                  }}
                >
                  Driving Route
                </Typography>
              </Box>

              <Typography
                variant="subtitle2"
                sx={{
                  mt: 0.7,

                  color:
                    'primary.contrastText',

                  fontWeight:
                    800,
                }}
              >
                Harmony →{' '}
                {
                  selectedPlace.shortName
                }
              </Typography>

              <Box
                sx={{
                  mt: 0.65,

                  display:
                    'flex',

                  alignItems:
                    'center',

                  flexWrap:
                    'wrap',

                  gap: 1,
                }}
              >
                <Typography
                  variant="caption"
                  sx={{
                    color: alpha(
                      theme.palette
                        .primary
                        .contrastText,
                      0.68,
                    ),
                  }}
                >
                  {formatDistance(
                    route.distanceMeters,
                  )}
                </Typography>

                <Box
                  aria-hidden
                  sx={{
                    width: 3,
                    height: 3,

                    borderRadius:
                      '50%',

                    bgcolor:
                      'secondary.main',
                  }}
                />

                <Typography
                  variant="caption"
                  sx={{
                    color: alpha(
                      theme.palette
                        .primary
                        .contrastText,
                      0.68,
                    ),
                  }}
                >
                  Approx.{' '}
                  {formatDuration(
                    route.durationSeconds,
                  )}
                </Typography>
              </Box>
            </>
          ) : null}
        </Box>
      )}
    </Box>
  );
}