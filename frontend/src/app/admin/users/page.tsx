'use client';

import { useEffect, useMemo, useState } from 'react';

import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  IconButton,
  ListItemIcon,
  Menu,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import MoreVertRoundedIcon from '@mui/icons-material/MoreVertRounded';
import GroupRoundedIcon from '@mui/icons-material/GroupRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import KeyRoundedIcon from '@mui/icons-material/KeyRounded';
import SecurityRoundedIcon from '@mui/icons-material/SecurityRounded';
import BlockRoundedIcon from '@mui/icons-material/BlockRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';

import { ConfirmDialog, DialogHeader, FilterBar, PageHeader, QueryBoundary } from '@/components/admin/ui';
import { DataTable, type Column } from '@/components/admin/data-table';
import { useToast } from '@/components/admin/toast';
import { useAdminList } from '@/lib/admin/use-admin-list';
import { useAdminQuery } from '@/lib/admin/use-admin-query';
import { useAdminAuth } from '@/lib/admin/auth-context';
import { AdminApiError } from '@/lib/admin/api';
import {
  usersApi,
  USERS_PATH,
  ADMIN_ROLES,
  type AdminUserRow,
  type AdminUserDetail,
  type AdminRole,
  type AdminStatus,
  type PermissionInfo,
  type PermissionOverride,
} from '@/lib/admin/resources/users';
import {
  userFormSchema,
  resetPasswordSchema,
  type UserFormValues,
  type ResetPasswordFormValues,
} from '@/validation/admin-user.schema';

const ROLE_COLOR: Record<AdminRole, 'default' | 'primary' | 'secondary' | 'info'> = {
  SUPER_ADMIN: 'secondary',
  ADMIN: 'primary',
  MANAGER: 'info',
  STAFF: 'default',
};

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

function fmtDateTime(iso: string | null) {
  return iso ? new Date(iso).toLocaleString() : 'never';
}

export default function AdminUsersPage() {
  const { hasPermission, state } = useAdminAuth();
  const canManage = hasPermission('users.manage');
  const myId = state.status === 'authenticated' ? state.user.id : '';
  const toast = useToast();

  const { data, loading, error, reload, params, setParam } =
    useAdminList<AdminUserRow>(USERS_PATH, { pageSize: 20 });
  const [searchInput, setSearchInput] = useState('');
  useEffect(() => {
    const t = setTimeout(
      () => setParam('search', searchInput.trim() || undefined),
      400,
    );
    return () => clearTimeout(t);
  }, [searchInput, setParam]);

  const [menu, setMenu] = useState<{ anchor: HTMLElement; row: AdminUserRow } | null>(null);
  const [editUser, setEditUser] = useState<AdminUserRow | 'new' | null>(null);
  const [pwUser, setPwUser] = useState<AdminUserRow | null>(null);
  const [permUser, setPermUser] = useState<AdminUserRow | null>(null);
  const [confirmDel, setConfirmDel] = useState<AdminUserRow | null>(null);
  const [busy, setBusy] = useState(false);

  async function act(fn: () => Promise<unknown>, ok: string) {
    setBusy(true);
    try {
      await fn();
      toast.success(ok);
      reload();
    } catch (err) {
      toast.error(err instanceof AdminApiError ? err.messages[0] : 'Action failed');
    } finally {
      setBusy(false);
      setMenu(null);
      setConfirmDel(null);
    }
  }

  const columns: Column<AdminUserRow>[] = [
    {
      key: 'user',
      header: 'User',
      render: (r) => (
        <Box>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {r.name}
            </Typography>
            {r.id === myId && (
              <Chip size="small" label="you" variant="outlined" />
            )}
          </Stack>
          <Typography variant="caption" color="text.secondary">
            {r.email}
          </Typography>
        </Box>
      ),
    },
    {
      key: 'role',
      header: 'Role',
      width: 130,
      render: (r) => <Chip size="small" label={r.role} color={ROLE_COLOR[r.role]} />,
    },
    {
      key: 'status',
      header: 'Status',
      width: 110,
      render: (r) => (
        <Chip
          size="small"
          label={r.status}
          color={r.status === 'ACTIVE' ? 'success' : 'default'}
        />
      ),
    },
    {
      key: 'login',
      header: 'Last login',
      width: 170,
      render: (r) => (
        <Typography variant="caption" color="text.secondary">
          {fmtDateTime(r.lastLoginAt)}
        </Typography>
      ),
    },
    {
      key: 'actions',
      header: '',
      width: 48,
      align: 'right',
      render: (r) =>
        canManage ? (
          <IconButton
            size="small"
            disabled={busy}
            onClick={(e) => {
              e.stopPropagation();
              setMenu({ anchor: e.currentTarget, row: r });
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
        title="Admin users"
        subtitle="People who can sign in to this admin panel."
        action={
          canManage && (
            <Button
              variant="contained"
              startIcon={<AddRoundedIcon />}
              onClick={() => setEditUser('new')}
            >
              Add user
            </Button>
          )
        }
      />

      <FilterBar>
        <TextField
          select
          size="small"
          label="Role"
          value={(params.role as string) ?? ''}
          onChange={(e) => setParam('role', e.target.value || undefined)}
          sx={{ minWidth: 150 }}
          slotProps={{ htmlInput: { autoComplete: 'off' } }}
        >
          <MenuItem value="">All</MenuItem>
          {ADMIN_ROLES.map((r) => (
            <MenuItem key={r} value={r}>{r}</MenuItem>
          ))}
        </TextField>
        <TextField
          select
          size="small"
          label="Status"
          value={(params.status as string) ?? ''}
          onChange={(e) => setParam('status', e.target.value || undefined)}
          sx={{ minWidth: 140 }}
          slotProps={{ htmlInput: { autoComplete: 'off' } }}
        >
          <MenuItem value="">All</MenuItem>
          <MenuItem value="ACTIVE">Active</MenuItem>
          <MenuItem value="DISABLED">Disabled</MenuItem>
        </TextField>
        <TextField
          size="small"
          label="Search name or email"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          sx={{ flexGrow: 1 }}
        />
      </FilterBar>

      <QueryBoundary loading={loading && !data} error={error} onRetry={reload}>
        <DataTable
          columns={columns}
          rows={data?.items ?? []}
          getRowKey={(r) => r.id}
          loading={loading}
          emptyText="No users match these filters."
          onRowClick={(r) => canManage && setEditUser(r)}
          pagination={{
            page: data?.page ?? 1,
            pageSize: data?.pageSize ?? 20,
            total: data?.total ?? 0,
            onPageChange: (p) => setParam('page', p),
            onPageSizeChange: (s) => setParam('pageSize', s),
          }}
        />
      </QueryBoundary>

      <Menu anchorEl={menu?.anchor ?? null} open={Boolean(menu)} onClose={() => setMenu(null)}>
        <MenuItem onClick={() => { setEditUser(menu!.row); setMenu(null); }}>
          <ListItemIcon><EditRoundedIcon fontSize="small" /></ListItemIcon>
          Edit
        </MenuItem>
        <MenuItem onClick={() => { setPwUser(menu!.row); setMenu(null); }}>
          <ListItemIcon><KeyRoundedIcon fontSize="small" /></ListItemIcon>
          Reset password
        </MenuItem>
        <MenuItem onClick={() => { setPermUser(menu!.row); setMenu(null); }}>
          <ListItemIcon><SecurityRoundedIcon fontSize="small" /></ListItemIcon>
          Permissions
        </MenuItem>
        <MenuItem
          disabled={menu?.row.id === myId}
          onClick={() =>
            act(
              () =>
                usersApi.update(menu!.row.id, {
                  status: menu!.row.status === 'ACTIVE' ? 'DISABLED' : 'ACTIVE',
                }),
              'User updated',
            )
          }
        >
          <ListItemIcon>
            {menu?.row.status === 'ACTIVE' ? (
              <BlockRoundedIcon fontSize="small" />
            ) : (
              <CheckCircleRoundedIcon fontSize="small" />
            )}
          </ListItemIcon>
          {menu?.row.status === 'ACTIVE' ? 'Disable' : 'Enable'}
        </MenuItem>
        <MenuItem
          disabled={menu?.row.id === myId}
          onClick={() => { setConfirmDel(menu!.row); setMenu(null); }}
          sx={{ color: 'error.main' }}
        >
          <ListItemIcon><DeleteOutlineRoundedIcon fontSize="small" color="error" /></ListItemIcon>
          Delete
        </MenuItem>
      </Menu>

      {editUser && (
        <UserDialog
          user={editUser === 'new' ? null : editUser}
          onClose={() => setEditUser(null)}
          onSaved={() => { setEditUser(null); reload(); }}
        />
      )}
      {pwUser && (
        <PasswordDialog
          user={pwUser}
          onClose={() => setPwUser(null)}
          onDone={() => setPwUser(null)}
        />
      )}
      {permUser && (
        <PermissionsDialog
          user={permUser}
          onClose={() => setPermUser(null)}
          onSaved={() => setPermUser(null)}
        />
      )}

      <ConfirmDialog
        open={Boolean(confirmDel)}
        title="Delete this user?"
        body={confirmDel ? `${confirmDel.name} (${confirmDel.email}) will no longer be able to sign in.` : ''}
        confirmLabel="Delete"
        destructive
        busy={busy}
        onCancel={() => setConfirmDel(null)}
        onConfirm={() => act(() => usersApi.remove(confirmDel!.id), 'User deleted')}
      />
    </Box>
  );
}

/* --------------------------------------------------------------- user dialog */

function UserDialog({
  user,
  onClose,
  onSaved,
}: {
  user: AdminUserRow | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const toast = useToast();
  const { state } = useAdminAuth();
  const myId = state.status === 'authenticated' ? state.user.id : '';
  const myRole = state.status === 'authenticated' ? state.user.role : '';
  const isSelf = Boolean(user) && user!.id === myId;
  // Only a SUPER_ADMIN may grant the SUPER_ADMIN role — matches the backend's
  // assertMayManageRole check, so the option doesn't just fail on save.
  const assignableRoles = ADMIN_ROLES.filter(
    (r) => r !== 'SUPER_ADMIN' || myRole === 'SUPER_ADMIN',
  );

  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const { control, handleSubmit } = useForm<UserFormValues>({
    resolver: yupResolver(userFormSchema),
    mode: 'onTouched',
    defaultValues: {
      mode: user ? 'edit' : 'create',
      email: user?.email ?? '',
      name: user?.name ?? '',
      role: user?.role ?? 'STAFF',
      status: user?.status ?? 'ACTIVE',
      password: '',
    },
  });

  const onSubmit = handleSubmit(
    async (values) => {
      setErrors([]);
      setSaving(true);
      try {
        if (user) {
          await usersApi.update(user.id, {
            name: values.name.trim(),
            role: values.role,
            status: values.status as AdminStatus,
          });
        } else {
          await usersApi.create({
            email: (values.email ?? '').trim(),
            name: values.name.trim(),
            role: values.role,
            password: values.password ?? '',
          });
        }
        toast.success('User saved');
        onSaved();
      } catch (err) {
        if (err instanceof AdminApiError) setErrors(err.messages);
        else toast.error('Could not save');
      } finally {
        setSaving(false);
      }
    },
    (formErrors) => {
      const messages = flattenFormErrors(formErrors as Record<string, unknown>);
      setErrors(messages.length > 0 ? messages : ['Please check the highlighted fields.']);
    },
  );

  return (
    <Dialog open onClose={saving ? undefined : onClose} maxWidth="xs" fullWidth>
      <DialogHeader icon={GroupRoundedIcon} title={user ? 'Edit user' : 'New user'} onClose={saving ? undefined : onClose} />
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 0.5 }}>
          {errors.map((m, i) => (
            <Typography key={i} variant="caption" color="error">{m}</Typography>
          ))}
          {!user && (
            <Controller
              name="email"
              control={control}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  value={field.value ?? ''}
                  label="Email"
                  type="email"
                  fullWidth
                  autoFocus
                  error={Boolean(fieldState.error)}
                  helperText={fieldState.error?.message}
                />
              )}
            />
          )}
          <Controller
            name="name"
            control={control}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                label="Name"
                fullWidth
                error={Boolean(fieldState.error)}
                helperText={fieldState.error?.message}
              />
            )}
          />
          <Controller
            name="role"
            control={control}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                select
                label="Role"
                disabled={isSelf}
                fullWidth
                slotProps={{ htmlInput: { autoComplete: 'off' } }}
                error={Boolean(fieldState.error)}
                helperText={
                  fieldState.error?.message ??
                  (isSelf ? 'You cannot change your own role.' : undefined)
                }
              >
                {assignableRoles.map((r) => (
                  <MenuItem key={r} value={r}>{r}</MenuItem>
                ))}
              </TextField>
            )}
          />
          {user && (
            <Controller
              name="status"
              control={control}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  value={field.value ?? 'ACTIVE'}
                  select
                  label="Status"
                  disabled={isSelf}
                  fullWidth
                  slotProps={{ htmlInput: { autoComplete: 'off' } }}
                  error={Boolean(fieldState.error)}
                  helperText={
                    fieldState.error?.message ??
                    (isSelf ? 'You cannot disable your own account.' : undefined)
                  }
                >
                  <MenuItem value="ACTIVE">Active</MenuItem>
                  <MenuItem value="DISABLED">Disabled</MenuItem>
                </TextField>
              )}
            />
          )}
          {!user && (
            <Controller
              name="password"
              control={control}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  value={field.value ?? ''}
                  label="Temporary password"
                  type="text"
                  fullWidth
                  error={Boolean(fieldState.error)}
                  helperText={
                    fieldState.error?.message ??
                    'At least 10 characters. Share it securely; the user can change it later.'
                  }
                />
              )}
            />
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={saving}>Cancel</Button>
        <Button variant="contained" onClick={onSubmit} disabled={saving}>
          {saving ? 'Saving…' : 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

/* ---------------------------------------------------------- password dialog */

function PasswordDialog({
  user,
  onClose,
  onDone,
}: {
  user: AdminUserRow;
  onClose: () => void;
  onDone: () => void;
}) {
  const toast = useToast();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { control, handleSubmit } = useForm<ResetPasswordFormValues>({
    resolver: yupResolver(resetPasswordSchema),
    mode: 'onTouched',
    defaultValues: { newPassword: '' },
  });

  const onSubmit = handleSubmit(async (values) => {
    setError(null);
    setSaving(true);
    try {
      await usersApi.resetPassword(user.id, values.newPassword);
      toast.success('Password reset');
      onDone();
    } catch (err) {
      setError(err instanceof AdminApiError ? err.messages[0] : 'Could not reset');
    } finally {
      setSaving(false);
    }
  });

  return (
    <Dialog open onClose={saving ? undefined : onClose} maxWidth="xs" fullWidth>
      <DialogHeader icon={KeyRoundedIcon} title="Reset password" onClose={saving ? undefined : onClose} />
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 0.5 }}>
          <Typography variant="body2" color="text.secondary">
            Set a new password for {user.name}. Their existing sessions are ended.
          </Typography>
          {error && <Alert severity="error">{error}</Alert>}
          <Controller
            name="newPassword"
            control={control}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                label="New password"
                type="text"
                fullWidth
                autoFocus
                error={Boolean(fieldState.error)}
                helperText={fieldState.error?.message ?? 'At least 10 characters.'}
              />
            )}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={saving}>Cancel</Button>
        <Button variant="contained" onClick={onSubmit} disabled={saving}>
          {saving ? 'Saving…' : 'Reset password'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

/* ------------------------------------------------------- permissions dialog */

type OverrideChoice = 'default' | 'allow' | 'deny';

function PermissionsDialog({
  user,
  onClose,
  onSaved,
}: {
  user: AdminUserRow;
  onClose: () => void;
  onSaved: () => void;
}) {
  const toast = useToast();
  const detail = useAdminQuery<AdminUserDetail>(`${USERS_PATH}/${user.id}`);
  const catalogue = useAdminQuery<PermissionInfo[]>(`${USERS_PATH}/permissions`);

  const [choices, setChoices] = useState<Record<string, OverrideChoice> | null>(null);
  const [saving, setSaving] = useState(false);

  // Seed choices from the fetched overrides, once.
  if (choices === null && detail.data) {
    const seed: Record<string, OverrideChoice> = {};
    for (const o of detail.data.permissionOverrides) {
      seed[o.key] = o.granted ? 'allow' : 'deny';
    }
    setChoices(seed);
  }

  const effective = useMemo(
    () => new Set(detail.data?.effectivePermissions ?? []),
    [detail.data],
  );

  async function save() {
    if (!choices) return;
    setSaving(true);
    try {
      const overrides: PermissionOverride[] = Object.entries(choices)
        .filter(([, v]) => v !== 'default')
        .map(([key, v]) => ({ key, granted: v === 'allow' }));
      await usersApi.setPermissions(user.id, overrides);
      toast.success('Permissions updated');
      onSaved();
    } catch (err) {
      toast.error(err instanceof AdminApiError ? err.messages[0] : 'Could not save');
    } finally {
      setSaving(false);
    }
  }

  const loading = detail.loading || catalogue.loading || !choices;

  return (
    <Dialog open onClose={saving ? undefined : onClose} maxWidth="sm" fullWidth>
      <DialogHeader icon={SecurityRoundedIcon} title={`Permissions · ${user.name}`} onClose={saving ? undefined : onClose} />
      <DialogContent dividers>
        {loading ? (
          <Typography color="text.secondary">Loading…</Typography>
        ) : (
          <Stack spacing={0.5}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              &quot;Default&quot; follows the {user.role} role. Use Allow / Deny to override
              it for this person.
            </Typography>
            {(catalogue.data ?? []).map((p) => {
              const choice = choices![p.key] ?? 'default';
              return (
                <Stack
                  key={p.key}
                  direction="row"
                  spacing={2}
                  sx={{ alignItems: 'center', py: 0.5 }}
                >
                  <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                    <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                      <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                        {p.key}
                      </Typography>
                      {effective.has(p.key) && (
                        <Chip size="small" label="active" color="success" variant="outlined" />
                      )}
                    </Stack>
                    <Typography variant="caption" color="text.secondary">
                      {p.description}
                    </Typography>
                  </Box>
                  <TextField
                    select
                    size="small"
                    value={choice}
                    onChange={(e) =>
                      setChoices((c) => ({ ...c!, [p.key]: e.target.value as OverrideChoice }))
                    }
                    sx={{ width: 120 }}
                  >
                    <MenuItem value="default">Default</MenuItem>
                    <MenuItem value="allow">Allow</MenuItem>
                    <MenuItem value="deny">Deny</MenuItem>
                  </TextField>
                </Stack>
              );
            })}
          </Stack>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={saving}>Cancel</Button>
        <Button variant="contained" onClick={save} disabled={saving || loading}>
          {saving ? 'Saving…' : 'Save permissions'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
