'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import {
  AppBar,
  Avatar,
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
  Stack,
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
          const button = (
            <ListItemButton
              key={item.href}
              component={item.ready ? Link : 'div'}
              href={item.ready ? item.href : undefined}
              selected={selected}
              disabled={!item.ready}
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
