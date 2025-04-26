import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: { main: '#e53935' }, // 赤系（ラーメンのイメージ）
    secondary: { main: '#ffb300' }, // 黄系
  },
  typography: {
    fontFamily: '"Noto Sans JP", "Roboto", "Helvetica", "Arial", sans-serif',
  },
});

export default theme;
