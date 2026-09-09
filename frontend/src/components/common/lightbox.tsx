'use client';

import {
  useCallback,
  useEffect,
} from 'react';

import { createPortal } from 'react-dom';

import Image from 'next/image';

import {
  Box,
  IconButton,
  Typography,
} from '@mui/material';

import { alpha } from '@mui/material/styles';

import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';

/* =========================================================
   LIGHTBOX

   Full-screen photo viewer shared across the site.

   - keyboard: Esc closes, ← / → navigate
   - click backdrop to close, click image to keep open
   - locks body scroll while open
   - photo counter, caption, and a thumbnail filmstrip
   - gentle zoom-in on each photo change

   Controlled: the parent owns `index` (null = closed).
========================================================= */

export type LightboxPhoto = {
  src: string;
  alt: string;
};

type LightboxProps = {
  photos: LightboxPhoto[];
  index: number | null;
  onClose: () => void;
  onIndexChange: (nextIndex: number) => void;
};

const stop = (event: React.MouseEvent) =>
  event.stopPropagation();

export default function Lightbox({
  photos,
  index,
  onClose,
  onIndexChange,
}: LightboxProps) {
  const isOpen =
    index !== null &&
    index >= 0 &&
    index < photos.length;

  const goPrev = useCallback(() => {
    if (index === null) {
      return;
    }

    onIndexChange(
      (index - 1 + photos.length) %
        photos.length,
    );
  }, [index, photos.length, onIndexChange]);

  const goNext = useCallback(() => {
    if (index === null) {
      return;
    }

    onIndexChange(
      (index + 1) % photos.length,
    );
  }, [index, photos.length, onIndexChange]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function handleKey(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose();
      } else if (event.key === 'ArrowLeft') {
        goPrev();
      } else if (event.key === 'ArrowRight') {
        goNext();
      }
    }

    document.addEventListener(
      'keydown',
      handleKey,
    );

    const previousOverflow =
      document.body.style.overflow;

    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener(
        'keydown',
        handleKey,
      );

      document.body.style.overflow =
        previousOverflow;
    };
  }, [isOpen, onClose, goPrev, goNext]);

  if (
    !isOpen ||
    typeof document === 'undefined'
  ) {
    return null;
  }

  const active = photos[index];
  const hasMany = photos.length > 1;

  const whiteBtnSx = {
    color: 'common.white',
    bgcolor: 'rgba(255, 255, 255, 0.12)',
    '&:hover': {
      bgcolor: 'rgba(255, 255, 255, 0.22)',
    },
  } as const;

  return createPortal(
    <Box
      role="dialog"
      aria-modal="true"
      aria-label="Photo viewer"
      onClick={onClose}
      sx={{
        position: 'fixed',
        inset: 0,
        // Above the sticky navbar and the floating social bar,
        // which use very high z-indexes of their own.
        zIndex: 2147483000,

        display: 'flex',
        flexDirection: 'column',

        bgcolor: (theme) =>
          alpha(
            theme.palette.common.black,
            0.94,
          ),

        animation:
          'harmony-lightbox-fade 200ms ease-out',

        '@keyframes harmony-lightbox-fade': {
          from: { opacity: 0 },
          to: { opacity: 1 },
        },

        '@media (prefers-reduced-motion: reduce)':
          {
            animation: 'none',
          },
      }}
    >
      {/* TOP BAR */}

      <Box
        onClick={stop}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',

          px: { xs: 1.5, md: 3 },
          py: 1.5,
        }}
      >
        <Typography
          variant="caption"
          sx={{
            letterSpacing: '0.08em',
            color: (theme) =>
              alpha(
                theme.palette.common.white,
                0.8,
              ),
          }}
        >
          {index + 1} / {photos.length}
        </Typography>

        <IconButton
          aria-label="Close photo viewer"
          onClick={onClose}
          sx={whiteBtnSx}
        >
          <CloseRoundedIcon />
        </IconButton>
      </Box>

      {/* STAGE */}

      <Box
        sx={{
          position: 'relative',
          flex: 1,
          minHeight: 0,

          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',

          px: { xs: 1, md: 8 },
        }}
      >
        {hasMany ? (
          <>
            <IconButton
              aria-label="Previous photo"
              onClick={(event) => {
                event.stopPropagation();
                goPrev();
              }}
              sx={{
                position: 'absolute',
                left: { xs: 2, md: 24 },
                zIndex: 1,
                ...whiteBtnSx,
              }}
            >
              <ChevronLeftRoundedIcon />
            </IconButton>

            <IconButton
              aria-label="Next photo"
              onClick={(event) => {
                event.stopPropagation();
                goNext();
              }}
              sx={{
                position: 'absolute',
                right: { xs: 2, md: 24 },
                zIndex: 1,
                ...whiteBtnSx,
              }}
            >
              <ChevronRightRoundedIcon />
            </IconButton>
          </>
        ) : null}

        <Box
          key={index}
          sx={{
            position: 'relative',
            width: 'min(1200px, 100%)',
            height: '100%',

            animation:
              'harmony-lightbox-zoom 260ms cubic-bezier(0.22, 1, 0.36, 1)',

            '@keyframes harmony-lightbox-zoom':
              {
                from: {
                  opacity: 0,
                  transform: 'scale(0.985)',
                },
                to: {
                  opacity: 1,
                  transform: 'scale(1)',
                },
              },

            '@media (prefers-reduced-motion: reduce)':
              {
                animation: 'none',
              },
          }}
        >
          <Image
            src={active.src}
            alt={active.alt}
            fill
            priority
            sizes="100vw"
            style={{ objectFit: 'contain' }}
          />
        </Box>
      </Box>

      {/* CAPTION */}

      {active.alt ? (
        <Typography
          variant="caption"
          sx={{
            px: 2,
            pt: 1,
            textAlign: 'center',
            color: (theme) =>
              alpha(
                theme.palette.common.white,
                0.82,
              ),
          }}
        >
          {active.alt}
        </Typography>
      ) : null}

      {/* THUMBNAIL STRIP */}

      {hasMany ? (
        <Box
          onClick={stop}
          sx={{
            display: 'flex',
            gap: 1,
            justifyContent: {
              xs: 'flex-start',
              md: 'center',
            },

            px: 2,
            pt: 1,
            pb: { xs: 1.5, md: 2 },

            overflowX: 'auto',
            scrollbarWidth: 'none',
            '&::-webkit-scrollbar': {
              display: 'none',
            },
          }}
        >
          {photos.map((photo, thumbIndex) => {
            const isActive =
              thumbIndex === index;

            return (
              <Box
                key={`${photo.src}-${thumbIndex}`}
                component="button"
                type="button"
                aria-label={`Go to photo ${
                  thumbIndex + 1
                }`}
                aria-current={
                  isActive ? 'true' : undefined
                }
                onClick={() =>
                  onIndexChange(thumbIndex)
                }
                sx={{
                  position: 'relative',
                  flex: '0 0 auto',

                  width: { xs: 52, md: 72 },
                  height: { xs: 38, md: 52 },

                  p: 0,
                  m: 0,

                  border: '2px solid',
                  borderColor: isActive
                    ? 'secondary.main'
                    : 'transparent',

                  borderRadius: 1,
                  overflow: 'hidden',

                  cursor: 'pointer',
                  appearance: 'none',

                  opacity: isActive ? 1 : 0.5,

                  transition:
                    'opacity 160ms ease, border-color 160ms ease',

                  '&:hover': { opacity: 1 },

                  '@media (prefers-reduced-motion: reduce)':
                    {
                      transition: 'none',
                    },
                }}
              >
                <Image
                  src={photo.src}
                  alt=""
                  fill
                  sizes="72px"
                  style={{
                    objectFit: 'cover',
                  }}
                />
              </Box>
            );
          })}
        </Box>
      ) : null}
    </Box>,
    document.body,
  );
}
