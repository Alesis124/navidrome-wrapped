[English 🇬🇧](README.md) | [Deutsch 🇩🇪](README.de.md) | [Español 🇪🇸](README.es.md) | [Português 🇵🇹](README.pt.md) | [Français 🇫🇷](README.fr.md) | [Русский 🇷🇺](README.ru.md) | [中文 🇨🇳](README.zh.md) | [日本語 🇯🇵](README.ja.md) | [한국어 🇰🇷](README.ko.md) | [العربية 🇸🇦](README.ar.md)

> **翻译说明：** 本项目中的翻译由 AI 完成，可能存在错误。

# Navidrome Wrapped

为 Navidrome 生成 Wrapped 风格的年度回顾：最常播放的艺人和歌曲、聆听时长、新发现，以及深夜播放、重复播放和喜爱时段等统计。故事播放界面带有背景音乐，每张卡片均可导出为 PNG。

- **后端：** FastAPI、只读 SQLite，以及用于音频片段的 ffmpeg。
- **前端：** HTML、CSS、JavaScript 和 Swiper；无需构建，也不依赖 CDN。
- **主题：** 可自定义外观、文字和幻灯片顺序，详见 [THEMES.md](THEMES.md)。
- **语言：** 英语、德语、西班牙语、俄语、中文、日语、韩语和阿拉伯语。
- **无障碍：** 支持键盘暂停、可见焦点，以及面向屏幕阅读器的幻灯片播报。尚未进行正式无障碍审计，也不保证符合 WCAG。

## 预览

![Wrapped 演示](res/tuto.gif)

可通过 `AUTH_USER` 和 `AUTH_PASSWORD` 启用可选登录：

![登录界面](res/login.png)

## 部署

应用运行在 Linux 容器中。64 位 Windows 需要 Docker Desktop 和 WSL 2；不提供原生 Windows 版本，也不支持 32 位 Windows。

```bash
cp .env.example .env
./deploy.sh
# → http://服务器地址:8100/
```

`.env` 中的主要设置：

| 变量 | 设置内容 |
|---|---|
| `NAVIDROME_NETWORK` | Navidrome 的 Docker 网络 |
| `NAVIDROME_DATA_DIR` | 存放 `navidrome.db` 的主机目录 |
| `MUSIC_DIR_HOST` | 存放音乐的主机目录 |
| `WRAPPED_LANGUAGE` | `en`（默认）、`de`、`es`、`pt`、`fr`、`ru`、`zh`、`ja`、`ko` 或 `ar` |
| `ADMIN_KEY` | 导入 ZIP 主题的密钥 |
| `PUID` / `PGID` | 有权读取这些目录的用户/组 ID |

容器中的音乐路径必须与 Navidrome 使用的路径一致（通常为 `/music`）。更改 `WRAPPED_LANGUAGE` 后，请重新运行 `./deploy.sh`。自定义主题需要提供对应语言的翻译。访客也可以通过右上角的选择器更改语言；选择会保存在该浏览器中，不会更改服务器的默认语言。

## 使用与安全

在首页输入 Navidrome 用户名并选择年份。聚焦故事区域后使用 ←/→ 导航；也可使用暂停按钮或 `P` 键暂停。界面会尊重系统的减少动态效果设置。

默认不启用登录。若要在家庭网络以外访问，请使用带身份验证的 HTTPS 反向代理。主题可能会在浏览器中运行 JavaScript，只导入可信主题。

## API 与开发

常用接口：`/api/health`、`/api/config`、`/api/years?user=`、`/api/wrapped?user=&year=`、`/api/themes` 和 `/api/themes/{id}`。主题与本地演示的详细说明见[英文 README](README.md)和 [THEMES.md](THEMES.md)。
