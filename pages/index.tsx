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
    <Container maxWidth="sm" data-testid="top-container" name="TopContainer" sx={{
      py: { xs: 1, sm: 4 },
      px: { xs: 0.5, sm: 2 },
      width: '100%',
    }}>
      <Box
        display="flex"
        flexDirection="column"
        gap={2}
        data-testid="main-box"
        name="MainBox"
        sx={{ px: { xs: 0, sm: 2 } }}
      >
        {/* 地図＋フィルタ一体型 */}
        <Box data-testid="ramen-map-section" name="RamenMapSection" sx={{ width: '100%' }}>
          <RamenMap height="60vh" showOnlyMap={false} searchKeyword={searchKeyword} />
        </Box>
        <Box name="SearchBarGroup" data-testid="search-bar-group" sx={{ width: '100%', border: '1px solid #e0e0e0', borderRadius: '16px', background: '#fff', minHeight: 38, display: 'flex', alignItems: 'center', px: 1, py: 0, '&:hover': { background: '#fafafa', borderColor: '#bdbdbd' } }}>
          <TextField
            variant="standard"
            fullWidth
            placeholder="店舗名・エリア・キーワードで検索"
            data-testid="search-bar"
            name="SearchBar"
            value={searchKeyword}
            onChange={e => setSearchKeyword(e.target.value)}
            InputProps={{
              disableUnderline: true,
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: 'grey.500', fontSize: 20 }} />
                </InputAdornment>
              ),
              sx: {
                background: 'transparent',
                fontSize: 16,
                minHeight: 38,
                px: 0,
                py: 0,
              },
            }}
            sx={{
              background: 'transparent',
              fontSize: 16,
              minHeight: 38,
              px: 0,
              py: 0,
            }}
          />
        </Box>
        <Box name="RankingButtonGroup" data-testid="ranking-button-group" sx={{ width: '100%' }}>
          <Link href="/ranking" passHref legacyBehavior>
            <Button variant="outlined" color="secondary" fullWidth data-testid="ranking-button" name="RankingButton">
              ランキングを見る
            </Button>
          </Link>
        </Box>
      </Box>
    </Container>
  );
}
