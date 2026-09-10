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
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import UploadRoundedIcon from '@mui/icons-material/UploadRounded';

import { PageHeader, QueryBoundary, ConfirmDialog } from '@/components/admin/ui';
import { DataTable, type Column } from '@/components/admin/data-table';
import { useToast } from '@/components/admin/toast';
import { useAdminList } from '@/lib/admin/use-admin-list';
import { useAdminQuery } from '@/lib/admin/use-admin-query';
import { useAdminAuth } from '@/lib/admin/auth-context';
import { AdminApiError } from '@/lib/admin/api';
import {
  eventsApi,
  EVENTS_PATH,
  LIFECYCLES,
  toMediaInput,
  type AdminEvent,
  type EventLifecycle,
  type EventMediaInput,
} from '@/lib/admin/resources/events';
import { uploadMedia, ACCEPTED_IMAGE_TYPES } from '@/lib/admin/resources/media';

const LC_COLOR: Record<EventLifecycle, 'default' | 'success' | 'error' | 'info'> = {
  UPCOMING: 'info',
  COMPLETED: 'success',
  CANCELLED: 'error',
};

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export default function AdminEventsPage() {
  const { hasPermission } = useAdminAuth();
  const canManage = hasPermission('events.manage');
  const canPublish = hasPermission('events.publish');
  const toast = useToast();

  const { data, loading, error, reload, params, setParam } =
    useAdminList<AdminEvent>(EVENTS_PATH, { pageSize: 20 });
  const [searchInput, setSearchInput] = useState('');
  useEffect(() => {
    const t = setTimeout(
      () => setParam('search', searchInput.trim() || undefined),
      400,
    );
    return () => clearTimeout(t);
  }, [searchInput, setParam]);

  const [menu, setMenu] = useState<{ anchor: HTMLElement; row: AdminEvent } | null>(null);
  const [dialog, setDialog] = useState<string | 'new' | null>(null);
  const [confirmDel, setConfirmDel] = useState<AdminEvent | null>(null);
  const [busy, setBusy] = useState(false);

  async function act(fn: () => Promise<unknown>, ok: string) {
    setBusy(true);
    try {
      await fn();
      toast.success(ok);
      reload();
    } catch (err) {
      toast.error(err instanceof AdminApiError ? err.messages[0] : 'Action failed');
    } finally {
      setBusy(false);
      setMenu(null);
      setConfirmDel(null);
    }
  }

  const columns: Column<AdminEvent>[] = [
    {
      key: 'title',
      header: 'Event',
      render: (r) => (
        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
          {r.coverMedia && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={r.coverMedia.url}
              alt=""
              style={{ width: 56, height: 42, objectFit: 'cover', borderRadius: 4 }}
            />
          )}
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {r.title}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {r.category}
            </Typography>
          </Box>
        </Stack>
      ),
    },
    { key: 'date', header: 'Date', width: 130, render: (r) => fmtDate(r.eventDate) },
    {
      key: 'lifecycle',
      header: 'Lifecycle',
      width: 120,
      render: (r) => <Chip size="small" label={r.lifecycle} color={LC_COLOR[r.lifecycle]} />,
    },
    {
      key: 'status',
      header: 'Status',
      width: 100,
      render: (r) => (
        <Chip
          size="small"
          label={r.status}
          color={r.status === 'PUBLISHED' ? 'success' : 'default'}
        />
      ),
    },
    { key: 'media', header: 'Photos', width: 70, align: 'right', render: (r) => r.media.length },
    {
      key: 'actions',
      header: '',
      width: 48,
      align: 'right',
      render: (r) =>
        canManage || canPublish ? (
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
        ) : null,
    },
  ];

  return (
    <Box>
      <PageHeader
        title="Events"
        subtitle="Past celebrations and events shown on the public Events page."
        action={
          canManage && (
            <Button
              variant="contained"
              startIcon={<AddRoundedIcon />}
              onClick={() => setDialog('new')}
            >
              Add event
            </Button>
          )
        }
      />

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mb: 2 }}>
        <TextField
          select
          size="small"
          label="Status"
          value={(params.status as string) ?? ''}
          onChange={(e) => setParam('status', e.target.value || undefined)}
          sx={{ minWidth: 140 }}
        >
          <MenuItem value="">All</MenuItem>
          <MenuItem value="PUBLISHED">Published</MenuItem>
          <MenuItem value="DRAFT">Draft</MenuItem>
        </TextField>
        <TextField
          select
          size="small"
          label="Lifecycle"
          value={(params.lifecycle as string) ?? ''}
          onChange={(e) => setParam('lifecycle', e.target.value || undefined)}
          sx={{ minWidth: 140 }}
        >
          <MenuItem value="">All</MenuItem>
          {LIFECYCLES.map((l) => (
            <MenuItem key={l} value={l}>{l}</MenuItem>
          ))}
        </TextField>
        <TextField
          size="small"
          label="Search title"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          sx={{ flexGrow: 1 }}
        />
      </Stack>

      <QueryBoundary loading={loading && !data} error={error} onRetry={reload}>
        <DataTable
          columns={columns}
          rows={data?.items ?? []}
          getRowKey={(r) => r.id}
          loading={loading}
          emptyText="No events match these filters."
          onRowClick={(r) => canManage && setDialog(r.id)}
          pagination={{
            page: data?.page ?? 1,
            pageSize: data?.pageSize ?? 20,
            total: data?.total ?? 0,
            onPageChange: (p) => setParam('page', p),
            onPageSizeChange: (s) => setParam('pageSize', s),
          }}
        />
      </QueryBoundary>

      <Menu anchorEl={menu?.anchor ?? null} open={Boolean(menu)} onClose={() => setMenu(null)}>
        {canManage && (
          <MenuItem onClick={() => { setDialog(menu!.row.id); setMenu(null); }}>Edit</MenuItem>
        )}
        {canPublish && (
          <MenuItem
            onClick={() =>
              act(
                () => eventsApi.setPublished(menu!.row.id, menu!.row.status !== 'PUBLISHED'),
                'Event updated',
              )
            }
          >
            {menu?.row.status === 'PUBLISHED' ? 'Unpublish' : 'Publish'}
          </MenuItem>
        )}
        {canPublish && <Divider />}
        {canPublish &&
          LIFECYCLES.filter((l) => l !== menu?.row.lifecycle).map((l) => (
            <MenuItem
              key={l}
              onClick={() => act(() => eventsApi.setLifecycle(menu!.row.id, l), `Marked ${l}`)}
            >
              <ListItemIcon>
                <Chip size="small" label={l} color={LC_COLOR[l]} />
              </ListItemIcon>
            </MenuItem>
          ))}
        {canManage && <Divider />}
        {canManage && (
          <MenuItem
            onClick={() => { setConfirmDel(menu!.row); setMenu(null); }}
            sx={{ color: 'error.main' }}
          >
            <ListItemIcon>
              <DeleteOutlineRoundedIcon fontSize="small" color="error" />
            </ListItemIcon>
            Delete
          </MenuItem>
        )}
      </Menu>

      {dialog && (
        <EventDialog
          eventId={dialog === 'new' ? null : dialog}
          onClose={() => setDialog(null)}
          onSaved={() => { setDialog(null); reload(); }}
        />
      )}

      <ConfirmDialog
        open={Boolean(confirmDel)}
        title="Delete event?"
        body={confirmDel ? `"${confirmDel.title}" will be removed from the site.` : ''}
        confirmLabel="Delete"
        destructive
        busy={busy}
        onCancel={() => setConfirmDel(null)}
        onConfirm={() => act(() => eventsApi.remove(confirmDel!.id), 'Event deleted')}
      />
    </Box>
  );
}

type MediaDraft = EventMediaInput & { url: string };

function EventDialog({
  eventId,
  onClose,
  onSaved,
}: {
  eventId: string | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const toast = useToast();
  const existing = useAdminQuery<AdminEvent>(
    eventId ? `${EVENTS_PATH}/${eventId}` : '',
  );
  const loaded = !eventId || Boolean(existing.data);

  const [form, setForm] = useState({
    title: '',
    category: '',
    summary: '',
    description: '',
    eventDate: '',
    startTime: '',
    endTime: '',
    guestsLabel: '',
    lifecycle: 'COMPLETED' as EventLifecycle,
  });
  const [coverMediaId, setCoverMediaId] = useState<string | null>(null);
  const [coverUrl, setCoverUrl] = useState('');
  const [gallery, setGallery] = useState<MediaDraft[]>([]);
  const [hydrated, setHydrated] = useState(!eventId);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  // Populate from the fetched event exactly once.
  if (eventId && existing.data && !hydrated) {
    const e = existing.data;
    setForm({
      title: e.title,
      category: e.category,
      summary: e.summary,
      description: e.description ?? '',
      eventDate: e.eventDate.slice(0, 10),
      startTime: e.startTime ?? '',
      endTime: e.endTime ?? '',
      guestsLabel: e.guestsLabel ?? '',
      lifecycle: e.lifecycle,
    });
    setCoverMediaId(e.coverMediaId);
    setCoverUrl(e.coverMedia?.url ?? '');
    setGallery(
      toMediaInput(e.media).map((m, i) => ({
        ...m,
        url: e.media[i].media.url,
      })),
    );
    setHydrated(true);
  }

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function uploadCover(file: File | undefined) {
    if (!file) return;
    setUploading(true);
    try {
      const m = await uploadMedia(file, { folder: 'events', altText: form.title });
      setCoverMediaId(m.id);
      setCoverUrl(m.url);
    } catch (err) {
      toast.error(err instanceof AdminApiError ? err.messages[0] : 'Upload failed');
    } finally {
      setUploading(false);
    }
  }

  async function addGalleryImage(file: File | undefined) {
    if (!file) return;
    setUploading(true);
    try {
      const m = await uploadMedia(file, { folder: 'events', altText: form.title });
      setGallery((g) => [
        ...g,
        { mediaId: m.id, type: 'IMAGE', altText: form.title || 'Event photo', url: m.url },
      ]);
    } catch (err) {
      toast.error(err instanceof AdminApiError ? err.messages[0] : 'Upload failed');
    } finally {
      setUploading(false);
    }
  }

  async function save() {
    setSaving(true);
    setErrors([]);
    try {
      const body = {
        title: form.title.trim(),
        category: form.category.trim(),
        summary: form.summary.trim(),
        description: form.description.trim() || undefined,
        eventDate: form.eventDate,
        startTime: form.startTime || null,
        endTime: form.endTime || null,
        guestsLabel: form.guestsLabel.trim() || null,
        coverMediaId,
        lifecycle: form.lifecycle,
        media: gallery.map((m, i) => ({
          ...(m.id ? { id: m.id } : {}),
          mediaId: m.mediaId,
          type: m.type,
          altText: m.altText.trim() || 'Event photo',
          sortOrder: i,
        })),
      };
      if (eventId) await eventsApi.update(eventId, body);
      else await eventsApi.create(body);
      toast.success('Event saved');
      onSaved();
    } catch (err) {
      if (err instanceof AdminApiError) setErrors(err.messages);
      else toast.error('Could not save');
    } finally {
      setSaving(false);
    }
  }

  const canSave =
    form.title.trim().length >= 2 &&
    form.category.trim().length >= 2 &&
    form.summary.trim().length >= 2 &&
    form.eventDate.length === 10;

  return (
    <Dialog open onClose={saving || uploading ? undefined : onClose} maxWidth="md" fullWidth>
      <DialogTitle>{eventId ? 'Edit event' : 'New event'}</DialogTitle>
      <DialogContent dividers>
        {!loaded ? (
          <Typography color="text.secondary">Loading…</Typography>
        ) : (
          <Stack spacing={2}>
            {errors.map((m, i) => (
              <Typography key={i} variant="caption" color="error">{m}</Typography>
            ))}

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField label="Title" value={form.title} onChange={(e) => set('title', e.target.value)} size="small" fullWidth />
              <TextField label="Category" value={form.category} onChange={(e) => set('category', e.target.value)} size="small" fullWidth placeholder="Celebration" />
            </Stack>
            <TextField label="Summary" value={form.summary} onChange={(e) => set('summary', e.target.value)} size="small" fullWidth multiline minRows={2} />
            <TextField label="Description (optional)" value={form.description} onChange={(e) => set('description', e.target.value)} size="small" fullWidth multiline minRows={3} />

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                type="date"
                label="Event date"
                value={form.eventDate}
                onChange={(e) => set('eventDate', e.target.value)}
                size="small"
                slotProps={{ inputLabel: { shrink: true } }}
              />
              <TextField type="time" label="Start" value={form.startTime} onChange={(e) => set('startTime', e.target.value)} size="small" slotProps={{ inputLabel: { shrink: true } }} />
              <TextField type="time" label="End" value={form.endTime} onChange={(e) => set('endTime', e.target.value)} size="small" slotProps={{ inputLabel: { shrink: true } }} />
            </Stack>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField label="Guests label" value={form.guestsLabel} onChange={(e) => set('guestsLabel', e.target.value)} size="small" fullWidth placeholder="Family & friends" />
              <TextField
                select
                label="Lifecycle"
                value={form.lifecycle}
                onChange={(e) => set('lifecycle', e.target.value as EventLifecycle)}
                size="small"
                fullWidth
              >
                {LIFECYCLES.map((l) => (
                  <MenuItem key={l} value={l}>{l}</MenuItem>
                ))}
              </TextField>
            </Stack>

            <Divider textAlign="left">
              <Typography variant="caption">Cover image</Typography>
            </Divider>
            <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
              {coverUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={coverUrl} alt="cover" style={{ width: 120, height: 80, objectFit: 'cover', borderRadius: 4 }} />
              ) : (
                <Box sx={{ width: 120, height: 80, bgcolor: 'action.hover', borderRadius: 1 }} />
              )}
              <Button component="label" size="small" startIcon={<UploadRoundedIcon />} disabled={uploading}>
                {coverUrl ? 'Replace cover' : 'Upload cover'}
                <input type="file" hidden accept={ACCEPTED_IMAGE_TYPES} onChange={(e) => uploadCover(e.target.files?.[0])} />
              </Button>
            </Stack>

            <Divider textAlign="left">
              <Typography variant="caption">Photo gallery ({gallery.length})</Typography>
            </Divider>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 1 }}>
              {gallery.map((m, i) => (
                <Box key={i} sx={{ position: 'relative' }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={m.url} alt={m.altText} style={{ width: '100%', aspectRatio: '4/3', objectFit: 'cover', borderRadius: 4 }} />
                  <IconButton
                    size="small"
                    onClick={() => setGallery(gallery.filter((_, j) => j !== i))}
                    sx={{ position: 'absolute', top: 2, right: 2, bgcolor: 'background.paper' }}
                  >
                    <DeleteOutlineRoundedIcon fontSize="small" />
                  </IconButton>
                </Box>
              ))}
              <Button
                component="label"
                variant="outlined"
                disabled={uploading}
                sx={{ aspectRatio: '4/3', flexDirection: 'column' }}
              >
                <AddRoundedIcon />
                <Typography variant="caption">{uploading ? 'Uploading…' : 'Add photo'}</Typography>
                <input type="file" hidden accept={ACCEPTED_IMAGE_TYPES} onChange={(e) => addGalleryImage(e.target.files?.[0])} />
              </Button>
            </Box>
          </Stack>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={saving || uploading}>Cancel</Button>
        <Button variant="contained" onClick={save} disabled={!loaded || saving || uploading || !canSave}>
          {saving ? 'Saving…' : 'Save event'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
