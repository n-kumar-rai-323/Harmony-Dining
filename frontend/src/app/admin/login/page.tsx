'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Stack,
  TextField,
  Typography,
} from '@mui/material';

import { adminApi, AdminApiError } from '@/lib/admin/api';
import { useAdminAuth } from '@/lib/admin/auth-context';

type FormValues = {
  email: string;
  password: string;
};

export default function AdminLoginPage() {
  const router = useRouter();
  const { state, refresh } = useAdminAuth();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ defaultValues: { email: '', password: '' } });

  useEffect(() => {
    if (state.status === 'authenticated') {
      router.replace('/admin');
    }
  }, [state.status, router]);

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    try {
      await adminApi.post('/auth/login', {
        email: values.email.trim(),
        password: values.password,
      });
      const ok = await refresh();
      router.replace(ok ? '/admin' : '/admin/login');
    } catch (err) {
      if (err instanceof AdminApiError) {
        setFormError(
          err.status === 401
            ? 'Incorrect email or password.'
            : err.status === 429
              ? 'Too many attempts. Please wait a minute and try again.'
              : err.messages[0],
        );
      } else {
        setFormError('Something went wrong. Please try again.');
      }
    }
  });

  return (
    <Box
      sx={{
        minHeight: '100dvh',
        display: 'grid',
        placeItems: 'center',
        p: 2,
        bgcolor: 'background.default',
      }}
    >
      <Card sx={{ width: '100%', maxWidth: 400 }} variant="outlined">
        <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
            Harmony Admin
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Sign in to manage the site.
          </Typography>

          <form onSubmit={onSubmit} noValidate>
            <Stack spacing={2.5}>
              {formError && <Alert severity="error">{formError}</Alert>}

              <TextField
                label="Email"
                type="email"
                autoComplete="username"
                autoFocus
                fullWidth
                error={Boolean(errors.email)}
                helperText={errors.email?.message}
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: 'Enter a valid email',
                  },
                })}
              />

              <TextField
                label="Password"
                type="password"
                autoComplete="current-password"
                fullWidth
                error={Boolean(errors.password)}
                helperText={errors.password?.message}
                {...register('password', {
                  required: 'Password is required',
                })}
              />

              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Signing in…' : 'Sign in'}
              </Button>
            </Stack>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
}
