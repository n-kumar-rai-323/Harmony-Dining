'use client';

import { useEffect, useState } from 'react';

import {
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';

import { PageHeader, QueryBoundary } from '@/components/admin/ui';
import { DataTable, type Column } from '@/components/admin/data-table';
import { useAdminList } from '@/lib/admin/use-admin-list';
import { useAdminQuery } from '@/lib/admin/use-admin-query';
import {
  AUDIT_PATH,
  type AuditEntry,
  type AuditFacets,
} from '@/lib/admin/resources/audit';

function fmt(iso: string) {
  return new Date(iso).toLocaleString();
}

export default function AdminAuditPage() {
  const { data, loading, error, reload, params, setParam } =
    useAdminList<AuditEntry>(AUDIT_PATH, { pageSize: 50 });
  const facets = useAdminQuery<AuditFacets>(`${AUDIT_PATH}/facets`);

  const [searchInput, setSearchInput] = useState('');
  const [actorInput, setActorInput] = useState('');
  useEffect(() => {
    const t = setTimeout(() => {
      setParam('search', searchInput.trim() || undefined);
      setParam('actorEmail', actorInput.trim() || undefined);
    }, 400);
    return () => clearTimeout(t);
  }, [searchInput, actorInput, setParam]);

  const [detailId, setDetailId] = useState<string | null>(null);

  const columns: Column<AuditEntry>[] = [
    {
      key: 'time',
      header: 'When',
      width: 170,
      render: (r) => (
        <Typography variant="caption" color="text.secondary">
          {fmt(r.createdAt)}
        </Typography>
      ),
    },
    {
      key: 'actor',
      header: 'Actor',
      width: 200,
      render: (r) => (
        <Box>
          <Typography variant="body2">{r.actor?.name ?? '—'}</Typography>
          <Typography variant="caption" color="text.secondary">
            {r.actorEmail ?? 'system'}
          </Typography>
        </Box>
      ),
    },
    {
      key: 'action',
      header: 'Action',
      render: (r) => (
        <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
          {r.action}
        </Typography>
      ),
    },
    {
      key: 'entity',
      header: 'Entity',
      render: (r) => (
        <Box>
          <Typography variant="body2">{r.entityType}</Typography>
          {r.entityId && (
            <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
              {r.entityId}
            </Typography>
          )}
        </Box>
      ),
    },
    {
      key: 'ip',
      header: 'IP',
      width: 120,
      render: (r) => (
        <Typography variant="caption" color="text.secondary">
          {r.ip ?? '—'}
        </Typography>
      ),
    },
  ];

  return (
    <Box>
      <PageHeader title="Audit log" subtitle="Every change made through the admin API." />

      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={1.5}
        sx={{ mb: 2, flexWrap: 'wrap' }}
      >
        <TextField
          select
          size="small"
          label="Action"
          value={(params.action as string) ?? ''}
          onChange={(e) => setParam('action', e.target.value || undefined)}
          sx={{ minWidth: 200 }}
        >
          <MenuItem value="">All</MenuItem>
          {(facets.data?.actions ?? []).map((a) => (
            <MenuItem key={a.value} value={a.value}>
              {a.value} ({a.count})
            </MenuItem>
          ))}
        </TextField>
        <TextField
          select
          size="small"
          label="Entity type"
          value={(params.entityType as string) ?? ''}
          onChange={(e) => setParam('entityType', e.target.value || undefined)}
          sx={{ minWidth: 170 }}
        >
          <MenuItem value="">All</MenuItem>
          {(facets.data?.entityTypes ?? []).map((a) => (
            <MenuItem key={a.value} value={a.value}>
              {a.value} ({a.count})
            </MenuItem>
          ))}
        </TextField>
        <TextField
          size="small"
          label="Actor email"
          value={actorInput}
          onChange={(e) => setActorInput(e.target.value)}
          sx={{ minWidth: 200 }}
        />
        <TextField
          type="datetime-local"
          size="small"
          label="From"
          slotProps={{ inputLabel: { shrink: true } }}
          value={(params.from as string)?.slice(0, 16) ?? ''}
          onChange={(e) =>
            setParam('from', e.target.value ? new Date(e.target.value).toISOString() : undefined)
          }
        />
        <TextField
          type="datetime-local"
          size="small"
          label="To"
          slotProps={{ inputLabel: { shrink: true } }}
          value={(params.to as string)?.slice(0, 16) ?? ''}
          onChange={(e) =>
            setParam('to', e.target.value ? new Date(e.target.value).toISOString() : undefined)
          }
        />
        <TextField
          size="small"
          label="Search"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          sx={{ flexGrow: 1, minWidth: 160 }}
        />
      </Stack>

      <QueryBoundary loading={loading && !data} error={error} onRetry={reload}>
        <DataTable
          columns={columns}
          rows={data?.items ?? []}
          getRowKey={(r) => r.id}
          loading={loading}
          emptyText="No audit entries match these filters."
          onRowClick={(r) => setDetailId(r.id)}
          pagination={{
            page: data?.page ?? 1,
            pageSize: data?.pageSize ?? 50,
            total: data?.total ?? 0,
            onPageChange: (p) => setParam('page', p),
            onPageSizeChange: (s) => setParam('pageSize', s),
          }}
        />
      </QueryBoundary>

      <Dialog
        open={Boolean(detailId)}
        onClose={() => setDetailId(null)}
        maxWidth="md"
        fullWidth
      >
        {detailId && <AuditDetail id={detailId} onClose={() => setDetailId(null)} />}
      </Dialog>
    </Box>
  );
}

function AuditDetail({ id, onClose }: { id: string; onClose: () => void }) {
  const { data, error } = useAdminQuery<AuditEntry>(`${AUDIT_PATH}/${id}`);

  return (
    <>
      <DialogTitle>
        {data ? data.action : 'Audit entry'}
        <IconButton
          onClick={onClose}
          sx={{ position: 'absolute', right: 8, top: 8 }}
          size="small"
        >
          <CloseRoundedIcon fontSize="small" />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        {error && <Typography color="error">{error}</Typography>}
        {data && (
          <Stack spacing={2}>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                gap: 1,
              }}
            >
              <Field label="When">{fmt(data.createdAt)}</Field>
              <Field label="Actor">
                {data.actor?.name ?? '—'} ({data.actorEmail ?? 'system'})
              </Field>
              <Field label="Entity">
                {data.entityType}
                {data.entityId ? ` · ${data.entityId}` : ''}
              </Field>
              <Field label="IP">{data.ip ?? '—'}</Field>
              <Field label="User agent">{data.userAgent ?? '—'}</Field>
              <Field label="Request id">{data.requestId ?? '—'}</Field>
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
              <JsonBlock label="Before" value={data.before} />
              <JsonBlock label="After" value={data.after} />
            </Box>
          </Stack>
        )}
      </DialogContent>
    </>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <Box>
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
        {label}
      </Typography>
      <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>
        {children}
      </Typography>
    </Box>
  );
}

function JsonBlock({ label, value }: { label: string; value: unknown }) {
  return (
    <Box>
      <Typography variant="overline" color="text.secondary">
        {label}
      </Typography>
      <Box
        component="pre"
        sx={{
          m: 0,
          p: 1.5,
          bgcolor: 'action.hover',
          borderRadius: 1,
          fontSize: 12,
          overflowX: 'auto',
          maxHeight: 320,
        }}
      >
        {value == null ? '—' : JSON.stringify(value, null, 2)}
      </Box>
    </Box>
  );
}
