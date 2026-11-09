[English 🇬🇧](README.md) | [Deutsch 🇩🇪](README.de.md) | [Español 🇪🇸](README.es.md) | [Русский 🇷🇺](README.ru.md) | [中文 🇨🇳](README.zh.md) | [日本語 🇯🇵](README.ja.md) | [한국어 🇰🇷](README.ko.md) | [العربية 🇸🇦](README.ar.md)

> **翻訳について：** このプロジェクトの翻訳はAIを使用して作成されており、誤りが含まれる場合があります。

# Navidrome Wrapped

NavidromeのWrapped風年間まとめです。よく聴いたアーティストや曲、再生時間、新しい発見、深夜の再生やリピート、お気に入りの時間などを表示します。ストーリー再生にはBGMがあり、各カードをPNGで保存できます。

- **バックエンド：** FastAPI、読み取り専用SQLite、音声クリップ用ffmpeg。
- **フロントエンド：** HTML/CSS/JavaScriptとSwiper。ビルドやCDNは不要です。
- **テーマ：** 見た目、テキスト、スライド順をカスタマイズできます。[THEMES.md](THEMES.md)を参照してください。
- **言語：** 英語、ドイツ語、スペイン語、ロシア語、中国語、日本語、韓国語、アラビア語。
- **アクセシビリティ：** キーボードでの一時停止、見えるフォーカス、スクリーンリーダー向けのスライド案内に対応。正式な監査は未実施で、WCAG準拠を保証するものではありません。

## プレビュー

![Wrappedのデモ](res/tuto.gif)

`AUTH_USER` と `AUTH_PASSWORD` を設定すると、任意のログイン画面を有効にできます。

![ログイン画面](res/login.png)

## デプロイ

アプリはLinuxコンテナで動作します。64ビットWindowsではDocker DesktopとWSL 2が必要です。Windowsネイティブ版および32ビットWindowsには対応していません。

```bash
cp .env.example .env
./deploy.sh
# → http://サーバーIP:8100/
```

`.env` の主な設定：

| 変数 | 設定内容 |
|---|---|
| `NAVIDROME_NETWORK` | NavidromeのDockerネットワーク |
| `NAVIDROME_DATA_DIR` | `navidrome.db` があるホスト側のディレクトリ |
| `MUSIC_DIR_HOST` | 音楽ファイルがあるホスト側のディレクトリ |
| `WRAPPED_LANGUAGE` | `en`（既定）、`de`、`es`、`ru`、`zh`、`ja`、`ko`、`ar` |
| `ADMIN_KEY` | ZIPテーマのインポートキー |
| `PUID` / `PGID` | ディレクトリを読み取るユーザー/グループID |

コンテナ内の音楽パスはNavidromeと同じにしてください（通常は`/music`）。`WRAPPED_LANGUAGE`を変更したら`./deploy.sh`を再実行します。カスタムテーマには選択した言語の翻訳が必要です。

## 使い方とセキュリティ

開始画面でNavidromeのユーザー名と年を選択します。ストーリー領域にフォーカスして←/→で移動できます。一時停止ボタンまたは`P`キーも使えます。OSの視差効果を減らす設定に対応しています。

初期状態ではログインは無効です。自宅ネットワーク外に公開する場合は、認証付きHTTPSリバースプロキシを使用してください。テーマはブラウザーでJavaScriptを実行できるため、信頼できるテーマのみをインポートしてください。

## APIと開発

主なエンドポイント：`/api/health`、`/api/config`、`/api/years?user=`、`/api/wrapped?user=&year=`、`/api/themes`、`/api/themes/{id}`。テーマとローカルデモの詳細は[英語版README](README.md)と[THEMES.md](THEMES.md)を参照してください。
