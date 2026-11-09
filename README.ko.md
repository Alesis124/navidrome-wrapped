[English 🇬🇧](README.md) | [Deutsch 🇩🇪](README.de.md) | [Español 🇪🇸](README.es.md) | [Português 🇵🇹](README.pt.md) | [Français 🇫🇷](README.fr.md) | [Русский 🇷🇺](README.ru.md) | [中文 🇨🇳](README.zh.md) | [日本語 🇯🇵](README.ja.md) | [한국어 🇰🇷](README.ko.md) | [العربية 🇸🇦](README.ar.md)

> **번역 안내:** 이 프로젝트의 번역은 AI로 작성되어 오류가 있을 수 있습니다.

# Navidrome Wrapped

Navidrome을 위한 Wrapped 스타일 연간 요약입니다. 가장 많이 들은 아티스트와 곡, 감상 시간, 새로운 발견, 심야 재생·반복·선호 시간 등의 통계를 보여줍니다. 스토리 플레이어는 배경 음악을 제공하며 각 카드를 PNG로 저장할 수 있습니다.

- **백엔드:** FastAPI, 읽기 전용 SQLite, 오디오 클립용 ffmpeg.
- **프런트엔드:** HTML/CSS/JavaScript와 Swiper. 빌드 단계나 CDN이 필요하지 않습니다.
- **테마:** 모양, 문구, 슬라이드 순서를 바꿀 수 있습니다. [THEMES.md](THEMES.md)를 참고하세요.
- **언어:** 영어, 독일어, 스페인어, 러시아어, 중국어, 일본어, 한국어, 아랍어.
- **접근성:** 키보드 일시 정지, 표시되는 포커스, 스크린 리더용 슬라이드 안내를 지원합니다. 공식 감사를 받지 않았으며 WCAG 준수를 보장하지 않습니다.

## 미리보기

![Wrapped 데모](res/tuto.gif)

`AUTH_USER`와 `AUTH_PASSWORD`를 설정하면 선택 로그인 화면을 사용할 수 있습니다.

![로그인 화면](res/login.png)

## 배포

앱은 Linux 컨테이너에서 실행됩니다. 64비트 Windows에서는 Docker Desktop과 WSL 2가 필요합니다. Windows 네이티브 실행 파일과 32비트 Windows는 지원하지 않습니다.

```bash
cp .env.example .env
./deploy.sh
# → http://서버-IP:8100/
```

`.env` 주요 설정:

| 변수 | 설정 |
|---|---|
| `NAVIDROME_NETWORK` | Navidrome의 Docker 네트워크 |
| `NAVIDROME_DATA_DIR` | `navidrome.db`가 있는 호스트 디렉터리 |
| `MUSIC_DIR_HOST` | 음악 파일이 있는 호스트 디렉터리 |
| `WRAPPED_LANGUAGE` | `en`(기본값), `de`, `es`, `pt`, `fr`, `ru`, `zh`, `ja`, `ko`, `ar` |
| `ADMIN_KEY` | ZIP 테마 가져오기 키 |
| `PUID` / `PGID` | 디렉터리를 읽을 수 있는 사용자/그룹 ID |

컨테이너 내부의 음악 경로는 Navidrome의 경로와 같아야 합니다(일반적으로 `/music`). `WRAPPED_LANGUAGE`를 바꾼 뒤 `./deploy.sh`를 다시 실행하세요. 사용자 테마에는 해당 언어의 번역이 필요합니다. 방문자는 오른쪽 위 선택기에서 언어를 바꿀 수 있으며, 선택한 언어는 해당 브라우저에 저장되고 서버의 기본 언어는 바뀌지 않습니다.

## 사용 및 보안

시작 화면에서 Navidrome 사용자 이름과 연도를 선택합니다. 스토리 영역에 포커스를 두고 ←/→로 이동할 수 있습니다. 일시 정지 버튼 또는 `P` 키도 사용할 수 있습니다. 시스템의 동작 줄이기 설정을 따릅니다.

기본적으로 로그인이 비활성화되어 있습니다. 홈 네트워크 외부에 공개할 경우 인증이 적용된 HTTPS 리버스 프록시를 사용하세요. 테마는 브라우저에서 JavaScript를 실행할 수 있으므로 신뢰할 수 있는 테마만 가져오세요.

## API 및 개발

주요 엔드포인트: `/api/health`, `/api/config`, `/api/years?user=`, `/api/wrapped?user=&year=`, `/api/themes`, `/api/themes/{id}`. 테마와 로컬 데모에 대한 자세한 내용은 [영문 README](README.md)와 [THEMES.md](THEMES.md)를 참고하세요.
