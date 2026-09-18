import * as yup from 'yup';

import { ADMIN_ROLES, type AdminRole, type AdminStatus } from '@/lib/admin/resources/users';

/* =========================================================
   ADMIN USER SCHEMA
   Mirrors backend CreateUserDto / UpdateUserDto / ResetPasswordDto
   (backend/src/users/dto.ts).

   One dialog handles both "create" and "edit" — `mode` is a
   form-only discriminant (never sent to the API) that switches
   which fields are required.
========================================================= */

export const USER_LIMITS = { name: 120, email: 320, password: 200 };

export const userFormSchema = yup.object({
  mode: yup.mixed<'create' | 'edit'>().oneOf(['create', 'edit']).required(),

  email: yup.string().when('mode', {
    is: 'create',
    then: (s) =>
      s
        .trim()
        .email('Enter a valid email address')
        .max(USER_LIMITS.email, `Email must be under ${USER_LIMITS.email} characters`)
        .required('Email is required'),
    otherwise: (s) => s.strip(),
  }),

  name: yup
    .string()
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .max(USER_LIMITS.name, `Name must be under ${USER_LIMITS.name} characters`)
    .required('Name is required'),

  role: yup
    .mixed<AdminRole>()
    .oneOf(ADMIN_ROLES, 'Choose a role')
    .required('Role is required'),

  status: yup.mixed<AdminStatus>().when('mode', {
    is: 'edit',
    then: (s) => s.oneOf(['ACTIVE', 'DISABLED'], 'Choose a status').required('Status is required'),
    otherwise: (s) => s.strip(),
  }),

  password: yup.string().when('mode', {
    is: 'create',
    then: (s) =>
      s
        .min(10, 'Password must be at least 10 characters')
        .max(USER_LIMITS.password, `Password must be under ${USER_LIMITS.password} characters`)
        .required('A temporary password is required'),
    otherwise: (s) => s.strip(),
  }),
});

export type UserFormValues = yup.InferType<typeof userFormSchema>;

export const resetPasswordSchema = yup.object({
  newPassword: yup
    .string()
    .min(10, 'Password must be at least 10 characters')
    .max(USER_LIMITS.password, `Password must be under ${USER_LIMITS.password} characters`)
    .required('A new password is required'),
});

export type ResetPasswordFormValues = yup.InferType<typeof resetPasswordSchema>;
