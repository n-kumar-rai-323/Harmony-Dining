'use client';

import { useEffect, useState } from 'react';

import {
  Box,
  Button,
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

import { FilterBar, PageHeader, QueryBoundary } from '@/components/admin/ui';
import { useAdminList } from '@/lib/admin/use-admin-list';
import { useAdminQuery } from '@/lib/admin/use-admin-query';
import { adminApi } from '@/lib/admin/api';
import {
  AUDIT_PATH,
  type AuditEntry,
  type AuditFacets,
} from '@/lib/admin/resources/audit';
import { USERS_PATH, type AdminUserRow } from '@/lib/admin/resources/users';
import { actionMeta, describeChange, sectionLabel, toneBg, toneColor } from '@/lib/admin/audit-format';

function fmt(iso: string) {
  return new Date(iso).toLocaleString();
}

function prettyIp(ip: string | null): string {
  if (!ip) return '—';
  const v = ip.replace(/^::ffff:/, '');
  return v === '::1' || v === '127.0.0.1' ? 'localhost' : v;
}

export default function AdminAuditPage() {
  const { data, loading, error, reload, params, setParam } =
    useAdminList<AuditEntry>(AUDIT_PATH, { pageSize: 50 });
  const facets = useAdminQuery<AuditFacets>(`${AUDIT_PATH}/facets`);

  const [users, setUsers] = useState<AdminUserRow[]>([]);
  useEffect(() => {
    let cancelled = false;
    adminApi
      .get<{ items: AdminUserRow[] }>(`${USERS_PATH}?pageSize=100`)
      .then((res) => {
        if (!cancelled) setUsers(res.items);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const [searchInput, setSearchInput] = useState('');
  useEffect(() => {
    const t = setTimeout(() => setParam('search', searchInput.trim() || undefined), 400);
    return () => clearTimeout(t);
  }, [searchInput, setParam]);

  const [detailId, setDetailId] = useState<string | null>(null);

  return (
    <Box>
      <PageHeader
        title="Audit log"
        subtitle="Every change made in this admin panel, who made it and when."
      />

      <FilterBar>
        <TextField
          select
          size="small"
          label="User"
          value={(params.actorId as string) ?? ''}
          onChange={(e) => setParam('actorId', e.target.value || undefined)}
          sx={{ minWidth: 170 }}
        >
          <MenuItem value="">All</MenuItem>
          {users.map((u) => (
            <MenuItem key={u.id} value={u.id}>{u.name}</MenuItem>
          ))}
        </TextField>
        <TextField
          select
          size="small"
          label="Action"
          value={(params.action as string) ?? ''}
          onChange={(e) => setParam('action', e.target.value || undefined)}
          sx={{ minWidth: 170 }}
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
          label="Section"
          value={(params.entityType as string) ?? ''}
          onChange={(e) => setParam('entityType', e.target.value || undefined)}
          sx={{ minWidth: 170 }}
        >
          <MenuItem value="">All</MenuItem>
          {(facets.data?.entityTypes ?? []).map((a) => (
            <MenuItem key={a.value} value={a.value}>
              {sectionLabel(a.value)} ({a.count})
            </MenuItem>
          ))}
        </TextField>
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
      </FilterBar>

      <QueryBoundary loading={loading && !data} error={error} onRetry={reload}>
        {data && data.items.length === 0 && (
          <Typography color="text.secondary" sx={{ py: 6, textAlign: 'center' }}>
            No audit entries match these filters.
          </Typography>
        )}

        <Box>
          {(data?.items ?? []).map((entry) => {
            const meta = actionMeta(entry.action);
            const Icon = meta.icon;
            return (
              <Stack
                key={entry.id}
                direction="row"
                spacing={1.5}
                onClick={() => setDetailId(entry.id)}
                sx={{
                  py: 1.5,
                  alignItems: 'flex-start',
                  cursor: 'pointer',
                  borderBottom: '1px solid',
                  borderColor: 'divider',
                  '&:hover': { bgcolor: 'action.hover' },
                }}
              >
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    display: 'grid',
                    placeItems: 'center',
                    flexShrink: 0,
                    color: toneColor(meta.tone),
                    bgcolor: toneBg(meta.tone),
                  }}
                >
                  <Icon fontSize="small" />
                </Box>
                <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                  <Typography variant="body2">
                    <Box component="span" sx={{ fontWeight: 700 }}>
                      {entry.actor?.name ?? entry.actorEmail ?? 'System'}
                    </Box>{' '}
                    <Box component="span" sx={{ color: toneColor(meta.tone), fontWeight: 600 }}>
                      {meta.label}
                    </Box>{' '}
                    in{' '}
                    <Box component="span" sx={{ fontWeight: 700 }}>
                      {sectionLabel(entry.entityType)}
                    </Box>
                  </Typography>
                  <Typography variant="body2" color="text.secondary" noWrap>
                    {describeChange(entry)}
                  </Typography>
                </Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ flexShrink: 0, whiteSpace: 'nowrap', pt: 0.25 }}
                >
                  {fmt(entry.createdAt)}
                </Typography>
              </Stack>
            );
          })}
        </Box>

        {data && data.pageCount > 1 && (
          <Stack direction="row" spacing={1} sx={{ justifyContent: 'center', alignItems: 'center', mt: 3 }}>
            <Button
              size="small"
              disabled={data.page <= 1}
              onClick={() => setParam('page', data.page - 1)}
            >
              Previous
            </Button>
            <Typography variant="body2" color="text.secondary">
              Page {data.page} / {data.pageCount}
            </Typography>
            <Button
              size="small"
              disabled={data.page >= data.pageCount}
              onClick={() => setParam('page', data.page + 1)}
            >
              Next
            </Button>
          </Stack>
        )}
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
              <Field label="IP">{prettyIp(data.ip)}</Field>
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
