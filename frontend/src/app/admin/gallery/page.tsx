'use client';

import { useState } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

import {
  Alert,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CardMedia,
  Checkbox,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  FormControlLabel,
  IconButton,
  MenuItem,
  Stack,
  Switch,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import PhotoLibraryRoundedIcon from '@mui/icons-material/PhotoLibraryRounded';
import UploadRoundedIcon from '@mui/icons-material/UploadRounded';

import { ConfirmDialog, DialogHeader, FilterBar, PageHeader, QueryBoundary } from '@/components/admin/ui';
import { useToast } from '@/components/admin/toast';
import { useAdminList } from '@/lib/admin/use-admin-list';
import { useAdminAuth } from '@/lib/admin/auth-context';
import { AdminApiError } from '@/lib/admin/api';
import { galleryItemSchema, type GalleryItemFormValues } from '@/validation/gallery-item.schema';
import {
  galleryApi,
  GALLERY_PATH,
  GALLERY_CATEGORIES,
  type GalleryItem,
} from '@/lib/admin/resources/gallery';
import { uploadMedia, ACCEPTED_IMAGE_TYPES } from '@/lib/admin/resources/media';

function categoryLabel(c: string): string {
  return c.charAt(0) + c.slice(1).toLowerCase();
}

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

export default function AdminGalleryPage() {
  const { hasPermission } = useAdminAuth();
  const canManage = hasPermission('gallery.manage');
  const toast = useToast();

  const { data, loading, error, reload, params, setParam } =
    useAdminList<GalleryItem>(GALLERY_PATH, { pageSize: 24 });

  const [dialog, setDialog] = useState<GalleryItem | 'new' | null>(null);
  const [confirmDel, setConfirmDel] = useState<GalleryItem | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function act(fn: () => Promise<unknown>, ok: string, id?: string) {
    if (id) setBusyId(id);
    else setBusy(true);
    try {
      await fn();
      toast.success(ok);
      reload();
    } catch (err) {
      toast.error(err instanceof AdminApiError ? err.messages[0] : 'Action failed');
    } finally {
      setBusyId(null);
      setBusy(false);
      setConfirmDel(null);
    }
  }

  const items = data?.items ?? [];
  const featuredCount = items.filter((it) => it.featuredOnHome).length;

  return (
    <Box>
      <PageHeader
        title="Gallery"
        subtitle="Photos used on the gallery page and homepage previews."
        action={
          canManage && (
            <Button
              variant="contained"
              startIcon={<UploadRoundedIcon />}
              onClick={() => setDialog('new')}
            >
              Upload photo
            </Button>
          )
        }
      />

      <ToggleButtonGroup
        value={(params.category as string) ?? ''}
        exclusive
        onChange={(_, v) => v !== null && setParam('category', v || undefined)}
        size="small"
        sx={{ mb: 2, flexWrap: 'wrap' }}
      >
        <ToggleButton value="">All</ToggleButton>
        {GALLERY_CATEGORIES.map((c) => (
          <ToggleButton key={c} value={c}>{categoryLabel(c)}</ToggleButton>
        ))}
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
      </FilterBar>

      <QueryBoundary loading={loading && !data} error={error} onRetry={reload}>
        {data && items.length > 0 && (
          <Alert
            severity={featuredCount === 0 ? 'warning' : featuredCount < 3 ? 'info' : 'success'}
            sx={{ mb: 2 }}
          >
            {featuredCount === 0
              ? 'No photos featured — the homepage gallery section will stay hidden until at least one is featured.'
              : featuredCount < 3
                ? `${featuredCount} of ${data.total} photos featured on homepage — add at least 3 for the full mosaic layout.`
                : `${featuredCount} of ${data.total} photos featured on homepage`}
          </Alert>
        )}

        <Box
          sx={{
            display: 'grid',
            gap: 2,
            gridTemplateColumns: {
              xs: '1fr 1fr',
              sm: 'repeat(3, 1fr)',
              md: 'repeat(4, 1fr)',
            },
          }}
        >
          {items.map((it) => (
            <Card
              key={it.id}
              variant="outlined"
              sx={{
                borderColor: it.featuredOnHome ? 'primary.main' : 'divider',
                borderWidth: it.featuredOnHome ? 2 : 1,
              }}
            >
              <Box
                sx={{ position: 'relative', cursor: canManage ? 'pointer' : 'default' }}
                onClick={() => canManage && setDialog(it)}
              >
                {it.featuredOnHome && (
                  <Chip
                    size="small"
                    label="Homepage"
                    color="primary"
                    sx={{ position: 'absolute', top: 8, left: 8, zIndex: 1 }}
                  />
                )}
                <CardMedia
                  component="img"
                  image={it.media.url}
                  alt={it.altText}
                  sx={{ aspectRatio: '4 / 3', objectFit: 'cover', bgcolor: 'action.hover' }}
                />
                <CardContent sx={{ pb: 0.5 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>
                    {it.title}
                  </Typography>
                </CardContent>
              </Box>
              <CardActions sx={{ justifyContent: 'space-between', pl: 2 }}>
                <FormControlLabel
                  onClick={(e) => e.stopPropagation()}
                  control={
                    <Checkbox
                      size="small"
                      checked={it.featuredOnHome}
                      disabled={!canManage || busyId === it.id}
                      onChange={(e) =>
                        act(
                          () => galleryApi.update(it.id, { featuredOnHome: e.target.checked }),
                          e.target.checked ? 'Added to homepage' : 'Removed from homepage',
                          it.id,
                        )
                      }
                    />
                  }
                  label="Featured"
                  slotProps={{ typography: { variant: 'body2' } }}
                />
                {canManage && (
                  <IconButton
                    size="small"
                    color="error"
                    disabled={busyId === it.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      setConfirmDel(it);
                    }}
                  >
                    <DeleteOutlineRoundedIcon fontSize="small" />
                  </IconButton>
                )}
              </CardActions>
            </Card>
          ))}
        </Box>

        {data && data.items.length === 0 && (
          <Typography color="text.secondary" sx={{ py: 6, textAlign: 'center' }}>
            No photos match these filters.
          </Typography>
        )}

        {data && data.pageCount > 1 && (
          <Stack direction="row" spacing={1} sx={{ justifyContent: 'center', mt: 3 }}>
            <Button
              size="small"
              disabled={data.page <= 1}
              onClick={() => setParam('page', data.page - 1)}
            >
              Previous
            </Button>
            <Typography variant="body2" sx={{ alignSelf: 'center' }}>
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

      {dialog && (
        <GalleryDialog
          item={dialog === 'new' ? null : dialog}
          onClose={() => setDialog(null)}
          onSaved={() => { setDialog(null); reload(); }}
        />
      )}

      <ConfirmDialog
        open={Boolean(confirmDel)}
        title="Delete photo?"
        body={confirmDel ? `"${confirmDel.title}" will be removed from the gallery.` : ''}
        confirmLabel="Delete"
        destructive
        busy={busy}
        onCancel={() => setConfirmDel(null)}
        onConfirm={() => act(() => galleryApi.remove(confirmDel!.id), 'Photo deleted')}
      />
    </Box>
  );
}

function GalleryDialog({
  item,
  onClose,
  onSaved,
}: {
  item: GalleryItem | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const toast = useToast();
  const [previewUrl, setPreviewUrl] = useState(item?.media.url ?? '');
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const {
    control,
    handleSubmit,
    setValue,
    formState: { isSubmitting },
  } = useForm<GalleryItemFormValues>({
    resolver: yupResolver(galleryItemSchema),
    mode: 'onTouched',
    defaultValues: {
      mediaId: item?.mediaId ?? '',
      title: item?.title ?? '',
      altText: item?.altText ?? '',
      caption: item?.caption ?? '',
      category: item?.category ?? 'DINING',
      featuredOnHome: item?.featuredOnHome ?? false,
      published: item?.status === 'PUBLISHED',
    },
  });

  const title = useWatch({ control, name: 'title' });
  const altText = useWatch({ control, name: 'altText' });

  async function onFile(file: File | undefined) {
    if (!file) return;
    setUploading(true);
    setErrors([]);
    try {
      const media = await uploadMedia(file, { folder: 'gallery', title, altText });
      setValue('mediaId', media.id, { shouldValidate: true });
      setPreviewUrl(media.url);
      toast.success('Image uploaded');
    } catch (err) {
      setErrors(err instanceof AdminApiError ? err.messages : ['Upload failed']);
    } finally {
      setUploading(false);
    }
  }

  const onSubmit = handleSubmit(async (values) => {
    setErrors([]);
    try {
      const body = {
        mediaId: values.mediaId,
        title: values.title.trim(),
        altText: values.altText.trim(),
        caption: values.caption?.trim() || undefined,
        category: values.category,
        featuredOnHome: values.featuredOnHome,
      };
      const saved = item ? await galleryApi.update(item.id, body) : await galleryApi.create(body);
      if (values.published !== (item?.status === 'PUBLISHED')) {
        await galleryApi.setPublished(saved.id, values.published);
      }
      toast.success('Photo saved');
      onSaved();
    } catch (err) {
      if (err instanceof AdminApiError) setErrors(err.messages);
      else toast.error('Could not save');
    }
  }, (formErrors) => {
    const messages = flattenFormErrors(formErrors as Record<string, unknown>);
    setErrors(messages.length > 0 ? messages : ['Please check the highlighted fields.']);
  });

  const saving = isSubmitting;

  return (
    <Dialog open onClose={saving || uploading ? undefined : onClose} maxWidth="sm" fullWidth>
      <DialogHeader icon={PhotoLibraryRoundedIcon} title={item ? 'Edit photo' : 'Add photo'} onClose={saving || uploading ? undefined : onClose} />
      <DialogContent dividers>
        <Stack spacing={2}>
          {errors.map((m, i) => (
            <Typography key={i} variant="caption" color="error">{m}</Typography>
          ))}

          <Box
            sx={{
              border: '1px dashed',
              borderColor: 'divider',
              borderRadius: 1,
              p: 2,
              textAlign: 'center',
            }}
          >
            {previewUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={previewUrl}
                alt="preview"
                style={{ maxHeight: 180, maxWidth: '100%', borderRadius: 4 }}
              />
            ) : (
              <Typography variant="body2" color="text.secondary">
                No image selected
              </Typography>
            )}
            <Box sx={{ mt: 1.5 }}>
              <Button
                component="label"
                size="small"
                startIcon={<UploadRoundedIcon />}
                disabled={uploading}
              >
                {uploading ? 'Uploading…' : previewUrl ? 'Replace image' : 'Upload image'}
                <input
                  type="file"
                  hidden
                  accept={ACCEPTED_IMAGE_TYPES}
                  onChange={(e) => onFile(e.target.files?.[0])}
                />
              </Button>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                JPG, PNG, WebP, AVIF or GIF · up to 8 MB
              </Typography>
            </Box>
          </Box>

          <Controller
            name="title"
            control={control}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                label="Title"
                size="small"
                fullWidth
                error={Boolean(fieldState.error)}
                helperText={fieldState.error?.message ?? ' '}
              />
            )}
          />
          <Controller
            name="altText"
            control={control}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                label="Alt text (describes the image for screen readers)"
                size="small"
                fullWidth
                error={Boolean(fieldState.error)}
                helperText={fieldState.error?.message ?? ' '}
              />
            )}
          />
          <Controller
            name="caption"
            control={control}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                label="Caption (optional)"
                size="small"
                fullWidth
                multiline
                minRows={2}
                error={Boolean(fieldState.error)}
                helperText={fieldState.error?.message ?? ' '}
              />
            )}
          />
          <Controller
            name="category"
            control={control}
            render={({ field }) => (
              <TextField {...field} select label="Category" size="small">
                {GALLERY_CATEGORIES.map((c) => (
                  <MenuItem key={c} value={c}>{categoryLabel(c)}</MenuItem>
                ))}
              </TextField>
            )}
          />
          <Controller
            name="featuredOnHome"
            control={control}
            render={({ field }) => (
              <FormControlLabel
                control={<Switch checked={field.value} onChange={(e) => field.onChange(e.target.checked)} />}
                label="Show on the home page showcase"
              />
            )}
          />
          <Controller
            name="published"
            control={control}
            render={({ field }) => (
              <FormControlLabel
                control={<Switch checked={field.value} onChange={(e) => field.onChange(e.target.checked)} />}
                label="Published"
              />
            )}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={saving || uploading}>Cancel</Button>
        <Button variant="contained" onClick={onSubmit} disabled={saving || uploading}>
          {saving ? 'Saving…' : 'Save photo'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
