import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // クライアントのIPアドレスを取得
  const ip = req.headers['x-forwarded-for']?.toString().split(',')[0] || req.socket.remoteAddress;

  // ipapi.coに問い合わせ（IP省略でアクセス元IPが自動判定される）
  const geoRes = await fetch(`https://ipapi.co/json/`);
  if (!geoRes.ok) {
    res.status(500).json({ error: 'Failed to fetch geolocation' });
    return;
  }
  const geo = await geoRes.json();

  // 必要な情報だけ返却
  res.status(200).json({
    ip: geo.ip,
    city: geo.city,
    region: geo.region,
    country: geo.country,
    latitude: geo.latitude,
    longitude: geo.longitude,
  });
}
