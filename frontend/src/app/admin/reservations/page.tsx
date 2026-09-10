'use client';

import { useEffect, useState } from 'react';

import {
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
  Typography,
} from '@mui/material';
import MoreVertRoundedIcon from '@mui/icons-material/MoreVertRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import CancelRoundedIcon from '@mui/icons-material/CancelRounded';
import DoneAllRoundedIcon from '@mui/icons-material/DoneAllRounded';
import BlockRoundedIcon from '@mui/icons-material/BlockRounded';

import { PageHeader, QueryBoundary } from '@/components/admin/ui';
import { DataTable, type Column } from '@/components/admin/data-table';
import { useToast } from '@/components/admin/toast';
import { useAdminList } from '@/lib/admin/use-admin-list';
import { useAdminQuery } from '@/lib/admin/use-admin-query';
import { useAdminAuth } from '@/lib/admin/auth-context';
import { AdminApiError } from '@/lib/admin/api';
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

const ACTION_ICON: Record<ReservationAction, React.ReactNode> = {
  confirm: <CheckCircleRoundedIcon fontSize="small" />,
  reject: <BlockRoundedIcon fontSize="small" />,
  cancel: <CancelRoundedIcon fontSize="small" />,
  complete: <DoneAllRoundedIcon fontSize="small" />,
};

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

  const [menu, setMenu] = useState<{
    anchor: HTMLElement;
    row: AdminReservation;
  } | null>(null);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

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
      setMenu(null);
    }
  }

  const columns: Column<AdminReservation>[] = [
    {
      key: 'ref',
      header: 'Reference',
      width: 150,
      render: (r) => (
        <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
          {r.reference}
        </Typography>
      ),
    },
    {
      key: 'guest',
      header: 'Guest',
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
      key: 'when',
      header: 'Date / time',
      width: 200,
      render: (r) => (
        <Box>
          <Typography variant="body2">{fmtDate(r.date)}</Typography>
          <Typography variant="caption" color="text.secondary">
            {r.time}
          </Typography>
        </Box>
      ),
    },
    {
      key: 'guests',
      header: 'Guests',
      width: 70,
      align: 'right',
      render: (r) => r.guests,
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
      key: 'source',
      header: 'Source',
      width: 90,
      render: (r) => (
        <Typography variant="caption" color="text.secondary">
          {r.source}
        </Typography>
      ),
    },
    {
      key: 'actions',
      header: '',
      width: 48,
      align: 'right',
      render: (r) => {
        const actions = NEXT_ACTIONS[r.status];
        if (!canUpdate || actions.length === 0) return null;
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
        title="Reservations"
        subtitle="Table booking requests from the website."
      />

      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={1.5}
        sx={{ mb: 2, flexWrap: 'wrap' }}
      >
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
      </Stack>

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
          NEXT_ACTIONS[menu.row.status].map((action) => (
            <MenuItem
              key={action}
              onClick={() => doTransition(menu.row.id, action)}
              sx={action === 'reject' || action === 'cancel' ? { color: 'error.main' } : undefined}
            >
              <ListItemIcon>{ACTION_ICON[action]}</ListItemIcon>
              {ACTION_LABEL[action]}
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
      <DialogTitle>
        {data ? data.reference : 'Reservation'}
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
        {loadError && <Typography color="error">{loadError}</Typography>}
        {data && (
          <Stack spacing={2}>
            <Box>
              <Typography variant="subtitle2">{data.fullName}</Typography>
              <Typography variant="body2" color="text.secondary">
                {data.phone}
                {data.email ? ` · ${data.email}` : ''}
              </Typography>
            </Box>
            <Stack direction="row" spacing={3}>
              <Field label="Date">{fmtDate(data.date)}</Field>
              <Field label="Time">{data.time}</Field>
              <Field label="Guests">{data.guests}</Field>
            </Stack>
            {data.note && <Field label="Guest note">{data.note}</Field>}

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

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <Box>
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
        {label}
      </Typography>
      <Typography variant="body2">{children}</Typography>
    </Box>
  );
}
