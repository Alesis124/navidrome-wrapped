[English 🇬🇧](README.md) | [Deutsch 🇩🇪](README.de.md) | [Español 🇪🇸](README.es.md) | [Português 🇵🇹](README.pt.md) | [Français 🇫🇷](README.fr.md) | [Italiano 🇮🇹](README.it.md) | [Nederlands 🇳🇱](README.nl.md) | [Русский 🇷🇺](README.ru.md) | [中文 🇨🇳](README.zh.md) | [日本語 🇯🇵](README.ja.md) | [한국어 🇰🇷](README.ko.md) | [العربية 🇸🇦](README.ar.md)

> **Vertaalmelding:** De vertalingen in dit project zijn met AI gemaakt en kunnen fouten bevatten.

# Navidrome Wrapped

Een jaaroverzicht in Wrapped-stijl voor Navidrome: meest beluisterde artiesten en nummers, luisterminuten, ontdekkingen en leuke statistieken (nachtelijke luistersessies, herhalingen, favoriete uur en meer). Inclusief een verhaalspeler met achtergrondmuziek en PNG-export van elke kaart.

- **Backend:** FastAPI, SQLite (alleen-lezen) en ffmpeg voor audioclips.
- **Frontend:** HTML/CSS/JavaScript met Swiper, zonder buildstap of CDN.
- **Thema’s:** pas de vormgeving, teksten en volgorde van dia’s aan. Zie [THEMES.md](THEMES.md).
- **Talen:** Engels, Duits, Spaans, Portugees, Frans, Italiaans, Nederlands, Russisch, Chinees, Japans, Koreaans en Arabisch.
- **Toegankelijkheid:** pauzeren met het toetsenbord, zichtbare focus en dia-aankondigingen voor schermlezers. Er is geen formele audit uitgevoerd en WCAG-conformiteit wordt niet gegarandeerd.

## Voorbeeld

![Wrapped-demo](res/tuto.gif)

Het inlogscherm is optioneel en kan worden ingeschakeld met `AUTH_USER` en `AUTH_PASSWORD`:

![Inlogscherm](res/login.png)

## Installatie

De applicatie draait in een Linux-container. Op 64-bits Windows zijn Docker Desktop en WSL 2 nodig. Er is geen native Windows-programma en 32-bits Windows wordt niet ondersteund.

```bash
cp .env.example .env
./deploy.sh
# → http://SERVER-IP:8100/
```

Stel de benodigde paden en opties in `.env` in:

| Variabele | Beschrijving |
|---|---|
| `NAVIDROME_NETWORK` | Docker-netwerk van Navidrome |
| `NAVIDROME_DATA_DIR` | Hostmap met `navidrome.db` |
| `MUSIC_DIR_HOST` | Hostmap met de muziek |
| `WRAPPED_LANGUAGE` | Begintaal: `en` (standaard), `de`, `es`, `pt`, `fr`, `it`, `nl`, `ru`, `zh`, `ja`, `ko` of `ar` |
| `ADMIN_KEY` | Sleutel voor het importeren van ZIP-thema’s |
| `PUID` / `PGID` | Gebruikers-/groeps-ID met leestoegang |

Koppel de muziek in de container aan hetzelfde pad als in Navidrome (meestal `/music`). Voer `./deploy.sh` opnieuw uit nadat je `WRAPPED_LANGUAGE` hebt gewijzigd. Bezoekers kunnen hun taal kiezen op het startscherm voordat ze Wrapped openen; de keuze wordt in hun browser opgeslagen en verandert de standaardtaal van de server niet. Aangepaste thema’s moeten hun eigen vertalingen bevatten.

## Gebruik en beveiliging

Vul op het startscherm je Navidrome-gebruikersnaam in en kies een jaar. Focus op het verhaalgebied en gebruik ←/→ om te navigeren; pauzeren kan met de knop of met `P`. De interface houdt rekening met de systeeminstelling voor minder beweging.

Inloggen is standaard uitgeschakeld. Als de app buiten je thuisnetwerk bereikbaar is, gebruik dan een HTTPS-reverseproxy met authenticatie. Thema’s kunnen JavaScript uitvoeren in de browser; importeer alleen thema’s die je vertrouwt.

## API en ontwikkeling

Belangrijke endpoints: `/api/health`, `/api/config`, `/api/years?user=`, `/api/wrapped?user=&year=`, `/api/themes` en `/api/themes/{id}`. Meer over thema’s en de lokale demo staat in de [Engelse README](README.md) en [THEMES.md](THEMES.md).
