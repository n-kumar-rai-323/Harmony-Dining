'use client';

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Stack,
  Typography,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import type { SvgIconComponent } from '@mui/icons-material';
import { usePathname } from 'next/navigation';

import { ADMIN_NAV } from '@/lib/admin/nav';

export function PageHeader({
  title,
  subtitle,
  action,
  icon,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  icon?: SvgIconComponent;
}) {
  const pathname = usePathname();
  // Fall back to the current section's nav icon so every page gets one.
  const navMatch = [...ADMIN_NAV]
    .sort((a, b) => b.href.length - a.href.length)
    .find((i) =>
      i.href === '/admin' ? pathname === '/admin' : pathname.startsWith(i.href),
    );
  const Icon = icon ?? navMatch?.icon;

  return (
    <Stack
      direction={{ xs: 'column', sm: 'row' }}
      spacing={1.5}
      sx={{ mb: 3.5, alignItems: { sm: 'center' }, justifyContent: 'space-between' }}
    >
      <Stack direction="row" spacing={1.75} sx={{ alignItems: 'center' }}>
        {Icon && (
          <Box
            sx={{
              display: 'grid',
              placeItems: 'center',
              width: 44,
              height: 44,
              borderRadius: 2.5,
              flexShrink: 0,
              color: 'primary.main',
              bgcolor: (t) => alpha(t.palette.primary.main, 0.1),
            }}
          >
            <Icon />
          </Box>
        )}
        <Box>
          <Typography variant="h4">{title}</Typography>
          {subtitle && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
              {subtitle}
            </Typography>
          )}
        </Box>
      </Stack>
      {action}
    </Stack>
  );
}

type StatColor = 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';

export function StatCard({
  label,
  value,
  hint,
  emphasis,
  icon: Icon,
  color = 'primary',
}: {
  label: string;
  value: React.ReactNode;
  hint?: string;
  emphasis?: boolean;
  icon?: SvgIconComponent;
  color?: StatColor;
}) {
  return (
    <Card
      sx={{
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
        borderColor: emphasis ? `${color}.main` : 'divider',
        bgcolor: (t) =>
          emphasis ? alpha(t.palette[color].main, 0.06) : 'background.paper',
        transition: 'border-color .15s, box-shadow .15s',
        '&:hover': { boxShadow: (t) => t.shadows[2] },
      }}
    >
      {/* accent edge */}
      <Box
        sx={{
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: 3,
          bgcolor: `${color}.main`,
          opacity: emphasis ? 1 : 0.35,
        }}
      />
      <CardContent sx={{ pl: 2.5 }}>
        <Stack
          direction="row"
          sx={{ alignItems: 'flex-start', justifyContent: 'space-between' }}
        >
          <Typography
            variant="overline"
            color="text.secondary"
            sx={{ lineHeight: 1.4 }}
          >
            {label}
          </Typography>
          {Icon && (
            <Box
              sx={{
                display: 'grid',
                placeItems: 'center',
                width: 34,
                height: 34,
                borderRadius: 2,
                flexShrink: 0,
                color: `${color}.main`,
                bgcolor: (t) => alpha(t.palette[color].main, 0.12),
              }}
            >
              <Icon sx={{ fontSize: 19 }} />
            </Box>
          )}
        </Stack>
        <Typography
          variant="h3"
          sx={{ fontWeight: 700, lineHeight: 1.15, mt: 0.5, fontSize: '2rem' }}
        >
          {value}
        </Typography>
        {hint && (
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: 'block', mt: 0.5 }}
          >
            {hint}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}

export function ConfirmDialog({
  open,
  title,
  body,
  confirmLabel = 'Confirm',
  destructive = false,
  busy = false,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  body: React.ReactNode;
  confirmLabel?: string;
  destructive?: boolean;
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <Dialog open={open} onClose={busy ? undefined : onCancel} maxWidth="xs" fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <DialogContentText component="div">{body}</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel} disabled={busy}>
          Cancel
        </Button>
        <Button
          onClick={onConfirm}
          disabled={busy}
          variant="contained"
          color={destructive ? 'error' : 'primary'}
        >
          {busy ? 'Working…' : confirmLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

/** Renders loading / error / empty states around a query result. */
export function QueryBoundary({
  loading,
  error,
  onRetry,
  children,
}: {
  loading: boolean;
  error: string | null;
  onRetry?: () => void;
  children: React.ReactNode;
}) {
  if (loading) {
    return (
      <Box sx={{ display: 'grid', placeItems: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }
  if (error) {
    return (
      <Alert
        severity="error"
        action={
          onRetry && (
            <Button color="inherit" size="small" onClick={onRetry}>
              Retry
            </Button>
          )
        }
      >
        {error}
      </Alert>
    );
  }
  return <>{children}</>;
}
