import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: { main: '#e53935' }, // 赤系（ラーメンのイメージ）
    secondary: { main: '#ffb300' }, // 黄系
  },
  typography: {
    fontFamily: '"Noto Sans JP", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: { fontFamily: '"M PLUS Rounded 1c", "Noto Sans JP", sans-serif' },
    h2: { fontFamily: '"M PLUS Rounded 1c", "Noto Sans JP", sans-serif' },
    h3: { fontFamily: '"M PLUS Rounded 1c", "Noto Sans JP", sans-serif' },
    h4: { fontFamily: '"M PLUS Rounded 1c", "Noto Sans JP", sans-serif' },
    h5: { fontFamily: '"M PLUS Rounded 1c", "Noto Sans JP", sans-serif' },
    h6: { fontFamily: '"M PLUS Rounded 1c", "Noto Sans JP", sans-serif' },
    // body1, body2などは標準フォントのまま
  },
});

export default theme;
