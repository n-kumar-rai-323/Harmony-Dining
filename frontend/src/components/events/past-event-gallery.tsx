'use client';

import {
  useMemo,
  useState,
} from 'react';

import Image from 'next/image';

import {
  Box,
  Typography,
} from '@mui/material';

import { alpha } from '@mui/material/styles';

import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';

import Lightbox, {
  type LightboxPhoto,
} from '@/components/common/lightbox';

import type { PastEventMedia } from '@/data/past-events';

type PastEventGalleryProps = {
  media: PastEventMedia[];
};

const mediaKey = (
  item: PastEventMedia,
  index: number,
) => `${item.type}-${index}-${item.src}`;

export default function PastEventGallery({
  media,
}: PastEventGalleryProps) {
  const images = useMemo<LightboxPhoto[]>(
    () =>
      media
        .filter(
          (item) => item.type === 'image',
        )
        .map((item) => ({
          src: item.src,
          alt: item.alt,
        })),
    [media],
  );

  const [lightboxIndex, setLightboxIndex] =
    useState<number | null>(null);

  const [playingKey, setPlayingKey] =
    useState<string | null>(null);

  const [failedKey, setFailedKey] =
    useState<string | null>(null);

  if (media.length === 0) {
    return null;
  }

  return (
    <>
      <Box
        sx={{
          display: 'grid',

          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, minmax(0, 1fr))',
            md: 'repeat(3, minmax(0, 1fr))',
          },

          gap: { xs: 1.5, md: 2 },
        }}
      >
        {media.map((item, index) => {
          const key = mediaKey(item, index);

          const isPlaying =
            playingKey === key;

          const hasFailed =
            failedKey === key;

          return (
            <Box
              key={key}
              sx={{
                position: 'relative',

                aspectRatio: '4 / 3',

                overflow: 'hidden',

                borderRadius: 2,

                border: '1px solid',
                borderColor: 'divider',

                bgcolor: 'action.hover',
              }}
            >
              {item.type === 'image' ? (
                <Box
                  component="button"
                  type="button"
                  aria-label={`Open photo: ${item.alt}`}
                  onClick={() => {
                    const target =
                      images.findIndex(
                        (photo) =>
                          photo.src ===
                          item.src,
                      );

                    setLightboxIndex(
                      target >= 0
                        ? target
                        : 0,
                    );
                  }}
                  sx={{
                    position: 'absolute',
                    inset: 0,
                    p: 0,
                    border: 'none',
                    appearance: 'none',
                    cursor: 'pointer',
                    bgcolor: 'transparent',

                    '& img': {
                      transition:
                        'transform 550ms ease',
                    },

                    '&:hover img': {
                      transform: 'scale(1.05)',
                    },

                    '&:focus-visible': {
                      outline: '2px solid',
                      outlineColor:
                        'secondary.main',
                      outlineOffset: '-2px',
                    },

                    '@media (prefers-reduced-motion: reduce)':
                      {
                        '& img': {
                          transition: 'none',
                        },
                        '&:hover img': {
                          transform: 'none',
                        },
                      },
                  }}
                >
                  <Image
                    src={item.src}
                    alt={item.alt}
                    fill
                    loading="lazy"
                    quality={80}
                    sizes="(max-width: 599px) 100vw, (max-width: 899px) 50vw, 33vw"
                    style={{
                      objectFit: 'cover',
                    }}
                  />
                </Box>
              ) : isPlaying && !hasFailed ? (
                <Box
                  component="video"
                  src={item.src}
                  poster={item.poster}
                  controls
                  autoPlay
                  playsInline
                  preload="none"
                  onError={() =>
                    setFailedKey(key)
                  }
                  sx={{
                    position: 'absolute',
                    inset: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    bgcolor: 'common.black',
                  }}
                />
              ) : (
                <Box
                  component="button"
                  type="button"
                  aria-label={
                    hasFailed
                      ? 'Video unavailable'
                      : `Play video: ${item.alt}`
                  }
                  disabled={hasFailed}
                  onClick={() =>
                    setPlayingKey(key)
                  }
                  sx={{
                    position: 'absolute',
                    inset: 0,
                    p: 0,
                    border: 'none',
                    appearance: 'none',
                    cursor: hasFailed
                      ? 'default'
                      : 'pointer',
                    bgcolor: 'transparent',

                    '&:focus-visible': {
                      outline: '2px solid',
                      outlineColor:
                        'secondary.main',
                      outlineOffset: '-2px',
                    },
                  }}
                >
                  <Image
                    src={item.poster}
                    alt={item.alt}
                    fill
                    loading="lazy"
                    quality={80}
                    sizes="(max-width: 599px) 100vw, (max-width: 899px) 50vw, 33vw"
                    style={{
                      objectFit: 'cover',
                    }}
                  />

                  <Box
                    aria-hidden
                    sx={{
                      position: 'absolute',
                      inset: 0,
                      display: 'grid',
                      placeItems: 'center',
                      bgcolor: (theme) =>
                        alpha(
                          theme.palette.primary
                            .dark,
                          0.28,
                        ),
                    }}
                  >
                    <Box
                      sx={{
                        width: 56,
                        height: 56,
                        display: 'grid',
                        placeItems: 'center',
                        borderRadius: '50%',
                        color:
                          'primary.contrastText',
                        bgcolor: (theme) =>
                          alpha(
                            theme.palette
                              .primary.dark,
                            0.82,
                          ),
                        border: '1px solid',
                        borderColor: (theme) =>
                          alpha(
                            theme.palette
                              .secondary.light,
                            0.32,
                          ),
                        backdropFilter:
                          'blur(8px)',
                        WebkitBackdropFilter:
                          'blur(8px)',
                      }}
                    >
                      <PlayArrowRoundedIcon />
                    </Box>
                  </Box>

                  {hasFailed ? (
                    <Box
                      sx={{
                        position: 'absolute',
                        left: 0,
                        right: 0,
                        bottom: 0,
                        px: 1.5,
                        py: 1,
                        bgcolor: (theme) =>
                          alpha(
                            theme.palette
                              .primary.dark,
                            0.85,
                          ),
                      }}
                    >
                      <Typography
                        variant="caption"
                        sx={{
                          color:
                            'primary.contrastText',
                        }}
                      >
                        Video unavailable
                      </Typography>
                    </Box>
                  ) : null}
                </Box>
              )}
            </Box>
          );
        })}
      </Box>

      <Lightbox
        photos={images}
        index={lightboxIndex}
        onClose={() => setLightboxIndex(null)}
        onIndexChange={setLightboxIndex}
      />
    </>
  );
}
