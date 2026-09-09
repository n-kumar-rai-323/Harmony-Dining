import Link from 'next/link';

import {
  Box,
  Button,
  Container,
  Stack,
  Typography,
} from '@mui/material';

import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import RestaurantMenuRoundedIcon from '@mui/icons-material/RestaurantMenuRounded';

export default function NotFound() {
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
      <title>Page Not Found | Harmony Dining &amp; Event Center</title>

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
            Error 404
          </Typography>

          <Typography
            component="h1"
            variant="h2"
            sx={{ mt: 1 }}
          >
            This page has left the table.
          </Typography>

          <Typography
            variant="body1"
            sx={{
              mt: 2,
              color: 'text.secondary',
            }}
          >
            The page you are looking for may have been moved or
            no longer exists. Let us guide you back.
          </Typography>

          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            sx={{
              mt: 4,
              gap: 1.5,
              justifyContent: 'center',
            }}
          >
            <Link
              href="/"
              style={{ textDecoration: 'none' }}
            >
              <Button
                variant="contained"
                size="large"
                startIcon={<HomeRoundedIcon />}
                endIcon={<ArrowForwardRoundedIcon />}
                sx={{ minHeight: 52, px: 3 }}
              >
                Back to Home
              </Button>
            </Link>

            <Link
              href="/menu"
              style={{ textDecoration: 'none' }}
            >
              <Button
                variant="outlined"
                size="large"
                startIcon={<RestaurantMenuRoundedIcon />}
                sx={{ minHeight: 52, px: 3 }}
              >
                View the Menu
              </Button>
            </Link>
          </Stack>
        </Box>
      </Container>
    </Box>
  );
}
