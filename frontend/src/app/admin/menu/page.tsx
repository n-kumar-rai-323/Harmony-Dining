'use client';

import { useEffect, useMemo, useState } from 'react';

import {
  alpha,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  Divider,
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
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import type { Theme } from '@mui/material/styles';
import MoreVertRoundedIcon from '@mui/icons-material/MoreVertRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import AddPhotoAlternateRoundedIcon from '@mui/icons-material/AddPhotoAlternateRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import RestaurantMenuRoundedIcon from '@mui/icons-material/RestaurantMenuRounded';
import CategoryRoundedIcon from '@mui/icons-material/CategoryRounded';
import RemoveShoppingCartRoundedIcon from '@mui/icons-material/RemoveShoppingCartRounded';
import UploadRoundedIcon from '@mui/icons-material/UploadRounded';
import ImageRoundedIcon from '@mui/icons-material/ImageRounded';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import VisibilityOffRoundedIcon from '@mui/icons-material/VisibilityOffRounded';

import { Controller, useFieldArray, useForm, useWatch } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

import { ConfirmDialog, DialogHeader, FilterBar, FormSection, PageHeader, QueryBoundary, StatCard } from '@/components/admin/ui';
import { DataTable, type Column } from '@/components/admin/data-table';
import { useToast } from '@/components/admin/toast';
import { useAdminQuery } from '@/lib/admin/use-admin-query';
import { useAdminList } from '@/lib/admin/use-admin-list';
import { useAdminAuth } from '@/lib/admin/auth-context';
import { AdminApiError } from '@/lib/admin/api';
import type { Paginated } from '@/lib/admin/types';
import { uploadMedia, ACCEPTED_IMAGE_TYPES } from '@/lib/admin/resources/media';
import {
  menuApi,
  MENU_PATH,
  MENU_GROUPS,
  DIETARY_TYPES,
  formatPrice,
  type MenuCategory,
  type MenuItem as MenuItemT,
  type MenuGroup,
  type DietaryType,
  type DietaryOption,
} from '@/lib/admin/resources/menu';
import {
  menuCategorySchema,
  MENU_CATEGORY_LIMITS,
  type MenuCategoryFormValues,
} from '@/validation/menu-category.schema';
import {
  menuItemSchema,
  MENU_ITEM_LIMITS,
  type MenuItemFormValues,
} from '@/validation/menu-item.schema';

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

const NONE_LABEL = 'None';

/** Resolves a dietary option's colour (or the neutral "None" grey) against the theme. */
function dietaryMarkColor(t: Theme, color: DietaryOption['color'] | 'neutral') {
  if (color === 'success') return t.palette.success.main;
  if (color === 'warning') return t.palette.warning.main;
  if (color === 'error') return t.palette.error.dark;
  return t.palette.grey[500];
}

/** The bordered square mark shared by every dietary option, including "None". */
function DietaryMark({
  color,
  shape,
  label,
}: {
  color: DietaryOption['color'] | 'neutral';
  shape: DietaryOption['shape'];
  label: string;
}) {
  return (
    <Box
      title={label}
      aria-label={label}
      sx={(t) => ({
        width: 14,
        height: 14,
        flexShrink: 0,
        border: '1.5px solid',
        borderColor: dietaryMarkColor(t, color),
        borderRadius: '3px',
        display: 'grid',
        placeItems: 'center',
      })}
    >
      {shape === 'triangle' ? (
        <Box
          sx={(t) => ({
            width: 0,
            height: 0,
            borderLeft: '4px solid transparent',
            borderRight: '4px solid transparent',
            borderBottom: `7px solid ${dietaryMarkColor(t, color)}`,
          })}
        />
      ) : (
        <Box
          sx={(t) => ({
            width: 6,
            height: 6,
            borderRadius: '50%',
            bgcolor: dietaryMarkColor(t, color),
          })}
        />
      )}
    </Box>
  );
}

/** The standard veg / non-veg / egg mark for an item row. Renders nothing when unset. */
function DietaryDot({ type }: { type: DietaryType | null }) {
  const option = DIETARY_TYPES.find((d) => d.value === type);
  if (!option) return null;
  return <DietaryMark color={option.color} shape={option.shape} label={option.label} />;
}

/** Same mark, but shows a neutral grey square for the "None" dropdown option. */
function DietaryOptionMark({ value }: { value: DietaryType | '' }) {
  const option = DIETARY_TYPES.find((d) => d.value === value);
  if (option) return <DietaryMark color={option.color} shape={option.shape} label={option.label} />;
  return <DietaryMark color="neutral" shape="dot" label={NONE_LABEL} />;
}

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
  const totalItemsStat = useAdminQuery<Paginated<unknown>>(`${MENU_PATH}/items?pageSize=1`);
  const outOfStockStat = useAdminQuery<Paginated<unknown>>(
    `${MENU_PATH}/items?pageSize=1&isAvailable=false`,
  );
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
      if (refresh !== 'cats') {
        items.reload();
        totalItemsStat.reload();
        outOfStockStat.reload();
      }
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
        <Stack direction="row" spacing={1.25} sx={{ alignItems: 'center' }}>
          {r.media?.url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={r.media.url}
              alt=""
              style={{ width: 36, height: 36, objectFit: 'cover', borderRadius: 6, flexShrink: 0 }}
            />
          ) : (
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: 1.5,
                flexShrink: 0,
                display: 'grid',
                placeItems: 'center',
                bgcolor: (t) => alpha(t.palette.primary.main, 0.08),
                color: 'primary.main',
              }}
            >
              <ImageRoundedIcon fontSize="small" />
            </Box>
          )}
          <Box sx={{ minWidth: 0 }}>
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
              <DietaryDot type={r.dietary} />
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
        </Stack>
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
      width: 170,
      render: (r) => (
        <Stack direction="row" spacing={0.5}>
          <Chip
            size="small"
            label={r.status}
            color={r.status === 'PUBLISHED' ? 'success' : 'default'}
          />
          {!r.isAvailable && <Chip size="small" label="Out of stock" color="error" variant="outlined" />}
        </Stack>
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

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' },
          gap: 2,
          mb: 3,
        }}
      >
        <StatCard
          label="Total items"
          value={totalItemsStat.data?.total ?? '—'}
          icon={RestaurantMenuRoundedIcon}
        />
        <StatCard
          label="Categories"
          value={cats.data?.length ?? '—'}
          icon={CategoryRoundedIcon}
        />
        <StatCard
          label="Out of stock"
          value={outOfStockStat.data?.total ?? '—'}
          icon={RemoveShoppingCartRoundedIcon}
          color={outOfStockStat.data && outOfStockStat.data.total > 0 ? 'error' : 'primary'}
          emphasis={Boolean(outOfStockStat.data && outOfStockStat.data.total > 0)}
        />
      </Box>

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
          onCategoryCreated={cats.reload}
          onSaved={() => {
            setItemDialog(null);
            items.reload();
            cats.reload();
            totalItemsStat.reload();
            outOfStockStat.reload();
          }}
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
  onSaved: (saved: MenuCategory) => void;
}) {
  const toast = useToast();
  const [errors, setErrors] = useState<string[]>([]);

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<MenuCategoryFormValues>({
    resolver: yupResolver(menuCategorySchema),
    mode: 'onTouched',
    defaultValues: {
      name: category?.name ?? '',
      group: category?.group ?? 'FOOD',
      description: category?.description ?? '',
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    setErrors([]);
    try {
      const body = {
        name: values.name.trim(),
        group: values.group,
        description: values.description?.trim() || undefined,
      };
      const saved = category
        ? await menuApi.updateCategory(category.id, body)
        : await menuApi.createCategory(body);
      toast.success('Category saved');
      onSaved(saved);
    } catch (err) {
      if (err instanceof AdminApiError) setErrors(err.messages);
      else toast.error('Could not save');
    }
  }, (formErrors) => {
    const messages = flattenFormErrors(formErrors as Record<string, unknown>);
    setErrors(messages.length > 0 ? messages : ['Please check the highlighted fields.']);
    toast.error(messages[0] ?? 'Please check the highlighted fields.');
  });

  return (
    <Dialog open onClose={isSubmitting ? undefined : onClose} maxWidth="xs" fullWidth>
      <DialogHeader icon={RestaurantMenuRoundedIcon} title={category ? 'Edit category' : 'New category'} onClose={isSubmitting ? undefined : onClose} />
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 0.5 }}>
          {errors.map((m, i) => (
            <Typography key={i} variant="caption" color="error">{m}</Typography>
          ))}
          <Controller
            name="name"
            control={control}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                label="Name"
                fullWidth
                autoFocus
                slotProps={{ htmlInput: { maxLength: MENU_CATEGORY_LIMITS.name } }}
                error={Boolean(fieldState.error)}
                helperText={fieldState.error?.message ?? `${field.value.length}/${MENU_CATEGORY_LIMITS.name}`}
              />
            )}
          />
          <Controller
            name="group"
            control={control}
            render={({ field }) => (
              <TextField {...field} select label="Group" fullWidth>
                {MENU_GROUPS.map((g) => (
                  <MenuItem key={g} value={g}>{g}</MenuItem>
                ))}
              </TextField>
            )}
          />
          <Controller
            name="description"
            control={control}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                label="Description (optional)"
                fullWidth
                multiline
                minRows={2}
                slotProps={{ htmlInput: { maxLength: MENU_CATEGORY_LIMITS.description } }}
                error={Boolean(fieldState.error)}
                helperText={fieldState.error?.message ?? `${(field.value ?? '').length}/${MENU_CATEGORY_LIMITS.description}`}
              />
            )}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isSubmitting}>Cancel</Button>
        <Button variant="contained" onClick={onSubmit} disabled={isSubmitting}>
          {isSubmitting ? 'Saving…' : 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

/* ------------------------------------------------------------- item dialog */

const NEW_CATEGORY_VALUE = '__new__';

function ItemDialog({
  item,
  categories,
  defaultCategoryId,
  onClose,
  onSaved,
  onCategoryCreated,
}: {
  item: MenuItemT | null;
  categories: MenuCategory[];
  defaultCategoryId?: string;
  onClose: () => void;
  onSaved: () => void;
  onCategoryCreated: () => void;
}) {
  const toast = useToast();
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [photoUrl, setPhotoUrl] = useState(item?.media?.url ?? '');
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const {
    control,
    handleSubmit,
    setValue,
    formState: { isSubmitting, errors: fieldErrors },
  } = useForm<MenuItemFormValues>({
    resolver: yupResolver(menuItemSchema),
    mode: 'onTouched',
    defaultValues: {
      categoryId: item?.categoryId ?? defaultCategoryId ?? categories[0]?.id ?? '',
      name: item?.name ?? '',
      description: item?.description ?? '',
      mediaId: item?.mediaId ?? '',
      dietary: item?.dietary ?? '',
      isAvailable: item?.isAvailable ?? true,
      isFeatured: item?.isFeatured ?? false,
      priceMode: item?.variants.length ? 'variants' : 'number',
      price: item?.price != null ? String(item.price) : '',
      tags: (item?.tags ?? []).join(', '),
      ingredients: (item?.ingredients ?? []).join(', '),
      variants: item?.variants ?? [],
    },
  });

  const { fields: variantFields, append: appendVariant, remove: removeVariant } = useFieldArray({
    control,
    name: 'variants',
  });

  const priceMode = useWatch({ control, name: 'priceMode' });
  const name = useWatch({ control, name: 'name' });

  async function uploadPhoto(file: File | undefined) {
    if (!file) return;
    setUploading(true);
    try {
      const media = await uploadMedia(file, { folder: 'menu', altText: name || 'Menu item' });
      setValue('mediaId', media.id, { shouldValidate: true });
      setPhotoUrl(media.url);
    } catch (err) {
      toast.error(err instanceof AdminApiError ? err.messages[0] : 'Upload failed');
    } finally {
      setUploading(false);
    }
  }

  const onSubmit = handleSubmit(async (values) => {
    setErrors([]);
    try {
      const body = {
        categoryId: values.categoryId,
        name: values.name.trim(),
        description: values.description?.trim() || undefined,
        mediaId: values.mediaId,
        dietary: values.dietary || null,
        isAvailable: values.isAvailable,
        isFeatured: values.isFeatured,
        tags: values.tags.split(',').map((t) => t.trim()).filter(Boolean),
        ingredients: values.ingredients.split(',').map((t) => t.trim()).filter(Boolean),
        price: values.priceMode === 'number' && values.price !== '' ? Number(values.price) : null,
        variants:
          values.priceMode === 'variants'
            ? values.variants
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
    }
  }, (formErrors) => {
    const messages = flattenFormErrors(formErrors as Record<string, unknown>);
    setErrors(messages.length > 0 ? messages : ['Please check the highlighted fields.']);
    toast.error(messages[0] ?? 'Please check the highlighted fields.');
  });

  const saving = isSubmitting;

  return (
    <>
    <Dialog open onClose={saving || uploading ? undefined : onClose} maxWidth="sm" fullWidth>
      <DialogHeader icon={RestaurantMenuRoundedIcon} title={item ? 'Edit item' : 'New item'} onClose={saving || uploading ? undefined : onClose} />
      <DialogContent dividers>
        <Stack spacing={3}>
          {errors.length > 0 && (
            <Stack spacing={0.5}>
              {errors.map((m, i) => (
                <Typography key={i} variant="caption" color="error">{m}</Typography>
              ))}
            </Stack>
          )}

          <FormSection title="Photo">
            <Controller
              name="mediaId"
              control={control}
              render={({ fieldState }) => (
                <>
                  <Box
                    component="label"
                    sx={{
                      position: 'relative',
                      display: 'block',
                      width: '100%',
                      height: 160,
                      borderRadius: 2,
                      overflow: 'hidden',
                      cursor: uploading ? 'default' : 'pointer',
                      border: '1px dashed',
                      borderColor: photoUrl ? 'transparent' : fieldState.error ? 'error.main' : 'divider',
                      bgcolor: photoUrl ? 'transparent' : (t) => alpha(t.palette.primary.main, 0.04),
                      transition: 'border-color 150ms ease, background-color 150ms ease',
                      '&:hover': uploading
                        ? undefined
                        : {
                            borderColor: photoUrl ? 'transparent' : 'primary.main',
                            bgcolor: photoUrl ? 'transparent' : (t) => alpha(t.palette.primary.main, 0.08),
                          },
                    }}
                  >
                    <input
                      type="file"
                      hidden
                      accept={ACCEPTED_IMAGE_TYPES}
                      disabled={uploading}
                      onChange={(e) => uploadPhoto(e.target.files?.[0])}
                    />
                    {photoUrl ? (
                      <>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={photoUrl}
                          alt=""
                          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                        />
                        <Stack
                          direction="row"
                          spacing={0.75}
                          sx={{
                            position: 'absolute',
                            insetInline: 0,
                            bottom: 0,
                            alignItems: 'center',
                            px: 1.5,
                            py: 0.75,
                            color: '#fff',
                            bgcolor: 'rgba(0,0,0,0.55)',
                            backdropFilter: 'blur(4px)',
                            WebkitBackdropFilter: 'blur(4px)',
                          }}
                        >
                          {uploading ? (
                            <CircularProgress size={14} sx={{ color: '#fff' }} />
                          ) : (
                            <UploadRoundedIcon sx={{ fontSize: 16 }} />
                          )}
                          <Typography variant="caption" sx={{ fontWeight: 600 }}>
                            {uploading ? 'Uploading…' : 'Replace photo'}
                          </Typography>
                        </Stack>
                      </>
                    ) : (
                      <Stack
                        spacing={0.5}
                        sx={{
                          height: '100%',
                          alignItems: 'center',
                          justifyContent: 'center',
                          px: 2,
                          textAlign: 'center',
                        }}
                      >
                        {uploading ? (
                          <>
                            <CircularProgress size={22} />
                            <Typography variant="body2" color="text.secondary">Uploading…</Typography>
                          </>
                        ) : (
                          <>
                            <Box
                              sx={{
                                width: 40,
                                height: 40,
                                borderRadius: '50%',
                                display: 'grid',
                                placeItems: 'center',
                                bgcolor: (t) => alpha(t.palette.primary.main, 0.12),
                                color: 'primary.main',
                              }}
                            >
                              <AddPhotoAlternateRoundedIcon fontSize="small" />
                            </Box>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              Click to upload a photo
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              JPG, PNG or WEBP, up to 8MB
                            </Typography>
                          </>
                        )}
                      </Stack>
                    )}
                  </Box>
                  {fieldState.error && (
                    <Typography variant="caption" color="error" sx={{ display: 'block', mt: 0.5 }}>
                      {fieldState.error.message}
                    </Typography>
                  )}
                </>
              )}
            />
          </FormSection>

          <Divider />

          <FormSection title="Details">
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <Controller
                name="categoryId"
                control={control}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    select
                    label="Category"
                    onChange={(e) => {
                      if (e.target.value === NEW_CATEGORY_VALUE) setShowNewCategory(true);
                      else field.onChange(e.target.value);
                    }}
                    fullWidth
                    size="small"
                    error={Boolean(fieldState.error)}
                    helperText={fieldState.error?.message}
                  >
                    {categories.map((c) => (
                      <MenuItem key={c.id} value={c.id}>{c.name} · {c.group}</MenuItem>
                    ))}
                    <Divider component="li" />
                    <MenuItem value={NEW_CATEGORY_VALUE}>
                      <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center', color: 'primary.main' }}>
                        <AddRoundedIcon fontSize="small" />
                        <span>Create new category</span>
                      </Stack>
                    </MenuItem>
                  </TextField>
                )}
              />
              <Controller
                name="dietary"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    select
                    label="Dietary"
                    fullWidth
                    size="small"
                    sx={{ minWidth: { sm: 150 } }}
                    slotProps={{
                      inputLabel: { shrink: true },
                      select: {
                        displayEmpty: true,
                        renderValue: (value) => {
                          const d = DIETARY_TYPES.find((x) => x.value === value);
                          return (
                            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                              <DietaryOptionMark value={(value as DietaryType | '') ?? ''} />
                              <span>{d ? d.label : NONE_LABEL}</span>
                            </Stack>
                          );
                        },
                      },
                    }}
                  >
                    <MenuItem value="">
                      <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                        <DietaryOptionMark value="" />
                        <Typography variant="body2" color="text.secondary">{NONE_LABEL}</Typography>
                      </Stack>
                    </MenuItem>
                    {DIETARY_TYPES.map((d) => (
                      <MenuItem key={d.value} value={d.value}>
                        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                          <DietaryDot type={d.value} />
                          <span>{d.label}</span>
                        </Stack>
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
            </Stack>
            <Controller
              name="name"
              control={control}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  label="Name"
                  fullWidth
                  size="small"
                  slotProps={{ htmlInput: { maxLength: MENU_ITEM_LIMITS.name } }}
                  error={Boolean(fieldState.error)}
                  helperText={fieldState.error?.message ?? `${field.value.length}/${MENU_ITEM_LIMITS.name}`}
                />
              )}
            />
            <Controller
              name="description"
              control={control}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  label="Description"
                  fullWidth
                  size="small"
                  multiline
                  minRows={2}
                  slotProps={{ htmlInput: { maxLength: MENU_ITEM_LIMITS.description } }}
                  error={Boolean(fieldState.error)}
                  helperText={fieldState.error?.message ?? `${(field.value ?? '').length}/${MENU_ITEM_LIMITS.description}`}
                />
              )}
            />
          </FormSection>

          <Divider />

          <FormSection title="Pricing">
            <Controller
              name="priceMode"
              control={control}
              render={({ field }) => (
                <ToggleButtonGroup
                  value={field.value}
                  exclusive
                  onChange={(_, v) => v && field.onChange(v)}
                  size="small"
                  fullWidth
                  color="primary"
                >
                  <ToggleButton value="number">Single price</ToggleButton>
                  <ToggleButton value="variants">Portions</ToggleButton>
                </ToggleButtonGroup>
              )}
            />

            {priceMode === 'number' && (
              <Controller
                name="price"
                control={control}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    label="Price (Rs)"
                    type="number"
                    fullWidth
                    size="small"
                    error={Boolean(fieldState.error)}
                    helperText={fieldState.error?.message}
                  />
                )}
              />
            )}
            {priceMode === 'variants' && (
              <Stack spacing={1}>
                {variantFields.map((vf, i) => (
                  <Stack key={vf.id} direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                    <Controller
                      name={`variants.${i}.label`}
                      control={control}
                      render={({ field, fieldState }) => (
                        <TextField
                          {...field}
                          label="Portion"
                          size="small"
                          sx={{ flex: 1 }}
                          slotProps={{ htmlInput: { maxLength: MENU_ITEM_LIMITS.variantLabel } }}
                          error={Boolean(fieldState.error)}
                          helperText={fieldState.error?.message}
                        />
                      )}
                    />
                    <Stack direction="row" spacing={1}>
                      <Controller
                        name={`variants.${i}.price`}
                        control={control}
                        render={({ field, fieldState }) => (
                          <TextField
                            {...field}
                            label="Price"
                            type="number"
                            size="small"
                            sx={{ width: 120, flexShrink: 0 }}
                            error={Boolean(fieldState.error)}
                            helperText={fieldState.error?.message}
                          />
                        )}
                      />
                      <IconButton size="small" onClick={() => removeVariant(i)}>
                        <DeleteOutlineRoundedIcon fontSize="small" />
                      </IconButton>
                    </Stack>
                  </Stack>
                ))}
                <Button
                  size="small"
                  startIcon={<AddRoundedIcon />}
                  onClick={() => {
                    if (variantFields.length >= MENU_ITEM_LIMITS.variantsMax) {
                      toast.error(`You can add up to ${MENU_ITEM_LIMITS.variantsMax} portions.`);
                      return;
                    }
                    appendVariant({ label: '', price: 0 });
                  }}
                  sx={{ alignSelf: 'flex-start' }}
                >
                  Add portion
                </Button>
                {fieldErrors.variants?.message && (
                  <Typography variant="caption" color="error">
                    {fieldErrors.variants.message}
                  </Typography>
                )}
                <Typography variant="caption" color="text.secondary">
                  e.g. Small / Medium / Large, or Half / Full — label as needed per item.
                </Typography>
              </Stack>
            )}
          </FormSection>

          <Divider />

          <FormSection title="More info">
            <Controller
              name="ingredients"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Ingredients (comma separated)"
                  fullWidth
                  size="small"
                  placeholder="Tomato, garlic, cream"
                />
              )}
            />
            <Controller
              name="tags"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Tags (comma separated)"
                  fullWidth
                  size="small"
                  placeholder="spicy, vegan"
                />
              )}
            />
            <Controller
              name="isAvailable"
              control={control}
              render={({ field }) => (
                <FormControlLabel
                  control={<Switch checked={field.value} onChange={(e) => field.onChange(e.target.checked)} />}
                  label="Available for order"
                />
              )}
            />
            <Controller
              name="isFeatured"
              control={control}
              render={({ field }) => (
                <FormControlLabel
                  control={<Switch checked={field.value} onChange={(e) => field.onChange(e.target.checked)} />}
                  label="Feature on the homepage menu"
                />
              )}
            />
          </FormSection>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={saving || uploading}>Cancel</Button>
        <Button
          variant="contained"
          onClick={onSubmit}
          disabled={saving || uploading}
        >
          {saving ? 'Saving…' : 'Save item'}
        </Button>
      </DialogActions>
    </Dialog>
    {showNewCategory && (
      <CategoryDialog
        category={null}
        onClose={() => setShowNewCategory(false)}
        onSaved={(saved) => {
          onCategoryCreated();
          setValue('categoryId', saved.id, { shouldValidate: true });
          setShowNewCategory(false);
        }}
      />
    )}
    </>
  );
}
