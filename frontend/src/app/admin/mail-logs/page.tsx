'use client';

import { useEffect, useState } from 'react';

import {
  Box,
  Chip,
  Dialog,
  DialogContent,
  DialogTitle,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';

import { FilterBar, PageHeader, QueryBoundary } from '@/components/admin/ui';
import { DataTable, type Column } from '@/components/admin/data-table';
import { useAdminList } from '@/lib/admin/use-admin-list';
import {
  MAIL_LOGS_PATH,
  type MailLog,
  type MailStatus,
} from '@/lib/admin/resources/mail';

const STATUS_COLOR: Record<MailStatus, 'default' | 'success' | 'error' | 'warning'> = {
  QUEUED: 'warning',
  SENT: 'success',
  FAILED: 'error',
};

function fmt(iso: string | null) {
  return iso ? new Date(iso).toLocaleString() : '—';
}

export default function AdminMailLogsPage() {
  const { data, loading, error, reload, params, setParam } =
    useAdminList<MailLog>(MAIL_LOGS_PATH, { pageSize: 50 });

  const [searchInput, setSearchInput] = useState('');
  useEffect(() => {
    const t = setTimeout(
      () => setParam('search', searchInput.trim() || undefined),
      400,
    );
    return () => clearTimeout(t);
  }, [searchInput, setParam]);

  const [detail, setDetail] = useState<MailLog | null>(null);

  const columns: Column<MailLog>[] = [
    {
      key: 'time',
      header: 'Created',
      width: 170,
      render: (r) => (
        <Typography variant="caption" color="text.secondary">
          {fmt(r.createdAt)}
        </Typography>
      ),
    },
    { key: 'to', header: 'To', width: 220, render: (r) => r.to },
    {
      key: 'subject',
      header: 'Subject',
      render: (r) => (
        <Typography variant="body2" noWrap sx={{ maxWidth: 320 }}>
          {r.subject}
        </Typography>
      ),
    },
    {
      key: 'template',
      header: 'Template',
      width: 160,
      render: (r) => (
        <Typography variant="caption" sx={{ fontFamily: 'monospace' }}>
          {r.template}
        </Typography>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      width: 100,
      render: (r) => <Chip size="small" label={r.status} color={STATUS_COLOR[r.status]} />,
    },
    { key: 'attempts', header: 'Tries', width: 70, align: 'right', render: (r) => r.attempts },
  ];

  return (
    <Box>
      <PageHeader
        title="Mail log"
        subtitle="Outbound email attempts. Delivery is best-effort and never blocks core actions."
      />

      <FilterBar>
        <TextField
          select
          size="small"
          label="Status"
          value={(params.status as string) ?? ''}
          onChange={(e) => setParam('status', e.target.value || undefined)}
          sx={{ minWidth: 140 }}
        >
          <MenuItem value="">All</MenuItem>
          <MenuItem value="QUEUED">Queued</MenuItem>
          <MenuItem value="SENT">Sent</MenuItem>
          <MenuItem value="FAILED">Failed</MenuItem>
        </TextField>
        <TextField
          size="small"
          label="Template"
          value={(params.template as string) ?? ''}
          onChange={(e) => setParam('template', e.target.value || undefined)}
          sx={{ minWidth: 180 }}
        />
        <TextField
          size="small"
          label="Search recipient or subject"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          sx={{ flexGrow: 1 }}
        />
      </FilterBar>

      <QueryBoundary loading={loading && !data} error={error} onRetry={reload}>
        <DataTable
          columns={columns}
          rows={data?.items ?? []}
          getRowKey={(r) => r.id}
          loading={loading}
          emptyText="No emails have been sent yet."
          onRowClick={(r) => setDetail(r)}
          pagination={{
            page: data?.page ?? 1,
            pageSize: data?.pageSize ?? 50,
            total: data?.total ?? 0,
            onPageChange: (p) => setParam('page', p),
            onPageSizeChange: (s) => setParam('pageSize', s),
          }}
        />
      </QueryBoundary>

      <Dialog open={Boolean(detail)} onClose={() => setDetail(null)} maxWidth="sm" fullWidth>
        {detail && (
          <>
            <DialogTitle>{detail.subject}</DialogTitle>
            <DialogContent dividers>
              <Stack spacing={1.5}>
                <Row label="To">{detail.to}</Row>
                <Row label="Template">{detail.template}</Row>
                <Row label="Status">
                  <Chip size="small" label={detail.status} color={STATUS_COLOR[detail.status]} />
                </Row>
                <Row label="Attempts">{detail.attempts}</Row>
                <Row label="Created">{fmt(detail.createdAt)}</Row>
                <Row label="Sent">{fmt(detail.sentAt)}</Row>
                {(detail.entityType || detail.entityId) && (
                  <Row label="Entity">
                    {detail.entityType}
                    {detail.entityId ? ` · ${detail.entityId}` : ''}
                  </Row>
                )}
                {detail.error && (
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Error
                    </Typography>
                    <Box
                      component="pre"
                      sx={{
                        m: 0,
                        p: 1.5,
                        bgcolor: 'action.hover',
                        borderRadius: 1,
                        fontSize: 12,
                        whiteSpace: 'pre-wrap',
                      }}
                    >
                      {detail.error}
                    </Box>
                  </Box>
                )}
              </Stack>
            </DialogContent>
          </>
        )}
      </Dialog>
    </Box>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <Stack direction="row" spacing={2}>
      <Typography variant="body2" color="text.secondary" sx={{ minWidth: 90 }}>
        {label}
      </Typography>
      <Typography variant="body2" component="div">
        {children}
      </Typography>
    </Stack>
  );
}
