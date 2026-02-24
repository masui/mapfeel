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

## Tampermonkeyで使う（Privateプロジェクト対応）

Scrapboxのページから直接Mapfeelを起動できるTampermonkeyスクリプトを用意しています。
ブラウザ上で動作するため、Privateプロジェクトでも利用できます。

### インストール手順

1. **Tampermonkeyをインストール**
   - [Tampermonkey公式サイト](https://www.tampermonkey.net/) からお使いのブラウザ用の拡張機能をインストール
   - Chrome、Firefox、Safari、Edgeに対応しています
2. **Mapfeelスクリプトをインストール**
   - [ここをクリック](https://raw.githubusercontent.com/masui/mapfeel/main/userscripts/mapfeel.user.js) するとTampermonkeyのインストール画面が開きます
   - 「インストール」ボタンを押してください
3. **使う**
   - Scrapboxのページを開いた状態で右クリック → 「Tampermonkey」 → 「Mapfeel」を選択
   - 位置情報付きページの地図が新しいウィンドウで開きます
   - 個別ページから起動すると、そのページの場所にズームして表示します

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


