'use client';

import { useEffect, useState } from 'react';

import {
  Autocomplete,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  Divider,
  IconButton,
  ListItemIcon,
  Menu,
  MenuItem,
  Paper,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import MoreVertRoundedIcon from '@mui/icons-material/MoreVertRounded';
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded';
import PeopleAltRoundedIcon from '@mui/icons-material/PeopleAltRounded';
import ImageRoundedIcon from '@mui/icons-material/ImageRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import UploadRoundedIcon from '@mui/icons-material/UploadRounded';

import { Controller, useForm, useWatch } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

import { ConfirmDialog, DialogHeader, FilterBar, PageHeader, QueryBoundary } from '@/components/admin/ui';
import { useToast } from '@/components/admin/toast';
import { useAdminList } from '@/lib/admin/use-admin-list';
import { useAdminQuery } from '@/lib/admin/use-admin-query';
import { useAdminAuth } from '@/lib/admin/auth-context';
import { AdminApiError } from '@/lib/admin/api';
import {
  eventsApi,
  EVENTS_PATH,
  EVENT_CATEGORIES,
  LIFECYCLES,
  toMediaInput,
  type AdminEvent,
  type EventLifecycle,
  type EventMediaInput,
} from '@/lib/admin/resources/events';
import { uploadMedia, ACCEPTED_IMAGE_TYPES } from '@/lib/admin/resources/media';
import { eventSchema, EVENT_LIMITS, type EventFormValues } from '@/validation/event.schema';

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

const MAX_GALLERY_PHOTOS = 4;

/**
 * Without this, React Hook Form silently updates formState.errors on a
 * failed client-side validation and Save does nothing visible at all.
 */
function flattenFormErrors(errors: Record<string, unknown>): string[] {
  const out: string[] = [];
  for (const val of Object.values(errors)) {
    if (!val || typeof val !== 'object') continue;
    const message = (val as { message?: unknown }).message;
    if (typeof message === 'string') out.push(message);
    else out.push(...flattenFormErrors(val as Record<string, unknown>));
  }
  return out;
}

/** Mirrors the public event card so admins can see the result before saving. */
function EventPreviewCard({
  title,
  category,
  dateLabel,
  guestsLabel,
  coverUrl,
}: {
  title: string;
  category: string;
  dateLabel: string;
  guestsLabel: string;
  coverUrl: string;
}) {
  return (
    <Paper variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden' }}>
      <Box sx={{ position: 'relative', aspectRatio: '4 / 3', bgcolor: 'action.hover' }}>
        {coverUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={coverUrl}
            alt=""
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <Box sx={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', color: 'text.disabled' }}>
            <ImageRoundedIcon fontSize="large" />
          </Box>
        )}
      </Box>
      <Box sx={{ p: 1.75 }}>
        <Typography variant="overline" sx={{ color: 'secondary.dark', fontWeight: 800 }}>
          {category || 'Category'}
        </Typography>
        <Typography variant="h6" sx={{ mt: 0.25, fontWeight: 700 }}>
          {title || 'Event title'}
        </Typography>
        <Stack direction="row" spacing={0.75} sx={{ mt: 1, alignItems: 'center', color: 'text.secondary' }}>
          <CalendarMonthRoundedIcon sx={{ fontSize: 18 }} />
          <Typography variant="caption">{dateLabel || 'Select a date'}</Typography>
        </Stack>
        {guestsLabel && (
          <Stack direction="row" spacing={0.75} sx={{ mt: 0.5, alignItems: 'center', color: 'text.secondary' }}>
            <PeopleAltRoundedIcon sx={{ fontSize: 18 }} />
            <Typography variant="caption">{guestsLabel}</Typography>
          </Stack>
        )}
      </Box>
    </Paper>
  );
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

  const [tab, setTab] = useState<'UPCOMING' | 'PAST'>('UPCOMING');
  useEffect(() => {
    setParam('lifecycle', tab === 'UPCOMING' ? 'UPCOMING' : undefined);
    setParam('page', 1);
  }, [tab, setParam]);

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

  const rows = data?.items ?? [];
  // "Past" clears the server-side lifecycle filter (so it doesn't collide with
  // "Upcoming" needing the opposite), and instead excludes UPCOMING here —
  // COMPLETED and CANCELLED both belong in the past view.
  const visibleRows = tab === 'UPCOMING' ? rows : rows.filter((r) => r.lifecycle !== 'UPCOMING');

  return (
    <Box>
      <PageHeader
        title="Events"
        subtitle="Events shown on the gallery / past events section."
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

      <ToggleButtonGroup
        value={tab}
        exclusive
        onChange={(_, v) => v && setTab(v)}
        size="small"
        sx={{ mb: 2 }}
      >
        <ToggleButton value="UPCOMING">Upcoming</ToggleButton>
        <ToggleButton value="PAST">Past</ToggleButton>
      </ToggleButtonGroup>

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
          <MenuItem value="PUBLISHED">Published</MenuItem>
          <MenuItem value="DRAFT">Draft</MenuItem>
        </TextField>
        <TextField
          size="small"
          label="Search title"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          sx={{ flexGrow: 1 }}
        />
      </FilterBar>

      <QueryBoundary loading={loading && !data} error={error} onRetry={reload}>
        {visibleRows.length === 0 ? (
          <Typography color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
            No events in this view.
          </Typography>
        ) : (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' },
              gap: 2,
            }}
          >
            {visibleRows.map((ev) => (
              <Paper
                key={ev.id}
                variant="outlined"
                sx={{
                  p: 2.25,
                  borderRadius: 2,
                  bgcolor: 'action.hover',
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 0.75,
                }}
              >
                {(canManage || canPublish) && (
                  <IconButton
                    size="small"
                    disabled={busy}
                    onClick={(e) => setMenu({ anchor: e.currentTarget, row: ev })}
                    sx={{ position: 'absolute', top: 8, right: 8 }}
                  >
                    <MoreVertRoundedIcon fontSize="small" />
                  </IconButton>
                )}

                <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center', pr: 4, flexWrap: 'wrap' }}>
                  <Typography variant="overline" sx={{ color: 'primary.main', fontWeight: 800 }}>
                    {ev.category}
                  </Typography>
                  {ev.status === 'DRAFT' && <Chip size="small" label="Draft" variant="outlined" />}
                  {ev.lifecycle === 'CANCELLED' && (
                    <Chip size="small" label="Cancelled" color="error" variant="outlined" />
                  )}
                </Stack>

                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  {ev.title}
                </Typography>

                <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center', color: 'text.secondary' }}>
                  <CalendarMonthRoundedIcon fontSize="small" />
                  <Typography variant="body2">{fmtDate(ev.eventDate)}</Typography>
                </Stack>

                {ev.guestsLabel && (
                  <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center', color: 'text.secondary' }}>
                    <PeopleAltRoundedIcon fontSize="small" />
                    <Typography variant="body2">{ev.guestsLabel}</Typography>
                  </Stack>
                )}

                <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
                  {canManage && (
                    <Button
                      size="small"
                      startIcon={<EditRoundedIcon fontSize="small" />}
                      onClick={() => setDialog(ev.id)}
                    >
                      Edit
                    </Button>
                  )}
                  {canManage && (
                    <Button
                      size="small"
                      color="error"
                      startIcon={<DeleteOutlineRoundedIcon fontSize="small" />}
                      onClick={() => setConfirmDel(ev)}
                    >
                      Delete
                    </Button>
                  )}
                </Stack>
              </Paper>
            ))}
          </Box>
        )}
      </QueryBoundary>

      <Menu anchorEl={menu?.anchor ?? null} open={Boolean(menu)} onClose={() => setMenu(null)}>
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

  const [coverMediaId, setCoverMediaId] = useState<string | null>(null);
  const [coverUrl, setCoverUrl] = useState('');
  const [gallery, setGallery] = useState<MediaDraft[]>([]);
  const [hydrated, setHydrated] = useState(!eventId);
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<EventFormValues>({
    resolver: yupResolver(eventSchema),
    mode: 'onTouched',
    defaultValues: {
      title: '',
      category: '',
      summary: '',
      description: '',
      eventDate: '',
      startTime: '',
      endTime: '',
      guestsLabel: '',
      lifecycle: 'COMPLETED',
    },
  });

  const title = useWatch({ control, name: 'title' });
  const category = useWatch({ control, name: 'category' });
  const eventDate = useWatch({ control, name: 'eventDate' });
  const guestsLabel = useWatch({ control, name: 'guestsLabel' });

  // Populate from the fetched event exactly once.
  if (eventId && existing.data && !hydrated) {
    const e = existing.data;
    reset({
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

  async function uploadCover(file: File | undefined) {
    if (!file) return;
    setUploading(true);
    try {
      const m = await uploadMedia(file, { folder: 'events', altText: title });
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
    if (gallery.length >= MAX_GALLERY_PHOTOS) {
      toast.error(`You can add up to ${MAX_GALLERY_PHOTOS} photos.`);
      return;
    }
    setUploading(true);
    try {
      const m = await uploadMedia(file, { folder: 'events', altText: title });
      setGallery((g) => [
        ...g,
        { mediaId: m.id, type: 'IMAGE', altText: title || 'Event photo', url: m.url },
      ]);
    } catch (err) {
      toast.error(err instanceof AdminApiError ? err.messages[0] : 'Upload failed');
    } finally {
      setUploading(false);
    }
  }

  const onSubmit = handleSubmit(async (values) => {
    setErrors([]);
    try {
      const body = {
        title: values.title.trim(),
        category: values.category.trim(),
        summary: values.summary.trim(),
        description: values.description?.trim() || undefined,
        eventDate: values.eventDate,
        startTime: values.startTime || null,
        endTime: values.endTime || null,
        guestsLabel: values.guestsLabel?.trim() || null,
        coverMediaId,
        lifecycle: values.lifecycle,
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
    }
  }, (formErrors) => {
    const messages = flattenFormErrors(formErrors as Record<string, unknown>);
    setErrors(messages.length > 0 ? messages : ['Please check the highlighted fields.']);
    toast.error(messages[0] ?? 'Please check the highlighted fields.');
  });

  const saving = isSubmitting;

  return (
    <Dialog open onClose={saving || uploading ? undefined : onClose} maxWidth="lg" fullWidth>
      <DialogHeader icon={CalendarMonthRoundedIcon} title={eventId ? 'Edit event' : 'New event'} onClose={saving || uploading ? undefined : onClose} />
      <DialogContent dividers>
        {!loaded ? (
          <Typography color="text.secondary">Loading…</Typography>
        ) : (
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 300px' }, gap: 3 }}>
          <Stack spacing={2}>
            {errors.map((m, i) => (
              <Typography key={i} variant="caption" color="error">{m}</Typography>
            ))}

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <Controller
                name="title"
                control={control}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    label="Title"
                    size="small"
                    fullWidth
                    slotProps={{ htmlInput: { maxLength: EVENT_LIMITS.title } }}
                    error={Boolean(fieldState.error)}
                    helperText={fieldState.error?.message ?? `${field.value.length}/${EVENT_LIMITS.title}`}
                  />
                )}
              />
              <Controller
                name="category"
                control={control}
                render={({ field, fieldState }) => (
                  <Autocomplete
                    freeSolo
                    options={EVENT_CATEGORIES}
                    value={field.value}
                    onInputChange={(_, v) => field.onChange(v)}
                    fullWidth
                    size="small"
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Category"
                        placeholder="Celebration"
                        slotProps={{
                          ...params.slotProps,
                          htmlInput: { ...params.slotProps.htmlInput, maxLength: EVENT_LIMITS.category },
                        }}
                        error={Boolean(fieldState.error)}
                        helperText={fieldState.error?.message}
                      />
                    )}
                  />
                )}
              />
            </Stack>
            <Controller
              name="summary"
              control={control}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  label="Summary"
                  size="small"
                  fullWidth
                  multiline
                  minRows={2}
                  slotProps={{ htmlInput: { maxLength: EVENT_LIMITS.summary } }}
                  error={Boolean(fieldState.error)}
                  helperText={fieldState.error?.message ?? `${field.value.length}/${EVENT_LIMITS.summary}`}
                />
              )}
            />
            <Controller
              name="description"
              control={control}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  label="Description (optional)"
                  size="small"
                  fullWidth
                  multiline
                  minRows={3}
                  slotProps={{ htmlInput: { maxLength: EVENT_LIMITS.description } }}
                  error={Boolean(fieldState.error)}
                  helperText={fieldState.error?.message ?? `${(field.value ?? '').length}/${EVENT_LIMITS.description}`}
                />
              )}
            />

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <Controller
                name="eventDate"
                control={control}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    type="date"
                    label="Event date"
                    size="small"
                    slotProps={{ inputLabel: { shrink: true } }}
                    error={Boolean(fieldState.error)}
                    helperText={fieldState.error?.message}
                  />
                )}
              />
              <Controller
                name="startTime"
                control={control}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    type="time"
                    label="Start"
                    size="small"
                    slotProps={{ inputLabel: { shrink: true } }}
                    error={Boolean(fieldState.error)}
                    helperText={fieldState.error?.message}
                  />
                )}
              />
              <Controller
                name="endTime"
                control={control}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    type="time"
                    label="End"
                    size="small"
                    slotProps={{ inputLabel: { shrink: true } }}
                    error={Boolean(fieldState.error)}
                    helperText={fieldState.error?.message}
                  />
                )}
              />
            </Stack>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <Controller
                name="guestsLabel"
                control={control}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    label="Guests label"
                    size="small"
                    fullWidth
                    placeholder="Family & friends"
                    slotProps={{ htmlInput: { maxLength: EVENT_LIMITS.guestsLabel } }}
                    error={Boolean(fieldState.error)}
                    helperText={fieldState.error?.message ?? `${(field.value ?? '').length}/${EVENT_LIMITS.guestsLabel}`}
                  />
                )}
              />
              <Controller
                name="lifecycle"
                control={control}
                render={({ field }) => (
                  <TextField {...field} select label="Lifecycle" size="small" fullWidth>
                    {LIFECYCLES.map((l) => (
                      <MenuItem key={l} value={l}>{l}</MenuItem>
                    ))}
                  </TextField>
                )}
              />
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
              <Typography variant="caption">
                Photo gallery ({gallery.length}/{MAX_GALLERY_PHOTOS})
              </Typography>
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
              {gallery.length < MAX_GALLERY_PHOTOS && (
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
              )}
            </Box>
          </Stack>

          <Box>
            <Typography variant="overline" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
              Website preview
            </Typography>
            <EventPreviewCard
              title={title}
              category={category}
              dateLabel={eventDate ? fmtDate(eventDate) : ''}
              guestsLabel={guestsLabel ?? ''}
              coverUrl={coverUrl}
            />
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
              This is how the event card will look on the Events page.
            </Typography>
          </Box>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={saving || uploading}>Cancel</Button>
        <Button variant="contained" onClick={onSubmit} disabled={!loaded || saving || uploading}>
          {saving ? 'Saving…' : 'Save event'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
