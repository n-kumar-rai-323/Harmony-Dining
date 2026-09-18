'use client';

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import Link from 'next/link';

import {
  Box,
  Button,
  Container,
  IconButton,
  Rating,
  Typography,
} from '@mui/material';

import { alpha } from '@mui/material/styles';

import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';

import {
  AnimatePresence,
  motion,
  useAnimate,
  useReducedMotion,
} from 'motion/react';

import { HARMONY_BRAND } from '@/theme/theme-tokens';

import {
  initialReviewsContent,
  type ReviewItem,
  type ReviewsShowcaseContent,
} from './reviews-showcase.content';

/* =========================================================
   THE HARMONY GUESTBOOK

   A two-page "open book" testimonial carousel: the guest's
   photo on the left page, their review as a pull-quote on
   the right. The quote page does a real magazine-style page
   turn — front face (outgoing text) rotates away on a hinge,
   a blank paper back face takes over once it passes 90°, so
   the reader is never looking at edge-on/mirrored text.
========================================================= */

export {
  initialReviewsContent,
  type ReviewItem,
  type ReviewsShowcaseContent,
};

type GuestbookCarouselProps = {
  content?: ReviewsShowcaseContent;
};

const AUTO_ROTATE_MS = 6000;
const FLIP_MS = 650;
const FLIP_EASE = [0.45, 0, 0.2, 1] as const;

/* Fixed "physical book" palette — reuses the site's real brand
   tokens (not the site's swappable light/dark theme, since the
   book prop should look the same no matter which theme a
   visitor has picked). */
const EMERALD_DARK = HARMONY_BRAND.emeraldDark;
const GOLD = HARMONY_BRAND.gold;
const GOLD_LIGHT = HARMONY_BRAND.goldLight;
const PAGE_CREAM = '#F6F1E4';
const PAGE_CREAM_DEEP = '#EEE2C6';
const INK = '#2B2620';
const INK_MUTED = '#7A6E5C';

/** Shown on the photo page when a guest didn't upload their own photo. */
const DEFAULT_GUEST_PHOTO = '/images/home/harmony-hero-restaurant.jpg';

/* =========================================================
   HELPERS
========================================================= */

function getInitials(name: string) {
  const normalized = name.trim();
  if (!normalized) return 'H';

  return normalized
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function normalizeRating(rating: number) {
  if (!Number.isFinite(rating)) return 0;
  return Math.min(5, Math.max(0, rating));
}

function formatGuestDate(value?: string | null) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  return new Intl.DateTimeFormat('en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

/* Synthesizes a short paper "riffle" for the page-turn nav buttons —
   filtered noise, no audio file to license/host. Browsers only allow
   an AudioContext to make sound after a real user gesture, so this
   naturally stays silent until the visitor actually clicks Prev/Next. */
function usePageTurnSound() {
  const ctxRef = useRef<AudioContext | null>(null);

  return useCallback(() => {
    if (typeof window === 'undefined') return;

    const AudioCtx =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!AudioCtx) return;

    try {
      const ctx = ctxRef.current ?? new AudioCtx();
      ctxRef.current = ctx;
      if (ctx.state === 'suspended') void ctx.resume();

      const duration = 0.26;
      const buffer = ctx.createBuffer(
        1,
        Math.floor(ctx.sampleRate * duration),
        ctx.sampleRate,
      );
      const data = buffer.getChannelData(0);
      for (let i = 0; i < data.length; i += 1) {
        data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const bandpass = ctx.createBiquadFilter();
      bandpass.type = 'bandpass';
      bandpass.Q.value = 0.7;
      bandpass.frequency.setValueAtTime(1900, ctx.currentTime);
      bandpass.frequency.exponentialRampToValueAtTime(
        550,
        ctx.currentTime + duration,
      );

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.0001, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.32, ctx.currentTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(
        0.0001,
        ctx.currentTime + duration,
      );

      noise.connect(bandpass);
      bandpass.connect(gain);
      gain.connect(ctx.destination);

      noise.start();
      noise.stop(ctx.currentTime + duration);
    } catch {
      // Audio is a nice-to-have flourish — never let it break navigation.
    }
  }, []);
}

/* A simple leaf/petal corner flourish, tucked over the photo's
   corner and filled the same cream as the page — it reads as an
   antique photo-corner mount, not a decoration in its own right. */
function CornerFlourish({ corner }: { corner: 'tl' | 'br' }) {
  const rotation = corner === 'tl' ? 0 : 180;

  return (
    <Box
      aria-hidden
      component="svg"
      viewBox="0 0 40 40"
      sx={{
        position: 'absolute',
        top: corner === 'tl' ? 0 : 'auto',
        left: corner === 'tl' ? 0 : 'auto',
        bottom: corner === 'br' ? 0 : 'auto',
        right: corner === 'br' ? 0 : 'auto',
        width: 30,
        height: 30,
        transform: `rotate(${rotation}deg)`,
        pointerEvents: 'none',
        zIndex: 2,
      }}
    >
      <path
        d="M0 0 C 16 0, 26 10, 26 26 C 15 22, 5 16, 0 0 Z"
        fill={PAGE_CREAM}
      />
      <path
        d="M1 1 C 11 4, 18 11, 21 21"
        fill="none"
        stroke={GOLD}
        strokeOpacity={0.4}
        strokeWidth={1}
      />
      <circle cx="6.5" cy="6.5" r="1.7" fill={GOLD} />
    </Box>
  );
}

/* The quote page's content — shared between the static base layer and
   the flap's front face so the two never drift out of sync visually. */
function QuotePageContent({ review }: { review: ReviewItem }) {
  const guestDate = formatGuestDate(review.createdAt);

  return (
    <>
      {guestDate && (
        <Typography
          sx={{
            fontStyle: 'italic',
            fontFamily: 'var(--font-cormorant), Georgia, serif',
            color: INK_MUTED,
            fontSize: '0.85rem',
          }}
        >
          {guestDate}
        </Typography>
      )}

      <Typography
        component="blockquote"
        sx={{
          mt: guestDate ? 1 : 0,
          fontFamily: 'var(--font-cormorant), Georgia, serif',
          fontWeight: 700,
          fontSize: { xs: '1.2rem', sm: '1.38rem' },
          lineHeight: 1.32,
          color: INK,
          overflowWrap: 'break-word',
        }}
      >
        “{review.review}”
      </Typography>

      <Rating
        value={normalizeRating(review.rating)}
        readOnly
        size="small"
        sx={{
          mt: 1.6,
          color: GOLD,
          '& .MuiRating-iconEmpty': { color: alpha(GOLD, 0.35) },
        }}
      />
    </>
  );
}

/* =========================================================
   GUESTBOOK CAROUSEL
========================================================= */

export default function GuestbookCarousel({
  content = initialReviewsContent,
}: GuestbookCarouselProps) {
  const { enabled = true, eyebrow, title, accentTitle, description, reviews, footerText, cta } =
    content;

  const validReviews = useMemo(
    () =>
      reviews.filter(
        (review) =>
          review.id.trim().length > 0 &&
          review.name.trim().length > 0 &&
          review.review.trim().length > 0,
      ),
    [reviews],
  );

  const hasCta = Boolean(cta?.label?.trim()) && Boolean(cta?.href?.trim());

  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const shouldReduceMotion = useReducedMotion();
  const playPageTurn = usePageTurnSound();

  // The page-turn: `flip` is set while the outgoing page is mid-rotation;
  // the target review is already showing underneath the whole time, so
  // when the flap finishes turning away there's nothing left to swap.
  const [flip, setFlip] = useState<{ toIndex: number; dir: 1 | -1 } | null>(null);
  const [flapScope, animateFlap] = useAnimate();
  const isFlippingRef = useRef(false);

  const runFlip = useCallback(
    (toIndex: number, dir: 1 | -1, opts: { silent?: boolean } = {}) => {
      if (isFlippingRef.current || toIndex === activeIndex) return;

      if (!opts.silent) playPageTurn();

      if (shouldReduceMotion || validReviews.length <= 1) {
        setActiveIndex(toIndex);
        return;
      }

      isFlippingRef.current = true;
      setFlip({ toIndex, dir });
    },
    [activeIndex, playPageTurn, shouldReduceMotion, validReviews.length],
  );

  useEffect(() => {
    if (!flip || !flapScope.current) return;

    let cancelled = false;
    const targetDeg = flip.dir === 1 ? -172 : 172;

    void animateFlap(
      flapScope.current,
      { rotateY: targetDeg },
      { duration: FLIP_MS / 1000, ease: FLIP_EASE },
    ).then(() => {
      if (cancelled) return;
      setActiveIndex(flip.toIndex);
      setFlip(null);
      isFlippingRef.current = false;
    });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flip]);

  useEffect(() => {
    if (shouldReduceMotion || isPaused || validReviews.length <= 1) return;

    const timer = window.setTimeout(() => {
      const toIndex = (activeIndex + 1) % validReviews.length;
      runFlip(toIndex, 1, { silent: true });
    }, AUTO_ROTATE_MS);

    return () => window.clearTimeout(timer);
  }, [activeIndex, isPaused, runFlip, shouldReduceMotion, validReviews.length]);

  const safeActiveIndex =
    validReviews.length === 0 ? 0 : Math.min(activeIndex, validReviews.length - 1);

  const activeReview = validReviews[safeActiveIndex] ?? null;

  const goPrev = () => {
    const toIndex = (safeActiveIndex - 1 + validReviews.length) % validReviews.length;
    runFlip(toIndex, -1);
  };

  const goNext = () => {
    const toIndex = (safeActiveIndex + 1) % validReviews.length;
    runFlip(toIndex, 1);
  };

  if (!enabled || !activeReview || validReviews.length === 0) {
    return null;
  }

  // The review that should be visible once things settle — already true
  // underneath the flap while it's turning, so photo + text land together.
  const displayReview = flip ? (validReviews[flip.toIndex] ?? activeReview) : activeReview;
  const occasion = displayReview.occasion?.trim();
  const extraPhotoCount = Math.max(0, (displayReview.photoCount ?? 0) - 1);

  const photoTransition = {
    duration: shouldReduceMotion ? 0.01 : FLIP_MS / 1000,
    ease: FLIP_EASE,
  };

  return (
    <Box
      component="section"
      id="reviews"
      aria-labelledby="guestbook-title"
      sx={{
        bgcolor: 'background.default',
        color: 'text.primary',
        py: { xs: 8, sm: 9, md: 11, lg: 12 },
        transition: 'background-color 220ms ease, color 220ms ease',
        '@media (prefers-reduced-motion: reduce)': { transition: 'none' },
      }}
    >
      <Container maxWidth="lg">
        {/* =====================================================
            THE GUESTBOOK CARD
        ====================================================== */}

        <Box
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onFocusCapture={() => setIsPaused(true)}
          onBlurCapture={() => setIsPaused(false)}
          onKeyDown={(event) => {
            if (event.key === 'ArrowLeft') goPrev();
            if (event.key === 'ArrowRight') goNext();
          }}
          sx={{
            mx: 'auto',
            textAlign: 'center',
          }}
        >
          {eyebrow && (
            <Typography
              variant="overline"
              sx={{
                color: 'secondary.dark',
                letterSpacing: '0.22em',
                fontWeight: 800,
              }}
            >
              {eyebrow}
            </Typography>
          )}

          <Typography
            id="guestbook-title"
            component="h2"
            variant="h2"
            sx={{
              mt: eyebrow ? 1 : 0,
              color: 'text.primary',
              overflowWrap: 'break-word',
              hyphens: 'auto',
            }}
          >
            {title}
            {accentTitle && (
              <Box component="span" sx={{ color: 'secondary.dark' }}>
                {' '}
                {accentTitle}
              </Box>
            )}
          </Typography>

          {description && (
            <Typography
              sx={{
                mt: 1.6,
                maxWidth: 600,
                mx: 'auto',
                color: 'text.secondary',
                fontSize: '1rem',
              }}
            >
              {description}
            </Typography>
          )}

          {/* =================================================
              THE BOOK
          ================================================== */}

          <Box
            sx={{
              mt: { xs: 4.5, sm: 5.5 },
              mx: 'auto',
              width: '100%',
              maxWidth: { xs: '100%', sm: 620, md: 720, lg: 780 },
            }}
          >
            <Box
              sx={{
                position: 'relative',
                width: '100%',
                minHeight: { xs: 'auto', sm: 440, md: 490 },
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                bgcolor: PAGE_CREAM,
                borderRadius: '6px',
                overflow: 'hidden',
                boxShadow: '0 18px 40px rgba(0,0,0,0.35)',
                textAlign: 'left',
              }}
            >
              {/* SPINE */}
              <Box
                aria-hidden
                sx={{
                  display: { xs: 'none', sm: 'block' },
                  position: 'absolute',
                  left: '56%',
                  top: 0,
                  bottom: 0,
                  width: '2px',
                  background: `linear-gradient(to bottom, transparent, ${alpha(INK, 0.18)} 20%, ${alpha(INK, 0.18)} 80%, transparent)`,
                  zIndex: 3,
                }}
              />

              {/* LEFT PAGE — PHOTO */}
              <Box
                sx={{
                  width: { xs: '100%', sm: '56%' },
                  flexShrink: 0,
                  height: { xs: 320, sm: 'auto' },
                  p: '14px',
                  bgcolor: PAGE_CREAM,
                }}
              >
                <Box
                  sx={{
                    position: 'relative',
                    width: '100%',
                    height: '100%',
                    borderRadius: '4px',
                    overflow: 'hidden',
                    bgcolor: PAGE_CREAM_DEEP,
                  }}
                >
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.div
                      key={displayReview.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={photoTransition}
                      style={{ position: 'absolute', inset: 0 }}
                    >
                      <Box
                        component="img"
                        src={displayReview.avatarUrl || DEFAULT_GUEST_PHOTO}
                        alt={
                          displayReview.avatarUrl
                            ? `${displayReview.name}'s photo`
                            : 'Harmony Dining & Event Center'
                        }
                        sx={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          objectPosition: 'center top',
                          display: 'block',
                        }}
                      />

                      {!displayReview.avatarUrl && (
                        <Box
                          aria-hidden
                          sx={{
                            position: 'absolute',
                            inset: 0,
                            bgcolor: alpha(EMERALD_DARK, 0.45),
                            display: 'grid',
                            placeItems: 'center',
                          }}
                        >
                          <Box
                            sx={{
                              width: { xs: 56, sm: 64 },
                              height: { xs: 56, sm: 64 },
                              borderRadius: '50%',
                              display: 'grid',
                              placeItems: 'center',
                              bgcolor: alpha(EMERALD_DARK, 0.55),
                              border: '2px solid',
                              borderColor: alpha(GOLD, 0.7),
                            }}
                          >
                            <Typography
                              sx={{
                                fontFamily: 'var(--font-cormorant), Georgia, serif',
                                fontWeight: 700,
                                fontSize: { xs: 22, sm: 25 },
                                color: GOLD,
                              }}
                            >
                              {getInitials(displayReview.name)}
                            </Typography>
                          </Box>
                        </Box>
                      )}

                      {/* BOTTOM CAPTION OVERLAY */}
                      <Box
                        sx={{
                          position: 'absolute',
                          left: 0,
                          right: 0,
                          bottom: 0,
                          pt: { xs: 3.5, sm: 5 },
                          pb: 1.3,
                          px: 1.5,
                          background: `linear-gradient(to top, ${alpha(EMERALD_DARK, 0.94)}, ${alpha(EMERALD_DARK, 0)})`,
                        }}
                      >
                        <Typography
                          sx={{
                            color: '#FFFFFF',
                            fontFamily: 'var(--font-cormorant), Georgia, serif',
                            fontWeight: 700,
                            fontSize: { xs: 14.5, sm: 15.5 },
                            overflowWrap: 'anywhere',
                          }}
                        >
                          {displayReview.name}
                        </Typography>

                        {occasion && (
                          <Typography
                            sx={{
                              mt: 0.3,
                              color: GOLD_LIGHT,
                              fontSize: 10,
                              fontWeight: 800,
                              letterSpacing: '0.12em',
                              textTransform: 'uppercase',
                              overflowWrap: 'anywhere',
                            }}
                          >
                            ✦ {occasion} ✦
                          </Typography>
                        )}
                      </Box>

                      {/* This guest uploaded more than one photo — only the
                          first is shown here, so say so rather than hiding it. */}
                      {extraPhotoCount > 0 && (
                        <Box
                          sx={{
                            position: 'absolute',
                            top: 8,
                            right: 8,
                            px: 0.9,
                            py: 0.3,
                            borderRadius: 999,
                            bgcolor: alpha(EMERALD_DARK, 0.75),
                            border: '1px solid',
                            borderColor: alpha(GOLD, 0.6),
                          }}
                        >
                          <Typography
                            sx={{
                              color: GOLD_LIGHT,
                              fontSize: 10.5,
                              fontWeight: 800,
                            }}
                          >
                            +{extraPhotoCount}
                          </Typography>
                        </Box>
                      )}
                    </motion.div>
                  </AnimatePresence>

                  <CornerFlourish corner="tl" />
                  <CornerFlourish corner="br" />
                </Box>
              </Box>

              {/* HORIZONTAL SPINE — mobile only, marks the page break
                  between the stacked photo and quote so they read as two
                  distinct pages instead of one cramped block */}
              <Box
                aria-hidden
                sx={{
                  display: { xs: 'block', sm: 'none' },
                  height: '2px',
                  mx: '14px',
                  background: `linear-gradient(to right, transparent, ${alpha(INK, 0.18)} 20%, ${alpha(INK, 0.18)} 80%, transparent)`,
                }}
              />

              {/* RIGHT PAGE — QUOTE (real magazine-style page turn) */}
              <Box
                sx={{
                  position: 'relative',
                  width: { xs: '100%', sm: '44%' },
                  minHeight: { xs: 220, sm: 'auto' },
                  perspective: '1400px',
                }}
              >
                {/* BASE LAYER — the page that ends up visible once the
                    flap (if any) finishes turning away */}
                <Box
                  sx={{
                    height: '100%',
                    px: { xs: 2.5, sm: 4 },
                    py: { xs: 3, sm: 4 },
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    background: `linear-gradient(160deg, ${PAGE_CREAM} 0%, ${PAGE_CREAM_DEEP} 100%)`,
                  }}
                >
                  <QuotePageContent review={displayReview} />
                </Box>

                {/* FLAP — the outgoing page, turning over on a hinge at
                    the spine (next) or outer edge (previous) */}
                {flip && (
                  <Box
                    ref={flapScope}
                    aria-hidden
                    sx={{
                      position: 'absolute',
                      inset: 0,
                      transformStyle: 'preserve-3d',
                      transformOrigin: flip.dir === 1 ? 'left center' : 'right center',
                      willChange: 'transform',
                    }}
                  >
                    {/* FRONT FACE — outgoing content, visible 0°–~90° */}
                    <Box
                      sx={{
                        position: 'absolute',
                        inset: 0,
                        backfaceVisibility: 'hidden',
                        px: { xs: 2.5, sm: 4 },
                        py: { xs: 3, sm: 4 },
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        background: `linear-gradient(160deg, ${PAGE_CREAM} 0%, ${PAGE_CREAM_DEEP} 100%)`,
                        boxShadow: '-10px 0 26px rgba(0,0,0,0.2)',
                      }}
                    >
                      <QuotePageContent review={activeReview} />
                    </Box>

                    {/* BACK FACE — blank paper back, visible ~90°–180° */}
                    <Box
                      sx={{
                        position: 'absolute',
                        inset: 0,
                        backfaceVisibility: 'hidden',
                        transform: 'rotateY(180deg)',
                        bgcolor: PAGE_CREAM_DEEP,
                        boxShadow: 'inset 0 0 30px rgba(0,0,0,0.1)',
                      }}
                    />
                  </Box>
                )}
              </Box>
            </Box>
          </Box>

          {/* =================================================
              NAVIGATION
          ================================================== */}

          {validReviews.length > 1 && (
            <Box
              sx={{
                mt: { xs: 2.5, sm: 3 },
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 2,
              }}
            >
              <IconButton
                onClick={goPrev}
                aria-label="Previous story"
                sx={{
                  width: 38,
                  height: 38,
                  border: '1.5px solid',
                  borderColor: alpha(GOLD, 0.6),
                  color: GOLD,
                  bgcolor: 'transparent',
                  '&:hover': { bgcolor: alpha(GOLD, 0.12) },
                }}
              >
                <ChevronLeftRoundedIcon />
              </IconButton>

              <Typography
                sx={{
                  minWidth: 108,
                  textAlign: 'center',
                  fontFamily: 'var(--font-cormorant), Georgia, serif',
                  fontSize: '0.92rem',
                  color: 'text.secondary',
                }}
              >
                Page {safeActiveIndex + 1} of {validReviews.length}
              </Typography>

              <IconButton
                onClick={goNext}
                aria-label="Next story"
                sx={{
                  width: 38,
                  height: 38,
                  bgcolor: GOLD,
                  color: EMERALD_DARK,
                  '&:hover': { bgcolor: GOLD_LIGHT },
                }}
              >
                <ChevronRightRoundedIcon />
              </IconButton>
            </Box>
          )}
        </Box>

        {/* =====================================================
            FOOTER CTA
        ====================================================== */}

        {(footerText || hasCta) && (
          <Box
            sx={{
              mt: { xs: 3.7, md: 3.2 },
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              justifyContent: 'center',
              alignItems: 'center',
              gap: 1.8,
            }}
          >
            {footerText && (
              <Typography
                variant="caption"
                sx={{
                  color: 'text.secondary',
                  textAlign: 'center',
                  overflowWrap: 'break-word',
                }}
              >
                {footerText}
              </Typography>
            )}

            {hasCta && cta && (
              <Link href={cta.href} style={{ maxWidth: '100%', textDecoration: 'none' }}>
                <Button
                  variant="outlined"
                  endIcon={<ArrowForwardRoundedIcon sx={{ fontSize: '18px !important' }} />}
                  sx={{
                    minHeight: 46,
                    maxWidth: '100%',
                    px: 2.4,
                    color: 'text.primary',
                    borderColor: 'divider',
                    textAlign: 'center',
                    whiteSpace: 'normal',
                    overflowWrap: 'anywhere',
                    '&:hover': {
                      bgcolor: 'action.hover',
                      borderColor: 'secondary.main',
                    },
                  }}
                >
                  {cta.label}
                </Button>
              </Link>
            )}
          </Box>
        )}
      </Container>
    </Box>
  );
}
