'use client';

import { useState } from 'react';

import Link from 'next/link';

import { Box, Button, Container, Paper, Stack, Typography } from '@mui/material';
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import PeopleAltRoundedIcon from '@mui/icons-material/PeopleAltRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';

import { formatLongDate } from '@/lib/date';
import type { UpcomingEvent } from '@/lib/api/events';

/** How many upcoming events show before the visitor has to ask for more. */
const INITIAL_COUNT = 4;

function formatTime(value: string | null): string | null {
  if (!value) return null;
  const [h, m] = value.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${String(m).padStart(2, '0')} ${period}`;
}

function DateBadge({ date }: { date: string }) {
  const d = new Date(`${date}T00:00:00`);
  const day = d.toLocaleDateString(undefined, { day: '2-digit' });
  const month = d.toLocaleDateString(undefined, { month: 'short' });
  return (
    <Box
      sx={{
        width: 72,
        flexShrink: 0,
        textAlign: 'center',
        py: 1,
        borderRadius: 2,
        bgcolor: (t) => t.palette.primary.main,
        color: (t) => t.palette.primary.contrastText,
      }}
    >
      <Typography variant="h5" sx={{ fontWeight: 800, lineHeight: 1.1 }}>{day}</Typography>
      <Typography variant="overline" sx={{ fontWeight: 700 }}>{month}</Typography>
    </Box>
  );
}

export default function UpcomingEventsList({ events }: { events: UpcomingEvent[] }) {
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
            Upcoming Events
          </Typography>
          <Typography component="h2" variant="h2" sx={{ mt: 0.7 }}>
            What&apos;s coming up at Harmony.
          </Typography>
          <Typography variant="body1" sx={{ mt: 1.4, maxWidth: 620, color: 'text.secondary' }}>
            Save the date, or get in touch to plan your own celebration alongside these.
          </Typography>
        </Box>

        {!expanded && hasMore && (
          <Button
            variant="text"
            endIcon={<ArrowForwardRoundedIcon />}
            onClick={() => setExpanded(true)}
          >
            View more upcoming events
          </Button>
        )}
      </Box>

      <Stack spacing={1.5} sx={{ mt: 4 }}>
        {visible.map((event) => {
          const start = formatTime(event.startTime);
          const end = formatTime(event.endTime);
          const timeLabel = start && end ? `${start} – ${end}` : start;

          return (
            <Paper
              key={event.slug}
              variant="outlined"
              sx={{
                p: 2.2,
                borderRadius: 2,
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                gap: 2,
                alignItems: { xs: 'flex-start', sm: 'center' },
              }}
            >
              <DateBadge date={event.date} />

              <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                <Typography variant="overline" sx={{ color: 'secondary.dark' }}>
                  {event.category}
                </Typography>
                <Typography component="h3" variant="h6">
                  {event.title}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    mt: 0.25,
                    color: 'text.secondary',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}
                >
                  {event.summary}
                </Typography>
                <Stack direction="row" sx={{ mt: 1, flexWrap: 'wrap', alignItems: 'center', gap: 1.4, color: 'text.secondary' }}>
                  <Stack direction="row" sx={{ alignItems: 'center', gap: 0.7 }}>
                    <CalendarMonthRoundedIcon aria-hidden sx={{ fontSize: 18 }} />
                    <Typography variant="caption">{formatLongDate(event.date)}</Typography>
                  </Stack>
                  {timeLabel && (
                    <Stack direction="row" sx={{ alignItems: 'center', gap: 0.7 }}>
                      <AccessTimeRoundedIcon aria-hidden sx={{ fontSize: 18 }} />
                      <Typography variant="caption">{timeLabel}</Typography>
                    </Stack>
                  )}
                  {event.guests && (
                    <Stack direction="row" sx={{ alignItems: 'center', gap: 0.7 }}>
                      <PeopleAltRoundedIcon aria-hidden sx={{ fontSize: 18 }} />
                      <Typography variant="caption">{event.guests}</Typography>
                    </Stack>
                  )}
                </Stack>
              </Box>

              <Button
                component={Link}
                href="#enquiry"
                variant="outlined"
                size="small"
                sx={{ flexShrink: 0, alignSelf: { xs: 'stretch', sm: 'center' } }}
              >
                Enquire
              </Button>
            </Paper>
          );
        })}
      </Stack>
    </Container>
  );
}
