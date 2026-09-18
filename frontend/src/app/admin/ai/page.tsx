'use client';

import { useState } from 'react';

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import type { SvgIconComponent } from '@mui/icons-material';
import ForumRoundedIcon from '@mui/icons-material/ForumRounded';
import ReviewsRoundedIcon from '@mui/icons-material/ReviewsRounded';
import EditNoteRoundedIcon from '@mui/icons-material/EditNoteRounded';
import QueryStatsRoundedIcon from '@mui/icons-material/QueryStatsRounded';
import GppMaybeRoundedIcon from '@mui/icons-material/GppMaybeRounded';
import RecommendRoundedIcon from '@mui/icons-material/RecommendRounded';

import { DialogHeader, PageHeader } from '@/components/admin/ui';

type FieldSpec = {
  label: string;
  type?: 'text' | 'number';
  options?: string[];
  fullWidth?: boolean;
};

type SubModule = {
  label: string;
  description: string;
  icon: SvgIconComponent;
  fields: FieldSpec[];
};

const SUB_MODULES: SubModule[] = [
  {
    label: 'AI Chat Assistant',
    description: 'Answers guest questions and helps with reservations on the website.',
    icon: ForumRoundedIcon,
    fields: [
      { label: 'Enabled', options: ['On', 'Off'] },
      { label: 'Greeting message', type: 'text', fullWidth: true },
      { label: 'Response tone', options: ['Friendly', 'Formal', 'Concise'] },
      { label: 'Escalate to email', type: 'text' },
    ],
  },
  {
    label: 'Review Insights',
    description: 'Summarizes guest sentiment and flags reviews that need attention.',
    icon: ReviewsRoundedIcon,
    fields: [
      { label: 'Auto-summarize new reviews', options: ['On', 'Off'] },
      { label: 'Negative sentiment alert threshold', type: 'number' },
      { label: 'Weekly digest recipient', type: 'text' },
    ],
  },
  {
    label: 'Content Assistant',
    description: 'Drafts menu descriptions, gallery captions and homepage copy.',
    icon: EditNoteRoundedIcon,
    fields: [
      { label: 'Default writing tone', options: ['Warm', 'Elegant', 'Playful', 'Formal'] },
      { label: 'Auto-generate photo alt text', options: ['On', 'Off'] },
      { label: 'Preferred language', options: ['English', 'Nepali'] },
    ],
  },
  {
    label: 'Demand Forecasting',
    description: 'Predicts busy days and reservation demand ahead of time.',
    icon: QueryStatsRoundedIcon,
    fields: [
      { label: 'Forecast horizon', options: ['7 days', '30 days', '90 days'] },
      { label: 'Data source', options: ['Reservations', 'Enquiries', 'Both'] },
      { label: 'High-demand alert threshold', type: 'number' },
    ],
  },
  {
    label: 'Spam & Fraud Detection',
    description: 'Flags suspicious reviews and enquiry submissions automatically.',
    icon: GppMaybeRoundedIcon,
    fields: [
      { label: 'Detection sensitivity', options: ['Low', 'Medium', 'High'] },
      { label: 'Auto-reject above score', type: 'number' },
      { label: 'Notify admin on flag', options: ['On', 'Off'] },
    ],
  },
  {
    label: 'Smart Recommendations',
    description: 'Suggests menu pairings and events tailored to each guest.',
    icon: RecommendRoundedIcon,
    fields: [
      { label: 'Recommendation type', options: ['Menu pairing', 'Event suggestions', 'Both'] },
      { label: 'Placement', options: ['Homepage', 'Menu page', 'Confirmation email'] },
      { label: 'Max suggestions shown', type: 'number' },
    ],
  },
];

export default function AdminAiPage() {
  const [open, setOpen] = useState<SubModule | null>(null);

  return (
    <Box>
      <PageHeader
        title="AI Module"
        subtitle="AI-assisted tools across the site — chat, content, insights and recommendations."
      />

      <Box
        sx={{
          display: 'grid',
          gap: 2,
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, 1fr)',
            md: 'repeat(3, 1fr)',
          },
        }}
      >
        {SUB_MODULES.map((mod) => (
          <Card
            key={mod.label}
            variant="outlined"
            sx={{ cursor: 'pointer' }}
            onClick={() => setOpen(mod)}
          >
            <CardContent>
              <Stack
                direction="row"
                spacing={1.5}
                sx={{ alignItems: 'flex-start', justifyContent: 'space-between' }}
              >
                <Box
                  sx={{
                    display: 'grid',
                    placeItems: 'center',
                    width: 40,
                    height: 40,
                    borderRadius: 2,
                    flexShrink: 0,
                    color: 'primary.main',
                    bgcolor: 'action.hover',
                  }}
                >
                  <mod.icon fontSize="small" />
                </Box>
                <Chip label="Coming soon" size="small" variant="outlined" />
              </Stack>
              <Typography variant="subtitle2" sx={{ mt: 1.5, fontWeight: 700 }}>
                {mod.label}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                {mod.description}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Box>

      <Dialog open={Boolean(open)} onClose={() => setOpen(null)} maxWidth="sm" fullWidth>
        {open && (
          <>
            <DialogHeader icon={open.icon} title={open.label} onClose={() => setOpen(null)} />
            <DialogContent dividers>
              <Stack spacing={2}>
                <Alert severity="info">
                  This module is coming soon — nothing here is active yet. This preview shows the
                  settings it will offer.
                </Alert>
                <Box
                  sx={{
                    display: 'grid',
                    gap: 2,
                    gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                  }}
                >
                  {open.fields.map((f) => (
                    <TextField
                      key={f.label}
                      label={f.label}
                      type={f.type === 'number' ? 'number' : 'text'}
                      select={Boolean(f.options)}
                      disabled
                      size="small"
                      sx={{ gridColumn: f.fullWidth ? { sm: '1 / -1' } : undefined }}
                    >
                      {f.options?.map((o) => (
                        <MenuItem key={o} value={o}>{o}</MenuItem>
                      ))}
                    </TextField>
                  ))}
                </Box>
              </Stack>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpen(null)}>Close</Button>
              <Button variant="contained" disabled>
                Save
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
}
