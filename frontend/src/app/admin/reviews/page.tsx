'use client';

import { useEffect, useState } from 'react';

import {
  Box,
  Button,
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

import { PageHeader, QueryBoundary, ConfirmDialog } from '@/components/admin/ui';
import { DataTable, type Column } from '@/components/admin/data-table';
import { useToast } from '@/components/admin/toast';
import { useAdminList } from '@/lib/admin/use-admin-list';
import { useAdminAuth } from '@/lib/admin/auth-context';
import { AdminApiError } from '@/lib/admin/api';
import {
  reviewsApi,
  REVIEWS_PATH,
  type AdminReview,
  type ReviewStatus,
} from '@/lib/admin/resources/reviews';

const STATUS_COLOR: Record<ReviewStatus, 'default' | 'success' | 'error' | 'warning'> = {
  PENDING: 'warning',
  APPROVED: 'success',
  REJECTED: 'error',
};

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export default function AdminReviewsPage() {
  const { hasPermission } = useAdminAuth();
  const canModerate = hasPermission('reviews.moderate');
  const toast = useToast();

  const list = useAdminList<AdminReview>(REVIEWS_PATH);
  const { data, loading, error, reload, params, setParam } = list;

  const [searchInput, setSearchInput] = useState('');
  useEffect(() => {
    const t = setTimeout(
      () => setParam('search', searchInput.trim() || undefined),
      400,
    );
    return () => clearTimeout(t);
  }, [searchInput, setParam]);

  const [menu, setMenu] = useState<{ anchor: HTMLElement; row: AdminReview } | null>(
    null,
  );
  const [detail, setDetail] = useState<AdminReview | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<AdminReview | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);

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
      setMenu(null);
      setConfirmDelete(null);
    }
  }

  const columns: Column<AdminReview>[] = [
    {
      key: 'guest',
      header: 'Guest',
      render: (r) => (
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {r.name}
          </Typography>
          {r.role && (
            <Typography variant="caption" color="text.secondary">
              {r.role}
            </Typography>
          )}
        </Box>
      ),
    },
    {
      key: 'rating',
      header: 'Rating',
      width: 130,
      render: (r) => <Rating value={r.rating} size="small" readOnly />,
    },
    {
      key: 'comment',
      header: 'Comment',
      render: (r) => (
        <Typography
          variant="body2"
          sx={{
            maxWidth: 420,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {r.comment}
        </Typography>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      width: 96,
      render: (r) => (
        <Chip size="small" label={r.status} color={STATUS_COLOR[r.status]} />
      ),
    },
    {
      key: 'flags',
      header: 'Flags',
      width: 150,
      render: (r) => (
        <Stack direction="row" spacing={0.5} sx={{ flexWrap: 'wrap' }}>
          {r.isPublished && <Chip size="small" variant="outlined" label="Published" />}
          {r.isFeatured && (
            <Chip size="small" variant="outlined" color="primary" label="Featured" />
          )}
          {r.source === 'IMPORT' && (
            <Chip size="small" variant="outlined" label="Import" />
          )}
        </Stack>
      ),
    },
    {
      key: 'created',
      header: 'Submitted',
      width: 110,
      render: (r) => (
        <Typography variant="caption" color="text.secondary">
          {fmtDate(r.createdAt)}
        </Typography>
      ),
    },
    {
      key: 'actions',
      header: '',
      width: 48,
      align: 'right',
      render: (r) =>
        canModerate ? (
          <IconButton
            size="small"
            disabled={busyId === r.id}
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
        title="Reviews"
        subtitle="Moderate guest reviews and choose what appears on the site."
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
          <MenuItem value="PENDING">Pending</MenuItem>
          <MenuItem value="APPROVED">Approved</MenuItem>
          <MenuItem value="REJECTED">Rejected</MenuItem>
        </TextField>
        <TextField
          select
          size="small"
          label="Published"
          value={(params.published as string) ?? ''}
          onChange={(e) => setParam('published', e.target.value || undefined)}
          sx={{ minWidth: 140 }}
        >
          <MenuItem value="">All</MenuItem>
          <MenuItem value="true">Published</MenuItem>
          <MenuItem value="false">Not published</MenuItem>
        </TextField>
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
      </Stack>

      <QueryBoundary loading={loading && !data} error={error} onRetry={reload}>
        <DataTable
          columns={columns}
          rows={data?.items ?? []}
          getRowKey={(r) => r.id}
          loading={loading}
          emptyText="No reviews match these filters."
          onRowClick={(r) => setDetail(r)}
          pagination={{
            page: data?.page ?? 1,
            pageSize: data?.pageSize ?? 20,
            total: data?.total ?? 0,
            onPageChange: (p) => setParam('page', p),
            onPageSizeChange: (s) => setParam('pageSize', s),
          }}
        />
      </QueryBoundary>

      {/* row action menu */}
      <Menu
        anchorEl={menu?.anchor ?? null}
        open={Boolean(menu)}
        onClose={() => setMenu(null)}
      >
        {menu?.row.status !== 'APPROVED' && (
          <MenuItem
            onClick={() =>
              run(menu!.row.id, () => reviewsApi.approve(menu!.row.id), 'Review approved')
            }
          >
            <ListItemIcon>
              <CheckCircleRoundedIcon fontSize="small" />
            </ListItemIcon>
            Approve
          </MenuItem>
        )}
        {menu?.row.status !== 'REJECTED' && (
          <MenuItem
            onClick={() =>
              run(menu!.row.id, () => reviewsApi.reject(menu!.row.id), 'Review rejected')
            }
          >
            <ListItemIcon>
              <CancelRoundedIcon fontSize="small" />
            </ListItemIcon>
            Reject
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
        {menu?.row.isPublished && (
          <MenuItem
            onClick={() =>
              run(
                menu!.row.id,
                () => reviewsApi.unpublish(menu!.row.id),
                'Review unpublished',
              )
            }
          >
            <ListItemIcon>
              <VisibilityOffRoundedIcon fontSize="small" />
            </ListItemIcon>
            Unpublish
          </MenuItem>
        )}
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

      {/* detail dialog */}
      <Dialog open={Boolean(detail)} onClose={() => setDetail(null)} maxWidth="sm" fullWidth>
        {detail && (
          <>
            <DialogTitle>
              {detail.name}
              {detail.role ? ` · ${detail.role}` : ''}
            </DialogTitle>
            <DialogContent>
              <Rating value={detail.rating} readOnly sx={{ mb: 1 }} />
              <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                {detail.comment}
              </Typography>
              <Stack direction="row" spacing={1} sx={{ mt: 2, flexWrap: 'wrap' }}>
                <Chip size="small" label={detail.status} color={STATUS_COLOR[detail.status]} />
                {detail.isPublished && <Chip size="small" variant="outlined" label="Published" />}
                {detail.isFeatured && (
                  <Chip size="small" variant="outlined" color="primary" label="Featured" />
                )}
                <Chip size="small" variant="outlined" label={detail.source} />
              </Stack>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1.5 }}>
                Submitted {fmtDate(detail.createdAt)}
              </Typography>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDetail(null)}>Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>

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
          toast.success('Review added');
        }}
      />
    </Box>
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
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [rating, setRating] = useState<number | null>(5);
  const [comment, setComment] = useState('');
  const [approve, setApprove] = useState(true);
  const [feature, setFeature] = useState(false);
  const [saving, setSaving] = useState(false);

  const valid = name.trim().length >= 2 && comment.trim().length >= 4 && !!rating;

  async function submit() {
    if (!valid) return;
    setSaving(true);
    try {
      await reviewsApi.create({
        name: name.trim(),
        role: role.trim() || undefined,
        rating: rating!,
        comment: comment.trim(),
        approve,
        feature,
      });
      onCreated();
    } catch (err) {
      toast.error(
        err instanceof AdminApiError ? err.messages[0] : 'Could not add review',
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <DialogTitle>Add a review</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 0.5 }}>
          <Typography variant="body2" color="text.secondary">
            Use this to bring in a review from Google, Facebook or in person.
          </Typography>
          <TextField
            label="Guest name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            fullWidth
          />
          <TextField
            label="Label (optional)"
            placeholder="Anniversary dinner"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            fullWidth
          />
          <Box>
            <Typography variant="caption" color="text.secondary">
              Rating
            </Typography>
            <Rating value={rating} onChange={(_, v) => setRating(v)} />
          </Box>
          <TextField
            label="Comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            required
            multiline
            minRows={3}
            fullWidth
          />
          <Stack direction="row" spacing={2}>
            <FormControlLabel
              control={
                <Checkbox checked={approve} onChange={(e) => setApprove(e.target.checked)} />
              }
              label="Approve & publish now"
            />
            <FormControlLabel
              control={
                <Checkbox checked={feature} onChange={(e) => setFeature(e.target.checked)} />
              }
              label="Feature on homepage"
            />
          </Stack>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={saving}>
          Cancel
        </Button>
        <Button variant="contained" onClick={submit} disabled={!valid || saving}>
          {saving ? 'Adding…' : 'Add review'}
        </Button>
      </DialogActions>
    </>
  );
}
