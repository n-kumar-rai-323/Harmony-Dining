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
  Divider,
  IconButton,
  MenuItem,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import type { SvgIconComponent } from '@mui/icons-material';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import NotificationsActiveRoundedIcon from '@mui/icons-material/NotificationsActiveRounded';
import ForumRoundedIcon from '@mui/icons-material/ForumRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import EventBusyRoundedIcon from '@mui/icons-material/EventBusyRounded';
import PhoneRoundedIcon from '@mui/icons-material/PhoneRounded';
import EmailRoundedIcon from '@mui/icons-material/EmailRounded';
import CelebrationRoundedIcon from '@mui/icons-material/CelebrationRounded';
import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded';
import EventRoundedIcon from '@mui/icons-material/EventRounded';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import EventRepeatRoundedIcon from '@mui/icons-material/EventRepeatRounded';
import PaymentsRoundedIcon from '@mui/icons-material/PaymentsRounded';
import ChatBubbleOutlineRoundedIcon from '@mui/icons-material/ChatBubbleOutlineRounded';

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

const SUMMARY_TILES: {
  key: 'NEW' | 'CONTACTED' | 'APPROVED' | 'CANCELLED';
  label: string;
  color: 'warning' | 'info' | 'success' | 'secondary';
  icon: SvgIconComponent;
}[] = [
  { key: 'NEW', label: 'New', color: 'warning', icon: NotificationsActiveRoundedIcon },
  { key: 'CONTACTED', label: 'Contacted', color: 'info', icon: ForumRoundedIcon },
  { key: 'APPROVED', label: 'Confirmed', color: 'success', icon: CheckCircleRoundedIcon },
  { key: 'CANCELLED', label: 'Cancelled', color: 'secondary', icon: EventBusyRoundedIcon },
];

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

  const [counts, setCounts] = useState<Record<string, number>>({});
  useEffect(() => {
    let cancelled = false;
    Promise.all(
      SUMMARY_TILES.map((t) =>
        adminApi
          .get<Paginated<AdminEnquiry>>(`${ENQUIRIES_PATH}?status=${t.key}&pageSize=1`)
          .then((res) => [t.key, res.total] as const)
          .catch(() => [t.key, 0] as const),
      ),
    ).then((entries) => {
      if (!cancelled) setCounts(Object.fromEntries(entries));
    });
    return () => {
      cancelled = true;
    };
  }, [data]);

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
    }
  }

  const columns: Column<AdminEnquiry>[] = [
    {
      key: 'who',
      header: 'Full name',
      render: (r) => (
        <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {r.fullName}
          </Typography>
          {r.hasConflict && (
            <Tooltip title="Another approved event/enquiry is on this date">
              <WarningAmberRoundedIcon fontSize="small" color="warning" />
            </Tooltip>
          )}
        </Stack>
      ),
    },
    { key: 'event', header: 'Event type', render: (r) => r.eventType },
    {
      key: 'date',
      header: 'Preferred date',
      width: 150,
      render: (r) => fmtDate(r.preferredDate),
    },
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
        title="Event enquiries"
        subtitle='Submissions from the "Tell us about your celebration" form on the website.'
      />

      <Box
        sx={{
          display: 'grid',
          gap: 2,
          gridTemplateColumns: { xs: '1fr 1fr', sm: 'repeat(4, 1fr)' },
          mb: 3,
        }}
      >
        {SUMMARY_TILES.map((t) => (
          <StatCard key={t.key} label={t.label} value={counts[t.key] ?? '—'} color={t.color} icon={t.icon} />
        ))}
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
      <DialogHeader
        title={data ? data.fullName : 'Enquiry'}
        subtitle={data?.reference}
        onClose={onClose}
      />
      <DialogContent dividers>
        {error && <Typography color="error">{error}</Typography>}
        {data && (
          <Stack spacing={2}>
            <ConflictBlock label="Conflict on preferred date" conflict={data.conflicts.preferred} />
            <ConflictBlock label="Conflict on alternative date" conflict={data.conflicts.alternative} />

            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr 1fr', sm: '1fr 1fr' },
                gap: 1.25,
              }}
            >
              <DetailField icon={PhoneRoundedIcon} label="Phone" value={data.phone} />
              <DetailField icon={EmailRoundedIcon} label="Email" value={data.email ?? '—'} />
              <DetailField icon={CelebrationRoundedIcon} label="Event type" value={data.eventType} />
              <DetailField icon={GroupsRoundedIcon} label="Estimated guests" value={data.guests} />
              <DetailField
                icon={EventRoundedIcon}
                label="Preferred date"
                value={fmtDate(data.preferredDate)}
              />
              <DetailField
                icon={AccessTimeRoundedIcon}
                label="Preferred time"
                value={data.startTime ? `${data.startTime}–${data.endTime ?? '?'}` : '—'}
              />
              <DetailField
                icon={EventRepeatRoundedIcon}
                label="Alternative date"
                value={data.alternativeDate ? fmtDate(data.alternativeDate) : '—'}
              />
              <DetailField icon={PaymentsRoundedIcon} label="Budget" value={fmtMoney(data.budget)} />
              <DetailField
                icon={ChatBubbleOutlineRoundedIcon}
                label="Message"
                value={data.requirements || '—'}
                span
              />
            </Box>

            <Divider />
            <FormSection title="History">
              <HistoryTimeline
                entries={data.history}
                statusColor={(s) => STATUS_COLOR[s as EnquiryStatus]}
                formatWhen={fmtDateTime}
              />
            </FormSection>

            {canUpdate && options.length > 0 && (
              <>
                <Divider />
                <FormSection title="Update status">
                  <TextField
                    select
                    size="small"
                    label="Status"
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
                  />
                </FormSection>
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
            Save status
          </Button>
        )}
      </DialogActions>
    </>
  );
}
