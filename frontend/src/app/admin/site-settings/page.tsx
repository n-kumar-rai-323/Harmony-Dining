'use client';

import { useState } from 'react';

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  IconButton,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';

import { PageHeader, QueryBoundary } from '@/components/admin/ui';
import { useToast } from '@/components/admin/toast';
import { useAdminQuery } from '@/lib/admin/use-admin-query';
import { useAdminAuth } from '@/lib/admin/auth-context';
import { AdminApiError } from '@/lib/admin/api';
import {
  siteSettingsApi,
  SITE_SETTINGS_PATH,
  SOCIAL_PLATFORMS,
  type SiteSettingsAdminView,
  type Business,
  type HoursEntry,
  type SocialLink,
} from '@/lib/admin/resources/site-settings';

export default function AdminSiteSettingsPage() {
  const { hasPermission } = useAdminAuth();
  const canManage = hasPermission('settings.manage');
  const { data, loading, error, reload } =
    useAdminQuery<SiteSettingsAdminView>(SITE_SETTINGS_PATH);

  return (
    <Box>
      <PageHeader
        title="Site settings"
        subtitle="Business details, opening hours and social links used across the public site."
      />
      <QueryBoundary loading={loading && !data} error={error} onRetry={reload}>
        {data && (
          <Stack spacing={3} sx={{ maxWidth: 720 }}>
            <BusinessCard
              key={data.business.updatedAt ?? 'b'}
              initial={data.business.value}
              canManage={canManage}
              onSaved={reload}
            />
            <HoursCard
              key={data.hours.updatedAt ?? 'h'}
              initial={data.hours.value}
              canManage={canManage}
              onSaved={reload}
            />
            <SocialCard
              key={data.social.updatedAt ?? 's'}
              initial={data.social.value}
              canManage={canManage}
              onSaved={reload}
            />
          </Stack>
        )}
      </QueryBoundary>
    </Box>
  );
}

function useSaver(onSaved: () => void) {
  const toast = useToast();
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  async function run(fn: () => Promise<unknown>, label: string) {
    setSaving(true);
    setErrors([]);
    try {
      await fn();
      toast.success(`${label} saved`);
      onSaved();
    } catch (err) {
      if (err instanceof AdminApiError) {
        setErrors(err.messages);
        toast.error('Could not save — see the errors below');
      } else {
        toast.error('Could not save');
      }
    } finally {
      setSaving(false);
    }
  }
  return { saving, errors, run };
}

function ErrorList({ errors }: { errors: string[] }) {
  if (errors.length === 0) return null;
  return (
    <Alert severity="error">
      <Box component="ul" sx={{ m: 0, pl: 2 }}>
        {errors.map((m, i) => (
          <li key={i}>
            <Typography variant="caption">{m}</Typography>
          </li>
        ))}
      </Box>
    </Alert>
  );
}

function SectionCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Card variant="outlined">
      <CardContent>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
          {title}
        </Typography>
        {children}
      </CardContent>
    </Card>
  );
}

/* -------------------------------------------------------------- business */

function BusinessCard({
  initial,
  canManage,
  onSaved,
}: {
  initial: Business;
  canManage: boolean;
  onSaved: () => void;
}) {
  const [form, setForm] = useState<Business>(initial);
  const { saving, errors, run } = useSaver(onSaved);

  function set<K extends keyof Business>(key: K, value: Business[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  return (
    <SectionCard title="Business">
      <Stack spacing={2}>
        <ErrorList errors={errors} />
        <TextField
          label="Name"
          value={form.name}
          onChange={(e) => set('name', e.target.value)}
          disabled={!canManage}
          fullWidth
          size="small"
        />
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <TextField
            label="Phone"
            value={form.phone}
            onChange={(e) => set('phone', e.target.value)}
            disabled={!canManage}
            fullWidth
            size="small"
          />
          <TextField
            label="Email"
            value={form.email}
            onChange={(e) => set('email', e.target.value)}
            disabled={!canManage}
            fullWidth
            size="small"
          />
        </Stack>

        <Box>
          <Typography variant="caption" color="text.secondary">
            Address lines
          </Typography>
          <Stack spacing={1} sx={{ mt: 0.5 }}>
            {form.addressLines.map((line, i) => (
              <Stack key={i} direction="row" spacing={1}>
                <TextField
                  value={line}
                  onChange={(e) =>
                    set(
                      'addressLines',
                      form.addressLines.map((l, j) => (j === i ? e.target.value : l)),
                    )
                  }
                  disabled={!canManage}
                  fullWidth
                  size="small"
                />
                <IconButton
                  size="small"
                  disabled={!canManage}
                  onClick={() =>
                    set(
                      'addressLines',
                      form.addressLines.filter((_, j) => j !== i),
                    )
                  }
                >
                  <DeleteOutlineRoundedIcon fontSize="small" />
                </IconButton>
              </Stack>
            ))}
            {canManage && form.addressLines.length < 6 && (
              <Button
                size="small"
                startIcon={<AddRoundedIcon />}
                onClick={() => set('addressLines', [...form.addressLines, ''])}
                sx={{ alignSelf: 'flex-start' }}
              >
                Add line
              </Button>
            )}
          </Stack>
        </Box>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <TextField
            label="Latitude"
            type="number"
            value={form.latitude}
            onChange={(e) => set('latitude', Number(e.target.value))}
            disabled={!canManage}
            fullWidth
            size="small"
          />
          <TextField
            label="Longitude"
            type="number"
            value={form.longitude}
            onChange={(e) => set('longitude', Number(e.target.value))}
            disabled={!canManage}
            fullWidth
            size="small"
          />
        </Stack>
        <TextField
          label="Map link"
          value={form.mapHref}
          onChange={(e) => set('mapHref', e.target.value)}
          disabled={!canManage}
          fullWidth
          size="small"
        />

        <Divider />
        <Button
          variant="contained"
          disabled={!canManage || saving}
          onClick={() =>
            run(
              () =>
                siteSettingsApi.saveBusiness({
                  ...form,
                  addressLines: form.addressLines
                    .map((l) => l.trim())
                    .filter(Boolean),
                }),
              'Business',
            )
          }
          sx={{ alignSelf: 'flex-start' }}
        >
          {saving ? 'Saving…' : 'Save business'}
        </Button>
      </Stack>
    </SectionCard>
  );
}

/* ----------------------------------------------------------------- hours */

function HoursCard({
  initial,
  canManage,
  onSaved,
}: {
  initial: HoursEntry[];
  canManage: boolean;
  onSaved: () => void;
}) {
  const [rows, setRows] = useState<HoursEntry[]>(
    initial.length ? initial : [{ label: '', value: '' }],
  );
  const { saving, errors, run } = useSaver(onSaved);

  return (
    <SectionCard title="Opening hours">
      <Stack spacing={2}>
        <ErrorList errors={errors} />
        {rows.map((row, i) => (
          <Stack key={i} direction="row" spacing={1}>
            <TextField
              label="Days"
              placeholder="Mon – Sun"
              value={row.label}
              onChange={(e) =>
                setRows(rows.map((r, j) => (j === i ? { ...r, label: e.target.value } : r)))
              }
              disabled={!canManage}
              size="small"
              sx={{ flex: 1 }}
            />
            <TextField
              label="Hours"
              placeholder="10:00 AM – 10:00 PM"
              value={row.value}
              onChange={(e) =>
                setRows(rows.map((r, j) => (j === i ? { ...r, value: e.target.value } : r)))
              }
              disabled={!canManage}
              size="small"
              sx={{ flex: 1.4 }}
            />
            <IconButton
              size="small"
              disabled={!canManage || rows.length === 1}
              onClick={() => setRows(rows.filter((_, j) => j !== i))}
            >
              <DeleteOutlineRoundedIcon fontSize="small" />
            </IconButton>
          </Stack>
        ))}
        {canManage && rows.length < 10 && (
          <Button
            size="small"
            startIcon={<AddRoundedIcon />}
            onClick={() => setRows([...rows, { label: '', value: '' }])}
            sx={{ alignSelf: 'flex-start' }}
          >
            Add row
          </Button>
        )}
        <Divider />
        <Button
          variant="contained"
          disabled={!canManage || saving}
          onClick={() =>
            run(
              () =>
                siteSettingsApi.saveHours(
                  rows
                    .map((r) => ({ label: r.label.trim(), value: r.value.trim() }))
                    .filter((r) => r.label && r.value),
                ),
              'Opening hours',
            )
          }
          sx={{ alignSelf: 'flex-start' }}
        >
          {saving ? 'Saving…' : 'Save hours'}
        </Button>
      </Stack>
    </SectionCard>
  );
}

/* ---------------------------------------------------------------- social */

function SocialCard({
  initial,
  canManage,
  onSaved,
}: {
  initial: SocialLink[];
  canManage: boolean;
  onSaved: () => void;
}) {
  const [rows, setRows] = useState<SocialLink[]>(initial);
  const { saving, errors, run } = useSaver(onSaved);

  function update(i: number, patch: Partial<SocialLink>) {
    setRows(rows.map((r, j) => (j === i ? { ...r, ...patch } : r)));
  }

  return (
    <SectionCard title="Social links">
      <Stack spacing={2}>
        <ErrorList errors={errors} />
        {rows.map((row, i) => (
          <Stack
            key={i}
            direction={{ xs: 'column', md: 'row' }}
            spacing={1}
            sx={{ alignItems: { md: 'center' } }}
          >
            <TextField
              select
              label="Platform"
              value={row.platform}
              onChange={(e) =>
                update(i, { platform: e.target.value as SocialLink['platform'] })
              }
              disabled={!canManage}
              size="small"
              sx={{ minWidth: 130 }}
            >
              {SOCIAL_PLATFORMS.map((p) => (
                <MenuItem key={p} value={p}>
                  {p}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Label"
              value={row.label}
              onChange={(e) => update(i, { label: e.target.value })}
              disabled={!canManage}
              size="small"
              sx={{ minWidth: 120 }}
            />
            <TextField
              label="URL"
              value={row.href}
              onChange={(e) => update(i, { href: e.target.value })}
              disabled={!canManage}
              size="small"
              sx={{ flexGrow: 1 }}
            />
            <TextField
              label="Colour"
              placeholder="#1877F2"
              value={row.brandColor ?? ''}
              onChange={(e) =>
                update(i, { brandColor: e.target.value || undefined })
              }
              disabled={!canManage}
              size="small"
              sx={{ width: 110 }}
            />
            <IconButton
              size="small"
              disabled={!canManage}
              onClick={() => setRows(rows.filter((_, j) => j !== i))}
            >
              <DeleteOutlineRoundedIcon fontSize="small" />
            </IconButton>
          </Stack>
        ))}
        {canManage && rows.length < 12 && (
          <Button
            size="small"
            startIcon={<AddRoundedIcon />}
            onClick={() =>
              setRows([
                ...rows,
                { platform: 'facebook', label: '', href: '', brandColor: undefined },
              ])
            }
            sx={{ alignSelf: 'flex-start' }}
          >
            Add link
          </Button>
        )}
        <Divider />
        <Button
          variant="contained"
          disabled={!canManage || saving}
          onClick={() =>
            run(
              () =>
                siteSettingsApi.saveSocial(
                  rows.map((r) => ({
                    platform: r.platform,
                    label: r.label.trim(),
                    href: r.href.trim(),
                    ...(r.brandColor?.trim()
                      ? { brandColor: r.brandColor.trim() }
                      : {}),
                  })),
                ),
              'Social links',
            )
          }
          sx={{ alignSelf: 'flex-start' }}
        >
          {saving ? 'Saving…' : 'Save links'}
        </Button>
      </Stack>
    </SectionCard>
  );
}
