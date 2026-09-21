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
import RestaurantRoundedIcon from '@mui/icons-material/RestaurantRounded';

import FeatureIcon from '@/components/common/feature-icon';
import { getAboutValues } from '@/data/marketing';
import { getPageHeaders } from '@/lib/api/page-headers';

// See frontend/src/app/layout.tsx for why this is forced dynamic.
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'About',
  description:
    'The story, philosophy and people behind Harmony Dining & Event Center — thoughtful food, warm hospitality and memorable celebrations.',
  alternates: {
    canonical: '/about',
  },
  openGraph: {
    title: 'About | Harmony Dining & Event Center',
    description:
      'The story, philosophy and people behind Harmony Dining & Event Center.',
    url: '/about',
  },
};

const values = getAboutValues();

export default async function AboutPage() {
  const { about: hero } = await getPageHeaders();

  return (
    <Box
      component="main"
      sx={{
        minHeight: '100vh',
        bgcolor: 'background.default',
        color: 'text.primary',
      }}
    >
      {/* HERO */}
      <Box
        component="section"
        sx={{
          pt: { xs: 2, sm: 3, md: 4 },
          pb: { xs: 5, md: 7 },
        }}
      >
        <Container maxWidth="lg">
          <Box
            sx={{
              position: 'relative',
              minHeight: { xs: 460, sm: 520, md: 560 },
              overflow: 'hidden',
              borderRadius: { xs: 2, md: 3 },
              bgcolor: 'primary.dark',
              border: '1px solid',
              borderColor: 'divider',
            }}
          >
            <Image
              src={hero?.image ?? '/images/home/harmony-dining-experience.jpg'}
              alt={hero?.imageAlt ?? 'The dining room at Harmony Dining & Event Center'}
              fill
              priority
              quality={80}
              sizes="(max-width: 1200px) 100vw, 1200px"
              style={{ objectFit: 'cover', objectPosition: 'center' }}
            />

            <Box
              aria-hidden
              sx={{
                position: 'absolute',
                inset: 0,
                bgcolor: 'primary.dark',
                opacity: { xs: 0.72, md: 0.64 },
              }}
            />

            <Box
              sx={{
                position: 'relative',
                zIndex: 1,
                minHeight: { xs: 460, sm: 520, md: 560 },
                display: 'flex',
                alignItems: 'center',
                px: { xs: 2.5, sm: 4, md: 6 },
                py: { xs: 5, md: 6 },
              }}
            >
              <Box sx={{ maxWidth: 640 }}>
                <Typography
                  variant="overline"
                  sx={{ color: 'secondary.light' }}
                >
                  {hero?.eyebrow ?? 'Our Story'}
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
                  {hero?.title ?? 'Made for gathering.'}
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
                  {hero?.description ??
                    'Harmony Dining & Event Center began with a simple idea: a single place where good food, warm service and space to celebrate come together.'}
                </Typography>
              </Box>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* STORY */}
      <Box component="section" sx={{ pb: { xs: 6, md: 9 } }}>
        <Container maxWidth="md">
          <Typography
            variant="overline"
            sx={{ color: 'secondary.dark' }}
          >
            Who We Are
          </Typography>

          <Typography
            component="h2"
            variant="h3"
            sx={{ mt: 0.7 }}
          >
            A kitchen and a gathering place.
          </Typography>

          <Stack sx={{ mt: 2.5, gap: 2 }}>
            <Typography
              variant="body1"
              sx={{ color: 'text.secondary' }}
            >
              We cook the food we like to eat: honest, seasonal and
              carefully prepared. The menu moves with what is fresh,
              and our team takes the time to get the details right —
              whether you are here for a weekday lunch or a once-in-a-
              lifetime celebration.
            </Typography>

            <Typography
              variant="body1"
              sx={{ color: 'text.secondary' }}
            >
              Alongside the restaurant, our event spaces host
              weddings, birthdays, corporate evenings and family
              gatherings of every size. The same kitchen, the same
              people and the same standard of hospitality carry
              through each one.
            </Typography>
          </Stack>
        </Container>
      </Box>

      {/* VALUES */}
      <Box
        component="section"
        sx={{
          borderTop: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper',
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ py: { xs: 6, md: 9 } }}>
            <Typography
              variant="overline"
              sx={{ color: 'secondary.dark' }}
            >
              What Guides Us
            </Typography>

            <Typography
              component="h2"
              variant="h3"
              sx={{ mt: 0.7, maxWidth: 520 }}
            >
              The things we care about.
            </Typography>

            <Box
              sx={{
                mt: 4,
                display: 'grid',
                gridTemplateColumns: {
                  xs: '1fr',
                  md: 'repeat(3, minmax(0, 1fr))',
                },
                gap: 3,
              }}
            >
              {values.map((value) => {
                return (
                  <Box key={value.title}>
                    <Box
                      sx={{
                        width: 52,
                        height: 52,
                        display: 'grid',
                        placeItems: 'center',
                        borderRadius: '50%',
                        bgcolor: 'action.hover',
                        color: 'secondary.dark',
                      }}
                    >
                      <FeatureIcon
                        iconKey={value.iconKey}
                        aria-hidden
                      />
                    </Box>

                    <Typography
                      variant="subtitle1"
                      sx={{ mt: 1.5, fontWeight: 800 }}
                    >
                      {value.title}
                    </Typography>

                    <Typography
                      variant="body2"
                      sx={{ mt: 0.6, color: 'text.secondary' }}
                    >
                      {value.description}
                    </Typography>
                  </Box>
                );
              })}
            </Box>
          </Box>
        </Container>
      </Box>

      {/* CTA */}
      <Box component="section" sx={{ py: { xs: 6, md: 10 } }}>
        <Container maxWidth="lg">
          <Box
            sx={{
              position: 'relative',
              overflow: 'hidden',
              p: { xs: 3, sm: 4, md: 5 },
              borderRadius: { xs: 2, md: 3 },
              bgcolor: 'primary.dark',
              color: 'primary.contrastText',
            }}
          >
            <Box
              sx={{
                position: 'relative',
                display: 'grid',
                gridTemplateColumns: {
                  xs: '1fr',
                  md: 'minmax(0,1fr) auto',
                },
                gap: 3,
                alignItems: 'center',
              }}
            >
              <Box sx={{ maxWidth: 640 }}>
                <Typography
                  variant="overline"
                  sx={{ color: 'secondary.light' }}
                >
                  Come In
                </Typography>

                <Typography
                  component="h2"
                  variant="h3"
                  sx={{ mt: 0.7, color: 'primary.contrastText' }}
                >
                  Join us for a meal or an occasion.
                </Typography>
              </Box>

              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                sx={{ gap: 1.5 }}
              >
                <Link
                  href="/reservation"
                  style={{ textDecoration: 'none' }}
                >
                  <Button
                    variant="contained"
                    size="large"
                    startIcon={<RestaurantRoundedIcon />}
                    sx={{
                      minHeight: 52,
                      px: 3,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    Reserve a Table
                  </Button>
                </Link>

                <Link
                  href="/events#enquiry"
                  style={{ textDecoration: 'none' }}
                >
                  <Button
                    variant="outlined"
                    size="large"
                    startIcon={<CalendarMonthRoundedIcon />}
                    sx={{
                      minHeight: 52,
                      px: 3,
                      whiteSpace: 'nowrap',
                      color: 'primary.contrastText',
                      borderColor: 'primary.contrastText',
                      '&:hover': {
                        color: 'secondary.light',
                        borderColor: 'secondary.light',
                      },
                    }}
                  >
                    Plan an Event
                  </Button>
                </Link>
              </Stack>
            </Box>
          </Box>
        </Container>
      </Box>
    </Box>
  );
}
