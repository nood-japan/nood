import { Box, Container, Typography, TextField, Button } from '@mui/material';
import { useState } from 'react';

export default function SearchPage() {
  const [keyword, setKeyword] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // 検索処理は今後追加
  };

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Typography variant="h5" align="center" gutterBottom>
        ラーメン店検索
      </Typography>
      <Box component="form" onSubmit={handleSearch} display="flex" gap={2}>
        <TextField
          label="店名・エリア・キーワード"
          fullWidth
          value={keyword}
          onChange={e => setKeyword(e.target.value)}
        />
        <Button type="submit" variant="contained" color="primary">
          検索
        </Button>
      </Box>
      {/* 検索結果リストは今後追加 */}
    </Container>
  );
}
