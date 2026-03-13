// ============================================================
// Anime Oylama - Kategori ve Aday Verileri
// Bu dosyayı düzenleyerek kategorileri ve adayları değiştirin
// ============================================================

const SITE_CONFIG = {
  title: "Anime Oylama",
  subtitle: "Favori animeni ve karakterini seç!",
  eventName: "HUCON'26 Anime Oylaması",
  eventDate: "2026",
  // Hatira karti ozel arka plan resmi (img/ klasorune koyun)
  cardBackground: "img/card-bg.png",
  // Cloudflare Turnstile Site Key - https://dash.cloudflare.com/ adresinden alin
  // Aktif etmek icin kendi site key'inizi yazin, bos birakinca captcha devre disi kalir
  turnstileSiteKey: "0x4AAAAAACpuof0p4A94Fkmq"
};

const CATEGORIES = [
  {
    id: "en-prestijli-yilin-basliklari-yilin-animesi",
    title: "Yılın Animesi",
    icon: "star",
    candidates: [
      { id: "solo-leveling-a-1-pictures", name: "Solo Leveling (A-1 Pictures)", anime: "Solo Leveling (A-1 Pictures)", image: null },
      { id: "the-apothecary-diaries-sezon-2-olm-project-no-9", name: "The Apothecary Diaries Sezon 2 (OLM/Project No.9)", anime: "The Apothecary Diaries Sezon 2 (OLM/Project No.9)", image: null },
      { id: "kaiju-no-8-production-i-g", name: "Kaiju No. 8 (Production I.G)", anime: "Kaiju No. 8 (Production I.G)", image: null },
      { id: "gachiakuta", name: "Gachiakuta", anime: "Gachiakuta", image: null },
      { id: "lord-of-mysteries", name: "Lord of Mysteries", anime: "Lord of Mysteries", image: null },
      { id: "to-be-hero-x", name: "To Be Hero X", anime: "To Be Hero X", image: null },
      { id: "the-summer-hikaru-died", name: "The Summer Hikaru Died", anime: "The Summer Hikaru Died", image: null },
      { id: "dandadan-sezon-2", name: "Dandadan Sezon 2", anime: "Dandadan Sezon 2", image: null },
      { id: "orb-on-the-movements-of-the-earth", name: "Orb: On the Movements of the Earth", anime: "Orb: On the Movements of the Earth", image: null },
      { id: "the-fragrant-flower-blooms-with-dignity", name: "The Fragrant Flower Blooms with Dignity", anime: "The Fragrant Flower Blooms with Dignity", image: null },
      { id: "sakamoto-days", name: "SAKAMOTO DAYS", anime: "SAKAMOTO DAYS", image: null },
      { id: "takopii-no-genzai", name: "Takopii no Genzai", anime: "Takopii no Genzai", image: null },
      { id: "boku-no-hero-academia-final-season", name: "Boku no Hero Academia FINAL SEASON", anime: "Boku no Hero Academia FINAL SEASON", image: null },
      { id: "dr-stone-science-future-part-2", name: "Dr. STONE: SCIENCE FUTURE Part 2", anime: "Dr. STONE: SCIENCE FUTURE Part 2", image: null },
      { id: "zenshuu", name: "Zenshuu.", anime: "Zenshuu.", image: null },
      { id: "Enen no Shouboutai: San no Shou", name: "Enen no Shouboutai: San no Shou", anime: "Enen no Shouboutai: San no Shou", image: null },
      { id: "my-dress-up-darling-sezon-2", name: "My Dress-Up Darling Sezon 2", anime: "My Dress-Up Darling Sezon 2", image: null },
      { id: "call-of-the-night-season-2", name: "Call of the Night Season 2", anime: "Call of the Night Season 2", image: null },
      { id: "spy-family-season-3", name: "SPY×FAMILY Season 3", anime: "SPY×FAMILY Season 3", image: null },
      { id: "lazarus", name: "Lazarus", anime: "Lazarus", image: "img/md3fx6mbxv3f1.jpeg" }
    ]
  },
  {
    id: "en-prestijli-yilin-basliklari-yilin-anime-filmi",
    title: "Yılın Anime Filmi",
    icon: "star",
    candidates: [
      { id: "look-back-tatsuki-fujimoto", name: "Look Back (Tatsuki Fujimoto)", anime: "Look Back (Tatsuki Fujimoto)", image: null },
      { id: "chainsaw-man-the-movie-reze-arc", name: "Chainsaw Man – The Movie: Reze Arc", anime: "Chainsaw Man – The Movie: Reze Arc", image: null },
      { id: "haikyuu-the-movie-decisive-battle-at-the-garbage-dump", name: "Haikyuu!! The Movie: Decisive Battle at the Garbage Dump", anime: "Haikyuu!! The Movie: Decisive Battle at the Garbage Dump", image: null },
      { id: "demon-slayer-infinity-castle-movie", name: "Kimetsu no Yaiba: Mugenjou-hen Movie 1 - Akaza Sairai Movie 1 - Akaza Sairai", anime: "Kimetsu no Yaiba: Mugenjou-hen Movie 1 - Akaza Sairai", image: null },
      { id: "kimi-no-iro-the-colors-within", name: "Kimi no Iro (The Colors Within)", anime: "Kimi no Iro (The Colors Within)", image: null },
      { id: "overlord-the-sacred-kingdom", name: "Overlord: The Sacred Kingdom", anime: "Overlord: The Sacred Kingdom", image: null },
      { id: "hyakuemu-100-meters", name: "Hyakuemu. (100 Meters)", anime: "Hyakuemu. (100 Meters)", image: null },
      { id: "project-sekai-kowareta-sekai-to-utaenai-miku", name: "Project Sekai: Kowareta SEKAI to Utaenai MIKU", anime: "Project Sekai: Kowareta SEKAI to Utaenai MIKU", image: null },
      { id: "baan-otona-no-kyoukai", name: "bâan: Otona no Kyoukai", anime: "bâan: Otona no Kyoukai", image: null }
    ]
  },
  {
    id: "en-prestijli-yilin-basliklari-en-iyi-yeni-seri",
    title: "En İyi Yeni Seri",
    icon: "star",
    candidates: [
      { id: "gachiakuta-bones", name: "Gachiakuta", anime: "Gachiakuta", image: null },
      { id: "the-fragrant-flower-blooms-with-dignity", name: "The Fragrant Flower Blooms with Dignity", anime: "The Fragrant Flower Blooms with Dignity", image: null },
      { id: "the-summer-hikaru-died", name: "The Summer Hikaru Died", anime: "The Summer Hikaru Died", image: null },
      { id: "takopii-no-genzai", name: "Takopii no Genzai", anime: "Takopii no Genzai", image: null },
      { id: "to-be-hero-x", name: "To Be Hero X", anime: "To Be Hero X", image: null },
      { id: "lazarus", name: "Lazarus", anime: "Lazarus", image: "img/md3fx6mbxv3f1.jpeg" },
      { id: "lord-of-mysteries", name: "Lord of Mysteries", anime: "Lord of Mysteries", image: null },
      { id: "witch-watch", name: "Witch Watch", anime: "Witch Watch", image: null },
      { id: "clevatess-majuu-no-ou-to-akago-to-kabane-no-yuusha", name: "Clevatess: Majuu no Ou to Akago to Kabane no Yuusha", anime: "Clevatess: Majuu no Ou to Akago to Kabane no Yuusha", image: null },
      { id: "zenshuu", name: "Zenshuu.", anime: "Zenshuu.", image: null },
      { id: "vigilante-boku-no-hero-academia-illegals", name: "Vigilante: Boku no Hero Academia ILLEGALS", anime: "Vigilante: Boku no Hero Academia ILLEGALS", image: null },
      { id: "kowloon-generic-romance", name: "Kowloon Generic Romance", anime: "Kowloon Generic Romance", image: null },
      { id: "fujimoto-tatsuki-17-26", name: "Fujimoto Tatsuki 17-26", anime: "Fujimoto Tatsuki 17-26", image: null },
      { id: "medalist", name: "Medalist", anime: "Medalist", image: null },
      { id: "silent-witch-chinmoku-no-majo-no-kakushigoto", name: "Silent Witch: Chinmoku no Majo no Kakushigoto", anime: "Silent Witch: Chinmoku no Majo no Kakushigoto", image: null }
    ]
  },
  {
    id: "en-prestijli-yilin-basliklari-en-iyi-devam-eden-seri",
    title: "En İyi Devam Eden Seri",
    icon: "star",
    candidates: [
      { id: "one-piece-egghead-arc", name: "One Piece (Egghead Arc)", anime: "One Piece (Egghead Arc)", image: null },
      { id: "my-hero-academia-final-season", name: "My Hero Academia: Final Season", anime: "My Hero Academia: Final Season", image: null },
      { id: "re-zero-season-3", name: "Re:Zero Season 3", anime: "Re:Zero Season 3", image: null },
      { id: "spy-x-family-season-3", name: "Spy x Family Season 3", anime: "Spy x Family Season 3", image: null },
      { id: "to-your-eternity-season-3", name: "To Your Eternity Season 3", anime: "To Your Eternity Season 3", image: null },
      { id: "uma-musume-cinderella-gray", name: "Uma Musume: Cinderella Gray", anime: "Uma Musume: Cinderella Gray", image: null },
      { id: "kingdom-sezon-6", name: "Kingdom Sezon 6", anime: "Kingdom Sezon 6", image: null },
      { id: "the-rising-of-the-shield-hero-sezon-4", name: "The Rising of the Shield Hero Sezon 4", anime: "The Rising of the Shield Hero Sezon 4", image: null },
      { id: "isekai-quartet-3", name: "Isekai Quartet 3", anime: "Isekai Quartet 3", image: null },
      { id: "rascal-does-not-dream-of-bunny-girl-senpai", name: "Seishun Buta Yarou wa Santa Claus no Yume wo Minai", anime: "Seishun Buta Yarou wa Santa Claus no Yume wo Minai", image: null }
    ]
  },
  {
    id: "en-prestijli-yilin-basliklari-yilin-en-iyi-mangasi",
    title: "Yılın En İyi Mangası",
    icon: "star",
    candidates: [
      { id: "jujutsu-kaisen-modulo", name: "Jujutsu Kaisen Modulo", anime: "Jujutsu Kaisen Modulo", image: null },
      { id: "chainsaw-man", name: "Chainsaw Man", anime: "Chainsaw Man", image: null },
      { id: "one-piece", name: "One Piece", anime: "One Piece", image: null },
      { id: "steel-ball-run-jojos-bizarre-adventure-part-7", name: "Steel Ball Run (JoJo's Bizarre Adventure Part 7)", anime: "Steel Ball Run (JoJo's Bizarre Adventure Part 7)", image: null },
      { id: "the-apothecary-diaries", name: "The Apothecary Diaries 薬屋のひとりごと", anime: "The Apothecary Diaries 薬屋のひとりごと", image: null },
      { id: "dandadan", name: "DanDaDan", anime: "DanDaDan", image: null },
      { id: "gokurakugai", name: "Gokurakugai", anime: "Gokurakugai", image: null },
      { id: "futari-switch", name: "Futari Switch", anime: "Futari Switch", image: null },
      { id: "spy-x-family", name: "Spy X Family", anime: "Spy X Family", image: null },
      { id: "kaiju-no-8", name: "Kaiju No. 8", anime: "Kaiju No. 8", image: null },
      { id: "black-clover", name: "Black Clover", anime: "Black Clover", image: null }
    ]
  },
  {
    id: "en-prestijli-yilin-basliklari-en-iyi-orijinal-anime",
    title: "En İyi Orijinal Anime",
    icon: "star",
    candidates: [
      { id: "bucchigiri", name: "BUCCHIGIRI?!", anime: "BUCCHIGIRI?!", image: null },
      { id: "girls-band-cry", name: "GIRLS BAND CRY", anime: "GIRLS BAND CRY", image: null },
      { id: "jellyfish-cant-swim-in-the-night", name: "Jellyfish Can’t Swim in the Night", anime: "Jellyfish Can’t Swim in the Night", image: null },
      { id: "metallic-rouge", name: "Metallic Rouge", anime: "Metallic Rouge", image: null },
      { id: "ninja-kamui", name: "Ninja Kamui", anime: "Ninja Kamui", image: null },
      { id: "lazarus", name: "Lazarus", anime: "Lazarus", image: "img/md3fx6mbxv3f1.jpeg" },
      { id: "clevatess-majuu-no-ou-to-akago-to-kabane-no-yuusha", name: "Clevatess: Majuu no Ou to Akago to Kabane no Yuusha", anime: "Clevatess: Majuu no Ou to Akago to Kabane no Yuusha", image: null },
      { id: "zenshuu", name: "Zenshuu.", anime: "Zenshuu.", image: null }
    ]
  },

  /* Karakter Odaklı Başlıklar */
  {
    id: "karakter-odakli-en-iyi-ana-karakter",
    title: "En İyi Ana Karakter",
    icon: "star",
    candidates: [
      { id: "sung-jinwoo-solo-leveling", name: "Sung Jinwoo (Solo Leveling)", anime: "Solo Leveling", image: null },
      { id: "maomao-the-apothecary-diaries", name: "Maomao (The Apothecary Diaries)", anime: "The Apothecary Diaries", image: null },
      { id: "kafka-hibino-kaiju-no-8", name: "Kafka Hibino (Kaiju No. 8)", anime: "Kaiju No. 8", image: null },
      { id: "sakamoto-sakamoto-days", name: "Sakamoto (Sakamoto Days)", anime: "Sakamoto Days", image: null },
      { id: "ken-takakura-dandadan", name: "Ken Takakura (Dandadan)", anime: "Dandadan", image: null },
      { id: "rudo-gachiakuta", name: "Rudo (Gachiakuta)", anime: "Gachiakuta", image: null },
      { id: "marin-kitagawa-my-dress-up-darling", name: "Marin Kitagawa (My Dress-Up Darling)", anime: "My Dress-Up Darling", image: null },
      { id: "shinra-kusakabe-fire-force", name: "Shinra Kusakabe (Fire Force)", anime: "Fire Force", image: null },
      { id: "izuku-midoriya-my-hero-academia", name: "Izuku Midoriya (My Hero Academia)", anime: "My Hero Academia", image: null },
      { id: "x-to-be-hero-x", name: "X (To Be Hero X)", anime: "To Be Hero X", image: null },
      { id: "senkuu-ishigami-dr-stone-science-future", name: "Senkuu Ishigami (Dr. STONE: SCIENCE FUTURE)", anime: "Dr. STONE: SCIENCE FUTURE", image: null },
      { id: "klein-moretti-lord-of-mysteries", name: "Klein Moretti (Lord of Mysteries)", anime: "Lord of Mysteries", image: null }
    ]
  },
  {
    id: "karakter-odakli-en-iyi-yardimci-karakter",
    title: "En İyi Yardımcı Karakter",
    icon: "star",
    candidates: [
      { id: "jinshi-the-apothecary-diaries", name: "Jinshi (The Apothecary Diaries)", anime: "The Apothecary Diaries", image: null },
      { id: "seiko-dandadan", name: "Seiko (Dandadan)", anime: "Dandadan", image: null },
      { id: "turbo-granny-dandadan", name: "Turbo Granny (Dandadan)", anime: "Dandadan", image: null },
      { id: "enjin-gachiakuta", name: "Enjin (Gachiakuta)", anime: "Gachiakuta", image: null },
      { id: "jin-ho-yu-solo-leveling", name: "Jin-Ho Yu (Solo Leveling)", anime: "Solo Leveling", image: null },
      { id: "shin-asakura-sakamoto-days", name: "Shin Asakura (Sakamoto Days)", anime: "Sakamoto Days", image: null },
      { id: "soushirou-hoshina-kaiju-no-8", name: "Soushirou Hoshina (Kaiju No. 8)", anime: "Kaiju No. 8", image: null },
      { id: "mina-ashiro-kaiju-no-8", name: "Mina Ashiro (Kaiju No. 8)", anime: "Kaiju No. 8", image: null },
      { id: "shizuka-kuze-takopii-no-genzai", name: "Shizuka Kuze (Takopii no Genzai)", anime: "Takopii no Genzai", image: null },
      { id: "arthur-boyle-fire-force", name: "Arthur Boyle (Fire Force)", anime: "Fire Force", image: null },
      { id: "katsuki-bakugou-my-hero-academia", name: "Katsuki Bakugou (My Hero Academia)", anime: "My Hero Academia", image: null },
      { id: "anko-uguisu-call-of-the-night", name: "Anko Uguisu (Call of the Night)", anime: "Call of the Night", image: null }
    ]
  },
  {
    id: "karakter-odakli-en-iyi-antagonist",
    title: "En İyi Antagonist",
    icon: "star",
    candidates: [
      { id: "kei-uzuki-sakamoto-days", name: "Kei Uzuki (Sakamoto Days)", anime: "Sakamoto Days", image: null },
      { id: "reze-chainsaw-man-reze-arc", name: "Reze (Chainsaw Man – The Movie: Reze Arc)", anime: "Chainsaw Man – The Movie: Reze Arc", image: null },
      { id: "jabber-wonger-gachiakuta", name: "Jabber Wonger (Gachiakuta)", anime: "Gachiakuta", image: null },
      { id: "dr-deniz-skinner-lazarus", name: "Dr. Deniz Skinner (Lazarus)", anime: "Lazarus", image: null },
      { id: "kibutsuji-muzan-kimetsu-no-yaiba-mugen-rassha-hen", name: "Kibutsuji Muzan (Kimetsu no Yaiba: Mugen Rassha-hen)", anime: "Kimetsu no Yaiba: Mugen Rassha-hen", image: null },
      { id: "all-for-one-my-hero-academia-final-season", name: "All For One (My Hero Academia FINAL SEASON)", anime: "My Hero Academia FINAL SEASON", image: null },
      { id: "white-rabbit-fushigi-no-kuni-de-alice-to-dive-in-wonderland", name: "White Rabbit (Fushigi no Kuni de Alice to: Dive in Wonderland)", anime: "Fushigi no Kuni de Alice to: Dive in Wonderland", image: null },
      { id: "kaiju-no-9-kaijuu-8-gou-2nd-season", name: "Kaiju No.9 (Kaijuu 8-gou 2nd Season)", anime: "Kaijuu 8-gou 2nd Season", image: null },
      { id: "xeno-dr-stone-science-future", name: "Xeno (Dr. STONE: SCIENCE FUTURE)", anime: "Dr. STONE: SCIENCE FUTURE", image: null },
      { id: "ant-king-houston-wingfield-solo-leveling-2-sezon", name: "Ant King (Houston Wingfield Solo Leveling 2. Sezon)", anime: "Solo Leveling 2. Sezon", image: null }
    ]
  },
  {
    id: "karakter-odakli-yilin-cifti",
    title: "Yılın Çifti",
    icon: "star",
    candidates: [
      { id: "denji-reze-chainsaw-man-reze-arc", name: "Denji x Reze (Chainsaw Man: Reze Arc)", anime: "Chainsaw Man: Reze Arc", image: null },
      { id: "ken-takakura-momo-ayase-dandadan", name: "Ken Takakura x Momo Ayase (Dandadan)", anime: "Dandadan", image: null },
      { id: "maomao-jinshi-the-apothecary-diaries", name: "Maomao x Jinshi (The Apothecary Diaries)", anime: "The Apothecary Diaries", image: null },
      { id: "kaoruko-waguri-rintarou-tsumugi-fragrant-flower", name: "Kaoruko Waguri x Rintarou Tsumugi (The Fragrant Flower Blooms with Dignity)", anime: "The Fragrant Flower Blooms with Dignity", image: null },
      { id: "marin-kitagawa-wakana-gojou-my-dress-up-darling", name: "Marin Kitagawa x Wakana Gojou (My Dress-Up Darling)", anime: "My Dress-Up Darling", image: null },
      { id: "nico-wakatsuki-morihito-otogi-witch-watch", name: "Nico Wakatsuki x Morihito Otogi (Witch Watch)", anime: "Witch Watch", image: null },
      { id: "nazuna-nanakusa-kou-yamori-call-of-the-night", name: "Nazuna Nanakusa x Kou Yamori (Call of the Night)", anime: "Call of the Night", image: null },
      { id: "sakuta-azusagawa-mai-sakurajima-rascal-does-not-dream-of-santa-claus", name: "Sakuta Azusagawa x Mai Sakurajima (Rascal Does Not Dream of Santa Claus)", anime: "Rascal Does Not Dream of Santa Claus", image: null },
      { id: "reiko-kujirai-hajime-kudou-kowloon-generic-romance", name: "Reiko Kujirai x Hajime Kudou (Kowloon Generic Romance)", anime: "Kowloon Generic Romance", image: null },
      { id: "yoshiki-tsujinaka-hikaru-indou-the-summer-hikaru-died", name: "Yoshiki Tsujinaka x Hikaru Indou (The Summer Hikaru Died)", anime: "The Summer Hikaru Died", image: null },
      { id: "yor-forger-loid-forger-spy-family", name: "Yor Forger x Loid Forger (SPY×FAMILY)", anime: "SPY×FAMILY", image: null },
      { id: "kiyoka-kudou-miyo-saimori-my-happy-marriage", name: "Kiyoka Kudou x Miyo Saimori (My Happy Marriage)", anime: "My Happy Marriage", image: null }
    ]
  },
  {
    id: "karakter-odakli-en-iyi-karakter-dizayni",
    title: "En İyi Karakter Dizaynı",
    icon: "star",
    candidates: [
      { id: "dandadan", name: "Dandadan", anime: "Dandadan", image: null },
      { id: "demon-slayer-kimetsu-no-yaiba-infinity-castle", name: "Demon Slayer: Kimetsu no Yaiba Infinity Castle", anime: "Demon Slayer: Kimetsu no Yaiba Infinity Castle", image: null },
      { id: "kaiju-no-8", name: "Kaiju No. 8", anime: "Kaiju No. 8", image: null },
      { id: "the-apothecary-diaries", name: "The Apothecary Diaries", anime: "The Apothecary Diaries", image: null },
      { id: "gachiakuta", name: "Gachiakuta", anime: "Gachiakuta", image: null },
      { id: "lazarus", name: "Lazarus", anime: "Lazarus", image: "img/md3fx6mbxv3f1.jpeg" },
      { id: "dr-stone", name: "Dr. STONE", anime: "Dr. STONE", image: null },
      { id: "spy-x-family", name: "Spy x Family", anime: "Spy x Family", image: null },
      { id: "fire-force", name: "Fire Force", anime: "Fire Force", image: null },
      { id: "solo-leveling-sezon-2", name: "Solo Leveling Sezon 2", anime: "Solo Leveling Sezon 2", image: null }
    ]
  },

  /* Görsel ve İşitsel Başlıklar */
  {
    id: "gorsel-isitsel-en-iyi-animasyon",
    title: "En İyi Animasyon",
    icon: "star",
    candidates: [
      { id: "demon-slayer-series-ufotable", name: "Demon Slayer (Ufotable)", anime: "Demon Slayer", image: null },
      { id: "fate-strange-fake-a-1-pictures", name: "Fate/strange Fake (A-1 Pictures)", anime: "Fate/strange Fake", image: null },
      { id: "dandadan-science-saru", name: "Dandadan (Science Saru)", anime: "Dandadan", image: null },
      { id: "solo-leveling-a-1-pictures", name: "Solo Leveling (A-1 Pictures)", anime: "Solo Leveling", image: null },
      { id: "to-be-hero-x-pb-animation", name: "To Be Hero X (PB Animation)", anime: "To Be Hero X", image: null },
      { id: "lord-of-mysteries-bcmay-pictures", name: "Lord of Mysteries (B.CMAY PICTURES)", anime: "Lord of Mysteries", image: null },
      { id: "lazarus-mappa", name: "Lazarus (MAPPA)", anime: "Lazarus", image: "img/md3fx6mbxv3f1.jpeg" },
      { id: "gachiakuta-bones-film", name: "Gachiakuta (Bones Film)", anime: "Gachiakuta", image: null }
    ]
  },
  {
    id: "gorsel-isitsel-en-iyi-acilis-op",
    title: "En İyi Açılış Sekansı (OP)",
    icon: "star",
    candidates: [
      { id: "kaiju-no-8-aurora", name: "Kaiju No. 8 — \"AURORA / You Can't Run From Yourself\"", anime: "Kaiju No. 8", image: null },
      { id: "solo-leveling-reawaker", name: "Solo Leveling — \"ReawakeR\" by LiSA feat. Felix", anime: "Solo Leveling", image: null },
      { id: "dandadan-on-the-way", name: "Dandadan — \"On The Way\" by AiNA THE END", anime: "Dandadan", image: null },
      { id: "gachiakuta-hugs", name: "Gachiakuta — \"HUGs\" by Paledusk", anime: "Gachiakuta", image: null },
      { id: "chainsaw-man-reze-hen-iris-out", name: "Chainsaw Man: Reze-hen — \"IRIS OUT\" by Kenshi Yonezu", anime: "Chainsaw Man: Reze-hen", image: null },
      { id: "the-apothecary-diaries-hyakka-ryouran", name: "The Apothecary Diaries — \"Hyakka Ryouran\" by Lilas Ikuta", anime: "The Apothecary Diaries", image: null },
      { id: "to-be-hero-x-inertia", name: "To Be Hero X — \"INERTIA\" by SawanoHiroyuki[nZk]:Rei", anime: "To Be Hero X", image: null },
      { id: "my-hero-academia-the-revo", name: "My Hero Academia: Final Season — \"THE REVO\" by PORNO GRAFFITTI", anime: "My Hero Academia: Final Season", image: null },
      { id: "call-of-the-night-mirage", name: "Call of the Night Season 2 — \"Mirage\" by Creepy Nuts", anime: "Call of the Night Season 2", image: null },
      { id: "witch-watch-watch-me", name: "Witch Watch — \"Watch me!\" by YOASOBI", anime: "Witch Watch", image: null }
    ]
  },
  {
    id: "gorsel-isitsel-en-iyi-ending",
    title: "En İyi Ending",
    icon: "star",
    candidates: [
      { id: "my-hero-academia-final-season-i", name: "My Hero Academia FINAL SEASON — “I” by BUMP OF CHICKEN", anime: "My Hero Academia FINAL SEASON", image: null },
      { id: "the-summer-hikaru-died-you-are-my-monster", name: "The Summer Hikaru Died — “you are my monster” by TOOBOE", anime: "The Summer Hikaru Died", image: null },
      { id: "the-apothecary-diaries-hitorigoto", name: "The Apothecary Diaries Season 2 — “Hitorigoto” by Omoinotake", anime: "The Apothecary Diaries Season 2", image: null },
      { id: "to-be-hero-x-kontinuum", name: "To Be Hero X — “KONTINUUM” by SennaRin", anime: "To Be Hero X", image: null },
      { id: "dandadan-season-2-doukashiteru", name: "Dandadan Season 2 — “Doukashiteru” by WurtS", anime: "Dandadan Season 2", image: null },
      { id: "bang-dream-ave-mujica-georgette", name: "BanG Dream! Ave Mujica — “Georgette Me, Georgette You” by Ave Mujica", anime: "BanG Dream! Ave Mujica", image: null },
      { id: "my-dress-up-darling-kawaii-kaiwai", name: "My Dress-Up Darling Season 2 — “Kawaii Kaiwai” by PiKi", anime: "My Dress-Up Darling Season 2", image: null },
      { id: "the-apothecary-diaries-shiawase-no-recipe", name: "The Apothecary Diaries Season 2 — “Shiawase no Recipe” by Dai Hirai", anime: "The Apothecary Diaries Season 2", image: null },
      { id: "spy-x-family-actor", name: "Spy x Family Season 3 — “Actor” by Lilas Ikuta", anime: "Spy x Family Season 3", image: null },
      { id: "uma-musume-cinderella-gray-futari", name: "Uma Musume: Cinderella Gray — “Futari” by Tamamo Cross", anime: "Uma Musume: Cinderella Gray", image: null }
    ]
  },
  {
    id: "gorsel-isitsel-en-iyi-dunya-tasarimi",
    title: "En İyi Dünya Tasarımı",
    icon: "star",
    candidates: [
      { id: "gachiakuta", name: "Gachiakuta", anime: "Gachiakuta", image: null },
      { id: "kowloon-generic-romance", name: "Kowloon Generic Romance", anime: "Kowloon Generic Romance", image: null },
      { id: "apocalypse-h", name: "Apocalypse H", anime: "Apocalypse H", image: null },
      { id: "zenshu-ot", name: "Zenshuu.", anime: "Zenshuu.", image: null },
      { id: "mobile-suit-gundam-gquuuuuu-x", name: "Mobile Suit Gundam GQuuuuuuX", anime: "Mobile Suit Gundam GQuuuuuuX", image: null },
      { id: "moonrise", name: "Moonrise", anime: "Moonrise", image: null },
      { id: "lazarus", name: "Lazarus", anime: "Lazarus", image: "img/md3fx6mbxv3f1.jpeg" },
      { id: "the-apothecary-diaries-season-2", name: "The Apothecary Diaries Season 2", anime: "The Apothecary Diaries Season 2", image: null },
      { id: "dr-stone-science-future", name: "Dr. Stone: Science Future", anime: "Dr. Stone: Science Future", image: null },
      { id: "my-happy-marriage-season-2", name: "My Happy Marriage Season 2", anime: "My Happy Marriage Season 2", image: null }
    ]
  },

  /* Tür Bazlı */
  {
    id: "tur-bazli-en-iyi-aksiyon",
    title: "En İyi Aksiyon",
    icon: "star",
    candidates: [
      { id: "fire-force-season-3", name: "Fire Force Season 3", anime: "Fire Force Season 3", image: null },
      { id: "dandadan-sezon-2", name: "Dandadan Sezon 2", anime: "Dandadan Sezon 2", image: null },
      { id: "demon-slayer-kimetsu-no-yaiba-hashira-training-arc", name: "Demon Slayer: Kimetsu no Yaiba Hashira Training Arc", anime: "Demon Slayer: Kimetsu no Yaiba Hashira Training Arc", image: null },
      { id: "kaiju-no-8", name: "Kaiju No. 8", anime: "Kaiju No. 8", image: null },
      { id: "solo-leveling-sezon-2", name: "Solo Leveling Sezon 2", anime: "Solo Leveling Sezon 2", image: null },
      { id: "wind-breaker", name: "WIND BREAKER", anime: "WIND BREAKER", image: null },
      { id: "chainsaw-man-reze-hen", name: "Chainsaw Man: Reze-hen", anime: "Chainsaw Man: Reze-hen", image: null },
      { id: "sakamoto-days", name: "SAKAMOTO DAYS", anime: "SAKAMOTO DAYS", image: null },
      { id: "gachiakuta", name: "Gachiakuta", anime: "Gachiakuta", image: null }
    ]
  },
  {
    id: "tur-bazli-en-iyi-romantik",
    title: "En İyi Romantik",
    icon: "star",
    candidates: [
      { id: "honey-lemon-soda", name: "Honey Lemon Soda", anime: "Honey Lemon Soda", image: null },
      { id: "kowloon-generic-romance", name: "Kowloon Generic Romance", anime: "Kowloon Generic Romance", image: null },
      { id: "im-getting-married-to-a-girl-i-hate-in-my-class", name: "I'm Getting Married to a Girl I Hate in My Class", anime: "I'm Getting Married to a Girl I Hate in My Class", image: null },
      { id: "the-100-girlfriends-who-really-love-you-season-2", name: "The 100 Girlfriends Who Really, Really, Really, Really, Really Love You Season 2", anime: "The 100 Girlfriends Who Really, Really, Really, Really, Really Love You Season 2", image: null },
      { id: "rascal-does-not-dream-of-santa-claus", name: "Rascal Does Not Dream of Santa Claus", anime: "Rascal Does Not Dream of Santa Claus", image: null },
      { id: "witch-watch", name: "Witch Watch", anime: "Witch Watch", image: null },
      { id: "my-dress-up-darling-season-2", name: "My Dress-Up Darling Season 2", anime: "My Dress-Up Darling Season 2", image: null },
      { id: "the-fragrant-flower-blooms-with-dignity", name: "The Fragrant Flower Blooms with Dignity", anime: "The Fragrant Flower Blooms with Dignity", image: null }
    ]
  },
  {
    id: "tur-bazli-en-iyi-komedi",
    title: "En İyi Komedi",
    icon: "star",
    candidates: [
      { id: "witch-watch", name: "Witch Watch", anime: "Witch Watch", image: null },
      { id: "grand-blue-season-2", name: "Grand Blue Season 2", anime: "Grand Blue Season 2", image: null },
      { id: "city-the-animation", name: "City The Animation", anime: "City The Animation", image: null },
      { id: "osomatsu-san-4th-season", name: "Osomatsu-san 4th Season", anime: "Osomatsu-san 4th Season", image: null },
      { id: "everyday-host", name: "Everyday Host", anime: "Everyday Host", image: null }
    ]
  },
  {
    id: "tur-bazli-en-iyi-slice-of-life",
    title: "En İyi Slice of Life",
    icon: "star",
    candidates: [
      { id: "catch-me-at-the-ballpark", name: "Catch Me at the Ballpark!", anime: "Catch Me at the Ballpark!", image: null },
      { id: "welcome-to-the-outcasts-restaurant", name: "Welcome to the Outcast's Restaurant!", anime: "Welcome to the Outcast's Restaurant!", image: null },
      { id: "yano-kuns-ordinary-days", name: "Yano-kun's Ordinary Days", anime: "Yano-kun's Ordinary Days", image: null },
      { id: "apocalypse-hotel", name: "Apocalypse Hotel", anime: "Apocalypse Hotel", image: null },
      { id: "ruri-rocks", name: "Ruri Rocks", anime: "Ruri Rocks", image: null },
      { id: "city-the-animation", name: "CITY THE ANIMATION", anime: "CITY THE ANIMATION", image: null },
      { id: "ive-been-killing-slimes-300-years-season-2", name: "I've Been Killing Slimes for 300 Years and Maxed Out My Level Season 2", anime: "I've Been Killing Slimes for 300 Years and Maxed Out My Level Season 2", image: null },
      { id: "witch-watch", name: "Witch Watch", anime: "Witch Watch", image: null }
    ]
  },
  {
    id: "tur-bazli-en-iyi-drama",
    title: "En İyi Drama",
    icon: "star",
    candidates: [
      { id: "this-monster-wants-to-eat-me", name: "This Monster Wants to Eat Me", anime: "This Monster Wants to Eat Me", image: null },
      { id: "medalist", name: "Medalist", anime: "Medalist", image: null },
      { id: "uma-musume-cinderella-gray", name: "Uma Musume: Cinderella Gray", anime: "Uma Musume: Cinderella Gray", image: null },
      { id: "wind-breaker-season-2", name: "WIND BREAKER Season 2", anime: "WIND BREAKER Season 2", image: null },
      { id: "lord-of-mysteries", name: "Lord of Mysteries", anime: "Lord of Mysteries", image: null },
      { id: "kimetsu-no-yaiba-mugenjou-hen-movie-1-akaza-sairai", name: "Kimetsu no Yaiba: Mugenjou-hen Movie 1 - Akaza Sairai Movie 1", anime: "Kimetsu no Yaiba: Mugenjou-hen Movie 1 - Akaza Sairai", image: null },
      { id: "kaoru-hana-wa-rin-to-saku", name: "Kaoru Hana wa Rin to Saku", anime: "Kaoru Hana wa Rin to Saku", image: null },
      { id: "kusuriya-no-hitorigoto-2nd-season", name: "Kusuriya no Hitorigoto 2nd Season", anime: "Kusuriya no Hitorigoto 2nd Season", image: null }
    ]
  },
  {
    id: "tur-bazli-best-isekai-anime",
    title: "Best Isekai Anime",
    icon: "star",
    candidates: [
      { id: "welcome-to-japan-ms-elf", name: "Welcome to Japan, Ms. Elf!", anime: "Welcome to Japan, Ms. Elf!", image: null },
      { id: "from-bureaucrat-to-villainess-dads-been-reincarnated", name: "From Bureaucrat to Villainess: Dad's Been Reincarnated!", anime: "From Bureaucrat to Villainess: Dad's Been Reincarnated!", image: null },
      { id: "may-i-ask-for-one-final-thing", name: "May I Ask for One Final Thing?", anime: "May I Ask for One Final Thing?", image: null },
      { id: "tate-no-yuusha-no-nariagari-season-4", name: "Tate no Yuusha no Nariagari Season 4", anime: "Tate no Yuusha no Nariagari Season 4", image: null },
      { id: "zenshuu", name: "Zenshuu.", anime: "Zenshuu.", image: null },
      { id: "my-status-as-an-assassin-obviously-exceeds-the-heros", name: "My Status as an Assassin Obviously Exceeds the Hero's", anime: "My Status as an Assassin Obviously Exceeds the Hero's", image: null },
      { id: "the-water-magician", name: "The Water Magician", anime: "The Water Magician", image: null },
      { id: "i-was-reincarnated-as-the-7th-prince-season-2", name: "I Was Reincarnated as the 7th Prince so I Can Take My Time Perfecting My Magical Ability Season 2", anime: "I Was Reincarnated as the 7th Prince so I Can Take My Time Perfecting My Magical Ability Season 2", image: null }
    ]
  },
  {
    id: "tur-bazli-must-protect-at-all-costs",
    title: "\"Must Protect At All Costs\" (isim TBD)",
    icon: "star",
    candidates: [
      { id: "anya-forger-spy-family-season-2", name: "Anya Forger (SPY×FAMILY Season 2)", anime: "SPY×FAMILY Season 2", image: null },
      { id: "okarun-dandadan", name: "Okarun (Dandadan)", anime: "Dandadan", image: null },
      { id: "anya-forger-spy-family", name: "Anya Forger (SPY×FAMILY)", anime: "SPY×FAMILY", image: null },
      { id: "angel-chainsaw-man", name: "Angel (Chainsaw Man)", anime: "Chainsaw Man", image: null },
      { id: "takopi-takopii-no-genzai", name: "Takopi (Takopii no Genzai)", anime: "Takopii no Genzai", image: null },
      { id: "nezuko-demon-slayer", name: "Nezuko (Demon Slayer)", anime: "Demon Slayer", image: null },
      { id: "lishu-the-apothecary-diaries", name: "Lishu (The Apothecary Diaries)", anime: "The Apothecary Diaries", image: null },
      { id: "haruka-wind-breaker", name: "Haruka (Wind Breaker)", anime: "Wind Breaker", image: null }
    ]
  }
];


