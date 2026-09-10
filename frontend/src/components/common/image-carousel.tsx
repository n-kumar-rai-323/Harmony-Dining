'use client';

import {
  useEffect,
  useRef,
  useState,
} from 'react';

import Image from 'next/image';

import {
  Box,
  IconButton,
  useMediaQuery,
} from '@mui/material';

import { alpha } from '@mui/material/styles';

import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';

/* =========================================================
   IMAGE CAROUSEL

   Presentational only. The parent passes up to 5 slides and
   fills a `position: relative` container with this component.

   Future flow:

   Admin Dashboard
        ↓
   NestJS API  (max 5 photos per slot)
        ↓
   Section component  → <ImageCarousel slides={...} />

   Motion: a gentle left → right → left ("ping-pong") slide
   between photos, with arrow controls for manual stepping.
========================================================= */

export type CarouselSlide = {
  src: string;
  alt: string;
  position?: string;
};

const MAX_SLIDES = 5;

const SLIDE_INTERVAL_MS = 4500;

const SLIDE_TRANSITION_MS = 900;

type ImageCarouselProps = {
  slides: CarouselSlide[];
  sizes?: string;
  /** `priority` on the first image — set on above-the-fold slots only. */
  priorityFirst?: boolean;
  /** next/image quality (defaults to 80). */
  quality?: number;
  /** Show the prev/next arrows. Off for full-bleed background use. */
  controls?: boolean;
};

export default function ImageCarousel({
  slides,
  sizes = '(max-width: 1199px) 100vw, 55vw',
  priorityFirst = true,
  quality = 80,
  controls = true,
}: ImageCarouselProps) {
  const items = slides.slice(0, MAX_SLIDES);

  const count = items.length;

  const prefersReducedMotion = useMediaQuery(
    '(prefers-reduced-motion: reduce)',
  );

  const [activeIndex, setActiveIndex] =
    useState(0);

  const [isPaused, setIsPaused] =
    useState(false);

  /* Travel direction for the ping-pong sweep: 1 forward, -1 back. */
  const directionRef = useRef(1);

  useEffect(() => {
    if (
      count <= 1 ||
      isPaused ||
      prefersReducedMotion
    ) {
      return;
    }

    const timer = window.setTimeout(() => {
      setActiveIndex((current) => {
        let direction = directionRef.current;

        let next = current + direction;

        if (next > count - 1) {
          next = count - 2;
          direction = -1;
        } else if (next < 0) {
          next = 1;
          direction = 1;
        }

        directionRef.current = direction;

        return next;
      });
    }, SLIDE_INTERVAL_MS);

    return () => {
      window.clearTimeout(timer);
    };
  }, [
    activeIndex,
    count,
    isPaused,
    prefersReducedMotion,
  ]);

  /* Keep the index valid if the slide list changes length. */
  const safeIndex =
    count === 0
      ? 0
      : Math.min(activeIndex, count - 1);

  function goTo(step: 1 | -1) {
    directionRef.current = step;

    setActiveIndex((current) => {
      const next = current + step;

      if (next < 0) {
        return count - 1;
      }

      if (next > count - 1) {
        return 0;
      }

      return next;
    });
  }

  if (count === 0) {
    return null;
  }

  if (count === 1) {
    return (
      <Image
        src={items[0].src}
        alt={items[0].alt}
        fill
        priority={priorityFirst}
        quality={quality}
        sizes={sizes}
        style={{
          objectFit: 'cover',
          objectPosition:
            items[0].position ?? 'center',
        }}
      />
    );
  }

  return (
    <Box
      role="group"
      aria-roledescription="carousel"
      aria-label="Photo highlights"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocusCapture={() => setIsPaused(true)}
      onBlurCapture={() => setIsPaused(false)}
      sx={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          height: '100%',
          width: `${count * 100}%`,
          transform: `translateX(-${
            safeIndex * (100 / count)
          }%)`,
          transition: prefersReducedMotion
            ? 'none'
            : `transform ${SLIDE_TRANSITION_MS}ms cubic-bezier(0.4, 0, 0.2, 1)`,
          willChange: 'transform',
        }}
      >
        {items.map((slide, index) => (
          <Box
            key={`${slide.src}-${index}`}
            role="group"
            aria-roledescription="slide"
            aria-label={`${index + 1} of ${count}`}
            aria-hidden={index !== safeIndex}
            sx={{
              position: 'relative',
              flex: `0 0 ${100 / count}%`,
              height: '100%',
            }}
          >
            <Image
              src={slide.src}
              alt={slide.alt}
              fill
              priority={priorityFirst && index === 0}
              quality={quality}
              sizes={sizes}
              style={{
                objectFit: 'cover',
                objectPosition:
                  slide.position ?? 'center',
              }}
            />
          </Box>
        ))}
      </Box>

      {/* =====================================================
          ARROW CONTROLS
      ===================================================== */}

      {controls ? (
        <>
          <CarouselArrow
            edge="left"
            label="Previous photo"
            onClick={() => goTo(-1)}
          >
            <ChevronLeftRoundedIcon />
          </CarouselArrow>

          <CarouselArrow
            edge="right"
            label="Next photo"
            onClick={() => goTo(1)}
          >
            <ChevronRightRoundedIcon />
          </CarouselArrow>
        </>
      ) : null}
    </Box>
  );
}

/* =========================================================
   ARROW BUTTON

   Mirrors the hero label card: translucent primary.dark
   surface, gold hairline border, subtle blur.
========================================================= */

function CarouselArrow({
  edge,
  label,
  onClick,
  children,
}: {
  edge: 'left' | 'right';
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <IconButton
      type="button"
      aria-label={label}
      onClick={onClick}
      sx={{
        position: 'absolute',
        top: '50%',
        transform: 'translateY(-50%)',
        [edge]: { xs: 10, md: 16 },
        zIndex: 2,

        width: { xs: 38, md: 44 },
        height: { xs: 38, md: 44 },

        color: 'primary.contrastText',

        bgcolor: (theme) =>
          alpha(theme.palette.primary.dark, 0.82),

        border: '1px solid',
        borderColor: (theme) =>
          alpha(theme.palette.secondary.main, 0.32),

        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',

        boxShadow: (theme) => theme.shadows[8],

        transition:
          'background-color 180ms ease, color 180ms ease',

        '&:hover': {
          bgcolor: (theme) =>
            alpha(theme.palette.primary.dark, 0.95),
          color: 'secondary.light',
        },

        '@media (prefers-reduced-motion: reduce)': {
          transition: 'none',
        },
      }}
    >
      {children}
    </IconButton>
  );
}
