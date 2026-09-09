import type { Metadata } from 'next';

import Link from 'next/link';
import { notFound } from 'next/navigation';

import {
  Box,
  Button,
  Container,
  Stack,
  Typography,
} from '@mui/material';

import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded';
import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded';

import PastEventGallery from '@/components/events/past-event-gallery';

import {
  getPastEventBySlug,
  getPastEventSlugs,
} from '@/data/past-events';

import { formatLongDate } from '@/lib/date';

type PageParams = {
  params: Promise<{ slug: string }>;
};

export const dynamicParams = false;

export function generateStaticParams() {
  return getPastEventSlugs().map((slug) => ({
    slug,
  }));
}

export async function generateMetadata({
  params,
}: PageParams): Promise<Metadata> {
  const { slug } = await params;

  const event = getPastEventBySlug(slug);

  if (!event) {
    return { title: 'Past Event' };
  }

  return {
    title: `${event.title} · Past Events`,
    description: event.summary,
    alternates: {
      canonical: `/events/past/${event.slug}`,
    },
    openGraph: {
      title: `${event.title} | Harmony Dining & Event Center`,
      description: event.summary,
      url: `/events/past/${event.slug}`,
      images:
        event.cover.type === 'image'
          ? [event.cover.src]
          : [event.cover.poster],
    },
  };
}

export default async function PastEventPage({
  params,
}: PageParams) {
  const { slug } = await params;

  const event = getPastEventBySlug(slug);

  if (!event) {
    notFound();
  }

  const photoCount = event.media.filter(
    (item) => item.type === 'image',
  ).length;

  const videoCount = event.media.filter(
    (item) => item.type === 'video',
  ).length;

  const countLabel = [
    photoCount > 0
      ? `${photoCount} photo${photoCount === 1 ? '' : 's'}`
      : null,
    videoCount > 0
      ? `${videoCount} video${videoCount === 1 ? '' : 's'}`
      : null,
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <Box
      component="main"
      sx={{
        minHeight: '100vh',
        bgcolor: 'background.default',
        color: 'text.primary',
      }}
    >
      <Container maxWidth="lg">
        <Box sx={{ py: { xs: 5, md: 8 } }}>
          {/* BACK */}
          <Link
            href="/events#past-events"
            style={{ textDecoration: 'none' }}
          >
            <Button
              variant="text"
              startIcon={<ArrowBackRoundedIcon />}
              sx={{ ml: -1, color: 'text.secondary' }}
            >
              All past events
            </Button>
          </Link>

          {/* HEADER */}
          <Box sx={{ mt: 2, maxWidth: 760 }}>
            <Typography
              variant="overline"
              sx={{ color: 'secondary.dark' }}
            >
              {event.category}
            </Typography>

            <Typography
              component="h1"
              variant="h2"
              sx={{ mt: 0.7 }}
            >
              {event.title}
            </Typography>

            <Typography
              variant="body1"
              sx={{
                mt: 1.6,
                color: 'text.secondary',
              }}
            >
              {event.summary}
            </Typography>

            <Stack
              direction="row"
              sx={{
                mt: 2.4,
                flexWrap: 'wrap',
                alignItems: 'center',
                gap: { xs: 1.5, sm: 2.5 },
                color: 'text.secondary',
              }}
            >
              <Stack
                direction="row"
                sx={{ alignItems: 'center', gap: 0.7 }}
              >
                <CalendarMonthRoundedIcon
                  aria-hidden
                  sx={{ fontSize: 18 }}
                />
                <Typography variant="caption">
                  {formatLongDate(event.date)}
                </Typography>
              </Stack>

              {event.guests ? (
                <Stack
                  direction="row"
                  sx={{ alignItems: 'center', gap: 0.7 }}
                >
                  <GroupsRoundedIcon
                    aria-hidden
                    sx={{ fontSize: 18 }}
                  />
                  <Typography variant="caption">
                    {event.guests}
                  </Typography>
                </Stack>
              ) : null}

              {countLabel ? (
                <Typography variant="caption">
                  {countLabel}
                </Typography>
              ) : null}
            </Stack>
          </Box>

          {/* GALLERY */}
          <Box sx={{ mt: { xs: 4, md: 5 } }}>
            <PastEventGallery media={event.media} />
          </Box>

          {/* CTA */}
          <Box
            sx={{
              mt: { xs: 5, md: 7 },
              pt: { xs: 4, md: 5 },
              borderTop: '1px solid',
              borderColor: 'divider',
              display: 'flex',
              flexWrap: 'wrap',
              gap: 1.5,
            }}
          >
            <Link
              href="/events#enquiry"
              style={{ textDecoration: 'none' }}
            >
              <Button
                variant="contained"
                size="large"
                sx={{ minHeight: 52, px: 3 }}
              >
                Plan a Similar Event
              </Button>
            </Link>

            <Link
              href="/gallery"
              style={{ textDecoration: 'none' }}
            >
              <Button
                variant="outlined"
                size="large"
                sx={{ minHeight: 52, px: 3 }}
              >
                View the Gallery
              </Button>
            </Link>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
