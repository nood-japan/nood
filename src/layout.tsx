import { AppBar, Box, Container, Toolbar, Typography, Link as MuiLink } from '@mui/material';
import Link from 'next/link';
import React from 'react';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <Box display="flex" flexDirection="column" minHeight="100vh">
      {/* ヘッダー */}
      <AppBar position="static" sx={{ background: 'linear-gradient(to right, #fff, #f2f2f2)' }} elevation={0}>
        <Toolbar>
          <Typography variant="h6" component="div" className="heading-rounded" sx={{ flexGrow: 1, color: '#222', fontFamily: '"M PLUS Rounded 1c", "Noto Sans JP", sans-serif', fontWeight: 700, justifyContent: 'center', textAlign: 'center', display: 'flex' }}>
            <Link href="/" passHref legacyBehavior>
              <MuiLink color="inherit" underline="none" className="heading-rounded" sx={{ color: '#222', fontFamily: '"M PLUS Rounded 1c", "Noto Sans JP", sans-serif', fontWeight: 700 }}>
                NOOD
              </MuiLink>
            </Link>
          </Typography>
        </Toolbar>
      </AppBar>

      {/* メインコンテンツ */}
      <Container component="main" sx={{ flex: 1, py: 2 }}>
        {children}
      </Container>

      {/* フッター */}
      <Box component="footer" sx={{ py: 2, textAlign: 'center', bgcolor: 'grey.100' }}>
        <Typography variant="body2" color="text.secondary">
          &copy; {new Date().getFullYear()} NOOD / 全国ラーメン・油そばマップ
        </Typography>
      </Box>
    </Box>
  );
}
