import type { Metadata } from 'next';

import Image from 'next/image';
import Link from 'next/link';

import {
  Box,
  Button,
  Container,
  Stack,
  Typography,
} from '@mui/material';

import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded';
import CelebrationRoundedIcon from '@mui/icons-material/CelebrationRounded';
import CollectionsRoundedIcon from '@mui/icons-material/CollectionsRounded';

import GalleryExperience from '@/components/gallery/gallery-experience';

export const metadata: Metadata = {
  title: 'Gallery',
  description:
    'Explore dining spaces, celebrations and memorable moments at Harmony Dining & Event Center.',
};

export default function GalleryPage() {
  return (
    <Box
      component="main"
      sx={{
        minHeight: '100vh',
        bgcolor: 'background.default',
        color: 'text.primary',
      }}
    >
      {/* =====================================================
          HERO
      ===================================================== */}

      <Box
        component="section"
        sx={{
          pt: {
            xs: 2,
            sm: 3,
            md: 4,
          },

          pb: {
            xs: 5,
            md: 7,
          },
        }}
      >
        <Container maxWidth="lg">
          <Box
            sx={{
              position: 'relative',

              minHeight: {
                xs: 520,
                sm: 560,
                md: 600,
              },

              overflow: 'hidden',

              borderRadius: {
                xs: 2,
                md: 3,
              },

              bgcolor: 'primary.dark',

              border: '1px solid',
              borderColor: 'divider',
            }}
          >
            <Image
              src="/images/home/harmony-gallery-dining-hall.jpg"
              alt="Harmony dining and celebration gallery"
              fill
              priority
              quality={80}
              sizes="(max-width: 1200px) 100vw, 1200px"
              style={{
                objectFit: 'cover',
                objectPosition: 'center',
              }}
            />

            <Box
              aria-hidden
              sx={{
                position: 'absolute',
                inset: 0,

                bgcolor: 'primary.dark',

                opacity: {
                  xs: 0.72,
                  md: 0.64,
                },
              }}
            />

            <Box
              sx={{
                position: 'relative',
                zIndex: 1,

                minHeight: {
                  xs: 520,
                  sm: 560,
                  md: 600,
                },

                display: 'flex',
                alignItems: 'center',

                px: {
                  xs: 2.5,
                  sm: 4,
                  md: 6,
                },

                py: {
                  xs: 5,
                  md: 6,
                },
              }}
            >
              <Box
                sx={{
                  maxWidth: 640,
                }}
              >
                <Typography
                  variant="overline"
                  sx={{
                    color: 'secondary.light',
                  }}
                >
                  Our Gallery
                </Typography>

                <Typography
                  component="h1"
                  variant="h1"
                  sx={{
                    mt: 1,

                    maxWidth: 560,

                    color: 'primary.contrastText',
                  }}
                >
                  Moments at Harmony.
                </Typography>

                <Typography
                  variant="body1"
                  sx={{
                    mt: 2.3,

                    maxWidth: 560,

                    color: 'primary.contrastText',

                    opacity: 0.8,
                  }}
                >
                  Discover Harmony through our dining
                  spaces, celebrations and memorable
                  moments shared with our guests.
                </Typography>

                <Stack
                  direction={{
                    xs: 'column',
                    sm: 'row',
                  }}
                  sx={{
                    mt: 3.5,

                    gap: 1.3,

                    alignItems: {
                      xs: 'stretch',
                      sm: 'center',
                    },
                  }}
                >
                  <Link
                    href="/events"
                    style={{
                      textDecoration: 'none',
                    }}
                  >
                    <Button
                      variant="contained"
                      size="large"
                      startIcon={
                        <CelebrationRoundedIcon />
                      }
                      sx={{
                        minHeight: 52,
                        px: 3,

                        width: {
                          xs: '100%',
                          sm: 'auto',
                        },
                      }}
                    >
                      View Our Events
                    </Button>
                  </Link>

                  <Link
                    href="#gallery"
                    style={{
                      textDecoration: 'none',
                    }}
                  >
                    <Button
                      variant="outlined"
                      size="large"
                      startIcon={
                        <CollectionsRoundedIcon />
                      }
                      sx={{
                        minHeight: 52,
                        px: 3,

                        color:
                          'primary.contrastText',

                        borderColor:
                          'primary.contrastText',

                        width: {
                          xs: '100%',
                          sm: 'auto',
                        },

                        '&:hover': {
                          color:
                            'secondary.light',

                          borderColor:
                            'secondary.light',
                        },
                      }}
                    >
                      View Photos
                    </Button>
                  </Link>
                </Stack>
              </Box>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* =====================================================
          GALLERY
      ===================================================== */}

      <Box
        component="section"
        id="gallery"
        sx={{
          scrollMarginTop: 110,

          pb: {
            xs: 7,
            md: 9,
          },
        }}
      >
        <GalleryExperience />
      </Box>

      {/* =====================================================
          EVENT CTA
      ===================================================== */}

      <Box
        component="section"
        sx={{
          pb: {
            xs: 7,
            md: 10,
          },
        }}
      >
        <Container maxWidth="lg">
          <Box
            sx={{
              position: 'relative',

              overflow: 'hidden',

              p: {
                xs: 3,
                sm: 4,
                md: 5,
              },

              borderRadius: {
                xs: 2,
                md: 3,
              },

              bgcolor: 'primary.dark',

              color: 'primary.contrastText',
            }}
          >
            <Box
              aria-hidden
              sx={{
                position: 'absolute',

                width: 300,
                height: 300,

                right: -100,
                top: -150,

                borderRadius: '50%',

                bgcolor: 'secondary.main',

                opacity: 0.1,
              }}
            />

            <Box
              sx={{
                position: 'relative',

                display: 'grid',

                gridTemplateColumns: {
                  xs: '1fr',

                  md:
                    'minmax(0,1fr) auto',
                },

                gap: 3,

                alignItems: 'center',
              }}
            >
              <Box
                sx={{
                  maxWidth: 680,
                }}
              >
                <Typography
                  variant="overline"
                  sx={{
                    color: 'secondary.light',
                  }}
                >
                  Celebrate With Harmony
                </Typography>

                <Typography
                  component="h2"
                  variant="h3"
                  sx={{
                    mt: 0.7,

                    color:
                      'primary.contrastText',
                  }}
                >
                  Inspired by what you see?
                </Typography>

                <Typography
                  variant="body1"
                  sx={{
                    mt: 1.4,

                    maxWidth: 590,

                    color:
                      'primary.contrastText',

                    opacity: 0.74,
                  }}
                >
                  From intimate dining experiences to
                  larger gatherings, Harmony can help
                  turn your idea into a memorable
                  celebration.
                </Typography>
              </Box>

              <Link
                href="/events#enquiry"
                style={{
                  textDecoration: 'none',
                }}
              >
                <Button
                  variant="contained"
                  size="large"
                  startIcon={
                    <CalendarMonthRoundedIcon />
                  }
                  sx={{
                    minHeight: 54,
                    px: 3,

                    whiteSpace: 'nowrap',
                  }}
                >
                  Plan Your Event
                </Button>
              </Link>
            </Box>
          </Box>
        </Container>
      </Box>
    </Box>
  );
}