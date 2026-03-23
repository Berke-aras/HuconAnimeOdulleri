const fs = require('fs');
const path = require('path');

const imgDir = path.join(__dirname, '../img/candidates');
const dataJsPath = path.join(__dirname, '../js/data.js');
const imgMapPath = path.join(__dirname, '../js/image-map.js');

if (!fs.existsSync(imgDir)) {
  fs.mkdirSync(imgDir, { recursive: true });
}

// 1. Oku ve Parse Et: js/data.js
let dataJsContent = fs.readFileSync(dataJsPath, 'utf8');
dataJsContent = dataJsContent.replace(/const\s+CATEGORIES/g, 'var CATEGORIES');
dataJsContent = dataJsContent.replace(/const\s+SITE_CONFIG/g, 'var SITE_CONFIG');
eval(dataJsContent);

// 2. AniList Servis Mantığını Kopyala
const API_URL = 'https://graphql.anilist.co';

const ANIME_QUERY = `
  query ($search: String) {
    Media (search: $search, type: ANIME) { id coverImage { large medium } }
  }
`;

const CHARACTER_QUERY = `
  query ($id: Int, $search: String) {
    Character (id: $id, search: $search) { id image { large medium } }
  }
`;

const MANGA_QUERY = `
  query ($search: String) {
    Media (search: $search, type: MANGA) { id coverImage { large medium } }
  }
`;

const TITLE_OVERRIDES = {
  "zenshu ot": "Zenshuu",
  "zenshuu.": "Zenshuu",
  "sung jinwoo (solo leveling)": "129928",
  "dr. deniz skinner (lazarus)": "347658",
  "xeno (dr. stone: science-future)": "186479",
  "xeno (dr. stone: science future)": "186479",
  "dr. xeno": "186479",
  "solo leveling sezon 2": "Solo Leveling Season 2",
  "dr. stone: science future": "Dr. STONE: SCIENCE FUTURE",
  "kaijuu 8-gou 2nd season": "Kaijuu 8-gou",
  "kaiju no.9": "Kaiju No. 9",
  "gquuuuuux": "GQuuuuuuX",
  "yano-kun's ordinary days": "Yano-kun no Futsuu no Hibi",
  "white rabbit": "White Rabbit (Fushigi no Kuni de Alice to)",
  "ant king": "Ant King (Solo Leveling)",
  "kibutsuji muzan": "Muzan Kibutsuji",
  "fate/strange fake": "Fate/strange Fake: Whispers of Dawn",
  "haruka (wind breaker)": "Haruka Sakura",
  "x (to be hero x)": "349524",
  "demon-slayer-series-ufotable": "Kimetsu no Yaiba",
  "the apothecary diaries 薬屋のひとりごと": "Kusuriya no Hitorigoto",
  "demon slayer (ufotable)": "Kimetsu no Yaiba",
  "kaoru-hana-wa-rin-to-saku": "The Fragrant Flower Blooms with Dignity",
  "kusuriya-no-hitorigoto-2nd-season": "Kusuriya no Hitorigoto Season 2",
  "white rabbit (fushigi no kuni de alice to: dive in wonderland)": "White Rabbit",
  "kaiju no.9 (kaijuu 8-gou 2nd season)": "Kaiju No. 9",
  "ant king (houston wingfield solo leveling 2. sezon)": "Ant King"
};

function cleanSearchName(name) {
  if (!name) return "";
  return name.replace(/\s*\(.*?\)/g, '').replace(/[^\x00-\x7F]+/g, '').replace(/\s*Sezon\s*/gi, ' Season ').trim();
}

function stripSong(name) {
  if (!name) return "";
  return name.replace(/\s*[—-].*$/g, '').trim();
}

async function queryAniList(query, variables) {
  let retries = 3;
  while (retries >= 0) {
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ query, variables })
      });
      if (response.status === 429 && retries > 0) {
        retries--;
        const retryAfter = response.headers.get('retry-after');
        const delay = retryAfter ? parseInt(retryAfter) * 1000 : 2000;
        console.log(`[Rate Limit] Bekleniyor ${delay}ms...`);
        await new Promise(r => setTimeout(r, delay));
        continue;
      }
      if (!response.ok) throw new Error('API Error: ' + response.statusText);
      return await response.json();
    } catch (e) {
      if (retries === 0) throw e;
      retries--;
      await new Promise(r => setTimeout(r, 1000));
    }
  }
}

const _inflight = {};
async function fetchImageUrl(name, type = 'ANIME', fallbackSearch = null) {
  const isId = typeof name === 'number' || /^\\d+$/.test(name);
  const cacheId = type.toLowerCase() + '_' + (isId ? 'id_' : '') + name.toString().toLowerCase().replace(/\\s+/g, '_');
  if (_inflight[cacheId]) return _inflight[cacheId];

  _inflight[cacheId] = (async () => {
    const attempts = isId ? [name] : (fallbackSearch ? [name, fallbackSearch] : [name]);
    for (const searchVal of attempts) {
      try {
        const variables = isId ? { id: parseInt(searchVal) } : { search: searchVal };
        let query = type === 'CHARACTER' ? CHARACTER_QUERY : (type === 'MANGA' ? MANGA_QUERY : ANIME_QUERY);
        const result = await queryAniList(query, variables);
        const data = result.data;
        let imageUrl = null;
        if (type === 'CHARACTER' && data.Character) imageUrl = data.Character.image.large;
        else if (data.Media) imageUrl = data.Media.coverImage.large;
        if (imageUrl) return imageUrl;
      } catch (e) { }
    }
    return null;
  })();
  return _inflight[cacheId];
}

async function resolveCandidateImage(candidate, categoryId) {
  const isLazarus = ((candidate.name && candidate.name.toLowerCase().includes('lazarus')) || 
                    (candidate.anime && candidate.anime.toLowerCase().includes('lazarus'))) &&
                    !(candidate.name && candidate.name.toLowerCase().includes('skinner'));
  if (isLazarus) return "img/md3fx6mbxv3f1.jpeg";
  if (candidate.image && (candidate.image.startsWith('http') || candidate.image.startsWith('https'))) return candidate.image;

  const isCharacter = (categoryId.includes('karakter') && !categoryId.includes('dizayni')) || categoryId.includes('cift') || categoryId.includes('antagonist') || categoryId.includes('protect') || categoryId.includes('ana-karakter') || categoryId.includes('yardimci');
  const isManga = categoryId.includes('manga');
  const searchType = isCharacter ? 'CHARACTER' : (isManga ? 'MANGA' : 'ANIME');
  
  const rawOverride = TITLE_OVERRIDES[candidate.name.toLowerCase()];
  if (rawOverride) {
    const url = await fetchImageUrl(rawOverride, searchType);
    if (url) return url;
  }

  const cleanedName = cleanSearchName(candidate.name);
  const cleanedAnime = candidate.anime ? cleanSearchName(candidate.anime) : null;
  const cleanedOverride = TITLE_OVERRIDES[cleanedName.toLowerCase()];
  const nameToSearch = cleanedOverride || cleanedName;

  if (categoryId.includes('cift')) {
    const names = cleanedName.split(/\\s*x\\s*|\\s*&\\s*/i);
    const urls = await Promise.all(names.map(async (n) => {
      const charName = n.trim();
      let img = await fetchImageUrl(charName, 'CHARACTER', cleanedAnime ? `${charName} ${cleanedAnime}` : null);
      if (!img && cleanedAnime) img = await fetchImageUrl(cleanedAnime, 'ANIME');
      return img;
    }));
    return urls.filter(u => u != null);
  }

  let url = null;
  if (isCharacter) {
    const fallback = cleanedAnime ? `${nameToSearch} ${cleanedAnime}` : null;
    url = await fetchImageUrl(nameToSearch, 'CHARACTER', fallback);
    if (!url && cleanedAnime) url = await fetchImageUrl(cleanedAnime, 'ANIME');
  } else {
    if (cleanedAnime) url = await fetchImageUrl(cleanedAnime, searchType);
    if (!url) url = await fetchImageUrl(nameToSearch, searchType);
    if (!url && (cleanedName.includes('—') || cleanedName.includes('-'))) {
      url = await fetchImageUrl(stripSong(cleanedName), searchType);
    }
  }
  return url;
}

// Resim İndirme Fonksiyonu
async function downloadImage(url, filepath) {
  if (fs.existsSync(filepath)) return true; // Zaten var
  if (url === "img/md3fx6mbxv3f1.jpeg") return true; 
  if (!url || !url.startsWith('http')) return false;

  return new Promise((resolve, reject) => {
    const https = require('https');
    https.get(url, (res) => {
      if (res.statusCode === 200) {
        res.pipe(fs.createWriteStream(filepath))
           .on('error', reject)
           .once('close', () => resolve(true));
      } else {
        res.resume();
        resolve(false);
      }
    }).on('error', reject);
  });
}

// Ana İşlem Döngüsü
async function processAll() {
  const mapPath = path.join(__dirname, '../js/image-map.js');
  let IMAGE_MAP = {};
  if (fs.existsSync(mapPath)) {
     const text = fs.readFileSync(mapPath, 'utf8');
     try { IMAGE_MAP = JSON.parse(text.replace('const IMAGE_MAP = ', '').replace(';', '')); } catch(e){}
  }

  let totalCount = 0;
  let downloadedCount = 0;

  for (const cat of CATEGORIES) {
    console.log(`[Kategori] ${cat.title} işleniyor...`);
    for (const candidate of cat.candidates) {
      totalCount++;
      const mapKey = cat.id + '_' + candidate.id;
      
      let imageUrls = await resolveCandidateImage(candidate, cat.id);
      if (!imageUrls) {
        console.log(`  HATA: ${candidate.name} için resim bulunamadı!`);
        continue;
      }
      
      if (!Array.isArray(imageUrls)) imageUrls = [imageUrls];

      const localPaths = [];
      for (let i = 0; i < imageUrls.length; i++) {
         const url = imageUrls[i];
         if (url === "img/md3fx6mbxv3f1.jpeg") {
             localPaths.push(url);
             continue;
         }
         // get extension
         const ext = url.split('.').pop().split('?')[0] || 'jpg';
         const filename = `${cat.id}_${candidate.id}${imageUrls.length>1 ? '_'+i : ''}.${ext}`;
         const localFileUrl = `img/candidates/${filename}`;
         const localFilePath = path.join(__dirname, '../', localFileUrl);

         const success = await downloadImage(url, localFilePath);
         if (success) {
            localPaths.push(localFileUrl);
            downloadedCount++;
            process.stdout.write('.');
         } else {
            console.log(`  INDIRILEMEDI: ${url}`);
         }
      }
      
      if (localPaths.length > 0) {
        IMAGE_MAP[mapKey] = localPaths.length === 1 ? localPaths[0] : localPaths;
      }
      // Rate limiting on AniList is tricky, give it a tiny breath
      await new Promise(r => setTimeout(r, 200));
    }
    console.log(""); // newline
  }

  // Write JS map file
  const jsContent = `const IMAGE_MAP = ${JSON.stringify(IMAGE_MAP, null, 2)};`;
  fs.writeFileSync(imgMapPath, jsContent);
  console.log(`\n[Bitti] Toplam ${totalCount} aday kontrol edildi. İndirilebilir olan ${downloadedCount} resim kaydedildi.`);
  console.log(`'js/image-map.js' güncellendi.`);
}

processAll();
