# OTOCA Demo

GitHub Pagesで動く、OTOCAの簡易MVPです。

## できること

- QRコードからスポットページを開く
- ページ内のJSON-LD `OtocaSpot` を読み込む
- `dropRate` に応じて音カードをランダム抽選
- Google Driveなどに置いた画像・音声URLからトレカを表示
- 取得カードを `localStorage` に保存
- コレクション一覧を表示

## ファイル構成

```txt
otoca-demo/
├─ index.html
├─ style.css
├─ app.js
├─ README.md
└─ spots/
   └─ heiwa-no-kane.html
```

## 使い方

1. GitHubで新しいリポジトリを作る
2. このフォルダ内のファイルをアップロードする
3. Settings → Pages → Deploy from a branch を選ぶ
4. Branchを `main`、folderを `/root` にして保存
5. 公開URLにアクセスする

例：

```txt
https://YOUR_NAME.github.io/otoca-demo/spots/heiwa-no-kane.html
```

このURLをQRコードにすれば、現地で音みくじが始まります。

## Google DriveのURLについて

Google Driveの共有URLが以下のような形の場合：

```txt
https://drive.google.com/file/d/FILE_ID/view?usp=sharing
```

画像・音声として使いやすいURLに変換します：

```txt
https://drive.google.com/uc?export=view&id=FILE_ID
```

音声がうまく再生されない場合は、まずGitHub Pages内に音声ファイルを置くか、Firebase Storage / Supabase Storage / Cloudflare R2 などを使うのがおすすめです。

## 差し替える場所

`spots/heiwa-no-kane.html` のJSON-LD内にある以下を差し替えてください。

- `imageUrl`
- `audioUrl`
- `cards`
- `dropRate`

