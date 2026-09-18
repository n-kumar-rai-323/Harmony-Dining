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
import { alpha } from '@mui/material/styles';
import EventSeatRoundedIcon from '@mui/icons-material/EventSeatRounded';
import CelebrationRoundedIcon from '@mui/icons-material/CelebrationRounded';
import RateReviewRoundedIcon from '@mui/icons-material/RateReviewRounded';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import NotificationsRoundedIcon from '@mui/icons-material/NotificationsRounded';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import EventRoundedIcon from '@mui/icons-material/EventRounded';
import PeopleAltRoundedIcon from '@mui/icons-material/PeopleAltRounded';
import RestaurantRoundedIcon from '@mui/icons-material/RestaurantRounded';
import ImageRoundedIcon from '@mui/icons-material/ImageRounded';
import type { SvgIconComponent } from '@mui/icons-material';

import { PageHeader, QueryBoundary } from '@/components/admin/ui';
import { Donut } from '@/components/admin/charts';
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

/** "Sabina Rai" -> "Sabina R." */
function firstNameLastInitial(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length < 2) return name;
  return `${parts[0]} ${parts[parts.length - 1].charAt(0)}.`;
}

function formatHours(hours: number): string {
  if (hours < 1) return 'just now';
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'}`;
  const days = Math.round(hours / 24);
  return `${days} day${days === 1 ? '' : 's'}`;
}

const FEED_META: Record<
  DashboardSummary['activity']['feed'][number]['kind'],
  { icon: SvgIconComponent; color: string }
> = {
  reservation: { icon: PeopleAltRoundedIcon, color: 'success' },
  enquiry: { icon: CelebrationRoundedIcon, color: 'warning' },
  review: { icon: RateReviewRoundedIcon, color: 'secondary' },
  menu: { icon: RestaurantRoundedIcon, color: 'error' },
  gallery: { icon: ImageRoundedIcon, color: 'info' },
};

function dayLabel(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const startOfDay = (x: Date) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
  const diffDays = Math.round((startOfDay(now) - startOfDay(d)) / 86400000);
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function clockTime(iso: string): string {
  return new Date(iso).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
}

type AttentionColor = 'error' | 'warning' | 'secondary';

function AttentionCard({
  label,
  value,
  icon: Icon,
  hint,
  hintIcon: HintIcon,
  active,
  color,
}: {
  label: string;
  value: number;
  icon: SvgIconComponent;
  hint?: string;
  hintIcon?: SvgIconComponent;
  active: boolean;
  color: AttentionColor;
}) {
  return (
    <Card
      variant="outlined"
      sx={{
        height: '100%',
        borderColor: active ? `${color}.main` : 'divider',
        borderWidth: active ? 1.5 : 1,
      }}
    >
      <CardContent>
        <Stack direction="row" sx={{ alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <Typography variant="body2" color="text.secondary">
            {label}
          </Typography>
          <Icon sx={{ color: active ? `${color}.main` : 'text.disabled', opacity: 0.85 }} fontSize="small" />
        </Stack>
        <Typography sx={{ fontWeight: 800, fontSize: '2rem', lineHeight: 1.15, mt: 0.5 }}>
          {value}
        </Typography>
        {hint && (
          <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center', mt: 0.75 }}>
            {HintIcon && (
              <HintIcon sx={{ fontSize: 14, color: active ? `${color}.main` : 'text.secondary' }} />
            )}
            <Typography
              variant="caption"
              sx={{ color: active ? `${color}.main` : 'text.secondary', fontWeight: 600 }}
            >
              {hint}
            </Typography>
          </Stack>
        )}
      </CardContent>
    </Card>
  );
}

function ReferenceCard({
  label,
  value,
  trend,
  right,
}: {
  label: string;
  value: React.ReactNode;
  trend?: string;
  right?: React.ReactNode;
}) {
  return (
    <Card variant="outlined" sx={{ height: '100%', bgcolor: 'action.hover', borderColor: 'transparent' }}>
      <CardContent>
        <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="body2" color="text.secondary">
              {label}
            </Typography>
            <Stack direction="row" spacing={1} sx={{ alignItems: 'baseline', mt: 0.5 }}>
              <Typography sx={{ fontWeight: 800, fontSize: '1.9rem', lineHeight: 1 }}>
                {value}
              </Typography>
              {trend && (
                <Typography variant="caption" sx={{ color: 'success.main', fontWeight: 700 }}>
                  ↑ {trend}
                </Typography>
              )}
            </Stack>
          </Box>
          {right}
        </Stack>
      </CardContent>
    </Card>
  );
}

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
            <Box>
              <Typography
                variant="overline"
                color="text.secondary"
                sx={{ display: 'block', mb: 1.25, fontWeight: 700, letterSpacing: 1 }}
              >
                Needs your attention
              </Typography>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <AttentionCard
                    label="Reservations pending"
                    value={data.reservations.pending}
                    icon={EventSeatRoundedIcon}
                    active={data.reservations.pending > 0}
                    color="error"
                    hintIcon={AccessTimeRoundedIcon}
                    hint={
                      data.reservations.pending > 0 && data.reservations.oldestPendingHours !== null
                        ? `Oldest waiting ${formatHours(data.reservations.oldestPendingHours)}`
                        : 'All caught up'
                    }
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <AttentionCard
                    label="Open enquiries"
                    value={data.enquiries.open}
                    icon={CelebrationRoundedIcon}
                    active={data.enquiries.open > 0}
                    color="warning"
                    hintIcon={EventRoundedIcon}
                    hint={
                      data.enquiries.upcomingWithin7Days > 0
                        ? `${data.enquiries.upcomingWithin7Days} event${data.enquiries.upcomingWithin7Days === 1 ? '' : 's'} within 7 days`
                        : 'Nothing due this week'
                    }
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <AttentionCard
                    label="Reviews to moderate"
                    value={data.reviews.pendingModeration}
                    icon={RateReviewRoundedIcon}
                    active={data.reviews.pendingModeration > 0}
                    color="secondary"
                    hintIcon={StarRoundedIcon}
                    hint={
                      data.reviews.latestPending
                        ? `${data.reviews.latestPending.rating}-star, from ${firstNameLastInitial(data.reviews.latestPending.name)}`
                        : 'Nothing to review'
                    }
                  />
                </Grid>
              </Grid>

              <Typography
                variant="overline"
                color="text.secondary"
                sx={{ display: 'block', mt: 3, mb: 1.25, fontWeight: 700, letterSpacing: 1 }}
              >
                For reference
              </Typography>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <ReferenceCard
                    label="Avg. rating"
                    value={data.reviews.averageRating ?? '—'}
                    right={
                      <Rating value={data.reviews.averageRating ?? 0} precision={0.1} readOnly />
                    }
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <ReferenceCard
                    label="Admin activity"
                    value={
                      <>
                        {data.activity.auditLast24h}{' '}
                        <Typography component="span" variant="body2" color="text.secondary">
                          actions / 24h
                        </Typography>
                      </>
                    }
                    right={<NotificationsRoundedIcon sx={{ color: 'text.disabled' }} />}
                  />
                </Grid>
              </Grid>
            </Box>

            {/* ---- charts row ---- */}
            <Grid container spacing={2.5}>
              <Grid size={{ xs: 12, md: 4 }}>
                <Panel title="This week vs last week">
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: -1.5, mb: 2 }}>
                    Comparing the same 7-day window
                  </Typography>
                  <Stack spacing={2}>
                    <WeekCompareRow
                      label="Reservations"
                      value={data.reservations.last7Days}
                      previous={data.reservations.previous7Days}
                      barColor="#2e7d32"
                    />
                    <WeekCompareRow
                      label="Event enquiries"
                      value={data.enquiries.last7Days}
                      previous={data.enquiries.previous7Days}
                      barColor="#0288d1"
                    />
                    <WeekCompareRow
                      label="Reviews"
                      value={data.reviews.last7Days}
                      previous={data.reviews.previous7Days}
                      barColor="#9c27b0"
                    />
                  </Stack>
                </Panel>
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <Panel title="Reservations by status">
                  <Donut
                    centerLabel={String(data.reservations.pending)}
                    centerSub="pending"
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
                  title="Reviews"
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
                    <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center', mt: -1 }}>
                      <Typography variant="body2" color="text.secondary">
                        Avg. rating {data.reviews.averageRating ?? '—'}
                      </Typography>
                      <StarRoundedIcon sx={{ fontSize: 16, color: 'secondary.main' }} />
                    </Stack>

                    {data.reviews.pendingModeration > 0 && (
                      <Box
                        sx={{
                          p: 2,
                          borderRadius: 2,
                          bgcolor: (t) => alpha(t.palette.warning.main, 0.12),
                        }}
                      >
                        <Typography sx={{ fontWeight: 800, fontSize: '1.7rem', color: 'warning.dark', lineHeight: 1.1 }}>
                          {data.reviews.pendingModeration}
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'warning.dark' }}>
                          waiting for your approval
                        </Typography>
                      </Box>
                    )}

                    <Stack direction="row" spacing={3}>
                      <MiniStat label="published" value={data.reviews.published} />
                      <MiniStat label="featured on home" value={data.reviews.featured} />
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
                  {data.activity.feed.length === 0 ? (
                    <Typography variant="body2" color="text.secondary">
                      No recorded activity yet.
                    </Typography>
                  ) : (
                    (() => {
                      const groups: { label: string; items: typeof data.activity.feed }[] = [];
                      for (const item of data.activity.feed) {
                        const label = dayLabel(item.createdAt);
                        const last = groups[groups.length - 1];
                        if (last && last.label === label) last.items.push(item);
                        else groups.push({ label, items: [item] });
                      }
                      return (
                        <Stack spacing={2}>
                          {groups.map((group) => (
                            <Box key={group.label}>
                              <Typography
                                variant="overline"
                                color="text.secondary"
                                sx={{ display: 'block', mb: 0.5, fontWeight: 700 }}
                              >
                                {group.label}
                              </Typography>
                              <Stack divider={<Divider />} spacing={0}>
                                {group.items.map((item) => {
                                  const meta = FEED_META[item.kind];
                                  const Icon = meta.icon;
                                  return (
                                    <Stack
                                      key={item.id}
                                      direction="row"
                                      spacing={1.5}
                                      sx={{ py: 1.25, alignItems: 'flex-start' }}
                                    >
                                      <Box
                                        sx={{
                                          width: 34,
                                          height: 34,
                                          borderRadius: 1.5,
                                          display: 'grid',
                                          placeItems: 'center',
                                          flexShrink: 0,
                                          color: `${meta.color}.main`,
                                          bgcolor: (t) => alpha(t.palette[meta.color as 'success'].main, 0.14),
                                        }}
                                      >
                                        <Icon sx={{ fontSize: 18 }} />
                                      </Box>
                                      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                                        <Typography variant="body2" sx={{ fontWeight: 700 }}>
                                          {item.title}
                                        </Typography>
                                        {item.context && (
                                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                                            {item.context}
                                          </Typography>
                                        )}
                                      </Box>
                                      <Stack sx={{ flexShrink: 0, alignItems: 'flex-end' }}>
                                        <Typography variant="caption" color="text.secondary">
                                          {clockTime(item.createdAt)}
                                        </Typography>
                                        <Typography
                                          variant="caption"
                                          component={Link}
                                          href={item.actionHref}
                                          sx={{ color: 'primary.main', fontWeight: 700, mt: 0.25 }}
                                        >
                                          {item.actionLabel} →
                                        </Typography>
                                      </Stack>
                                    </Stack>
                                  );
                                })}
                              </Stack>
                            </Box>
                          ))}
                        </Stack>
                      );
                    })()
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

function WeekCompareRow({
  label,
  value,
  previous,
  barColor,
}: {
  label: string;
  value: number;
  previous: number;
  barColor: string;
}) {
  const delta = value - previous;
  const dir = delta > 0 ? 'up' : delta < 0 ? 'down' : 'flat';
  const deltaColor = dir === 'up' ? 'success.main' : dir === 'down' ? 'error.main' : 'text.secondary';
  const pct = value <= 0 ? 0 : Math.min(100, Math.round((value / Math.max(value, previous, 1)) * 100));

  return (
    <Box>
      <Stack direction="row" spacing={0.75} sx={{ alignItems: 'baseline' }}>
        <Typography variant="body2" sx={{ fontWeight: 700 }}>
          {label}
        </Typography>
        <Typography variant="body2" sx={{ fontWeight: 700 }}>
          {value}
        </Typography>
        {previous > 0 || value > 0 ? (
          <Typography variant="caption" sx={{ color: deltaColor, fontWeight: 700 }}>
            {dir === 'up' ? '↑' : dir === 'down' ? '↓' : '·'} {Math.abs(delta)} vs last week
          </Typography>
        ) : null}
      </Stack>
      <Box sx={{ height: 6, borderRadius: 4, bgcolor: 'action.hover', overflow: 'hidden', mt: 0.5 }}>
        <Box sx={{ height: '100%', width: `${pct}%`, borderRadius: 4, bgcolor: barColor }} />
      </Box>
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
