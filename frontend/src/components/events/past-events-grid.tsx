'use client';

import { useState } from 'react';

import Image from 'next/image';
import Link from 'next/link';

import { Box, Button, Container, Stack, Typography } from '@mui/material';
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded';
import PeopleAltRoundedIcon from '@mui/icons-material/PeopleAltRounded';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';

import { formatLongDate } from '@/lib/date';
import type { PastEvent } from '@/data/past-events';

/** How many past events show before the visitor has to ask for more. */
const INITIAL_COUNT = 4;

export default function PastEventsGrid({ events }: { events: PastEvent[] }) {
  const [expanded, setExpanded] = useState(false);

  if (events.length === 0) return null;

  const visible = expanded ? events : events.slice(0, INITIAL_COUNT);
  const hasMore = events.length > INITIAL_COUNT;

  return (
    <Container maxWidth="lg">
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: 'minmax(0,1fr) auto' },
          gap: 2,
          alignItems: 'end',
        }}
      >
        <Box sx={{ maxWidth: 700 }}>
          <Typography variant="overline" sx={{ color: 'secondary.dark' }}>
            Past Events
          </Typography>
          <Typography component="h2" variant="h2" sx={{ mt: 0.7 }}>
            Moments we’ve had the pleasure to host.
          </Typography>
          <Typography variant="body1" sx={{ mt: 1.4, maxWidth: 620, color: 'text.secondary' }}>
            Explore real Harmony spaces and celebration-style setups for inspiration before planning your own event.
          </Typography>
        </Box>

        {!expanded && hasMore && (
          <Button
            variant="text"
            endIcon={<ArrowForwardRoundedIcon />}
            onClick={() => setExpanded(true)}
          >
            View more past events
          </Button>
        )}
      </Box>

      <Box
        sx={{
          mt: 4,
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: 'repeat(3, minmax(0,1fr))' },
          gap: 2,
        }}
      >
        {visible.map((event) => {
          const isVideoCover = event.cover.type === 'video';
          const coverSrc = event.cover.type === 'image' ? event.cover.src : event.cover.poster;

          return (
            <Link
              key={event.slug}
              href={`/events/past/${event.slug}`}
              style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}
            >
              <Box
                component="article"
                sx={{
                  overflow: 'hidden',
                  bgcolor: 'background.default',
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 2,
                  transition: 'transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease',
                  '&:hover': {
                    transform: 'translateY(-3px)',
                    boxShadow: 4,
                    borderColor: 'secondary.main',
                  },
                  '@media (prefers-reduced-motion: reduce)': {
                    transition: 'none',
                    '&:hover': { transform: 'none' },
                  },
                }}
              >
                <Box
                  sx={{
                    position: 'relative',
                    aspectRatio: { xs: '16 / 11', md: '4 / 3' },
                    bgcolor: 'action.hover',
                    overflow: 'hidden',
                  }}
                >
                  <Image
                    src={coverSrc}
                    alt={event.cover.alt}
                    fill
                    loading="lazy"
                    quality={80}
                    sizes="(max-width: 900px) 100vw, 33vw"
                    style={{ objectFit: 'cover' }}
                  />
                  <Box
                    aria-hidden
                    sx={{
                      position: 'absolute',
                      inset: 0,
                      bgcolor: 'primary.dark',
                      opacity: isVideoCover ? 0.26 : 0.1,
                    }}
                  />
                  {isVideoCover ? (
                    <Box
                      aria-hidden
                      sx={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center' }}
                    >
                      <Box
                        sx={{
                          width: 52,
                          height: 52,
                          display: 'grid',
                          placeItems: 'center',
                          borderRadius: '50%',
                          color: 'primary.contrastText',
                          bgcolor: 'rgba(6, 42, 31, 0.82)',
                          border: '1px solid rgba(216, 188, 130, 0.32)',
                          backdropFilter: 'blur(8px)',
                          WebkitBackdropFilter: 'blur(8px)',
                        }}
                      >
                        <PlayArrowRoundedIcon />
                      </Box>
                    </Box>
                  ) : null}
                </Box>

                <Box sx={{ p: 2.2 }}>
                  <Typography variant="overline" sx={{ color: 'secondary.dark' }}>
                    {event.category}
                  </Typography>
                  <Typography component="h3" variant="h5" sx={{ mt: 0.25 }}>
                    {event.title}
                  </Typography>
                  <Stack
                    direction="row"
                    sx={{ mt: 1, flexWrap: 'wrap', alignItems: 'center', gap: 1.4, color: 'text.secondary' }}
                  >
                    <Stack direction="row" sx={{ alignItems: 'center', gap: 0.7 }}>
                      <CalendarMonthRoundedIcon aria-hidden sx={{ fontSize: 18 }} />
                      <Typography variant="caption">{formatLongDate(event.date)}</Typography>
                    </Stack>
                    {event.guests ? (
                      <Stack direction="row" sx={{ alignItems: 'center', gap: 0.7 }}>
                        <PeopleAltRoundedIcon aria-hidden sx={{ fontSize: 18 }} />
                        <Typography variant="caption">{event.guests}</Typography>
                      </Stack>
                    ) : null}
                  </Stack>
                  <Stack direction="row" sx={{ mt: 1.4, alignItems: 'center', gap: 0.5, color: 'secondary.dark' }}>
                    <Typography variant="caption" sx={{ fontWeight: 800 }}>
                      {isVideoCover ? 'Watch highlights' : 'View photos'}
                    </Typography>
                    <ArrowForwardRoundedIcon sx={{ fontSize: 16 }} />
                  </Stack>
                </Box>
              </Box>
            </Link>
          );
        })}
      </Box>
    </Container>
  );
}
