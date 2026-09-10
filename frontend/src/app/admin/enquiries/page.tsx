'use client';

import { useEffect, useState } from 'react';

import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  ListItemIcon,
  Menu,
  MenuItem,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import MoreVertRoundedIcon from '@mui/icons-material/MoreVertRounded';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';

import { FilterBar, PageHeader, QueryBoundary } from '@/components/admin/ui';
import { DataTable, type Column } from '@/components/admin/data-table';
import { useToast } from '@/components/admin/toast';
import { useAdminList } from '@/lib/admin/use-admin-list';
import { useAdminQuery } from '@/lib/admin/use-admin-query';
import { useAdminAuth } from '@/lib/admin/auth-context';
import { AdminApiError } from '@/lib/admin/api';
import {
  enquiriesApi,
  ENQUIRIES_PATH,
  ALL_STATUSES,
  NEXT_STATUSES,
  conflictCount,
  type AdminEnquiry,
  type AdminEnquiryDetail,
  type EnquiryStatus,
  type DateConflict,
} from '@/lib/admin/resources/enquiries';

const STATUS_COLOR: Record<
  EnquiryStatus,
  'default' | 'success' | 'error' | 'warning' | 'info'
> = {
  NEW: 'warning',
  CONTACTED: 'info',
  PENDING: 'info',
  APPROVED: 'success',
  REJECTED: 'error',
  CANCELLED: 'default',
  COMPLETED: 'default',
};

const NEGATIVE: EnquiryStatus[] = ['REJECTED', 'CANCELLED'];

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}
function fmtDateTime(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
function fmtMoney(v: number | string | null) {
  if (v === null || v === '') return '—';
  const n = typeof v === 'string' ? Number(v) : v;
  if (Number.isNaN(n)) return String(v);
  return `Rs ${n.toLocaleString()}`;
}

export default function AdminEnquiriesPage() {
  const { hasPermission } = useAdminAuth();
  const canUpdate = hasPermission('enquiries.update');
  const toast = useToast();

  const { data, loading, error, reload, params, setParam } =
    useAdminList<AdminEnquiry>(ENQUIRIES_PATH);

  const [searchInput, setSearchInput] = useState('');
  useEffect(() => {
    const t = setTimeout(
      () => setParam('search', searchInput.trim() || undefined),
      400,
    );
    return () => clearTimeout(t);
  }, [searchInput, setParam]);

  const [menu, setMenu] = useState<{ anchor: HTMLElement; row: AdminEnquiry } | null>(
    null,
  );
  const [detailId, setDetailId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function changeStatus(id: string, status: EnquiryStatus, note?: string) {
    setBusy(true);
    try {
      await enquiriesApi.setStatus(id, status, note);
      toast.success(`Enquiry moved to ${status}`);
      reload();
      return true;
    } catch (err) {
      toast.error(err instanceof AdminApiError ? err.messages[0] : 'Update failed');
      return false;
    } finally {
      setBusy(false);
      setMenu(null);
    }
  }

  const columns: Column<AdminEnquiry>[] = [
    {
      key: 'ref',
      header: 'Reference',
      width: 150,
      render: (r) => (
        <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
          <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
            {r.reference}
          </Typography>
          {r.hasConflict && (
            <Tooltip title="Another approved event/enquiry is on this date">
              <WarningAmberRoundedIcon fontSize="small" color="warning" />
            </Tooltip>
          )}
        </Stack>
      ),
    },
    {
      key: 'who',
      header: 'Enquirer',
      render: (r) => (
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {r.fullName}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {r.phone}
            {r.email ? ` · ${r.email}` : ''}
          </Typography>
        </Box>
      ),
    },
    {
      key: 'event',
      header: 'Event',
      render: (r) => (
        <Box>
          <Typography variant="body2">{r.eventType}</Typography>
          <Typography variant="caption" color="text.secondary">
            {r.guests} guests
          </Typography>
        </Box>
      ),
    },
    {
      key: 'date',
      header: 'Preferred date',
      width: 170,
      render: (r) => (
        <Box>
          <Typography variant="body2">{fmtDate(r.preferredDate)}</Typography>
          {r.alternativeDate && (
            <Typography variant="caption" color="text.secondary">
              alt: {fmtDate(r.alternativeDate)}
            </Typography>
          )}
        </Box>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      width: 110,
      render: (r) => (
        <Chip size="small" label={r.status} color={STATUS_COLOR[r.status]} />
      ),
    },
    {
      key: 'actions',
      header: '',
      width: 48,
      align: 'right',
      render: (r) => {
        if (!canUpdate || NEXT_STATUSES[r.status].length === 0) return null;
        return (
          <IconButton
            size="small"
            disabled={busy}
            onClick={(e) => {
              e.stopPropagation();
              setMenu({ anchor: e.currentTarget, row: r });
            }}
          >
            <MoreVertRoundedIcon fontSize="small" />
          </IconButton>
        );
      },
    },
  ];

  return (
    <Box>
      <PageHeader
        title="Event enquiries"
        subtitle="Private event and hall booking requests."
      />

      <FilterBar>
        <TextField
          select
          size="small"
          label="Status"
          value={(params.status as string) ?? ''}
          onChange={(e) => setParam('status', e.target.value || undefined)}
          sx={{ minWidth: 150 }}
        >
          <MenuItem value="">All</MenuItem>
          {ALL_STATUSES.map((s) => (
            <MenuItem key={s} value={s}>
              {s}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          type="date"
          size="small"
          label="From"
          slotProps={{ inputLabel: { shrink: true } }}
          value={(params.from as string) ?? ''}
          onChange={(e) => setParam('from', e.target.value || undefined)}
        />
        <TextField
          type="date"
          size="small"
          label="To"
          slotProps={{ inputLabel: { shrink: true } }}
          value={(params.to as string) ?? ''}
          onChange={(e) => setParam('to', e.target.value || undefined)}
        />
        <TextField
          size="small"
          label="Search name, phone, reference or event"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          sx={{ minWidth: 280, flexGrow: 1 }}
        />
</FilterBar>

      <QueryBoundary loading={loading && !data} error={error} onRetry={reload}>
        <DataTable
          columns={columns}
          rows={data?.items ?? []}
          getRowKey={(r) => r.id}
          loading={loading}
          emptyText="No enquiries match these filters."
          onRowClick={(r) => setDetailId(r.id)}
          pagination={{
            page: data?.page ?? 1,
            pageSize: data?.pageSize ?? 20,
            total: data?.total ?? 0,
            onPageChange: (p) => setParam('page', p),
            onPageSizeChange: (s) => setParam('pageSize', s),
          }}
        />
      </QueryBoundary>

      <Menu
        anchorEl={menu?.anchor ?? null}
        open={Boolean(menu)}
        onClose={() => setMenu(null)}
      >
        <MenuItem
          onClick={() => {
            setDetailId(menu!.row.id);
            setMenu(null);
          }}
        >
          View details
        </MenuItem>
        <Divider />
        {menu &&
          NEXT_STATUSES[menu.row.status].map((s) => (
            <MenuItem
              key={s}
              onClick={() => changeStatus(menu.row.id, s)}
              sx={NEGATIVE.includes(s) ? { color: 'error.main' } : undefined}
            >
              <ListItemIcon>
                <Chip size="small" label={s} color={STATUS_COLOR[s]} />
              </ListItemIcon>
            </MenuItem>
          ))}
      </Menu>

      <Dialog
        open={Boolean(detailId)}
        onClose={() => setDetailId(null)}
        maxWidth="sm"
        fullWidth
      >
        {detailId && (
          <EnquiryDetail
            id={detailId}
            canUpdate={canUpdate}
            busy={busy}
            onChangeStatus={changeStatus}
            onClose={() => setDetailId(null)}
          />
        )}
      </Dialog>
    </Box>
  );
}

function ConflictBlock({ label, conflict }: { label: string; conflict: DateConflict | null }) {
  if (conflictCount(conflict) === 0) return null;
  return (
    <Alert severity="warning" icon={<WarningAmberRoundedIcon />}>
      <Typography variant="body2" sx={{ fontWeight: 600 }}>
        {label} — {conflict!.date}
      </Typography>
      {conflict!.events.map((e) => (
        <Typography key={e.id} variant="caption" sx={{ display: 'block' }}>
          Event: {e.title}
        </Typography>
      ))}
      {conflict!.approvedEnquiries.map((e) => (
        <Typography key={e.id} variant="caption" sx={{ display: 'block' }}>
          Approved enquiry: {e.reference} ({e.eventType})
        </Typography>
      ))}
    </Alert>
  );
}

function EnquiryDetail({
  id,
  canUpdate,
  busy,
  onChangeStatus,
  onClose,
}: {
  id: string;
  canUpdate: boolean;
  busy: boolean;
  onChangeStatus: (
    id: string,
    status: EnquiryStatus,
    note?: string,
  ) => Promise<boolean>;
  onClose: () => void;
}) {
  const { data, error, reload } = useAdminQuery<AdminEnquiryDetail>(
    `${ENQUIRIES_PATH}/${id}`,
  );
  const [nextStatus, setNextStatus] = useState<EnquiryStatus | ''>('');
  const [note, setNote] = useState('');

  const options = data ? NEXT_STATUSES[data.status] : [];

  return (
    <>
      <DialogTitle>
        {data ? data.reference : 'Enquiry'}
        {data && (
          <Chip
            size="small"
            label={data.status}
            color={STATUS_COLOR[data.status]}
            sx={{ ml: 1 }}
          />
        )}
      </DialogTitle>
      <DialogContent dividers>
        {error && <Typography color="error">{error}</Typography>}
        {data && (
          <Stack spacing={2}>
            <ConflictBlock label="Conflict on preferred date" conflict={data.conflicts.preferred} />
            <ConflictBlock label="Conflict on alternative date" conflict={data.conflicts.alternative} />

            <Box>
              <Typography variant="subtitle2">{data.fullName}</Typography>
              <Typography variant="body2" color="text.secondary">
                {data.phone}
                {data.email ? ` · ${data.email}` : ''}
              </Typography>
            </Box>

            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr 1fr', sm: '1fr 1fr 1fr' },
                gap: 1.5,
              }}
            >
              <Field label="Event type">{data.eventType}</Field>
              <Field label="Guests">{data.guests}</Field>
              <Field label="Budget">{fmtMoney(data.budget)}</Field>
              <Field label="Preferred date">{fmtDate(data.preferredDate)}</Field>
              <Field label="Alternative date">
                {data.alternativeDate ? fmtDate(data.alternativeDate) : '—'}
              </Field>
              <Field label="Time">
                {data.startTime ? `${data.startTime}–${data.endTime ?? '?'}` : '—'}
              </Field>
            </Box>

            {data.requirements && (
              <Field label="Requirements">{data.requirements}</Field>
            )}

            <Divider />
            <Box>
              <Typography variant="overline" color="text.secondary">
                History
              </Typography>
              <Stack spacing={1} sx={{ mt: 0.5 }}>
                {data.history.map((h) => (
                  <Box key={h.id}>
                    <Typography variant="body2">
                      {h.fromStatus ? `${h.fromStatus} → ` : ''}
                      <strong>{h.toStatus}</strong>
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {fmtDateTime(h.createdAt)}
                      {h.note ? ` — ${h.note}` : ''}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            </Box>

            {canUpdate && options.length > 0 && (
              <>
                <Divider />
                <Stack spacing={1.5}>
                  <TextField
                    select
                    size="small"
                    label="Move to status"
                    value={nextStatus}
                    onChange={(e) =>
                      setNextStatus(e.target.value as EnquiryStatus)
                    }
                  >
                    {options.map((s) => (
                      <MenuItem key={s} value={s}>
                        {s}
                      </MenuItem>
                    ))}
                  </TextField>
                  <TextField
                    size="small"
                    label="Note (optional)"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    multiline
                    minRows={2}
                  />
                </Stack>
              </>
            )}
          </Stack>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={busy}>
          Close
        </Button>
        <Box sx={{ flexGrow: 1 }} />
        {data && canUpdate && options.length > 0 && (
          <Button
            variant="contained"
            disabled={busy || !nextStatus}
            color={nextStatus && NEGATIVE.includes(nextStatus) ? 'error' : 'primary'}
            onClick={async () => {
              if (!nextStatus) return;
              const ok = await onChangeStatus(
                data.id,
                nextStatus,
                note.trim() || undefined,
              );
              if (ok) {
                setNextStatus('');
                setNote('');
                reload();
              }
            }}
          >
            Update status
          </Button>
        )}
      </DialogActions>
    </>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <Box>
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
        {label}
      </Typography>
      <Typography variant="body2">{children}</Typography>
    </Box>
  );
}
