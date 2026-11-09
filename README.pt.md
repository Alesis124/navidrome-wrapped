[English 🇬🇧](README.md) | [Deutsch 🇩🇪](README.de.md) | [Español 🇪🇸](README.es.md) | [Português 🇵🇹](README.pt.md) | [Français 🇫🇷](README.fr.md) | [Русский 🇷🇺](README.ru.md) | [中文 🇨🇳](README.zh.md) | [日本語 🇯🇵](README.ja.md) | [한국어 🇰🇷](README.ko.md) | [العربية 🇸🇦](README.ar.md)

> **Aviso de tradução:** As traduções deste projeto foram feitas com IA e podem conter erros.

# Navidrome Wrapped

Uma retrospectiva anual para o Navidrome no estilo Wrapped: artistas e faixas mais ouvidos, minutos de reprodução, descobertas e estatísticas como reproduções noturnas, repetições e horário favorito. O reprodutor de histórias inclui música de fundo e permite exportar cada cartão como PNG.

- **Backend:** FastAPI, SQLite somente para leitura e ffmpeg para os trechos de áudio.
- **Frontend:** HTML, CSS, JavaScript e Swiper; sem etapa de build ou CDN.
- **Temas:** personalize a aparência, os textos e a ordem dos slides. Consulte [THEMES.md](THEMES.md).
- **Idiomas:** inglês, alemão, espanhol, português, russo, chinês, japonês, coreano e árabe.
- **Acessibilidade:** pausa pelo teclado, foco visível e anúncios de slides para leitores de tela. Não houve auditoria formal e não há garantia de conformidade com WCAG.

## Prévia

![Demonstração do Wrapped](res/tuto.gif)

A tela de login é opcional e pode ser ativada com `AUTH_USER` e `AUTH_PASSWORD`:

![Tela de login](res/login.png)

## Implantação

O aplicativo funciona em um contêiner Linux. No Windows de 64 bits, é necessário usar Docker Desktop com WSL 2. Não há executável nativo para Windows nem suporte ao Windows de 32 bits.

```bash
cp .env.example .env
./deploy.sh
# → http://IP-DO-SERVIDOR:8100/
```

Configurações principais em `.env`:

| Variável | O que definir |
|---|---|
| `NAVIDROME_NETWORK` | Rede Docker do Navidrome |
| `NAVIDROME_DATA_DIR` | Diretório do host que contém `navidrome.db` |
| `MUSIC_DIR_HOST` | Diretório do host com os arquivos de música |
| `WRAPPED_LANGUAGE` | `en` (padrão), `de`, `es`, `pt`, `fr`, `ru`, `zh`, `ja`, `ko` ou `ar` |
| `ADMIN_KEY` | Chave para importar temas ZIP |
| `PUID` / `PGID` | IDs de usuário/grupo com acesso de leitura aos diretórios |

A música deve ser montada no contêiner no mesmo caminho usado pelo Navidrome (normalmente `/music`). Para escolher português, defina `WRAPPED_LANGUAGE=pt` em `.env` e execute `./deploy.sh` para recriar o contêiner. Temas personalizados precisam incluir suas próprias traduções. Cada visitante também pode mudar o idioma no seletor no canto superior direito; a escolha fica salva naquele navegador e não altera o idioma padrão do servidor.

## Uso e segurança

Na tela inicial, informe o usuário do Navidrome e escolha o ano. Foque a área da história e use ←/→ para navegar; use o botão de pausa ou a tecla `P` para pausar. A interface respeita a preferência do sistema para reduzir movimento.

O login vem desativado por padrão. Se o aplicativo ficar acessível fora da sua rede doméstica, use um proxy reverso com autenticação e HTTPS. Temas podem executar JavaScript no navegador; importe apenas temas de fontes confiáveis.

## API e desenvolvimento

Rotas principais: `/api/health`, `/api/config`, `/api/years?user=`, `/api/wrapped?user=&year=`, `/api/themes` e `/api/themes/{id}`. Para detalhes sobre temas e execução de demonstração local, consulte o [README em inglês](README.md) e [THEMES.md](THEMES.md).
