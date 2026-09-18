'use client';

import {
  useMemo,
  useState,
} from 'react';

import Image from 'next/image';

import { Box } from '@mui/material';

import GridViewRoundedIcon from '@mui/icons-material/GridViewRounded';

import Lightbox from '@/components/common/lightbox';

/* =========================================================
   PHOTO COLLAGE

   An editorial photo mosaic: one large image with a 2x2 grid
   beside it, plus a "Show all photos" button. Every tile and
   the button open the shared full-screen Lightbox.

   Fills a `position: relative` parent (like a framed image
   box). Falls back gracefully for 1-4 photos.
========================================================= */

export type CollagePhoto = {
  src: string;
  alt: string;
};

type PhotoCollageProps = {
  photos: CollagePhoto[];
  sizes?: string;
  thumbSizes?: string;
};

const GRID_GAP = '6px';

export default function PhotoCollage({
  photos,
  sizes = '(max-width: 899px) 100vw, 55vw',
  thumbSizes = '(max-width: 899px) 50vw, 22vw',
}: PhotoCollageProps) {
  const list = useMemo(
    () =>
      photos.filter(
        (photo) =>
          Boolean(photo?.src?.trim()) &&
          Boolean(photo?.alt?.trim()),
      ),
    [photos],
  );

  const [lightboxIndex, setLightboxIndex] =
    useState<number | null>(null);

  const count = list.length;

  if (count === 0) {
    return null;
  }

  const heroPhoto = list[0];
  const gridPhotos = list.slice(1, 5);
  const showMosaic = count >= 3;
  const showSideColumn = count >= 2;

  const tileButtonSx = {
    position: 'relative',
    minWidth: 0,
    minHeight: 0,
    p: 0,
    m: 0,
    border: 'none',
    appearance: 'none',
    cursor: 'pointer',
    bgcolor: 'transparent',
    overflow: 'hidden',

    '& img': {
      transition: 'transform 550ms ease',
    },

    '&:hover img': {
      transform: 'scale(1.05)',
    },

    '&:focus-visible': {
      outline: '2px solid',
      outlineColor: 'secondary.main',
      outlineOffset: '-3px',
    },

    '@media (prefers-reduced-motion: reduce)':
      {
        '& img': { transition: 'none' },
        '&:hover img': {
          transform: 'none',
        },
      },
  } as const;

  return (
    <>
      <Box
        sx={{
          position: 'absolute',
          inset: 0,

          display: 'grid',
          gap: GRID_GAP,

          bgcolor: 'divider',

          gridTemplateColumns: {
            xs: '1fr',
            sm: !showSideColumn
              ? '1fr'
              : showMosaic
                ? '1.35fr 1fr'
                : '1fr 1fr',
          },

          gridTemplateRows: {
            xs: '1fr',
            sm: showMosaic
              ? '1fr 1fr'
              : '1fr',
          },
        }}
      >
        {/* HERO TILE */}

        <Box
          component="button"
          type="button"
          aria-label={`View photo 1 of ${count}: ${heroPhoto.alt}`}
          onClick={() => setLightboxIndex(0)}
          sx={{
            ...tileButtonSx,
            gridColumn: '1',
            gridRow: {
              xs: '1',
              sm: showMosaic
                ? '1 / span 2'
                : '1',
            },
          }}
        >
          <Image
            src={heroPhoto.src}
            alt={heroPhoto.alt}
            fill
            priority={false}
            loading="lazy"
            quality={80}
            sizes={sizes}
            style={{ objectFit: 'cover' }}
          />
        </Box>

        {/* GRID TILES */}

        {gridPhotos.map((photo, gridIndex) => (
          <Box
            key={`${photo.src}-${gridIndex}`}
            component="button"
            type="button"
            aria-label={`View photo ${
              gridIndex + 2
            } of ${count}: ${photo.alt}`}
            onClick={() =>
              setLightboxIndex(gridIndex + 1)
            }
            sx={{
              ...tileButtonSx,
              display: {
                xs: 'none',
                sm: 'block',
              },
            }}
          >
            <Image
              src={photo.src}
              alt={photo.alt}
              fill
              loading="lazy"
              quality={75}
              sizes={thumbSizes}
              style={{ objectFit: 'cover' }}
            />
          </Box>
        ))}

        {/* SHOW ALL PHOTOS */}

        {count >= 2 ? (
          <Box
            component="button"
            type="button"
            aria-label={`Show all ${count} photos`}
            onClick={() => setLightboxIndex(0)}
            sx={{
              position: 'absolute',

              right: { xs: 12, md: 16 },
              bottom: { xs: 12, md: 16 },
              zIndex: 2,

              display: 'inline-flex',
              alignItems: 'center',
              gap: 0.8,

              px: 1.5,
              py: 0.85,

              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 1,

              bgcolor: 'background.paper',
              color: 'text.primary',

              fontSize: '0.8rem',
              fontWeight: 700,
              fontFamily: 'inherit',
              lineHeight: 1,

              cursor: 'pointer',

              boxShadow: (theme) =>
                theme.shadows[3],

              transition:
                'background-color 160ms ease',

              '&:hover': {
                bgcolor: 'action.hover',
              },

              '&:focus-visible': {
                outline: '2px solid',
                outlineColor: 'secondary.main',
                outlineOffset: 2,
              },

              '@media (prefers-reduced-motion: reduce)':
                {
                  transition: 'none',
                },
            }}
          >
            <GridViewRoundedIcon
              sx={{ fontSize: 16 }}
            />
            Show all photos
          </Box>
        ) : null}
      </Box>

      <Lightbox
        photos={list}
        index={lightboxIndex}
        onClose={() => setLightboxIndex(null)}
        onIndexChange={setLightboxIndex}
      />
    </>
  );
}
