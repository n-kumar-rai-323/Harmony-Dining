'use client';

import { useState } from 'react';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

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
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';

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
import {
  businessSchema,
  socialFormSchema,
  HEX_COLOR_RE,
  type BusinessFormValues,
  type SocialFormValues,
} from '@/validation/site-settings.schema';

/** Small green "looks valid" hint, shown once a format-checked field is non-empty and passes. */
function ValidHint({ show, text }: { show: boolean; text: string }) {
  if (!show) return null;
  return (
    <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center', mt: 0.5 }}>
      <CheckCircleRoundedIcon sx={{ fontSize: 15 }} color="success" />
      <Typography variant="caption" color="success.main">
        {text}
      </Typography>
    </Stack>
  );
}

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
  return { saving, errors, setErrors, run };
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
  const toast = useToast();
  const { saving, errors, setErrors, run } = useSaver(onSaved);
  const { control, handleSubmit } = useForm<BusinessFormValues>({
    resolver: yupResolver(businessSchema),
    mode: 'onTouched',
    defaultValues: initial,
  });

  const onSubmit = handleSubmit(
    (values) =>
      run(
        () =>
          siteSettingsApi.saveBusiness({
            ...values,
            phone: values.phone ?? '',
            email: values.email ?? '',
            mapHref: values.mapHref ?? '',
            addressLines: (values.addressLines ?? [])
              .map((l) => (l ?? '').trim())
              .filter(Boolean),
          }),
        'Business',
      ),
    (formErrors) => {
      const messages = flattenFormErrors(formErrors as Record<string, unknown>);
      setErrors(messages.length > 0 ? messages : ['Please check the highlighted fields.']);
      toast.error(messages[0] ?? 'Please check the highlighted fields.');
    },
  );

  return (
    <SectionCard title="Business">
      <Stack spacing={2}>
        <ErrorList errors={errors} />
        <Controller
          name="name"
          control={control}
          render={({ field, fieldState }) => (
            <TextField
              {...field}
              label="Name"
              disabled={!canManage}
              fullWidth
              size="small"
              error={Boolean(fieldState.error)}
              helperText={fieldState.error?.message}
            />
          )}
        />
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <Box sx={{ flex: 1 }}>
            <Controller
              name="phone"
              control={control}
              render={({ field, fieldState }) => (
                <>
                  <TextField
                    {...field}
                    label="Phone"
                    disabled={!canManage}
                    fullWidth
                    size="small"
                    error={Boolean(fieldState.error)}
                    helperText={fieldState.error?.message}
                  />
                  <ValidHint
                    show={!fieldState.error && Boolean(field.value)}
                    text="Phone format looks valid"
                  />
                </>
              )}
            />
          </Box>
          <Box sx={{ flex: 1 }}>
            <Controller
              name="email"
              control={control}
              render={({ field, fieldState }) => (
                <>
                  <TextField
                    {...field}
                    label="Email"
                    disabled={!canManage}
                    fullWidth
                    size="small"
                    error={Boolean(fieldState.error)}
                    helperText={fieldState.error?.message}
                  />
                  <ValidHint
                    show={!fieldState.error && Boolean(field.value)}
                    text="Email format looks valid"
                  />
                </>
              )}
            />
          </Box>
        </Stack>

        <Controller
          name="addressLines"
          control={control}
          render={({ field }) => {
            const lines = field.value ?? [];
            return (
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Address lines
                </Typography>
                <Stack spacing={1} sx={{ mt: 0.5 }}>
                  {lines.map((line, i) => (
                    <Stack key={i} direction="row" spacing={1}>
                      <TextField
                        value={line}
                        onChange={(e) =>
                          field.onChange(lines.map((l, j) => (j === i ? e.target.value : l)))
                        }
                        disabled={!canManage}
                        fullWidth
                        size="small"
                      />
                      <IconButton
                        size="small"
                        disabled={!canManage}
                        onClick={() => field.onChange(lines.filter((_, j) => j !== i))}
                      >
                        <DeleteOutlineRoundedIcon fontSize="small" />
                      </IconButton>
                    </Stack>
                  ))}
                  {canManage && lines.length < 6 && (
                    <Button
                      size="small"
                      startIcon={<AddRoundedIcon />}
                      onClick={() => field.onChange([...lines, ''])}
                      sx={{ alignSelf: 'flex-start' }}
                    >
                      Add line
                    </Button>
                  )}
                </Stack>
              </Box>
            );
          }}
        />

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <Controller
            name="latitude"
            control={control}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                label="Latitude"
                type="number"
                disabled={!canManage}
                fullWidth
                size="small"
                error={Boolean(fieldState.error)}
                helperText={fieldState.error?.message}
              />
            )}
          />
          <Controller
            name="longitude"
            control={control}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                label="Longitude"
                type="number"
                disabled={!canManage}
                fullWidth
                size="small"
                error={Boolean(fieldState.error)}
                helperText={fieldState.error?.message}
              />
            )}
          />
        </Stack>
        <Controller
          name="mapHref"
          control={control}
          render={({ field, fieldState }) => (
            <TextField
              {...field}
              label="Map link"
              disabled={!canManage}
              fullWidth
              size="small"
              error={Boolean(fieldState.error)}
              helperText={fieldState.error?.message ?? 'A page link (/#location) or a full https:// URL'}
            />
          )}
        />

        <Divider />
        <Button
          variant="contained"
          disabled={!canManage || saving}
          onClick={onSubmit}
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
  const toast = useToast();
  const { saving, errors, setErrors, run } = useSaver(onSaved);
  const { control, handleSubmit } = useForm<SocialFormValues>({
    resolver: yupResolver(socialFormSchema),
    mode: 'onTouched',
    defaultValues: { links: initial },
  });
  const { fields, append, remove } = useFieldArray({ control, name: 'links' });

  const onSubmit = handleSubmit(
    (values) =>
      run(
        () =>
          siteSettingsApi.saveSocial(
            (values.links ?? []).map((r) => ({
              platform: r.platform as SocialLink['platform'],
              label: r.label.trim(),
              href: r.href.trim(),
              ...(r.brandColor?.trim() ? { brandColor: r.brandColor.trim() } : {}),
            })),
          ),
        'Social links',
      ),
    (formErrors) => {
      const messages = flattenFormErrors(formErrors as Record<string, unknown>);
      setErrors(messages.length > 0 ? messages : ['Please check the highlighted fields.']);
      toast.error(messages[0] ?? 'Please check the highlighted fields.');
    },
  );

  return (
    <SectionCard title="Social links">
      <Stack spacing={2}>
        <ErrorList errors={errors} />
        {fields.map((row, i) => (
          <Stack
            key={row.id}
            direction={{ xs: 'column', md: 'row' }}
            spacing={1}
            sx={{ alignItems: { md: 'flex-start' } }}
          >
            <Controller
              name={`links.${i}.platform`}
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  select
                  label="Platform"
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
              )}
            />
            <Controller
              name={`links.${i}.label`}
              control={control}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  label="Label"
                  disabled={!canManage}
                  size="small"
                  sx={{ minWidth: 120 }}
                  error={Boolean(fieldState.error)}
                  helperText={fieldState.error?.message}
                />
              )}
            />
            <Controller
              name={`links.${i}.href`}
              control={control}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  label="URL"
                  disabled={!canManage}
                  size="small"
                  sx={{ flexGrow: 1 }}
                  error={Boolean(fieldState.error)}
                  helperText={fieldState.error?.message}
                />
              )}
            />
            <Controller
              name={`links.${i}.brandColor`}
              control={control}
              render={({ field, fieldState }) => {
                const valid = Boolean(field.value) && HEX_COLOR_RE.test(field.value ?? '');
                return (
                  <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                    <Box
                      sx={{
                        width: 22,
                        height: 22,
                        borderRadius: 1,
                        border: '1px solid',
                        borderColor: 'divider',
                        flexShrink: 0,
                        bgcolor: valid ? field.value : 'action.hover',
                      }}
                    />
                    <TextField
                      {...field}
                      label="Colour"
                      placeholder="#1877F2"
                      disabled={!canManage}
                      size="small"
                      sx={{ width: 110 }}
                      error={Boolean(fieldState.error)}
                      helperText={fieldState.error?.message}
                    />
                  </Stack>
                );
              }}
            />
            <IconButton
              size="small"
              disabled={!canManage}
              onClick={() => remove(i)}
            >
              <DeleteOutlineRoundedIcon fontSize="small" />
            </IconButton>
          </Stack>
        ))}
        {canManage && fields.length < 12 && (
          <Button
            size="small"
            startIcon={<AddRoundedIcon />}
            onClick={() =>
              append({ platform: 'facebook', label: '', href: '', brandColor: '' })
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
          onClick={onSubmit}
          sx={{ alignSelf: 'flex-start' }}
        >
          {saving ? 'Saving…' : 'Save links'}
        </Button>
      </Stack>
    </SectionCard>
  );
}
