'use client';

import Link from 'next/link';

import {
  Box,
  Button,
  Container,
  Typography,
} from '@mui/material';

import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import CollectionsRoundedIcon from '@mui/icons-material/CollectionsRounded';

import PhotoCollage from '@/components/common/photo-collage';

/* =========================================================
   GALLERY SHOWCASE (home)

   A cohesive intro block + an editorial photo mosaic that
   reuses the shared PhotoCollage / Lightbox. Photos come from
   the single gallery data source; the CTA leads to the full
   gallery page.

   Future: a parent Server Component can pass `content` from
   the published homepage API without touching the layout.
========================================================= */

export type GalleryShowcaseContent = {
  enabled?: boolean;
  eyebrow?: string;
  title: string;
  accentTitle?: string;
  description?: string;
  cta?: {
    label: string;
    href: string;
  };
};

export type GalleryShowcasePhoto = {
  src: string;
  alt: string;
};

type GalleryShowcaseProps = {
  content?: GalleryShowcaseContent;
  /** Preview photos, provided by the page from the API (published + featuredOnHome only). */
  photos?: GalleryShowcasePhoto[];
};

const initialContent: GalleryShowcaseContent = {
  enabled: true,
  eyebrow: 'Inside Harmony',
  title: 'More than a place',
  accentTitle: 'to dine.',
  description:
    'Step inside and see the spaces behind every meal, celebration and memorable visit at Harmony.',
  cta: {
    label: 'Explore Full Gallery',
    href: '/gallery',
  },
};

export default function GalleryShowcase({
  content = initialContent,
  photos: photosProp,
}: GalleryShowcaseProps) {
  const {
    enabled = true,
    eyebrow,
    title,
    accentTitle,
    description,
    cta,
  } = content;

  const photos = photosProp ?? [];

  const hasCta =
    Boolean(cta?.label?.trim()) &&
    Boolean(cta?.href?.trim());

  if (!enabled || photos.length === 0) {
    return null;
  }

  return (
    <Box
      component="section"
      aria-labelledby="gallery-showcase-title"
      sx={{
        position: 'relative',
        overflow: 'hidden',

        bgcolor: 'background.default',
        color: 'text.primary',

        py: {
          xs: 7,
          sm: 8,
          md: 10,
          lg: 12,
        },
      }}
    >
      <Container
        maxWidth="xl"
        sx={{
          position: 'relative',
          zIndex: 1,
        }}
      >
        <Box
          sx={{
            display: 'grid',

            gridTemplateColumns: {
              xs: 'minmax(0, 1fr)',
              lg: 'minmax(0, 420px) minmax(0, 1fr)',
            },

            alignItems: 'center',

            gap: {
              xs: 4,
              md: 5,
              lg: 8,
            },
          }}
        >
          {/* =================================================
              INTRO
          ================================================== */}

          <Box
            sx={{
              minWidth: 0,
              maxWidth: { xs: 640, lg: 'none' },
            }}
          >
            {eyebrow ? (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.2,
                  minWidth: 0,
                }}
              >
                <Box
                  aria-hidden
                  sx={{
                    width: 34,
                    height: 1,
                    flexShrink: 0,
                    bgcolor: 'secondary.main',
                  }}
                />

                <Typography
                  variant="overline"
                  sx={{
                    minWidth: 0,
                    color: 'secondary.dark',
                    overflowWrap: 'anywhere',
                  }}
                >
                  {eyebrow}
                </Typography>
              </Box>
            ) : null}

            <Typography
              id="gallery-showcase-title"
              component="h2"
              variant="h2"
              sx={{
                mt: eyebrow ? { xs: 1.7, md: 2 } : 0,
                color: 'text.primary',
                overflowWrap: 'break-word',
                hyphens: 'auto',
              }}
            >
              {title}

              {accentTitle ? (
                <Box
                  component="span"
                  sx={{
                    display: 'block',
                    color: 'secondary.dark',
                  }}
                >
                  {accentTitle}
                </Box>
              ) : null}
            </Typography>

            {description ? (
              <Typography
                component="p"
                variant="body1"
                sx={{
                  mt: { xs: 2, md: 2.5 },
                  maxWidth: 460,
                  color: 'text.secondary',
                  overflowWrap: 'break-word',
                }}
              >
                {description}
              </Typography>
            ) : null}

            {hasCta && cta ? (
              <Box sx={{ mt: { xs: 3, md: 3.5 } }}>
                <Link
                  href={cta.href}
                  style={{
                    display: 'inline-block',
                    textDecoration: 'none',
                  }}
                >
                  <Button
                    variant="outlined"
                    size="large"
                    startIcon={
                      <CollectionsRoundedIcon />
                    }
                    endIcon={
                      <ArrowForwardRoundedIcon />
                    }
                    sx={{
                      minHeight: 52,
                      px: 3,
                      color: 'text.primary',
                      borderColor: 'divider',
                      '&:hover': {
                        borderColor:
                          'secondary.main',
                        bgcolor: 'action.hover',
                      },
                    }}
                  >
                    {cta.label}
                  </Button>
                </Link>
              </Box>
            ) : null}
          </Box>

          {/* =================================================
              MOSAIC
          ================================================== */}

          <Box
            sx={{
              position: 'relative',
              width: '100%',
              minWidth: 0,

              aspectRatio: {
                xs: '3 / 4',
                sm: '16 / 11',
                md: '16 / 10',
                lg: 'auto',
              },

              minHeight: { lg: 540 },

              overflow: 'hidden',
              borderRadius: { xs: 1.5, md: 2 },

              bgcolor: 'action.hover',

              boxShadow: (theme) =>
                theme.shadows[10],
            }}
          >
            <PhotoCollage
              photos={photos}
              sizes="(max-width: 899px) 100vw, (max-width: 1199px) 100vw, 62vw"
              thumbSizes="(max-width: 899px) 50vw, 20vw"
            />
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
