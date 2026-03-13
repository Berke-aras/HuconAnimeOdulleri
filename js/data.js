// ============================================================
// Anime Oylama - Kategori ve Aday Verileri
// Bu dosyayı düzenleyerek kategorileri ve adayları değiştirin
// ============================================================

const SITE_CONFIG = {
  title: "Anime Oylama",
  subtitle: "Favori animeni ve karakterini seç!",
  eventName: "Anime Etkinliği 2026",
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
      { id: "solo-leveling-a-1-pictures", name: "Solo Leveling (A-1 Pictures)", anime: "Solo Leveling (A-1 Pictures)", image: "img/candidates/solo-leveling-a-1-pictures.jpg" },
      { id: "the-apothecary-diaries-sezon-2-olm-project-no-9", name: "The Apothecary Diaries Sezon 2 (OLM/Project No.9)", anime: "The Apothecary Diaries Sezon 2 (OLM/Project No.9)", image: "img/candidates/the-apothecary-diaries-sezon-2-olm-project-no-9.jpg" },
      { id: "kaiju-no-8-production-i-g", name: "Kaiju No. 8 (Production I.G)", anime: "Kaiju No. 8 (Production I.G)", image: "img/candidates/kaiju-no-8-production-i-g.jpg" },
      { id: "gachiakuta", name: "Gachiakuta", anime: "Gachiakuta", image: "img/candidates/gachiakuta.jpg" },
      { id: "lord-of-mysteries", name: "Lord of Mysteries", anime: "Lord of Mysteries", image: "img/candidates/lord-of-mysteries.jpg" },
      { id: "to-be-hero-x", name: "To Be Hero X", anime: "To Be Hero X", image: "img/candidates/to-be-hero-x.jpg" },
      { id: "the-summer-hikaru-died", name: "The Summer Hikaru Died", anime: "The Summer Hikaru Died", image: "img/candidates/the-summer-hikaru-died.jpg" },
      { id: "dandadan-sezon-2", name: "Dandadan Sezon 2", anime: "Dandadan Sezon 2", image: "img/candidates/dandadan-sezon-2.jpg" },
      { id: "orb-on-the-movements-of-the-earth", name: "Orb: On the Movements of the Earth", anime: "Orb: On the Movements of the Earth", image: "img/candidates/orb-on-the-movements-of-the-earth.jpg" },
      { id: "the-fragrant-flower-blooms-with-dignity", name: "The Fragrant Flower Blooms with Dignity", anime: "The Fragrant Flower Blooms with Dignity", image: "img/candidates/the-fragrant-flower-blooms-with-dignity.jpg" },
      { id: "sakamoto-days", name: "SAKAMOTO DAYS", anime: "SAKAMOTO DAYS", image: "img/candidates/sakamoto-days.jpg" },
      { id: "takopii-no-genzai", name: "Takopii no Genzai", anime: "Takopii no Genzai", image: "img/candidates/takopii-no-genzai.jpg" },
      { id: "boku-no-hero-academia-final-season", name: "Boku no Hero Academia FINAL SEASON", anime: "Boku no Hero Academia FINAL SEASON", image: "img/candidates/boku-no-hero-academia-final-season.jpg" },
      { id: "dr-stone-science-future-part-2", name: "Dr. STONE: SCIENCE FUTURE Part 2", anime: "Dr. STONE: SCIENCE FUTURE Part 2", image: "img/candidates/dr-stone-science-future-part-2.jpg" },
      { id: "zenshuu", name: "Zenshuu.", anime: "Zenshuu.", image: "img/candidates/zenshuu.jpg" },
      { id: "enen-no-shouboutai-san-no-shou-sezon-3", name: "Enen no Shouboutai: San no Shou Sezon 3", anime: "Enen no Shouboutai: San no Shou Sezon 3", image: "img/candidates/enen-no-shouboutai-san-no-shou-sezon-3.jpg" },
      { id: "my-dress-up-darling-sezon-2", name: "My Dress-Up Darling Sezon 2", anime: "My Dress-Up Darling Sezon 2", image: "img/candidates/my-dress-up-darling-sezon-2.jpg" },
      { id: "call-of-the-night-season-2", name: "Call of the Night Season 2", anime: "Call of the Night Season 2", image: "img/candidates/call-of-the-night-season-2.jpg" },
      { id: "spy-family-season-3", name: "SPY×FAMILY Season 3", anime: "SPY×FAMILY Season 3", image: "img/candidates/spy-family-season-3.jpg" },
      { id: "lazarus", name: "Lazarus", anime: "Lazarus", image: "img/candidates/lazarus.jpg" }
    ]
  },
  {
    id: "en-prestijli-yilin-basliklari-yilin-anime-filmi",
    title: "Yılın Anime Filmi",
    icon: "star",
    candidates: [
      { id: "look-back-tatsuki-fujimoto", name: "Look Back (Tatsuki Fujimoto)", anime: "Look Back (Tatsuki Fujimoto)", image: "img/candidates/look-back-tatsuki-fujimoto.jpg" },
      { id: "chainsaw-man-the-movie-reze-arc", name: "Chainsaw Man – The Movie: Reze Arc", anime: "Chainsaw Man – The Movie: Reze Arc", image: "img/candidates/chainsaw-man-the-movie-reze-arc.jpg" },
      { id: "haikyuu-the-movie-decisive-battle-at-the-garbage-dump", name: "Haikyuu!! The Movie: Decisive Battle at the Garbage Dump", anime: "Haikyuu!! The Movie: Decisive Battle at the Garbage Dump", image: "img/candidates/haikyuu-the-movie-decisive-battle-at-the-garbage-dump.jpg" },
      { id: "demon-slayer-infinity-castle-movie-1", name: "Demon Slayer: Infinity Castle Movie 1", anime: "Demon Slayer: Infinity Castle Movie 1", image: "img/candidates/demon-slayer-infinity-castle-movie-1.jpg" },
      { id: "kimi-no-iro-the-colors-within", name: "Kimi no Iro (The Colors Within)", anime: "Kimi no Iro (The Colors Within)", image: "img/candidates/kimi-no-iro-the-colors-within.jpg" },
      { id: "overlord-the-sacred-kingdom", name: "Overlord: The Sacred Kingdom", anime: "Overlord: The Sacred Kingdom", image: "img/candidates/overlord-the-sacred-kingdom.jpg" },
      { id: "hyakuemu-100-meters", name: "Hyakuemu. (100 Meters)", anime: "Hyakuemu. (100 Meters)", image: "img/candidates/hyakuemu-100-meters.jpg" },
      { id: "project-sekai-kowareta-sekai-to-utaenai-miku", name: "Project Sekai: Kowareta SEKAI to Utaenai MIKU", anime: "Project Sekai: Kowareta SEKAI to Utaenai MIKU", image: "img/candidates/project-sekai-kowareta-sekai-to-utaenai-miku.jpg" },
      { id: "baan-otona-no-kyoukai", name: "bâan: Otona no Kyoukai", anime: "bâan: Otona no Kyoukai", image: "img/candidates/baan-otona-no-kyoukai.jpg" }
    ]
  },
  {
    id: "en-prestijli-yilin-basliklari-en-iyi-yeni-seri",
    title: "En İyi Yeni Seri",
    icon: "star",
    candidates: [
      { id: "gachiakuta-bones", name: "Gachiakuta (Bones)", anime: "Gachiakuta (Bones)", image: "img/candidates/gachiakuta-bones.jpg" },
      { id: "the-fragrant-flower-blooms-with-dignity", name: "The Fragrant Flower Blooms with Dignity", anime: "The Fragrant Flower Blooms with Dignity", image: "img/candidates/the-fragrant-flower-blooms-with-dignity.jpg" },
      { id: "the-summer-hikaru-died", name: "The Summer Hikaru Died", anime: "The Summer Hikaru Died", image: "img/candidates/the-summer-hikaru-died.jpg" },
      { id: "takopii-no-genzai", name: "Takopii no Genzai", anime: "Takopii no Genzai", image: "img/candidates/takopii-no-genzai.jpg" },
      { id: "to-be-hero-x", name: "To Be Hero X", anime: "To Be Hero X", image: "img/candidates/to-be-hero-x.jpg" },
      { id: "lazarus", name: "Lazarus", anime: "Lazarus", image: "img/candidates/lazarus.jpg" },
      { id: "lord-of-mysteries", name: "Lord of Mysteries", anime: "Lord of Mysteries", image: "img/candidates/lord-of-mysteries.jpg" },
      { id: "witch-watch", name: "Witch Watch", anime: "Witch Watch", image: "img/candidates/witch-watch.jpg" },
      { id: "clevatess-majuu-no-ou-to-akago-to-kabane-no-yuusha", name: "Clevatess: Majuu no Ou to Akago to Kabane no Yuusha", anime: "Clevatess: Majuu no Ou to Akago to Kabane no Yuusha", image: "img/candidates/clevatess-majuu-no-ou-to-akago-to-kabane-no-yuusha.jpg" },
      { id: "zenshuu", name: "Zenshuu.", anime: "Zenshuu.", image: "img/candidates/zenshuu.jpg" },
      { id: "vigilante-boku-no-hero-academia-illegals", name: "Vigilante: Boku no Hero Academia ILLEGALS", anime: "Vigilante: Boku no Hero Academia ILLEGALS", image: "img/candidates/vigilante-boku-no-hero-academia-illegals.jpg" },
      { id: "kowloon-generic-romance", name: "Kowloon Generic Romance", anime: "Kowloon Generic Romance", image: "img/candidates/kowloon-generic-romance.jpg" },
      { id: "fujimoto-tatsuki-17-26", name: "Fujimoto Tatsuki 17-26", anime: "Fujimoto Tatsuki 17-26", image: "img/candidates/fujimoto-tatsuki-17-26.jpg" },
      { id: "medalist", name: "Medalist", anime: "Medalist", image: "img/candidates/medalist.jpg" },
      { id: "silent-witch-chinmoku-no-majo-no-kakushigoto", name: "Silent Witch: Chinmoku no Majo no Kakushigoto", anime: "Silent Witch: Chinmoku no Majo no Kakushigoto", image: "img/candidates/silent-witch-chinmoku-no-majo-no-kakushigoto.jpg" }
    ]
  },
  {
    id: "en-prestijli-yilin-basliklari-en-iyi-devam-eden-seri",
    title: "En İyi Devam Eden Seri",
    icon: "star",
    candidates: [
      { id: "one-piece-egghead-arc", name: "One Piece (Egghead Arc)", anime: "One Piece (Egghead Arc)", image: "img/candidates/one-piece-egghead-arc.jpg" },
      { id: "my-hero-academia-final-season", name: "My Hero Academia: Final Season", anime: "My Hero Academia: Final Season", image: "img/candidates/my-hero-academia-final-season.jpg" },
      { id: "re-zero-season-3", name: "Re:Zero Season 3", anime: "Re:Zero Season 3", image: "img/candidates/re-zero-season-3.jpg" },
      { id: "spy-x-family-season-3", name: "Spy x Family Season 3", anime: "Spy x Family Season 3", image: "img/candidates/spy-x-family-season-3.jpg" },
      { id: "to-your-eternity-season-3", name: "To Your Eternity Season 3", anime: "To Your Eternity Season 3", image: "img/candidates/to-your-eternity-season-3.jpg" },
      { id: "uma-musume-cinderella-gray", name: "Uma Musume: Cinderella Gray", anime: "Uma Musume: Cinderella Gray", image: "img/candidates/uma-musume-cinderella-gray.jpg" },
      { id: "kingdom-sezon-6", name: "Kingdom Sezon 6", anime: "Kingdom Sezon 6", image: "img/candidates/kingdom-sezon-6.jpg" },
      { id: "the-rising-of-the-shield-hero-sezon-4", name: "The Rising of the Shield Hero Sezon 4", anime: "The Rising of the Shield Hero Sezon 4", image: "img/candidates/the-rising-of-the-shield-hero-sezon-4.jpg" },
      { id: "isekai-quartet-3", name: "Isekai Quartet 3", anime: "Isekai Quartet 3", image: "img/candidates/isekai-quartet-3.jpg" },
      { id: "rascal-does-not-dream-of-bunny-girl-senpai", name: "Rascal Does Not Dream of Bunny Girl Senpai", anime: "Rascal Does Not Dream of Bunny Girl Senpai", image: "img/candidates/rascal-does-not-dream-of-bunny-girl-senpai.jpg" }
    ]
  },
  {
    id: "en-prestijli-yilin-basliklari-yilin-en-iyi-mangasi",
    title: "Yılın En İyi Mangası",
    icon: "star",
    candidates: [
      { id: "jujutsu-kaisen-modulo", name: "Jujutsu Kaisen Modulo", anime: "Jujutsu Kaisen Modulo", image: "img/candidates/jujutsu-kaisen-modulo.jpg" },
      { id: "chainsaw-man", name: "Chainsaw Man", anime: "Chainsaw Man", image: "img/candidates/chainsaw-man.jpg" },
      { id: "one-piece", name: "One Piece", anime: "One Piece", image: "img/candidates/one-piece.jpg" },
      { id: "steel-ball-run-jojos-bizarre-adventure-part-7", name: "Steel Ball Run (JoJo's Bizarre Adventure Part 7)", anime: "Steel Ball Run (JoJo's Bizarre Adventure Part 7)", image: "img/candidates/steel-ball-run-jojos-bizarre-adventure-part-7.jpg" },
      { id: "the-apothecary-diaries", name: "The Apothecary Diaries 薬屋のひとりごと", anime: "The Apothecary Diaries 薬屋のひとりごと", image: "img/candidates/the-apothecary-diaries.jpg" },
      { id: "dandadan", name: "DanDaDan", anime: "DanDaDan", image: "img/candidates/dandadan.jpg" },
      { id: "gokurakugai", name: "Gokurakugai", anime: "Gokurakugai", image: "img/candidates/gokurakugai.jpg" },
      { id: "futari-switch", name: "Futari Switch", anime: "Futari Switch", image: "img/candidates/futari-switch.jpg" },
      { id: "spy-x-family", name: "Spy X Family", anime: "Spy X Family", image: "img/candidates/spy-x-family.jpg" },
      { id: "kaiju-no-8", name: "Kaiju No. 8", anime: "Kaiju No. 8", image: "img/candidates/kaiju-no-8.jpg" },
      { id: "black-clover", name: "Black Clover", anime: "Black Clover", image: "img/candidates/black-clover.jpg" }
    ]
  },
  {
    id: "en-prestijli-yilin-basliklari-en-iyi-orijinal-anime",
    title: "En İyi Orijinal Anime",
    icon: "star",
    candidates: [
      { id: "bucchigiri", name: "BUCCHIGIRI?!", anime: "BUCCHIGIRI?!", image: "img/candidates/bucchigiri.jpg" },
      { id: "girls-band-cry", name: "GIRLS BAND CRY", anime: "GIRLS BAND CRY", image: "img/candidates/girls-band-cry.jpg" },
      { id: "jellyfish-cant-swim-in-the-night", name: "Jellyfish Can’t Swim in the Night", anime: "Jellyfish Can’t Swim in the Night", image: "img/candidates/jellyfish-cant-swim-in-the-night.jpg" },
      { id: "metallic-rouge", name: "Metallic Rouge", anime: "Metallic Rouge", image: "img/candidates/metallic-rouge.jpg" },
      { id: "ninja-kamui", name: "Ninja Kamui", anime: "Ninja Kamui", image: "img/candidates/ninja-kamui.jpg" },
      { id: "lazarus", name: "Lazarus", anime: "Lazarus", image: "img/candidates/lazarus.jpg" },
      { id: "clevatess-majuu-no-ou-to-akago-to-kabane-no-yuusha", name: "Clevatess: Majuu no Ou to Akago to Kabane no Yuusha", anime: "Clevatess: Majuu no Ou to Akago to Kabane no Yuusha", image: "img/candidates/clevatess-majuu-no-ou-to-akago-to-kabane-no-yuusha.jpg" },
      { id: "zenshuu", name: "Zenshuu.", anime: "Zenshuu.", image: "img/candidates/zenshuu.jpg" }
    ]
  },

  /* Karakter Odaklı Başlıklar */
  {
    id: "karakter-odakli-en-iyi-ana-karakter",
    title: "En İyi Ana Karakter",
    icon: "star",
    candidates: [
      { id: "sung-jinwoo-solo-leveling", name: "Sung Jinwoo (Solo Leveling)", anime: "Solo Leveling", image: "img/candidates/sung-jinwoo-solo-leveling.jpg" },
      { id: "maomao-the-apothecary-diaries", name: "Maomao (The Apothecary Diaries)", anime: "The Apothecary Diaries", image: "img/candidates/maomao-the-apothecary-diaries.jpg" },
      { id: "kafka-hibino-kaiju-no-8", name: "Kafka Hibino (Kaiju No. 8)", anime: "Kaiju No. 8", image: "img/candidates/kafka-hibino-kaiju-no-8.jpg" },
      { id: "sakamoto-sakamoto-days", name: "Sakamoto (Sakamoto Days)", anime: "Sakamoto Days", image: "img/candidates/sakamoto-sakamoto-days.jpg" },
      { id: "ken-takakura-dandadan", name: "Ken Takakura (Dandadan)", anime: "Dandadan", image: "img/candidates/ken-takakura-dandadan.jpg" },
      { id: "rudo-gachiakuta", name: "Rudo (Gachiakuta)", anime: "Gachiakuta", image: "img/candidates/rudo-gachiakuta.jpg" },
      { id: "marin-kitagawa-my-dress-up-darling", name: "Marin Kitagawa (My Dress-Up Darling)", anime: "My Dress-Up Darling", image: "img/candidates/marin-kitagawa-my-dress-up-darling.jpg" },
      { id: "shinra-kusakabe-fire-force", name: "Shinra Kusakabe (Fire Force)", anime: "Fire Force", image: "img/candidates/shinra-kusakabe-fire-force.jpg" },
      { id: "izuku-midoriya-my-hero-academia", name: "Izuku Midoriya (My Hero Academia)", anime: "My Hero Academia", image: "img/candidates/izuku-midoriya-my-hero-academia.jpg" },
      { id: "x-to-be-hero-x", name: "X (To Be Hero X)", anime: "To Be Hero X", image: "img/candidates/x-to-be-hero-x.jpg" },
      { id: "senkuu-ishigami-dr-stone-science-future", name: "Senkuu Ishigami (Dr. STONE: SCIENCE FUTURE)", anime: "Dr. STONE: SCIENCE FUTURE", image: "img/candidates/senkuu-ishigami-dr-stone-science-future.jpg" },
      { id: "klein-moretti-lord-of-mysteries", name: "Klein Moretti (Lord of Mysteries)", anime: "Lord of Mysteries", image: "img/candidates/klein-moretti-lord-of-mysteries.jpg" }
    ]
  },
  {
    id: "karakter-odakli-en-iyi-yardimci-karakter",
    title: "En İyi Yardımcı Karakter",
    icon: "star",
    candidates: [
      { id: "jinshi-the-apothecary-diaries", name: "Jinshi (The Apothecary Diaries)", anime: "The Apothecary Diaries", image: "img/candidates/jinshi-the-apothecary-diaries.jpg" },
      { id: "seiko-dandadan", name: "Seiko (Dandadan)", anime: "Dandadan", image: "img/candidates/seiko-dandadan.jpg" },
      { id: "turbo-granny-dandadan", name: "Turbo Granny (Dandadan)", anime: "Dandadan", image: "img/candidates/turbo-granny-dandadan.jpg" },
      { id: "enjin-gachiakuta", name: "Enjin (Gachiakuta)", anime: "Gachiakuta", image: "img/candidates/enjin-gachiakuta.jpg" },
      { id: "jin-ho-yu-solo-leveling", name: "Jin-Ho Yu (Solo Leveling)", anime: "Solo Leveling", image: "img/candidates/jin-ho-yu-solo-leveling.jpg" },
      { id: "shin-asakura-sakamoto-days", name: "Shin Asakura (Sakamoto Days)", anime: "Sakamoto Days", image: "img/candidates/shin-asakura-sakamoto-days.jpg" },
      { id: "soushirou-hoshina-kaiju-no-8", name: "Soushirou Hoshina (Kaiju No. 8)", anime: "Kaiju No. 8", image: "img/candidates/soushirou-hoshina-kaiju-no-8.jpg" },
      { id: "mina-ashiro-kaiju-no-8", name: "Mina Ashiro (Kaiju No. 8)", anime: "Kaiju No. 8", image: "img/candidates/mina-ashiro-kaiju-no-8.jpg" },
      { id: "shizuka-kuze-takopii-no-genzai", name: "Shizuka Kuze (Takopii no Genzai)", anime: "Takopii no Genzai", image: "img/candidates/shizuka-kuze-takopii-no-genzai.jpg" },
      { id: "arthur-boyle-fire-force", name: "Arthur Boyle (Fire Force)", anime: "Fire Force", image: "img/candidates/arthur-boyle-fire-force.jpg" },
      { id: "katsuki-bakugou-my-hero-academia", name: "Katsuki Bakugou (My Hero Academia)", anime: "My Hero Academia", image: "img/candidates/katsuki-bakugou-my-hero-academia.jpg" },
      { id: "anko-uguisu-call-of-the-night", name: "Anko Uguisu (Call of the Night)", anime: "Call of the Night", image: "img/candidates/anko-uguisu-call-of-the-night.jpg" }
    ]
  },
  {
    id: "karakter-odakli-en-iyi-antagonist",
    title: "En İyi Antagonist",
    icon: "star",
    candidates: [
      { id: "kei-uzuki-sakamoto-days", name: "Kei Uzuki (Sakamoto Days)", anime: "Sakamoto Days", image: "img/candidates/kei-uzuki-sakamoto-days.jpg" },
      { id: "reze-chainsaw-man-reze-arc", name: "Reze (Chainsaw Man – The Movie: Reze Arc)", anime: "Chainsaw Man – The Movie: Reze Arc", image: "img/candidates/reze-chainsaw-man-reze-arc.jpg" },
      { id: "jabber-wonger-gachiakuta", name: "Jabber Wonger (Gachiakuta)", anime: "Gachiakuta", image: "img/candidates/jabber-wonger-gachiakuta.jpg" },
      { id: "dr-deniz-skinner-lazarus", name: "Dr. Deniz Skinner (Lazarus)", anime: "Lazarus", image: "img/candidates/dr-deniz-skinner-lazarus.jpg" },
      { id: "kibutsuji-muzan-kimetsu-no-yaiba-mugen-rassha-hen", name: "Kibutsuji Muzan (Kimetsu no Yaiba: Mugen Rassha-hen)", anime: "Kimetsu no Yaiba: Mugen Rassha-hen", image: "img/candidates/kibutsuji-muzan-kimetsu-no-yaiba-mugen-rassha-hen.jpg" },
      { id: "all-for-one-my-hero-academia-final-season", name: "All For One (My Hero Academia FINAL SEASON)", anime: "My Hero Academia FINAL SEASON", image: "img/candidates/all-for-one-my-hero-academia-final-season.jpg" },
      { id: "white-rabbit-fushigi-no-kuni-de-alice-to-dive-in-wonderland", name: "White Rabbit (Fushigi no Kuni de Alice to: Dive in Wonderland)", anime: "Fushigi no Kuni de Alice to: Dive in Wonderland", image: "img/candidates/white-rabbit-fushigi-no-kuni-de-alice-to-dive-in-wonderland.jpg" },
      { id: "kaiju-no-9-kaijuu-8-gou-2nd-season", name: "Kaiju No.9 (Kaijuu 8-gou 2nd Season)", anime: "Kaijuu 8-gou 2nd Season", image: "img/candidates/kaiju-no-9-kaijuu-8-gou-2nd-season.jpg" },
      { id: "xeno-dr-stone-science-future", name: "Xeno (Dr. STONE: SCIENCE FUTURE)", anime: "Dr. STONE: SCIENCE FUTURE", image: "img/candidates/xeno-dr-stone-science-future.jpg" },
      { id: "ant-king-houston-wingfield-solo-leveling-2-sezon", name: "Ant King (Houston Wingfield Solo Leveling 2. Sezon)", anime: "Solo Leveling 2. Sezon", image: "img/candidates/ant-king-houston-wingfield-solo-leveling-2-sezon.jpg" }
    ]
  },
  {
    id: "karakter-odakli-yilin-cifti",
    title: "Yılın Çifti",
    icon: "star",
    candidates: [
      { id: "denji-reze-chainsaw-man-reze-arc", name: "Denji x Reze (Chainsaw Man: Reze Arc)", anime: "Chainsaw Man: Reze Arc", image: "img/candidates/denji-reze-chainsaw-man-reze-arc.jpg" },
      { id: "ken-takakura-momo-ayase-dandadan", name: "Ken Takakura x Momo Ayase (Dandadan)", anime: "Dandadan", image: "img/candidates/ken-takakura-momo-ayase-dandadan.jpg" },
      { id: "maomao-jinshi-the-apothecary-diaries", name: "Maomao x Jinshi (The Apothecary Diaries)", anime: "The Apothecary Diaries", image: "img/candidates/maomao-jinshi-the-apothecary-diaries.jpg" },
      { id: "kaoruko-waguri-rintarou-tsumugi-fragrant-flower", name: "Kaoruko Waguri x Rintarou Tsumugi (The Fragrant Flower Blooms with Dignity)", anime: "The Fragrant Flower Blooms with Dignity", image: "img/candidates/kaoruko-waguri-rintarou-tsumugi-fragrant-flower.jpg" },
      { id: "marin-kitagawa-wakana-gojou-my-dress-up-darling", name: "Marin Kitagawa x Wakana Gojou (My Dress-Up Darling)", anime: "My Dress-Up Darling", image: "img/candidates/marin-kitagawa-wakana-gojou-my-dress-up-darling.jpg" },
      { id: "nico-wakatsuki-morihito-otogi-witch-watch", name: "Nico Wakatsuki x Morihito Otogi (Witch Watch)", anime: "Witch Watch", image: "img/candidates/nico-wakatsuki-morihito-otogi-witch-watch.jpg" },
      { id: "nazuna-nanakusa-kou-yamori-call-of-the-night", name: "Nazuna Nanakusa x Kou Yamori (Call of the Night)", anime: "Call of the Night", image: "img/candidates/nazuna-nanakusa-kou-yamori-call-of-the-night.jpg" },
      { id: "sakuta-azusagawa-mai-sakurajima-rascal-does-not-dream-of-santa-claus", name: "Sakuta Azusagawa x Mai Sakurajima (Rascal Does Not Dream of Santa Claus)", anime: "Rascal Does Not Dream of Santa Claus", image: "img/candidates/sakuta-azusagawa-mai-sakurajima-rascal-does-not-dream-of-santa-claus.jpg" },
      { id: "reiko-kujirai-hajime-kudou-kowloon-generic-romance", name: "Reiko Kujirai x Hajime Kudou (Kowloon Generic Romance)", anime: "Kowloon Generic Romance", image: "img/candidates/reiko-kujirai-hajime-kudou-kowloon-generic-romance.jpg" },
      { id: "yoshiki-tsujinaka-hikaru-indou-the-summer-hikaru-died", name: "Yoshiki Tsujinaka x Hikaru Indou (The Summer Hikaru Died)", anime: "The Summer Hikaru Died", image: "img/candidates/yoshiki-tsujinaka-hikaru-indou-the-summer-hikaru-died.jpg" },
      { id: "yor-forger-loid-forger-spy-family", name: "Yor Forger x Loid Forger (SPY×FAMILY)", anime: "SPY×FAMILY", image: "img/candidates/yor-forger-loid-forger-spy-family.jpg" },
      { id: "kiyoka-kudou-miyo-saimori-my-happy-marriage", name: "Kiyoka Kudou x Miyo Saimori (My Happy Marriage)", anime: "My Happy Marriage", image: "img/candidates/kiyoka-kudou-miyo-saimori-my-happy-marriage.jpg" }
    ]
  },
  {
    id: "karakter-odakli-en-iyi-karakter-dizayni",
    title: "En İyi Karakter Dizaynı",
    icon: "star",
    candidates: [
      { id: "dandadan", name: "Dandadan", anime: "Dandadan", image: "img/candidates/dandadan.jpg" },
      { id: "demon-slayer-kimetsu-no-yaiba-infinity-castle", name: "Demon Slayer: Kimetsu no Yaiba Infinity Castle", anime: "Demon Slayer: Kimetsu no Yaiba Infinity Castle", image: "img/candidates/demon-slayer-kimetsu-no-yaiba-infinity-castle.jpg" },
      { id: "kaiju-no-8", name: "Kaiju No. 8", anime: "Kaiju No. 8", image: "img/candidates/kaiju-no-8.jpg" },
      { id: "the-apothecary-diaries", name: "The Apothecary Diaries", anime: "The Apothecary Diaries", image: "img/candidates/the-apothecary-diaries.jpg" },
      { id: "gachiakuta", name: "Gachiakuta", anime: "Gachiakuta", image: "img/candidates/gachiakuta.jpg" },
      { id: "lazarus", name: "Lazarus", anime: "Lazarus", image: "img/candidates/lazarus.jpg" },
      { id: "dr-stone", name: "Dr. STONE", anime: "Dr. STONE", image: "img/candidates/dr-stone.jpg" },
      { id: "spy-x-family", name: "Spy x Family", anime: "Spy x Family", image: "img/candidates/spy-x-family.jpg" },
      { id: "fire-force", name: "Fire Force", anime: "Fire Force", image: "img/candidates/fire-force.jpg" },
      { id: "solo-leveling-sezon-2", name: "Solo Leveling Sezon 2", anime: "Solo Leveling Sezon 2", image: "img/candidates/solo-leveling-sezon-2.jpg" }
    ]
  },

  /* Görsel ve İşitsel Başlıklar */
  {
    id: "gorsel-isitsel-en-iyi-animasyon",
    title: "En İyi Animasyon",
    icon: "star",
    candidates: [
      { id: "demon-slayer-ufotable", name: "Demon Slayer (Ufotable)", anime: "Demon Slayer", image: "img/candidates/demon-slayer-ufotable.jpg" },
      { id: "fate-strange-fake-a-1-pictures", name: "Fate/strange Fake (A-1 Pictures)", anime: "Fate/strange Fake", image: "img/candidates/fate-strange-fake-a-1-pictures.jpg" },
      { id: "dandadan-science-saru", name: "Dandadan (Science Saru)", anime: "Dandadan", image: "img/candidates/dandadan-science-saru.jpg" },
      { id: "solo-leveling-a-1-pictures", name: "Solo Leveling (A-1 Pictures)", anime: "Solo Leveling", image: "img/candidates/solo-leveling-a-1-pictures.jpg" },
      { id: "to-be-hero-x-pb-animation", name: "To Be Hero X (PB Animation)", anime: "To Be Hero X", image: "img/candidates/to-be-hero-x-pb-animation.jpg" },
      { id: "lord-of-mysteries-bcmay-pictures", name: "Lord of Mysteries (B.CMAY PICTURES)", anime: "Lord of Mysteries", image: "img/candidates/lord-of-mysteries-bcmay-pictures.jpg" },
      { id: "lazarus-mappa", name: "Lazarus (MAPPA)", anime: "Lazarus", image: "img/candidates/lazarus-mappa.jpg" },
      { id: "gachiakuta-bones-film", name: "Gachiakuta (Bones Film)", anime: "Gachiakuta", image: "img/candidates/gachiakuta-bones-film.jpg" }
    ]
  },
  {
    id: "gorsel-isitsel-en-iyi-acilis-op",
    title: "En İyi Açılış Sekansı (OP)",
    icon: "star",
    candidates: [
      { id: "kaiju-no-8-aurora", name: "Kaiju No. 8 — \"AURORA / You Can't Run From Yourself\"", anime: "Kaiju No. 8", image: "img/candidates/kaiju-no-8-aurora.jpg" },
      { id: "solo-leveling-reawaker", name: "Solo Leveling — \"ReawakeR\" by LiSA feat. Felix", anime: "Solo Leveling", image: "img/candidates/solo-leveling-reawaker.jpg" },
      { id: "dandadan-on-the-way", name: "Dandadan — \"On The Way\" by AiNA THE END", anime: "Dandadan", image: "img/candidates/dandadan-on-the-way.jpg" },
      { id: "gachiakuta-hugs", name: "Gachiakuta — \"HUGs\" by Paledusk", anime: "Gachiakuta", image: "img/candidates/gachiakuta-hugs.jpg" },
      { id: "chainsaw-man-reze-hen-iris-out", name: "Chainsaw Man: Reze-hen — \"IRIS OUT\" by Kenshi Yonezu", anime: "Chainsaw Man: Reze-hen", image: "img/candidates/chainsaw-man-reze-hen-iris-out.jpg" },
      { id: "the-apothecary-diaries-hyakka-ryouran", name: "The Apothecary Diaries — \"Hyakka Ryouran\" by Lilas Ikuta", anime: "The Apothecary Diaries", image: "img/candidates/the-apothecary-diaries-hyakka-ryouran.jpg" },
      { id: "to-be-hero-x-inertia", name: "To Be Hero X — \"INERTIA\" by SawanoHiroyuki[nZk]:Rei", anime: "To Be Hero X", image: "img/candidates/to-be-hero-x-inertia.jpg" },
      { id: "my-hero-academia-the-revo", name: "My Hero Academia: Final Season — \"THE REVO\" by PORNO GRAFFITTI", anime: "My Hero Academia: Final Season", image: "img/candidates/my-hero-academia-the-revo.jpg" },
      { id: "call-of-the-night-mirage", name: "Call of the Night Season 2 — \"Mirage\" by Creepy Nuts", anime: "Call of the Night Season 2", image: "img/candidates/call-of-the-night-mirage.jpg" },
      { id: "witch-watch-watch-me", name: "Witch Watch — \"Watch me!\" by YOASOBI", anime: "Witch Watch", image: "img/candidates/witch-watch-watch-me.jpg" }
    ]
  },
  {
    id: "gorsel-isitsel-en-iyi-ending",
    title: "En İyi Ending",
    icon: "star",
    candidates: [
      { id: "my-hero-academia-final-season-i", name: "My Hero Academia FINAL SEASON — “I” by BUMP OF CHICKEN", anime: "My Hero Academia FINAL SEASON", image: "img/candidates/my-hero-academia-final-season-i.jpg" },
      { id: "the-summer-hikaru-died-you-are-my-monster", name: "The Summer Hikaru Died — “you are my monster” by TOOBOE", anime: "The Summer Hikaru Died", image: "img/candidates/the-summer-hikaru-died-you-are-my-monster.jpg" },
      { id: "the-apothecary-diaries-hitorigoto", name: "The Apothecary Diaries Season 2 — “Hitorigoto” by Omoinotake", anime: "The Apothecary Diaries Season 2", image: "img/candidates/the-apothecary-diaries-hitorigoto.jpg" },
      { id: "to-be-hero-x-kontinuum", name: "To Be Hero X — “KONTINUUM” by SennaRin", anime: "To Be Hero X", image: "img/candidates/to-be-hero-x-kontinuum.jpg" },
      { id: "dandadan-season-2-doukashiteru", name: "Dandadan Season 2 — “Doukashiteru” by WurtS", anime: "Dandadan Season 2", image: "img/candidates/dandadan-season-2-doukashiteru.jpg" },
      { id: "bang-dream-ave-mujica-georgette", name: "BanG Dream! Ave Mujica — “Georgette Me, Georgette You” by Ave Mujica", anime: "BanG Dream! Ave Mujica", image: "img/candidates/bang-dream-ave-mujica-georgette.jpg" },
      { id: "my-dress-up-darling-kawaii-kaiwai", name: "My Dress-Up Darling Season 2 — “Kawaii Kaiwai” by PiKi", anime: "My Dress-Up Darling Season 2", image: "img/candidates/my-dress-up-darling-kawaii-kaiwai.jpg" },
      { id: "the-apothecary-diaries-shiawase-no-recipe", name: "The Apothecary Diaries Season 2 — “Shiawase no Recipe” by Dai Hirai", anime: "The Apothecary Diaries Season 2", image: "img/candidates/the-apothecary-diaries-shiawase-no-recipe.jpg" },
      { id: "spy-x-family-actor", name: "Spy x Family Season 3 — “Actor” by Lilas Ikuta", anime: "Spy x Family Season 3", image: "img/candidates/spy-x-family-actor.jpg" },
      { id: "uma-musume-cinderella-gray-futari", name: "Uma Musume: Cinderella Gray — “Futari” by Tamamo Cross", anime: "Uma Musume: Cinderella Gray", image: "img/candidates/uma-musume-cinderella-gray-futari.jpg" }
    ]
  },
  {
    id: "gorsel-isitsel-en-iyi-dunya-tasarimi",
    title: "En İyi Dünya Tasarımı",
    icon: "star",
    candidates: [
      { id: "gachiakuta", name: "Gachiakuta", anime: "Gachiakuta", image: "img/candidates/gachiakuta.jpg" },
      { id: "kowloon-generic-romance", name: "Kowloon Generic Romance", anime: "Kowloon Generic Romance", image: "img/candidates/kowloon-generic-romance.jpg" },
      { id: "apocalypse-h", name: "Apocalypse H", anime: "Apocalypse H", image: "img/candidates/apocalypse-h.jpg" },
      { id: "zenshu-ot", name: "Zenshu ot", anime: "Zenshu ot", image: "img/candidates/zenshu-ot.jpg" },
      { id: "mobile-suit-gundam-gquuuuuuX-el", name: "Mobile Suit Gundam GQuuuuuuX el", anime: "Mobile Suit Gundam GQuuuuuuX el", image: "img/candidates/mobile-suit-gundam-gquuuuuuX-el.jpg" },
      { id: "moonrise", name: "Moonrise", anime: "Moonrise", image: "img/candidates/moonrise.jpg" },
      { id: "lazarus", name: "Lazarus", anime: "Lazarus", image: "img/candidates/lazarus.jpg" },
      { id: "the-apothecary-diaries-season-2", name: "The Apothecary Diaries Season 2", anime: "The Apothecary Diaries Season 2", image: "img/candidates/the-apothecary-diaries-season-2.jpg" },
      { id: "dr-stone-science-future", name: "Dr. Stone: Science Future", anime: "Dr. Stone: Science Future", image: "img/candidates/dr-stone-science-future.jpg" },
      { id: "my-happy-marriage-season-2", name: "My Happy Marriage Season 2", anime: "My Happy Marriage Season 2", image: "img/candidates/my-happy-marriage-season-2.jpg" }
    ]
  },

  /* Tür Bazlı */
  {
    id: "tur-bazli-en-iyi-aksiyon",
    title: "En İyi Aksiyon",
    icon: "star",
    candidates: [
      { id: "fire-force-season-3", name: "Fire Force Season 3", anime: "Fire Force Season 3", image: "img/candidates/fire-force-season-3.jpg" },
      { id: "dandadan-sezon-2", name: "Dandadan Sezon 2", anime: "Dandadan Sezon 2", image: "img/candidates/dandadan-sezon-2.jpg" },
      { id: "demon-slayer-kimetsu-no-yaiba-hashira-training-arc", name: "Demon Slayer: Kimetsu no Yaiba Hashira Training Arc", anime: "Demon Slayer: Kimetsu no Yaiba Hashira Training Arc", image: "img/candidates/demon-slayer-kimetsu-no-yaiba-hashira-training-arc.jpg" },
      { id: "kaiju-no-8", name: "Kaiju No. 8", anime: "Kaiju No. 8", image: "img/candidates/kaiju-no-8.jpg" },
      { id: "solo-leveling-sezon-2", name: "Solo Leveling Sezon 2", anime: "Solo Leveling Sezon 2", image: "img/candidates/solo-leveling-sezon-2.jpg" },
      { id: "wind-breaker", name: "WIND BREAKER", anime: "WIND BREAKER", image: "img/candidates/wind-breaker.jpg" },
      { id: "chainsaw-man-reze-hen", name: "Chainsaw Man: Reze-hen", anime: "Chainsaw Man: Reze-hen", image: "img/candidates/chainsaw-man-reze-hen.jpg" },
      { id: "sakamoto-days", name: "SAKAMOTO DAYS", anime: "SAKAMOTO DAYS", image: "img/candidates/sakamoto-days.jpg" },
      { id: "gachiakuta", name: "Gachiakuta", anime: "Gachiakuta", image: "img/candidates/gachiakuta.jpg" }
    ]
  },
  {
    id: "tur-bazli-en-iyi-romantik",
    title: "En İyi Romantik",
    icon: "star",
    candidates: [
      { id: "honey-lemon-soda", name: "Honey Lemon Soda", anime: "Honey Lemon Soda", image: "img/candidates/honey-lemon-soda.jpg" },
      { id: "kowloon-generic-romance", name: "Kowloon Generic Romance", anime: "Kowloon Generic Romance", image: "img/candidates/kowloon-generic-romance.jpg" },
      { id: "im-getting-married-to-a-girl-i-hate-in-my-class", name: "I'm Getting Married to a Girl I Hate in My Class", anime: "I'm Getting Married to a Girl I Hate in My Class", image: "img/candidates/im-getting-married-to-a-girl-i-hate-in-my-class.jpg" },
      { id: "the-100-girlfriends-who-really-love-you-season-2", name: "The 100 Girlfriends Who Really, Really, Really, Really, Really Love You Season 2", anime: "The 100 Girlfriends Who Really, Really, Really, Really, Really Love You Season 2", image: "img/candidates/the-100-girlfriends-who-really-love-you-season-2.jpg" },
      { id: "rascal-does-not-dream-of-santa-claus", name: "Rascal Does Not Dream of Santa Claus", anime: "Rascal Does Not Dream of Santa Claus", image: "img/candidates/rascal-does-not-dream-of-santa-claus.jpg" },
      { id: "witch-watch", name: "Witch Watch", anime: "Witch Watch", image: "img/candidates/witch-watch.jpg" },
      { id: "my-dress-up-darling-season-2", name: "My Dress-Up Darling Season 2", anime: "My Dress-Up Darling Season 2", image: "img/candidates/my-dress-up-darling-season-2.jpg" },
      { id: "the-fragrant-flower-blooms-with-dignity", name: "The Fragrant Flower Blooms with Dignity", anime: "The Fragrant Flower Blooms with Dignity", image: "img/candidates/the-fragrant-flower-blooms-with-dignity.jpg" }
    ]
  },
  {
    id: "tur-bazli-en-iyi-komedi",
    title: "En İyi Komedi",
    icon: "star",
    candidates: [
      { id: "witch-watch", name: "Witch Watch", anime: "Witch Watch", image: "img/candidates/witch-watch.jpg" },
      { id: "grand-blue-season-2", name: "Grand Blue Season 2", anime: "Grand Blue Season 2", image: "img/candidates/grand-blue-season-2.jpg" },
      { id: "city-the-animation", name: "City The Animation", anime: "City The Animation", image: "img/candidates/city-the-animation.jpg" },
      { id: "osomatsu-san-4th-season", name: "Osomatsu-san 4th Season", anime: "Osomatsu-san 4th Season", image: "img/candidates/osomatsu-san-4th-season.jpg" },
      { id: "everyday-host", name: "Everyday Host", anime: "Everyday Host", image: "img/candidates/everyday-host.jpg" }
    ]
  },
  {
    id: "tur-bazli-en-iyi-slice-of-life",
    title: "En İyi Slice of Life",
    icon: "star",
    candidates: [
      { id: "catch-me-at-the-ballpark", name: "Catch Me at the Ballpark!", anime: "Catch Me at the Ballpark!", image: "img/candidates/catch-me-at-the-ballpark.jpg" },
      { id: "welcome-to-the-outcasts-restaurant", name: "Welcome to the Outcast's Restaurant!", anime: "Welcome to the Outcast's Restaurant!", image: "img/candidates/welcome-to-the-outcasts-restaurant.jpg" },
      { id: "yano-kuns-ordinary-days", name: "Yano-kun's Ordinary Days", anime: "Yano-kun's Ordinary Days", image: "img/candidates/yano-kuns-ordinary-days.jpg" },
      { id: "apocalypse-hotel", name: "Apocalypse Hotel", anime: "Apocalypse Hotel", image: "img/candidates/apocalypse-hotel.jpg" },
      { id: "ruri-rocks", name: "Ruri Rocks", anime: "Ruri Rocks", image: "img/candidates/ruri-rocks.jpg" },
      { id: "city-the-animation", name: "CITY THE ANIMATION", anime: "CITY THE ANIMATION", image: "img/candidates/city-the-animation.jpg" },
      { id: "ive-been-killing-slimes-300-years-season-2", name: "I've Been Killing Slimes for 300 Years and Maxed Out My Level Season 2", anime: "I've Been Killing Slimes for 300 Years and Maxed Out My Level Season 2", image: "img/candidates/ive-been-killing-slimes-300-years-season-2.jpg" },
      { id: "witch-watch", name: "Witch Watch", anime: "Witch Watch", image: "img/candidates/witch-watch.jpg" }
    ]
  },
  {
    id: "tur-bazli-en-iyi-drama",
    title: "En İyi Drama",
    icon: "star",
    candidates: [
      { id: "this-monster-wants-to-eat-me", name: "This Monster Wants to Eat Me", anime: "This Monster Wants to Eat Me", image: "img/candidates/this-monster-wants-to-eat-me.jpg" },
      { id: "medalist", name: "Medalist", anime: "Medalist", image: "img/candidates/medalist.jpg" },
      { id: "uma-musume-cinderella-gray", name: "Uma Musume: Cinderella Gray", anime: "Uma Musume: Cinderella Gray", image: "img/candidates/uma-musume-cinderella-gray.jpg" },
      { id: "wind-breaker-season-2", name: "WIND BREAKER Season 2", anime: "WIND BREAKER Season 2", image: "img/candidates/wind-breaker-season-2.jpg" },
      { id: "lord-of-mysteries", name: "Lord of Mysteries", anime: "Lord of Mysteries", image: "img/candidates/lord-of-mysteries.jpg" },
      { id: "kimetsu-no-yaiba-mugenjou-hen-movie-1-akaza-sairai", name: "Kimetsu no Yaiba: Mugenjou-hen Movie 1 - Akaza Sairai", anime: "Kimetsu no Yaiba: Mugenjou-hen Movie 1 - Akaza Sairai", image: "img/candidates/kimetsu-no-yaiba-mugenjou-hen-movie-1-akaza-sairai.jpg" },
      { id: "kaoru-hana-wa-rin-to-saku", name: "Kaoru Hana wa Rin to Saku", anime: "Kaoru Hana wa Rin to Saku", image: "img/candidates/kaoru-hana-wa-rin-to-saku.jpg" },
      { id: "kusuriya-no-hitorigoto-2nd-season", name: "Kusuriya no Hitorigoto 2nd Season", anime: "Kusuriya no Hitorigoto 2nd Season", image: "img/candidates/kusuriya-no-hitorigoto-2nd-season.jpg" }
    ]
  },
  {
    id: "tur-bazli-best-isekai-anime",
    title: "Best Isekai Anime",
    icon: "star",
    candidates: [
      { id: "welcome-to-japan-ms-elf", name: "Welcome to Japan, Ms. Elf!", anime: "Welcome to Japan, Ms. Elf!", image: "img/candidates/welcome-to-japan-ms-elf.jpg" },
      { id: "from-bureaucrat-to-villainess-dads-been-reincarnated", name: "From Bureaucrat to Villainess: Dad's Been Reincarnated!", anime: "From Bureaucrat to Villainess: Dad's Been Reincarnated!", image: "img/candidates/from-bureaucrat-to-villainess-dads-been-reincarnated.jpg" },
      { id: "may-i-ask-for-one-final-thing", name: "May I Ask for One Final Thing?", anime: "May I Ask for One Final Thing?", image: "img/candidates/may-i-ask-for-one-final-thing.jpg" },
      { id: "tate-no-yuusha-no-nariagari-season-4", name: "Tate no Yuusha no Nariagari Season 4", anime: "Tate no Yuusha no Nariagari Season 4", image: "img/candidates/tate-no-yuusha-no-nariagari-season-4.jpg" },
      { id: "zenshuu", name: "Zenshuu.", anime: "Zenshuu.", image: "img/candidates/zenshuu.jpg" },
      { id: "my-status-as-an-assassin-obviously-exceeds-the-heros", name: "My Status as an Assassin Obviously Exceeds the Hero's", anime: "My Status as an Assassin Obviously Exceeds the Hero's", image: "img/candidates/my-status-as-an-assassin-obviously-exceeds-the-heros.jpg" },
      { id: "the-water-magician", name: "The Water Magician", anime: "The Water Magician", image: "img/candidates/the-water-magician.jpg" },
      { id: "i-was-reincarnated-as-the-7th-prince-season-2", name: "I Was Reincarnated as the 7th Prince so I Can Take My Time Perfecting My Magical Ability Season 2", anime: "I Was Reincarnated as the 7th Prince so I Can Take My Time Perfecting My Magical Ability Season 2", image: "img/candidates/i-was-reincarnated-as-the-7th-prince-season-2.jpg" }
    ]
  },
  {
    id: "tur-bazli-must-protect-at-all-costs",
    title: "\"Must Protect At All Costs\" (isim TBD)",
    icon: "star",
    candidates: [
      { id: "anya-forger-spy-family-season-2", name: "Anya Forger (SPY×FAMILY Season 2)", anime: "SPY×FAMILY Season 2", image: "img/candidates/anya-forger-spy-family-season-2.jpg" },
      { id: "okarun-dandadan", name: "Okarun (Dandadan)", anime: "Dandadan", image: "img/candidates/okarun-dandadan.jpg" },
      { id: "anya-forger-spy-family", name: "Anya Forger (SPY×FAMILY)", anime: "SPY×FAMILY", image: "img/candidates/anya-forger-spy-family.jpg" },
      { id: "angel-chainsaw-man", name: "Angel (Chainsaw Man)", anime: "Chainsaw Man", image: "img/candidates/angel-chainsaw-man.jpg" },
      { id: "takopi-takopii-no-genzai", name: "Takopi (Takopii no Genzai)", anime: "Takopii no Genzai", image: "img/candidates/takopi-takopii-no-genzai.jpg" },
      { id: "nezuko-demon-slayer", name: "Nezuko (Demon Slayer)", anime: "Demon Slayer", image: "img/candidates/nezuko-demon-slayer.jpg" },
      { id: "lishu-the-apothecary-diaries", name: "Lishu (The Apothecary Diaries)", anime: "The Apothecary Diaries", image: "img/candidates/lishu-the-apothecary-diaries.jpg" },
      { id: "haruka-wind-breaker", name: "Haruka (Wind Breaker)", anime: "Wind Breaker", image: "img/candidates/haruka-wind-breaker.jpg" }
    ]
  }
];


