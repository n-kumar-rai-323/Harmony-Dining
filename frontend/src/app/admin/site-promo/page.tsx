'use client';

import { useState } from 'react';

import {
  alpha,
  Alert,
  Box,
  Button,
  FormControlLabel,
  Stack,
  Switch,
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
  sitePromoApi,
  type SitePromoAdminView,
  type SitePromoValue,
} from '@/lib/admin/resources/site-promo';

function SinglePhotoField({
  src,
  alt,
  onChange,
}: {
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
      const m = await uploadMedia(file, { folder: 'site-promo', altText: alt || 'Promo photo' });
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

export default function AdminSitePromoPage() {
  const { hasPermission } = useAdminAuth();
  const canManage = hasPermission('sitePromo.manage');
  const { data, loading, error, reload } =
    useAdminQuery<SitePromoAdminView>('/admin/site-promo');

  return (
    <Box>
      <PageHeader
        title="Site promo"
        subtitle="The one-time popup shown to visitors on the public site. Hidden until you publish it."
      />

      <QueryBoundary loading={loading && !data} error={error} onRetry={reload}>
        {data && (
          <PromoEditor entry={data} canManage={canManage} onSaved={reload} />
        )}
      </QueryBoundary>
    </Box>
  );
}

function PromoEditor({
  entry,
  canManage,
  onSaved,
}: {
  entry: SitePromoAdminView;
  canManage: boolean;
  onSaved: () => void;
}) {
  const toast = useToast();

  const [values, setValues] = useState<SitePromoValue>(
    () =>
      entry.value ?? {
        title: '',
        eyebrow: '',
        badge: '',
        accentTitle: '',
        description: '',
        image: '',
        imageAlt: '',
        note: '',
        primaryCta: { label: '', href: '' },
        secondaryCta: { label: '', href: '' },
      },
  );
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  function set<K extends keyof SitePromoValue>(key: K, value: SitePromoValue[K]) {
    setValues((v) => ({ ...v, [key]: value }));
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

    const payload: SitePromoValue = {
      title: values.title.trim(),
      eyebrow: values.eyebrow?.trim() || undefined,
      badge: values.badge?.trim() || undefined,
      accentTitle: values.accentTitle?.trim() || undefined,
      description: values.description?.trim() || undefined,
      image: values.image?.trim() || undefined,
      imageAlt: values.imageAlt?.trim() || undefined,
      note: values.note?.trim() || undefined,
      startAt: values.startAt?.trim() || undefined,
      endAt: values.endAt?.trim() || undefined,
      primaryCta:
        values.primaryCta?.label.trim() && values.primaryCta?.href.trim()
          ? { label: values.primaryCta.label.trim(), href: values.primaryCta.href.trim() }
          : undefined,
      secondaryCta:
        values.secondaryCta?.label.trim() && values.secondaryCta?.href.trim()
          ? { label: values.secondaryCta.label.trim(), href: values.secondaryCta.href.trim() }
          : undefined,
    };

    setSaving(true);
    setSaveError(null);
    try {
      await sitePromoApi.save(payload);
      toast.success('Promo saved');
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
      await sitePromoApi.setPublished(!entry.isPublished);
      toast.success(entry.isPublished ? 'Promo hidden' : 'Promo published');
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
            : 'Never saved — nothing shows on the site yet'}
        </Typography>
        <FormControlLabel
          control={
            <Switch
              checked={entry.isPublished}
              onChange={togglePublished}
              disabled={!canManage || publishing || !entry.value}
            />
          }
          label={entry.isPublished ? 'Published' : 'Hidden'}
        />
      </Stack>

      {!entry.value && (
        <Alert severity="info">
          Save the promo below, then publish it to show it on the site.
        </Alert>
      )}

      {saveError && <Alert severity="error">{saveError}</Alert>}

      <FormSection title="Text content">
        <TextField
          label="Eyebrow / small label"
          value={values.eyebrow ?? ''}
          onChange={(e) => set('eyebrow', e.target.value)}
          disabled={!canManage}
          fullWidth
          size="small"
        />
        <TextField
          label={'Badge (e.g. "Limited Offer")'}
          value={values.badge ?? ''}
          onChange={(e) => set('badge', e.target.value)}
          disabled={!canManage}
          fullWidth
          size="small"
          sx={{ mt: 2 }}
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
          label="Headline — accent line"
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
        <TextField
          label="Fine-print note"
          value={values.note ?? ''}
          onChange={(e) => set('note', e.target.value)}
          disabled={!canManage}
          fullWidth
          size="small"
          sx={{ mt: 2 }}
        />
      </FormSection>

      <FormSection title="Photo">
        <SinglePhotoField
          src={values.image ?? ''}
          alt={values.imageAlt ?? ''}
          onChange={(src, alt) => setValues((v) => ({ ...v, image: src, imageAlt: alt }))}
        />
      </FormSection>

      <FormSection title="Buttons">
        <Stack spacing={2.5}>
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
        </Stack>
      </FormSection>

      <FormSection title="Active window (optional)">
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
          <TextField
            label="Starts at"
            type="datetime-local"
            value={values.startAt ?? ''}
            onChange={(e) => set('startAt', e.target.value)}
            disabled={!canManage}
            fullWidth
            size="small"
            slotProps={{ inputLabel: { shrink: true } }}
          />
          <TextField
            label="Ends at"
            type="datetime-local"
            value={values.endAt ?? ''}
            onChange={(e) => set('endAt', e.target.value)}
            disabled={!canManage}
            fullWidth
            size="small"
            slotProps={{ inputLabel: { shrink: true } }}
          />
        </Stack>
        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
          Leave blank to run indefinitely once published.
        </Typography>
      </FormSection>

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
