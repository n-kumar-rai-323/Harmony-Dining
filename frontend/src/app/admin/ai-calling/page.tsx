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
import ChatRoundedIcon from '@mui/icons-material/ChatRounded';
import CallRoundedIcon from '@mui/icons-material/CallRounded';
import FactCheckRoundedIcon from '@mui/icons-material/FactCheckRounded';
import ContactSupportRoundedIcon from '@mui/icons-material/ContactSupportRounded';
import SpeakerNotesRoundedIcon from '@mui/icons-material/SpeakerNotesRounded';

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
    label: 'AI Chat Ordering',
    description: 'When a website visitor decides to order, AI takes it from a chat widget.',
    icon: ChatRoundedIcon,
    fields: [
      { label: 'Enabled', options: ['On', 'Off'] },
      { label: 'Widget position', options: ['Bottom right', 'Bottom left'] },
      { label: 'Greeting message', type: 'text', fullWidth: true },
      { label: 'Active on', options: ['Menu page', 'All pages'] },
    ],
  },
  {
    label: 'AI Voice Calling',
    description: 'AI answers or calls back customers by phone to take their order.',
    icon: CallRoundedIcon,
    fields: [
      { label: 'Enabled', options: ['On', 'Off'] },
      { label: 'Business phone number', type: 'text' },
      { label: 'Voice', options: ['Female', 'Male'] },
      { label: 'Max call duration (min)', type: 'number' },
    ],
  },
  {
    label: 'Order Confirmation',
    description: 'AI drafts the order; a confirmation step happens before it is finalized.',
    icon: FactCheckRoundedIcon,
    fields: [
      { label: 'Require customer confirmation', options: ['On', 'Off'] },
      { label: 'Confirmation channel', options: ['SMS', 'Email', 'Chat'] },
      { label: 'Auto-cancel if unconfirmed (min)', type: 'number' },
    ],
  },
  {
    label: 'Human Escalation',
    description: 'Hands off to staff when the AI is unsure or the customer asks for a person.',
    icon: ContactSupportRoundedIcon,
    fields: [
      { label: 'Escalation trigger', options: ['Low confidence', 'Customer request', 'Both'] },
      { label: 'Notify staff via', options: ['Email', 'SMS', 'Dashboard alert'] },
      { label: 'Escalation contact', type: 'text' },
    ],
  },
  {
    label: 'AI Conversation Log',
    description: 'Every AI-customer interaction, kept for review — like the audit log.',
    icon: SpeakerNotesRoundedIcon,
    fields: [
      { label: 'Retention period (days)', type: 'number' },
      { label: 'Log voice transcripts', options: ['On', 'Off'] },
      { label: 'Visible to', options: ['Admins only', 'Managers & above', 'All staff'] },
    ],
  },
];

export default function AdminAiCallingPage() {
  const [open, setOpen] = useState<SubModule | null>(null);

  return (
    <Box>
      <PageHeader
        title="AI Calling"
        subtitle="When a visitor decides to order, AI replies and takes it — by chat or by phone."
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
