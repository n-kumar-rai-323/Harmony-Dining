import {
  Box,
  Container,
  Typography,
} from '@mui/material';

export type LegalSection = {
  heading: string;
  paragraphs: string[];
};

type LegalDocumentProps = {
  eyebrow: string;
  title: string;
  lastUpdated: string;
  intro: string;
  sections: LegalSection[];
};

export default function LegalDocument({
  eyebrow,
  title,
  lastUpdated,
  intro,
  sections,
}: LegalDocumentProps) {
  return (
    <Box
      component="main"
      sx={{
        minHeight: '100vh',
        bgcolor: 'background.default',
        color: 'text.primary',
      }}
    >
      <Container maxWidth="md">
        <Box sx={{ py: { xs: 6, md: 9 } }}>
          <Typography
            variant="overline"
            sx={{ color: 'secondary.dark' }}
          >
            {eyebrow}
          </Typography>

          <Typography
            component="h1"
            variant="h2"
            sx={{ mt: 1 }}
          >
            {title}
          </Typography>

          <Typography
            variant="caption"
            sx={{
              display: 'block',
              mt: 1.5,
              color: 'text.secondary',
            }}
          >
            Last updated: {lastUpdated}
          </Typography>

          <Typography
            variant="body1"
            sx={{ mt: 3, color: 'text.secondary' }}
          >
            {intro}
          </Typography>

          <Box sx={{ mt: 2 }}>
            {sections.map((section) => (
              <Box key={section.heading} sx={{ mt: 4 }}>
                <Typography
                  component="h2"
                  variant="h5"
                  sx={{ mb: 1 }}
                >
                  {section.heading}
                </Typography>

                {section.paragraphs.map((paragraph, index) => (
                  <Typography
                    // Paragraphs within a section are static and ordered.
                    key={`${section.heading}-${index}`}
                    variant="body1"
                    sx={{ mt: index === 0 ? 0 : 1.5, color: 'text.secondary' }}
                  >
                    {paragraph}
                  </Typography>
                ))}
              </Box>
            ))}
          </Box>

          <Box
            sx={{
              mt: 5,
              p: 2.5,
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 2,
              bgcolor: 'background.paper',
            }}
          >
            <Typography
              variant="caption"
              sx={{ color: 'text.secondary' }}
            >
              This document is a starting template. Harmony Dining &amp;
              Event Center should have it reviewed and finalised by
              qualified legal counsel before it is relied upon.
            </Typography>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
