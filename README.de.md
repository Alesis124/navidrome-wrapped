[English 🇬🇧](README.md) | [Deutsch 🇩🇪](README.de.md) | [Español 🇪🇸](README.es.md) | [Русский 🇷🇺](README.ru.md) | [中文 🇨🇳](README.zh.md) | [日本語 🇯🇵](README.ja.md) | [한국어 🇰🇷](README.ko.md) | [العربية 🇸🇦](README.ar.md)

> **Übersetzungshinweis:** Die Übersetzungen dieses Projekts wurden mit KI erstellt und können Fehler enthalten.

# Navidrome Wrapped

Ein Jahresrückblick für Navidrome im Wrapped-Stil: meistgehörte Künstler und Titel, Hörminuten, Entdeckungen und Statistiken wie Nachtwiedergaben, Wiederholungen und Lieblingsstunde. Der Story-Player bietet Hintergrundmusik und den Export jeder Karte als PNG.

- **Backend:** FastAPI, SQLite (schreibgeschützt) und ffmpeg für Audioclips.
- **Frontend:** HTML, CSS und JavaScript mit Swiper; kein Build-Schritt und kein CDN erforderlich.
- **Themes:** Aussehen, Texte und Reihenfolge der Folien lassen sich über Themes anpassen. Details: [THEMES.md](THEMES.md).
- **Sprachen:** Englisch, Deutsch, Spanisch, Russisch, Chinesisch, Japanisch, Koreanisch und Arabisch.
- **Barrierefreiheit:** Pause per Tastatur, sichtbarer Fokus und Folienansagen für Screenreader. Keine formelle Prüfung oder WCAG-Konformität zugesichert.

## Vorschau

![Wrapped-Demo](res/tuto.gif)

Der optionale Login kann mit `AUTH_USER` und `AUTH_PASSWORD` aktiviert werden:

![Anmeldebildschirm](res/login.png)

## Bereitstellung

Die Anwendung läuft in einem Linux-Container. Unter 64-Bit-Windows sind Docker Desktop und WSL 2 erforderlich. Es gibt keine native Windows-Version und keine Unterstützung für 32-Bit-Windows.

```bash
cp .env.example .env
./deploy.sh
# → http://SERVER-IP:8100/
```

In `.env` sind insbesondere folgende Werte zu setzen:

| Variable | Beschreibung |
|---|---|
| `NAVIDROME_NETWORK` | Docker-Netzwerk von Navidrome |
| `NAVIDROME_DATA_DIR` | Host-Verzeichnis mit `navidrome.db` |
| `MUSIC_DIR_HOST` | Host-Verzeichnis mit der Musik |
| `WRAPPED_LANGUAGE` | `en` (Standard), `de`, `es`, `ru`, `zh`, `ja`, `ko` oder `ar` |
| `ADMIN_KEY` | Schlüssel zum Importieren von ZIP-Themes |
| `PUID` / `PGID` | Benutzer- und Gruppen-ID mit Leserechten |

Die Musik muss im Container unter demselben Pfad eingebunden sein, den Navidrome verwendet (üblicherweise `/music`). Nach Änderungen an `WRAPPED_LANGUAGE` `./deploy.sh` erneut ausführen. Eigene Themes benötigen eigene Übersetzungen.

## Verwendung und Datenschutz

Auf dem Startbildschirm Navidrome-Benutzername und Jahr auswählen. Den Story-Bereich fokussieren und mit ←/→ navigieren; die Wiedergabe lässt sich über die Schaltfläche „Pause“ oder `P` anhalten. Die Anzeige respektiert die Systemeinstellung für reduzierte Bewegung.

Die Anwendung hat standardmäßig keine Anmeldung. Wer den Dienst außerhalb des Heimnetzes bereitstellt, sollte einen authentifizierten HTTPS-Reverse-Proxy verwenden. Theme-Dateien können JavaScript im Browser ausführen; importiere nur vertrauenswürdige Themes.

## API und Entwicklung

Wichtige Endpunkte: `/api/health`, `/api/config`, `/api/years?user=`, `/api/wrapped?user=&year=`, `/api/themes` und `/api/themes/{id}`. Weitere Hinweise zu Themes und zum lokalen Demobetrieb stehen in der englischen [README](README.md) und in [THEMES.md](THEMES.md).
