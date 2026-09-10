'use client';

import { useState } from 'react';

import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CardMedia,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  FormControlLabel,
  IconButton,
  Menu,
  MenuItem,
  Stack,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import MoreVertRoundedIcon from '@mui/icons-material/MoreVertRounded';
import PhotoLibraryRoundedIcon from '@mui/icons-material/PhotoLibraryRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import UploadRoundedIcon from '@mui/icons-material/UploadRounded';

import { ConfirmDialog, DialogHeader, FilterBar, PageHeader, QueryBoundary } from '@/components/admin/ui';
import { useToast } from '@/components/admin/toast';
import { useAdminList } from '@/lib/admin/use-admin-list';
import { useAdminAuth } from '@/lib/admin/auth-context';
import { AdminApiError } from '@/lib/admin/api';
import {
  galleryApi,
  GALLERY_PATH,
  GALLERY_CATEGORIES,
  type GalleryItem,
  type GalleryCategory,
} from '@/lib/admin/resources/gallery';
import { uploadMedia, ACCEPTED_IMAGE_TYPES } from '@/lib/admin/resources/media';

export default function AdminGalleryPage() {
  const { hasPermission } = useAdminAuth();
  const canManage = hasPermission('gallery.manage');
  const toast = useToast();

  const { data, loading, error, reload, params, setParam } =
    useAdminList<GalleryItem>(GALLERY_PATH, { pageSize: 24 });

  const [menu, setMenu] = useState<{ anchor: HTMLElement; row: GalleryItem } | null>(null);
  const [dialog, setDialog] = useState<GalleryItem | 'new' | null>(null);
  const [confirmDel, setConfirmDel] = useState<GalleryItem | null>(null);
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

  return (
    <Box>
      <PageHeader
        title="Gallery"
        subtitle="Photos shown on the public gallery and home page."
        action={
          canManage && (
            <Button
              variant="contained"
              startIcon={<AddRoundedIcon />}
              onClick={() => setDialog('new')}
            >
              Add photo
            </Button>
          )
        }
      />

      <FilterBar>
        <TextField
          select
          size="small"
          label="Category"
          value={(params.category as string) ?? ''}
          onChange={(e) => setParam('category', e.target.value || undefined)}
          sx={{ minWidth: 150 }}
        >
          <MenuItem value="">All</MenuItem>
          {GALLERY_CATEGORIES.map((c) => (
            <MenuItem key={c} value={c}>{c}</MenuItem>
          ))}
        </TextField>
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
          {(data?.items ?? []).map((it) => (
            <Card key={it.id} variant="outlined">
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
                <Stack direction="row" spacing={0.5} sx={{ mt: 0.5, flexWrap: 'wrap' }}>
                  <Chip size="small" label={it.category} variant="outlined" />
                  <Chip
                    size="small"
                    label={it.status}
                    color={it.status === 'PUBLISHED' ? 'success' : 'default'}
                  />
                  {it.featuredOnHome && (
                    <Chip size="small" label="Home" color="primary" variant="outlined" />
                  )}
                </Stack>
              </CardContent>
              <CardActions sx={{ justifyContent: 'flex-end' }}>
                {canManage && (
                  <IconButton
                    size="small"
                    disabled={busy}
                    onClick={(e) => setMenu({ anchor: e.currentTarget, row: it })}
                  >
                    <MoreVertRoundedIcon fontSize="small" />
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

      <Menu anchorEl={menu?.anchor ?? null} open={Boolean(menu)} onClose={() => setMenu(null)}>
        <MenuItem onClick={() => { setDialog(menu!.row); setMenu(null); }}>Edit</MenuItem>
        <MenuItem
          onClick={() =>
            act(
              () => galleryApi.setPublished(menu!.row.id, menu!.row.status !== 'PUBLISHED'),
              'Photo updated',
            )
          }
        >
          {menu?.row.status === 'PUBLISHED' ? 'Unpublish' : 'Publish'}
        </MenuItem>
        <MenuItem
          onClick={() => { setConfirmDel(menu!.row); setMenu(null); }}
          sx={{ color: 'error.main' }}
        >
          Delete
        </MenuItem>
      </Menu>

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
  const [mediaId, setMediaId] = useState(item?.mediaId ?? '');
  const [previewUrl, setPreviewUrl] = useState(item?.media.url ?? '');
  const [title, setTitle] = useState(item?.title ?? '');
  const [altText, setAltText] = useState(item?.altText ?? '');
  const [caption, setCaption] = useState(item?.caption ?? '');
  const [category, setCategory] = useState<GalleryCategory>(item?.category ?? 'DINING');
  const [featuredOnHome, setFeaturedOnHome] = useState(item?.featuredOnHome ?? false);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  async function onFile(file: File | undefined) {
    if (!file) return;
    setUploading(true);
    setErrors([]);
    try {
      const media = await uploadMedia(file, { folder: 'gallery', title, altText });
      setMediaId(media.id);
      setPreviewUrl(media.url);
      toast.success('Image uploaded');
    } catch (err) {
      setErrors(err instanceof AdminApiError ? err.messages : ['Upload failed']);
    } finally {
      setUploading(false);
    }
  }

  async function save() {
    setSaving(true);
    setErrors([]);
    try {
      const body = {
        mediaId,
        title: title.trim(),
        altText: altText.trim(),
        caption: caption.trim() || undefined,
        category,
        featuredOnHome,
      };
      if (item) await galleryApi.update(item.id, body);
      else await galleryApi.create(body);
      toast.success('Photo saved');
      onSaved();
    } catch (err) {
      if (err instanceof AdminApiError) setErrors(err.messages);
      else toast.error('Could not save');
    } finally {
      setSaving(false);
    }
  }

  const canSave =
    Boolean(mediaId) && title.trim().length >= 2 && altText.trim().length >= 2;

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

          <TextField label="Title" value={title} onChange={(e) => setTitle(e.target.value)} size="small" fullWidth />
          <TextField
            label="Alt text (describes the image for screen readers)"
            value={altText}
            onChange={(e) => setAltText(e.target.value)}
            size="small"
            fullWidth
          />
          <TextField
            label="Caption (optional)"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            size="small"
            fullWidth
            multiline
            minRows={2}
          />
          <TextField
            select
            label="Category"
            value={category}
            onChange={(e) => setCategory(e.target.value as GalleryCategory)}
            size="small"
          >
            {GALLERY_CATEGORIES.map((c) => (
              <MenuItem key={c} value={c}>{c}</MenuItem>
            ))}
          </TextField>
          <FormControlLabel
            control={
              <Switch
                checked={featuredOnHome}
                onChange={(e) => setFeaturedOnHome(e.target.checked)}
              />
            }
            label="Show on the home page showcase"
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={saving || uploading}>Cancel</Button>
        <Button variant="contained" onClick={save} disabled={saving || uploading || !canSave}>
          {saving ? 'Saving…' : 'Save photo'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
