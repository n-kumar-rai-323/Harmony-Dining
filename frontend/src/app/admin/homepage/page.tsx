'use client';

import { useMemo, useState } from 'react';

import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Button,
  Chip,
  Divider,
  FormControlLabel,
  Stack,
  Switch,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';

import { PageHeader, QueryBoundary } from '@/components/admin/ui';
import { useToast } from '@/components/admin/toast';
import { useAdminQuery } from '@/lib/admin/use-admin-query';
import { useAdminAuth } from '@/lib/admin/auth-context';
import { AdminApiError } from '@/lib/admin/api';
import {
  homepageApi,
  HOMEPAGE_PATH,
  SECTION_KEYS,
  SECTION_LABEL,
  COMMON_TEXT_FIELDS,
  type HomepageAdminView,
  type SectionKey,
} from '@/lib/admin/resources/homepage';

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

  const initial = useMemo(
    () => (entry.value ?? {}) as Record<string, unknown>,
    [entry.value],
  );
  const [draft, setDraft] = useState<Record<string, unknown>>(initial);
  const [jsonText, setJsonText] = useState(() => JSON.stringify(initial, null, 2));
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [saveErrors, setSaveErrors] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);

  const commonFields = COMMON_TEXT_FIELDS.filter((f) => f in draft);
  const dirty = JSON.stringify(draft) !== JSON.stringify(initial);

  function updateField(field: string, value: string) {
    const next = { ...draft };
    if (value === '') delete next[field];
    else next[field] = value;
    setDraft(next);
    setJsonText(JSON.stringify(next, null, 2));
  }

  function onJsonChange(text: string) {
    setJsonText(text);
    try {
      const parsed = JSON.parse(text);
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        setDraft(parsed as Record<string, unknown>);
        setJsonError(null);
      } else {
        setJsonError('The section must be a JSON object.');
      }
    } catch (e) {
      setJsonError(e instanceof Error ? e.message : 'Invalid JSON');
    }
  }

  async function save() {
    if (jsonError) return;
    setSaving(true);
    setSaveErrors([]);
    try {
      await homepageApi.save(sectionKey, draft);
      toast.success(`${SECTION_LABEL[sectionKey]} saved`);
      onSaved();
    } catch (err) {
      if (err instanceof AdminApiError) {
        setSaveErrors(err.messages);
        toast.error('Could not save — see the errors below');
      } else {
        toast.error('Could not save');
      }
    } finally {
      setSaving(false);
    }
  }

  async function togglePublished() {
    setPublishing(true);
    try {
      await homepageApi.setPublished(sectionKey, !entry.isPublished);
      toast.success(entry.isPublished ? 'Section hidden' : 'Section published');
      onSaved();
    } catch (err) {
      toast.error(
        err instanceof AdminApiError ? err.messages[0] : 'Could not update',
      );
    } finally {
      setPublishing(false);
    }
  }

  return (
    <Stack spacing={3} sx={{ maxWidth: 760 }}>
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
        <Alert severity="error">
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            Validation failed
          </Typography>
          <Box component="ul" sx={{ m: 0, pl: 2 }}>
            {saveErrors.map((m, i) => (
              <li key={i}>
                <Typography variant="caption">{m}</Typography>
              </li>
            ))}
          </Box>
        </Alert>
      )}

      {commonFields.length > 0 && (
        <Stack spacing={2}>
          {commonFields.map((f) => (
            <TextField
              key={f}
              label={f}
              value={(draft[f] as string | undefined) ?? ''}
              onChange={(e) => updateField(f, e.target.value)}
              disabled={!canManage}
              fullWidth
              multiline={f === 'description' || f === 'supportingNote'}
              minRows={f === 'description' || f === 'supportingNote' ? 2 : undefined}
              size="small"
            />
          ))}
        </Stack>
      )}

      <Accordion variant="outlined" disableGutters>
        <AccordionSummary expandIcon={<ExpandMoreRoundedIcon />}>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            Full section JSON (images, links, cards, …)
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <TextField
            value={jsonText}
            onChange={(e) => onJsonChange(e.target.value)}
            disabled={!canManage}
            fullWidth
            multiline
            minRows={14}
            error={Boolean(jsonError)}
            helperText={jsonError ?? 'Edited here or via the fields above — both stay in sync.'}
            slotProps={{ input: { sx: { fontFamily: 'monospace', fontSize: 13 } } }}
          />
        </AccordionDetails>
      </Accordion>

      <Divider />

      <Stack direction="row" spacing={1.5}>
        <Button
          variant="contained"
          onClick={save}
          disabled={!canManage || saving || !dirty || Boolean(jsonError)}
        >
          {saving ? 'Saving…' : 'Save changes'}
        </Button>
        <Button
          onClick={() => {
            setDraft(initial);
            setJsonText(JSON.stringify(initial, null, 2));
            setJsonError(null);
            setSaveErrors([]);
          }}
          disabled={saving || !dirty}
        >
          Reset
        </Button>
        <Box sx={{ flexGrow: 1 }} />
        <Button
          component="a"
          href="/"
          target="_blank"
          rel="noreferrer"
          size="small"
        >
          View home page ↗
        </Button>
      </Stack>
    </Stack>
  );
}
