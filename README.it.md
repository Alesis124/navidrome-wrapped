[English 🇬🇧](README.md) | [Deutsch 🇩🇪](README.de.md) | [Español 🇪🇸](README.es.md) | [Português 🇵🇹](README.pt.md) | [Français 🇫🇷](README.fr.md) | [Italiano 🇮🇹](README.it.md) | [Nederlands 🇳🇱](README.nl.md) | [Русский 🇷🇺](README.ru.md) | [中文 🇨🇳](README.zh.md) | [日本語 🇯🇵](README.ja.md) | [한국어 🇰🇷](README.ko.md) | [العربية 🇸🇦](README.ar.md)

> **Nota sulle traduzioni:** le traduzioni di questo progetto sono state realizzate con l’IA e potrebbero contenere errori.

# Navidrome Wrapped

Un riepilogo annuale in stile Wrapped per Navidrome: artisti e brani più ascoltati, minuti di ascolto, nuove scoperte e statistiche divertenti (ascolti notturni, ripetizioni, ora preferita e altro). Include un lettore di storie con musica di sottofondo e l’esportazione di ogni scheda in PNG.

- **Backend:** FastAPI, SQLite in sola lettura e ffmpeg per i clip audio.
- **Frontend:** HTML/CSS/JavaScript con Swiper, senza compilazione né CDN.
- **Temi:** aspetto, testi e ordine delle diapositive personalizzabili. Consulta [THEMES.md](THEMES.md).
- **Lingue:** inglese, tedesco, spagnolo, portoghese, francese, italiano, olandese, russo, cinese, giapponese, coreano e arabo.
- **Accessibilità:** pausa da tastiera, focus visibile e annunci delle diapositive per gli screen reader. Non è stata eseguita una verifica formale e non si garantisce la conformità WCAG.

## Anteprima

![Demo di Wrapped](res/tuto.gif)

La schermata di accesso è facoltativa e si può attivare con `AUTH_USER` e `AUTH_PASSWORD`:

![Schermata di accesso](res/login.png)

## Installazione

L’applicazione viene eseguita in un container Linux. Su Windows a 64 bit servono Docker Desktop e WSL 2; non esiste un eseguibile Windows nativo e Windows a 32 bit non è supportato.

```bash
cp .env.example .env
./deploy.sh
# → http://IP-DEL-SERVER:8100/
```

In `.env`, imposta i percorsi e le opzioni necessari:

| Variabile | Descrizione |
|---|---|
| `NAVIDROME_NETWORK` | Rete Docker di Navidrome |
| `NAVIDROME_DATA_DIR` | Cartella host che contiene `navidrome.db` |
| `MUSIC_DIR_HOST` | Cartella host che contiene la musica |
| `WRAPPED_LANGUAGE` | Lingua iniziale: `en` (predefinita), `de`, `es`, `pt`, `fr`, `it`, `nl`, `ru`, `zh`, `ja`, `ko` o `ar` |
| `ADMIN_KEY` | Chiave per importare temi ZIP |
| `PUID` / `PGID` | ID utente/gruppo con accesso in lettura |

La musica deve essere montata nel container nello stesso percorso usato da Navidrome (di solito `/music`). Dopo aver modificato `WRAPPED_LANGUAGE`, esegui di nuovo `./deploy.sh`. Ogni visitatore può anche cambiare lingua dal selettore in alto a destra: la scelta viene salvata nel browser e non modifica la lingua iniziale del server. I temi personalizzati devono includere le proprie traduzioni.

## Uso e sicurezza

Nella schermata iniziale inserisci il nome utente Navidrome e scegli un anno. Porta il focus sull’area della storia e usa ←/→ per navigare; puoi mettere in pausa con il pulsante o con `P`. L’interfaccia rispetta l’impostazione di sistema per ridurre le animazioni.

L’accesso è disattivato per impostazione predefinita. Se l’app è raggiungibile da Internet, usa un reverse proxy HTTPS con autenticazione. I temi possono eseguire JavaScript nel browser: importa solo temi attendibili.

## API e sviluppo

Endpoint principali: `/api/health`, `/api/config`, `/api/years?user=`, `/api/wrapped?user=&year=`, `/api/themes` e `/api/themes/{id}`. Per i temi e la demo locale, consulta [README in inglese](README.md) e [THEMES.md](THEMES.md).
