'use client';

import Link from 'next/link';

import {
  Box,
  Card,
  CardContent,
  Chip,
  Divider,
  Grid,
  List,
  ListItem,
  ListItemText,
  Stack,
  Typography,
} from '@mui/material';

import EventSeatRoundedIcon from '@mui/icons-material/EventSeatRounded';
import CelebrationRoundedIcon from '@mui/icons-material/CelebrationRounded';
import RateReviewRoundedIcon from '@mui/icons-material/RateReviewRounded';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded';
import HistoryRoundedIcon from '@mui/icons-material/HistoryRounded';

import { PageHeader, QueryBoundary, StatCard } from '@/components/admin/ui';
import { useAdminQuery } from '@/lib/admin/use-admin-query';
import {
  DASHBOARD_PATH,
  type DashboardSummary,
} from '@/lib/admin/resources/dashboard';

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.round(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.round(hrs / 24)}d ago`;
}

export default function AdminDashboardPage() {
  const { data, loading, error, reload } =
    useAdminQuery<DashboardSummary>(DASHBOARD_PATH);

  return (
    <Box>
      <PageHeader
        title="Dashboard"
        subtitle={
          data ? `Updated ${timeAgo(data.generatedAt)}` : 'Overview of activity'
        }
      />

      <QueryBoundary loading={loading} error={error} onRetry={reload}>
        {data && (
          <Stack spacing={4}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 6, md: 3 }}>
                <StatCard
                  label="Reservations pending"
                  value={data.reservations.pending}
                  hint={`${data.reservations.upcoming} upcoming · ${data.reservations.today} today`}
                  emphasis={data.reservations.pending > 0}
                  icon={EventSeatRoundedIcon}
                  color="warning"
                />
              </Grid>
              <Grid size={{ xs: 6, md: 3 }}>
                <StatCard
                  label="Open enquiries"
                  value={data.enquiries.open}
                  hint={`${data.enquiries.upcoming} upcoming`}
                  emphasis={data.enquiries.open > 0}
                  icon={CelebrationRoundedIcon}
                  color="info"
                />
              </Grid>
              <Grid size={{ xs: 6, md: 3 }}>
                <StatCard
                  label="Reviews to moderate"
                  value={data.reviews.pendingModeration}
                  hint={`${data.reviews.published} published · ${data.reviews.featured} featured`}
                  emphasis={data.reviews.pendingModeration > 0}
                  icon={RateReviewRoundedIcon}
                  color="secondary"
                />
              </Grid>
              <Grid size={{ xs: 6, md: 3 }}>
                <StatCard
                  label="Avg. review rating"
                  value={data.reviews.averageRating ?? '—'}
                  hint="approved & published"
                  icon={StarRoundedIcon}
                  color="success"
                />
              </Grid>
            </Grid>

            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 1.5 }}>
                Last 30 days
              </Typography>
              <Grid container spacing={2}>
                <Grid size={{ xs: 6, md: 3 }}>
                  <StatCard
                    label="New reservations"
                    value={data.reservations.last30Days}
                    hint={`${data.reservations.last7Days} in last 7d`}
                    icon={TrendingUpRoundedIcon}
                  />
                </Grid>
                <Grid size={{ xs: 6, md: 3 }}>
                  <StatCard
                    label="New enquiries"
                    value={data.enquiries.last30Days}
                    hint={`${data.enquiries.last7Days} in last 7d`}
                    icon={TrendingUpRoundedIcon}
                  />
                </Grid>
                <Grid size={{ xs: 6, md: 3 }}>
                  <StatCard
                    label="New reviews"
                    value={data.reviews.last30Days}
                    hint={`${data.reviews.last7Days} in last 7d`}
                    icon={TrendingUpRoundedIcon}
                  />
                </Grid>
                <Grid size={{ xs: 6, md: 3 }}>
                  <StatCard
                    label="Admin actions (24h)"
                    value={data.activity.auditLast24h}
                    hint={`${data.notifications.unread} unread notifications`}
                    icon={HistoryRoundedIcon}
                    color="info"
                  />
                </Grid>
              </Grid>
            </Box>

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 6 }}>
                <Card variant="outlined" sx={{ height: '100%' }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                      Content
                    </Typography>
                    <Stack spacing={1}>
                      <ContentRow
                        label="Menu items"
                        total={data.content.menuItems.total}
                        published={data.content.menuItems.published}
                      />
                      <ContentRow
                        label="Menu categories"
                        total={data.content.menuCategories.total}
                        published={data.content.menuCategories.published}
                      />
                      <ContentRow
                        label="Gallery items"
                        total={data.content.galleryItems.total}
                        published={data.content.galleryItems.published}
                      />
                      <ContentRow
                        label="Events"
                        total={data.content.events.total}
                        published={data.content.events.upcoming}
                        publishedLabel="upcoming"
                      />
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <Card variant="outlined" sx={{ height: '100%' }}>
                  <CardContent>
                    <Stack
                      direction="row"
                      sx={{
                        mb: 1,
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <Typography variant="h6" sx={{ fontWeight: 700 }}>
                        Recent activity
                      </Typography>
                      <Typography
                        variant="caption"
                        component={Link}
                        href="/admin/audit"
                        sx={{ color: 'primary.main' }}
                      >
                        View audit log
                      </Typography>
                    </Stack>
                    {data.activity.recentAudit.length === 0 ? (
                      <Typography variant="body2" color="text.secondary">
                        No recorded activity yet.
                      </Typography>
                    ) : (
                      <List dense disablePadding>
                        {data.activity.recentAudit.map((a, i) => (
                          <Box key={a.id}>
                            {i > 0 && <Divider component="li" />}
                            <ListItem disableGutters>
                              <ListItemText
                                primary={a.action}
                                secondary={`${a.entityType}${
                                  a.entityId ? ` · ${a.entityId}` : ''
                                } — ${a.actorEmail ?? 'system'}`}
                              />
                              <Typography variant="caption" color="text.secondary">
                                {timeAgo(a.createdAt)}
                              </Typography>
                            </ListItem>
                          </Box>
                        ))}
                      </List>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Stack>
        )}
      </QueryBoundary>
    </Box>
  );
}

function ContentRow({
  label,
  total,
  published,
  publishedLabel = 'published',
}: {
  label: string;
  total: number;
  published: number;
  publishedLabel?: string;
}) {
  return (
    <Stack
      direction="row"
      sx={{ justifyContent: 'space-between', alignItems: 'center' }}
    >
      <Typography variant="body2">{label}</Typography>
      <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
        <Chip
          size="small"
          variant="outlined"
          label={`${published} ${publishedLabel}`}
        />
        <Typography variant="body2" color="text.secondary">
          {total} total
        </Typography>
      </Stack>
    </Stack>
  );
}
