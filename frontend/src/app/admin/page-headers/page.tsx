'use client';

import { useState } from 'react';

import {
  alpha,
  Alert,
  Box,
  Button,
  Chip,
  FormControlLabel,
  Stack,
  Switch,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import ImageRoundedIcon from '@mui/icons-material/ImageRounded';
import UploadRoundedIcon from '@mui/icons-material/UploadRounded';

import { FormSection, PageHeader, QueryBoundary } from '@/components/admin/ui';
import { useToast } from '@/components/admin/toast';
import { useAdminQuery } from '@/lib/admin/use-admin-query';
import { useAdminAuth } from '@/lib/admin/auth-context';
import { AdminApiError } from '@/lib/admin/api';
import { uploadMedia, ACCEPTED_IMAGE_TYPES } from '@/lib/admin/resources/media';
import {
  pageHeadersApi,
  PAGE_HEADERS_PATH,
  PAGE_HEADER_KEYS,
  PAGE_HEADER_LABEL,
  PAGE_HEADER_FIELDS,
  type PageHeadersAdminView,
  type PageHeaderKey,
  type PageHeaderValue,
} from '@/lib/admin/resources/page-headers';

function SinglePhotoField({
  label,
  src,
  alt,
  onChange,
}: {
  label: string;
  src: string;
  alt: string;
  onChange: (src: string, alt: string) => void;
}) {
  const toast = useToast();
  const [uploading, setUploading] = useState(false);

  async function upload(file: File | undefined) {
    if (!file) return;
    setUploading(true);
    try {
      const m = await uploadMedia(file, { folder: 'page-headers', altText: alt || label });
      onChange(m.url, alt);
    } catch (err) {
      toast.error(err instanceof AdminApiError ? err.messages[0] : 'Upload failed');
    } finally {
      setUploading(false);
    }
  }

  return (
    <Stack spacing={1.5}>
      <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={src} alt="" style={{ width: 120, height: 80, objectFit: 'cover', borderRadius: 8 }} />
        ) : (
          <Box
            sx={{
              width: 120,
              height: 80,
              borderRadius: 2,
              display: 'grid',
              placeItems: 'center',
              bgcolor: (t) => alpha(t.palette.primary.main, 0.08),
              color: 'primary.main',
            }}
          >
            <ImageRoundedIcon />
          </Box>
        )}
        <Button component="label" size="small" variant={src ? 'outlined' : 'contained'} startIcon={<UploadRoundedIcon />} disabled={uploading}>
          {uploading ? 'Uploading…' : src ? 'Replace photo' : 'Upload photo'}
          <input type="file" hidden accept={ACCEPTED_IMAGE_TYPES} onChange={(e) => upload(e.target.files?.[0])} />
        </Button>
      </Stack>
      <TextField
        label="Photo description (alt text)"
        value={alt}
        onChange={(e) => onChange(src, e.target.value)}
        size="small"
        fullWidth
      />
    </Stack>
  );
}

export default function AdminPageHeadersPage() {
  const { hasPermission } = useAdminAuth();
  const canManage = hasPermission('pageHeaders.manage');
  const { data, loading, error, reload } =
    useAdminQuery<PageHeadersAdminView>(PAGE_HEADERS_PATH);

  const [tab, setTab] = useState<PageHeaderKey>('menu');

  return (
    <Box>
      <PageHeader
        title="Page headers"
        subtitle="Edit the hero/banner text and photo shown at the top of each public page. Hidden headers fall back to the built-in defaults."
      />

      <QueryBoundary loading={loading && !data} error={error} onRetry={reload}>
        {data && (
          <>
            <Tabs
              value={tab}
              onChange={(_, v) => setTab(v)}
              variant="scrollable"
              scrollButtons="auto"
              sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}
            >
              {PAGE_HEADER_KEYS.map((k) => (
                <Tab
                  key={k}
                  value={k}
                  label={
                    <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                      <span>{PAGE_HEADER_LABEL[k]}</span>
                      {!data[k].isPublished && (
                        <Chip size="small" label="hidden" variant="outlined" />
                      )}
                    </Stack>
                  }
                />
              ))}
            </Tabs>

            <HeaderEditor
              key={tab}
              pageKey={tab}
              entry={data[tab]}
              canManage={canManage}
              onSaved={reload}
            />
          </>
        )}
      </QueryBoundary>
    </Box>
  );
}

function HeaderEditor({
  pageKey,
  entry,
  canManage,
  onSaved,
}: {
  pageKey: PageHeaderKey;
  entry: PageHeadersAdminView[PageHeaderKey];
  canManage: boolean;
  onSaved: () => void;
}) {
  const toast = useToast();
  const fields = PAGE_HEADER_FIELDS[pageKey];

  const [values, setValues] = useState<PageHeaderValue>(
    () =>
      entry.value ?? {
        eyebrow: '',
        title: '',
        accentTitle: '',
        description: '',
        image: '',
        imageAlt: '',
        badges: fields.badges ? [{ label: '' }, { label: '' }, { label: '' }] : undefined,
        primaryCta: fields.primaryCta ? { label: '', href: '' } : undefined,
        secondaryCta: fields.secondaryCta ? { label: '', href: '' } : undefined,
      },
  );
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  function set<K extends keyof PageHeaderValue>(key: K, value: PageHeaderValue[K]) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  function setBadge(index: number, label: string) {
    setValues((v) => {
      const next = [...(v.badges ?? [{ label: '' }, { label: '' }, { label: '' }])];
      next[index] = { label };
      return { ...v, badges: next };
    });
  }

  function setCta(key: 'primaryCta' | 'secondaryCta', patch: { label?: string; href?: string }) {
    setValues((v) => ({ ...v, [key]: { ...(v[key] ?? { label: '', href: '' }), ...patch } }));
  }

  async function handleSave() {
    if (!values.title.trim()) {
      setSaveError('Headline is required.');
      toast.error('Headline is required.');
      return;
    }

    const payload: PageHeaderValue = {
      title: values.title.trim(),
      eyebrow: values.eyebrow?.trim() || undefined,
      accentTitle: values.accentTitle?.trim() || undefined,
      description: values.description?.trim() || undefined,
      image: fields.image ? values.image?.trim() || undefined : undefined,
      imageAlt: fields.image ? values.imageAlt?.trim() || undefined : undefined,
      badges: fields.badges
        ? (values.badges ?? []).filter((b) => b.label.trim().length > 0)
        : undefined,
      primaryCta:
        fields.primaryCta && values.primaryCta?.label.trim() && values.primaryCta?.href.trim()
          ? { label: values.primaryCta.label.trim(), href: values.primaryCta.href.trim() }
          : undefined,
      secondaryCta:
        fields.secondaryCta && values.secondaryCta?.label.trim() && values.secondaryCta?.href.trim()
          ? { label: values.secondaryCta.label.trim(), href: values.secondaryCta.href.trim() }
          : undefined,
    };

    setSaving(true);
    setSaveError(null);
    try {
      await pageHeadersApi.save(pageKey, payload);
      toast.success(`${PAGE_HEADER_LABEL[pageKey]} header saved`);
      onSaved();
    } catch (err) {
      const message = err instanceof AdminApiError ? err.messages[0] : 'Could not save';
      setSaveError(message);
      toast.error(message);
    } finally {
      setSaving(false);
    }
  }

  async function togglePublished() {
    setPublishing(true);
    try {
      await pageHeadersApi.setPublished(pageKey, !entry.isPublished);
      toast.success(entry.isPublished ? 'Header hidden' : 'Header published');
      onSaved();
    } catch (err) {
      toast.error(err instanceof AdminApiError ? err.messages[0] : 'Could not update');
    } finally {
      setPublishing(false);
    }
  }

  return (
    <Stack spacing={3} sx={{ maxWidth: 720 }}>
      <Stack
        direction="row"
        sx={{ alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}
      >
        <Typography variant="body2" color="text.secondary">
          {entry.updatedAt
            ? `Last saved ${new Date(entry.updatedAt).toLocaleString()}`
            : 'Never edited — showing built-in default'}
        </Typography>
        <FormControlLabel
          control={
            <Switch
              checked={entry.isPublished}
              onChange={togglePublished}
              disabled={!canManage || publishing}
            />
          }
          label={entry.isPublished ? 'Published' : 'Hidden (uses default)'}
        />
      </Stack>

      {saveError && <Alert severity="error">{saveError}</Alert>}

      <FormSection title="Text content">
        <TextField
          label="Eyebrow / badge text"
          value={values.eyebrow ?? ''}
          onChange={(e) => set('eyebrow', e.target.value)}
          disabled={!canManage}
          fullWidth
          size="small"
        />
        <TextField
          label="Headline"
          value={values.title}
          onChange={(e) => set('title', e.target.value)}
          disabled={!canManage}
          required
          fullWidth
          size="small"
          sx={{ mt: 2 }}
        />
        <TextField
          label={pageKey === 'menu' ? 'Headline — second line' : 'Accent / second line'}
          value={values.accentTitle ?? ''}
          onChange={(e) => set('accentTitle', e.target.value)}
          disabled={!canManage}
          fullWidth
          size="small"
          sx={{ mt: 2 }}
        />
        <TextField
          label="Description"
          value={values.description ?? ''}
          onChange={(e) => set('description', e.target.value)}
          disabled={!canManage}
          fullWidth
          multiline
          minRows={2}
          size="small"
          sx={{ mt: 2 }}
        />
      </FormSection>

      {fields.image && (
        <FormSection title="Background photo">
          <SinglePhotoField
            label="Background photo"
            src={values.image ?? ''}
            alt={values.imageAlt ?? ''}
            onChange={(src, alt) => setValues((v) => ({ ...v, image: src, imageAlt: alt }))}
          />
        </FormSection>
      )}

      {fields.badges && (
        <FormSection title="Feature badges">
          <Stack spacing={2}>
            {[0, 1, 2].map((i) => (
              <TextField
                key={i}
                label={`Badge ${i + 1}`}
                value={values.badges?.[i]?.label ?? ''}
                onChange={(e) => setBadge(i, e.target.value)}
                disabled={!canManage}
                fullWidth
                size="small"
              />
            ))}
          </Stack>
        </FormSection>
      )}

      {(fields.primaryCta || fields.secondaryCta) && (
        <FormSection title="Buttons">
          <Stack spacing={2.5}>
            {fields.primaryCta && (
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                <TextField
                  label="Primary button label"
                  value={values.primaryCta?.label ?? ''}
                  onChange={(e) => setCta('primaryCta', { label: e.target.value })}
                  disabled={!canManage}
                  fullWidth
                  size="small"
                />
                <TextField
                  label="Primary button link"
                  value={values.primaryCta?.href ?? ''}
                  onChange={(e) => setCta('primaryCta', { href: e.target.value })}
                  disabled={!canManage}
                  fullWidth
                  size="small"
                  helperText="Path, #anchor or URL"
                />
              </Stack>
            )}
            {fields.secondaryCta && (
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                <TextField
                  label="Secondary button label"
                  value={values.secondaryCta?.label ?? ''}
                  onChange={(e) => setCta('secondaryCta', { label: e.target.value })}
                  disabled={!canManage}
                  fullWidth
                  size="small"
                />
                <TextField
                  label="Secondary button link"
                  value={values.secondaryCta?.href ?? ''}
                  onChange={(e) => setCta('secondaryCta', { href: e.target.value })}
                  disabled={!canManage}
                  fullWidth
                  size="small"
                  helperText="Path, #anchor or URL"
                />
              </Stack>
            )}
          </Stack>
        </FormSection>
      )}

      {canManage && (
        <Box>
          <Button variant="contained" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving…' : 'Save changes'}
          </Button>
        </Box>
      )}
    </Stack>
  );
}
