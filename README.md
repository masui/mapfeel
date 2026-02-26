# Mapfeel

- Cosenseプロジェクトの位置情報付きページを地図上に表示するアプリ
- GyamapをVercelで作りなおした
- Tampermonkeyでも動く

## 使い方

- `https://mapfeel.com/プロジェクト名` にアクセス
- [https://scrapbox.io/Mapfeel/](https://scrapbox.io/Mapfeel/)に解説があります

## サンプル

- [原村情報](https://mapfeel.com/haramura-info)
- [東海道五十三次](https://mapfeel.com/toukaidou-map)
- [奈良観光ガイド](https://mapfeel.com/nara-tour-map)
- [神奈川ラーメンマップ](https://mapfeel.com/kanagawa-ramen-map)

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
   - Scrapboxページで地図をクリックすると、Mapfeelが新しいウィンドウで開きます
   - 従来のように地図を編集したいときはShift+クリックしてください
   - ブラウザに表示されるTampermonkeyツールバーからも起動できます

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

