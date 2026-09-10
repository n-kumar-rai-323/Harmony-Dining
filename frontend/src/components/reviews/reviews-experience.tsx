'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Divider,
  Rating,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import FormatQuoteRoundedIcon from '@mui/icons-material/FormatQuoteRounded';

import {
  getPublishedReviews,
  submitReview,
  type PublicReview,
  type PublicReviewPage,
} from '@/lib/api/reviews';

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

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
  });
}

function ReviewCard({ review }: { review: PublicReview }) {
  return (
    <Card variant="outlined" sx={{ height: '100%' }}>
      <CardContent>
        <FormatQuoteRoundedIcon color="disabled" />
        <Rating value={review.rating} readOnly size="small" sx={{ display: 'block', mb: 1 }} />
        <Typography variant="body1" sx={{ mb: 2 }}>
          {review.comment}
        </Typography>
        <Typography variant="subtitle2">{review.name}</Typography>
        <Typography variant="caption" color="text.secondary">
          {review.role ? `${review.role} · ` : ''}
          {formatDate(review.createdAt)}
        </Typography>
      </CardContent>
    </Card>
  );
}

export default function ReviewsExperience({
  initial,
}: {
  initial: PublicReviewPage;
}) {
  const [pages, setPages] = useState<PublicReview[]>(initial.items);
  const [page, setPage] = useState(initial.page);
  const [pageCount, setPageCount] = useState(initial.pageCount);
  const [loadingMore, setLoadingMore] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [rating, setRating] = useState(0);
  const [ratingError, setRatingError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: yupResolver(schema),
    defaultValues: { name: '', role: '', comment: '' },
  });

  async function loadMore() {
    setLoadingMore(true);
    try {
      const next = await getPublishedReviews(page + 1, initial.pageSize);
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
    });
    if (res.ok && res.connected) {
      setSubmitted(true);
      reset();
      setRating(0);
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
        <Stack spacing={1} sx={{ textAlign: 'center', mb: { xs: 5, md: 7 } }}>
          <Typography variant="overline" color="secondary.main">
            Guest Stories
          </Typography>
          <Typography component="h1" variant="h2">
            Reviews from our guests
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 620, mx: 'auto' }}>
            Real experiences shared by people who have dined and celebrated with
            us at Harmony.
          </Typography>
        </Stack>

        {pages.length > 0 ? (
          <Box
            sx={{
              display: 'grid',
              gap: 2.5,
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
            No reviews have been published yet — be the first to share yours.
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

        <Box sx={{ maxWidth: 640, mx: 'auto' }}>
          <Typography component="h2" variant="h4" sx={{ mb: 1 }}>
            Write a review
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Your review will appear on the site once our team has approved it.
          </Typography>

          {submitted ? (
            <Alert severity="success" onClose={() => setSubmitted(false)}>
              Thank you! Your review has been received and will appear here after
              it is approved.
            </Alert>
          ) : (
            <form onSubmit={onSubmit} noValidate>
              <Stack spacing={2.5}>
                {formError && <Alert severity="error">{formError}</Alert>}

                <TextField
                  label="Your name"
                  fullWidth
                  required
                  error={Boolean(errors.name)}
                  helperText={errors.name?.message}
                  {...register('name')}
                />

                <TextField
                  label="Occasion (optional)"
                  placeholder="Anniversary dinner, family lunch…"
                  fullWidth
                  error={Boolean(errors.role)}
                  helperText={errors.role?.message}
                  {...register('role')}
                />

                <Box>
                  <Typography component="span" variant="body2" sx={{ mr: 1 }}>
                    Your rating *
                  </Typography>
                  <Rating
                    value={rating}
                    onChange={(_, value) => {
                      setRating(value ?? 0);
                      if (value && value >= 1) setRatingError(null);
                    }}
                  />
                  {ratingError && (
                    <Typography variant="caption" color="error" sx={{ display: 'block' }}>
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

                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={isSubmitting}
                  sx={{ alignSelf: 'flex-start' }}
                >
                  {isSubmitting ? 'Submitting…' : 'Submit review'}
                </Button>
              </Stack>
            </form>
          )}
        </Box>
      </Container>
    </Box>
  );
}
