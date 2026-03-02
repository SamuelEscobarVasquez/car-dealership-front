'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  Typography,
  Divider,
  IconButton,
  Tooltip,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  Chat as ChatIcon,
  AccountTree as BuilderIcon,
  DarkMode,
  LightMode,
  GitHub,
} from '@mui/icons-material';
import { useThemeContext } from '../../providers/ThemeProvider';
import styles from './Sidebar.module.scss';

const DRAWER_WIDTH = 240;

const menuItems = [
  { path: '/chat', label: 'Chat', icon: ChatIcon },
  { path: '/builder', label: 'Flow Builder', icon: BuilderIcon },
];

export const Sidebar: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { mode, toggleTheme } = useThemeContext();
  const [githubAnchor, setGithubAnchor] = useState<null | HTMLElement>(null);

  const handleGithubClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setGithubAnchor(event.currentTarget);
  };

  const handleGithubClose = () => {
    setGithubAnchor(null);
  };

  const openRepo = (url: string) => {
    window.open(url, '_blank');
    handleGithubClose();
  };

  return (
    <Drawer
      variant="permanent"
      className={styles.sidebar}
      sx={{
        width: DRAWER_WIDTH,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: DRAWER_WIDTH,
          boxSizing: 'border-box',
          borderRight: '1px solid',
          borderColor: 'divider',
        },
      }}
    >
      <Box className={styles.header} sx={{ backgroundColor: '#1a1a2e', p: 2, display: 'flex', justifyContent: 'center' }}>
        <Image
          src="/logo/Logo.png"
          alt="Logo"
          width={200}
          height={60}
          style={{ objectFit: 'contain' }}
          priority
        />
      </Box>

      <Divider />

      <List className={styles.navList}>
        {menuItems.map((item) => (
          <ListItem key={item.path} disablePadding>
            <ListItemButton
              selected={pathname === item.path}
              onClick={() => router.push(item.path)}
              sx={{
                borderRadius: 2,
                mx: 1,
                '&.Mui-selected': {
                  backgroundColor: 'primary.main',
                  color: 'primary.contrastText',
                  '&:hover': {
                    backgroundColor: 'primary.dark',
                  },
                  '& .MuiListItemIcon-root': {
                    color: 'inherit',
                  },
                },
              }}
            >
              <ListItemIcon>
                <item.icon />
              </ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      <Box className={styles.footer}>
        <Divider sx={{ mb: 2 }} />
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
          <Tooltip title={mode === 'dark' ? 'Light Mode' : 'Dark Mode'}>
            <IconButton onClick={toggleTheme} size="small">
              {mode === 'dark' ? <LightMode /> : <DarkMode />}
            </IconButton>
          </Tooltip>
          <Tooltip title="GitHub Repos">
            <IconButton
              size="small"
              onClick={handleGithubClick}
            >
              <GitHub />
            </IconButton>
          </Tooltip>
          <Menu
            anchorEl={githubAnchor}
            open={Boolean(githubAnchor)}
            onClose={handleGithubClose}
            anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            transformOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          >
            <MenuItem onClick={() => openRepo('https://github.com/SamuelEscobarVasquez/car-dealership-front.git')}>
              Frontend
            </MenuItem>
            <MenuItem onClick={() => openRepo('https://github.com/SamuelEscobarVasquez/car-dealership-back.git')}>
              Backend
            </MenuItem>
          </Menu>
        </Box>
      </Box>
    </Drawer>
  );
};

export default Sidebar;
