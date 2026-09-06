'use client';

import dynamic from 'next/dynamic';

import {
  Box,
  CircularProgress,
  Typography,
} from '@mui/material';

import type {
  LocationData,
  NearbyPlace,
} from './location-types';

type HarmonyMapProps = {
  location: LocationData;

  nearbyPlaces: NearbyPlace[];

  selectedPlace:
    | NearbyPlace
    | null;

  onSelectPlace: (
    place: NearbyPlace | null,
  ) => void;
};

const HarmonyMapClient = dynamic(
  () =>
    import(
      './harmony-map-client'
    ),
  {
    ssr: false,

    loading: () => (
      <Box
        role="status"
        aria-live="polite"
        sx={{
          width: '100%',
          height: '100%',

          minHeight: {
            xs: 500,
            sm: 570,
            md: 620,
            lg: 680,
          },

          display: 'grid',

          placeItems:
            'center',

          bgcolor:
            'background.paper',

          color:
            'text.primary',
        }}
      >
        <Box
          sx={{
            textAlign:
              'center',

            px: 2,
          }}
        >
          <CircularProgress
            size={30}
            thickness={4}
            aria-label="Loading Harmony map"
            sx={{
              color:
                'primary.main',
            }}
          />

          <Typography
            variant="caption"
            sx={{
              display: 'block',

              mt: 1.5,

              color:
                'text.secondary',

              fontWeight:
                700,
            }}
          >
            Loading Harmony map...
          </Typography>
        </Box>
      </Box>
    ),
  },
);

export default function HarmonyMap({
  location,
  nearbyPlaces,
  selectedPlace,
  onSelectPlace,
}: HarmonyMapProps) {
  return (
    <HarmonyMapClient
      location={
        location
      }

      nearbyPlaces={
        nearbyPlaces
      }

      selectedPlace={
        selectedPlace
      }

      onSelectPlace={
        onSelectPlace
      }
    />
  );
}