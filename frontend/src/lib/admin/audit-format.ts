import { alpha } from '@mui/material/styles';
import type { Theme } from '@mui/material/styles';
import type { SvgIconComponent } from '@mui/icons-material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import BlockRoundedIcon from '@mui/icons-material/BlockRounded';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import VisibilityOffRoundedIcon from '@mui/icons-material/VisibilityOffRounded';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import StarBorderRoundedIcon from '@mui/icons-material/StarBorderRounded';
import CancelRoundedIcon from '@mui/icons-material/CancelRounded';
import DoneAllRoundedIcon from '@mui/icons-material/DoneAllRounded';
import HistoryRoundedIcon from '@mui/icons-material/HistoryRounded';

/**
 * Turns a raw audit log row (action="menu_item.update", entityType="MenuItem", ...)
 * into human-readable, consistently-styled pieces — shared by the Audit log page
 * and the Dashboard's "Recent activity" panel so they read the same way.
 */

export type AuditLike = {
  action: string;
  entityType: string;
  before?: unknown;
  after?: unknown;
};

const ENTITY_LABELS: Record<string, string> = {
  MenuItem: 'Menu',
  MenuCategory: 'Menu',
  GalleryItem: 'Gallery',
  Media: 'Media',
  Event: 'Events',
  EventMedia: 'Events',
  HomepageSection: 'Homepage',
  SiteSetting: 'Site settings',
  Review: 'Reviews',
  Reservation: 'Reservations',
  ReservationSettings: 'Reservations',
  DisabledDate: 'Reservations',
  EventEnquiry: 'Event enquiries',
  AdminUser: 'Admin users',
  ContactMessage: 'Messages',
};

export function sectionLabel(entityType: string): string {
  return ENTITY_LABELS[entityType] ?? entityType;
}

export type Tone = 'success' | 'error' | 'info' | 'warning' | 'neutral';
export type ActionMeta = { label: string; tone: Tone; icon: SvgIconComponent };

const ACTION_META: Record<string, ActionMeta> = {
  create: { label: 'created', tone: 'success', icon: AddRoundedIcon },
  update: { label: 'updated', tone: 'info', icon: EditRoundedIcon },
  delete: { label: 'deleted', tone: 'error', icon: DeleteOutlineRoundedIcon },
  approve: { label: 'approved', tone: 'success', icon: CheckRoundedIcon },
  reject: { label: 'rejected', tone: 'error', icon: BlockRoundedIcon },
  publish: { label: 'published', tone: 'success', icon: VisibilityRoundedIcon },
  unpublish: { label: 'unpublished', tone: 'warning', icon: VisibilityOffRoundedIcon },
  feature: { label: 'featured', tone: 'success', icon: StarRoundedIcon },
  unfeature: { label: 'unfeatured', tone: 'neutral', icon: StarBorderRoundedIcon },
  confirm: { label: 'confirmed', tone: 'success', icon: CheckRoundedIcon },
  cancel: { label: 'cancelled', tone: 'warning', icon: CancelRoundedIcon },
  complete: { label: 'completed', tone: 'success', icon: DoneAllRoundedIcon },
  reorder: { label: 'reordered', tone: 'info', icon: EditRoundedIcon },
  reply: { label: 'replied to', tone: 'info', icon: EditRoundedIcon },
  reply_clear: { label: 'cleared the reply on', tone: 'neutral', icon: DeleteOutlineRoundedIcon },
  read: { label: 'marked read', tone: 'neutral', icon: VisibilityRoundedIcon },
  unread: { label: 'marked unread', tone: 'neutral', icon: VisibilityOffRoundedIcon },
};

export function actionMeta(action: string): ActionMeta {
  const verb = action.split('.').pop() ?? action;
  return (
    ACTION_META[verb] ?? { label: verb.replace(/_/g, ' '), tone: 'neutral', icon: HistoryRoundedIcon }
  );
}

/** Text color for a tone, as an sx theme path. */
export function toneColor(tone: Tone): string {
  return tone === 'neutral' ? 'text.secondary' : `${tone}.main`;
}

/** Soft circular background for a tone's icon chip. */
export function toneBg(tone: Tone) {
  return (t: Theme) =>
    tone === 'neutral'
      ? alpha(t.palette.text.secondary, 0.1)
      : alpha(t.palette[tone].main, 0.14);
}

function prettifyKey(key: string): string {
  return key
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/_/g, ' ')
    .toLowerCase();
}

function formatValue(v: unknown): string {
  if (v === null || v === undefined) return '—';
  if (typeof v === 'string') return v.length > 60 ? `${v.slice(0, 60)}…` : `"${v}"`;
  if (typeof v === 'number') return String(v);
  if (typeof v === 'boolean') return v ? 'yes' : 'no';
  const s = JSON.stringify(v);
  return s.length > 60 ? `${s.slice(0, 60)}…` : s;
}

function pickName(obj: unknown): string | null {
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return null;
  const o = obj as Record<string, unknown>;
  const candidate = o.name ?? o.title ?? o.label ?? o.fullName;
  return typeof candidate === 'string' ? candidate : null;
}

const IGNORED_KEYS = new Set(['id', 'createdAt', 'updatedAt', 'deletedAt']);

/** A best-effort human summary of an audit entry, derived from its before/after diff. */
export function describeChange(entry: AuditLike): string {
  const verb = entry.action.split('.').pop() ?? '';
  const { before, after } = entry;

  if (verb === 'create') {
    const name = pickName(after);
    return name ? `Created "${name}"` : `Created a new ${sectionLabel(entry.entityType).toLowerCase()} record`;
  }
  if (verb === 'delete') {
    const name = pickName(before);
    return name ? `Deleted "${name}"` : `Deleted a ${sectionLabel(entry.entityType).toLowerCase()} record`;
  }

  if (
    before &&
    after &&
    typeof before === 'object' &&
    typeof after === 'object' &&
    !Array.isArray(before) &&
    !Array.isArray(after)
  ) {
    const b = before as Record<string, unknown>;
    const a = after as Record<string, unknown>;
    const changed = Object.keys(a).filter(
      (k) => !IGNORED_KEYS.has(k) && JSON.stringify(b[k]) !== JSON.stringify(a[k]),
    );
    if (changed.length > 0) {
      const key = changed[0];
      const suffix = changed.length > 1 ? ` (+${changed.length - 1} more)` : '';
      return `Changed ${prettifyKey(key)} to ${formatValue(a[key])}${suffix}`;
    }
  }

  const meta = actionMeta(entry.action);
  return `${meta.label.charAt(0).toUpperCase()}${meta.label.slice(1)} ${sectionLabel(entry.entityType)}`;
}
