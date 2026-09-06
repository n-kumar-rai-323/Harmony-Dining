'use client';

import {
  useEffect,
  useMemo,
  useState,
} from 'react';

import Image from 'next/image';
import Link from 'next/link';

import {
  Box,
  Button,
  Dialog,
  DialogContent,
  IconButton,
  Stack,
  Typography,
} from '@mui/material';

import { alpha } from '@mui/material/styles';

import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import LocalOfferRoundedIcon from '@mui/icons-material/LocalOfferRounded';
import RestaurantRoundedIcon from '@mui/icons-material/RestaurantRounded';
import CelebrationRoundedIcon from '@mui/icons-material/CelebrationRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';

/* =========================================================
   TYPES
========================================================= */

type PromoCta = {
  id: string;
  label: string;
  href: string;
  enabled?: boolean;
  variant?: 'primary' | 'secondary';
};

export type SitePromoContent = {
  id: string;

  enabled?: boolean;

  startAt?: string | null;
  endAt?: string | null;

  eyebrow?: string;
  badge?: string;

  title?: string;
  accentTitle?: string;

  description?: string;

  image?: string;
  imageAlt?: string;
  imagePosition?: string;

  highlights?: string[];

  primaryCta?: PromoCta;
  secondaryCta?: PromoCta;

  note?: string;

  frequency?: 'session';
};

type SitePromoOverlayProps = {
  content?: SitePromoContent;
};

/* =========================================================
   DEVELOPMENT CONTENT

   Later:
   Admin Dashboard
        ↓
   NestJS API
        ↓
   GET /offers/public/active
        ↓
   This component receives `content`

   Admin can change:
   - enabled
   - start/end date
   - title/description
   - image
   - button labels/routes
   - highlights
   - note

   Admin must NOT control:
   - global colors
   - typography system
   - component layout
   - theme
========================================================= */

const initialPromoContent: SitePromoContent = {
  id: 'harmony-signature-offer-v1',

  enabled: true,

  startAt: null,
  endAt: null,

  eyebrow: 'Harmony Signature Experience',

  badge: 'Limited Harmony Special',

  title: 'A little extra',

  accentTitle:
    'for your next moment.',

  description:
    'Discover a curated Harmony experience created for memorable dining, celebrations and time well spent together.',

  image:
    '/images/menu/harmony-food-menu-bg.jpg',

  imageAlt:
    'Harmony signature dining experience',

  imagePosition: 'center',

  highlights: [
    'Curated dining',
    'Celebration ready',
    'Made for memorable moments',
  ],

  primaryCta: {
    id: 'explore-offer',
    label: 'Explore the Offer',
    href: '/menu',
    enabled: true,
    variant: 'primary',
  },

  secondaryCta: {
    id: 'continue-site',
    label: 'Continue to Website',
    href: '/',
    enabled: true,
    variant: 'secondary',
  },

  note:
    'Offer availability and final details are confirmed by Harmony staff.',

  frequency: 'session',
};

/* =========================================================
   HELPERS
========================================================= */

function isPromoActive(
  content: SitePromoContent,
) {
  if (content.enabled === false) {
    return false;
  }

  const now = Date.now();

  if (content.startAt) {
    const start = new Date(
      content.startAt,
    ).getTime();

    if (
      Number.isFinite(start) &&
      now < start
    ) {
      return false;
    }
  }

  if (content.endAt) {
    const end = new Date(
      content.endAt,
    ).getTime();

    if (
      Number.isFinite(end) &&
      now > end
    ) {
      return false;
    }
  }

  return true;
}

/* =========================================================
   COMPONENT
========================================================= */

export default function SitePromoOverlay({
  content = initialPromoContent,
}: SitePromoOverlayProps) {
  const [open, setOpen] =
    useState(false);

  const storageKey = useMemo(
    () =>
      `harmony-site-promo-seen:${content.id}`,
    [content.id],
  );

  const active = useMemo(
    () => isPromoActive(content),
    [content],
  );

  /* =======================================================
     OPEN ONCE PER SESSION
  ======================================================= */

  useEffect(() => {
    if (!active) {
      return;
    }

    try {
      const alreadySeen =
        window.sessionStorage.getItem(
          storageKey,
        );

      if (alreadySeen) {
        return;
      }
    } catch {
      /*
       * Storage may be blocked.
       * The promotion can still open.
       */
    }

    const timer =
      window.setTimeout(() => {
        setOpen(true);
      }, 180);

    return () => {
      window.clearTimeout(timer);
    };
  }, [
    active,
    storageKey,
  ]);

  /* =======================================================
     ACTIONS
  ======================================================= */

  function markSeen() {
    try {
      window.sessionStorage.setItem(
        storageKey,
        '1',
      );
    } catch {
      /*
       * Storage may be blocked.
       * Closing/navigation should still work.
       */
    }
  }

  function handleClose() {
    markSeen();
    setOpen(false);
  }

  /* =======================================================
     CONTENT STATE
  ======================================================= */

  if (!active) {
    return null;
  }

  const highlights = (
    content.highlights ?? []
  )
    .map((item) => item.trim())
    .filter(Boolean);

  const showPrimary =
    content.primaryCta?.enabled !==
      false &&
    Boolean(
      content.primaryCta?.label?.trim(),
    ) &&
    Boolean(
      content.primaryCta?.href?.trim(),
    );

  const showSecondary =
    content.secondaryCta?.enabled !==
      false &&
    Boolean(
      content.secondaryCta?.label?.trim(),
    ) &&
    Boolean(
      content.secondaryCta?.href?.trim(),
    );

  const hasTitle = Boolean(
    content.title?.trim() ||
      content.accentTitle?.trim(),
  );

  const hasDescription = Boolean(
    content.description?.trim(),
  );

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullScreen
      aria-labelledby={
        hasTitle
          ? 'site-promo-title'
          : undefined
      }
      aria-describedby={
        hasDescription
          ? 'site-promo-description'
          : undefined
      }
      slotProps={{
        backdrop: {
          sx: {
            bgcolor: (theme) =>
              alpha(
                theme.palette.primary
                  .dark,
                0.92,
              ),

            backdropFilter:
              'blur(14px)',

            WebkitBackdropFilter:
              'blur(14px)',
          },
        },

        paper: {
          sx: {
            bgcolor:
              'transparent',

            backgroundImage:
              'none',

            boxShadow: 'none',

            display: 'grid',

            placeItems:
              'center',

            overflowY: 'auto',

            p: {
              xs: 1.25,
              sm: 2.5,
              md: 3,
            },
          },
        },
      }}
    >
      <DialogContent
        sx={{
          position: 'relative',

          width: '100%',

          maxWidth: 1120,

          p: 0,

          overflow: 'hidden',

          bgcolor:
            'primary.dark',

          color:
            'primary.contrastText',

          border:
            '1px solid',

          borderColor:
            (theme) =>
              alpha(
                theme.palette.secondary
                  .main,
                0.3,
              ),

          borderRadius: {
            xs: 2,
            sm: 3,
            md: 4,
          },

          boxShadow: (theme) =>
            theme.shadows[24],

          isolation: 'isolate',

          '@media (prefers-reduced-motion: no-preference)':
            {
              animation:
                'harmonyPromoEnter 480ms cubic-bezier(0.22, 1, 0.36, 1) both',

              '@keyframes harmonyPromoEnter':
                {
                  from: {
                    opacity: 0,

                    transform:
                      'translateY(20px) scale(0.985)',
                  },

                  to: {
                    opacity: 1,

                    transform:
                      'translateY(0) scale(1)',
                  },
                },
            },
        }}
      >
        {/* =================================================
            DECORATIVE THEME SURFACE
        ================================================== */}

        <Box
          aria-hidden
          sx={{
            position: 'absolute',

            inset: 0,

            zIndex: -1,

            pointerEvents:
              'none',

            background: (theme) => `
              radial-gradient(
                circle at 88% 10%,
                ${alpha(
                  theme.palette.secondary
                    .main,
                  0.16,
                )},
                transparent 34%
              ),
              radial-gradient(
                circle at 14% 95%,
                ${alpha(
                  theme.palette.primary
                    .light,
                  0.28,
                )},
                transparent 36%
              )
            `,
          }}
        />

        <Box
          sx={{
            display: 'grid',

            gridTemplateColumns:
              {
                xs: '1fr',

                md:
                  'minmax(0,1.08fr) minmax(0,0.92fr)',
              },

            minHeight: {
              md: 620,
            },
          }}
        >
          {/* =================================================
              IMAGE PANEL
          ================================================== */}

          <Box
            sx={{
              position: 'relative',

              minHeight: {
                xs: 285,
                sm: 380,
                md: 620,
              },

              overflow:
                'hidden',

              bgcolor:
                'primary.main',
            }}
          >
            {content.image && (
              <Image
                src={content.image}
                alt={
                  content.imageAlt ??
                  ''
                }
                fill
                priority
                quality={75}
                sizes="(max-width: 899px) 100vw, 610px"
                style={{
                  objectFit:
                    'cover',

                  objectPosition:
                    content.imagePosition ??
                    'center',
                }}
              />
            )}

            {/* Image contrast overlay */}

            <Box
              aria-hidden
              sx={{
                position:
                  'absolute',

                inset: 0,

                background:
                  (theme) => `
                    linear-gradient(
                      180deg,
                      ${alpha(
                        theme.palette.primary
                          .dark,
                        0.04,
                      )} 0%,
                      ${alpha(
                        theme.palette.primary
                          .dark,
                        0.14,
                      )} 48%,
                      ${alpha(
                        theme.palette.primary
                          .dark,
                        0.94,
                      )} 100%
                    ),
                    linear-gradient(
                      90deg,
                      ${alpha(
                        theme.palette.primary
                          .dark,
                        0.14,
                      )} 0%,
                      transparent 55%,
                      ${alpha(
                        theme.palette.primary
                          .dark,
                        0.18,
                      )} 100%
                    )
                  `,
              }}
            />

            {/* Theme frame */}

            <Box
              aria-hidden
              sx={{
                position:
                  'absolute',

                inset: {
                  xs: 12,
                  sm: 16,
                  md: 20,
                },

                border:
                  '1px solid',

                borderColor:
                  (theme) =>
                    alpha(
                      theme.palette
                        .secondary
                        .main,
                      0.3,
                    ),

                borderRadius: 2,

                pointerEvents:
                  'none',
              }}
            />

            {/* =================================================
                OFFER BADGE
            ================================================== */}

            {content.badge && (
              <Box
                sx={{
                  position:
                    'absolute',

                  top: {
                    xs: 20,
                    sm: 28,
                    md: 34,
                  },

                  left: {
                    xs: 20,
                    sm: 28,
                    md: 34,
                  },

                  maxWidth:
                    'calc(100% - 90px)',

                  display:
                    'inline-flex',

                  alignItems:
                    'center',

                  gap: 0.8,

                  px: 1.35,

                  py: 0.8,

                  borderRadius:
                    999,

                  bgcolor:
                    (theme) =>
                      alpha(
                        theme.palette
                          .primary
                          .dark,
                        0.78,
                      ),

                  color:
                    'secondary.light',

                  border:
                    '1px solid',

                  borderColor:
                    (theme) =>
                      alpha(
                        theme.palette
                          .secondary
                          .main,
                        0.4,
                      ),

                  backdropFilter:
                    'blur(12px)',

                  WebkitBackdropFilter:
                    'blur(12px)',

                  boxShadow:
                    (theme) =>
                      theme.shadows[6],
                }}
              >
                <AutoAwesomeRoundedIcon
                  aria-hidden
                  sx={{
                    fontSize: 17,
                  }}
                />

                <Typography
                  variant="overline"
                  sx={{
                    color:
                      'inherit',

                    lineHeight:
                      1.2,

                    overflowWrap:
                      'break-word',
                  }}
                >
                  {
                    content.badge
                  }
                </Typography>
              </Box>
            )}

            {/* =================================================
                IMAGE LOWER MESSAGE
            ================================================== */}

            <Box
              sx={{
                position:
                  'absolute',

                left: {
                  xs: 24,
                  sm: 32,
                  md: 38,
                },

                right: {
                  xs: 24,
                  sm: 32,
                  md: 38,
                },

                bottom: {
                  xs: 24,
                  sm: 32,
                  md: 38,
                },
              }}
            >
              <Typography
                variant="overline"
                sx={{
                  maxWidth: 420,

                  display:
                    'block',

                  color:
                    (theme) =>
                      alpha(
                        theme.palette
                          .primary
                          .contrastText,
                        0.76,
                      ),
                }}
              >
                Dining • Events •
                Celebration
              </Typography>

              <Typography
                component="p"
                variant="h4"
                sx={{
                  mt: 0.9,

                  maxWidth: 430,

                  color:
                    'primary.contrastText',

                  overflowWrap:
                    'break-word',
                }}
              >
                Make the moment feel a
                little more special.
              </Typography>
            </Box>
          </Box>

          {/* =================================================
              CONTENT PANEL
          ================================================== */}

          <Box
            sx={{
              position: 'relative',

              display: 'flex',

              flexDirection:
                'column',

              justifyContent:
                'center',

              minWidth: 0,

              p: {
                xs: 2.7,
                sm: 4,
                md: 5,
                lg: 5.5,
              },

              bgcolor:
                (theme) =>
                  alpha(
                    theme.palette
                      .primary.dark,
                    0.88,
                  ),
            }}
          >
            {/* =================================================
                CLOSE
            ================================================== */}

            <IconButton
              type="button"
              aria-label="Close promotional offer"
              onClick={
                handleClose
              }
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

                width: 42,

                height: 42,

                color:
                  'primary.contrastText',

                bgcolor:
                  (theme) =>
                    alpha(
                      theme.palette
                        .primary
                        .contrastText,
                      0.06,
                    ),

                border:
                  '1px solid',

                borderColor:
                  (theme) =>
                    alpha(
                      theme.palette
                        .primary
                        .contrastText,
                      0.12,
                    ),

                backdropFilter:
                  'blur(12px)',

                WebkitBackdropFilter:
                  'blur(12px)',

                '&:hover': {
                  bgcolor:
                    (theme) =>
                      alpha(
                        theme.palette
                          .primary
                          .contrastText,
                        0.12,
                      ),

                  color:
                    'primary.contrastText',
                },
              }}
            >
              <CloseRoundedIcon />
            </IconButton>

            {/* =================================================
                EYEBROW
            ================================================== */}

            {content.eyebrow && (
              <Box
                sx={{
                  display:
                    'flex',

                  alignItems:
                    'center',

                  gap: 1.1,

                  pr: 6,

                  minWidth: 0,
                }}
              >
                <Box
                  aria-hidden
                  sx={{
                    width: 28,

                    height: 1,

                    bgcolor:
                      'secondary.light',

                    flexShrink: 0,
                  }}
                />

                <Typography
                  variant="overline"
                  sx={{
                    color:
                      'secondary.light',

                    overflowWrap:
                      'break-word',
                  }}
                >
                  {
                    content.eyebrow
                  }
                </Typography>
              </Box>
            )}

            {/* =================================================
                TITLE
            ================================================== */}

            {hasTitle && (
              <Typography
                id="site-promo-title"
                component="h2"
                variant="h2"
                sx={{
                  mt: content.eyebrow
                    ? 1.6
                    : 0,

                  maxWidth: 500,

                  color:
                    'primary.contrastText',

                  overflowWrap:
                    'break-word',
                }}
              >
                {content.title}

                {content.accentTitle && (
                  <Box
                    component="span"
                    sx={{
                      display:
                        'block',

                      color:
                        'secondary.light',
                    }}
                  >
                    {
                      content.accentTitle
                    }
                  </Box>
                )}
              </Typography>
            )}

            {/* =================================================
                DESCRIPTION
            ================================================== */}

            {content.description && (
              <Typography
                id="site-promo-description"
                variant="body1"
                sx={{
                  mt: 2.1,

                  maxWidth: 455,

                  color:
                    (theme) =>
                      alpha(
                        theme.palette
                          .primary
                          .contrastText,
                        0.72,
                      ),

                  overflowWrap:
                    'break-word',
                }}
              >
                {
                  content.description
                }
              </Typography>
            )}

            {/* =================================================
                HIGHLIGHTS
            ================================================== */}

            {highlights.length >
              0 && (
              <Stack
                sx={{
                  mt: 2.35,

                  gap: 1,
                }}
              >
                {highlights.map(
                  (
                    highlight,
                    index,
                  ) => {
                    const Icon =
                      index % 2 ===
                      0
                        ? RestaurantRoundedIcon
                        : CelebrationRoundedIcon;

                    return (
                      <Box
                        key={`${highlight}-${index}`}
                        sx={{
                          display:
                            'grid',

                          gridTemplateColumns:
                            '32px minmax(0,1fr)',

                          gap: 1,

                          alignItems:
                            'center',
                        }}
                      >
                        <Box
                          aria-hidden
                          sx={{
                            width: 32,

                            height: 32,

                            display:
                              'grid',

                            placeItems:
                              'center',

                            borderRadius:
                              '50%',

                            color:
                              'secondary.light',

                            bgcolor:
                              (
                                theme,
                              ) =>
                                alpha(
                                  theme
                                    .palette
                                    .secondary
                                    .main,
                                  0.1,
                                ),

                            border:
                              '1px solid',

                            borderColor:
                              (
                                theme,
                              ) =>
                                alpha(
                                  theme
                                    .palette
                                    .secondary
                                    .main,
                                  0.2,
                                ),
                          }}
                        >
                          <Icon
                            sx={{
                              fontSize:
                                16,
                            }}
                          />
                        </Box>

                        <Typography
                          variant="body2"
                          sx={{
                            color:
                              (
                                theme,
                              ) =>
                                alpha(
                                  theme
                                    .palette
                                    .primary
                                    .contrastText,
                                  0.86,
                                ),

                            fontWeight:
                              700,

                            overflowWrap:
                              'break-word',
                          }}
                        >
                          {
                            highlight
                          }
                        </Typography>
                      </Box>
                    );
                  },
                )}
              </Stack>
            )}

            {/* =================================================
                ACTIONS
            ================================================== */}

            {(showPrimary ||
              showSecondary) && (
              <Stack
                direction={{
                  xs: 'column',

                  sm: 'row',
                }}
                sx={{
                  mt: 3.1,

                  gap: 1.1,

                  alignItems: {
                    xs: 'stretch',

                    sm: 'center',
                  },
                }}
              >
                {/* PRIMARY CTA */}

                {showPrimary &&
                  content.primaryCta && (
                    <Box
                      sx={{
                        width: {
                          xs: '100%',
                          sm: 'auto',
                        },
                      }}
                    >
                      <Link
                        href={
                          content
                            .primaryCta
                            .href
                        }
                        onClick={
                          handleClose
                        }
                        style={{
                          display:
                            'block',

                          width:
                            '100%',

                          textDecoration:
                            'none',
                        }}
                      >
                        <Button
                          fullWidth
                          variant="contained"
                          startIcon={
                            <LocalOfferRoundedIcon />
                          }
                          endIcon={
                            <ArrowForwardRoundedIcon />
                          }
                          sx={{
                            minHeight:
                              52,

                            px: 2.6,

                            bgcolor:
                              'secondary.main',

                            color:
                              'secondary.contrastText',

                            whiteSpace:
                              {
                                xs: 'normal',

                                sm: 'nowrap',
                              },

                            '&:hover':
                              {
                                bgcolor:
                                  'secondary.light',
                              },
                          }}
                        >
                          {
                            content
                              .primaryCta
                              .label
                          }
                        </Button>
                      </Link>
                    </Box>
                  )}

                {/* SECONDARY CTA */}

                {showSecondary &&
                  content.secondaryCta && (
                    <Box
                      sx={{
                        width: {
                          xs: '100%',
                          sm: 'auto',
                        },
                      }}
                    >
                      <Link
                        href={
                          content
                            .secondaryCta
                            .href
                        }
                        onClick={
                          handleClose
                        }
                        style={{
                          display:
                            'block',

                          width:
                            '100%',

                          textDecoration:
                            'none',
                        }}
                      >
                        <Button
                          fullWidth
                          variant="outlined"
                          sx={{
                            minHeight:
                              52,

                            px: 2.4,

                            color:
                              'primary.contrastText',

                            borderColor:
                              (
                                theme,
                              ) =>
                                alpha(
                                  theme
                                    .palette
                                    .primary
                                    .contrastText,
                                  0.22,
                                ),

                            whiteSpace:
                              {
                                xs: 'normal',

                                sm: 'nowrap',
                              },

                            '&:hover':
                              {
                                borderColor:
                                  'secondary.main',

                                bgcolor:
                                  (
                                    theme,
                                  ) =>
                                    alpha(
                                      theme
                                        .palette
                                        .primary
                                        .contrastText,
                                      0.06,
                                    ),
                              },
                          }}
                        >
                          {
                            content
                              .secondaryCta
                              .label
                          }
                        </Button>
                      </Link>
                    </Box>
                  )}
              </Stack>
            )}

            {/* =================================================
                NOTE
            ================================================== */}

            {content.note && (
              <Typography
                variant="caption"
                sx={{
                  mt: 1.8,

                  maxWidth: 430,

                  color:
                    (theme) =>
                      alpha(
                        theme.palette
                          .primary
                          .contrastText,
                        0.5,
                      ),

                  overflowWrap:
                    'break-word',
                }}
              >
                {content.note}
              </Typography>
            )}
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
}