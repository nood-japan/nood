import { Box, Container, Typography, Button, TextField, InputAdornment } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import Link from 'next/link';
import RamenMap from '../src/RamenMap';
import { RamenMapFilters } from '../src/RamenMap';


import { useState } from 'react';

export default function Home() {
  const [flavor, setFlavor] = useState('');
  const [style, setStyle] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');
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
        {/* 地図＋フィルタ一体型 */}
        <Box data-testid="ramen-map-section" sx={{ width: '100%' }}>
          <RamenMap height="60vh" showOnlyMap={false} searchKeyword={searchKeyword} />
        </Box>

        <Box data-testid="ranking-button-group" sx={{ width: '100%' }}>
          <Link href="/ranking" passHref legacyBehavior>
            <Button variant="outlined" color="secondary" fullWidth data-testid="ranking-button">
              ランキングを見る
            </Button>
          </Link>
        </Box>
      </Box>
    </Container>
  );
}
