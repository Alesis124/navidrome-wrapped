const copy = {
  en: ['Use your Navidrome server. This mode shows current library metadata and newest albums only; it cannot create yearly listening statistics.',
    'Public Navidrome URL', 'Navidrome username', 'Password', 'Or use an API token', 'Token', 'Token salt', 'Connect and show available data',
    'Available Navidrome data', 'Current library metadata and newest albums (not year-specific).', '{count} music folders',
    '{title} — {artist}', 'No recent albums are available for this account.', 'Disconnect and clear this session',
    'Enter a password or both a token and salt, not both.'],
  de: ['Nutze deinen Navidrome-Server. Dieser Modus zeigt nur aktuelle Bibliotheksdaten und neueste Alben; Jahresstatistiken sind nicht möglich.',
    'Öffentliche Navidrome-URL', 'Navidrome-Benutzername', 'Passwort', 'Oder API-Token verwenden', 'Token', 'Token-Salt', 'Verbinden und verfügbare Daten anzeigen',
    'Verfügbare Navidrome-Daten', 'Aktuelle Bibliotheksdaten und neueste Alben (nicht jahresbezogen).', '{count} Musikordner',
    '{title} — {artist}', 'Für dieses Konto sind keine aktuellen Alben verfügbar.', 'Trennen und Sitzung löschen',
    'Gib ein Passwort oder Token und Salt ein, aber nicht beides.'],
  es: ['Usa tu servidor Navidrome. Este modo solo muestra metadatos actuales de la biblioteca y los álbumes más recientes; no puede generar estadísticas anuales.',
    'URL pública de Navidrome', 'Usuario de Navidrome', 'Contraseña', 'O usa un token de API', 'Token', 'Salt del token', 'Conectar y mostrar los datos disponibles',
    'Datos disponibles de Navidrome', 'Metadatos actuales de la biblioteca y álbumes más recientes (no son datos anuales).', '{count} carpetas de música',
    '{title} — {artist}', 'Esta cuenta no tiene álbumes recientes disponibles.', 'Desconectar y borrar esta sesión',
    'Introduce una contraseña o un token y su salt, pero no ambos.'],
  pt: ['Use seu servidor Navidrome. Este modo mostra apenas os metadados atuais da biblioteca e os álbuns mais recentes; não gera estatísticas anuais.',
    'URL pública do Navidrome', 'Usuário do Navidrome', 'Senha', 'Ou use um token de API', 'Token', 'Salt do token', 'Conectar e mostrar dados disponíveis',
    'Dados disponíveis do Navidrome', 'Metadados atuais da biblioteca e álbuns mais recentes (não são dados anuais).', '{count} pastas de música',
    '{title} — {artist}', 'Não há álbuns recentes disponíveis para esta conta.', 'Desconectar e apagar esta sessão',
    'Informe uma senha ou um token com salt, não ambos.'],
  fr: ['Utilisez votre serveur Navidrome. Ce mode affiche uniquement les métadonnées actuelles de la bibliothèque et les albums les plus récents ; il ne produit pas de statistiques annuelles.',
    'URL publique Navidrome', 'Nom d’utilisateur Navidrome', 'Mot de passe', 'Ou utilisez un jeton API', 'Jeton', 'Sel du jeton', 'Connecter et afficher les données disponibles',
    'Données Navidrome disponibles', 'Métadonnées actuelles de la bibliothèque et albums les plus récents (pas de données annuelles).', '{count} dossiers musicaux',
    '{title} — {artist}', 'Aucun album récent disponible pour ce compte.', 'Déconnecter et effacer cette session',
    'Saisissez un mot de passe ou un jeton avec son sel, mais pas les deux.'],
  it: ['Usa il tuo server Navidrome. Questa modalità mostra solo i metadati attuali della raccolta e gli album più recenti; non genera statistiche annuali.',
    'URL pubblico di Navidrome', 'Nome utente Navidrome', 'Password', 'Oppure usa un token API', 'Token', 'Salt del token', 'Connetti e mostra i dati disponibili',
    'Dati Navidrome disponibili', 'Metadati attuali della raccolta e album più recenti (non sono dati annuali).', '{count} cartelle musicali',
    '{title} — {artist}', 'Nessun album recente disponibile per questo account.', 'Disconnetti e cancella questa sessione',
    'Inserisci una password oppure un token con il suo salt, non entrambi.'],
  nl: ['Gebruik je Navidrome-server. Deze modus toont alleen huidige bibliotheekgegevens en nieuwste albums; jaarstatistieken zijn niet beschikbaar.',
    'Openbare Navidrome-URL', 'Navidrome-gebruikersnaam', 'Wachtwoord', 'Of gebruik een API-token', 'Token', 'Token-salt', 'Verbinden en beschikbare gegevens tonen',
    'Beschikbare Navidrome-gegevens', 'Huidige bibliotheekgegevens en nieuwste albums (niet per jaar).', '{count} muziekmappen',
    '{title} — {artist}', 'Er zijn geen recente albums beschikbaar voor dit account.', 'Verbinding verbreken en sessie wissen',
    'Voer een wachtwoord of een token met salt in, niet beide.'],
  ru: ['Подключитесь к своему серверу Navidrome. Режим показывает только текущие метаданные библиотеки и новые альбомы; годовую статистику он не создаёт.',
    'Публичный URL Navidrome', 'Имя пользователя Navidrome', 'Пароль', 'Или используйте API-токен', 'Токен', 'Соль токена', 'Подключиться и показать доступные данные',
    'Доступные данные Navidrome', 'Текущие данные библиотеки и новые альбомы (без разбивки по годам).', 'Музыкальных папок: {count}',
    '{title} — {artist}', 'Для этой учётной записи нет новых альбомов.', 'Отключиться и очистить сеанс',
    'Введите пароль либо токен с солью, но не оба варианта.'],
  zh: ['连接到你的 Navidrome 服务器。此模式仅显示当前曲库元数据和最新专辑；不会生成年度收听统计。',
    '公开的 Navidrome URL', 'Navidrome 用户名', '密码', '或使用 API 令牌', '令牌', '令牌盐值', '连接并显示可用数据',
    '可用的 Navidrome 数据', '当前曲库元数据和最新专辑（不按年份统计）。', '{count} 个音乐文件夹',
    '{title} — {artist}', '此账户没有可用的最新专辑。', '断开连接并清除此会话',
    '请输入密码，或同时输入令牌和盐值，不能同时使用两种方式。'],
  ja: ['Navidrome サーバーに接続します。このモードでは現在のライブラリ情報と最新アルバムのみ表示します。年間の再生統計は作成できません。',
    '公開 Navidrome URL', 'Navidrome ユーザー名', 'パスワード', 'または API トークンを使用', 'トークン', 'トークンソルト', '接続して利用可能なデータを表示',
    '利用可能な Navidrome データ', '現在のライブラリ情報と最新アルバム（年別ではありません）。', '音楽フォルダー {count} 個',
    '{title} — {artist}', 'このアカウントに利用可能な最新アルバムはありません。', '切断してこのセッションを消去',
    'パスワード、またはトークンとソルトの両方を入力してください（両方の方式は使えません）。'],
  ko: ['Navidrome 서버에 연결합니다. 이 모드는 현재 라이브러리 메타데이터와 최신 앨범만 표시하며 연간 청취 통계는 만들지 않습니다.',
    '공개 Navidrome URL', 'Navidrome 사용자 이름', '비밀번호', '또는 API 토큰 사용', '토큰', '토큰 솔트', '연결하고 사용 가능한 데이터 표시',
    '사용 가능한 Navidrome 데이터', '현재 라이브러리 메타데이터와 최신 앨범입니다(연도별 데이터가 아님).', '음악 폴더 {count}개',
    '{title} — {artist}', '이 계정에는 이용 가능한 최신 앨범이 없습니다.', '연결 해제 및 이 세션 지우기',
    '비밀번호 또는 토큰과 솔트를 입력하세요. 두 방식을 함께 사용할 수 없습니다.'],
  ar: ['اتصل بخادم Navidrome الخاص بك. يعرض هذا الوضع بيانات المكتبة الحالية وأحدث الألبومات فقط، ولا ينشئ إحصاءات سنوية.',
    'رابط Navidrome عام', 'اسم مستخدم Navidrome', 'كلمة المرور', 'أو استخدم رمز API', 'الرمز', 'ملح الرمز', 'اتصل واعرض البيانات المتاحة',
    'بيانات Navidrome المتاحة', 'بيانات المكتبة الحالية وأحدث الألبومات (ليست خاصة بسنة).', '{count} مجلدات موسيقى',
    '{title} — {artist}', 'لا تتوفر ألبومات حديثة لهذا الحساب.', 'قطع الاتصال ومسح هذه الجلسة',
    'أدخل كلمة مرور أو رمزًا مع ملحه، وليس كليهما.'],
};

const format = (text, values = {}) =>
  text.replace(/\{(\w+)\}/g, (_, key) => String(values[key] ?? ''));

const privacy = {
  en: 'This app does not collect analytics or send data to the project maintainers. Your Navidrome credentials are sent to this Wrapped server and held in its memory for up to eight hours. Use HTTPS.',
  de: 'Diese App erfasst keine Analysedaten und sendet keine Daten an die Projektverantwortlichen. Deine Navidrome-Zugangsdaten werden an diesen Wrapped-Server gesendet und bis zu acht Stunden im Arbeitsspeicher gehalten. Verwende HTTPS.',
  es: 'Esta aplicación no recopila datos de analítica ni envía información a quienes mantienen el proyecto. Tus credenciales de Navidrome se envían a este servidor Wrapped y permanecen en su memoria hasta ocho horas. Usa HTTPS.',
  pt: 'Este aplicativo não coleta dados analíticos nem envia informações aos mantenedores do projeto. Suas credenciais do Navidrome são enviadas a este servidor Wrapped e ficam na memória por até oito horas. Use HTTPS.',
  fr: 'Cette application ne collecte pas de données analytiques et n’envoie aucune donnée aux responsables du projet. Vos identifiants Navidrome sont envoyés à ce serveur Wrapped et conservés en mémoire pendant huit heures maximum. Utilisez HTTPS.',
  it: 'Questa app non raccoglie dati analitici e non invia informazioni ai responsabili del progetto. Le credenziali Navidrome vengono inviate a questo server Wrapped e restano in memoria per un massimo di otto ore. Usa HTTPS.',
  nl: 'Deze app verzamelt geen analysegegevens en stuurt geen gegevens naar de projectbeheerders. Je Navidrome-inloggegevens worden naar deze Wrapped-server gestuurd en maximaal acht uur in het geheugen bewaard. Gebruik HTTPS.',
  ru: 'Приложение не собирает аналитические данные и не отправляет информацию сопровождающим проекта. Данные Navidrome передаются этому серверу Wrapped и хранятся в его памяти не более восьми часов. Используйте HTTPS.',
  zh: '此应用不会收集分析数据，也不会向项目维护者发送信息。Navidrome 凭据会发送到此 Wrapped 服务器，并仅在内存中保留最多八小时。请使用 HTTPS。',
  ja: 'このアプリは分析データを収集せず、プロジェクトの管理者にも情報を送信しません。Navidrome の認証情報はこの Wrapped サーバーに送信され、最大 8 時間メモリ内に保持されます。HTTPS を使用してください。',
  ko: '이 앱은 분석 데이터를 수집하거나 프로젝트 관리자에게 정보를 보내지 않습니다. Navidrome 자격 증명은 이 Wrapped 서버로 전송되며 최대 8시간 동안 메모리에 보관됩니다. HTTPS를 사용하세요.',
  ar: 'لا يجمع هذا التطبيق بيانات التحليلات ولا يرسل معلومات إلى القائمين على المشروع. تُرسل بيانات اعتماد Navidrome إلى خادم Wrapped هذا وتُحفظ في ذاكرته لمدة تصل إلى ثماني ساعات. استخدم HTTPS.',
};
const httpsError = {
  en: 'Open Wrapped over HTTPS. If HTTPS ends at a reverse proxy, configure FORWARDED_ALLOW_IPS for that proxy.',
  de: 'Öffne Wrapped über HTTPS. Wenn HTTPS am Reverse-Proxy endet, konfiguriere FORWARDED_ALLOW_IPS für diesen Proxy.',
  es: 'Abre Wrapped mediante HTTPS. Si HTTPS termina en un proxy inverso, configura FORWARDED_ALLOW_IPS con la dirección de ese proxy.',
  pt: 'Abra o Wrapped por HTTPS. Se o HTTPS terminar num proxy reverso, configure FORWARDED_ALLOW_IPS para esse proxy.',
  fr: 'Ouvrez Wrapped en HTTPS. Si HTTPS se termine sur un proxy inverse, configurez FORWARDED_ALLOW_IPS pour ce proxy.',
  it: 'Apri Wrapped tramite HTTPS. Se HTTPS termina su un reverse proxy, configura FORWARDED_ALLOW_IPS per quel proxy.',
  nl: 'Open Wrapped via HTTPS. Eindigt HTTPS bij een reverse proxy, configureer dan FORWARDED_ALLOW_IPS voor die proxy.',
  ru: 'Откройте Wrapped по HTTPS. Если HTTPS завершается на обратном прокси, укажите его адрес в FORWARDED_ALLOW_IPS.',
  zh: '请通过 HTTPS 打开 Wrapped。如果 HTTPS 在反向代理处终止，请在 FORWARDED_ALLOW_IPS 中配置该代理地址。',
  ja: 'Wrapped を HTTPS で開いてください。HTTPS がリバースプロキシで終端される場合は、FORWARDED_ALLOW_IPS にそのプロキシを設定してください。',
  ko: 'Wrapped를 HTTPS로 여세요. HTTPS가 리버스 프록시에서 종료되면 해당 프록시를 FORWARDED_ALLOW_IPS에 설정하세요.',
  ar: 'افتح Wrapped عبر HTTPS. إذا انتهى HTTPS عند وكيل عكسي، فأضف عنوانه إلى FORWARDED_ALLOW_IPS.',
};

function message(element, text, error = false) {
  element.textContent = text || '';
  element.classList.toggle('err', error);
}

export async function initApiMode(config, locale) {
  const lang = config.language || 'en';
  const words = copy[lang] || copy.en;
  const byId = (id) => document.getElementById(id);
  const form = byId('api-form');
  const panel = byId('api-panel');
  const status = byId('api-message');
  const summaryEl = byId('api-summary');
  const urlField = document.querySelector('.api-url-field');
  const options = byId('options');
  const themePicker = byId('theme-pick');
  const themeOption = themePicker.closest('.opt-sel');
  const themes = new Map();
  const activeThemeTokens = new Set();
  const initialThemeTokens = new Map();
  let loginRedirected = false;

  document.body.dataset.source = 'api';
  document.body.dataset.state = 'gate';
  panel.hidden = false;
  byId('who').hidden = true;
  options.hidden = false;
  byId('api-controls').append(options);
  byId('change').hidden = true;
  byId('splash-title').textContent = 'Navidrome Wrapped';
  byId('splash-msg').textContent = '';
  byId('api-intro').textContent = words[0];
  byId('api-privacy').textContent = privacy[lang] || privacy.en;
  const labels = [
    ['api-url-label', 1], ['api-username-label', 2], ['api-password-label', 3],
    ['api-token-label', 5], ['api-salt-label', 6],
  ];
  for (const [id, index] of labels) byId(id).textContent = words[index];
  document.querySelector('.api-or').textContent = words[4];
  byId('api-connect').textContent = words[7];
  byId('api-summary-title').textContent = words[8];
  byId('api-disconnect').textContent = words[13];
  urlField.hidden = !!config.api_url_configured;
  byId('api-url').required = !config.api_url_configured;
  byId('api-url').disabled = !!config.api_url_configured;
  if (lang === 'es') {
    byId('splash-title').textContent = 'Navidrome Wrapped';
  }

  async function loadThemes() {
    const response = await window.NW_I18N.apiFetch('/api/themes');
    const result = await response.json().catch(() => ({}));
    if (response.status === 401 && config.auth_enabled) {
      loginRedirected = true;
      const next = location.pathname + location.search;
      location.assign(`/login?next=${encodeURIComponent(next)}`);
      return;
    }
    if (!response.ok) throw new Error(result.detail || locale.ui.offline);
    const available = (result.themes || []).filter((theme) => !theme.error);
    themes.clear();
    themePicker.replaceChildren();
    for (const theme of available) {
      themes.set(theme.id, theme);
      const option = document.createElement('option');
      option.value = theme.id;
      option.textContent = theme.name || theme.id;
      themePicker.append(option);
    }
    themeOption.hidden = available.length === 0;
    if (!available.length) return;
    const stored = (() => {
      try { return localStorage.getItem('wrapped.apiTheme'); } catch { return null; }
    })();
    const selected = themes.has(stored) ? stored : (themes.has(result.default) ? result.default : available[0].id);
    themePicker.value = selected;
    await applyTheme(selected);
  }

  async function applyTheme(id) {
    const response = await window.NW_I18N.apiFetch(`/api/themes/${encodeURIComponent(id)}`);
    const theme = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(theme.detail || locale.ui.offline);
    for (const key of activeThemeTokens) {
      const original = initialThemeTokens.get(key);
      if (original) document.documentElement.style.setProperty(key, original);
      else document.documentElement.style.removeProperty(key);
    }
    activeThemeTokens.clear();
    for (const [key, value] of Object.entries(theme.tokens || {})) {
      if (!initialThemeTokens.has(key)) initialThemeTokens.set(key, getComputedStyle(document.documentElement).getPropertyValue(key).trim());
      document.documentElement.style.setProperty(key, value);
      activeThemeTokens.add(key);
    }
    document.documentElement.dataset.theme = theme.id;
    document.querySelectorAll('link[data-api-theme-css], style[data-api-theme-fonts]').forEach((node) => node.remove());
    for (const href of theme.css || []) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = href;
      link.dataset.apiThemeCss = theme.id;
      document.head.append(link);
    }
    if (theme.fonts?.length) {
      const safe = (value) => String(value).replace(/["\\]/g, '');
      const style = document.createElement('style');
      style.dataset.apiThemeFonts = theme.id;
      style.textContent = theme.fonts.map((font) =>
        `@font-face{font-family:"${safe(font.family)}";src:url("${safe(font.url)}");font-weight:${safe(font.weight)};font-style:${safe(font.style || 'normal')}}`).join('\n');
      document.head.append(style);
    }
    try { localStorage.setItem('wrapped.apiTheme', id); } catch { /* Theme choice is optional. */ }
  }

  themePicker.addEventListener('change', () => {
    applyTheme(themePicker.value).catch((error) => message(status, error.message, true));
  });

  const dialog = byId('importer');
  const importOpen = byId('import-open');
  const importForm = byId('imp-form');
  const importMessage = byId('imp-msg');
  const importButton = byId('imp-go');
  const importKey = byId('imp-key');
  const importNotice = dialog.querySelector('.imp-note');
  const storage = {
    get(key) { try { return sessionStorage.getItem(key) || ''; } catch { return ''; } },
    set(key, value) { try { sessionStorage.setItem(key, value); } catch { /* Key persistence is optional. */ } },
  };
  importOpen.hidden = !config.import_enabled || typeof dialog.showModal !== 'function';
  if (importNotice) {
    importNotice.textContent = ({
      en: 'In API mode, imported themes change visual tokens, fonts, and CSS only; their JavaScript and React code is not executed.',
      de: 'Im API-Modus ändern importierte Themes nur Farben, Schriftarten und CSS; JavaScript- und React-Code wird nicht ausgeführt.',
      es: 'En modo API, los temas importados solo cambian colores, fuentes y CSS; su código JavaScript y React no se ejecuta.',
      pt: 'No modo API, os temas importados alteram apenas cores, fontes e CSS; o código JavaScript e React não é executado.',
      fr: 'En mode API, les thèmes importés ne modifient que les couleurs, les polices et le CSS ; leur code JavaScript et React ne s’exécute pas.',
      it: 'In modalità API, i temi importati modificano solo colori, caratteri e CSS; il codice JavaScript e React non viene eseguito.',
      nl: 'In de API-modus wijzigen geïmporteerde thema’s alleen kleuren, lettertypen en CSS; JavaScript- en React-code wordt niet uitgevoerd.',
      ru: 'В режиме API импортированные темы меняют только цвета, шрифты и CSS; код JavaScript и React не выполняется.',
      zh: '在 API 模式下，导入的主题只能更改颜色、字体和 CSS，不会执行其 JavaScript 或 React 代码。',
      ja: 'API モードでは、インポートしたテーマは色、フォント、CSS のみを変更し、JavaScript と React のコードは実行されません。',
      ko: 'API 모드에서 가져온 테마는 색상, 글꼴, CSS만 변경하며 JavaScript와 React 코드는 실행되지 않습니다.',
      ar: 'في وضع API، تغيّر السمات المستوردة الألوان والخطوط وCSS فقط، ولا يُنفّذ كود JavaScript أو React.',
    })[lang] || 'In API mode, imported themes change visual tokens, fonts, and CSS only; their JavaScript and React code is not executed.';
  }
  const logout = byId('logout');
  logout.hidden = !config.auth_enabled;
  logout.addEventListener('click', async () => {
    await window.NW_I18N.apiFetch('/api/logout', { method: 'POST' });
    location.assign(`/login?lang=${encodeURIComponent(lang)}`);
  });
  importOpen.addEventListener('click', () => {
    importKey.value = storage.get('wrapped.key');
    dialog.showModal();
  });
  byId('imp-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', (event) => { if (event.target === dialog) dialog.close(); });
  importForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const file = byId('imp-file').files[0];
    if (!file) return;
    importButton.disabled = true;
    importMessage.textContent = locale.html.uploading || words[7];
    try {
      const key = importKey.value;
      const response = await window.NW_I18N.apiFetch(`/api/themes/import?force=${byId('imp-force').checked}`, {
        method: 'POST', body: file,
        headers: { 'Content-Type': 'application/zip', 'X-Admin-Key': key },
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.detail || locale.ui.offline);
      storage.set('wrapped.key', key);
      await loadThemes();
      themePicker.value = result.id;
      await applyTheme(result.id);
      importMessage.textContent = (locale.html.installed || '').replace('{id}', result.id);
      importForm.reset();
    } catch (error) {
      importMessage.textContent = error instanceof TypeError ? locale.ui.offline : error.message;
      importMessage.classList.add('err');
    } finally {
      importButton.disabled = false;
    }
  });

  function displaySummary(data) {
    if (!data || data.source !== 'api' || data.limited !== true) {
      throw new Error(locale.ui.offline);
    }
    summaryEl.hidden = false;
    form.hidden = true;
    byId('api-scope').textContent = words[9];
    const folders = Array.isArray(data.library?.music_folders) ? data.library.music_folders : [];
    byId('api-library').textContent = format(words[10], {
      count: data.library?.music_folder_count ?? folders.length,
    }) + (folders.length ? `: ${folders.join(', ')}` : '');
    const list = byId('api-latest-albums');
    list.replaceChildren();
    const albums = Array.isArray(data.recent_albums) ? data.recent_albums : [];
    if (!albums.length) {
      const empty = document.createElement('li');
      empty.textContent = words[12];
      list.append(empty);
    }
    for (const album of albums) {
      const item = document.createElement('li');
      if (album.cover_id) {
        const cover = document.createElement('img');
        cover.src = `/api/source/covers/${encodeURIComponent(album.cover_id)}`;
        cover.alt = '';
        cover.loading = 'lazy';
        item.append(cover);
      }
      const text = document.createElement('span');
      text.textContent = format(words[11], {
        title: album.title || '', artist: album.artist || '',
      });
      item.append(text);
      list.append(item);
    }
    message(status, '');
    document.body.dataset.state = 'ready';
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const password = byId('api-password').value;
    const token = byId('api-token').value;
    const salt = byId('api-salt').value;
    const button = byId('api-connect');
    if ((!password && !(token && salt)) || (password && (token || salt))) {
      message(status, words[14], true);
      return;
    }
    button.disabled = true;
    message(status, locale.ui.uploading || words[7]);
    try {
      const response = await window.NW_I18N.apiFetch('/api/source/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: config.api_url_configured ? '' : byId('api-url').value.trim(),
          username: byId('api-username').value.trim(),
          password, token, salt,
        }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        const detail = typeof result.detail === 'string' ? result.detail : locale.ui.offline;
        throw new Error(detail === 'HTTPS is required to send Navidrome credentials.'
          ? (httpsError[lang] || httpsError.en) : detail);
      }
      byId('api-password').value = '';
      byId('api-token').value = '';
      byId('api-salt').value = '';
      byId('api-username').value = '';
      displaySummary(result.summary);
      byId('splash').dataset.ready = '1';
    } catch (error) {
      message(status, error instanceof TypeError ? locale.ui.offline : error.message, true);
      byId('api-password').value = '';
      byId('api-token').value = '';
      byId('api-salt').value = '';
      byId('api-username').value = '';
    } finally {
      button.disabled = false;
    }
  });

  byId('api-disconnect').addEventListener('click', async () => {
    await window.NW_I18N.apiFetch('/api/source/logout', { method: 'POST' }).catch(() => {});
    summaryEl.hidden = true;
    form.hidden = false;
    form.reset();
    message(status, '');
    document.body.dataset.state = 'gate';
  });

  try {
    await loadThemes();
    if (loginRedirected) return;
    const response = await window.NW_I18N.apiFetch('/api/source/summary');
    if (response.ok) {
      displaySummary(await response.json());
    } else if (response.status !== 401) {
      const result = await response.json().catch(() => ({}));
      message(status, result.detail || locale.ui.offline, true);
    }
  } catch (error) {
    if (!loginRedirected) message(status, error.message || locale.ui.offline, true);
  }
  panel.setAttribute('aria-label', words[8]);
  byId('splash').dataset.ready = '1';
}
