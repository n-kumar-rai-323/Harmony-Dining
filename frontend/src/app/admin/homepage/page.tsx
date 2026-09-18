'use client';

import { useEffect, useRef, useState } from 'react';

import {
  alpha,
  Alert,
  Box,
  Button,
  Chip,
  Divider,
  FormControlLabel,
  IconButton,
  MenuItem,
  Paper,
  Stack,
  Switch,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import UploadRoundedIcon from '@mui/icons-material/UploadRounded';
import ImageRoundedIcon from '@mui/icons-material/ImageRounded';

import { Controller, useForm, useWatch } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import type * as yup from 'yup';

import { FormSection, PageHeader, QueryBoundary } from '@/components/admin/ui';
import { useToast } from '@/components/admin/toast';
import { useAdminQuery } from '@/lib/admin/use-admin-query';
import { useAdminAuth } from '@/lib/admin/auth-context';
import { AdminApiError } from '@/lib/admin/api';
import { uploadMedia, ACCEPTED_IMAGE_TYPES } from '@/lib/admin/resources/media';
import {
  homepageApi,
  HOMEPAGE_PATH,
  SECTION_KEYS,
  SECTION_LABEL,
  type HomepageAdminView,
  type SectionKey,
} from '@/lib/admin/resources/homepage';
import { HOMEPAGE_SCHEMAS, HOMEPAGE_LIMITS } from '@/validation/homepage.schema';

/* =========================================================
   Shared bits
========================================================= */

const FRIENDLY_LABELS = {
  eyebrow: 'Eyebrow / badge text',
  title: 'Headline',
  accentTitle: 'Accent line',
  closingTitle: 'Closing line',
  description: 'Description',
  supportingNote: 'Supporting note',
  footerText: 'Footer text',
  helperText: 'Helper text',
  estimateNote: 'Estimate note',
  imageLabel: 'Image label',
  imageCaption: 'Image caption',
  imageMeta: 'Image meta',
} as const;

function slugId() {
  return Math.random().toString(36).slice(2, 10);
}

const FIELD_PATH_LABELS: Record<string, string> = {
  title: 'Headline',
  image: 'Background photo',
  imageAlt: 'Background photo description',
  eyebrow: 'Eyebrow / badge text',
  accentTitle: 'Accent line',
  closingTitle: 'Closing line',
  description: 'Description',
  supportingNote: 'Supporting note',
  helperText: 'Helper text',
  estimateNote: 'Estimate note',
  'location.name': 'Restaurant name',
  'location.address': 'Restaurant address',
  'location.latitude': 'Latitude',
  'location.longitude': 'Longitude',
  'location.openingHours': 'Opening hours',
};

const LIST_PATH_LABELS: Record<string, string> = {
  images: 'Background photo',
  stories: 'Story',
  features: 'Feature',
  cards: 'Card',
  badges: 'Badge',
  nearbyPlaces: 'Nearby place',
  actions: 'Button',
};

const LIST_FIELD_LABELS: Record<string, string> = {
  alt: 'description',
  src: 'photo',
  title: 'title',
  label: 'label',
  href: 'link',
  description: 'description',
  iconKey: 'icon',
  variant: 'style',
  latitude: 'latitude',
  longitude: 'longitude',
  category: 'category',
  shortName: 'short name',
  name: 'name',
};

/** Turns "images.0.alt: alt must be longer..." into "Background photo 1 — description: …". */
function humanizeError(raw: string): string {
  const sep = raw.indexOf(': ');
  if (sep === -1) return raw;
  const path = raw.slice(0, sep);
  const detail = raw.slice(sep + 2);

  const arrayMatch = path.match(/^(\w+)\.(\d+)\.(.+)$/);
  if (arrayMatch) {
    const [, listKey, idxStr, rest] = arrayMatch;
    const idx = Number(idxStr) + 1;
    const listLabel = LIST_PATH_LABELS[listKey] ?? listKey;
    const fieldLabel = LIST_FIELD_LABELS[rest] ?? rest;
    return `${listLabel} ${idx} — ${fieldLabel}: ${detail}`;
  }

  const known = FIELD_PATH_LABELS[path];
  if (known) return `${known}: ${detail}`;

  return raw;
}

/**
 * Walks React Hook Form's error tree (which mirrors the form's shape, so
 * nested/array fields show up as nested objects) into the same
 * "path: message" strings `humanizeError` already knows how to read —
 * client-side validation failures get the same readable treatment as
 * backend ones, instead of silently doing nothing on Save.
 */
function collectFormErrors(errors: Record<string, unknown>, prefix = ''): string[] {
  const out: string[] = [];
  for (const [key, val] of Object.entries(errors)) {
    if (!val || typeof val !== 'object') continue;
    const path = prefix ? `${prefix}.${key}` : key;
    const message = (val as { message?: unknown }).message;
    if (typeof message === 'string') {
      out.push(humanizeError(`${path}: ${message}`));
    } else {
      out.push(...collectFormErrors(val as Record<string, unknown>, path));
    }
  }
  return out;
}

function str(v: unknown): string {
  return typeof v === 'string' ? v : '';
}

function num(v: unknown): number {
  return typeof v === 'number' && Number.isFinite(v) ? v : 0;
}

function arr<T = unknown>(v: unknown): T[] {
  return Array.isArray(v) ? (v as T[]) : [];
}

function obj(v: unknown): Record<string, unknown> {
  return v && typeof v === 'object' && !Array.isArray(v) ? (v as Record<string, unknown>) : {};
}

/* =========================================================
   Reusable field widgets
========================================================= */

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
      const m = await uploadMedia(file, { folder: 'homepage', altText: alt || label });
      onChange(m.url, alt);
    } catch (err) {
      toast.error(err instanceof AdminApiError ? err.messages[0] : 'Upload failed');
    } finally {
      setUploading(false);
    }
  }

  return (
    <Stack spacing={1.5}>
      <Typography variant="overline" color="text.secondary">{label}</Typography>
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

type GalleryPhoto = { src: string; alt: string; position?: string };

function PhotoGalleryField({
  title = 'Photo gallery',
  photos,
  onChange,
  max = 5,
}: {
  title?: string;
  photos: GalleryPhoto[];
  onChange: (next: GalleryPhoto[]) => void;
  max?: number;
}) {
  const toast = useToast();
  const [uploading, setUploading] = useState(false);

  async function addPhoto(file: File | undefined) {
    if (!file) return;
    if (photos.length >= max) {
      toast.error(`You can add up to ${max} photos.`);
      return;
    }
    setUploading(true);
    try {
      const m = await uploadMedia(file, { folder: 'homepage' });
      onChange([...photos, { src: m.url, alt: '', position: 'center' }]);
    } catch (err) {
      toast.error(err instanceof AdminApiError ? err.messages[0] : 'Upload failed');
    } finally {
      setUploading(false);
    }
  }

  return (
    <Stack spacing={1.5}>
      <Typography variant="overline" color="text.secondary">
        {title} ({photos.length}/{max})
      </Typography>
      <Typography variant="caption" color="text.secondary">
        {photos.length === 0
          ? `Add at least one photo (up to ${max}).`
          : photos.length === 1
            ? 'Add more to rotate between photos on the live site.'
            : 'These rotate on the live site.'}
      </Typography>
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 1.5 }}>
        {photos.map((p, i) => (
          <Box key={i}>
            <Box sx={{ position: 'relative' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.src} alt={p.alt} style={{ width: '100%', aspectRatio: '4/3', objectFit: 'cover', borderRadius: 6, display: 'block' }} />
              <IconButton
                size="small"
                onClick={() => onChange(photos.filter((_, j) => j !== i))}
                sx={{ position: 'absolute', top: 4, right: 4, bgcolor: 'background.paper' }}
              >
                <DeleteOutlineRoundedIcon fontSize="small" />
              </IconButton>
            </Box>
            <TextField
              placeholder="Photo description"
              value={p.alt}
              onChange={(e) => onChange(photos.map((x, j) => (j === i ? { ...x, alt: e.target.value } : x)))}
              size="small"
              fullWidth
              variant="standard"
              sx={{ mt: 0.5 }}
            />
          </Box>
        ))}
        {photos.length < max && (
          <Button component="label" variant="outlined" disabled={uploading} sx={{ aspectRatio: '4/3', flexDirection: 'column' }}>
            <AddRoundedIcon />
            <Typography variant="caption">{uploading ? 'Uploading…' : 'Add photo'}</Typography>
            <input type="file" hidden accept={ACCEPTED_IMAGE_TYPES} onChange={(e) => addPhoto(e.target.files?.[0])} />
          </Button>
        )}
      </Box>
    </Stack>
  );
}

function LinkField({
  title,
  label,
  href,
  variant,
  variantOptions,
  onChange,
}: {
  title: string;
  label: string;
  href: string;
  variant?: string;
  variantOptions?: string[];
  onChange: (patch: { label?: string; href?: string; variant?: string }) => void;
}) {
  return (
    <Stack spacing={1.5}>
      <Typography variant="overline" color="text.secondary">{title}</Typography>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
        <TextField label="Button text" value={label} onChange={(e) => onChange({ label: e.target.value })} size="small" fullWidth />
        <TextField label="Link (e.g. /menu)" value={href} onChange={(e) => onChange({ href: e.target.value })} size="small" fullWidth />
        {variantOptions && (
          <TextField
            select
            label="Style"
            value={variant ?? variantOptions[0]}
            onChange={(e) => onChange({ variant: e.target.value })}
            size="small"
            sx={{ minWidth: 140 }}
          >
            {variantOptions.map((v) => (
              <MenuItem key={v} value={v}>{v}</MenuItem>
            ))}
          </TextField>
        )}
      </Stack>
    </Stack>
  );
}

function ToggleLinkFieldGroup({
  title,
  label,
  enabled,
  onChange,
}: {
  title: string;
  label: string;
  enabled: boolean;
  onChange: (patch: { label?: string; enabled?: boolean }) => void;
}) {
  return (
    <Stack spacing={1}>
      <Typography variant="overline" color="text.secondary">{title}</Typography>
      <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
        <TextField label="Button text" value={label} onChange={(e) => onChange({ label: e.target.value })} size="small" fullWidth />
        <FormControlLabel
          control={<Switch checked={enabled} onChange={(e) => onChange({ enabled: e.target.checked })} />}
          label="Shown"
          sx={{ whiteSpace: 'nowrap' }}
        />
      </Stack>
    </Stack>
  );
}

type HeroAction = { label: string; href: string; iconKey?: string; variant: string };
const HERO_ICON_KEYS = ['celebration', 'calendar', 'menu'];
const HERO_VARIANTS = ['primary', 'secondary', 'tertiary'];

function HeroButtonsField({ actions, onChange }: { actions: HeroAction[]; onChange: (next: HeroAction[]) => void }) {
  const toast = useToast();
  return (
    <Stack spacing={1.5}>
      <Typography variant="overline" color="text.secondary">Buttons ({actions.length}/4)</Typography>
      <Stack spacing={1.5}>
        {actions.map((a, i) => (
          <Paper key={i} variant="outlined" sx={{ p: 1.5, borderRadius: 2 }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
              <TextField
                label="Label"
                value={a.label}
                onChange={(e) => onChange(actions.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)))}
                size="small"
                fullWidth
              />
              <TextField
                label="Link"
                value={a.href}
                onChange={(e) => onChange(actions.map((x, j) => (j === i ? { ...x, href: e.target.value } : x)))}
                size="small"
                fullWidth
              />
              <TextField
                select
                label="Icon"
                value={a.iconKey ?? ''}
                onChange={(e) => onChange(actions.map((x, j) => (j === i ? { ...x, iconKey: e.target.value || undefined } : x)))}
                size="small"
                sx={{ minWidth: 130 }}
              >
                <MenuItem value="">None</MenuItem>
                {HERO_ICON_KEYS.map((k) => <MenuItem key={k} value={k}>{k}</MenuItem>)}
              </TextField>
              <TextField
                select
                label="Style"
                value={a.variant}
                onChange={(e) => onChange(actions.map((x, j) => (j === i ? { ...x, variant: e.target.value } : x)))}
                size="small"
                sx={{ minWidth: 130 }}
              >
                {HERO_VARIANTS.map((v) => <MenuItem key={v} value={v}>{v}</MenuItem>)}
              </TextField>
              <IconButton size="small" onClick={() => onChange(actions.filter((_, j) => j !== i))}>
                <DeleteOutlineRoundedIcon fontSize="small" />
              </IconButton>
            </Stack>
          </Paper>
        ))}
        <Button
          size="small"
          startIcon={<AddRoundedIcon />}
          sx={{ alignSelf: 'flex-start' }}
          onClick={() => {
            if (actions.length >= 4) { toast.error('You can add up to 4 buttons.'); return; }
            onChange([...actions, { label: '', href: '', variant: 'primary' }]);
          }}
        >
          Add button
        </Button>
      </Stack>
    </Stack>
  );
}

type Story = { id: string; eyebrow?: string; title: string; description?: string; image: string; imageAlt: string };

function StoriesField({ stories, onChange }: { stories: Story[]; onChange: (next: Story[]) => void }) {
  const toast = useToast();
  function update(i: number, patch: Partial<Story>) {
    onChange(stories.map((s, j) => (j === i ? { ...s, ...patch } : s)));
  }
  return (
    <Stack spacing={1.5}>
      <Typography variant="overline" color="text.secondary">Stories ({stories.length}/8)</Typography>
      <Stack spacing={2}>
        {stories.map((s, i) => (
          <Paper key={s.id} variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
            <Stack spacing={1.5}>
              <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="subtitle2">Story {i + 1}</Typography>
                <IconButton size="small" onClick={() => onChange(stories.filter((_, j) => j !== i))}>
                  <DeleteOutlineRoundedIcon fontSize="small" />
                </IconButton>
              </Stack>
              <TextField label="Eyebrow" value={s.eyebrow ?? ''} onChange={(e) => update(i, { eyebrow: e.target.value })} size="small" fullWidth />
              <TextField label="Title" value={s.title} onChange={(e) => update(i, { title: e.target.value })} size="small" fullWidth />
              <TextField
                label="Description"
                value={s.description ?? ''}
                onChange={(e) => update(i, { description: e.target.value })}
                size="small"
                fullWidth
                multiline
                minRows={2}
              />
              <SinglePhotoField
                label="Photo"
                src={s.image}
                alt={s.imageAlt}
                onChange={(src, alt) => update(i, { image: src, imageAlt: alt })}
              />
            </Stack>
          </Paper>
        ))}
        <Button
          size="small"
          startIcon={<AddRoundedIcon />}
          sx={{ alignSelf: 'flex-start' }}
          onClick={() => {
            if (stories.length >= 8) { toast.error('You can add up to 8 stories.'); return; }
            onChange([...stories, { id: slugId(), title: '', image: '', imageAlt: '' }]);
          }}
        >
          Add story
        </Button>
      </Stack>
    </Stack>
  );
}

function TagsField({ initial, onChange }: { initial: string[]; onChange: (next: string[]) => void }) {
  const [text, setText] = useState(initial.join(', '));
  return (
    <TextField
      label="Tags (comma separated)"
      value={text}
      onChange={(e) => {
        setText(e.target.value);
        onChange(e.target.value.split(',').map((t) => t.trim()).filter(Boolean));
      }}
      size="small"
      fullWidth
      placeholder="Live music, Private hall, Custom menus"
    />
  );
}

type Feature = { id: string; title: string; description?: string; iconKey: string };
const EVENT_FEATURE_ICONS = ['celebration', 'groups', 'restaurant', 'tune'];

function FeaturesField({ features, onChange }: { features: Feature[]; onChange: (next: Feature[]) => void }) {
  const toast = useToast();
  function update(i: number, patch: Partial<Feature>) {
    onChange(features.map((f, j) => (j === i ? { ...f, ...patch } : f)));
  }
  return (
    <Stack spacing={1.5}>
      <Typography variant="overline" color="text.secondary">Features ({features.length}/8)</Typography>
      <Stack spacing={1.5}>
        {features.map((f, i) => (
          <Paper key={f.id} variant="outlined" sx={{ p: 1.5, borderRadius: 2 }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
              <TextField label="Title" value={f.title} onChange={(e) => update(i, { title: e.target.value })} size="small" fullWidth />
              <TextField
                label="Description"
                value={f.description ?? ''}
                onChange={(e) => update(i, { description: e.target.value })}
                size="small"
                fullWidth
              />
              <TextField
                select
                label="Icon"
                value={f.iconKey}
                onChange={(e) => update(i, { iconKey: e.target.value })}
                size="small"
                sx={{ minWidth: 140 }}
              >
                {EVENT_FEATURE_ICONS.map((k) => <MenuItem key={k} value={k}>{k}</MenuItem>)}
              </TextField>
              <IconButton size="small" onClick={() => onChange(features.filter((_, j) => j !== i))}>
                <DeleteOutlineRoundedIcon fontSize="small" />
              </IconButton>
            </Stack>
          </Paper>
        ))}
        <Button
          size="small"
          startIcon={<AddRoundedIcon />}
          sx={{ alignSelf: 'flex-start' }}
          onClick={() => {
            if (features.length >= 8) { toast.error('You can add up to 8 features.'); return; }
            onChange([...features, { id: slugId(), title: '', iconKey: 'celebration' }]);
          }}
        >
          Add feature
        </Button>
      </Stack>
    </Stack>
  );
}

type Badge = { id: string; label: string; iconKey: string };
type ReservationCard = {
  id: string;
  enabled?: boolean;
  eyebrow?: string;
  title: string;
  description?: string;
  iconKey: string;
  badges?: Badge[];
  cta?: { label: string; href: string; variant: string };
};
const RESERVATION_ICONS = ['calendar', 'celebration', 'clock', 'groups', 'restaurant'];

function ReservationCardEditor({
  card,
  index,
  onUpdate,
  onRemove,
}: {
  card: ReservationCard;
  index: number;
  onUpdate: (patch: Partial<ReservationCard>) => void;
  onRemove: () => void;
}) {
  const toast = useToast();
  const [newBadge, setNewBadge] = useState('');
  const badges = card.badges ?? [];

  function addBadge() {
    const label = newBadge.trim();
    if (!label) return;
    if (badges.length >= 4) {
      toast.error('You can add up to 4 badges.');
      return;
    }
    onUpdate({ badges: [...badges, { id: slugId(), label, iconKey: card.iconKey }] });
    setNewBadge('');
  }

  return (
    <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
      <Stack spacing={1.5}>
        <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="subtitle2">Card {index + 1}</Typography>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <FormControlLabel
              control={<Switch size="small" checked={card.enabled ?? true} onChange={(e) => onUpdate({ enabled: e.target.checked })} />}
              label="Shown"
            />
            <IconButton size="small" onClick={onRemove}>
              <DeleteOutlineRoundedIcon fontSize="small" />
            </IconButton>
          </Stack>
        </Stack>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
          <TextField label="Eyebrow" value={card.eyebrow ?? ''} onChange={(e) => onUpdate({ eyebrow: e.target.value })} size="small" fullWidth />
          <TextField label="Title" value={card.title} onChange={(e) => onUpdate({ title: e.target.value })} size="small" fullWidth />
          <TextField
            select
            label="Icon"
            value={card.iconKey}
            onChange={(e) => onUpdate({ iconKey: e.target.value })}
            size="small"
            sx={{ minWidth: 140 }}
          >
            {RESERVATION_ICONS.map((k) => <MenuItem key={k} value={k}>{k}</MenuItem>)}
          </TextField>
        </Stack>
        <TextField
          label="Description"
          value={card.description ?? ''}
          onChange={(e) => onUpdate({ description: e.target.value })}
          size="small"
          fullWidth
          multiline
          minRows={2}
        />

        <Typography variant="caption" color="text.secondary">Badges ({badges.length}/4)</Typography>
        {badges.length > 0 && (
          <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', rowGap: 1 }}>
            {badges.map((b, bi) => (
              <Chip
                key={b.id}
                label={b.label || 'Badge'}
                onDelete={() => onUpdate({ badges: badges.filter((_, j) => j !== bi) })}
                size="small"
              />
            ))}
          </Stack>
        )}
        {badges.length < 4 && (
          <Stack direction="row" spacing={1}>
            <TextField
              placeholder="Badge text (e.g. Group occasions)"
              value={newBadge}
              onChange={(e) => setNewBadge(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addBadge();
                }
              }}
              size="small"
              fullWidth
            />
            <Button size="small" startIcon={<AddRoundedIcon />} onClick={addBadge} disabled={!newBadge.trim()}>
              Add
            </Button>
          </Stack>
        )}

        <LinkField
          title="Card button"
          label={card.cta?.label ?? ''}
          href={card.cta?.href ?? ''}
          variant={card.cta?.variant ?? 'contained'}
          variantOptions={['contained', 'outlined']}
          onChange={(patch) =>
            onUpdate({
              cta: { label: card.cta?.label ?? '', href: card.cta?.href ?? '', variant: card.cta?.variant ?? 'contained', ...patch },
            })
          }
        />
      </Stack>
    </Paper>
  );
}

function CardsField({ cards, onChange }: { cards: ReservationCard[]; onChange: (next: ReservationCard[]) => void }) {
  const toast = useToast();
  return (
    <Stack spacing={1.5}>
      <Typography variant="overline" color="text.secondary">Cards ({cards.length}/4)</Typography>
      <Stack spacing={2}>
        {cards.map((c, i) => (
          <ReservationCardEditor
            key={c.id}
            card={c}
            index={i}
            onUpdate={(patch) => onChange(cards.map((x, j) => (j === i ? { ...x, ...patch } : x)))}
            onRemove={() => onChange(cards.filter((_, j) => j !== i))}
          />
        ))}
        <Button
          size="small"
          startIcon={<AddRoundedIcon />}
          sx={{ alignSelf: 'flex-start' }}
          onClick={() => {
            if (cards.length >= 4) { toast.error('You can add up to 4 cards.'); return; }
            onChange([...cards, { id: slugId(), title: '', iconKey: 'calendar', enabled: true }]);
          }}
        >
          Add card
        </Button>
      </Stack>
    </Stack>
  );
}

type NearbyPlace = { id: string; name: string; shortName: string; category: string; latitude: number; longitude: number };

function NearbyPlacesField({ places, onChange }: { places: NearbyPlace[]; onChange: (next: NearbyPlace[]) => void }) {
  const toast = useToast();
  function update(i: number, patch: Partial<NearbyPlace>) {
    onChange(places.map((p, j) => (j === i ? { ...p, ...patch } : p)));
  }
  return (
    <Stack spacing={1.5}>
      <Typography variant="overline" color="text.secondary">Nearby places ({places.length}/12)</Typography>
      <Stack spacing={1.5}>
        {places.map((p, i) => (
          <Paper key={p.id} variant="outlined" sx={{ p: 1.5, borderRadius: 2 }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
              <TextField label="Name" value={str(p.name)} onChange={(e) => update(i, { name: e.target.value })} size="small" fullWidth />
              <TextField label="Short name" value={str(p.shortName)} onChange={(e) => update(i, { shortName: e.target.value })} size="small" fullWidth />
              <TextField label="Category" value={str(p.category)} onChange={(e) => update(i, { category: e.target.value })} size="small" fullWidth />
              <TextField
                label="Latitude"
                type="number"
                value={num(p.latitude)}
                onChange={(e) => update(i, { latitude: Number(e.target.value) })}
                size="small"
                sx={{ minWidth: 120 }}
              />
              <TextField
                label="Longitude"
                type="number"
                value={num(p.longitude)}
                onChange={(e) => update(i, { longitude: Number(e.target.value) })}
                size="small"
                sx={{ minWidth: 120 }}
              />
              <IconButton size="small" onClick={() => onChange(places.filter((_, j) => j !== i))}>
                <DeleteOutlineRoundedIcon fontSize="small" />
              </IconButton>
            </Stack>
          </Paper>
        ))}
        <Button
          size="small"
          startIcon={<AddRoundedIcon />}
          sx={{ alignSelf: 'flex-start' }}
          onClick={() => {
            if (places.length >= 12) { toast.error('You can add up to 12 places.'); return; }
            onChange([...places, { id: slugId(), name: '', shortName: '', category: '', latitude: 27.7172, longitude: 85.324 }]);
          }}
        >
          Add place
        </Button>
      </Stack>
    </Stack>
  );
}

/* =========================================================
   Page
========================================================= */

export default function AdminHomepagePage() {
  const { hasPermission } = useAdminAuth();
  const canManage = hasPermission('homepage.manage');
  const { data, loading, error, reload } =
    useAdminQuery<HomepageAdminView>(HOMEPAGE_PATH);

  const [tab, setTab] = useState<SectionKey>('hero');

  return (
    <Box>
      <PageHeader
        title="Homepage content"
        subtitle="Edit each section of the public home page. Unpublished sections fall back to the built-in defaults."
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
              {SECTION_KEYS.map((k) => (
                <Tab
                  key={k}
                  value={k}
                  label={
                    <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                      <span>{SECTION_LABEL[k]}</span>
                      {!data[k].isPublished && (
                        <Chip size="small" label="hidden" variant="outlined" />
                      )}
                    </Stack>
                  }
                />
              ))}
            </Tabs>

            <SectionEditor
              key={tab}
              sectionKey={tab}
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

function SectionEditor({
  sectionKey,
  entry,
  canManage,
  onSaved,
}: {
  sectionKey: SectionKey;
  entry: HomepageAdminView[SectionKey];
  canManage: boolean;
  onSaved: () => void;
}) {
  const toast = useToast();

  const initial = (entry.value ?? {}) as Record<string, unknown>;
  const [saveErrors, setSaveErrors] = useState<string[]>([]);
  const [publishing, setPublishing] = useState(false);
  const errorBoxRef = useRef<HTMLDivElement | null>(null);

  const {
    control,
    handleSubmit,
    setValue,
    reset,
    formState: { isSubmitting, isDirty },
  } = useForm<Record<string, unknown>>({
    resolver: yupResolver(HOMEPAGE_SCHEMAS[sectionKey] as yup.ObjectSchema<Record<string, unknown>>),
    mode: 'onTouched',
    defaultValues: initial,
  });

  // One subscription for the whole section — simpler than a `useWatch` call
  // per dynamic field name, and every array/object widget below needs to
  // react to edits made by its siblings (e.g. Save button's dirty state).
  const values = (useWatch({ control }) ?? {}) as Record<string, unknown>;

  useEffect(() => {
    if (saveErrors.length > 0) {
      errorBoxRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [saveErrors]);

  function setField(field: string, value: unknown) {
    setValue(field, value, { shouldValidate: true, shouldDirty: true });
  }

  // A single optional button/toggle/detail object must be entirely omitted
  // when left blank — otherwise its own required sub-fields (e.g. a link's
  // href) fail validation even though the whole thing is meant to be optional.
  function setOptionalLink(field: string, patch: { label?: string; href?: string; variant?: string }) {
    const next = { ...obj(values[field]), ...patch };
    setField(field, str(next.label).trim() || str(next.href).trim() ? next : undefined);
  }
  function setOptionalToggle(field: string, patch: { label?: string; enabled?: boolean }) {
    const next = { ...obj(values[field]), ...patch };
    setField(field, str(next.label).trim() ? next : undefined);
  }
  function setOptionalDetail(field: string, patch: Record<string, unknown>) {
    const next = { ...obj(values[field]), ...patch };
    setField(field, str(next.title).trim() ? next : undefined);
  }

  function textField(field: keyof typeof FRIENDLY_LABELS, opts?: { multiline?: boolean }) {
    return (
      <Controller
        key={field}
        name={field}
        control={control}
        render={({ field: f, fieldState }) => (
          <TextField
            {...f}
            value={str(f.value)}
            label={FRIENDLY_LABELS[field]}
            disabled={!canManage}
            fullWidth
            multiline={opts?.multiline}
            minRows={opts?.multiline ? 2 : undefined}
            size="small"
            slotProps={{ htmlInput: { maxLength: HOMEPAGE_LIMITS[field] } }}
            error={Boolean(fieldState.error)}
            helperText={fieldState.error?.message ?? `${str(f.value).length}/${HOMEPAGE_LIMITS[field]}`}
          />
        )}
      />
    );
  }

  const onSubmit = handleSubmit(async (submitted) => {
    setSaveErrors([]);
    try {
      const payload: Record<string, unknown> = { ...submitted };
      // Hero/Dining show one "photos" gallery; the first photo doubles as the
      // required single `image`/`imageAlt` fallback the backend and the
      // public site expect when the gallery is empty or down to one photo.
      if (sectionKey === 'hero' || sectionKey === 'dining') {
        const gallery = arr<GalleryPhoto>(payload.images);
        if (gallery[0]?.src && gallery[0]?.alt) {
          payload.image = gallery[0].src;
          payload.imageAlt = gallery[0].alt;
        }
      }
      await homepageApi.save(sectionKey, payload);
      toast.success(`${SECTION_LABEL[sectionKey]} saved`);
      onSaved();
    } catch (err) {
      if (err instanceof AdminApiError) {
        const humanized = err.messages.map(humanizeError);
        setSaveErrors(humanized);
        toast.error(humanized[0] ?? 'Could not save');
      } else {
        toast.error('Could not save');
      }
    }
  }, (formErrors) => {
    // Client-side validation failed — without this, RHF would just update
    // formState.errors and Save would silently do nothing.
    const messages = collectFormErrors(formErrors as Record<string, unknown>);
    setSaveErrors(messages.length > 0 ? messages : ['Please check the highlighted fields.']);
    toast.error(messages[0] ?? 'Please check the highlighted fields.');
  });

  const saving = isSubmitting;

  async function togglePublished() {
    setPublishing(true);
    try {
      await homepageApi.setPublished(sectionKey, !entry.isPublished);
      toast.success(entry.isPublished ? 'Section hidden' : 'Section published');
      onSaved();
    } catch (err) {
      toast.error(err instanceof AdminApiError ? err.messages[0] : 'Could not update');
    } finally {
      setPublishing(false);
    }
  }

  return (
    <Stack spacing={3} sx={{ maxWidth: 820 }}>
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

      {saveErrors.length > 0 && (
        <Alert severity="error" ref={errorBoxRef}>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>Validation failed</Typography>
          <Box component="ul" sx={{ m: 0, pl: 2 }}>
            {saveErrors.map((m, i) => (
              <li key={i}><Typography variant="caption">{m}</Typography></li>
            ))}
          </Box>
        </Alert>
      )}

      <FormSection title="Text content">
        {textField('eyebrow')}
        {textField('title')}
        {['hero', 'eventsShowcase', 'reservationCta', 'reviews', 'location'].includes(sectionKey) && textField('accentTitle')}
        {sectionKey === 'eventsShowcase' && textField('closingTitle')}
        {textField('description', { multiline: true })}
      </FormSection>

      <Divider />

      {sectionKey === 'hero' && (
        <>
          <PhotoGalleryField
            title="Background photos"
            photos={arr<GalleryPhoto>(values.images)}
            onChange={(next) => setField('images', next)}
            max={5}
          />
          <Divider />
          {textField('imageLabel')}
          {textField('imageCaption')}
          <Divider />
          <HeroButtonsField
            actions={arr<HeroAction>(values.actions)}
            onChange={(next) => setField('actions', next)}
          />
        </>
      )}

      {sectionKey === 'dining' && (
        <>
          <PhotoGalleryField
            title="Photos"
            photos={arr<GalleryPhoto>(values.images)}
            onChange={(next) => setField('images', next)}
            max={5}
          />
          <Divider />
          <TextField
            label="Detail badge title (optional, e.g. a highlighted note)"
            value={str(obj(values.detail).title)}
            onChange={(e) => setOptionalDetail('detail', { title: e.target.value, iconKey: 'restaurant' })}
            size="small"
            fullWidth
          />
          <Divider />
          <LinkField
            title="Button (optional)"
            label={str(obj(values.cta).label)}
            href={str(obj(values.cta).href)}
            onChange={(patch) => setOptionalLink('cta', patch)}
          />
        </>
      )}

      {sectionKey === 'animated' && (
        <StoriesField
          stories={arr<Story>(values.stories)}
          onChange={(next) => setField('stories', next)}
        />
      )}

      {sectionKey === 'eventsShowcase' && (
        <>
          <Controller
            name="enabled"
            control={control}
            render={({ field }) => (
              <FormControlLabel
                control={<Switch checked={(field.value as boolean | undefined) ?? true} onChange={(e) => field.onChange(e.target.checked)} />}
                label="Section enabled"
              />
            )}
          />
          <Divider />
          <SinglePhotoField
            label="Photo"
            src={str(values.image)}
            alt={str(values.imageAlt)}
            onChange={(src, alt) => { setField('image', src); setField('imageAlt', alt); }}
          />
          <Divider />
          {textField('imageLabel')}
          {textField('imageMeta')}
          <Divider />
          <TagsField initial={arr<string>(values.tags)} onChange={(next) => setField('tags', next)} />
          <Divider />
          <FeaturesField features={arr<Feature>(values.features)} onChange={(next) => setField('features', next)} />
          <Divider />
          <LinkField
            title="Primary button (optional)"
            label={str(obj(values.primaryCta).label)}
            href={str(obj(values.primaryCta).href)}
            onChange={(patch) => setOptionalLink('primaryCta', patch)}
          />
          <LinkField
            title="Secondary button (optional)"
            label={str(obj(values.secondaryCta).label)}
            href={str(obj(values.secondaryCta).href)}
            onChange={(patch) => setOptionalLink('secondaryCta', patch)}
          />
          <Divider />
          {textField('supportingNote')}
        </>
      )}

      {sectionKey === 'reservationCta' && (
        <>
          <Controller
            name="enabled"
            control={control}
            render={({ field }) => (
              <FormControlLabel
                control={<Switch checked={(field.value as boolean | undefined) ?? true} onChange={(e) => field.onChange(e.target.checked)} />}
                label="Section enabled"
              />
            )}
          />
          <Divider />
          <CardsField cards={arr<ReservationCard>(values.cards)} onChange={(next) => setField('cards', next)} />
          <Divider />
          {textField('supportingNote')}
        </>
      )}

      {sectionKey === 'reviews' && (
        <>
          <Controller
            name="enabled"
            control={control}
            render={({ field }) => (
              <FormControlLabel
                control={<Switch checked={(field.value as boolean | undefined) ?? true} onChange={(e) => field.onChange(e.target.checked)} />}
                label="Section enabled"
              />
            )}
          />
          <Divider />
          {textField('footerText')}
          <Divider />
          <LinkField
            title="Button (optional)"
            label={str(obj(values.cta).label)}
            href={str(obj(values.cta).href)}
            onChange={(patch) => setOptionalLink('cta', patch)}
          />
        </>
      )}

      {sectionKey === 'location' && (
        <>
          <Controller
            name="enabled"
            control={control}
            render={({ field }) => (
              <FormControlLabel
                control={<Switch checked={(field.value as boolean | undefined) ?? true} onChange={(e) => field.onChange(e.target.checked)} />}
                label="Section enabled"
              />
            )}
          />
          <Divider />
          <FormSection title="Restaurant location">
            <TextField
              label="Restaurant name"
              value={str(obj(values.location).name)}
              onChange={(e) => setField('location', { ...obj(values.location), id: obj(values.location).id ?? 'main', name: e.target.value })}
              size="small"
              fullWidth
            />
            <TextField
              label="Address"
              value={str(obj(values.location).address)}
              onChange={(e) => setField('location', { ...obj(values.location), id: obj(values.location).id ?? 'main', address: e.target.value })}
              size="small"
              fullWidth
            />
            <Stack direction="row" spacing={2}>
              <TextField
                label="Latitude"
                type="number"
                value={num(obj(values.location).latitude)}
                onChange={(e) => setField('location', { ...obj(values.location), id: obj(values.location).id ?? 'main', latitude: Number(e.target.value) })}
                size="small"
                fullWidth
              />
              <TextField
                label="Longitude"
                type="number"
                value={num(obj(values.location).longitude)}
                onChange={(e) => setField('location', { ...obj(values.location), id: obj(values.location).id ?? 'main', longitude: Number(e.target.value) })}
                size="small"
                fullWidth
              />
            </Stack>
            <TextField
              label="Opening hours (optional)"
              value={str(obj(values.location).openingHours)}
              onChange={(e) => setField('location', { ...obj(values.location), id: obj(values.location).id ?? 'main', openingHours: e.target.value })}
              size="small"
              fullWidth
            />
          </FormSection>
          <Divider />
          <NearbyPlacesField places={arr<NearbyPlace>(values.nearbyPlaces)} onChange={(next) => setField('nearbyPlaces', next)} />
          <Divider />
          <ToggleLinkFieldGroup
            title="Directions button"
            label={str(obj(values.directionsCta).label) || 'Get Directions'}
            enabled={(obj(values.directionsCta).enabled as boolean | undefined) ?? true}
            onChange={(patch) => setOptionalToggle('directionsCta', patch)}
          />
          <ToggleLinkFieldGroup
            title="Open map button"
            label={str(obj(values.mapCta).label) || 'Open Map'}
            enabled={(obj(values.mapCta).enabled as boolean | undefined) ?? true}
            onChange={(patch) => setOptionalToggle('mapCta', patch)}
          />
          <Divider />
          {textField('helperText')}
          {textField('estimateNote')}
        </>
      )}

      <Divider />

      <Stack direction="row" spacing={1.5}>
        <Button variant="contained" onClick={onSubmit} disabled={!canManage || saving || !isDirty}>
          {saving ? 'Saving…' : 'Save changes'}
        </Button>
        <Button onClick={() => reset(initial)} disabled={saving || !isDirty}>
          Reset
        </Button>
        <Box sx={{ flexGrow: 1 }} />
        <Button component="a" href="/" target="_blank" rel="noreferrer" size="small">
          View home page ↗
        </Button>
      </Stack>
    </Stack>
  );
}
