[English 🇬🇧](README.md) | [Deutsch 🇩🇪](README.de.md) | [Español 🇪🇸](README.es.md) | [Português 🇵🇹](README.pt.md) | [Français 🇫🇷](README.fr.md) | [Italiano 🇮🇹](README.it.md) | [Nederlands 🇳🇱](README.nl.md) | [Русский 🇷🇺](README.ru.md) | [中文 🇨🇳](README.zh.md) | [日本語 🇯🇵](README.ja.md) | [한국어 🇰🇷](README.ko.md) | [العربية 🇸🇦](README.ar.md)

> **Note sur les traductions :** Les traductions de ce projet ont été réalisées avec l’aide de l’IA et peuvent contenir des erreurs.

# Navidrome Wrapped

Un récapitulatif annuel de Navidrome dans le style Wrapped : artistes et titres les plus écoutés, minutes d’écoute, découvertes et statistiques amusantes (écoutes nocturnes, répétitions, heure préférée, etc.). Le lecteur d’histoires propose une musique de fond et l’export de chaque carte au format PNG.

- **Backend :** FastAPI, SQLite en lecture seule et ffmpeg pour les extraits audio.
- **Frontend :** HTML/CSS/JavaScript avec Swiper, sans compilation ni CDN.
- **Thèmes :** l’apparence, les textes et l’ordre des diapositives sont personnalisables. Voir [THEMES.md](THEMES.md).
- **Langues :** anglais, allemand, espagnol, portugais, français, italien, néerlandais, russe, chinois, japonais, coréen et arabe.
- **Accessibilité :** pause au clavier, focus visible et annonces des diapositives pour les lecteurs d’écran. Aucune évaluation formelle n’a été réalisée et la conformité WCAG n’est pas garantie.

## Aperçu

![Démonstration de Wrapped](res/tuto.gif)

La connexion est facultative et peut être activée avec `AUTH_USER` et `AUTH_PASSWORD` :

![Écran de connexion](res/login.png)

## Déploiement

L’application fonctionne dans un conteneur Linux. Sous Windows 64 bits, Docker Desktop avec WSL 2 est nécessaire. Il n’existe pas d’exécutable Windows natif et Windows 32 bits n’est pas pris en charge.

```bash
cp .env.example .env
./deploy.sh
# → http://IP-DU-SERVEUR:8100/
```

Principaux paramètres dans `.env` :

| Variable | Valeur |
|---|---|
| `NAVIDROME_NETWORK` | Réseau Docker de Navidrome |
| `NAVIDROME_DATA_DIR` | Répertoire hôte contenant `navidrome.db` |
| `MUSIC_DIR_HOST` | Répertoire hôte contenant la musique |
| `WRAPPED_LANGUAGE` | `en` (par défaut), `de`, `es`, `pt`, `fr`, `it`, `nl`, `ru`, `zh`, `ja`, `ko` ou `ar` |
| `ADMIN_KEY` | Clé d’importation des thèmes ZIP |
| `PUID` / `PGID` | Identifiants utilisateur/groupe autorisés à lire ces répertoires |

La musique doit être montée dans le conteneur au même chemin que celui utilisé par Navidrome (généralement `/music`). Pour choisir le français, définissez `WRAPPED_LANGUAGE=fr` dans `.env`, puis exécutez `./deploy.sh` pour recréer le conteneur. Les thèmes personnalisés doivent fournir leurs propres traductions. Chaque visiteur peut aussi changer la langue avec le sélecteur en haut à droite ; son choix est mémorisé dans son navigateur sans modifier la langue par défaut du serveur.

## Utilisation et sécurité

Sur l’écran d’accueil, saisissez votre nom d’utilisateur Navidrome et choisissez une année. Placez le focus sur la zone de lecture et utilisez ←/→ pour naviguer ; utilisez le bouton de pause ou la touche `P` pour mettre l’histoire en pause. L’interface respecte la préférence système de réduction des animations.

L’authentification est désactivée par défaut. Si l’application est accessible depuis l’extérieur de votre réseau local, utilisez un proxy inverse HTTPS avec authentification. Les thèmes peuvent exécuter du JavaScript dans le navigateur : n’importez que des thèmes provenant de sources fiables.

## API et développement

Routes principales : `/api/health`, `/api/config`, `/api/years?user=`, `/api/wrapped?user=&year=`, `/api/themes` et `/api/themes/{id}`. Pour en savoir plus sur les thèmes et le mode démo local, consultez le [README en anglais](README.md) et [THEMES.md](THEMES.md).
