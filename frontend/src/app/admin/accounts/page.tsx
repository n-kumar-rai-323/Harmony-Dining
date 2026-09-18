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
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded';
import ReceiptLongRoundedIcon from '@mui/icons-material/ReceiptLongRounded';
import RequestQuoteRoundedIcon from '@mui/icons-material/RequestQuoteRounded';
import PaymentsRoundedIcon from '@mui/icons-material/PaymentsRounded';
import BadgeRoundedIcon from '@mui/icons-material/BadgeRounded';
import AccountBalanceRoundedIcon from '@mui/icons-material/AccountBalanceRounded';
import AssessmentRoundedIcon from '@mui/icons-material/AssessmentRounded';

import { DialogHeader, PageHeader } from '@/components/admin/ui';

type FieldSpec = {
  label: string;
  type?: 'text' | 'number' | 'date';
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
    label: 'Sales & Revenue',
    description: 'Daily sales, revenue summaries and till reconciliation.',
    icon: TrendingUpRoundedIcon,
    fields: [
      { label: 'Date', type: 'date' },
      { label: 'Gross sales (Rs)', type: 'number' },
      { label: 'Discounts (Rs)', type: 'number' },
      { label: 'Net sales (Rs)', type: 'number' },
      { label: 'Cash', type: 'number' },
      { label: 'Card', type: 'number' },
      { label: 'Digital wallet', type: 'number' },
      { label: 'Notes', type: 'text', fullWidth: true },
    ],
  },
  {
    label: 'Expenses & Purchases',
    description: 'Ingredient purchases, utility bills and other outgoings.',
    icon: ReceiptLongRoundedIcon,
    fields: [
      { label: 'Date', type: 'date' },
      { label: 'Category', options: ['Ingredients', 'Utilities', 'Rent', 'Maintenance', 'Other'] },
      { label: 'Vendor / Supplier', type: 'text' },
      { label: 'Amount (Rs)', type: 'number' },
      { label: 'Payment method', options: ['Cash', 'Card', 'Bank transfer'] },
      { label: 'Receipt / invoice number', type: 'text' },
    ],
  },
  {
    label: 'Invoices & Billing',
    description: 'Invoices for private events, hall bookings and large parties.',
    icon: RequestQuoteRoundedIcon,
    fields: [
      { label: 'Invoice number', type: 'text' },
      { label: 'Event / enquiry reference', type: 'text' },
      { label: 'Customer name', type: 'text' },
      { label: 'Amount (Rs)', type: 'number' },
      { label: 'Due date', type: 'date' },
      { label: 'Status', options: ['Draft', 'Sent', 'Paid', 'Overdue'] },
    ],
  },
  {
    label: 'Payments',
    description: 'Payment records across cash, card and digital wallets.',
    icon: PaymentsRoundedIcon,
    fields: [
      { label: 'Date', type: 'date' },
      { label: 'Reference (invoice / expense)', type: 'text' },
      { label: 'Amount (Rs)', type: 'number' },
      { label: 'Method', options: ['Cash', 'Card', 'eSewa', 'Khalti', 'Bank transfer'] },
      { label: 'Received / paid by', type: 'text' },
    ],
  },
  {
    label: 'Payroll',
    description: 'Staff salaries, advances and payroll records.',
    icon: BadgeRoundedIcon,
    fields: [
      { label: 'Staff name', type: 'text' },
      { label: 'Role', type: 'text' },
      { label: 'Pay period', type: 'text' },
      { label: 'Base salary (Rs)', type: 'number' },
      { label: 'Advances (Rs)', type: 'number' },
      { label: 'Deductions (Rs)', type: 'number' },
      { label: 'Net pay (Rs)', type: 'number' },
    ],
  },
  {
    label: 'Tax / VAT',
    description: 'VAT records and tax filing summaries.',
    icon: AccountBalanceRoundedIcon,
    fields: [
      { label: 'Period (month / quarter)', type: 'text' },
      { label: 'Taxable sales (Rs)', type: 'number' },
      { label: 'VAT collected (Rs)', type: 'number' },
      { label: 'VAT paid / input credit (Rs)', type: 'number' },
      { label: 'Net VAT payable (Rs)', type: 'number' },
      { label: 'Filing status', options: ['Not filed', 'Filed', 'Paid'] },
    ],
  },
  {
    label: 'Reports',
    description: 'Profit & loss, ledgers and other financial reports.',
    icon: AssessmentRoundedIcon,
    fields: [
      { label: 'Report type', options: ['Profit & loss', 'Ledger', 'Cash flow', 'Tax summary'] },
      { label: 'From date', type: 'date' },
      { label: 'To date', type: 'date' },
      { label: 'Format', options: ['PDF', 'Excel'] },
    ],
  },
];

export default function AdminAccountsPage() {
  const [open, setOpen] = useState<SubModule | null>(null);

  return (
    <Box>
      <PageHeader
        title="Accounts"
        subtitle="Restaurant billing, payments and account records."
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
                  This module is coming soon — data entry isn&apos;t available yet. This preview
                  shows the fields it will collect.
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
                      type={f.type === 'date' ? 'date' : f.type === 'number' ? 'number' : 'text'}
                      select={Boolean(f.options)}
                      disabled
                      size="small"
                      slotProps={{ inputLabel: f.type === 'date' ? { shrink: true } : undefined }}
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
