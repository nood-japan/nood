import { Box, Container, Typography, Button } from '@mui/material';
import Link from 'next/link';
import RamenMap from '../src/RamenMap';

export default function Home() {
  return (
    <Container maxWidth="sm" sx={{
      py: { xs: 1, sm: 4 },
      px: { xs: 0.5, sm: 2 },
      width: '100%',
    }}>
      <Box
        display="flex"
        flexDirection="column"
        gap={2}
        sx={{ px: { xs: 0, sm: 2 } }}
      >
        {/* トップページに動的なラーメンマップ（ピン付き）を表示 */}
        <RamenMap height="60vh" />
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
