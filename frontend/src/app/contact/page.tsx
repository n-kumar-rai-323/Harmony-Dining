import type { Metadata } from 'next';

import Link from 'next/link';

import {
  Box,
  Button,
  Container,
  Stack,
  Typography,
} from '@mui/material';

import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded';
import CelebrationRoundedIcon from '@mui/icons-material/CelebrationRounded';
import EmailRoundedIcon from '@mui/icons-material/EmailRounded';
import LocationOnRoundedIcon from '@mui/icons-material/LocationOnRounded';
import PhoneRoundedIcon from '@mui/icons-material/PhoneRounded';
import BoltRoundedIcon from '@mui/icons-material/BoltRounded';
import { alpha } from '@mui/material/styles';

import { getSiteSettings } from '@/lib/api/site';
import { getPageHeaders } from '@/lib/api/page-headers';
import ContactForm from '@/components/contact/contact-form';

// See frontend/src/app/layout.tsx for why this is forced dynamic.
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Contact',
  description:
    'Get in touch with Harmony Dining & Event Center — visit us, reserve a table, plan an event or reach us on social media.',
  alternates: {
    canonical: '/contact',
  },
  openGraph: {
    title: 'Contact | Harmony Dining & Event Center',
    description:
      'Visit Harmony Dining & Event Center, reserve a table, plan an event or reach us on social media.',
    url: '/contact',
  },
};

export default async function ContactPage() {
  const [{ contact, social }, { contact: hero }] = await Promise.all([
    getSiteSettings(),
    getPageHeaders(),
  ]);

  const CONTACT_DETAILS = {
    phone: contact.phone,
    email: contact.email,
    addressLines: contact.addressLines,
    hours: contact.hours.flatMap((entry) => [entry.label, entry.value]),
  };

  const SOCIAL_LINKS = social;

  return (
    <Box
      component="main"
      sx={{
        minHeight: '100vh',
        bgcolor: 'background.default',
        color: 'text.primary',
      }}
    >
      {/* HEADER */}
      <Box
        component="section"
        sx={{ pt: { xs: 5, md: 8 }, pb: { xs: 4, md: 6 } }}
      >
        <Container maxWidth="md">
          <Typography
            variant="overline"
            sx={{ color: 'secondary.dark' }}
          >
            {hero?.eyebrow ?? 'Contact'}
          </Typography>

          <Typography
            component="h1"
            variant="h2"
            sx={{ mt: 1 }}
          >
            {hero?.title ?? 'We would love to hear from you.'}
          </Typography>

          <Typography
            variant="body1"
            sx={{ mt: 2, maxWidth: 620, color: 'text.secondary' }}
          >
            {hero?.description ??
              'The quickest way to book is through our reservation and event forms — they reach the team directly. You can also visit us in person or message us on social media.'}
          </Typography>
        </Container>
      </Box>

      {/* DETAILS + FORM */}
      <Box component="section" sx={{ pb: { xs: 6, md: 9 } }}>
        <Container maxWidth="lg">
          <Box
            sx={{
              display: 'grid',
              gap: { xs: 3, md: 4 },
              gridTemplateColumns: { xs: '1fr', md: '360px minmax(0, 1fr)' },
              alignItems: 'start',
            }}
          >
            {/* LEFT — CONTACT INFO */}
            <Box
              sx={{
                display: 'grid',
                gap: 2.5,
                gridTemplateColumns: { xs: 'repeat(2, minmax(0, 1fr))', md: '1fr' },
              }}
            >
              <ContactCard
                icon={<LocationOnRoundedIcon aria-hidden />}
                title="Visit Us"
                lines={CONTACT_DETAILS.addressLines}
                actionHref="/#location"
                actionLabel="View map & directions"
              />

              <ContactCard
                icon={<AccessTimeRoundedIcon aria-hidden />}
                title="Opening Hours"
                lines={CONTACT_DETAILS.hours}
              />

              {CONTACT_DETAILS.phone ? (
                <ContactCard
                  icon={<PhoneRoundedIcon aria-hidden />}
                  title="Call Us"
                  lines={[CONTACT_DETAILS.phone]}
                  actionHref={`tel:${CONTACT_DETAILS.phone.replace(/\s+/g, '')}`}
                  actionLabel="Call now"
                />
              ) : null}

              {CONTACT_DETAILS.email ? (
                <ContactCard
                  icon={<EmailRoundedIcon aria-hidden />}
                  title="Email Us"
                  lines={[CONTACT_DETAILS.email]}
                  actionHref={`mailto:${CONTACT_DETAILS.email}`}
                  actionLabel="Send an email"
                />
              ) : null}

              <Box
                sx={{
                  gridColumn: { xs: '1 / -1', md: 'auto' },
                  p: 3,
                  borderRadius: 3,
                  bgcolor: 'primary.main',
                  color: 'primary.contrastText',
                }}
              >
                <BoltRoundedIcon aria-hidden />
                <Typography variant="subtitle1" sx={{ mt: 1, fontWeight: 800 }}>
                  We reply personally
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ mt: 0.5, color: alpha('#FFFFFF', 0.82) }}
                >
                  Every message is read by our team — no bots, no auto-replies.
                </Typography>
              </Box>
            </Box>

            {/* RIGHT — SEND A MESSAGE */}
            <ContactForm />
          </Box>

          {/* SOCIAL */}
          <Box sx={{ mt: 5 }}>
            <Typography
              variant="overline"
              sx={{ color: 'secondary.dark' }}
            >
              Follow Harmony
            </Typography>

            <Stack
              direction="row"
              sx={{ mt: 1, gap: 1, flexWrap: 'wrap' }}
            >
              {SOCIAL_LINKS.map((social) => (
                <Button
                  key={social.label}
                  component="a"
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  variant="outlined"
                  sx={{ minHeight: 44 }}
                >
                  {social.label}
                </Button>
              ))}
            </Stack>
          </Box>
        </Container>
      </Box>

      {/* CTA */}
      <Box
        component="section"
        sx={{
          borderTop: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper',
        }}
      >
        <Container maxWidth="md">
          <Box
            sx={{
              py: { xs: 6, md: 8 },
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
              gap: 2,
            }}
          >
            <Link
              href="/reservation"
              style={{ textDecoration: 'none' }}
            >
              <Button
                fullWidth
                variant="contained"
                size="large"
                startIcon={<CalendarMonthRoundedIcon />}
                sx={{ minHeight: 54 }}
              >
                Reserve a Table
              </Button>
            </Link>

            <Link
              href="/events#enquiry"
              style={{ textDecoration: 'none' }}
            >
              <Button
                fullWidth
                variant="outlined"
                size="large"
                startIcon={<CelebrationRoundedIcon />}
                sx={{ minHeight: 54 }}
              >
                Plan an Event
              </Button>
            </Link>
          </Box>
        </Container>
      </Box>
    </Box>
  );
}

function ContactCard({
  icon,
  title,
  lines,
  actionHref,
  actionLabel,
}: {
  icon: React.ReactNode;
  title: string;
  lines: string[];
  actionHref?: string;
  actionLabel?: string;
}) {
  return (
    <Box
      sx={{
        p: 3,
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
        bgcolor: 'background.paper',
      }}
    >
      <Box
        sx={{
          width: 48,
          height: 48,
          display: 'grid',
          placeItems: 'center',
          borderRadius: '50%',
          bgcolor: 'action.hover',
          color: 'secondary.dark',
        }}
      >
        {icon}
      </Box>

      <Typography
        variant="subtitle1"
        sx={{ mt: 1.5, fontWeight: 800 }}
      >
        {title}
      </Typography>

      <Box sx={{ mt: 0.5 }}>
        {lines.map((line) => (
          <Typography
            key={line}
            variant="body2"
            sx={{ color: 'text.secondary' }}
          >
            {line}
          </Typography>
        ))}
      </Box>

      {actionHref && actionLabel ? (
        <Box sx={{ mt: 1.5 }}>
          <Link
            href={actionHref}
            style={{ textDecoration: 'none' }}
          >
            <Typography
              variant="caption"
              sx={{ color: 'primary.main', fontWeight: 800 }}
            >
              {actionLabel} →
            </Typography>
          </Link>
        </Box>
      ) : null}
    </Box>
  );
}
