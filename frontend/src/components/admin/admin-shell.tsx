'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

import {
  AppBar,
  Avatar,
  Badge,
  Box,
  Button,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Popover,
  Stack,
  Toolbar,
  Typography,
} from '@mui/material';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import NotificationsRoundedIcon from '@mui/icons-material/NotificationsRounded';

import { ADMIN_NAV } from '@/lib/admin/nav';
import { useAdminAuth } from '@/lib/admin/auth-context';
import {
  notificationsApi,
  ENTITY_HREF,
  type AdminNotification,
} from '@/lib/admin/resources/notifications';

const DRAWER_WIDTH = 264;

function timeAgo(iso: string): string {
  const diffSec = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 1000));
  const units: [string, number][] = [
    ['year', 31536000],
    ['month', 2592000],
    ['week', 604800],
    ['day', 86400],
    ['hour', 3600],
    ['minute', 60],
  ];
  for (const [label, secs] of units) {
    const value = Math.floor(diffSec / secs);
    if (value >= 1) return `${value} ${label}${value > 1 ? 's' : ''} ago`;
  }
  return 'just now';
}

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { state, logout, hasPermission } = useAdminAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);

  const canSeeNotifications = hasPermission('notifications.read');
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifAnchor, setNotifAnchor] = useState<null | HTMLElement>(null);
  const [notifItems, setNotifItems] = useState<AdminNotification[]>([]);
  const [notifLoading, setNotifLoading] = useState(false);

  useEffect(() => {
    if (!canSeeNotifications) return;
    let cancelled = false;
    function poll() {
      notificationsApi
        .unreadCount()
        .then((res) => {
          if (!cancelled) setUnreadCount(res.unreadCount);
        })
        .catch(() => {});
    }
    poll();
    const t = setInterval(poll, 30000);
    return () => {
      cancelled = true;
      clearInterval(t);
    };
  }, [canSeeNotifications]);

  async function openNotifications(anchor: HTMLElement) {
    setNotifAnchor(anchor);
    setNotifLoading(true);
    try {
      const res = await notificationsApi.list('?pageSize=10');
      setNotifItems(res.items);
      setUnreadCount(res.unreadCount);
    } finally {
      setNotifLoading(false);
    }
  }

  async function openNotification(n: AdminNotification) {
    setNotifAnchor(null);
    if (!n.read) {
      setUnreadCount((c) => Math.max(0, c - 1));
      notificationsApi.markRead(n.id).catch(() => {});
    }
    const href = n.entityType ? ENTITY_HREF[n.entityType] : undefined;
    if (href) router.push(href);
  }

  async function markAllRead() {
    await notificationsApi.markAllRead().catch(() => {});
    setUnreadCount(0);
    setNotifItems((items) => items.map((n) => ({ ...n, read: true })));
  }

  const user = state.status === 'authenticated' ? state.user : null;

  const items = ADMIN_NAV.filter(
    (i) => i.permission === null || hasPermission(i.permission),
  );
  const current =
    items.find((i) =>
      i.href === '/admin' ? pathname === '/admin' : pathname.startsWith(i.href),
    ) ?? null;

  const nav = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Toolbar sx={{ px: 2.5, gap: 1.25 }}>
        <Box
          sx={{
            width: 30,
            height: 30,
            borderRadius: 2,
            display: 'grid',
            placeItems: 'center',
            bgcolor: 'primary.main',
            color: 'primary.contrastText',
            fontWeight: 800,
            fontSize: 15,
          }}
        >
          H
        </Box>
        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
          Harmony Admin
        </Typography>
      </Toolbar>
      <Divider />
      <List sx={{ px: 1.25, py: 1.25, flexGrow: 1, overflowY: 'auto' }}>
        {items.map((item) => {
          const selected =
            item.href === '/admin'
              ? pathname === '/admin'
              : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <ListItemButton
              key={item.href}
              component={Link}
              href={item.href}
              selected={selected}
              onClick={() => setMobileOpen(false)}
              sx={{ mb: 0.25, py: 0.85 }}
            >
              <ListItemIcon
                sx={{ minWidth: 36, color: selected ? 'primary.main' : 'inherit' }}
              >
                <Icon fontSize="small" />
              </ListItemIcon>
              <ListItemText
                primary={item.label}
                slotProps={{
                  primary: {
                    variant: 'body2',
                    sx: { fontWeight: selected ? 700 : 500 },
                  },
                }}
              />
            </ListItemButton>
          );
        })}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100dvh', bgcolor: 'background.default' }}>
      <AppBar
        position="fixed"
        color="default"
        elevation={0}
        sx={{
          zIndex: (t) => t.zIndex.drawer + 1,
          borderBottom: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper',
        }}
      >
        <Toolbar sx={{ gap: 1 }}>
          <IconButton
            edge="start"
            onClick={() => setMobileOpen((v) => !v)}
            sx={{ display: { md: 'none' } }}
            aria-label="Toggle navigation"
          >
            <MenuRoundedIcon />
          </IconButton>
          <Stack
            direction="row"
            spacing={1.25}
            sx={{ alignItems: 'center', flexGrow: 1, minWidth: 0 }}
          >
            {current?.icon && (
              <current.icon sx={{ color: 'primary.main' }} fontSize="small" />
            )}
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }} noWrap>
              {current?.label ?? 'Admin'}
            </Typography>
          </Stack>

          {canSeeNotifications && (
            <>
              <IconButton
                onClick={(e) => openNotifications(e.currentTarget)}
                aria-label="Notifications"
                sx={{ mr: 1 }}
              >
                <Badge
                  badgeContent={unreadCount}
                  color="error"
                  max={99}
                  slotProps={{ badge: { style: { right: 2, top: 2 } } }}
                >
                  <NotificationsRoundedIcon />
                </Badge>
              </IconButton>
              <Popover
                open={Boolean(notifAnchor)}
                anchorEl={notifAnchor}
                onClose={() => setNotifAnchor(null)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
              >
                <Box sx={{ width: 340, maxWidth: '100vw' }}>
                  <Stack
                    direction="row"
                    sx={{ alignItems: 'center', justifyContent: 'space-between', px: 2, py: 1.5 }}
                  >
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                      Notifications
                    </Typography>
                    {notifItems.some((n) => !n.read) && (
                      <Button size="small" onClick={markAllRead}>
                        Mark all read
                      </Button>
                    )}
                  </Stack>
                  <Divider />
                  <Box sx={{ maxHeight: 360, overflowY: 'auto' }}>
                    {notifLoading ? (
                      <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>
                        Loading…
                      </Typography>
                    ) : notifItems.length === 0 ? (
                      <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>
                        No notifications yet.
                      </Typography>
                    ) : (
                      notifItems.map((n) => (
                        <Box
                          key={n.id}
                          onClick={() => openNotification(n)}
                          sx={{
                            px: 2,
                            py: 1.25,
                            cursor: 'pointer',
                            bgcolor: n.read ? 'transparent' : 'action.hover',
                            '&:hover': { bgcolor: 'action.hover' },
                            borderBottom: '1px solid',
                            borderColor: 'divider',
                          }}
                        >
                          <Typography variant="body2" sx={{ fontWeight: n.read ? 500 : 700 }}>
                            {n.title}
                          </Typography>
                          {n.message && (
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                              {n.message}
                            </Typography>
                          )}
                          <Typography variant="caption" color="text.secondary">
                            {timeAgo(n.createdAt)}
                          </Typography>
                        </Box>
                      ))
                    )}
                  </Box>
                </Box>
              </Popover>
            </>
          )}

          {user && (
            <>
              <Box sx={{ textAlign: 'right', display: { xs: 'none', sm: 'block' } }}>
                <Typography variant="body2" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                  {user.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {user.role}
                </Typography>
              </Box>
              <Avatar
                sx={{
                  width: 34,
                  height: 34,
                  fontSize: 15,
                  fontWeight: 700,
                  bgcolor: 'primary.main',
                }}
              >
                {user.name.trim().charAt(0).toUpperCase()}
              </Avatar>
              <IconButton
                onClick={(e) => setMenuAnchor(e.currentTarget)}
                aria-label="Account menu"
                size="small"
              >
                <LogoutRoundedIcon fontSize="small" />
              </IconButton>
              <Menu
                anchorEl={menuAnchor}
                open={Boolean(menuAnchor)}
                onClose={() => setMenuAnchor(null)}
              >
                <MenuItem
                  onClick={() => {
                    setMenuAnchor(null);
                    void logout();
                  }}
                >
                  <ListItemIcon>
                    <LogoutRoundedIcon fontSize="small" />
                  </ListItemIcon>
                  Sign out
                </MenuItem>
              </Menu>
            </>
          )}
        </Toolbar>
      </AppBar>

      <Box
        component="nav"
        sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { width: DRAWER_WIDTH, boxSizing: 'border-box' },
          }}
        >
          {nav}
        </Drawer>
        <Drawer
          variant="permanent"
          open
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': {
              width: DRAWER_WIDTH,
              boxSizing: 'border-box',
              borderRight: '1px solid',
              borderColor: 'divider',
            },
          }}
        >
          {nav}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          px: { xs: 2, sm: 3, md: 4 },
          pb: 6,
        }}
      >
        <Toolbar />
        <Box sx={{ maxWidth: 1200, mx: 'auto', pt: 3 }}>{children}</Box>
      </Box>
    </Box>
  );
}
