'use client';

import Link from 'next/link';

import {
  Box,
  Card,
  CardContent,
  Divider,
  Grid,
  Rating,
  Stack,
  Typography,
} from '@mui/material';
import EventSeatRoundedIcon from '@mui/icons-material/EventSeatRounded';
import CelebrationRoundedIcon from '@mui/icons-material/CelebrationRounded';
import RateReviewRoundedIcon from '@mui/icons-material/RateReviewRounded';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import NotificationsRoundedIcon from '@mui/icons-material/NotificationsRounded';

import { PageHeader, QueryBoundary, StatCard } from '@/components/admin/ui';
import { Donut, BarList } from '@/components/admin/charts';
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

const RES_STATUS_COLORS: Record<string, string> = {
  PENDING: '#ed6c02',
  CONFIRMED: '#2e7d32',
  COMPLETED: '#0288d1',
  REJECTED: '#d32f2f',
  CANCELLED: '#9e9e9e',
};

function Panel({
  title,
  action,
  children,
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Stack
          direction="row"
          sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 2 }}
        >
          <Typography variant="h6">{title}</Typography>
          {action}
        </Stack>
        {children}
      </CardContent>
    </Card>
  );
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
          <Stack spacing={3}>
            {/* ---- Overview ---- */}
            <Box
              sx={{
                p: { xs: 2, sm: 2.5 },
                borderRadius: 3,
                bgcolor: 'action.hover',
              }}
            >
              <Typography variant="h6" sx={{ mb: 2 }}>
                Overview
              </Typography>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6, lg: 2.4 }}>
                  <StatCard
                    label="Reservations pending"
                    value={data.reservations.pending}
                    filled
                    color="primary"
                    icon={EventSeatRoundedIcon}
                    trend={{
                      dir: data.reservations.last7Days > 0 ? 'up' : 'flat',
                      text: `${data.reservations.last7Days} new this week`,
                    }}
                    hint={`${data.reservations.today} today · ${data.reservations.upcoming} upcoming`}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, lg: 2.4 }}>
                  <StatCard
                    label="Open enquiries"
                    value={data.enquiries.open}
                    color="info"
                    icon={CelebrationRoundedIcon}
                    emphasis={data.enquiries.open > 0}
                    hint={`${data.enquiries.upcoming} upcoming`}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, lg: 2.4 }}>
                  <StatCard
                    label="Reviews to moderate"
                    value={data.reviews.pendingModeration}
                    color="secondary"
                    icon={RateReviewRoundedIcon}
                    emphasis={data.reviews.pendingModeration > 0}
                    hint={`${data.reviews.published} published`}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, lg: 2.4 }}>
                  <StatCard
                    label="Avg. rating"
                    value={data.reviews.averageRating ?? '—'}
                    color="success"
                    icon={StarRoundedIcon}
                    hint={`${data.reviews.featured} featured on home`}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, lg: 2.4 }}>
                  <StatCard
                    label="Unread notifications"
                    value={data.notifications.unread}
                    color="warning"
                    icon={NotificationsRoundedIcon}
                    emphasis={data.notifications.unread > 0}
                    hint={`${data.activity.auditLast24h} admin actions / 24h`}
                  />
                </Grid>
              </Grid>
            </Box>

            {/* ---- charts row ---- */}
            <Grid container spacing={2.5}>
              <Grid size={{ xs: 12, md: 4 }}>
                <Panel title="New activity — 30 days">
                  <BarList
                    bars={[
                      {
                        label: 'Reservations',
                        value: data.reservations.last30Days,
                        color: '#2e7d32',
                      },
                      {
                        label: 'Event enquiries',
                        value: data.enquiries.last30Days,
                        color: '#0288d1',
                      },
                      {
                        label: 'Reviews',
                        value: data.reviews.last30Days,
                        color: '#9c27b0',
                      },
                    ]}
                  />
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: 'block', mt: 2 }}
                  >
                    {data.reservations.last7Days +
                      data.enquiries.last7Days +
                      data.reviews.last7Days}{' '}
                    in the last 7 days
                  </Typography>
                </Panel>
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <Panel title="Reservations by status">
                  <Donut
                    centerLabel={String(
                      Object.values(data.reservations.byStatus).reduce(
                        (a, b) => a + b,
                        0,
                      ),
                    )}
                    centerSub="total"
                    segments={Object.entries(data.reservations.byStatus)
                      .filter(([, v]) => v > 0)
                      .map(([k, v]) => ({
                        label: k,
                        value: v,
                        color: RES_STATUS_COLORS[k] ?? '#9e9e9e',
                      }))}
                  />
                </Panel>
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <Panel
                  title="Ratings & reviews"
                  action={
                    <Typography
                      variant="caption"
                      component={Link}
                      href="/admin/reviews"
                      sx={{ color: 'primary.main', fontWeight: 700 }}
                    >
                      Manage
                    </Typography>
                  }
                >
                  <Stack spacing={2}>
                    <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                      <Rating
                        value={data.reviews.averageRating ?? 0}
                        precision={0.1}
                        readOnly
                      />
                      <Typography sx={{ fontWeight: 800, fontSize: '1.3rem' }}>
                        {data.reviews.averageRating ?? '—'}
                      </Typography>
                    </Stack>
                    <Divider />
                    <Stack direction="row" spacing={2}>
                      <MiniStat label="Published" value={data.reviews.published} />
                      <MiniStat label="Featured" value={data.reviews.featured} />
                      <MiniStat
                        label="Pending"
                        value={data.reviews.pendingModeration}
                      />
                    </Stack>
                  </Stack>
                </Panel>
              </Grid>
            </Grid>

            {/* ---- tables row ---- */}
            <Grid container spacing={2.5}>
              <Grid size={{ xs: 12, md: 7 }}>
                <Panel
                  title="Recent activity"
                  action={
                    <Typography
                      variant="caption"
                      component={Link}
                      href="/admin/audit"
                      sx={{ color: 'primary.main', fontWeight: 700 }}
                    >
                      View audit log
                    </Typography>
                  }
                >
                  {data.activity.recentAudit.length === 0 ? (
                    <Typography variant="body2" color="text.secondary">
                      No recorded activity yet.
                    </Typography>
                  ) : (
                    <Stack divider={<Divider />} spacing={0}>
                      {data.activity.recentAudit.map((a) => (
                        <Stack
                          key={a.id}
                          direction="row"
                          spacing={2}
                          sx={{ py: 1, alignItems: 'center' }}
                        >
                          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                            <Typography
                              variant="body2"
                              sx={{ fontFamily: 'monospace', fontWeight: 600 }}
                              noWrap
                            >
                              {a.action}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" noWrap>
                              {a.entityType}
                              {a.entityId ? ` · ${a.entityId}` : ''} —{' '}
                              {a.actorEmail ?? 'system'}
                            </Typography>
                          </Box>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ flexShrink: 0 }}
                          >
                            {timeAgo(a.createdAt)}
                          </Typography>
                        </Stack>
                      ))}
                    </Stack>
                  )}
                </Panel>
              </Grid>

              <Grid size={{ xs: 12, md: 5 }}>
                <Panel title="Content library">
                  <Stack spacing={2}>
                    <ContentBar
                      label="Menu items"
                      done={data.content.menuItems.published}
                      total={data.content.menuItems.total}
                      doneLabel="published"
                    />
                    <ContentBar
                      label="Menu categories"
                      done={data.content.menuCategories.published}
                      total={data.content.menuCategories.total}
                      doneLabel="published"
                    />
                    <ContentBar
                      label="Gallery photos"
                      done={data.content.galleryItems.published}
                      total={data.content.galleryItems.total}
                      doneLabel="published"
                    />
                    <ContentBar
                      label="Events"
                      done={data.content.events.upcoming}
                      total={data.content.events.total}
                      doneLabel="upcoming"
                    />
                  </Stack>
                </Panel>
              </Grid>
            </Grid>
          </Stack>
        )}
      </QueryBoundary>
    </Box>
  );
}

function MiniStat({ label, value }: { label: string; value: number }) {
  return (
    <Box>
      <Typography sx={{ fontWeight: 800, fontSize: '1.25rem', lineHeight: 1 }}>
        {value}
      </Typography>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
    </Box>
  );
}

function ContentBar({
  label,
  done,
  total,
  doneLabel,
}: {
  label: string;
  done: number;
  total: number;
  doneLabel: string;
}) {
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  return (
    <Box>
      <Stack direction="row" sx={{ justifyContent: 'space-between', mb: 0.5 }}>
        <Typography variant="body2">{label}</Typography>
        <Typography variant="body2" color="text.secondary">
          <Box component="span" sx={{ fontWeight: 700, color: 'text.primary' }}>
            {done}
          </Box>{' '}
          {doneLabel} · {total} total
        </Typography>
      </Stack>
      <Box sx={{ height: 8, borderRadius: 5, bgcolor: 'action.hover', overflow: 'hidden' }}>
        <Box
          sx={{
            height: '100%',
            width: `${pct}%`,
            borderRadius: 5,
            bgcolor: 'primary.main',
          }}
        />
      </Box>
    </Box>
  );
}
