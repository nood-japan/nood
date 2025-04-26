import { Box, Container, Typography } from '@mui/material';

export default function RankingPage() {
  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Typography variant="h5" align="center" gutterBottom>
        沖縄ラーメン店ランキング
      </Typography>
      <Box>
        {/* ランキングリスト（後で実装） */}
        <Typography align="center" color="text.secondary">
          準備中...
        </Typography>
      </Box>
    </Container>
  );
}
