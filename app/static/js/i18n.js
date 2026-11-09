const messages = {
  en: {
    html: {
      slides: 'Slides', options: 'Options', home: 'Back to start', mute: 'Mute', save: 'Download card', volume: 'Volume',
      pause: 'Pause story', resume: 'Resume story', story: 'Wrapped story player',
      slide_position: 'Slide {current} of {total}: {label}',
      username: 'Your Navidrome username', username_placeholder: 'Enter your username', year: 'Year',
      theme: 'Theme', change: 'Change user or year', import_theme: 'Import theme (.zip)', logout: 'Log out',
      change_card: 'change slides', mute_music: 'mute music', save_image: 'save card as image',
      back_start: 'back to start', hold_pause: 'Press and hold to pause',
      save_title: 'Download card', save_question: 'Which screen is this image for?',
      desktop: 'Desktop', landscape: 'Landscape', mobile: 'Mobile', portrait: 'Portrait 9:16', space: 'Space',
      cancel: 'Cancel', loading: 'Loading', preparing_image: 'Preparing image…',
      import_title: 'Import theme',
      import_help: 'Upload a .zip containing theme.json. A theme can run code in the browser of anyone who opens it: only import themes from people you trust.',
      zip_file: '.zip file', admin_key: 'Admin key', replace: 'Replace if it already exists',
      close: 'Close', import: 'Import', login_intro: 'Log in to see your recap.',
      login_user: 'Username', login_password: 'Password', login_submit: 'Log in',
    },
    ui: {
      home: 'Home', minutes: 'Minutes', artists: 'Artists', tracks: 'Tracks', number_one: 'Your #1',
      discoveries: 'Discoveries', months: 'Months', age: 'Your age', favorite_hour: 'Favorite hour',
      late_night: 'Late night', loop: 'On repeat', repeat: 'Repeat streak', recap: 'Recap', finale: 'Finale',
      enter_username: 'Enter your Navidrome username and choose a year.',
      greeting: 'Hello, {user}.', gate_title: 'Who is<br>listening?', gate_button: 'See my Wrapped',
      splash_title: 'Your Wrapped', splash_button: 'Start', start: 'Start',
      import_disabled: 'Theme importing is disabled. Run ./deploy.sh on the server to create ADMIN_KEY in .env, then reload this page.',
      uploading: 'Uploading…', use_now: 'Use now', installed: 'Theme “{id}” installed.',
      not_found: 'User not found', offline: 'Cannot connect to the server',
      theme_error: 'Could not load theme “{id}”: {error}',
    },
    login: { failed: 'Could not log in', offline: 'Cannot connect to the server' },
  },
  de: {
    html: {
      slides: 'Folien', options: 'Optionen', home: 'Zurück zum Anfang', mute: 'Stummschalten', save: 'Karte herunterladen', volume: 'Lautstärke',
      pause: 'Story pausieren', resume: 'Story fortsetzen', story: 'Wrapped-Story-Player',
      slide_position: 'Folie {current} von {total}: {label}',
      username: 'Dein Navidrome-Benutzername', username_placeholder: 'Benutzernamen eingeben', year: 'Jahr',
      theme: 'Theme', change: 'Benutzer oder Jahr ändern', import_theme: 'Theme importieren (.zip)', logout: 'Abmelden',
      change_card: 'Folien wechseln', mute_music: 'Musik stummschalten', save_image: 'Karte als Bild speichern',
      back_start: 'zurück zum Anfang', hold_pause: 'Zum Pausieren gedrückt halten',
      save_title: 'Karte herunterladen', save_question: 'Für welchen Bildschirm ist dieses Bild?',
      desktop: 'Computer', landscape: 'Querformat', mobile: 'Mobilgerät', portrait: 'Hochformat 9:16', space: 'Leertaste',
      cancel: 'Abbrechen', loading: 'Wird geladen', preparing_image: 'Bild wird vorbereitet…',
      import_title: 'Theme importieren',
      import_help: 'Lade eine .zip-Datei mit theme.json hoch. Ein Theme kann Code im Browser ausführen: Importiere nur Themes von Personen, denen du vertraust.',
      zip_file: '.zip-Datei', admin_key: 'Administratorschlüssel', replace: 'Vorhandenes Theme ersetzen',
      close: 'Schließen', import: 'Importieren', login_intro: 'Melde dich an, um deine Zusammenfassung zu sehen.',
      login_user: 'Benutzername', login_password: 'Passwort', login_submit: 'Anmelden',
    },
    ui: {
      home: 'Start', minutes: 'Minuten', artists: 'Künstler', tracks: 'Titel', number_one: 'Deine Nr. 1',
      discoveries: 'Entdeckungen', months: 'Monate', age: 'Dein Musikalter', favorite_hour: 'Lieblingsstunde',
      late_night: 'Nachts', loop: 'In Dauerschleife', repeat: 'Wiederholungen', recap: 'Rückblick', finale: 'Ende',
      enter_username: 'Gib deinen Navidrome-Benutzernamen ein und wähle ein Jahr.',
      greeting: 'Hallo, {user}.', gate_title: 'Wer<br>hört zu?', gate_button: 'Mein Wrapped ansehen',
      splash_title: 'Dein Wrapped', splash_button: 'Starten', start: 'Starten',
      import_disabled: 'Der Theme-Import ist deaktiviert. Führe ./deploy.sh auf dem Server aus, um ADMIN_KEY in .env zu erstellen, und lade die Seite neu.',
      uploading: 'Wird hochgeladen…', use_now: 'Jetzt verwenden', installed: 'Theme „{id}“ installiert.',
      not_found: 'Benutzer nicht gefunden', offline: 'Keine Verbindung zum Server',
      theme_error: 'Theme „{id}“ konnte nicht geladen werden: {error}',
    },
    login: { failed: 'Anmeldung fehlgeschlagen', offline: 'Keine Verbindung zum Server' },
  },
  es: {
    html: {
      slides: 'Diapositivas', options: 'Opciones', home: 'Volver al inicio', mute: 'Silenciar', save: 'Descargar tarjeta', volume: 'Volumen',
      pause: 'Pausar historia', resume: 'Reanudar historia', story: 'Reproductor de historias Wrapped',
      slide_position: 'Diapositiva {current} de {total}: {label}',
      username: 'Tu usuario de Navidrome', username_placeholder: 'Escribe tu usuario', year: 'Año',
      theme: 'Tema', change: 'Cambiar usuario o año', import_theme: 'Importar tema (.zip)', logout: 'Cerrar sesión',
      change_card: 'cambiar de tarjeta', mute_music: 'silenciar la música', save_image: 'guardar la tarjeta como imagen',
      back_start: 'volver al inicio', hold_pause: 'Mantén pulsado para pausar',
      save_title: 'Descargar tarjeta', save_question: '¿Para qué pantalla quieres la imagen?',
      desktop: 'Ordenador', landscape: 'Apaisada', mobile: 'Móvil', portrait: 'Vertical 9:16', space: 'Espacio',
      cancel: 'Cancelar', loading: 'Cargando', preparing_image: 'Preparando la imagen…',
      import_title: 'Importar tema',
      import_help: 'Sube un .zip con theme.json. Un tema puede ejecutar código en el navegador de quien lo abra: importa solo temas de gente en la que confíes.',
      zip_file: 'Fichero .zip', admin_key: 'Clave de administrador', replace: 'Sustituir si ya existe',
      close: 'Cerrar', import: 'Importar', login_intro: 'Inicia sesión para ver tu resumen.',
      login_user: 'Usuario', login_password: 'Contraseña', login_submit: 'Entrar',
    },
    ui: {
      home: 'Inicio', minutes: 'Minutos', artists: 'Artistas', tracks: 'Canciones', number_one: 'Tu nº 1',
      discoveries: 'Descubrimientos', months: 'Meses', age: 'Tu edad', favorite_hour: 'Hora favorita',
      late_night: 'Madrugada', loop: 'Bucle', repeat: 'En repetición', recap: 'Resumen', finale: 'Final',
      enter_username: 'Escribe tu usuario de Navidrome y elige el año.',
      greeting: 'Hola, {user}.', gate_title: '¿Quién<br>escucha?', gate_button: 'Ver mi Wrapped',
      splash_title: 'Tu Wrapped', splash_button: 'Empezar', start: 'Empezar',
      import_disabled: 'La importación está desactivada. Ejecuta ./deploy.sh en el servidor para crear ADMIN_KEY en .env y vuelve a abrir esta página.',
      uploading: 'Subiendo…', use_now: 'Usarlo ahora', installed: 'Tema «{id}» instalado.',
      not_found: 'No encuentro el usuario', offline: 'No hay conexión con el servidor',
      theme_error: 'No se pudo cargar el tema «{id}»: {error}',
    },
    login: { failed: 'No se pudo iniciar sesión', offline: 'No hay conexión con el servidor' },
  },
  pt: {
    html: {
      slides: 'Slides', options: 'Opções', home: 'Voltar ao início', mute: 'Silenciar', save: 'Baixar cartão', volume: 'Volume',
      pause: 'Pausar história', resume: 'Retomar história', story: 'Reprodutor de histórias Wrapped',
      slide_position: 'Slide {current} de {total}: {label}',
      username: 'Seu usuário do Navidrome', username_placeholder: 'Digite seu usuário', year: 'Ano',
      theme: 'Tema', change: 'Trocar usuário ou ano', import_theme: 'Importar tema (.zip)', logout: 'Sair',
      change_card: 'trocar de slide', mute_music: 'silenciar a música', save_image: 'salvar o cartão como imagem',
      back_start: 'voltar ao início', hold_pause: 'Mantenha pressionado para pausar',
      save_title: 'Baixar cartão', save_question: 'Para qual tela é esta imagem?',
      desktop: 'Computador', landscape: 'Paisagem', mobile: 'Celular', portrait: 'Retrato 9:16', space: 'Espaço',
      cancel: 'Cancelar', loading: 'Carregando', preparing_image: 'Preparando a imagem…',
      import_title: 'Importar tema',
      import_help: 'Envie um arquivo .zip com theme.json. Um tema pode executar código no navegador: importe apenas temas de fontes confiáveis.',
      zip_file: 'Arquivo .zip', admin_key: 'Chave de administrador', replace: 'Substituir se já existir',
      close: 'Fechar', import: 'Importar', login_intro: 'Entre para ver sua retrospectiva.',
      login_user: 'Usuário', login_password: 'Senha', login_submit: 'Entrar',
    },
    ui: {
      home: 'Início', minutes: 'Minutos', artists: 'Artistas', tracks: 'Faixas', number_one: 'Seu nº 1',
      discoveries: 'Descobertas', months: 'Meses', age: 'Sua idade musical', favorite_hour: 'Horário favorito',
      late_night: 'Madrugada', loop: 'No repetir', repeat: 'Repetições seguidas', recap: 'Resumo', finale: 'Final',
      enter_username: 'Digite seu usuário do Navidrome e escolha um ano.',
      greeting: 'Olá, {user}.', gate_title: 'Quem está<br>ouvindo?', gate_button: 'Ver meu Wrapped',
      splash_title: 'Seu Wrapped', splash_button: 'Começar', start: 'Começar',
      import_disabled: 'A importação de temas está desativada. Execute ./deploy.sh no servidor para criar ADMIN_KEY em .env e recarregue a página.',
      uploading: 'Enviando…', use_now: 'Usar agora', installed: 'Tema “{id}” instalado.',
      not_found: 'Usuário não encontrado', offline: 'Não foi possível conectar ao servidor',
      theme_error: 'Não foi possível carregar o tema “{id}”: {error}',
    },
    login: { failed: 'Não foi possível entrar', offline: 'Não foi possível conectar ao servidor' },
  },
  fr: {
    html: {
      slides: 'Diapositives', options: 'Options', home: 'Retour au début', mute: 'Couper le son', save: 'Télécharger la carte', volume: 'Volume',
      pause: 'Mettre l’histoire en pause', resume: 'Reprendre l’histoire', story: 'Lecteur d’histoires Wrapped',
      slide_position: 'Diapositive {current} sur {total} : {label}',
      username: 'Votre nom d’utilisateur Navidrome', username_placeholder: 'Saisissez votre nom d’utilisateur', year: 'Année',
      theme: 'Thème', change: 'Changer d’utilisateur ou d’année', import_theme: 'Importer un thème (.zip)', logout: 'Se déconnecter',
      change_card: 'changer de diapositive', mute_music: 'couper la musique', save_image: 'enregistrer la carte en image',
      back_start: 'revenir au début', hold_pause: 'Maintenir appuyé pour mettre en pause',
      save_title: 'Télécharger la carte', save_question: 'Pour quel écran souhaitez-vous cette image ?',
      desktop: 'Ordinateur', landscape: 'Paysage', mobile: 'Mobile', portrait: 'Portrait 9:16', space: 'Espace',
      cancel: 'Annuler', loading: 'Chargement', preparing_image: 'Préparation de l’image…',
      import_title: 'Importer un thème',
      import_help: 'Envoyez un fichier .zip contenant theme.json. Un thème peut exécuter du code dans le navigateur : importez uniquement des thèmes provenant de sources fiables.',
      zip_file: 'Fichier .zip', admin_key: 'Clé administrateur', replace: 'Remplacer s’il existe déjà',
      close: 'Fermer', import: 'Importer', login_intro: 'Connectez-vous pour consulter votre récapitulatif.',
      login_user: 'Nom d’utilisateur', login_password: 'Mot de passe', login_submit: 'Se connecter',
    },
    ui: {
      home: 'Accueil', minutes: 'Minutes', artists: 'Artistes', tracks: 'Titres', number_one: 'Votre nº 1',
      discoveries: 'Découvertes', months: 'Mois', age: 'Votre âge musical', favorite_hour: 'Heure préférée',
      late_night: 'Écoutes nocturnes', loop: 'En boucle', repeat: 'Écoutes consécutives', recap: 'Récapitulatif', finale: 'Fin',
      enter_username: 'Saisissez votre nom d’utilisateur Navidrome et choisissez une année.',
      greeting: 'Bonjour, {user}.', gate_title: 'Qui est en train<br>d’écouter ?', gate_button: 'Voir mon Wrapped',
      splash_title: 'Votre Wrapped', splash_button: 'Commencer', start: 'Commencer',
      import_disabled: 'L’importation de thèmes est désactivée. Exécutez ./deploy.sh sur le serveur pour créer ADMIN_KEY dans .env, puis rechargez cette page.',
      uploading: 'Envoi en cours…', use_now: 'Utiliser', installed: 'Le thème « {id} » a été installé.',
      not_found: 'Utilisateur introuvable', offline: 'Impossible de se connecter au serveur',
      theme_error: 'Impossible de charger le thème « {id} » : {error}',
    },
    login: { failed: 'Connexion impossible', offline: 'Impossible de se connecter au serveur' },
  },
  ru: {
    html: {
      slides: 'Слайды', options: 'Параметры', home: 'На главную', mute: 'Выключить звук', save: 'Скачать карточку', volume: 'Громкость',
      pause: 'Приостановить историю', resume: 'Продолжить историю', story: 'Проигрыватель Wrapped',
      slide_position: 'Слайд {current} из {total}: {label}',
      username: 'Имя пользователя Navidrome', username_placeholder: 'Введите имя пользователя', year: 'Год',
      theme: 'Тема', change: 'Изменить пользователя или год', import_theme: 'Импортировать тему (.zip)', logout: 'Выйти',
      change_card: 'переключить слайд', mute_music: 'выключить музыку', save_image: 'сохранить карточку как изображение',
      back_start: 'на главную', hold_pause: 'Нажмите и удерживайте, чтобы приостановить',
      save_title: 'Скачать карточку', save_question: 'Для какого экрана предназначено изображение?',
      desktop: 'Компьютер', landscape: 'Альбомная', mobile: 'Телефон', portrait: 'Портретная 9:16', space: 'Пробел',
      cancel: 'Отмена', loading: 'Загрузка', preparing_image: 'Подготовка изображения…',
      import_title: 'Импорт темы',
      import_help: 'Загрузите .zip с theme.json. Тема может запускать код в браузере: импортируйте темы только от тех, кому доверяете.',
      zip_file: 'Файл .zip', admin_key: 'Ключ администратора', replace: 'Заменить, если уже существует',
      close: 'Закрыть', import: 'Импортировать', login_intro: 'Войдите, чтобы увидеть свой обзор.',
      login_user: 'Имя пользователя', login_password: 'Пароль', login_submit: 'Войти',
    },
    ui: {
      home: 'Начало', minutes: 'Минуты', artists: 'Исполнители', tracks: 'Треки', number_one: '№ 1',
      discoveries: 'Открытия', months: 'Месяцы', age: 'Музыкальный возраст', favorite_hour: 'Любимый час',
      late_night: 'Ночные прослушивания', loop: 'На повторе', repeat: 'Повторы подряд', recap: 'Итоги', finale: 'Финал',
      enter_username: 'Введите имя пользователя Navidrome и выберите год.',
      greeting: 'Здравствуйте, {user}.', gate_title: 'Кто<br>слушает?', gate_button: 'Мой Wrapped',
      splash_title: 'Ваш Wrapped', splash_button: 'Начать', start: 'Начать',
      import_disabled: 'Импорт тем отключён. Запустите ./deploy.sh на сервере, чтобы создать ADMIN_KEY в .env, затем обновите страницу.',
      uploading: 'Загрузка…', use_now: 'Использовать', installed: 'Тема «{id}» установлена.',
      not_found: 'Пользователь не найден', offline: 'Нет соединения с сервером',
      theme_error: 'Не удалось загрузить тему «{id}»: {error}',
    },
    login: { failed: 'Не удалось войти', offline: 'Нет соединения с сервером' },
  },
  zh: {
    html: {
      slides: '幻灯片', options: '选项', home: '返回首页', mute: '静音', save: '下载卡片', volume: '音量',
      pause: '暂停故事', resume: '继续故事', story: 'Wrapped 故事播放器',
      slide_position: '第 {current}/{total} 张幻灯片：{label}',
      username: 'Navidrome 用户名', username_placeholder: '输入用户名', year: '年份',
      theme: '主题', change: '更改用户或年份', import_theme: '导入主题（.zip）', logout: '退出登录',
      change_card: '切换幻灯片', mute_music: '静音', save_image: '将卡片保存为图片',
      back_start: '返回首页', hold_pause: '按住以暂停',
      save_title: '下载卡片', save_question: '此图片用于哪种屏幕？',
      desktop: '电脑', landscape: '横向', mobile: '手机', portrait: '纵向 9:16', space: '空格',
      cancel: '取消', loading: '正在加载', preparing_image: '正在准备图片…',
      import_title: '导入主题', import_help: '上传包含 theme.json 的 .zip 文件。主题可能会在浏览器中运行代码，请只导入可信来源的主题。',
      zip_file: '.zip 文件', admin_key: '管理员密钥', replace: '如果已存在则替换',
      close: '关闭', import: '导入', login_intro: '登录以查看你的年度回顾。',
      login_user: '用户名', login_password: '密码', login_submit: '登录',
    },
    ui: {
      home: '首页', minutes: '收听分钟', artists: '艺人', tracks: '歌曲', number_one: '年度第一',
      discoveries: '新发现', months: '月份', age: '音乐年龄', favorite_hour: '最爱时段',
      late_night: '深夜收听', loop: '循环播放', repeat: '连续重复', recap: '回顾', finale: '结束',
      enter_username: '输入 Navidrome 用户名并选择年份。',
      greeting: '你好，{user}。', gate_title: '谁在<br>聆听？', gate_button: '查看我的 Wrapped',
      splash_title: '你的 Wrapped', splash_button: '开始', start: '开始',
      import_disabled: '主题导入已禁用。请在服务器上运行 ./deploy.sh 以在 .env 中创建 ADMIN_KEY，然后重新加载页面。',
      uploading: '正在上传…', use_now: '立即使用', installed: '主题“{id}”已安装。',
      not_found: '未找到用户', offline: '无法连接到服务器',
      theme_error: '无法加载主题“{id}”：{error}',
    },
    login: { failed: '无法登录', offline: '无法连接到服务器' },
  },
  ja: {
    html: {
      slides: 'スライド', options: 'オプション', home: '最初に戻る', mute: 'ミュート', save: 'カードをダウンロード', volume: '音量',
      pause: 'ストーリーを一時停止', resume: 'ストーリーを再開', story: 'Wrapped ストーリープレーヤー',
      slide_position: '{total} 枚中 {current} 枚目：{label}',
      username: 'Navidrome のユーザー名', username_placeholder: 'ユーザー名を入力', year: '年',
      theme: 'テーマ', change: 'ユーザーまたは年を変更', import_theme: 'テーマをインポート（.zip）', logout: 'ログアウト',
      change_card: 'スライドを切り替える', mute_music: '音楽をミュート', save_image: 'カードを画像として保存',
      back_start: '最初に戻る', hold_pause: '長押しで一時停止',
      save_title: 'カードをダウンロード', save_question: '画像を表示する画面を選択してください',
      desktop: 'パソコン', landscape: '横向き', mobile: 'スマートフォン', portrait: '縦向き 9:16', space: 'スペース',
      cancel: 'キャンセル', loading: '読み込み中', preparing_image: '画像を準備しています…',
      import_title: 'テーマをインポート',
      import_help: 'theme.json を含む .zip をアップロードします。テーマはブラウザーでコードを実行できます。信頼できるテーマだけをインポートしてください。',
      zip_file: '.zip ファイル', admin_key: '管理者キー', replace: '既存の場合は置き換える',
      close: '閉じる', import: 'インポート', login_intro: 'ログインして年間まとめを表示します。',
      login_user: 'ユーザー名', login_password: 'パスワード', login_submit: 'ログイン',
    },
    ui: {
      home: 'ホーム', minutes: '再生時間', artists: 'アーティスト', tracks: '曲', number_one: '第 1 位',
      discoveries: '新しい発見', months: '月', age: '音楽年齢', favorite_hour: 'お気に入りの時間',
      late_night: '深夜の再生', loop: 'リピート', repeat: '連続再生', recap: 'まとめ', finale: '終了',
      enter_username: 'Navidrome のユーザー名を入力し、年を選択してください。',
      greeting: 'こんにちは、{user} さん。', gate_title: '聴いているのは<br>誰？', gate_button: 'Wrapped を見る',
      splash_title: 'あなたの Wrapped', splash_button: '開始', start: '開始',
      import_disabled: 'テーマのインポートは無効です。サーバーで ./deploy.sh を実行して .env に ADMIN_KEY を作成し、ページを再読み込みしてください。',
      uploading: 'アップロード中…', use_now: '今すぐ使う', installed: 'テーマ「{id}」をインストールしました。',
      not_found: 'ユーザーが見つかりません', offline: 'サーバーに接続できません',
      theme_error: 'テーマ「{id}」を読み込めませんでした：{error}',
    },
    login: { failed: 'ログインできませんでした', offline: 'サーバーに接続できません' },
  },
  ko: {
    html: {
      slides: '슬라이드', options: '옵션', home: '처음으로', mute: '음소거', save: '카드 다운로드', volume: '볼륨',
      pause: '스토리 일시 정지', resume: '스토리 다시 시작', story: 'Wrapped 스토리 플레이어',
      slide_position: '{total}개 중 {current}번째 슬라이드: {label}',
      username: 'Navidrome 사용자 이름', username_placeholder: '사용자 이름 입력', year: '연도',
      theme: '테마', change: '사용자 또는 연도 변경', import_theme: '테마 가져오기 (.zip)', logout: '로그아웃',
      change_card: '슬라이드 변경', mute_music: '음소거', save_image: '카드를 이미지로 저장',
      back_start: '처음으로', hold_pause: '길게 눌러 일시 정지',
      save_title: '카드 다운로드', save_question: '어떤 화면에 사용할 이미지인가요?',
      desktop: '컴퓨터', landscape: '가로', mobile: '모바일', portrait: '세로 9:16', space: '스페이스',
      cancel: '취소', loading: '불러오는 중', preparing_image: '이미지 준비 중…',
      import_title: '테마 가져오기', import_help: 'theme.json이 포함된 .zip을 업로드하세요. 테마는 브라우저에서 코드를 실행할 수 있으므로 신뢰할 수 있는 테마만 가져오세요.',
      zip_file: '.zip 파일', admin_key: '관리자 키', replace: '이미 있으면 교체',
      close: '닫기', import: '가져오기', login_intro: '로그인하여 연간 요약을 확인하세요.',
      login_user: '사용자 이름', login_password: '비밀번호', login_submit: '로그인',
    },
    ui: {
      home: '홈', minutes: '재생 시간', artists: '아티스트', tracks: '곡', number_one: '1위',
      discoveries: '새로운 발견', months: '월', age: '음악 나이', favorite_hour: '좋아하는 시간',
      late_night: '심야 재생', loop: '반복 재생', repeat: '연속 반복', recap: '요약', finale: '마무리',
      enter_username: 'Navidrome 사용자 이름을 입력하고 연도를 선택하세요.',
      greeting: '안녕하세요, {user}님.', gate_title: '누가<br>듣고 있나요?', gate_button: '내 Wrapped 보기',
      splash_title: '나의 Wrapped', splash_button: '시작', start: '시작',
      import_disabled: '테마 가져오기가 비활성화되어 있습니다. 서버에서 ./deploy.sh를 실행해 .env에 ADMIN_KEY를 만든 후 페이지를 새로고침하세요.',
      uploading: '업로드 중…', use_now: '지금 사용', installed: '테마 “{id}”을(를) 설치했습니다.',
      not_found: '사용자를 찾을 수 없습니다', offline: '서버에 연결할 수 없습니다',
      theme_error: '테마 “{id}”을(를) 불러오지 못했습니다: {error}',
    },
    login: { failed: '로그인할 수 없습니다', offline: '서버에 연결할 수 없습니다' },
  },
  ar: {
    html: {
      slides: 'الشرائح', options: 'الخيارات', home: 'العودة إلى البداية', mute: 'كتم الصوت', save: 'تنزيل البطاقة', volume: 'مستوى الصوت',
      pause: 'إيقاف القصة مؤقتًا', resume: 'متابعة القصة', story: 'مشغل قصص Wrapped',
      slide_position: 'الشريحة {current} من {total}: {label}',
      username: 'اسم مستخدم Navidrome', username_placeholder: 'أدخل اسم المستخدم', year: 'السنة',
      theme: 'السمة', change: 'تغيير المستخدم أو السنة', import_theme: 'استيراد سمة (.zip)', logout: 'تسجيل الخروج',
      change_card: 'تغيير الشريحة', mute_music: 'كتم الموسيقى', save_image: 'حفظ البطاقة كصورة',
      back_start: 'العودة إلى البداية', hold_pause: 'اضغط مطولًا للإيقاف المؤقت',
      save_title: 'تنزيل البطاقة', save_question: 'لأي شاشة تريد هذه الصورة؟',
      desktop: 'الكمبيوتر', landscape: 'أفقي', mobile: 'الهاتف', portrait: 'عمودي 9:16', space: 'مسافة',
      cancel: 'إلغاء', loading: 'جارٍ التحميل', preparing_image: 'جارٍ تجهيز الصورة…',
      import_title: 'استيراد سمة',
      import_help: 'ارفع ملف .zip يحتوي على theme.json. قد تشغّل السمة تعليمات برمجية في المتصفح؛ استورد السمات من مصادر موثوقة فقط.',
      zip_file: 'ملف .zip', admin_key: 'مفتاح المسؤول', replace: 'استبدال إذا كانت موجودة',
      close: 'إغلاق', import: 'استيراد', login_intro: 'سجّل الدخول للاطلاع على ملخصك.',
      login_user: 'اسم المستخدم', login_password: 'كلمة المرور', login_submit: 'دخول',
    },
    ui: {
      home: 'البداية', minutes: 'الدقائق', artists: 'الفنانون', tracks: 'المقاطع', number_one: 'الأول',
      discoveries: 'اكتشافات', months: 'الأشهر', age: 'عمرك الموسيقي', favorite_hour: 'الساعة المفضلة',
      late_night: 'استماع ليلي', loop: 'تكرار', repeat: 'تكرارات متتالية', recap: 'الملخص', finale: 'النهاية',
      enter_username: 'أدخل اسم مستخدم Navidrome واختر السنة.',
      greeting: 'مرحبًا، {user}.', gate_title: 'من<br>يستمع؟', gate_button: 'اعرض Wrapped الخاص بي',
      splash_title: 'Wrapped الخاص بك', splash_button: 'ابدأ', start: 'ابدأ',
      import_disabled: 'استيراد السمات معطّل. شغّل ./deploy.sh على الخادم لإنشاء ADMIN_KEY في .env، ثم أعد تحميل الصفحة.',
      uploading: 'جارٍ الرفع…', use_now: 'استخدمها الآن', installed: 'تم تثبيت السمة «{id}».',
      not_found: 'لم يتم العثور على المستخدم', offline: 'تعذّر الاتصال بالخادم',
      theme_error: 'تعذّر تحميل السمة «{id}»: {error}',
    },
    login: { failed: 'تعذّر تسجيل الدخول', offline: 'تعذّر الاتصال بالخادم' },
  },
  it: {
    html: {
      slides: 'Diapositive', options: 'Opzioni', home: 'Torna all’inizio', mute: 'Disattiva audio', save: 'Scarica scheda', volume: 'Volume',
      pause: 'Metti in pausa la storia', resume: 'Riprendi la storia', story: 'Riproduttore della storia Wrapped',
      slide_position: 'Diapositiva {current} di {total}: {label}',
      username: 'Il tuo nome utente Navidrome', username_placeholder: 'Inserisci il tuo nome utente', year: 'Anno',
      theme: 'Tema', change: 'Cambia utente o anno', import_theme: 'Importa tema (.zip)', logout: 'Esci',
      change_card: 'cambia diapositiva', mute_music: 'disattiva la musica', save_image: 'salva la scheda come immagine',
      back_start: 'torna all’inizio', hold_pause: 'Tieni premuto per mettere in pausa',
      save_title: 'Scarica scheda', save_question: 'Per quale schermo è questa immagine?',
      desktop: 'Computer', landscape: 'Orizzontale', mobile: 'Cellulare', portrait: 'Verticale 9:16', space: 'Spazio',
      cancel: 'Annulla', loading: 'Caricamento', preparing_image: 'Preparazione immagine…',
      import_title: 'Importa tema',
      import_help: 'Carica un file .zip con theme.json. Un tema può eseguire codice nel browser di chi lo apre: importa solo temi di persone fidate.',
      zip_file: 'File .zip', admin_key: 'Chiave amministratore', replace: 'Sostituisci se esiste già',
      close: 'Chiudi', import: 'Importa', login_intro: 'Accedi per vedere il tuo riepilogo.',
      login_user: 'Nome utente', login_password: 'Password', login_submit: 'Accedi',
    },
    ui: {
      home: 'Inizio', minutes: 'Minuti', artists: 'Artisti', tracks: 'Brani', number_one: 'Il tuo numero 1',
      discoveries: 'Scoperte', months: 'Mesi', age: 'La tua età musicale', favorite_hour: 'Ora preferita',
      late_night: 'A tarda notte', loop: 'In ripetizione', repeat: 'Ascolti consecutivi', recap: 'Riepilogo', finale: 'Finale',
      enter_username: 'Inserisci il tuo nome utente Navidrome e scegli un anno.',
      greeting: 'Ciao, {user}.', gate_title: 'Chi<br>sta ascoltando?', gate_button: 'Guarda il mio Wrapped',
      splash_title: 'Il tuo Wrapped', splash_button: 'Inizia', start: 'Inizia',
      import_disabled: 'L’importazione dei temi è disattivata. Esegui ./deploy.sh sul server per creare ADMIN_KEY in .env, poi ricarica la pagina.',
      uploading: 'Caricamento…', use_now: 'Usa ora', installed: 'Tema “{id}” installato.',
      not_found: 'Utente non trovato', offline: 'Impossibile connettersi al server',
      theme_error: 'Impossibile caricare il tema “{id}”: {error}',
    },
    login: { failed: 'Accesso non riuscito', offline: 'Impossibile connettersi al server' },
  },
  nl: {
    html: {
      slides: 'Dia’s', options: 'Opties', home: 'Terug naar start', mute: 'Dempen', save: 'Kaart downloaden', volume: 'Volume',
      pause: 'Verhaal pauzeren', resume: 'Verhaal hervatten', story: 'Wrapped-verhaalspeler',
      slide_position: 'Dia {current} van {total}: {label}',
      username: 'Je Navidrome-gebruikersnaam', username_placeholder: 'Vul je gebruikersnaam in', year: 'Jaar',
      theme: 'Thema', change: 'Gebruiker of jaar wijzigen', import_theme: 'Thema importeren (.zip)', logout: 'Uitloggen',
      change_card: 'dia’s wijzigen', mute_music: 'muziek dempen', save_image: 'kaart als afbeelding opslaan',
      back_start: 'terug naar start', hold_pause: 'Ingedrukt houden om te pauzeren',
      save_title: 'Kaart downloaden', save_question: 'Voor welk scherm is deze afbeelding?',
      desktop: 'Computer', landscape: 'Liggend', mobile: 'Mobiel', portrait: 'Staand 9:16', space: 'Spatie',
      cancel: 'Annuleren', loading: 'Laden', preparing_image: 'Afbeelding voorbereiden…',
      import_title: 'Thema importeren',
      import_help: 'Upload een .zip met theme.json. Een thema kan code uitvoeren in de browser van iedereen die het opent: importeer alleen thema’s van mensen die je vertrouwt.',
      zip_file: '.zip-bestand', admin_key: 'Beheerderssleutel', replace: 'Vervangen als het al bestaat',
      close: 'Sluiten', import: 'Importeren', login_intro: 'Log in om je overzicht te bekijken.',
      login_user: 'Gebruikersnaam', login_password: 'Wachtwoord', login_submit: 'Inloggen',
    },
    ui: {
      home: 'Start', minutes: 'Minuten', artists: 'Artiesten', tracks: 'Nummers', number_one: 'Jouw nummer 1',
      discoveries: 'Ontdekkingen', months: 'Maanden', age: 'Je muzikale leeftijd', favorite_hour: 'Favoriete uur',
      late_night: 'Laat op de avond', loop: 'Op herhaling', repeat: 'Aaneengesloten herhalingen', recap: 'Overzicht', finale: 'Afsluiting',
      enter_username: 'Vul je Navidrome-gebruikersnaam in en kies een jaar.',
      greeting: 'Hoi, {user}.', gate_title: 'Wie<br>luistert er?', gate_button: 'Bekijk mijn Wrapped',
      splash_title: 'Jouw Wrapped', splash_button: 'Starten', start: 'Starten',
      import_disabled: 'Thema-import is uitgeschakeld. Voer ./deploy.sh uit op de server om ADMIN_KEY in .env aan te maken en laad daarna deze pagina opnieuw.',
      uploading: 'Uploaden…', use_now: 'Nu gebruiken', installed: 'Thema “{id}” geïnstalleerd.',
      not_found: 'Gebruiker niet gevonden', offline: 'Kan geen verbinding maken met de server',
      theme_error: 'Thema “{id}” kan niet worden geladen: {error}',
    },
    login: { failed: 'Inloggen is niet gelukt', offline: 'Kan geen verbinding maken met de server' },
  },
};

const LANGUAGE_STORAGE_KEY = 'wrapped.language';
let activeLanguage = 'en';
const languageLabels = {
  en: 'Interface language', de: 'Anzeigesprache', es: 'Idioma de la interfaz',
  pt: 'Idioma da interface', fr: 'Langue de l’interface', it: 'Lingua dell’interfaccia',
  nl: 'Taal van de interface', ru: 'Язык интерфейса',
  zh: '界面语言', ja: '表示言語', ko: '인터페이스 언어', ar: 'لغة الواجهة',
};

function resolveLanguage(defaultLanguage = 'en') {
  const queryLanguage = new URLSearchParams(location.search).get('lang');
  if (Object.hasOwn(messages, queryLanguage)) return queryLanguage;
  try {
    const savedLanguage = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (Object.hasOwn(messages, savedLanguage)) return savedLanguage;
  } catch { /* The URL and server setting remain available if storage is blocked. */ }
  return Object.hasOwn(messages, defaultLanguage) ? defaultLanguage : 'en';
}

function savePreferredLanguage(language) {
  if (!Object.hasOwn(messages, language)) return false;
  try {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    return true;
  } catch {
    return false;
  }
}

function applyLanguage(language, root = document) {
  language = Object.hasOwn(messages, language) ? language : 'en';
  activeLanguage = language;
  const locale = messages[language];
  root.documentElement?.setAttribute('lang', language);
  if (root.documentElement) root.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
  const languageSelect = root.querySelector('#language');
  if (languageSelect) {
    languageSelect.value = language;
    languageSelect.setAttribute('aria-label', languageLabels[language]);
    languageSelect.title = languageLabels[language];
  }
  root.querySelectorAll('[data-i18n]').forEach((el) => {
    const text = locale.html[el.dataset.i18n];
    if (text !== undefined) el.textContent = text;
  });
  root.querySelectorAll('[data-i18n-html]').forEach((el) => {
    const text = locale.html[el.dataset.i18nHtml];
    if (text !== undefined) el.innerHTML = text;
  });
  for (const attr of ['aria-label', 'title', 'placeholder']) {
    const dataKey = `i18n${attr.split('-').map((part) => part[0].toUpperCase() + part.slice(1)).join('')}`;
    root.querySelectorAll(`[data-i18n-${attr}]`).forEach((el) => {
      const text = locale.html[el.dataset[dataKey]];
      if (text !== undefined) el.setAttribute(attr, text);
    });
  }
  return locale;
}

function apiFetch(input, init = {}) {
  const headers = new Headers(init.headers || {});
  headers.set('X-Wrapped-Language', activeLanguage);
  return fetch(input, { ...init, headers });
}

window.NW_I18N = { applyLanguage, apiFetch, messages, resolveLanguage, savePreferredLanguage };
