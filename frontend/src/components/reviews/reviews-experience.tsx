'use client';

import { useState } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Divider,
  IconButton,
  MenuItem,
  Rating,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import RateReviewRoundedIcon from '@mui/icons-material/RateReviewRounded';
import { alpha } from '@mui/material/styles';

import {
  getPublishedReviews,
  submitReview,
  uploadReviewPhoto,
  type PublicReview,
  type PublicReviewPage,
  type PublicReviewSort,
  type PublicReviewStats,
  type ReviewPhoto,
} from '@/lib/api/reviews';
import AddAPhotoRoundedIcon from '@mui/icons-material/AddAPhotoRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import type { PageHeaderContent } from '@/lib/api/page-headers';

const schema = yup.object({
  name: yup
    .string()
    .trim()
    .required('Your name is required')
    .min(2, 'Please enter your name')
    .max(80, 'That name is too long'),
  role: yup.string().trim().max(80, 'Keep this short').optional(),
  comment: yup
    .string()
    .trim()
    .required('Please write a few words')
    .min(4, 'Please write a little more')
    .max(1500, 'That review is a bit long'),
});

type FormValues = yup.InferType<typeof schema>;

const SORT_OPTIONS: { value: PublicReviewSort; label: string }[] = [
  { value: 'recent', label: 'Most recent' },
  { value: 'highest', label: 'Highest rated' },
  { value: 'lowest', label: 'Lowest rated' },
];

const STAR_ROWS = [5, 4, 3, 2, 1] as const;

const OCCASION_PRESETS = [
  'Anniversary',
  'Birthday',
  'Wedding',
  'Family Dinner',
  'Lunch',
  'Dinner',
] as const;
const OCCASION_OTHER = 'Other';

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

function RatingSummary({ stats }: { stats: PublicReviewStats }) {
  if (stats.total === 0) return null;

  return (
    <Card variant="outlined" sx={{ mb: { xs: 4, md: 5 } }}>
      <CardContent sx={{ p: { xs: 2.5, sm: 3.5 } }}>
        <Box
          sx={{
            display: 'grid',
            gap: { xs: 3, sm: 4 },
            gridTemplateColumns: { xs: '1fr', sm: 'auto 1fr' },
            alignItems: 'center',
          }}
        >
          <Box sx={{ textAlign: { xs: 'center', sm: 'left' } }}>
            <Typography variant="h2" sx={{ fontWeight: 800, lineHeight: 1 }}>
              {stats.average.toFixed(1)}
            </Typography>
            <Rating
              value={stats.average}
              precision={0.1}
              readOnly
              size="small"
              sx={{ my: 0.75, justifyContent: { xs: 'center', sm: 'flex-start' }, display: 'flex' }}
            />
            <Typography variant="body2" color="text.secondary">
              {stats.total} review{stats.total === 1 ? '' : 's'}
            </Typography>
          </Box>

          <Stack spacing={0.85}>
            {STAR_ROWS.map((star) => {
              const count = stats.breakdown[star] ?? 0;
              const pct = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;
              return (
                <Stack key={star} direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ width: 48, flexShrink: 0 }}
                  >
                    {star} star
                  </Typography>
                  <Box
                    sx={{
                      flexGrow: 1,
                      height: 8,
                      borderRadius: 999,
                      bgcolor: 'action.hover',
                      overflow: 'hidden',
                    }}
                  >
                    <Box
                      sx={{
                        width: `${pct}%`,
                        height: '100%',
                        borderRadius: 999,
                        bgcolor: 'secondary.main',
                      }}
                    />
                  </Box>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ width: 38, textAlign: 'right', flexShrink: 0 }}
                  >
                    {pct}%
                  </Typography>
                </Stack>
              );
            })}
          </Stack>
        </Box>
      </CardContent>
    </Card>
  );
}

function ReviewCard({ review }: { review: PublicReview }) {
  const initial = review.name.trim().charAt(0).toUpperCase() || '?';
  return (
    <Card variant="outlined" sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
        <Stack
          direction="row"
          spacing={1.5}
          sx={{ alignItems: 'flex-start', justifyContent: 'space-between', mb: 1.25 }}
        >
          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', minWidth: 0 }}>
            <Avatar sx={{ bgcolor: 'primary.main', width: 40, height: 40, fontWeight: 700 }}>
              {initial}
            </Avatar>
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="subtitle2" noWrap>
                {review.name}
              </Typography>
              <Typography variant="caption" color="text.secondary" noWrap>
                {timeAgo(review.createdAt)}
              </Typography>
            </Box>
          </Stack>
          <Rating value={review.rating} readOnly size="small" sx={{ flexShrink: 0, mt: 0.5 }} />
        </Stack>

        {review.role && (
          <Box
            component="span"
            sx={{
              alignSelf: 'flex-start',
              mb: 1.25,
              px: 1.1,
              py: 0.3,
              borderRadius: 999,
              typography: 'caption',
              fontWeight: 700,
              bgcolor: (t) => alpha(t.palette.secondary.main, 0.14),
              color: 'secondary.dark',
            }}
          >
            {review.role}
          </Box>
        )}

        <Typography variant="body2">{review.comment}</Typography>

        {review.photos.length > 0 && (
          <Stack direction="row" spacing={1} sx={{ mt: 1.5, flexWrap: 'wrap' }}>
            {review.photos.map((p) => (
              <Box
                key={p.id}
                sx={{
                  width: 64,
                  height: 64,
                  borderRadius: 1,
                  overflow: 'hidden',
                  border: '1px solid',
                  borderColor: 'divider',
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={p.url}
                  alt="Guest photo"
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
              </Box>
            ))}
          </Stack>
        )}

        {review.reply && (
          <Box
            sx={{
              mt: 1.75,
              pt: 1.25,
              borderTop: '1px solid',
              borderColor: 'divider',
            }}
          >
            <Typography variant="caption" sx={{ fontWeight: 700, color: 'primary.main' }}>
              Response from Harmony
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
              {review.reply}
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}

export default function ReviewsExperience({
  initial,
  initialStats,
  hero,
}: {
  initial: PublicReviewPage;
  initialStats: PublicReviewStats;
  /** Admin-managed hero copy. Falls back to the built-in default when omitted. */
  hero?: PageHeaderContent;
}) {
  const [stats] = useState(initialStats);
  const [roleFilter, setRoleFilter] = useState<string | null>(null);
  const [sort, setSort] = useState<PublicReviewSort>('recent');
  const [pages, setPages] = useState<PublicReview[]>(initial.items);
  const [page, setPage] = useState(initial.page);
  const [pageCount, setPageCount] = useState(initial.pageCount);
  const [filtering, setFiltering] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [rating, setRating] = useState(0);
  const [ratingError, setRatingError] = useState<string | null>(null);
  const [customOccasion, setCustomOccasion] = useState('');
  const [photos, setPhotos] = useState<ReviewPhoto[]>([]);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);

  async function addPhoto(file: File | undefined) {
    if (!file || photos.length >= 3) return;
    setUploadingPhoto(true);
    setPhotoError(null);
    try {
      const photo = await uploadReviewPhoto(file);
      setPhotos((prev) => [...prev, photo]);
    } catch (err) {
      setPhotoError(err instanceof Error ? err.message : 'Could not upload that photo.');
    } finally {
      setUploadingPhoto(false);
    }
  }

  function removePhoto(id: string) {
    setPhotos((prev) => prev.filter((p) => p.id !== id));
  }

  const {
    register,
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: yupResolver(schema),
    defaultValues: { name: '', role: '', comment: '' },
  });

  const roleValue = useWatch({ control, name: 'role' });
  const isOtherOccasion = Boolean(roleValue) && !(OCCASION_PRESETS as readonly string[]).includes(roleValue ?? '');

  async function applyFilters(nextRole: string | null, nextSort: PublicReviewSort) {
    setFiltering(true);
    try {
      const res = await getPublishedReviews(1, initial.pageSize, {
        role: nextRole ?? undefined,
        sort: nextSort,
      });
      setPages(res.items);
      setPage(res.page);
      setPageCount(res.pageCount);
    } finally {
      setFiltering(false);
    }
  }

  function onSelectRole(role: string | null) {
    setRoleFilter(role);
    void applyFilters(role, sort);
  }

  function onSelectSort(next: PublicReviewSort) {
    setSort(next);
    void applyFilters(roleFilter, next);
  }

  async function loadMore() {
    setLoadingMore(true);
    try {
      const next = await getPublishedReviews(page + 1, initial.pageSize, {
        role: roleFilter ?? undefined,
        sort,
      });
      setPages((prev) => [...prev, ...next.items]);
      setPage(next.page);
      setPageCount(next.pageCount);
    } finally {
      setLoadingMore(false);
    }
  }

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    if (rating < 1) {
      setRatingError('Please choose a rating');
      return;
    }
    setRatingError(null);
    const res = await submitReview({
      name: values.name,
      rating,
      comment: values.comment,
      role: values.role || undefined,
      mediaIds: photos.map((p) => p.id),
    });
    if (res.ok && res.connected) {
      setSubmitted(true);
      reset();
      setRating(0);
      setCustomOccasion('');
      setPhotos([]);
    } else if (res.ok && !res.connected) {
      setFormError(
        'We could not reach the server. Please try again in a moment.',
      );
    } else {
      setFormError(res.error);
    }
  });

  return (
    <Box component="main" sx={{ py: { xs: 6, md: 10 } }}>
      <Container maxWidth="lg">
        <Stack spacing={1} sx={{ textAlign: 'center', mb: { xs: 4, md: 5 } }}>
          <Typography variant="overline" color="secondary.main">
            {hero?.eyebrow ?? 'Guest Stories'}
          </Typography>
          <Typography component="h1" variant="h2">
            {hero?.title ?? 'Moments that'}
            <Box component="span" sx={{ display: 'block', color: 'secondary.dark' }}>
              {hero?.accentTitle ?? 'stay with you.'}
            </Box>
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 620, mx: 'auto' }}>
            {hero?.description ?? "Every table has a story. Here's what guests are saying."}
          </Typography>
        </Stack>

        <RatingSummary stats={stats} />

        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={1.5}
          sx={{ mb: 3, alignItems: { sm: 'center' }, justifyContent: 'space-between' }}
        >
          {stats.topRoles.length > 0 && (
            <Stack direction="row" spacing={0.8} sx={{ flexWrap: 'wrap', gap: 0.8 }}>
              {[null, ...stats.topRoles].map((role) => {
                const active = roleFilter === role;
                return (
                  <Button
                    key={role ?? 'ALL'}
                    type="button"
                    onClick={() => onSelectRole(role)}
                    variant={active ? 'contained' : 'outlined'}
                    aria-pressed={active}
                    size="small"
                    sx={{
                      minHeight: 36,
                      px: 1.75,
                      borderRadius: 999,
                      ...(active
                        ? {}
                        : {
                            color: 'text.secondary',
                            borderColor: 'divider',
                            bgcolor: 'background.paper',
                            '&:hover': {
                              color: 'primary.main',
                              borderColor: 'primary.main',
                            },
                          }),
                    }}
                  >
                    {role ?? 'All'}
                  </Button>
                );
              })}
            </Stack>
          )}

          <Select
            value={sort}
            onChange={(e) => onSelectSort(e.target.value as PublicReviewSort)}
            size="small"
            sx={{ minWidth: 180, alignSelf: { xs: 'stretch', sm: 'auto' } }}
          >
            {SORT_OPTIONS.map((opt) => (
              <MenuItem key={opt.value} value={opt.value}>
                {opt.label}
              </MenuItem>
            ))}
          </Select>
        </Stack>

        {pages.length > 0 ? (
          <Box
            sx={{
              display: 'grid',
              gap: 2.5,
              opacity: filtering ? 0.6 : 1,
              transition: 'opacity 150ms ease',
              gridTemplateColumns: {
                xs: '1fr',
                sm: '1fr 1fr',
                md: '1fr 1fr 1fr',
              },
            }}
          >
            {pages.map((r) => (
              <ReviewCard key={r.id} review={r} />
            ))}
          </Box>
        ) : (
          <Typography color="text.secondary" sx={{ textAlign: 'center' }}>
            {roleFilter
              ? `No reviews yet for "${roleFilter}".`
              : 'No reviews have been published yet — be the first to share yours.'}
          </Typography>
        )}

        {page < pageCount && (
          <Box sx={{ textAlign: 'center', mt: 4 }}>
            <Button variant="outlined" onClick={loadMore} disabled={loadingMore}>
              {loadingMore ? 'Loading…' : 'Show more reviews'}
            </Button>
          </Box>
        )}

        <Divider sx={{ my: { xs: 6, md: 9 } }} />

        <Box sx={{ maxWidth: 720, mx: 'auto' }}>
          {submitted ? (
            <Alert severity="success" onClose={() => setSubmitted(false)}>
              Thank you! Your review has been received and will appear here after
              it is approved.
            </Alert>
          ) : !showForm ? (
            <Box
              sx={{
                textAlign: 'center',
                py: { xs: 5, md: 6 },
                px: 3,
                borderRadius: 4,
                border: '1px solid',
                borderColor: 'divider',
                bgcolor: (t) => alpha(t.palette.secondary.main, 0.05),
              }}
            >
              <Box
                sx={{
                  width: 52,
                  height: 52,
                  mx: 'auto',
                  mb: 2,
                  display: 'grid',
                  placeItems: 'center',
                  borderRadius: '50%',
                  bgcolor: (t) => alpha(t.palette.secondary.main, 0.16),
                  color: 'secondary.dark',
                }}
              >
                <RateReviewRoundedIcon />
              </Box>
              <Typography component="h2" variant="h4" sx={{ mb: 1 }}>
                Share your experience
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mb: 3, maxWidth: 420, mx: 'auto' }}
              >
                Tell other guests what made your visit memorable — it only takes a
                minute.
              </Typography>
              <Button
                variant="contained"
                size="large"
                startIcon={<RateReviewRoundedIcon />}
                onClick={() => setShowForm(true)}
              >
                Write a review
              </Button>
            </Box>
          ) : (
            <Box
              sx={{
                borderRadius: 4,
                border: '1px solid',
                borderColor: 'divider',
                bgcolor: 'background.paper',
                boxShadow: (t) => t.shadows[3],
                p: { xs: 3, sm: 4.5 },
              }}
            >
              <Stack direction="row" spacing={1.75} sx={{ alignItems: 'center', mb: 0.5 }}>
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    flexShrink: 0,
                    display: 'grid',
                    placeItems: 'center',
                    borderRadius: '50%',
                    bgcolor: (t) => alpha(t.palette.secondary.main, 0.16),
                    color: 'secondary.dark',
                  }}
                >
                  <RateReviewRoundedIcon fontSize="small" />
                </Box>
                <Typography component="h2" variant="h4">
                  Write a review
                </Typography>
              </Stack>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3.5, ml: { sm: 6.75 } }}>
                Your review will appear on the site once our team has approved it.
              </Typography>

              <form onSubmit={onSubmit} noValidate>
                <Stack spacing={3}>
                  {formError && <Alert severity="error">{formError}</Alert>}

                  <Box
                    sx={{
                      display: 'grid',
                      gap: 2.5,
                      gridTemplateColumns: { xs: '1fr', sm: '1.1fr 1fr' },
                    }}
                  >
                    <TextField
                      label="Your name"
                      fullWidth
                      required
                      error={Boolean(errors.name)}
                      helperText={errors.name?.message}
                      {...register('name')}
                    />

                    <Controller
                      name="role"
                      control={control}
                      render={({ field }) => {
                        const isPreset = (OCCASION_PRESETS as readonly string[]).includes(
                          field.value ?? '',
                        );
                        const selectValue = !field.value
                          ? ''
                          : isPreset
                            ? field.value
                            : OCCASION_OTHER;
                        return (
                          <TextField
                            select
                            label="Occasion (optional)"
                            fullWidth
                            value={selectValue}
                            error={Boolean(errors.role)}
                            helperText={errors.role?.message}
                            onChange={(e) => {
                              const v = e.target.value;
                              field.onChange(v === OCCASION_OTHER ? customOccasion : v);
                            }}
                          >
                            <MenuItem value="">None</MenuItem>
                            {OCCASION_PRESETS.map((p) => (
                              <MenuItem key={p} value={p}>{p}</MenuItem>
                            ))}
                            <MenuItem value={OCCASION_OTHER}>Other</MenuItem>
                          </TextField>
                        );
                      }}
                    />
                  </Box>

                  {isOtherOccasion && (
                    <TextField
                      label="Tell us the occasion"
                      fullWidth
                      value={customOccasion}
                      error={Boolean(errors.role)}
                      helperText={errors.role?.message}
                      onChange={(e) => {
                        setCustomOccasion(e.target.value);
                        setValue('role', e.target.value, { shouldValidate: true });
                      }}
                    />
                  )}

                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1.5,
                      flexWrap: 'wrap',
                      px: 2,
                      py: 1.5,
                      borderRadius: 2,
                      border: '1px solid',
                      borderColor: ratingError ? 'error.main' : 'divider',
                      bgcolor: (t) => alpha(t.palette.secondary.main, 0.05),
                    }}
                  >
                    <Typography component="span" variant="body2" sx={{ fontWeight: 600 }}>
                      Your rating *
                    </Typography>
                    <Rating
                      value={rating}
                      size="large"
                      onChange={(_, value) => {
                        setRating(value ?? 0);
                        if (value && value >= 1) setRatingError(null);
                      }}
                      sx={{
                        color: 'secondary.main',
                        '& .MuiRating-iconEmpty': { color: (t) => alpha(t.palette.secondary.main, 0.3) },
                      }}
                    />
                    {ratingError && (
                      <Typography variant="caption" color="error" sx={{ width: '100%' }}>
                        {ratingError}
                      </Typography>
                    )}
                  </Box>

                  <TextField
                    label="Your review"
                    fullWidth
                    required
                    multiline
                    minRows={4}
                    error={Boolean(errors.comment)}
                    helperText={errors.comment?.message}
                    {...register('comment')}
                  />

                  <Box>
                    <Typography variant="body2" sx={{ mb: 1.25, fontWeight: 600 }}>
                      Add a photo <Box component="span" sx={{ fontWeight: 400, color: 'text.secondary' }}>(optional, up to 3)</Box>
                    </Typography>
                    {photoError && (
                      <Alert severity="error" sx={{ mb: 1.5 }} onClose={() => setPhotoError(null)}>
                        {photoError}
                      </Alert>
                    )}
                    <Stack direction="row" spacing={1.5} sx={{ flexWrap: 'wrap' }}>
                      {photos.map((p) => (
                        <Box
                          key={p.id}
                          sx={{
                            position: 'relative',
                            width: 84,
                            height: 84,
                            borderRadius: 2,
                            overflow: 'hidden',
                            border: '1px solid',
                            borderColor: 'divider',
                          }}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={p.url}
                            alt="Review attachment"
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
                              width: 22,
                              height: 22,
                              '&:hover': { bgcolor: 'rgba(0,0,0,0.75)' },
                            }}
                          >
                            <CloseRoundedIcon sx={{ fontSize: 14 }} />
                          </IconButton>
                        </Box>
                      ))}
                      {photos.length < 3 && (
                        <Button
                          component="label"
                          disabled={uploadingPhoto}
                          startIcon={<AddAPhotoRoundedIcon />}
                          sx={{
                            width: 84,
                            height: 84,
                            flexDirection: 'column',
                            borderRadius: 2,
                            border: '1.5px dashed',
                            borderColor: (t) => alpha(t.palette.secondary.main, 0.5),
                            color: 'secondary.dark',
                            '&:hover': { bgcolor: (t) => alpha(t.palette.secondary.main, 0.08) },
                          }}
                        >
                          <Typography variant="caption" sx={{ fontWeight: 700 }}>
                            {uploadingPhoto ? 'Uploading…' : 'Add'}
                          </Typography>
                          <input
                            type="file"
                            hidden
                            accept="image/jpeg,image/png,image/webp,image/avif,image/gif"
                            onChange={(e) => {
                              void addPhoto(e.target.files?.[0]);
                              e.target.value = '';
                            }}
                          />
                        </Button>
                      )}
                    </Stack>
                  </Box>

                  <Stack
                    direction="row"
                    spacing={2.5}
                    sx={{ alignItems: 'center', pt: 1 }}
                  >
                    <Button
                      type="submit"
                      variant="contained"
                      size="large"
                      disabled={isSubmitting}
                      sx={{ px: 4 }}
                    >
                      {isSubmitting ? 'Submitting…' : 'Submit review'}
                    </Button>
                    <Button
                      type="button"
                      size="large"
                      color="inherit"
                      disabled={isSubmitting}
                      onClick={() => setShowForm(false)}
                      sx={{ color: 'text.secondary' }}
                    >
                      Cancel
                    </Button>
                  </Stack>
                </Stack>
              </form>
            </Box>
          )}
        </Box>
      </Container>
    </Box>
  );
}
