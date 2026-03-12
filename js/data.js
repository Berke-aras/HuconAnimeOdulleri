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
    id: "en-iyi-anime",
    title: "En İyi Anime",
    icon: "trophy",
    candidates: [
      { id: "aot", name: "Attack on Titan", anime: "Shingeki no Kyojin", image: "img/candidates/aot.jpg" },
      { id: "naruto", name: "Naruto Shippuden", anime: "Naruto", image: "img/candidates/naruto-anime.jpg" },
      { id: "one-piece", name: "One Piece", anime: "One Piece", image: "img/candidates/one-piece.jpg" },
      { id: "death-note", name: "Death Note", anime: "Death Note", image: "img/candidates/death-note.jpg" },
      { id: "fmab", name: "Fullmetal Alchemist: Brotherhood", anime: "FMA", image: "img/candidates/fmab.jpg" },
      { id: "demon-slayer", name: "Demon Slayer", anime: "Kimetsu no Yaiba", image: "img/candidates/demon-slayer.jpg" }
    ]
  },
  {
    id: "en-iyi-erkek",
    title: "En İyi Erkek Karakter",
    icon: "sword",
    candidates: [
      { id: "goku", name: "Son Goku", anime: "Dragon Ball Z", image: "img/candidates/goku.jpg" },
      { id: "naruto-char", name: "Naruto Uzumaki", anime: "Naruto", image: "img/candidates/naruto.jpg" },
      { id: "luffy", name: "Monkey D. Luffy", anime: "One Piece", image: "img/candidates/luffy.jpg" },
      { id: "levi", name: "Levi Ackerman", anime: "Attack on Titan", image: "img/candidates/levi.jpg" },
      { id: "light", name: "Light Yagami", anime: "Death Note", image: "img/candidates/light.jpg" },
      { id: "tanjiro", name: "Tanjiro Kamado", anime: "Demon Slayer", image: "img/candidates/tanjiro.jpg" }
    ]
  },
  {
    id: "en-iyi-kadin",
    title: "En İyi Kadın Karakter",
    icon: "sparkles",
    candidates: [
      { id: "mikasa", name: "Mikasa Ackerman", anime: "Attack on Titan", image: "img/candidates/mikasa.jpg" },
      { id: "hinata", name: "Hinata Hyuga", anime: "Naruto", image: "img/candidates/hinata.jpg" },
      { id: "nami", name: "Nami", anime: "One Piece", image: "img/candidates/nami.jpg" },
      { id: "nezuko", name: "Nezuko Kamado", anime: "Demon Slayer", image: "img/candidates/nezuko.jpg" },
      { id: "erza", name: "Erza Scarlet", anime: "Fairy Tail", image: "img/candidates/erza.jpg" },
      { id: "zero-two", name: "Zero Two", anime: "Darling in the Franxx", image: "img/candidates/zero-two.jpg" }
    ]
  },
  {
    id: "en-iyi-villain",
    title: "En İyi Villain",
    icon: "skull",
    candidates: [
      { id: "madara", name: "Madara Uchiha", anime: "Naruto", image: "img/candidates/madara.jpg" },
      { id: "frieza", name: "Frieza", anime: "Dragon Ball Z", image: "img/candidates/frieza.jpg" },
      { id: "aizen", name: "Sosuke Aizen", anime: "Bleach", image: "img/candidates/aizen.jpg" },
      { id: "johan", name: "Johan Liebert", anime: "Monster", image: "img/candidates/johan.jpg" },
      { id: "muzan", name: "Muzan Kibutsuji", anime: "Demon Slayer", image: "img/candidates/muzan.jpg" },
      { id: "griffith", name: "Griffith", anime: "Berserk", image: "img/candidates/griffith.jpg" }
    ]
  },
  {
    id: "en-iyi-dovus",
    title: "En İyi Dövüş Animesi",
    icon: "flame",
    candidates: [
      { id: "dbz", name: "Dragon Ball Z", anime: "Dragon Ball", image: "img/candidates/dbz.jpg" },
      { id: "bleach", name: "Bleach", anime: "Bleach", image: "img/candidates/bleach.jpg" },
      { id: "jjk", name: "Jujutsu Kaisen", anime: "Jujutsu Kaisen", image: "img/candidates/jjk.jpg" },
      { id: "hxh", name: "Hunter x Hunter", anime: "Hunter x Hunter", image: "img/candidates/hxh.jpg" },
      { id: "opm", name: "One Punch Man", anime: "One Punch Man", image: "img/candidates/opm.jpg" },
      { id: "mha", name: "My Hero Academia", anime: "Boku no Hero", image: "img/candidates/mha.jpg" }
    ]
  },
  {
    id: "en-iyi-romantik",
    title: "En İyi Romantik Anime",
    icon: "heart",
    candidates: [
      { id: "your-name", name: "Your Name", anime: "Kimi no Na wa", image: "img/candidates/your-name.jpg" },
      { id: "toradora", name: "Toradora!", anime: "Toradora", image: "img/candidates/toradora.jpg" },
      { id: "horimiya", name: "Horimiya", anime: "Horimiya", image: "img/candidates/horimiya.jpg" },
      { id: "clannad", name: "Clannad: After Story", anime: "Clannad", image: "img/candidates/clannad.jpg" },
      { id: "violet", name: "Violet Evergarden", anime: "Violet Evergarden", image: "img/candidates/violet.jpg" },
      { id: "kaguya", name: "Kaguya-sama", anime: "Love is War", image: "img/candidates/kaguya.jpg" }
    ]
  },
  {
    id: "en-iyi-opening",
    title: "En İyi Anime Opening",
    icon: "music",
    candidates: [
      { id: "unravel", name: "Unravel - Tokyo Ghoul", anime: "Tokyo Ghoul", image: "img/candidates/unravel.jpg" },
      { id: "cruel-angel", name: "Cruel Angel's Thesis", anime: "Evangelion", image: "img/candidates/cruel-angel.jpg" },
      { id: "again", name: "Again - FMA:B", anime: "Fullmetal Alchemist", image: "img/candidates/again.jpg" },
      { id: "silhouette", name: "Silhouette - Naruto", anime: "Naruto Shippuden", image: "img/candidates/silhouette.jpg" },
      { id: "gurenge", name: "Gurenge - Demon Slayer", anime: "Demon Slayer", image: "img/candidates/gurenge.jpg" },
      { id: "colors", name: "Colors - Code Geass", anime: "Code Geass", image: "img/candidates/colors.jpg" }
    ]
  },
  {
    id: "en-iyi-cift",
    title: "En İyi Anime Çifti",
    icon: "heart-handshake",
    candidates: [
      { id: "naruhina", name: "Naruto & Hinata", anime: "Naruto", image: "img/candidates/naruhina.jpg" },
      { id: "kirito-asuna", name: "Kirito & Asuna", anime: "SAO", image: "img/candidates/kirito-asuna.jpg" },
      { id: "eren-mikasa", name: "Eren & Mikasa", anime: "Attack on Titan", image: "img/candidates/eren-mikasa.jpg" },
      { id: "edward-winry", name: "Edward & Winry", anime: "FMA", image: "img/candidates/edward-winry.jpg" },
      { id: "goku-chichi", name: "Goku & Chi-Chi", anime: "Dragon Ball", image: "img/candidates/goku-chichi.jpg" },
      { id: "taki-mitsuha", name: "Taki & Mitsuha", anime: "Your Name", image: "img/candidates/taki-mitsuha.jpg" }
    ]
  }
];
