import { adminApi } from '../api';

export const USERS_PATH = '/admin/users';

export type AdminRole = 'SUPER_ADMIN' | 'ADMIN' | 'MANAGER' | 'STAFF';
export type AdminStatus = 'ACTIVE' | 'DISABLED';
export const ADMIN_ROLES: AdminRole[] = ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'STAFF'];

export type AdminUserRow = {
  id: string;
  email: string;
  name: string;
  role: AdminRole;
  status: AdminStatus;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type PermissionOverride = { key: string; granted: boolean };

export type AdminUserDetail = AdminUserRow & {
  effectivePermissions: string[];
  permissionOverrides: PermissionOverride[];
};

export type PermissionInfo = { key: string; description: string };

export type CreateUserInput = {
  email: string;
  name: string;
  role: AdminRole;
  password: string;
};

export type UpdateUserInput = {
  name?: string;
  role?: AdminRole;
  status?: AdminStatus;
};

export const usersApi = {
  list: (params: string) =>
    adminApi.get<{ items: AdminUserRow[]; total: number; page: number; pageSize: number }>(
      `${USERS_PATH}${params}`,
    ),
  get: (id: string) => adminApi.get<AdminUserDetail>(`${USERS_PATH}/${id}`),
  permissions: () => adminApi.get<PermissionInfo[]>(`${USERS_PATH}/permissions`),
  create: (body: CreateUserInput) => adminApi.post<AdminUserRow>(USERS_PATH, body),
  update: (id: string, body: UpdateUserInput) =>
    adminApi.patch<AdminUserRow>(`${USERS_PATH}/${id}`, body),
  resetPassword: (id: string, newPassword: string) =>
    adminApi.post(`${USERS_PATH}/${id}/reset-password`, { newPassword }),
  setPermissions: (id: string, overrides: PermissionOverride[]) =>
    adminApi.put(`${USERS_PATH}/${id}/permissions`, { overrides }),
  remove: (id: string) => adminApi.delete(`${USERS_PATH}/${id}`),
};
