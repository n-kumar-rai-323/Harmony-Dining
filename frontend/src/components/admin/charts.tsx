'use client';

import { Box, Stack, Typography } from '@mui/material';

export type Segment = { label: string; value: number; color: string };

/** Lightweight SVG donut — no charting dependency. */
export function Donut({
  segments,
  size = 168,
  thickness = 20,
  centerLabel,
  centerSub,
}: {
  segments: Segment[];
  size?: number;
  thickness?: number;
  centerLabel?: string;
  centerSub?: string;
}) {
  const total = segments.reduce((s, x) => s + x.value, 0);
  const r = (size - thickness) / 2;
  const c = 2 * Math.PI * r;
  let offset = 0;

  return (
    <Stack direction="row" spacing={2.5} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
      <Box sx={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke="currentColor"
            strokeOpacity={0.1}
            strokeWidth={thickness}
          />
          {total > 0 &&
            segments.map((s, i) => {
              const len = (s.value / total) * c;
              const el = (
                <circle
                  key={i}
                  cx={size / 2}
                  cy={size / 2}
                  r={r}
                  fill="none"
                  stroke={s.color}
                  strokeWidth={thickness}
                  strokeDasharray={`${len} ${c - len}`}
                  strokeDashoffset={-offset}
                  strokeLinecap="butt"
                  transform={`rotate(-90 ${size / 2} ${size / 2})`}
                />
              );
              offset += len;
              return el;
            })}
        </svg>
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            display: 'grid',
            placeItems: 'center',
            textAlign: 'center',
          }}
        >
          <Box>
            <Typography sx={{ fontWeight: 800, fontSize: '1.5rem', lineHeight: 1 }}>
              {centerLabel ?? total}
            </Typography>
            {centerSub && (
              <Typography variant="caption" color="text.secondary">
                {centerSub}
              </Typography>
            )}
          </Box>
        </Box>
      </Box>

      <Stack spacing={0.75} sx={{ minWidth: 0 }}>
        {segments.map((s) => (
          <Stack key={s.label} direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <Box sx={{ width: 10, height: 10, borderRadius: '3px', bgcolor: s.color, flexShrink: 0 }} />
            <Typography variant="body2" sx={{ flexGrow: 1 }} noWrap>
              {s.label}
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 700 }}>
              {s.value}
            </Typography>
          </Stack>
        ))}
      </Stack>
    </Stack>
  );
}

export type Bar = { label: string; value: number; color?: string };

/** Simple horizontal bar list with a value on the right. */
export function BarList({ bars, unit }: { bars: Bar[]; unit?: string }) {
  const max = Math.max(1, ...bars.map((b) => b.value));
  return (
    <Stack spacing={1.5}>
      {bars.map((b) => (
        <Box key={b.label}>
          <Stack direction="row" sx={{ justifyContent: 'space-between', mb: 0.5 }}>
            <Typography variant="body2">{b.label}</Typography>
            <Typography variant="body2" sx={{ fontWeight: 700 }}>
              {b.value}
              {unit ? ` ${unit}` : ''}
            </Typography>
          </Stack>
          <Box sx={{ height: 8, borderRadius: 5, bgcolor: 'action.hover', overflow: 'hidden' }}>
            <Box
              sx={{
                height: '100%',
                width: `${(b.value / max) * 100}%`,
                borderRadius: 5,
                bgcolor: b.color ?? 'primary.main',
              }}
            />
          </Box>
        </Box>
      ))}
    </Stack>
  );
}
