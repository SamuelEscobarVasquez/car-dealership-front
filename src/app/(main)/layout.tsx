'use client';

import { Box } from '@mui/material';
import { ThemeProvider } from '../../providers/ThemeProvider';
import { Sidebar } from '../../components/common';
import styles from './MainLayout.module.scss';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider>
      <Box className={styles.layout}>
        <Sidebar />
        <Box component="main" className={styles.main}>
          {children}
        </Box>
      </Box>
    </ThemeProvider>
  );
}
