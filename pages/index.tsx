import { Box, Container, Typography, Button } from '@mui/material';
import Link from 'next/link';
import RamenMap from '../src/RamenMap';
import { RamenMapFilters } from '../src/RamenMap';


import { useState } from 'react';

export default function Home() {
  const [flavor, setFlavor] = useState('');
  const [style, setStyle] = useState('');
  return (
    <Container maxWidth="sm" data-testid="top-container" sx={{
      py: { xs: 1, sm: 4 },
      px: { xs: 0.5, sm: 2 },
      width: '100%',
    }}>
      <Box
        display="flex"
        flexDirection="column"
        gap={2}
        data-testid="main-box"
        sx={{ px: { xs: 0, sm: 2 } }}
      >
        {/* フィルタ部分 */}
        <Box data-testid="ramen-filter-section" sx={{ width: '100%' }}>
          <RamenMapFilters flavor={flavor} style={style} setFlavor={setFlavor} setStyle={setStyle} />
        </Box>
        {/* 地図本体 */}
        <Box data-testid="ramen-map-section" sx={{ width: '100%' }}>
          <RamenMap height="60vh" showOnlyMap flavor={flavor} style={style} />
        </Box>
        <Link href="/ranking" passHref legacyBehavior>
          <Button variant="outlined" color="secondary" fullWidth>
            ランキングを見る
          </Button>
        </Link>
        <Link href="/search" passHref legacyBehavior>
          <Button variant="outlined" fullWidth>
            店舗検索
          </Button>
        </Link>
      </Box>
    </Container>
  );
}
