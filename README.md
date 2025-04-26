# NOOD（仮）

日本全国（まずは沖縄県）のラーメン屋・油そば屋情報を扱うモバイル向けWebアプリ。

## 主な機能
- Google Map上で店舗をピン表示
- 検索・ランキング・店舗詳細閲覧
- 会員登録で記録・投稿が可能
- モバイルファーストデザイン

## 技術スタック
- Next.js (React)
- TypeScript
- Material-UI
- Google Maps JavaScript API
- Google Places API
- Firebase Authentication（会員機能）

## セットアップ手順
1. リポジトリをクローン
2. `npm install`
3. Google Maps/Places APIキーとFirebase設定を`.env.local`に記載
4. `npm run dev`で開発サーバー起動

## .env.localサンプル
```
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
```

## 今後の拡張予定
- 全国対応
- レビュー・ランキング機能強化
- 管理画面追加
