'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { Box, CircularProgress } from '@mui/material';

import { useAdminAuth } from '@/lib/admin/auth-context';
import AdminShell from './admin-shell';

function FullScreen({ children }: { children: React.ReactNode }) {
  return (
    <Box
      sx={{
        minHeight: '100dvh',
        display: 'grid',
        placeItems: 'center',
        bgcolor: 'background.default',
      }}
    >
      {children}
    </Box>
  );
}

/** Blocks the admin shell until /auth/me confirms a session. */
export default function AdminAuthGate({ children }: { children: React.ReactNode }) {
  const { state } = useAdminAuth();
  const router = useRouter();

  useEffect(() => {
    if (state.status === 'anonymous') {
      router.replace('/admin/login');
    }
  }, [state.status, router]);

  if (state.status === 'authenticated') {
    return <AdminShell>{children}</AdminShell>;
  }

  return (
    <FullScreen>
      <CircularProgress />
    </FullScreen>
  );
}
