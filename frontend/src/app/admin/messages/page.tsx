'use client';

import { useEffect, useState } from 'react';

import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  IconButton,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import MarkEmailReadRoundedIcon from '@mui/icons-material/MarkEmailReadRounded';
import MarkEmailUnreadRoundedIcon from '@mui/icons-material/MarkEmailUnreadRounded';
import ForumRoundedIcon from '@mui/icons-material/ForumRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import PhoneRoundedIcon from '@mui/icons-material/PhoneRounded';
import EmailRoundedIcon from '@mui/icons-material/EmailRounded';
import SubjectRoundedIcon from '@mui/icons-material/SubjectRounded';
import EventRoundedIcon from '@mui/icons-material/EventRounded';

import {
  ConfirmDialog,
  DetailField,
  DialogHeader,
  FilterBar,
  PageHeader,
  QueryBoundary,
  StatCard,
} from '@/components/admin/ui';
import { DataTable, type Column } from '@/components/admin/data-table';
import { useToast } from '@/components/admin/toast';
import { useAdminList } from '@/lib/admin/use-admin-list';
import { useAdminAuth } from '@/lib/admin/auth-context';
import { adminApi, AdminApiError } from '@/lib/admin/api';
import type { Paginated } from '@/lib/admin/types';
import {
  messagesApi,
  MESSAGES_PATH,
  type AdminContactMessage,
} from '@/lib/admin/resources/messages';

function fmtDateTime(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function AdminMessagesPage() {
  const { hasPermission } = useAdminAuth();
  const canManage = hasPermission('messages.manage');
  const toast = useToast();

  const { data, loading, error, reload, params, setParam } =
    useAdminList<AdminContactMessage>(MESSAGES_PATH);

  const [searchInput, setSearchInput] = useState('');
  useEffect(() => {
    const t = setTimeout(
      () => setParam('search', searchInput.trim() || undefined),
      400,
    );
    return () => clearTimeout(t);
  }, [searchInput, setParam]);

  const [counts, setCounts] = useState<{ unread: number; total: number }>({
    unread: 0,
    total: 0,
  });
  useEffect(() => {
    let cancelled = false;
    Promise.all([
      adminApi
        .get<Paginated<AdminContactMessage>>(`${MESSAGES_PATH}?isRead=false&pageSize=1`)
        .then((res) => res.total)
        .catch(() => 0),
      adminApi
        .get<Paginated<AdminContactMessage>>(`${MESSAGES_PATH}?pageSize=1`)
        .then((res) => res.total)
        .catch(() => 0),
    ]).then(([unread, total]) => {
      if (!cancelled) setCounts({ unread, total });
    });
    return () => {
      cancelled = true;
    };
  }, [data]);

  const [detailId, setDetailId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<AdminContactMessage | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function run(id: string, fn: () => Promise<unknown>, ok: string) {
    setBusyId(id);
    try {
      await fn();
      toast.success(ok);
      reload();
    } catch (err) {
      toast.error(err instanceof AdminApiError ? err.messages[0] : 'Action failed');
    } finally {
      setBusyId(null);
      setConfirmDelete(null);
    }
  }

  const columns: Column<AdminContactMessage>[] = [
    {
      key: 'from',
      header: 'From',
      render: (r) => (
        <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center' }}>
          {!r.isRead && (
            <Box
              aria-label="Unread"
              sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'warning.main', flexShrink: 0 }}
            />
          )}
          <Box>
            <Typography variant="body2" sx={{ fontWeight: r.isRead ? 400 : 700 }}>
              {r.fullName}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {r.email}
            </Typography>
          </Box>
        </Stack>
      ),
    },
    {
      key: 'subject',
      header: 'Subject',
      render: (r) => r.subject || <em>No subject</em>,
    },
    {
      key: 'received',
      header: 'Received',
      width: 170,
      render: (r) => fmtDateTime(r.createdAt),
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
        title="Messages"
        subtitle='Submissions from the "Get in touch" form on the website.'
      />

      <Box
        sx={{
          display: 'grid',
          gap: 2,
          gridTemplateColumns: { xs: '1fr 1fr' },
          mb: 3,
          maxWidth: 480,
        }}
      >
        <StatCard label="Unread" value={counts.unread} color="warning" icon={MarkEmailUnreadRoundedIcon} />
        <StatCard label="Total" value={counts.total} color="primary" icon={ForumRoundedIcon} />
      </Box>

      <FilterBar>
        <TextField
          select
          size="small"
          label="Status"
          value={(params.isRead as string) ?? ''}
          onChange={(e) => setParam('isRead', e.target.value || undefined)}
          sx={{ minWidth: 140 }}
        >
          <MenuItem value="">All</MenuItem>
          <MenuItem value="false">Unread</MenuItem>
          <MenuItem value="true">Read</MenuItem>
        </TextField>
        <TextField
          size="small"
          label="Search name, email or message"
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
          emptyText="No messages match these filters."
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

      <Dialog open={Boolean(detailId)} onClose={() => setDetailId(null)} maxWidth="sm" fullWidth>
        {detailId && (() => {
          const row = (data?.items ?? []).find((m) => m.id === detailId) ?? null;
          if (!row) return null;
          return (
            <>
              <DialogHeader
                icon={ForumRoundedIcon}
                title={row.fullName}
                subtitle={row.subject ?? undefined}
                onClose={() => setDetailId(null)}
              />
              <DialogContent dividers>
                <Stack spacing={2}>
                  <Box
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                      gap: 1.25,
                    }}
                  >
                    <DetailField icon={EmailRoundedIcon} label="Email" value={row.email} />
                    <DetailField icon={PhoneRoundedIcon} label="Phone" value={row.phone ?? '—'} />
                    <DetailField icon={EventRoundedIcon} label="Received" value={fmtDateTime(row.createdAt)} />
                    <DetailField
                      icon={row.isRead ? MarkEmailReadRoundedIcon : MarkEmailUnreadRoundedIcon}
                      label="Status"
                      value={
                        <Chip
                          size="small"
                          label={row.isRead ? 'Read' : 'Unread'}
                          color={row.isRead ? 'default' : 'warning'}
                        />
                      }
                    />
                    <DetailField icon={SubjectRoundedIcon} label="Message" value={row.message} span />
                  </Box>
                </Stack>
              </DialogContent>
              <DialogActions sx={{ flexWrap: 'wrap', gap: 1 }}>
                <Button onClick={() => setDetailId(null)} disabled={busyId === row.id}>
                  Close
                </Button>
                <Box sx={{ flexGrow: 1 }} />
                {canManage && (
                  <>
                    <Button
                      color="error"
                      startIcon={<DeleteOutlineRoundedIcon />}
                      disabled={busyId === row.id}
                      onClick={() => setConfirmDelete(row)}
                    >
                      Delete
                    </Button>
                    {row.isRead ? (
                      <Button
                        variant="outlined"
                        startIcon={<MarkEmailUnreadRoundedIcon />}
                        disabled={busyId === row.id}
                        onClick={() =>
                          run(row.id, () => messagesApi.markUnread(row.id), 'Marked unread')
                        }
                      >
                        Mark unread
                      </Button>
                    ) : (
                      <Button
                        variant="contained"
                        startIcon={<MarkEmailReadRoundedIcon />}
                        disabled={busyId === row.id}
                        onClick={() =>
                          run(row.id, () => messagesApi.markRead(row.id), 'Marked read')
                        }
                      >
                        Mark read
                      </Button>
                    )}
                  </>
                )}
              </DialogActions>
            </>
          );
        })()}
      </Dialog>

      <ConfirmDialog
        open={Boolean(confirmDelete)}
        title="Delete this message?"
        body={confirmDelete ? `The message from "${confirmDelete.fullName}" will be removed.` : ''}
        confirmLabel="Delete"
        destructive
        busy={busyId === confirmDelete?.id}
        onCancel={() => setConfirmDelete(null)}
        onConfirm={() => {
          run(confirmDelete!.id, () => messagesApi.remove(confirmDelete!.id), 'Message deleted');
          setDetailId(null);
        }}
      />
    </Box>
  );
}
