'use client';

import { useEffect, useState } from 'react';

import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  Divider,
  IconButton,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import PendingActionsRoundedIcon from '@mui/icons-material/PendingActionsRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import TodayRoundedIcon from '@mui/icons-material/TodayRounded';
import EventBusyRoundedIcon from '@mui/icons-material/EventBusyRounded';
import PhoneRoundedIcon from '@mui/icons-material/PhoneRounded';
import EmailRoundedIcon from '@mui/icons-material/EmailRounded';
import EventRoundedIcon from '@mui/icons-material/EventRounded';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded';
import FlagRoundedIcon from '@mui/icons-material/FlagRounded';

import {
  DetailField,
  DialogHeader,
  FilterBar,
  FormSection,
  HistoryTimeline,
  PageHeader,
  QueryBoundary,
  StatCard,
} from '@/components/admin/ui';
import { DataTable, type Column } from '@/components/admin/data-table';
import { useToast } from '@/components/admin/toast';
import { useAdminList } from '@/lib/admin/use-admin-list';
import { useAdminQuery } from '@/lib/admin/use-admin-query';
import { useAdminAuth } from '@/lib/admin/auth-context';
import { adminApi, AdminApiError } from '@/lib/admin/api';
import type { Paginated } from '@/lib/admin/types';
import {
  reservationsApi,
  RESERVATIONS_PATH,
  NEXT_ACTIONS,
  ACTION_LABEL,
  type AdminReservation,
  type AdminReservationDetail,
  type ReservationAction,
  type ReservationStatus,
} from '@/lib/admin/resources/reservations';

const STATUS_COLOR: Record<
  ReservationStatus,
  'default' | 'success' | 'error' | 'warning' | 'info'
> = {
  PENDING: 'warning',
  CONFIRMED: 'success',
  REJECTED: 'error',
  CANCELLED: 'default',
  COMPLETED: 'info',
};

function todayISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

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

export default function AdminReservationsPage() {
  const { hasPermission } = useAdminAuth();
  const canUpdate = hasPermission('reservations.update');
  const toast = useToast();

  const { data, loading, error, reload, params, setParam } =
    useAdminList<AdminReservation>(RESERVATIONS_PATH);

  const [searchInput, setSearchInput] = useState('');
  useEffect(() => {
    const t = setTimeout(
      () => setParam('search', searchInput.trim() || undefined),
      400,
    );
    return () => clearTimeout(t);
  }, [searchInput, setParam]);

  const [detailId, setDetailId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const [counts, setCounts] = useState<Record<string, number>>({});
  useEffect(() => {
    const today = todayISO();
    let cancelled = false;
    Promise.all([
      adminApi
        .get<Paginated<AdminReservation>>(`${RESERVATIONS_PATH}?status=PENDING&pageSize=1`)
        .then((res) => ['PENDING', res.total] as const)
        .catch(() => ['PENDING', 0] as const),
      adminApi
        .get<Paginated<AdminReservation>>(`${RESERVATIONS_PATH}?status=CONFIRMED&pageSize=1`)
        .then((res) => ['CONFIRMED', res.total] as const)
        .catch(() => ['CONFIRMED', 0] as const),
      adminApi
        .get<Paginated<AdminReservation>>(`${RESERVATIONS_PATH}?from=${today}&to=${today}&pageSize=1`)
        .then((res) => ['TODAY', res.total] as const)
        .catch(() => ['TODAY', 0] as const),
      adminApi
        .get<Paginated<AdminReservation>>(`${RESERVATIONS_PATH}?status=CANCELLED&pageSize=1`)
        .then((res) => ['CANCELLED', res.total] as const)
        .catch(() => ['CANCELLED', 0] as const),
    ]).then((entries) => {
      if (!cancelled) setCounts(Object.fromEntries(entries));
    });
    return () => {
      cancelled = true;
    };
  }, [data]);

  async function doTransition(
    id: string,
    action: ReservationAction,
    note?: string,
  ) {
    setBusy(true);
    try {
      await reservationsApi.transition(id, action, note);
      toast.success(`Reservation ${action === 'complete' ? 'completed' : `${action}ed`}`);
      reload();
      return true;
    } catch (err) {
      toast.error(
        err instanceof AdminApiError ? err.messages[0] : 'Action failed',
      );
      return false;
    } finally {
      setBusy(false);
    }
  }

  const columns: Column<AdminReservation>[] = [
    { key: 'guest', header: 'Full name', render: (r) => r.fullName },
    { key: 'date', header: 'Date', width: 150, render: (r) => fmtDate(r.date) },
    { key: 'time', header: 'Time', width: 100, render: (r) => r.time },
    { key: 'guests', header: 'Guests', width: 90, render: (r) => r.guests },
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
      render: (r) => (
        <IconButton
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            setDetailId(r.id);
          }}
        >
          <VisibilityRoundedIcon fontSize="small" />
        </IconButton>
      ),
    },
  ];

  return (
    <Box>
      <PageHeader
        title="Reservations"
        subtitle='Submissions from the "Request your table" form on the website.'
      />

      <Box
        sx={{
          display: 'grid',
          gap: 2,
          gridTemplateColumns: { xs: '1fr 1fr', sm: 'repeat(4, 1fr)' },
          mb: 3,
        }}
      >
        <StatCard label="Pending" value={counts.PENDING ?? '—'} color="warning" icon={PendingActionsRoundedIcon} />
        <StatCard label="Confirmed" value={counts.CONFIRMED ?? '—'} color="success" icon={CheckCircleRoundedIcon} />
        <StatCard label="Today" value={counts.TODAY ?? '—'} color="info" icon={TodayRoundedIcon} />
        <StatCard label="Cancelled" value={counts.CANCELLED ?? '—'} color="secondary" icon={EventBusyRoundedIcon} />
      </Box>

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
          {(
            [
              'PENDING',
              'CONFIRMED',
              'COMPLETED',
              'REJECTED',
              'CANCELLED',
            ] as ReservationStatus[]
          ).map((s) => (
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
          label="Search name, phone or reference"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          sx={{ minWidth: 260, flexGrow: 1 }}
        />
</FilterBar>

      <QueryBoundary loading={loading && !data} error={error} onRetry={reload}>
        <DataTable
          columns={columns}
          rows={data?.items ?? []}
          getRowKey={(r) => r.id}
          loading={loading}
          emptyText="No reservations match these filters."
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

      <Dialog
        open={Boolean(detailId)}
        onClose={() => setDetailId(null)}
        maxWidth="sm"
        fullWidth
      >
        {detailId && (
          <ReservationDetail
            id={detailId}
            canUpdate={canUpdate}
            busy={busy}
            onTransition={doTransition}
            onClose={() => setDetailId(null)}
          />
        )}
      </Dialog>
    </Box>
  );
}

function ReservationDetail({
  id,
  canUpdate,
  busy,
  onTransition,
  onClose,
}: {
  id: string;
  canUpdate: boolean;
  busy: boolean;
  onTransition: (
    id: string,
    action: ReservationAction,
    note?: string,
  ) => Promise<boolean>;
  onClose: () => void;
}) {
  const {
    data,
    error: loadError,
    reload,
  } = useAdminQuery<AdminReservationDetail>(`${RESERVATIONS_PATH}/${id}`);
  const [note, setNote] = useState('');

  return (
    <>
      <DialogHeader
        title={data ? data.fullName : 'Reservation'}
        subtitle={data?.reference}
        onClose={onClose}
      />
      <DialogContent dividers>
        {loadError && <Typography color="error">{loadError}</Typography>}
        {data && (
          <Stack spacing={2}>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr 1fr', sm: '1fr 1fr' },
                gap: 1.25,
              }}
            >
              <DetailField icon={PhoneRoundedIcon} label="Phone" value={data.phone} />
              <DetailField icon={EmailRoundedIcon} label="Email" value={data.email ?? '—'} />
              <DetailField icon={EventRoundedIcon} label="Date" value={fmtDate(data.date)} />
              <DetailField icon={AccessTimeRoundedIcon} label="Time" value={data.time} />
              <DetailField icon={GroupsRoundedIcon} label="Guests" value={data.guests} />
              <DetailField
                icon={FlagRoundedIcon}
                label="Status"
                value={<Chip size="small" label={data.status} color={STATUS_COLOR[data.status]} />}
              />
              {data.note && (
                <DetailField label="Guest note" value={data.note} span />
              )}
            </Box>

            <Divider />
            <FormSection title="History">
              <HistoryTimeline
                entries={data.history}
                statusColor={(s) => STATUS_COLOR[s as ReservationStatus]}
                formatWhen={fmtDateTime}
              />
            </FormSection>

            {canUpdate && NEXT_ACTIONS[data.status].length > 0 && (
              <>
                <Divider />
                <TextField
                  label="Note (optional, saved with the status change)"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  size="small"
                  fullWidth
                  multiline
                  minRows={2}
                />
              </>
            )}
          </Stack>
        )}
      </DialogContent>
      <DialogActions sx={{ flexWrap: 'wrap', gap: 1 }}>
        <Button onClick={onClose} disabled={busy}>
          Close
        </Button>
        <Box sx={{ flexGrow: 1 }} />
        {data &&
          canUpdate &&
          NEXT_ACTIONS[data.status].map((action) => (
            <Button
              key={action}
              disabled={busy}
              variant={action === 'confirm' || action === 'complete' ? 'contained' : 'outlined'}
              color={action === 'reject' || action === 'cancel' ? 'error' : 'primary'}
              onClick={async () => {
                const ok = await onTransition(data.id, action, note.trim() || undefined);
                if (ok) {
                  setNote('');
                  reload();
                }
              }}
            >
              {ACTION_LABEL[action]}
            </Button>
          ))}
      </DialogActions>
    </>
  );
}
