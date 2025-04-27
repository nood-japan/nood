import React from 'react';
import { Box, Typography, Card, CardContent, Grid, Avatar } from '@mui/material';

export type RankingItem = {
  rank: number;
  name: string;
  score: number;
  imageUrl?: string;
};

interface RankingGridProps {
  ranking: RankingItem[];
  prefectureName: string;
}

/**
 * 都道府県ごとのランキング上位3件を横並びグリッドで表示するコンポーネント
 */
export const RankingGrid: React.FC<RankingGridProps> = ({ ranking, prefectureName }) => {
  return (
    <Box sx={{ width: '100%', mt: 2 }}>
      <Typography variant="h6" align="center" gutterBottom>
        {prefectureName} ラーメン店ランキング TOP3
      </Typography>
      <Grid container spacing={2} justifyContent="center">
        {ranking.slice(0, 3).map((item) => (
          <Grid item xs={12} sm={4} key={item.rank}>
            <Card sx={{ textAlign: 'left', py: 1, px: 1, minHeight: 100, display: 'flex', alignItems: 'center', minWidth: 0 }}>
              <Avatar
                sx={{ width: 40, height: 40, mr: 1, bgcolor: item.rank === 1 ? '#ffd700' : item.rank === 2 ? '#c0c0c0' : '#cd7f32' }}
                src={item.imageUrl}
                alt={item.name}
              >
                {item.rank}
              </Avatar>
              <CardContent sx={{ p: 0, flex: 1, minWidth: 0 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', minWidth: 0 }}>
                  <Typography variant="subtitle2" fontWeight={700} noWrap sx={{ maxWidth: '100%' }}>
                    {item.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ alignSelf: 'flex-start', mt: 0.5 }}>
                    スコア: {item.score}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};
