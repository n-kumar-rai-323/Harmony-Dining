'use client';

import { usePathname } from 'next/navigation';
import { ThemeProvider } from '@mui/material/styles';

import { AdminAuthProvider } from '@/lib/admin/auth-context';
import AdminAuthGate from '@/components/admin/admin-auth-gate';
import { ToastProvider } from '@/components/admin/toast';
import { adminTheme } from '@/components/admin/admin-theme';

/**
 * Admin area shell. Client-rendered: auth is a signed http-only cookie the
 * browser sends to the API, so every admin screen talks to the API directly.
 * `/admin/login` renders bare (no gate, no chrome); everything else is gated.
 * A nested ThemeProvider layers the tool-focused admin look on top of the
 * active Harmony theme.
 */
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isLogin = pathname === '/admin/login';

  return (
    <ThemeProvider theme={adminTheme}>
      <AdminAuthProvider>
        <ToastProvider>
          {isLogin ? children : <AdminAuthGate>{children}</AdminAuthGate>}
        </ToastProvider>
      </AdminAuthProvider>
    </ThemeProvider>
  );
}
