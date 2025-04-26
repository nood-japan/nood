import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="ja">
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Noto+Sans+JP:400,700&display=swap" />
        {/* Google Maps APIは_app.tsxでScriptタグを使って読み込み */}
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
