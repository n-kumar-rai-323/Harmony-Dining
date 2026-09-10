'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import {
  AppBar,
  Box,
  Chip,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Toolbar,
  Tooltip,
  Typography,
} from '@mui/material';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';

import { ADMIN_NAV } from '@/lib/admin/nav';
import { useAdminAuth } from '@/lib/admin/auth-context';

const DRAWER_WIDTH = 264;

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { state, logout, hasPermission } = useAdminAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);

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
      <Toolbar sx={{ px: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, letterSpacing: 0.2 }}>
          Harmony Admin
        </Typography>
      </Toolbar>
      <Divider />
      <List sx={{ px: 1.5, py: 1, flexGrow: 1, overflowY: 'auto' }}>
        {items.map((item) => {
          const selected =
            item.href === '/admin'
              ? pathname === '/admin'
              : pathname.startsWith(item.href);
          const Icon = item.icon;
          const button = (
            <ListItemButton
              key={item.href}
              component={item.ready ? Link : 'div'}
              href={item.ready ? item.href : undefined}
              selected={selected}
              disabled={!item.ready}
              onClick={() => setMobileOpen(false)}
              sx={{ borderRadius: 1.5, mb: 0.25 }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>
                <Icon fontSize="small" />
              </ListItemIcon>
              <ListItemText
                primary={item.label}
                slotProps={{ primary: { variant: 'body2' } }}
              />
              {!item.ready && (
                <Chip label="soon" size="small" variant="outlined" />
              )}
            </ListItemButton>
          );
          return item.ready ? (
            button
          ) : (
            <Tooltip key={item.href} title="Coming soon" placement="right">
              <span>{button}</span>
            </Tooltip>
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
          <Typography variant="subtitle1" sx={{ fontWeight: 600, flexGrow: 1 }}>
            {current?.label ?? 'Admin'}
          </Typography>

          {user && (
            <>
              <Box sx={{ textAlign: 'right', display: { xs: 'none', sm: 'block' } }}>
                <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
                  {user.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {user.role}
                </Typography>
              </Box>
              <IconButton
                onClick={(e) => setMenuAnchor(e.currentTarget)}
                aria-label="Account menu"
              >
                <LogoutRoundedIcon />
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
