'use client';

import { Box, Typography } from '@mui/material';
import ConstructionRoundedIcon from '@mui/icons-material/ConstructionRounded';

import { PageHeader } from '@/components/admin/ui';

export default function AdminMailLogsPage() {
  return (
    <Box>
      <PageHeader
        title="Mail log"
        subtitle="Outbound email attempts. Delivery is best-effort and never blocks core actions."
      />

      <Box
        sx={{
          py: 10,
          textAlign: 'center',
          color: 'text.secondary',
        }}
      >
        <ConstructionRoundedIcon sx={{ fontSize: 40, mb: 1.5, opacity: 0.5 }} />
        <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary' }}>
          Coming soon
        </Typography>
        <Typography variant="body2" sx={{ mt: 0.5 }}>
          The mail log viewer isn&apos;t available yet.
        </Typography>
      </Box>
    </Box>
  );
}
