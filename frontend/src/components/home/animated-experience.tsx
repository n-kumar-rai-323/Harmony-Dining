'use client';

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

import Image from 'next/image';

import {
  Box,
  Container,
  Typography,
  useMediaQuery,
} from '@mui/material';

import {
  alpha,
  useTheme,
} from '@mui/material/styles';

import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
} from 'motion/react';

/* =========================================================
   TYPES

   IMPORTANT ARCHITECTURE

   This component stays Client Component only because
   Motion needs browser scroll state.

   Future production flow:

   Server Component / page
        ↓
   fetch published homepage content
        ↓
   pass serializable content prop
        ↓
   AnimatedExperience

   Admin Dashboard
        ↓
   NestJS API
        ↓
   PostgreSQL
        ↓
   published homepage content

   No admin/API logic belongs inside this visual component.
========================================================= */

export type ExperienceStory = {
  id: string;
  eyebrow?: string;
  title: string;
  description?: string;

  image: string;
  imageAlt: string;
  imagePosition?: string;
};

export type AnimatedExperienceContent = {
  eyebrow?: string;
  title: string;
  description?: string;

  stories: ExperienceStory[];
};

type AnimatedExperienceProps = {
  content?: AnimatedExperienceContent;
};

/* =========================================================
   INITIAL DEVELOPMENT CONTENT

   This is only the current content source.

   Later the parent Server Component can do:

   const content =
     await getHomepageExperience();

   <AnimatedExperience content={content} />

   The UI below does not need to be redesigned.
========================================================= */

const initialExperienceContent: AnimatedExperienceContent = {
  eyebrow: 'The Harmony Experience',

  title: 'More than a place to dine.',

  description:
    'Discover the moments, people and details that shape every Harmony experience.',

  stories: [
    {
      id: 'celebrate-together',

      eyebrow: 'Celebrate Together',

      title:
        'A place made for meaningful occasions.',

      description:
        'From intimate gatherings to larger celebrations, Harmony gives every occasion room to feel special.',

      image:
        '/images/home/harmony-experience-event.jpg',

      imageAlt:
        'Celebration and event experience at Harmony',

      imagePosition: 'center',
    },
    {
      id: 'warm-hospitality',

      eyebrow: 'Warm Hospitality',

      title:
        'People who make every visit feel personal.',

      description:
        'Good hospitality is more than service. It is the feeling of being welcomed, cared for and remembered.',

      image:
        '/images/home/harmony-experience-team.jpg',

      imageAlt:
        'Hospitality team experience at Harmony',

      imagePosition: 'center',
    },
    {
      id: 'behind-the-kitchen',

      eyebrow: 'Behind the Kitchen',

      title:
        'Care goes into every plate before it reaches the table.',

      description:
        'Every dining experience begins behind the scenes with preparation, teamwork and attention to detail.',

      image:
        '/images/home/harmony-experience-kitchen.jpg',

      imageAlt:
        'Kitchen preparation and teamwork at Harmony',

      imagePosition: 'center',
    },
  ],
};

/* =========================================================
   HELPERS
========================================================= */

function formatStoryNumber(value: number) {
  return String(value).padStart(2, '0');
}

/* =========================================================
   COMPONENT
========================================================= */

export default function AnimatedExperience({
  content = initialExperienceContent,
}: AnimatedExperienceProps) {
  const desktopSectionRef =
    useRef<HTMLDivElement | null>(null);

  const [activeIndex, setActiveIndex] =
    useState(0);

  const shouldReduceMotion =
    useReducedMotion();

  const {
    eyebrow,
    title,
    description,
    stories,
  } = content;

  const validStories = stories.filter(
    (story) =>
      Boolean(story.id?.trim()) &&
      Boolean(story.title?.trim()) &&
      Boolean(story.image?.trim()),
  );

  const storyCount = validStories.length;

  const desktopScrollHeight = `${Math.max(
    storyCount,
    1,
  ) * 100}vh`;

  // When there are no valid stories the section renders nothing below (see
  // the `!activeStory` guard), so `desktopSectionRef` never attaches to a DOM
  // node. Hooks can't be called conditionally, so instead point useScroll at
  // nothing in that case — it falls back to window scroll, which is discarded
  // anyway since the component returns null.
  const { scrollYProgress } = useScroll({
    target: storyCount > 0 ? desktopSectionRef : undefined,

    offset: ['start start', 'end end'],
  });

  /* =======================================================
     DYNAMIC STORY INDEX

     Adapts automatically when Admin publishes
     2, 3, 4, 5... stories.
  ======================================================= */

  useMotionValueEvent(
    scrollYProgress,
    'change',
    (latest) => {
      if (storyCount <= 1) {
        setActiveIndex(0);
        return;
      }

      const nextIndex = Math.min(
        Math.floor(
          latest * storyCount,
        ),
        storyCount - 1,
      );

      setActiveIndex((current) =>
        current === nextIndex
          ? current
          : nextIndex,
      );
    },
  );

  const safeActiveIndex =
    storyCount > 0
      ? Math.min(
          activeIndex,
          storyCount - 1,
        )
      : 0;

  const activeStory =
    validStories[safeActiveIndex] ?? null;

  /* =======================================================
     MOBILE STORY SLIDER

     Small screens get an auto-advancing horizontal card
     slider (scroll-snap + dot indicators) instead of the
     desktop scroll-pinned storytelling.
  ======================================================= */

  const theme = useTheme();

  const isMobileViewport = useMediaQuery(
    theme.breakpoints.down('md'),
  );

  const mobileTrackRef =
    useRef<HTMLDivElement | null>(null);

  const resumeTimerRef = useRef<
    number | null
  >(null);

  const [mobileIndex, setMobileIndex] =
    useState(0);

  const [mobilePaused, setMobilePaused] =
    useState(false);

  const safeMobileIndex =
    storyCount > 0
      ? Math.min(
          mobileIndex,
          storyCount - 1,
        )
      : 0;

  const scrollToStoryCard = useCallback(
    (index: number) => {
      const track = mobileTrackRef.current;

      if (!track) {
        return;
      }

      const card =
        track.querySelectorAll<HTMLElement>(
          '[data-experience-card]',
        )[index];

      if (!card) {
        return;
      }

      const paddingLeft =
        parseFloat(
          window.getComputedStyle(track)
            .paddingLeft,
        ) || 0;

      const delta =
        card.getBoundingClientRect().left -
        track.getBoundingClientRect().left -
        paddingLeft;

      track.scrollBy({
        left: delta,
        behavior: shouldReduceMotion
          ? 'auto'
          : 'smooth',
      });
    },
    [shouldReduceMotion],
  );

  const pauseAutoplay = useCallback(() => {
    setMobilePaused(true);

    if (resumeTimerRef.current !== null) {
      window.clearTimeout(
        resumeTimerRef.current,
      );
    }

    resumeTimerRef.current =
      window.setTimeout(() => {
        setMobilePaused(false);
        resumeTimerRef.current = null;
      }, 7000);
  }, []);

  useEffect(() => {
    return () => {
      if (resumeTimerRef.current !== null) {
        window.clearTimeout(
          resumeTimerRef.current,
        );
      }
    };
  }, []);

  /* Track the card in view (also catches manual swipes). */
  useEffect(() => {
    if (
      !isMobileViewport ||
      storyCount <= 1
    ) {
      return;
    }

    const track = mobileTrackRef.current;

    if (!track) {
      return;
    }

    const cards = Array.from(
      track.querySelectorAll<HTMLElement>(
        '[data-experience-card]',
      ),
    );

    if (cards.length === 0) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        let best: IntersectionObserverEntry | null =
          null;

        for (const entry of entries) {
          if (
            !best ||
            entry.intersectionRatio >
              best.intersectionRatio
          ) {
            best = entry;
          }
        }

        if (best && best.isIntersecting) {
          const nextIndex =
            cards.indexOf(
              best.target as HTMLElement,
            );

          if (nextIndex >= 0) {
            setMobileIndex(nextIndex);
          }
        }
      },
      {
        root: track,
        threshold: [0.4, 0.6, 0.9],
      },
    );

    cards.forEach((card) =>
      observer.observe(card),
    );

    return () => {
      observer.disconnect();
    };
  }, [isMobileViewport, storyCount]);

  /* Auto-advance. */
  useEffect(() => {
    if (
      !isMobileViewport ||
      storyCount <= 1 ||
      mobilePaused ||
      shouldReduceMotion
    ) {
      return;
    }

    const timer = window.setTimeout(() => {
      const next =
        (safeMobileIndex + 1) % storyCount;

      setMobileIndex(next);
      scrollToStoryCard(next);
    }, 4500);

    return () => {
      window.clearTimeout(timer);
    };
  }, [
    isMobileViewport,
    mobilePaused,
    safeMobileIndex,
    scrollToStoryCard,
    shouldReduceMotion,
    storyCount,
  ]);

  /*
   * Safe public empty-state:
   * If Admin unpublishes all stories,
   * do not render a broken/empty premium section.
   */

  if (!activeStory) {
    return null;
  }

  return (
    <Box
      component="section"
      aria-labelledby="harmony-experience-title"
      sx={{
        position: 'relative',

        bgcolor: 'background.default',
        color: 'text.primary',
      }}
    >
      {/* =====================================================
          MOBILE / SMALL TABLET

          - normal document flow
          - no sticky scroll trap
          - no excessive viewport height
          - admin-added stories simply add cards
      ====================================================== */}

      <Box
        sx={{
          display: {
            xs: 'block',
            md: 'none',
          },

          py: {
            xs: 7,
            sm: 8,
          },
        }}
      >
        <Container maxWidth="xl">
          {/* SECTION INTRO */}

          <Box
            sx={{
              minWidth: 0,

              mb: {
                xs: 3.5,
                sm: 4.5,
              },
            }}
          >
            {eyebrow && (
              <Box
                sx={{
                  display: 'flex',

                  alignItems: 'center',

                  minWidth: 0,

                  gap: 1.1,
                }}
              >
                <Box
                  aria-hidden
                  sx={{
                    width: 32,
                    height: 1,

                    flexShrink: 0,

                    bgcolor:
                      'secondary.main',
                  }}
                />

                <Typography
                  variant="overline"
                  sx={{
                    minWidth: 0,

                    color:
                      'secondary.main',

                    overflowWrap:
                      'anywhere',
                  }}
                >
                  {eyebrow}
                </Typography>
              </Box>
            )}

            <Typography
              id="harmony-experience-title"
              component="h2"
              variant="h2"
              sx={{
                mt: eyebrow
                  ? 1.6
                  : 0,

                maxWidth: 560,

                color: 'text.primary',

                overflowWrap:
                  'break-word',

                hyphens: 'auto',
              }}
            >
              {title}
            </Typography>

            {description && (
              <Typography
                component="p"
                variant="body1"
                sx={{
                  mt: 1.8,

                  maxWidth: 560,

                  color:
                    'text.secondary',

                  overflowWrap:
                    'break-word',
                }}
              >
                {description}
              </Typography>
            )}
          </Box>

          {/* STORY SLIDER */}

          <Box
            ref={mobileTrackRef}
            onPointerDown={pauseAutoplay}
            sx={{
              display: 'flex',

              gap: 1.75,

              mx: {
                xs: -2,
                sm: -3,
              },

              px: {
                xs: 2,
                sm: 3,
              },

              overflowX: 'auto',
              overflowY: 'hidden',

              scrollSnapType: 'x mandatory',

              WebkitOverflowScrolling: 'touch',

              scrollbarWidth: 'none',
              msOverflowStyle: 'none',

              '&::-webkit-scrollbar': {
                display: 'none',
              },
            }}
          >
            {validStories.map(
              (story, index) => (
                <Box
                  key={story.id}
                  component="article"
                  data-experience-card
                  sx={{
                    flex: '0 0 auto',

                    width: 'min(86%, 400px)',

                    scrollSnapAlign: 'start',

                    minWidth: 0,

                    overflow: 'hidden',

                    bgcolor:
                      'background.paper',

                    border:
                      '1px solid',

                    borderColor:
                      'divider',

                    borderRadius: {
                      xs: 1.5,
                      sm: 2,
                    },

                    boxShadow: (theme) =>
                      theme.shadows[6],
                  }}
                >
                  {/* IMAGE */}

                  <Box
                    sx={{
                      position:
                        'relative',

                      width: '100%',

                      aspectRatio: {
                        xs: '4 / 3',
                        sm: '16 / 10',
                      },

                      overflow:
                        'hidden',

                      bgcolor:
                        'action.hover',
                    }}
                  >
                    <Image
                      src={story.image}
                      alt={story.imageAlt}
                      fill
                      quality={75}
                      sizes="
                        (max-width: 599px) 100vw,
                        (max-width: 899px) 92vw,
                        720px
                      "
                      style={{
                        objectFit:
                          'cover',

                        objectPosition:
                          story.imagePosition ??
                          'center',
                      }}
                    />

                    <Box
                      aria-hidden
                      sx={{
                        position:
                          'absolute',

                        inset: 0,

                        background: (theme) =>
                          `linear-gradient(
                            180deg,
                            ${alpha(
                              theme.palette
                                .primary.dark,
                              0,
                            )} 52%,
                            ${alpha(
                              theme.palette
                                .primary.dark,
                              0.28,
                            )} 100%
                          )`,

                        pointerEvents:
                          'none',
                      }}
                    />

                    {/* STORY NUMBER */}

                    <Box
                      aria-hidden
                      sx={{
                        position:
                          'absolute',

                        top: {
                          xs: 14,
                          sm: 18,
                        },

                        right: {
                          xs: 14,
                          sm: 18,
                        },

                        display:
                          'grid',

                        placeItems:
                          'center',

                        minWidth: 38,

                        height: 38,

                        px: 1,

                        borderRadius:
                          999,

                        bgcolor: (theme) =>
                          alpha(
                            theme.palette
                              .primary.dark,
                            0.82,
                          ),

                        border:
                          '1px solid',

                        borderColor:
                          (theme) =>
                            alpha(
                              theme.palette
                                .secondary
                                .light,
                              0.32,
                            ),

                        backdropFilter:
                          'blur(10px)',

                        WebkitBackdropFilter:
                          'blur(10px)',
                      }}
                    >
                      <Typography
                        variant="caption"
                        sx={{
                          color:
                            'primary.contrastText',

                          fontWeight: 800,

                          letterSpacing:
                            '0.1em',
                        }}
                      >
                        {formatStoryNumber(
                          index + 1,
                        )}
                      </Typography>
                    </Box>
                  </Box>

                  {/* CONTENT */}

                  <Box
                    sx={{
                      minWidth: 0,

                      p: {
                        xs: 2.25,
                        sm: 3,
                      },
                    }}
                  >
                    {story.eyebrow && (
                      <Box
                        sx={{
                          display:
                            'flex',

                          alignItems:
                            'center',

                          minWidth: 0,

                          gap: 1,
                        }}
                      >
                        <Box
                          aria-hidden
                          sx={{
                            width: 26,

                            height: 1,

                            flexShrink: 0,

                            bgcolor:
                              'secondary.main',
                          }}
                        />

                        <Typography
                          variant="overline"
                          sx={{
                            minWidth: 0,

                            color:
                              'secondary.dark',

                            overflowWrap:
                              'anywhere',
                          }}
                        >
                          {story.eyebrow}
                        </Typography>
                      </Box>
                    )}

                    <Typography
                      component="h3"
                      variant="h3"
                      sx={{
                        mt:
                          story.eyebrow
                            ? 1.5
                            : 0,

                        color:
                          'text.primary',

                        overflowWrap:
                          'break-word',

                        hyphens:
                          'auto',
                      }}
                    >
                      {story.title}
                    </Typography>

                    {story.description && (
                      <Typography
                        component="p"
                        variant="body2"
                        sx={{
                          mt: 1.5,

                          color:
                            'text.secondary',

                          overflowWrap:
                            'break-word',
                        }}
                      >
                        {story.description}
                      </Typography>
                    )}

                    <Box
                      aria-hidden
                      sx={{
                        mt: 2,

                        display:
                          'flex',

                        alignItems:
                          'center',

                        gap: 1,
                      }}
                    >
                      <Typography
                        variant="caption"
                        sx={{
                          color:
                            'secondary.dark',

                          fontWeight: 800,

                          letterSpacing:
                            '0.12em',
                        }}
                      >
                        {formatStoryNumber(
                          index + 1,
                        )}
                      </Typography>

                      <Box
                        sx={{
                          width: 30,

                          height: 1,

                          bgcolor:
                            'secondary.main',

                          opacity:
                            0.45,
                        }}
                      />

                      <Typography
                        variant="caption"
                        sx={{
                          color:
                            'text.secondary',

                          fontWeight: 700,

                          letterSpacing:
                            '0.12em',
                        }}
                      >
                        {formatStoryNumber(
                          storyCount,
                        )}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              ),
            )}
          </Box>

          {/* DOT INDICATORS */}

          {storyCount > 1 && (
            <Box
              sx={{
                mt: {
                  xs: 2.5,
                  sm: 3,
                },

                display: 'flex',

                justifyContent: 'center',

                alignItems: 'center',

                gap: 1,
              }}
            >
              {validStories.map(
                (story, index) => {
                  const isActive =
                    index === safeMobileIndex;

                  return (
                    <Box
                      key={story.id}
                      component="button"
                      type="button"
                      aria-label={`Show story ${
                        index + 1
                      } of ${storyCount}`}
                      aria-current={
                        isActive
                          ? 'true'
                          : undefined
                      }
                      onClick={() => {
                        pauseAutoplay();
                        setMobileIndex(index);
                        scrollToStoryCard(index);
                      }}
                      sx={{
                        p: 0,

                        m: 0,

                        border: 'none',

                        appearance: 'none',

                        cursor: 'pointer',

                        height: 6,

                        width: isActive
                          ? 24
                          : 6,

                        borderRadius: 999,

                        bgcolor: isActive
                          ? 'secondary.main'
                          : 'divider',

                        transition:
                          'width 300ms ease, background-color 300ms ease',

                        '@media (prefers-reduced-motion: reduce)':
                          {
                            transition: 'none',
                          },
                      }}
                    />
                  );
                },
              )}
            </Box>
          )}
        </Container>
      </Box>

      {/* =====================================================
          DESKTOP EXPERIENCE

          Sticky storytelling stays desktop-only.

          Height automatically follows Admin-published
          story count:
          3 stories = 300vh
          4 stories = 400vh
          etc.
      ====================================================== */}

      <Box
        ref={desktopSectionRef}
        sx={{
          display: {
            xs: 'none',
            md: 'block',
          },

          position: 'relative',

          height:
            desktopScrollHeight,

          bgcolor:
            'background.default',

          transition:
            'background-color 220ms ease',

          '@media (prefers-reduced-motion: reduce)':
            {
              transition: 'none',
            },
        }}
      >
        <Box
          sx={{
            position: 'sticky',

            top: 0,

            width: '100%',

            height: '100svh',

            minHeight: 700,

            overflow: 'hidden',

            bgcolor:
              'background.default',

            transition:
              'background-color 220ms ease',

            '@media (prefers-reduced-motion: reduce)':
              {
                transition: 'none',
              },
          }}
        >
          {/* =================================================
              BACKGROUND IMAGE
          ================================================== */}

          <AnimatePresence
            mode="sync"
            initial={false}
          >
            <motion.div
              key={activeStory.id}
              initial={
                shouldReduceMotion
                  ? false
                  : {
                      opacity: 0,
                      scale: 1.04,
                    }
              }
              animate={{
                opacity: 1,
                scale: 1,
              }}
              exit={
                shouldReduceMotion
                  ? {
                      opacity: 0,
                    }
                  : {
                      opacity: 0,
                      scale: 1.02,
                    }
              }
              transition={{
                duration:
                  shouldReduceMotion
                    ? 0.15
                    : 0.75,

                ease: [
                  0.22,
                  1,
                  0.36,
                  1,
                ],
              }}
              style={{
                position:
                  'absolute',

                inset: 0,

                willChange:
                  'opacity, transform',
              }}
            >
              <Image
                src={
                  activeStory.image
                }
                alt=""
                fill
                quality={75}
                sizes="100vw"
                style={{
                  objectFit: 'cover',

                  objectPosition:
                    activeStory.imagePosition ??
                    'center',
                }}
              />
            </motion.div>
          </AnimatePresence>

          {/* =================================================
              IMAGE OVERLAY
          ================================================== */}

          <Box
            aria-hidden
            sx={{
              position: 'absolute',

              inset: 0,

              zIndex: 1,

              pointerEvents: 'none',

              background: (theme) => {
                const base =
                  theme.palette
                    .background
                    .default;

                if (
                  theme.palette
                    .mode === 'dark'
                ) {
                  return `
                    linear-gradient(
                      90deg,
                      ${alpha(
                        base,
                        0.98,
                      )} 0%,
                      ${alpha(
                        base,
                        0.9,
                      )} 28%,
                      ${alpha(
                        base,
                        0.62,
                      )} 52%,
                      ${alpha(
                        base,
                        0.24,
                      )} 76%,
                      ${alpha(
                        base,
                        0.08,
                      )} 100%
                    )
                  `;
                }

                return `
                  linear-gradient(
                    90deg,
                    ${alpha(
                      base,
                      0.97,
                    )} 0%,
                    ${alpha(
                      base,
                      0.86,
                    )} 28%,
                    ${alpha(
                      base,
                      0.58,
                    )} 52%,
                    ${alpha(
                      base,
                      0.2,
                    )} 76%,
                    ${alpha(
                      base,
                      0.04,
                    )} 100%
                  )
                `;
              },
            }}
          />

          {/* =================================================
              PREMIUM FRAME
          ================================================== */}

          <Box
            aria-hidden
            sx={{
              position: 'absolute',

              inset: {
                md: 24,
                lg: 28,
              },

              zIndex: 2,

              pointerEvents: 'none',

              border: '1px solid',

              borderColor: (theme) =>
                alpha(
                  theme.palette
                    .secondary.light,
                  0.24,
                ),

              borderRadius: 2,
            }}
          />

          {/* =================================================
              CONTENT
          ================================================== */}

          <Container
            maxWidth="xl"
            sx={{
              position: 'relative',

              zIndex: 4,

              height: '100%',

              display: 'flex',

              alignItems: 'center',
            }}
          >
            <Box
              sx={{
                width: '100%',

                minWidth: 0,

                maxWidth: 690,
              }}
            >
              <AnimatePresence
                mode="wait"
                initial={false}
              >
                <motion.div
                  key={
                    activeStory.id
                  }
                  initial={
                    shouldReduceMotion
                      ? {
                          opacity: 0,
                        }
                      : {
                          opacity: 0,
                          y: 34,
                        }
                  }
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  exit={
                    shouldReduceMotion
                      ? {
                          opacity: 0,
                        }
                      : {
                          opacity: 0,
                          y: -24,
                        }
                  }
                  transition={{
                    duration:
                      shouldReduceMotion
                        ? 0.15
                        : 0.55,

                    ease: [
                      0.22,
                      1,
                      0.36,
                      1,
                    ],
                  }}
                  style={{
                    willChange:
                      'opacity, transform',
                  }}
                >
                  <Box
                    sx={{
                      minWidth: 0,

                      maxWidth: 690,
                    }}
                  >
                    {/* EYEBROW */}

                    {activeStory.eyebrow && (
                      <Box
                        sx={{
                          display:
                            'flex',

                          alignItems:
                            'center',

                          minWidth: 0,

                          gap: 1.15,
                        }}
                      >
                        <Box
                          aria-hidden
                          sx={{
                            width: 34,

                            height: 1,

                            bgcolor:
                              'secondary.main',

                            flexShrink: 0,
                          }}
                        />

                        <Typography
                          variant="overline"
                          sx={{
                            minWidth: 0,

                            color:
                              'secondary.dark',

                            overflowWrap:
                              'anywhere',
                          }}
                        >
                          {
                            activeStory.eyebrow
                          }
                        </Typography>
                      </Box>
                    )}

                    {/* HEADING */}

                    <Typography
                      component="h2"
                      variant="h2"
                      sx={{
                        mt:
                          activeStory.eyebrow
                            ? 2
                            : 0,

                        maxWidth: 670,

                        color:
                          'text.primary',

                        overflowWrap:
                          'break-word',

                        hyphens:
                          'auto',

                        textShadow: (
                          theme,
                        ) =>
                          theme.palette
                            .mode ===
                          'dark'
                            ? `0 3px 22px ${alpha(
                                theme.palette
                                  .common.black,
                                0.24,
                              )}`
                            : `0 2px 18px ${alpha(
                                theme.palette
                                  .common.white,
                                0.18,
                              )}`,
                      }}
                    >
                      {
                        activeStory.title
                      }
                    </Typography>

                    {/* DESCRIPTION */}

                    {activeStory.description && (
                      <Typography
                        component="p"
                        variant="body1"
                        sx={{
                          mt: 2.5,

                          maxWidth:
                            550,

                          color:
                            'text.secondary',

                          overflowWrap:
                            'break-word',
                        }}
                      >
                        {
                          activeStory.description
                        }
                      </Typography>
                    )}

                    {/* STORY NUMBER */}

                    <Box
                      aria-hidden
                      sx={{
                        mt: 3.2,

                        display:
                          'flex',

                        alignItems:
                          'center',

                        gap: 1.25,
                      }}
                    >
                      <Typography
                        variant="caption"
                        sx={{
                          color:
                            'secondary.dark',

                          fontWeight: 800,

                          letterSpacing:
                            '0.14em',
                        }}
                      >
                        {formatStoryNumber(
                          safeActiveIndex +
                            1,
                        )}
                      </Typography>

                      <Box
                        sx={{
                          width: 34,

                          height: 1,

                          bgcolor:
                            'secondary.main',

                          opacity:
                            0.45,
                        }}
                      />

                      <Typography
                        variant="caption"
                        sx={{
                          color:
                            'text.secondary',

                          fontWeight: 700,

                          letterSpacing:
                            '0.14em',
                        }}
                      >
                        {formatStoryNumber(
                          storyCount,
                        )}
                      </Typography>
                    </Box>
                  </Box>
                </motion.div>
              </AnimatePresence>
            </Box>
          </Container>

          {/* =================================================
              DESKTOP STORY PROGRESS
          ================================================== */}

          {storyCount > 1 && (
            <Box
              aria-hidden
              sx={{
                position: 'absolute',

                zIndex: 5,

                top: '50%',

                right: {
                  md: 38,
                  lg: 52,
                },

                display: 'flex',

                flexDirection:
                  'column',

                gap: 1.3,

                pointerEvents:
                  'none',

                transform:
                  'translateY(-50%)',
              }}
            >
              {validStories.map(
                (story, index) => (
                  <Box
                    key={story.id}
                    sx={{
                      width:
                        safeActiveIndex ===
                        index
                          ? 34
                          : 18,

                      height: 2,

                      bgcolor:
                        safeActiveIndex ===
                        index
                          ? 'secondary.main'
                          : 'divider',

                      transition:
                        'width 350ms ease, background-color 350ms ease',

                      '@media (prefers-reduced-motion: reduce)':
                        {
                          transition:
                            'none',
                        },
                    }}
                  />
                ),
              )}
            </Box>
          )}

          {/* =================================================
              SCROLL INDICATOR
          ================================================== */}

          {storyCount > 1 && (
            <Box
              aria-hidden
              sx={{
                position: 'absolute',

                left: '50%',

                bottom: 28,

                zIndex: 5,

                display: 'flex',

                alignItems: 'center',

                gap: 1,

                pointerEvents: 'none',

                transform:
                  'translateX(-50%)',
              }}
            >
              <Box
                sx={{
                  width: 30,
                  height: 1,

                  bgcolor:
                    'secondary.main',

                  opacity: 0.45,
                }}
              />

              <Typography
                variant="caption"
                sx={{
                  color:
                    'text.secondary',

                  fontWeight: 700,

                  letterSpacing:
                    '0.14em',

                  textTransform:
                    'uppercase',

                  whiteSpace:
                    'nowrap',
                }}
              >
                Scroll to explore
              </Typography>

              <Box
                sx={{
                  width: 30,
                  height: 1,

                  bgcolor:
                    'secondary.main',

                  opacity: 0.45,
                }}
              />
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
}