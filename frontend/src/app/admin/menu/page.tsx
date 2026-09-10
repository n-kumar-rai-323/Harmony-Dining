'use client';

import { useEffect, useMemo, useState } from 'react';

import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  FormControlLabel,
  IconButton,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Paper,
  Stack,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import MoreVertRoundedIcon from '@mui/icons-material/MoreVertRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import RestaurantMenuRoundedIcon from '@mui/icons-material/RestaurantMenuRounded';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import VisibilityOffRoundedIcon from '@mui/icons-material/VisibilityOffRounded';

import { ConfirmDialog, DialogHeader, FilterBar, PageHeader, QueryBoundary } from '@/components/admin/ui';
import { DataTable, type Column } from '@/components/admin/data-table';
import { useToast } from '@/components/admin/toast';
import { useAdminQuery } from '@/lib/admin/use-admin-query';
import { useAdminList } from '@/lib/admin/use-admin-list';
import { useAdminAuth } from '@/lib/admin/auth-context';
import { AdminApiError } from '@/lib/admin/api';
import {
  menuApi,
  MENU_PATH,
  MENU_GROUPS,
  formatPrice,
  type MenuCategory,
  type MenuItem as MenuItemT,
  type MenuGroup,
  type MenuVariant,
} from '@/lib/admin/resources/menu';

export default function AdminMenuPage() {
  const { hasPermission } = useAdminAuth();
  const canCreate = hasPermission('menu.create');
  const canUpdate = hasPermission('menu.update');
  const canPublish = hasPermission('menu.publish');
  const canDelete = hasPermission('menu.delete');
  const toast = useToast();

  const cats = useAdminQuery<MenuCategory[]>(`${MENU_PATH}/categories`);
  const [selectedCat, setSelectedCat] = useState<string>('');

  const items = useAdminList<MenuItemT>(`${MENU_PATH}/items`, {
    pageSize: 50,
  });
  const setItemParam = items.setParam;
  const [searchInput, setSearchInput] = useState('');

  useEffect(() => {
    setItemParam('categoryId', selectedCat || undefined);
  }, [selectedCat, setItemParam]);

  useEffect(() => {
    const t = setTimeout(
      () => setItemParam('search', searchInput.trim() || undefined),
      400,
    );
    return () => clearTimeout(t);
  }, [searchInput, setItemParam]);

  const grouped = useMemo(() => {
    const g: Record<MenuGroup, MenuCategory[]> = { FOOD: [], BEVERAGES: [], BAR: [] };
    for (const c of cats.data ?? []) g[c.group].push(c);
    return g;
  }, [cats.data]);

  const [catMenu, setCatMenu] = useState<{ anchor: HTMLElement; cat: MenuCategory } | null>(null);
  const [catDialog, setCatDialog] = useState<MenuCategory | 'new' | null>(null);
  const [confirmCat, setConfirmCat] = useState<MenuCategory | null>(null);

  const [itemMenu, setItemMenu] = useState<{ anchor: HTMLElement; row: MenuItemT } | null>(null);
  const [itemDialog, setItemDialog] = useState<MenuItemT | 'new' | null>(null);
  const [confirmItem, setConfirmItem] = useState<MenuItemT | null>(null);
  const [busy, setBusy] = useState(false);

  async function act(fn: () => Promise<unknown>, ok: string, refresh: 'cats' | 'items' | 'both') {
    setBusy(true);
    try {
      await fn();
      toast.success(ok);
      if (refresh !== 'items') cats.reload();
      if (refresh !== 'cats') items.reload();
    } catch (err) {
      toast.error(err instanceof AdminApiError ? err.messages[0] : 'Action failed');
    } finally {
      setBusy(false);
      setCatMenu(null);
      setItemMenu(null);
      setConfirmCat(null);
      setConfirmItem(null);
    }
  }

  const columns: Column<MenuItemT>[] = [
    {
      key: 'name',
      header: 'Item',
      render: (r) => (
        <Box>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {r.name}
            </Typography>
            {r.isFeatured && (
              <Chip size="small" label="Featured" color="primary" variant="outlined" />
            )}
          </Stack>
          {r.description && (
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{
                display: '-webkit-box',
                WebkitLineClamp: 1,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                maxWidth: 380,
              }}
            >
              {r.description}
            </Typography>
          )}
        </Box>
      ),
    },
    { key: 'cat', header: 'Category', width: 140, render: (r) => r.category.name },
    { key: 'price', header: 'Price', width: 120, render: (r) => formatPrice(r) },
    {
      key: 'variants',
      header: 'Variants',
      width: 90,
      align: 'right',
      render: (r) => r.variants.length || '—',
    },
    {
      key: 'status',
      header: 'Status',
      width: 100,
      render: (r) => (
        <Chip
          size="small"
          label={r.status}
          color={r.status === 'PUBLISHED' ? 'success' : 'default'}
        />
      ),
    },
    {
      key: 'actions',
      header: '',
      width: 48,
      align: 'right',
      render: (r) =>
        canUpdate || canPublish || canDelete ? (
          <IconButton
            size="small"
            disabled={busy}
            onClick={(e) => {
              e.stopPropagation();
              setItemMenu({ anchor: e.currentTarget, row: r });
            }}
          >
            <MoreVertRoundedIcon fontSize="small" />
          </IconButton>
        ) : null,
    },
  ];

  return (
    <Box>
      <PageHeader
        title="Menu"
        subtitle="Categories, dishes and their variants."
        action={
          canCreate && (
            <Button
              variant="contained"
              startIcon={<AddRoundedIcon />}
              onClick={() => setItemDialog('new')}
            >
              Add item
            </Button>
          )
        }
      />

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '260px 1fr' }, gap: 3 }}>
        {/* categories */}
        <Paper variant="outlined" sx={{ p: 1.5, alignSelf: 'start' }}>
          <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="subtitle2">Categories</Typography>
            {canCreate && (
              <IconButton size="small" onClick={() => setCatDialog('new')}>
                <AddRoundedIcon fontSize="small" />
              </IconButton>
            )}
          </Stack>
          <ListItemButton
            selected={selectedCat === ''}
            onClick={() => setSelectedCat('')}
            sx={{ borderRadius: 1 }}
          >
            <ListItemText primary="All items" slotProps={{ primary: { variant: 'body2' } }} />
          </ListItemButton>
          <QueryBoundary loading={cats.loading && !cats.data} error={cats.error} onRetry={cats.reload}>
            {MENU_GROUPS.map((g) =>
              grouped[g].length ? (
                <Box key={g} sx={{ mt: 1 }}>
                  <Typography variant="overline" color="text.secondary" sx={{ px: 1 }}>
                    {g}
                  </Typography>
                  {grouped[g].map((c) => (
                    <Stack
                      key={c.id}
                      direction="row"
                      sx={{ alignItems: 'center' }}
                    >
                      <ListItemButton
                        selected={selectedCat === c.id}
                        onClick={() => setSelectedCat(c.id)}
                        sx={{ borderRadius: 1, flexGrow: 1, minWidth: 0 }}
                      >
                        <Box sx={{ minWidth: 0, flexGrow: 1 }}>
                          <Typography variant="body2" noWrap>
                            {c.name}
                          </Typography>
                        </Box>
                        <Chip
                          size="small"
                          label={c._count.items}
                          sx={{ mr: 0.5 }}
                        />
                        {c.status === 'DRAFT' && (
                          <Chip size="small" label="draft" variant="outlined" />
                        )}
                      </ListItemButton>
                      {(canUpdate || canPublish || canDelete) && (
                        <IconButton
                          size="small"
                          onClick={(e) => setCatMenu({ anchor: e.currentTarget, cat: c })}
                        >
                          <MoreVertRoundedIcon fontSize="small" />
                        </IconButton>
                      )}
                    </Stack>
                  ))}
                </Box>
              ) : null,
            )}
          </QueryBoundary>
        </Paper>

        {/* items */}
        <Box>
          <FilterBar>
            <TextField
              select
              size="small"
              label="Status"
              value={(items.params.status as string) ?? ''}
              onChange={(e) => items.setParam('status', e.target.value || undefined)}
              sx={{ minWidth: 140 }}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="PUBLISHED">Published</MenuItem>
              <MenuItem value="DRAFT">Draft</MenuItem>
            </TextField>
            <TextField
              size="small"
              label="Search items"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              sx={{ flexGrow: 1 }}
            />
          </FilterBar>

          <QueryBoundary loading={items.loading && !items.data} error={items.error} onRetry={items.reload}>
            <DataTable
              columns={columns}
              rows={items.data?.items ?? []}
              getRowKey={(r) => r.id}
              loading={items.loading}
              emptyText="No items here yet."
              onRowClick={(r) => canUpdate && setItemDialog(r)}
              pagination={{
                page: items.data?.page ?? 1,
                pageSize: items.data?.pageSize ?? 50,
                total: items.data?.total ?? 0,
                onPageChange: (p) => items.setParam('page', p),
                onPageSizeChange: (s) => items.setParam('pageSize', s),
              }}
            />
          </QueryBoundary>
        </Box>
      </Box>

      {/* category action menu */}
      <Menu anchorEl={catMenu?.anchor ?? null} open={Boolean(catMenu)} onClose={() => setCatMenu(null)}>
        {canUpdate && (
          <MenuItem onClick={() => { setCatDialog(catMenu!.cat); setCatMenu(null); }}>
            <ListItemIcon><EditRoundedIcon fontSize="small" /></ListItemIcon>
            Edit
          </MenuItem>
        )}
        {canPublish && (
          <MenuItem
            onClick={() =>
              act(
                () => menuApi.setCategoryPublished(catMenu!.cat.id, catMenu!.cat.status !== 'PUBLISHED'),
                'Category updated',
                'cats',
              )
            }
          >
            <ListItemIcon>
              {catMenu?.cat.status === 'PUBLISHED' ? (
                <VisibilityOffRoundedIcon fontSize="small" />
              ) : (
                <VisibilityRoundedIcon fontSize="small" />
              )}
            </ListItemIcon>
            {catMenu?.cat.status === 'PUBLISHED' ? 'Unpublish' : 'Publish'}
          </MenuItem>
        )}
        {canDelete && (
          <MenuItem
            onClick={() => { setConfirmCat(catMenu!.cat); setCatMenu(null); }}
            sx={{ color: 'error.main' }}
          >
            <ListItemIcon><DeleteOutlineRoundedIcon fontSize="small" color="error" /></ListItemIcon>
            Delete
          </MenuItem>
        )}
      </Menu>

      {/* item action menu */}
      <Menu anchorEl={itemMenu?.anchor ?? null} open={Boolean(itemMenu)} onClose={() => setItemMenu(null)}>
        {canUpdate && (
          <MenuItem onClick={() => { setItemDialog(itemMenu!.row); setItemMenu(null); }}>
            <ListItemIcon><EditRoundedIcon fontSize="small" /></ListItemIcon>
            Edit
          </MenuItem>
        )}
        {canPublish && (
          <MenuItem
            onClick={() =>
              act(
                () => menuApi.setItemPublished(itemMenu!.row.id, itemMenu!.row.status !== 'PUBLISHED'),
                'Item updated',
                'items',
              )
            }
          >
            <ListItemIcon>
              {itemMenu?.row.status === 'PUBLISHED' ? (
                <VisibilityOffRoundedIcon fontSize="small" />
              ) : (
                <VisibilityRoundedIcon fontSize="small" />
              )}
            </ListItemIcon>
            {itemMenu?.row.status === 'PUBLISHED' ? 'Unpublish' : 'Publish'}
          </MenuItem>
        )}
        {canDelete && (
          <MenuItem
            onClick={() => { setConfirmItem(itemMenu!.row); setItemMenu(null); }}
            sx={{ color: 'error.main' }}
          >
            <ListItemIcon><DeleteOutlineRoundedIcon fontSize="small" color="error" /></ListItemIcon>
            Delete
          </MenuItem>
        )}
      </Menu>

      {catDialog && (
        <CategoryDialog
          category={catDialog === 'new' ? null : catDialog}
          onClose={() => setCatDialog(null)}
          onSaved={() => { setCatDialog(null); cats.reload(); }}
        />
      )}

      {itemDialog && (
        <ItemDialog
          item={itemDialog === 'new' ? null : itemDialog}
          categories={cats.data ?? []}
          defaultCategoryId={selectedCat || undefined}
          onClose={() => setItemDialog(null)}
          onSaved={() => { setItemDialog(null); items.reload(); cats.reload(); }}
        />
      )}

      <ConfirmDialog
        open={Boolean(confirmCat)}
        title="Delete category?"
        body={confirmCat ? `"${confirmCat.name}" and its ${confirmCat._count.items} item(s) will be removed.` : ''}
        confirmLabel="Delete"
        destructive
        busy={busy}
        onCancel={() => setConfirmCat(null)}
        onConfirm={() => act(() => menuApi.deleteCategory(confirmCat!.id), 'Category deleted', 'both')}
      />
      <ConfirmDialog
        open={Boolean(confirmItem)}
        title="Delete item?"
        body={confirmItem ? `"${confirmItem.name}" will be removed from the menu.` : ''}
        confirmLabel="Delete"
        destructive
        busy={busy}
        onCancel={() => setConfirmItem(null)}
        onConfirm={() => act(() => menuApi.deleteItem(confirmItem!.id), 'Item deleted', 'items')}
      />
    </Box>
  );
}

/* --------------------------------------------------------- category dialog */

function CategoryDialog({
  category,
  onClose,
  onSaved,
}: {
  category: MenuCategory | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const toast = useToast();
  const [name, setName] = useState(category?.name ?? '');
  const [group, setGroup] = useState<MenuGroup>(category?.group ?? 'FOOD');
  const [description, setDescription] = useState(category?.description ?? '');
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  async function save() {
    setSaving(true);
    setErrors([]);
    try {
      const body = { name: name.trim(), group, description: description.trim() || undefined };
      if (category) await menuApi.updateCategory(category.id, body);
      else await menuApi.createCategory(body);
      toast.success('Category saved');
      onSaved();
    } catch (err) {
      if (err instanceof AdminApiError) setErrors(err.messages);
      else toast.error('Could not save');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open onClose={saving ? undefined : onClose} maxWidth="xs" fullWidth>
      <DialogHeader icon={RestaurantMenuRoundedIcon} title={category ? 'Edit category' : 'New category'} onClose={saving ? undefined : onClose} />
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 0.5 }}>
          {errors.map((m, i) => (
            <Typography key={i} variant="caption" color="error">{m}</Typography>
          ))}
          <TextField label="Name" value={name} onChange={(e) => setName(e.target.value)} fullWidth autoFocus />
          <TextField
            select
            label="Group"
            value={group}
            onChange={(e) => setGroup(e.target.value as MenuGroup)}
            fullWidth
          >
            {MENU_GROUPS.map((g) => (
              <MenuItem key={g} value={g}>{g}</MenuItem>
            ))}
          </TextField>
          <TextField
            label="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            fullWidth
            multiline
            minRows={2}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={saving}>Cancel</Button>
        <Button variant="contained" onClick={save} disabled={saving || name.trim().length < 2}>
          {saving ? 'Saving…' : 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

/* ------------------------------------------------------------- item dialog */

function ItemDialog({
  item,
  categories,
  defaultCategoryId,
  onClose,
  onSaved,
}: {
  item: MenuItemT | null;
  categories: MenuCategory[];
  defaultCategoryId?: string;
  onClose: () => void;
  onSaved: () => void;
}) {
  const toast = useToast();
  const [categoryId, setCategoryId] = useState(
    item?.categoryId ?? defaultCategoryId ?? categories[0]?.id ?? '',
  );
  const [name, setName] = useState(item?.name ?? '');
  const [description, setDescription] = useState(item?.description ?? '');
  const [priceMode, setPriceMode] = useState<'number' | 'label' | 'variants'>(
    item?.variants.length ? 'variants' : item?.priceLabel ? 'label' : 'number',
  );
  const [price, setPrice] = useState(item?.price != null ? String(item.price) : '');
  const [priceLabel, setPriceLabel] = useState(item?.priceLabel ?? '');
  const [isFeatured, setIsFeatured] = useState(item?.isFeatured ?? false);
  const [tags, setTags] = useState((item?.tags ?? []).join(', '));
  const [variants, setVariants] = useState<MenuVariant[]>(item?.variants ?? []);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  function setVariant(i: number, patch: Partial<MenuVariant>) {
    setVariants(variants.map((v, j) => (j === i ? { ...v, ...patch } : v)));
  }

  async function save() {
    setSaving(true);
    setErrors([]);
    try {
      const body = {
        categoryId,
        name: name.trim(),
        description: description.trim() || undefined,
        isFeatured,
        tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
        price:
          priceMode === 'number' && price !== '' ? Number(price) : null,
        priceLabel: priceMode === 'label' && priceLabel ? priceLabel.trim() : null,
        variants:
          priceMode === 'variants'
            ? variants
                .filter((v) => v.label.trim())
                .map((v, i) => ({ label: v.label.trim(), price: Number(v.price) || 0, sortOrder: i }))
            : [],
      };
      if (item) await menuApi.updateItem(item.id, body);
      else await menuApi.createItem(body);
      toast.success('Item saved');
      onSaved();
    } catch (err) {
      if (err instanceof AdminApiError) setErrors(err.messages);
      else toast.error('Could not save');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open onClose={saving ? undefined : onClose} maxWidth="sm" fullWidth>
      <DialogHeader icon={RestaurantMenuRoundedIcon} title={item ? 'Edit item' : 'New item'} onClose={saving ? undefined : onClose} />
      <DialogContent dividers>
        <Stack spacing={2}>
          {errors.map((m, i) => (
            <Typography key={i} variant="caption" color="error">{m}</Typography>
          ))}
          <TextField
            select
            label="Category"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            fullWidth
            size="small"
          >
            {categories.map((c) => (
              <MenuItem key={c.id} value={c.id}>{c.name} · {c.group}</MenuItem>
            ))}
          </TextField>
          <TextField label="Name" value={name} onChange={(e) => setName(e.target.value)} fullWidth size="small" />
          <TextField
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            fullWidth
            size="small"
            multiline
            minRows={2}
          />

          <TextField
            select
            label="Pricing"
            value={priceMode}
            onChange={(e) => setPriceMode(e.target.value as typeof priceMode)}
            size="small"
          >
            <MenuItem value="number">Single price</MenuItem>
            <MenuItem value="label">Price label (e.g. Market price)</MenuItem>
            <MenuItem value="variants">Variants (half / full …)</MenuItem>
          </TextField>

          {priceMode === 'number' && (
            <TextField
              label="Price (Rs)"
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              size="small"
            />
          )}
          {priceMode === 'label' && (
            <TextField
              label="Price label"
              value={priceLabel}
              onChange={(e) => setPriceLabel(e.target.value)}
              size="small"
            />
          )}
          {priceMode === 'variants' && (
            <Stack spacing={1}>
              {variants.map((v, i) => (
                <Stack key={i} direction="row" spacing={1}>
                  <TextField
                    label="Label"
                    value={v.label}
                    onChange={(e) => setVariant(i, { label: e.target.value })}
                    size="small"
                    sx={{ flex: 1 }}
                  />
                  <TextField
                    label="Price"
                    type="number"
                    value={v.price}
                    onChange={(e) => setVariant(i, { price: Number(e.target.value) })}
                    size="small"
                    sx={{ width: 120 }}
                  />
                  <IconButton size="small" onClick={() => setVariants(variants.filter((_, j) => j !== i))}>
                    <DeleteOutlineRoundedIcon fontSize="small" />
                  </IconButton>
                </Stack>
              ))}
              <Button
                size="small"
                startIcon={<AddRoundedIcon />}
                onClick={() => setVariants([...variants, { label: '', price: 0 }])}
                sx={{ alignSelf: 'flex-start' }}
              >
                Add variant
              </Button>
            </Stack>
          )}

          <TextField
            label="Tags (comma separated)"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            size="small"
            placeholder="spicy, vegan"
          />
          <FormControlLabel
            control={<Switch checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} />}
            label="Feature on the homepage menu"
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={saving}>Cancel</Button>
        <Button
          variant="contained"
          onClick={save}
          disabled={saving || name.trim().length < 2 || !categoryId}
        >
          {saving ? 'Saving…' : 'Save item'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
