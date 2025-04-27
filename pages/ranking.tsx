import React from 'react';
import { Box, Container, Typography } from '@mui/material';
import { RankingGrid, RankingItem } from '../src/RankingGrid';

const dummyRanking: RankingItem[] = [
  { rank: 1, name: '麺屋シーサー', score: 4.8, imageUrl: undefined },
  { rank: 2, name: '沖縄そば本舗', score: 4.6, imageUrl: undefined },
  { rank: 3, name: 'ラーメン波', score: 4.5, imageUrl: undefined },
];

export default function RankingPage() {
  // localStorageから直近の都道府県名を取得（なければ沖縄県）
  const [prefectureName, setPrefectureName] = React.useState('沖縄県');
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = window.localStorage.getItem('lastPrefectureName');
      if (stored && stored !== '') setPrefectureName(stored);
    }
  }, []);
  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Typography variant="h5" align="center" gutterBottom>
        {prefectureName}ラーメン店ランキング
      </Typography>
      <RankingGrid ranking={dummyRanking} prefectureName={prefectureName} />
    </Container>
  );
}
