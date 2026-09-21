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
  Typography,
} from '@mui/material';

import { alpha } from '@mui/material/styles';

import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';

/* =========================================================
   TYPES

   Admin Dashboard → NestJS API → GET /api/public/site-promo →
   SitePromoOverlay. Admin controls content (Admin → Site Promo),
   this component controls visual design only.
========================================================= */

type PromoCta = {
  label: string;
  href: string;
};

export type SitePromoContent = {
  id: string;

  startAt?: string;
  endAt?: string;

  eyebrow?: string;
  badge?: string;

  title: string;
  accentTitle?: string;

  description?: string;

  image?: string;
  imageAlt?: string;
  imagePosition?: string;

  primaryCta?: PromoCta;
  secondaryCta?: PromoCta;

  note?: string;
};

type SitePromoOverlayProps = {
  content: SitePromoContent | null;
};

/* =========================================================
   HELPERS
========================================================= */

function isPromoActive(
  content: SitePromoContent,
) {
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
  content,
}: SitePromoOverlayProps) {
  const [open, setOpen] =
    useState(false);

  const storageKey = useMemo(
    () =>
      `harmony-site-promo-seen:${content?.id ?? 'none'}`,
    [content?.id],
  );

  const active = useMemo(
    () => (content ? isPromoActive(content) : false),
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
       * sessionStorage can be unavailable
       * in restricted/private environments.
       * Promo should still be allowed to open.
       */
    }

    const timer =
      window.setTimeout(() => {
        setOpen(true);
      }, 450);

    return () => {
      window.clearTimeout(timer);
    };
  }, [active, storageKey]);

  function markSeen() {
    try {
      window.sessionStorage.setItem(
        storageKey,
        '1',
      );
    } catch {
      /*
       * Storage failure must never stop
       * the visitor from closing the dialog.
       */
    }
  }

  function handleClose() {
    markSeen();
    setOpen(false);
  }

  if (!content || !active) {
    return null;
  }

  /* =======================================================
     CTA VISIBILITY
  ======================================================= */

  const showPrimary =
    Boolean(
      content.primaryCta?.label?.trim(),
    ) &&
    Boolean(
      content.primaryCta?.href?.trim(),
    );

  const showSecondary = Boolean(
    content.secondaryCta?.label?.trim(),
  );

  const hasDescription = Boolean(
    content.description?.trim(),
  );

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="md"
      aria-labelledby="site-promo-title"
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
                theme.palette.common
                  .black,
                0.5,
              ),

            backdropFilter:
              'blur(4px)',

            WebkitBackdropFilter:
              'blur(4px)',
          },
        },

        paper: {
          sx: {
            m: {
              xs: 1.5,
              sm: 3,
            },

            width: {
              xs:
                'calc(100% - 24px)',
              sm:
                'calc(100% - 48px)',
            },

            maxHeight:
              'calc(100dvh - 32px)',

            overflow: 'hidden',

            bgcolor:
              'background.paper',

            backgroundImage: 'none',

            border: '1px solid',

            borderColor: 'divider',

            borderRadius: {
              xs: 1.5,
              sm: 2,
            },

            boxShadow: (theme) =>
              theme.shadows[16],
          },
        },
      }}
    >
      <DialogContent
        sx={{
          p: 0,

          overflowY: 'auto',

          bgcolor:
            'background.paper',

          color: 'text.primary',
        }}
      >
        <Box
          sx={{
            display: 'grid',

            gridTemplateColumns: {
              xs: '1fr',
              md:
                'minmax(0, 0.9fr) minmax(0, 1.1fr)',
            },

            minHeight: {
              md: 470,
            },
          }}
        >
          {/* =================================================
              IMAGE

              No frame.
              No floating badge.
              No lower marketing copy.
              No decorative blobs.
          ================================================= */}

          {content.image ? (
            <Box
              sx={{
                position: 'relative',

                minHeight: {
                  xs: 210,
                  sm: 270,
                  md: 470,
                },

                overflow: 'hidden',

                bgcolor:
                  'action.hover',
              }}
            >
              <Image
                src={content.image}
                alt={
                  content.imageAlt ?? ''
                }
                fill
                priority={false}
                quality={80}
                sizes="(max-width: 899px) 100vw, 400px"
                style={{
                  objectFit: 'cover',

                  objectPosition:
                    content.imagePosition ??
                    'center',
                }}
              />

              {/* Subtle readability layer only */}

              <Box
                aria-hidden
                sx={{
                  position: 'absolute',

                  inset: 0,

                  background: (theme) =>
                    `linear-gradient(
                      180deg,
                      transparent 55%,
                      ${alpha(
                        theme.palette
                          .primary.dark,
                        0.22,
                      )} 100%
                    )`,

                  pointerEvents: 'none',
                }}
              />
            </Box>
          ) : null}

          {/* =================================================
              CONTENT
          ================================================= */}

          <Box
            sx={{
              position: 'relative',

              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',

              minWidth: 0,

              px: {
                xs: 2.5,
                sm: 4,
                md: 5,
              },

              py: {
                xs: 3,
                sm: 4,
                md: 5,
              },
            }}
          >
            {/* CLOSE */}

            <IconButton
              type="button"
              aria-label="Close promotional offer"
              onClick={handleClose}
              sx={{
                position: 'absolute',

                top: {
                  xs: 10,
                  sm: 14,
                },

                right: {
                  xs: 10,
                  sm: 14,
                },

                width: 40,
                height: 40,

                color:
                  'text.secondary',

                borderRadius: 1,

                '&:hover': {
                  bgcolor:
                    'action.hover',

                  color:
                    'text.primary',
                },
              }}
            >
              <CloseRoundedIcon
                sx={{
                  fontSize: 21,
                }}
              />
            </IconButton>

            {/* BADGE */}

            {content.badge ? (
              <Box
                sx={{
                  width: 'fit-content',

                  mb: 2,

                  px: 1.2,
                  py: 0.55,

                  border: '1px solid',

                  borderColor:
                    'secondary.main',

                  borderRadius: 1,

                  color:
                    'secondary.dark',

                  bgcolor: (theme) =>
                    alpha(
                      theme.palette
                        .secondary.main,
                      0.08,
                    ),
                }}
              >
                <Typography
                  variant="caption"
                  component="span"
                  sx={{
                    display: 'block',

                    fontWeight: 800,

                    lineHeight: 1.2,

                    letterSpacing:
                      '0.06em',

                    textTransform:
                      'uppercase',
                  }}
                >
                  {content.badge}
                </Typography>
              </Box>
            ) : content.eyebrow ? (
              <Typography
                variant="overline"
                component="p"
                sx={{
                  m: 0,

                  mb: 1.5,

                  color:
                    'secondary.dark',
                }}
              >
                {content.eyebrow}
              </Typography>
            ) : null}

            {/* TITLE */}

            {(content.title ||
              content.accentTitle) ? (
              <Typography
                id="site-promo-title"
                component="h2"
                variant="h3"
                sx={{
                  maxWidth: 440,

                  color:
                    'text.primary',

                  overflowWrap:
                    'break-word',
                }}
              >
                {content.title}

                {content.accentTitle ? (
                  <Box
                    component="span"
                    sx={{
                      display: 'block',

                      color:
                        'secondary.dark',
                    }}
                  >
                    {
                      content.accentTitle
                    }
                  </Box>
                ) : null}
              </Typography>
            ) : null}

            {/* DESCRIPTION */}

            {hasDescription ? (
              <Typography
                id="site-promo-description"
                component="p"
                variant="body1"
                sx={{
                  mt: 2,

                  maxWidth: 430,

                  color:
                    'text.secondary',

                  lineHeight: 1.7,

                  overflowWrap:
                    'break-word',
                }}
              >
                {content.description}
              </Typography>
            ) : null}

            {/* =================================================
                ACTIONS

                One obvious primary CTA.
                Secondary action stays quiet.
            ================================================= */}

            {(showPrimary ||
              showSecondary) ? (
              <Box
                sx={{
                  mt: 3,
                }}
              >
                {showPrimary &&
                content.primaryCta ? (
                  <Link
                    href={
                      content.primaryCta
                        .href
                    }
                    onClick={handleClose}
                    style={{
                      display:
                        'inline-flex',

                      textDecoration:
                        'none',
                    }}
                  >
                    <Button
                      variant="contained"
                      disableElevation
                      endIcon={
                        <ArrowForwardRoundedIcon />
                      }
                      sx={{
                        minHeight: 48,

                        px: 2.5,

                        bgcolor:
                          'primary.main',

                        color:
                          'primary.contrastText',

                        fontWeight: 700,

                        '&:hover': {
                          bgcolor:
                            'primary.dark',
                        },
                      }}
                    >
                      {
                        content.primaryCta
                          .label
                      }
                    </Button>
                  </Link>
                ) : null}

                {showSecondary &&
                content.secondaryCta ? (
                  <Button
                    type="button"
                    variant="text"
                    onClick={handleClose}
                    sx={{
                      minHeight: 48,

                      ml: {
                        xs: 0.5,
                        sm: 1,
                      },

                      px: 1.5,

                      color:
                        'text.secondary',

                      fontWeight: 600,

                      '&:hover': {
                        bgcolor:
                          'action.hover',

                        color:
                          'text.primary',
                      },
                    }}
                  >
                    {
                      content.secondaryCta
                        .label
                    }
                  </Button>
                ) : null}
              </Box>
            ) : null}

            {/* NOTE */}

            {content.note ? (
              <Typography
                variant="caption"
                component="p"
                sx={{
                  mt: 2,

                  mb: 0,

                  maxWidth: 420,

                  color:
                    'text.secondary',

                  lineHeight: 1.55,
                }}
              >
                {content.note}
              </Typography>
            ) : null}
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
}