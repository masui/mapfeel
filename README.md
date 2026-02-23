# Mapfeel

- Scrapboxプロジェクトの位置情報付きページを地図上に表示するアプリ
- GyamapをVercelで作りなおした

## 使い方

`https://mapfeel.com/プロジェクト名` にアクセス

例: `https://mapfeel.com/masuimap`

## Scrapboxページの書き方

ページの先頭5行以内に以下の形式で位置情報を記述:

[N35.6812,E139.7671,Z13]

- `N/S`: 北緯/南緯
- `E/W`: 東経/西経
- `Z`: ズームレベル

## Tampermonkeyで使う

Scrapboxのページから直接Mapfeelを起動できるTampermonkeyスクリプトも用意しています。

1. [Tampermonkey](https://www.tampermonkey.net/) をブラウザにインストール
2. [mapfeel.user.js](https://raw.githubusercontent.com/masui/mapfeel/main/userscripts/mapfeel.user.js) にアクセスしてスクリプトをインストール
3. Scrapboxのプロジェクトページを開くと右下に「🗺 Mapfeel」ボタンが表示される

## 操作方法

- 地図ドラッグ: 近くのPOIを表示
- 画像クリック: その場所に移動
- 矢印アイコンクリック: その場所に移動
- タイトルクリック: Scrapboxページを開く
- ↑↓キー: タイトル順でPOI移動

## 技術スタック

- Leaflet + OpenStreetMap
- jQuery
- Vercel Serverless Functions

## ローカル開発

npm i -g vercel
vercel dev

デプロイ

vercel --prod


