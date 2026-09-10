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
  IconButton,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import type { SvgIconComponent } from '@mui/icons-material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import { usePathname } from 'next/navigation';

import { ADMIN_NAV } from '@/lib/admin/nav';

/** Consistent container for a screen's filter controls. */
export function FilterBar({ children }: { children: React.ReactNode }) {
  return (
    <Paper
      variant="outlined"
      sx={{
        p: 1.5,
        mb: 2.5,
        display: 'flex',
        flexWrap: 'wrap',
        gap: 1.25,
        alignItems: 'center',
        bgcolor: (t) => alpha(t.palette.action.hover, 0.5),
      }}
    >
      {children}
    </Paper>
  );
}

/** Dialog title with a coloured icon tile, a close button and a divider. */
export function DialogHeader({
  icon: Icon,
  title,
  subtitle,
  onClose,
}: {
  icon?: SvgIconComponent;
  title: string;
  subtitle?: string;
  onClose?: () => void;
}) {
  return (
    <DialogTitle sx={{ pb: 1.5 }}>
      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
        {Icon && (
          <Box
            sx={{
              display: 'grid',
              placeItems: 'center',
              width: 38,
              height: 38,
              borderRadius: 2,
              flexShrink: 0,
              color: 'primary.main',
              bgcolor: (t) => alpha(t.palette.primary.main, 0.12),
            }}
          >
            <Icon fontSize="small" />
          </Box>
        )}
        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
          <Typography component="span" sx={{ fontWeight: 700, fontSize: '1.1rem' }}>
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="body2" color="text.secondary">
              {subtitle}
            </Typography>
          )}
        </Box>
        {onClose && (
          <IconButton size="small" onClick={onClose} aria-label="Close">
            <CloseRoundedIcon fontSize="small" />
          </IconButton>
        )}
      </Stack>
    </DialogTitle>
  );
}

/** A titled sub-section inside a form dialog. */
export function FormSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Box>
      <Typography
        variant="overline"
        color="text.secondary"
        sx={{ display: 'block', mb: 1 }}
      >
        {title}
      </Typography>
      <Stack spacing={2}>{children}</Stack>
    </Box>
  );
}

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
  trend,
  emphasis,
  filled,
  icon: Icon,
  color = 'primary',
}: {
  label: string;
  value: React.ReactNode;
  hint?: string;
  /** Small delta line, e.g. { dir: 'up', text: '15% vs last week' }. */
  trend?: { dir: 'up' | 'down' | 'flat'; text: string };
  emphasis?: boolean;
  /** Solid colour-filled card (used for the primary metric). */
  filled?: boolean;
  icon?: SvgIconComponent;
  color?: StatColor;
}) {
  const trendColor =
    trend?.dir === 'up' ? 'success.main' : trend?.dir === 'down' ? 'error.main' : 'text.secondary';

  return (
    <Card
      sx={{
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
        border: filled ? 'none' : undefined,
        borderColor: !filled && emphasis ? `${color}.main` : 'divider',
        color: filled ? `${color}.contrastText` : 'text.primary',
        bgcolor: (t) =>
          filled
            ? t.palette[color].main
            : emphasis
              ? alpha(t.palette[color].main, 0.06)
              : 'background.paper',
        transition: 'box-shadow .15s',
        '&:hover': { boxShadow: (t) => t.shadows[filled ? 6 : 2] },
      }}
    >
      {!filled && (
        <Box
          sx={{
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            width: 3,
            bgcolor: `${color}.main`,
            opacity: emphasis ? 1 : 0.3,
          }}
        />
      )}
      <CardContent sx={{ pl: filled ? 2 : 2.5 }}>
        <Stack direction="row" spacing={1.25} sx={{ alignItems: 'center', mb: 1.25 }}>
          {Icon && (
            <Box
              sx={{
                display: 'grid',
                placeItems: 'center',
                width: 34,
                height: 34,
                borderRadius: 2,
                flexShrink: 0,
                color: filled ? `${color}.main` : `${color}.main`,
                bgcolor: (t) =>
                  filled ? t.palette[color].contrastText : alpha(t.palette[color].main, 0.12),
              }}
            >
              <Icon sx={{ fontSize: 19 }} />
            </Box>
          )}
          <Typography
            variant="body2"
            sx={{ fontWeight: 600, opacity: filled ? 0.95 : 0.9 }}
          >
            {label}
          </Typography>
        </Stack>
        <Typography sx={{ fontWeight: 800, lineHeight: 1.1, fontSize: '1.9rem' }}>
          {value}
        </Typography>
        {trend && (
          <Typography
            variant="caption"
            sx={{
              display: 'block',
              mt: 0.5,
              fontWeight: 700,
              color: filled ? 'inherit' : trendColor,
              opacity: filled ? 0.95 : 1,
            }}
          >
            {trend.dir === 'up' ? '↑ ' : trend.dir === 'down' ? '↓ ' : ''}
            {trend.text}
          </Typography>
        )}
        {hint && (
          <Typography
            variant="caption"
            sx={{
              display: 'block',
              mt: trend ? 0 : 0.5,
              color: filled ? 'inherit' : 'text.secondary',
              opacity: filled ? 0.85 : 1,
            }}
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
