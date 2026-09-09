'use client';

import { useEffect } from 'react';

import Link from 'next/link';

import {
  Box,
  Button,
  Container,
  Stack,
  Typography,
} from '@mui/material';

import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';

type ErrorProps = {
  error: Error & { digest?: string };
  retry: () => void;
};

export default function RouteError({
  error,
  retry,
}: ErrorProps) {
  useEffect(() => {
    // Surface the failure for monitoring. Replace with a real
    // reporter (Sentry, etc.) when observability is wired up.
    console.error(error);
  }, [error]);

  return (
    <Box
      component="main"
      sx={{
        minHeight: '70vh',
        display: 'flex',
        alignItems: 'center',
        bgcolor: 'background.default',
        color: 'text.primary',
      }}
    >
      <title>Something went wrong | Harmony Dining &amp; Event Center</title>

      <Container maxWidth="sm">
        <Box
          sx={{
            py: { xs: 8, md: 12 },
            textAlign: 'center',
          }}
        >
          <Typography
            variant="overline"
            sx={{ color: 'secondary.dark' }}
          >
            Something went wrong
          </Typography>

          <Typography
            component="h1"
            variant="h2"
            sx={{ mt: 1 }}
          >
            We hit an unexpected error.
          </Typography>

          <Typography
            variant="body1"
            sx={{
              mt: 2,
              color: 'text.secondary',
            }}
          >
            Please try again. If the problem continues, head back
            to the homepage and reach out to Harmony directly.
          </Typography>

          {error.digest ? (
            <Typography
              variant="caption"
              sx={{
                display: 'block',
                mt: 2,
                color: 'text.secondary',
                opacity: 0.7,
              }}
            >
              Reference: {error.digest}
            </Typography>
          ) : null}

          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            sx={{
              mt: 4,
              gap: 1.5,
              justifyContent: 'center',
            }}
          >
            <Button
              type="button"
              onClick={() => retry()}
              variant="contained"
              size="large"
              startIcon={<RefreshRoundedIcon />}
              sx={{ minHeight: 52, px: 3 }}
            >
              Try Again
            </Button>

            <Button
              component={Link}
              href="/"
              variant="outlined"
              size="large"
              startIcon={<HomeRoundedIcon />}
              sx={{ minHeight: 52, px: 3 }}
            >
              Back to Home
            </Button>
          </Stack>
        </Box>
      </Container>
    </Box>
  );
}
