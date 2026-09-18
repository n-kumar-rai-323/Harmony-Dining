'use client';

import { useEffect, useState } from 'react';

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  IconButton,
  ListItemIcon,
  Menu,
  MenuItem,
  Rating,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import MoreVertRoundedIcon from '@mui/icons-material/MoreVertRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import CancelRoundedIcon from '@mui/icons-material/CancelRounded';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import VisibilityOffRoundedIcon from '@mui/icons-material/VisibilityOffRounded';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import StarBorderRoundedIcon from '@mui/icons-material/StarBorderRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import NotificationsActiveRoundedIcon from '@mui/icons-material/NotificationsActiveRounded';
import AddAPhotoRoundedIcon from '@mui/icons-material/AddAPhotoRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import ReplyRoundedIcon from '@mui/icons-material/ReplyRounded';

import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

import { ConfirmDialog, FilterBar, PageHeader, QueryBoundary } from '@/components/admin/ui';
import { useToast } from '@/components/admin/toast';
import { useAdminList } from '@/lib/admin/use-admin-list';
import { useAdminAuth } from '@/lib/admin/auth-context';
import { adminApi, AdminApiError } from '@/lib/admin/api';
import type { Paginated } from '@/lib/admin/types';
import {
  reviewsApi,
  REVIEWS_PATH,
  type AdminReview,
  type ReviewStatus,
} from '@/lib/admin/resources/reviews';
import { uploadMedia, ACCEPTED_IMAGE_TYPES } from '@/lib/admin/resources/media';
import {
  adminReviewSchema,
  ADMIN_REVIEW_LIMITS,
  reviewReplySchema,
  REVIEW_REPLY_LIMIT,
  type AdminReviewFormValues,
  type ReviewReplyFormValues,
} from '@/validation/admin-review.schema';

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

const STATUS_COLOR: Record<ReviewStatus, 'default' | 'success' | 'error' | 'warning'> = {
  PENDING: 'warning',
  APPROVED: 'success',
  REJECTED: 'error',
};

type Tab = 'PENDING' | 'PUBLISHED' | 'ALL';

function timeAgo(iso: string): string {
  const diffSec = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 1000));
  const units: [string, number][] = [
    ['year', 31536000],
    ['month', 2592000],
    ['week', 604800],
    ['day', 86400],
    ['hour', 3600],
    ['minute', 60],
  ];
  for (const [label, secs] of units) {
    const value = Math.floor(diffSec / secs);
    if (value >= 1) return `${value} ${label}${value > 1 ? 's' : ''} ago`;
  }
  return 'just now';
}

export default function AdminReviewsPage() {
  const { hasPermission } = useAdminAuth();
  const canModerate = hasPermission('reviews.moderate');
  const toast = useToast();

  const list = useAdminList<AdminReview>(REVIEWS_PATH, { status: 'PENDING' });
  const { data, loading, error, reload, params, setParam } = list;

  const [searchInput, setSearchInput] = useState('');
  useEffect(() => {
    const t = setTimeout(
      () => setParam('search', searchInput.trim() || undefined),
      400,
    );
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput]);

  const [pendingCount, setPendingCount] = useState(0);
  async function refreshPendingCount() {
    try {
      const res = await adminApi.get<Paginated<AdminReview>>(
        `${REVIEWS_PATH}?status=PENDING&pageSize=1`,
      );
      setPendingCount(res.total);
    } catch {
      // Non-critical: leave the last known count.
    }
  }
  useEffect(() => {
    let cancelled = false;
    adminApi
      .get<Paginated<AdminReview>>(`${REVIEWS_PATH}?status=PENDING&pageSize=1`)
      .then((res) => {
        if (!cancelled) setPendingCount(res.total);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const activeTab: Tab =
    params.status === 'PENDING'
      ? 'PENDING'
      : params.published === 'true'
        ? 'PUBLISHED'
        : 'ALL';

  function selectTab(tab: Tab | null) {
    if (!tab) return;
    setParam('status', tab === 'PENDING' ? 'PENDING' : undefined);
    setParam('published', tab === 'PUBLISHED' ? 'true' : undefined);
    setParam('featured', undefined);
    setSearchInput('');
  }

  const [menu, setMenu] = useState<{ anchor: HTMLElement; row: AdminReview } | null>(
    null,
  );
  const [confirmDelete, setConfirmDelete] = useState<AdminReview | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [replyTarget, setReplyTarget] = useState<AdminReview | null>(null);

  async function run(id: string, fn: () => Promise<unknown>, ok: string) {
    setBusyId(id);
    try {
      await fn();
      toast.success(ok);
      reload();
      refreshPendingCount();
    } catch (err) {
      toast.error(err instanceof AdminApiError ? err.messages[0] : 'Action failed');
    } finally {
      setBusyId(null);
      setMenu(null);
      setConfirmDelete(null);
    }
  }

  async function approveAndPublish(r: AdminReview) {
    setBusyId(r.id);
    try {
      if (r.status !== 'APPROVED') await reviewsApi.approve(r.id);
      if (!r.isPublished) await reviewsApi.publish(r.id);
      toast.success('Review approved and published');
      reload();
      refreshPendingCount();
    } catch (err) {
      toast.error(err instanceof AdminApiError ? err.messages[0] : 'Action failed');
    } finally {
      setBusyId(null);
    }
  }

  return (
    <Box>
      <PageHeader
        title="Reviews"
        subtitle='Reviews submitted from the "Write a review" form on the website wait here for approval before going live.'
        action={
          canModerate && (
            <Button
              variant="contained"
              startIcon={<AddRoundedIcon />}
              onClick={() => setAddOpen(true)}
            >
              Add review
            </Button>
          )
        }
      />

      {pendingCount > 0 && (
        <Alert
          severity="warning"
          icon={<NotificationsActiveRoundedIcon fontSize="inherit" />}
          sx={{ mb: 2.5 }}
        >
          {pendingCount} new review{pendingCount > 1 ? 's' : ''} waiting for approval
          — submitted from the website form.
        </Alert>
      )}

      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={1.5}
        sx={{ mb: 2.5, alignItems: { sm: 'center' }, justifyContent: 'space-between' }}
      >
        <ToggleButtonGroup
          value={activeTab}
          exclusive
          onChange={(_, v) => selectTab(v)}
          size="small"
        >
          <ToggleButton value="PENDING">Pending</ToggleButton>
          <ToggleButton value="PUBLISHED">Published</ToggleButton>
          <ToggleButton value="ALL">All</ToggleButton>
        </ToggleButtonGroup>
      </Stack>

      {activeTab === 'ALL' && (
        <FilterBar>
          <TextField
            select
            size="small"
            label="Featured"
            value={(params.featured as string) ?? ''}
            onChange={(e) => setParam('featured', e.target.value || undefined)}
            sx={{ minWidth: 140 }}
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="true">Featured</MenuItem>
            <MenuItem value="false">Not featured</MenuItem>
          </TextField>
          <TextField
            size="small"
            label="Search name or comment"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            sx={{ minWidth: 240, flexGrow: 1 }}
          />
        </FilterBar>
      )}

      <QueryBoundary loading={loading && !data} error={error} onRetry={reload}>
        {data && data.items.length === 0 && (
          <Typography color="text.secondary" sx={{ py: 6, textAlign: 'center' }}>
            No reviews match these filters.
          </Typography>
        )}

        <Stack spacing={2}>
          {(data?.items ?? []).map((r) => (
            <Card
              key={r.id}
              variant="outlined"
              sx={{ borderColor: r.status === 'PENDING' ? 'warning.main' : 'divider' }}
            >
              <CardContent>
                <Stack
                  direction="row"
                  spacing={1.5}
                  sx={{ alignItems: 'flex-start', justifyContent: 'space-between', mb: 1.5 }}
                >
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                    {r.name}
                    {r.role && (
                      <Typography component="span" color="text.secondary" sx={{ fontWeight: 400 }}>
                        {' — '}{r.role}
                      </Typography>
                    )}
                  </Typography>
                  <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexShrink: 0 }}>
                    <Rating value={r.rating} size="small" readOnly />
                    <Chip
                      size="small"
                      label={`${r.status.toLowerCase()} · ${timeAgo(r.createdAt)}`}
                      color={STATUS_COLOR[r.status]}
                      variant={r.status === 'PENDING' ? 'filled' : 'outlined'}
                    />
                  </Stack>
                </Stack>

                <Typography variant="body1" sx={{ fontStyle: 'italic', mb: r.photos.length > 0 ? 1.5 : 2 }}>
                  &ldquo;{r.comment}&rdquo;
                </Typography>

                {r.photos.length > 0 && (
                  <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: 'wrap' }}>
                    {r.photos.map((p) => (
                      <Box
                        key={p.id}
                        component="a"
                        href={p.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        sx={{
                          width: 64,
                          height: 64,
                          borderRadius: 1,
                          overflow: 'hidden',
                          border: '1px solid',
                          borderColor: 'divider',
                          display: 'block',
                        }}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={p.url}
                          alt="Attached by guest"
                          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                        />
                      </Box>
                    ))}
                  </Stack>
                )}

                {r.reply && (
                  <Box
                    sx={{
                      mb: 2,
                      p: 1.5,
                      borderRadius: 1.5,
                      bgcolor: 'action.hover',
                      borderLeft: '3px solid',
                      borderColor: 'primary.main',
                    }}
                  >
                    <Typography variant="caption" sx={{ fontWeight: 700, color: 'primary.main' }}>
                      Response from Harmony
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 0.25 }}>
                      {r.reply}
                    </Typography>
                  </Box>
                )}

                <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
                  {canModerate && r.status !== 'REJECTED' && !r.isPublished && (
                    <Button
                      size="small"
                      variant="contained"
                      startIcon={<CheckCircleRoundedIcon />}
                      disabled={busyId === r.id}
                      onClick={() => approveAndPublish(r)}
                    >
                      Approve &amp; publish
                    </Button>
                  )}
                  {canModerate && r.status === 'REJECTED' && (
                    <Button
                      size="small"
                      variant="contained"
                      startIcon={<CheckCircleRoundedIcon />}
                      disabled={busyId === r.id}
                      onClick={() => approveAndPublish(r)}
                    >
                      Approve &amp; publish
                    </Button>
                  )}
                  {canModerate && r.status !== 'REJECTED' && (
                    <Button
                      size="small"
                      variant="outlined"
                      color="inherit"
                      startIcon={<CancelRoundedIcon />}
                      disabled={busyId === r.id}
                      onClick={() => run(r.id, () => reviewsApi.reject(r.id), 'Review rejected')}
                    >
                      Reject
                    </Button>
                  )}
                  {canModerate && r.isPublished && (
                    <Button
                      size="small"
                      variant="outlined"
                      color="inherit"
                      startIcon={<VisibilityOffRoundedIcon />}
                      disabled={busyId === r.id}
                      onClick={() =>
                        run(r.id, () => reviewsApi.unpublish(r.id), 'Review unpublished')
                      }
                    >
                      Unpublish
                    </Button>
                  )}
                  {canModerate && r.status !== 'REJECTED' && (
                    <Button
                      size="small"
                      variant="outlined"
                      color="inherit"
                      startIcon={<ReplyRoundedIcon />}
                      disabled={busyId === r.id}
                      onClick={() => setReplyTarget(r)}
                    >
                      {r.reply ? 'Edit reply' : 'Reply'}
                    </Button>
                  )}

                  <Box sx={{ flexGrow: 1 }} />

                  {r.isPublished && <Chip size="small" variant="outlined" label="Published" />}
                  {r.isFeatured && (
                    <Chip size="small" variant="outlined" color="primary" label="Featured" />
                  )}

                  {canModerate && (
                    <IconButton
                      size="small"
                      disabled={busyId === r.id}
                      onClick={(e) => setMenu({ anchor: e.currentTarget, row: r })}
                    >
                      <MoreVertRoundedIcon fontSize="small" />
                    </IconButton>
                  )}
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Stack>

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

      {/* secondary row action menu */}
      <Menu
        anchorEl={menu?.anchor ?? null}
        open={Boolean(menu)}
        onClose={() => setMenu(null)}
      >
        {menu?.row.isPublished && !menu.row.isFeatured && (
          <MenuItem
            onClick={() =>
              run(
                menu!.row.id,
                () => reviewsApi.feature(menu!.row.id),
                'Added to featured',
              )
            }
          >
            <ListItemIcon>
              <StarRoundedIcon fontSize="small" />
            </ListItemIcon>
            Feature on homepage
          </MenuItem>
        )}
        {menu?.row.isFeatured && (
          <MenuItem
            onClick={() =>
              run(
                menu!.row.id,
                () => reviewsApi.unfeature(menu!.row.id),
                'Removed from featured',
              )
            }
          >
            <ListItemIcon>
              <StarBorderRoundedIcon fontSize="small" />
            </ListItemIcon>
            Unfeature
          </MenuItem>
        )}
        {menu?.row.status === 'APPROVED' && !menu.row.isPublished && (
          <MenuItem
            onClick={() =>
              run(
                menu!.row.id,
                () => reviewsApi.publish(menu!.row.id),
                'Review published',
              )
            }
          >
            <ListItemIcon>
              <VisibilityRoundedIcon fontSize="small" />
            </ListItemIcon>
            Publish
          </MenuItem>
        )}
        <MenuItem
          onClick={() => {
            setConfirmDelete(menu!.row);
            setMenu(null);
          }}
          sx={{ color: 'error.main' }}
        >
          <ListItemIcon>
            <DeleteOutlineRoundedIcon fontSize="small" color="error" />
          </ListItemIcon>
          Delete
        </MenuItem>
      </Menu>

      <ConfirmDialog
        open={Boolean(confirmDelete)}
        title="Delete this review?"
        body={
          confirmDelete
            ? `"${confirmDelete.name}"'s review will be removed from the site and the admin list.`
            : ''
        }
        confirmLabel="Delete"
        destructive
        busy={busyId === confirmDelete?.id}
        onCancel={() => setConfirmDelete(null)}
        onConfirm={() =>
          run(confirmDelete!.id, () => reviewsApi.remove(confirmDelete!.id), 'Review deleted')
        }
      />

      <AddReviewDialog
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onCreated={() => {
          setAddOpen(false);
          reload();
          refreshPendingCount();
          toast.success('Review added');
        }}
      />

      {replyTarget && (
        <ReplyDialog
          review={replyTarget}
          onClose={() => setReplyTarget(null)}
          onSaved={() => {
            setReplyTarget(null);
            reload();
          }}
        />
      )}
    </Box>
  );
}

/* --------------------------------------------------------------- reply dialog */

function ReplyDialog({
  review,
  onClose,
  onSaved,
}: {
  review: AdminReview;
  onClose: () => void;
  onSaved: () => void;
}) {
  const toast = useToast();
  const [saving, setSaving] = useState(false);

  const { control, handleSubmit } = useForm<ReviewReplyFormValues>({
    resolver: yupResolver(reviewReplySchema),
    mode: 'onTouched',
    defaultValues: { reply: review.reply ?? '' },
  });

  const onSubmit = handleSubmit(async (values) => {
    setSaving(true);
    try {
      await reviewsApi.reply(review.id, values.reply);
      toast.success(values.reply.trim() ? 'Reply saved' : 'Reply removed');
      onSaved();
    } catch (err) {
      toast.error(err instanceof AdminApiError ? err.messages[0] : 'Could not save reply');
    } finally {
      setSaving(false);
    }
  });

  return (
    <Dialog open onClose={saving ? undefined : onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Reply to {review.name}&rsquo;s review</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 0.5 }}>
          <Box
            sx={{
              p: 1.5,
              borderRadius: 1.5,
              bgcolor: 'action.hover',
            }}
          >
            <Rating value={review.rating} size="small" readOnly />
            <Typography variant="body2" sx={{ fontStyle: 'italic', mt: 0.25 }}>
              &ldquo;{review.comment}&rdquo;
            </Typography>
          </Box>

          <Typography variant="body2" color="text.secondary">
            This reply is shown publicly under the review, labelled &ldquo;Response
            from Harmony&rdquo;. Leave it blank and save to remove an existing reply.
          </Typography>

          <Controller
            name="reply"
            control={control}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                label="Your reply (optional)"
                multiline
                minRows={3}
                fullWidth
                autoFocus
                slotProps={{ htmlInput: { maxLength: REVIEW_REPLY_LIMIT } }}
                error={Boolean(fieldState.error)}
                helperText={
                  fieldState.error?.message ?? `${field.value.length}/${REVIEW_REPLY_LIMIT}`
                }
              />
            )}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={saving}>
          Cancel
        </Button>
        <Button variant="contained" onClick={onSubmit} disabled={saving}>
          {saving ? 'Saving…' : 'Save reply'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function AddReviewDialog({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      {open && <AddReviewForm onClose={onClose} onCreated={onCreated} />}
    </Dialog>
  );
}

function AddReviewForm({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: () => void;
}) {
  const toast = useToast();
  const [saving, setSaving] = useState(false);
  const [photos, setPhotos] = useState<{ id: string; url: string }[]>([]);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const { control, handleSubmit } = useForm<AdminReviewFormValues>({
    resolver: yupResolver(adminReviewSchema),
    mode: 'onTouched',
    defaultValues: {
      name: '',
      role: '',
      rating: 5,
      comment: '',
      approve: true,
      feature: false,
    },
  });

  async function addPhoto(file: File | undefined) {
    if (!file || photos.length >= ADMIN_REVIEW_LIMITS.photosMax) return;
    setUploadingPhoto(true);
    try {
      const media = await uploadMedia(file, { folder: 'reviews' });
      setPhotos((prev) => [...prev, { id: media.id, url: media.url }]);
    } catch (err) {
      toast.error(err instanceof AdminApiError ? err.messages[0] : 'Upload failed');
    } finally {
      setUploadingPhoto(false);
    }
  }

  function removePhoto(id: string) {
    setPhotos((prev) => prev.filter((p) => p.id !== id));
  }

  const onSubmit = handleSubmit(
    async (values) => {
      setSaving(true);
      try {
        await reviewsApi.create({
          name: values.name.trim(),
          role: values.role?.trim() || undefined,
          rating: values.rating,
          comment: values.comment.trim(),
          approve: values.approve,
          feature: values.feature,
          mediaIds: photos.map((p) => p.id),
        });
        onCreated();
      } catch (err) {
        toast.error(
          err instanceof AdminApiError ? err.messages[0] : 'Could not add review',
        );
      } finally {
        setSaving(false);
      }
    },
    (formErrors) => {
      const messages = flattenFormErrors(formErrors as Record<string, unknown>);
      toast.error(messages[0] ?? 'Please check the highlighted fields.');
    },
  );

  return (
    <>
      <DialogTitle>Add a review</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 0.5 }}>
          <Typography variant="body2" color="text.secondary">
            Use this to bring in a review from Google, Facebook or in person.
          </Typography>
          <Controller
            name="name"
            control={control}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                label="Guest name"
                required
                fullWidth
                error={Boolean(fieldState.error)}
                helperText={fieldState.error?.message}
              />
            )}
          />
          <Controller
            name="role"
            control={control}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                value={field.value ?? ''}
                label="Label (optional)"
                placeholder="Anniversary dinner"
                fullWidth
                error={Boolean(fieldState.error)}
                helperText={fieldState.error?.message}
              />
            )}
          />
          <Controller
            name="rating"
            control={control}
            render={({ field, fieldState }) => (
              <Box>
                <Typography variant="caption" color={fieldState.error ? 'error' : 'text.secondary'}>
                  Rating
                </Typography>
                <Rating
                  value={field.value ?? null}
                  onChange={(_, v) => field.onChange(v)}
                />
                {fieldState.error && (
                  <Typography variant="caption" color="error" sx={{ display: 'block' }}>
                    {fieldState.error.message}
                  </Typography>
                )}
              </Box>
            )}
          />
          <Controller
            name="comment"
            control={control}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                label="Comment"
                required
                multiline
                minRows={3}
                fullWidth
                slotProps={{ htmlInput: { maxLength: ADMIN_REVIEW_LIMITS.comment } }}
                error={Boolean(fieldState.error)}
                helperText={
                  fieldState.error?.message ??
                  `${field.value.length}/${ADMIN_REVIEW_LIMITS.comment}`
                }
              />
            )}
          />

          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
              Photo (optional, up to 3)
            </Typography>
            <Stack direction="row" spacing={1.5} sx={{ flexWrap: 'wrap' }}>
              {photos.map((p) => (
                <Box
                  key={p.id}
                  sx={{
                    position: 'relative',
                    width: 72,
                    height: 72,
                    borderRadius: 1.5,
                    overflow: 'hidden',
                    border: '1px solid',
                    borderColor: 'divider',
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={p.url}
                    alt="Attachment"
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                  />
                  <IconButton
                    size="small"
                    onClick={() => removePhoto(p.id)}
                    aria-label="Remove photo"
                    sx={{
                      position: 'absolute',
                      top: 2,
                      right: 2,
                      bgcolor: 'rgba(0,0,0,0.55)',
                      color: '#fff',
                      width: 20,
                      height: 20,
                      '&:hover': { bgcolor: 'rgba(0,0,0,0.75)' },
                    }}
                  >
                    <CloseRoundedIcon sx={{ fontSize: 13 }} />
                  </IconButton>
                </Box>
              ))}
              {photos.length < ADMIN_REVIEW_LIMITS.photosMax && (
                <Button
                  component="label"
                  variant="outlined"
                  disabled={uploadingPhoto}
                  startIcon={<AddAPhotoRoundedIcon />}
                  sx={{ width: 72, height: 72, flexDirection: 'column', borderRadius: 1.5 }}
                >
                  <Typography variant="caption">
                    {uploadingPhoto ? 'Uploading…' : 'Add'}
                  </Typography>
                  <input
                    type="file"
                    hidden
                    accept={ACCEPTED_IMAGE_TYPES}
                    onChange={(e) => {
                      void addPhoto(e.target.files?.[0]);
                      e.target.value = '';
                    }}
                  />
                </Button>
              )}
            </Stack>
          </Box>

          <Stack direction="row" spacing={2}>
            <Controller
              name="approve"
              control={control}
              render={({ field }) => (
                <FormControlLabel
                  control={
                    <Checkbox checked={field.value} onChange={(e) => field.onChange(e.target.checked)} />
                  }
                  label="Approve & publish now"
                />
              )}
            />
            <Controller
              name="feature"
              control={control}
              render={({ field }) => (
                <FormControlLabel
                  control={
                    <Checkbox checked={field.value} onChange={(e) => field.onChange(e.target.checked)} />
                  }
                  label="Feature on homepage"
                />
              )}
            />
          </Stack>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={saving}>
          Cancel
        </Button>
        <Button variant="contained" onClick={onSubmit} disabled={saving}>
          {saving ? 'Adding…' : 'Add review'}
        </Button>
      </DialogActions>
    </>
  );
}
