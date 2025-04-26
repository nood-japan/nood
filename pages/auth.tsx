import { useState } from 'react';
import { supabase } from '../supabaseClient';
import { Box, Button, Container, TextField, Typography, Alert } from '@mui/material';

export default function AuthPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    if (isSignUp) {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) setError(error.message);
      else setMessage('確認メールを送信しました。メールをご確認ください。');
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setError(error.message);
      else setMessage('ログイン成功！');
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Typography variant="h5" align="center" gutterBottom>
        {isSignUp ? '新規会員登録' : 'ログイン'}
      </Typography>
      <Box component="form" onSubmit={handleAuth} display="flex" flexDirection="column" gap={2}>
        <TextField
          label="メールアドレス"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <TextField
          label="パスワード"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <Button type="submit" variant="contained" color="primary">
          {isSignUp ? '登録' : 'ログイン'}
        </Button>
        <Button onClick={() => setIsSignUp(!isSignUp)} color="secondary">
          {isSignUp ? 'ログインはこちら' : '新規登録はこちら'}
        </Button>
        {message && <Alert severity="success">{message}</Alert>}
        {error && <Alert severity="error">{error}</Alert>}
      </Box>
    </Container>
  );
}
