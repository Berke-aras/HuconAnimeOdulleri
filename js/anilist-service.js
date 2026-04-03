/**
 * AniList Image Service
 * Fetches cover images for anime and characters using AniList GraphQL API.
 * Includes a caching mechanism to stay within rate limits.
 */

const AniListService = (() => {
  const API_URL = 'https://graphql.anilist.co';
  const CACHE_KEY = 'anilist_image_cache';
  const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 gün

  // Memory-first session cache (JSON parse yok — en hızlı yol)
  const _memCache = {};

  // İnflight dedup: aynı istek birden fazla kez gönderilmesin
  const _inflight = {};

  // Persistent cache (localStorage — sayfa yenileme arası)
  let _diskCache = {};
  try {
    const saved = localStorage.getItem(CACHE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      // TTL kontrolü: eski girişleri filtrele
      const now = Date.now();
      Object.keys(parsed).forEach(k => {
        const entry = parsed[k];
        if (entry && typeof entry === 'object' && entry.url && entry.ts) {
          if (now - entry.ts < CACHE_TTL_MS) {
            _diskCache[k] = entry.url;
            _memCache[k] = entry.url; // memory'e de al
          }
        } else if (typeof entry === 'string') {
          // Eski format (sadece URL) — geçici uyumluluk
          _diskCache[k] = entry;
          _memCache[k] = entry;
        }
      });
    }
  } catch (e) { }

  async function queryAniList(query, variables) {
    let retries = 2; // Rate limit veya ağ hatası durumunda 2 kez tekrar dene
    while (retries >= 0) {
      try {
        const response = await fetch(API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify({ query, variables })
        });
        
        if (response.status === 429 && retries > 0) {
          retries--;
          const retryAfter = response.headers.get('retry-after');
          const delay = retryAfter ? parseInt(retryAfter) * 1000 : 1500;
          console.warn(`[AniList] Rate limit exceeded. Retrying after ${delay}ms...`);
          await new Promise(r => setTimeout(r, delay));
          continue;
        }

        if (!response.ok) {
          throw new Error('AniList API error: ' + response.statusText);
        }

        return await response.json();
      } catch (e) {
        if (retries === 0) throw e;
        retries--;
        await new Promise(r => setTimeout(r, 1000));
      }
    }
  }

  const ANIME_QUERY = `
    query ($search: String) {
      Media (search: $search, type: ANIME) {
        id
        coverImage {
          large
          medium
        }
      }
    }
  `;

  const CHARACTER_QUERY = `
    query ($id: Int, $search: String) {
      Character (id: $id, search: $search) {
        id
        image {
          large
          medium
        }
      }
    }
  `;

  const MANGA_QUERY = `
    query ($search: String) {
      Media (search: $search, type: MANGA) {
        id
        coverImage {
          large
          medium
        }
      }
    }
  `;

  // Custom mapping for hard-to-resolve titles or those with typos
  const TITLE_OVERRIDES = {
    // Normalizations
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

  /**
   * Cleans a name for AniList search by removing unwanted suffixes.
   */
  function cleanSearchName(name) {
    if (!name) return "";
    return name
      .replace(/\s*\(.*?\)/g, '')         // Remove (A-1 Pictures) etc.
      .replace(/[^\x00-\x7F]+/g, '')      // Remove Kanji/Non-ASCII characters
      .replace(/\s*Sezon\s*/gi, ' Season ') // Normalize Turkish Sezon -> Season
      .trim();
  }

  /**
   * Performance optimization: Check if we should use high resolution based on hardware/network.
   */
  function shouldUseHighRes() {
    // 1. Check network speed if available
    if (navigator.connection) {
      const type = navigator.connection.effectiveType;
      if (type === '2g' || type === 'slow-2g' || type === '3g') return false;
      if (navigator.connection.saveData) return false;
    }
    // 2. Check hardware (low RAM usually means low-end device)
    if (navigator.deviceMemory && navigator.deviceMemory < 4) return false;
    // 3. Check screen width (small screen doesn't need huge images)
    if (window.innerWidth < 480) return false;
    
    return true;
  }

  async function fetchImage(name, type = 'ANIME', fallbackSearch = null) {
    const isId = typeof name === 'number' || /^\d+$/.test(name);
    const cacheId = type.toLowerCase() + '_' + (isId ? 'id_' : '') + name.toString().toLowerCase().replace(/\s+/g, '_');

    // 1. Memory cache — en hızlı, JSON parse yok
    if (_memCache[cacheId] !== undefined) return _memCache[cacheId];

    // 2. İnflight dedup — aynı istek zaten gidiyorsa bekle
    if (_inflight[cacheId]) return _inflight[cacheId];

    _inflight[cacheId] = (async () => {
      const attempts = isId ? [name] : (fallbackSearch ? [name, fallbackSearch] : [name]);

      for (const searchVal of attempts) {
        try {
          const variables = {};
          if (isId) {
            variables.id = parseInt(searchVal);
          } else {
            variables.search = searchVal;
          }

          let query = ANIME_QUERY;
          if (type === 'CHARACTER') query = CHARACTER_QUERY;
          if (type === 'MANGA') query = MANGA_QUERY;

          const result = await queryAniList(query, variables);
          const data = result.data;

          let imageUrl = null;
          const resKey = shouldUseHighRes() ? 'large' : 'medium';

          if (type === 'CHARACTER' && data.Character) {
            imageUrl = data.Character.image[resKey] || data.Character.image.large;
          } else if (data.Media) {
            imageUrl = data.Media.coverImage[resKey] || data.Media.coverImage.large;
          }

          if (imageUrl) {
            _memCache[cacheId] = imageUrl;
            _diskCache[cacheId] = imageUrl;
            saveCache();
            delete _inflight[cacheId];
            return imageUrl;
          }
        } catch (e) {
          console.warn(`AniList fetch failed for ${name}:`, e);
        }
      }
      // Eğer API geçici olarak çöktüyse veya Rate Limit yendiyse "null" cachelemeyelim ki tekrar deneyebilsin.
      // Yalnızca başarılı ise cache eklensin.
      delete _inflight[cacheId];
      return null;
    })();

    return _inflight[cacheId];
  }

  function saveCache() {
    try {
      const now = Date.now();
      const keys = Object.keys(_diskCache);
      // Max 300 giriş — en eskiyi sil (FIFO)
      if (keys.length > 300) {
        keys.slice(0, keys.length - 300).forEach(k => delete _diskCache[k]);
      }
      // TTL ile kaydet
      const toSave = {};
      keys.forEach(k => {
        if (_diskCache[k]) toSave[k] = { url: _diskCache[k], ts: now };
      });
      localStorage.setItem(CACHE_KEY, JSON.stringify(toSave));
    } catch (e) { }
  }

  /**
   * Strips song title from a string like "Anime — Song"
   */
  function stripSong(name) {
    if (!name) return "";
    return name
      .replace(/\s*[—-].*$/g, '')
      .trim();
  }

  /**
   * Resolves a candidate's image URL. 
   */
  async function resolveCandidateImage(candidate, categoryId) {
    // YEREL SUNUCU (IMAGE_MAP) KONTROLÜ
    // Eğer fetch.js çalıştırılıp resimler indirildiyse Github üzerinden anında yükle
    const mapKey = categoryId + '_' + candidate.id;
    if (typeof IMAGE_MAP !== 'undefined' && IMAGE_MAP[mapKey]) {
      return IMAGE_MAP[mapKey]; // Tekli string veya [resim1, resim2] array formatında döner
    }
    
    // 0. Hard block for Lazarus
    const isLazarus = ((candidate.name && candidate.name.toLowerCase().includes('lazarus')) || 
                      (candidate.anime && candidate.anime.toLowerCase().includes('lazarus'))) &&
                      !(candidate.name && candidate.name.toLowerCase().includes('skinner'));
    if (isLazarus) {
      return "img/md3fx6mbxv3f1.jpeg";
    }

    // 1. If it's already a provided image url (local or remote), use it
    if (candidate.image && typeof candidate.image === 'string' && candidate.image.trim() !== "") {
      return candidate.image;
    }

    // 2. Determine search type
    const isCharacter = (categoryId.includes('karakter') && !categoryId.includes('dizayni')) ||
      categoryId.includes('cift') ||
      categoryId.includes('antagonist') ||
      categoryId.includes('protect') ||
      categoryId.includes('ana-karakter') ||
      categoryId.includes('yardimci');

    const isManga = categoryId.includes('manga');
    const searchType = isCharacter ? 'CHARACTER' : (isManga ? 'MANGA' : 'ANIME');

    // 3. Prepare search names
    const rawOverride = TITLE_OVERRIDES[candidate.name.toLowerCase()];
    if (rawOverride) {
      const url = await fetchImage(rawOverride, searchType);
      if (url) return url;
    }

    const cleanedName = cleanSearchName(candidate.name);
    const cleanedAnime = candidate.anime ? cleanSearchName(candidate.anime) : null;

    const cleanedOverride = TITLE_OVERRIDES[cleanedName.toLowerCase()];
    const nameToSearch = cleanedOverride || cleanedName;

    // 4. Special handling for Yılın Çifti (dual images)
    if (categoryId.includes('cift')) {
      const names = cleanedName.split(/\s*x\s*|\s*&\s*/i);
      const urls = await Promise.all(names.map(async (n) => {
        const charName = n.trim();
        let img = await fetchImage(charName, 'CHARACTER', cleanedAnime ? `${charName} ${cleanedAnime}` : null);
        if (!img && cleanedAnime) img = await fetchImage(cleanedAnime, 'ANIME');
        return img;
      }));
      return urls.filter(u => u != null);
    }

    let url = null;

    if (isCharacter) {
      const fallback = cleanedAnime ? `${nameToSearch} ${cleanedAnime}` : null;
      url = await fetchImage(nameToSearch, 'CHARACTER', fallback);
      if (!url && cleanedAnime) {
        url = await fetchImage(cleanedAnime, 'ANIME');
      }
    } else {
      if (cleanedAnime) {
        url = await fetchImage(cleanedAnime, searchType);
      }
      if (!url) {
        url = await fetchImage(nameToSearch, searchType);
      }
      if (!url && (cleanedName.includes('—') || cleanedName.includes('-'))) {
        url = await fetchImage(stripSong(cleanedName), searchType);
      }
    }

    return url;
  }

  /**
   * Prefetches images for a whole category to speed up UX.
   * Rate limit'i aşmamak için küçük gruplar (batch) ve ufak gecikmelerle çalışır.
   */
  async function prefetchCategoryImages(candidates, categoryId) {
    if (!candidates || !Array.isArray(candidates)) return;
    
    // Process in small batches to avoid hitting AniList rate limits too hard at once
    const batchSize = 3;
    for (let i = 0; i < candidates.length; i += batchSize) {
      const batch = candidates.slice(i, i + batchSize);
      await Promise.allSettled(batch.map(c => resolveCandidateImage(c, categoryId)));
      // Aynı anda devasa patlamalar (burst) yaşanmaması için ufak dinlenme
      await new Promise(r => setTimeout(r, 200));
    }
  }

  /**
   * Arkaplanda (idle) yavaş yavaş TÜM kategorilerin resimlerini indirir.
   * Bu sayede kullanıcı siteyi açtıktan bir süre sonra her şey hazır olur.
   */
  let _bgPrefetchRunning = false;
  async function startBackgroundPrefetch() {
    if (_bgPrefetchRunning || typeof CATEGORIES === 'undefined') return;
    _bgPrefetchRunning = true;
    
    console.log("[AniList] Arkaplan resim ön-yüklemesi (idle prefetch) başladı...");
    
    for (const cat of CATEGORIES) {
      for (const candidate of cat.candidates) {
        // Sunucuyu kızdırmamak ve interneti sömürmemek için her aday arası 1.5 saniye bekle
        await new Promise(r => setTimeout(r, 1500));
        try {
          const url = await resolveCandidateImage(candidate, cat.id);
          if (url) {
            // Resim URL'sini sadece AniList cache'e değil, tarayıcının HTTP önbelleğine de indir!
            const imgUrls = Array.isArray(url) ? url : [url];
            imgUrls.forEach(u => {
              const img = new Image();
              img.src = u; // Bu işlem resmi tarayıcı önbelleğine alır
            });
          }
        } catch (e) {}
      }
    }
    console.log("[AniList] Arkaplan resim ön-yüklemesi tamamlandı.");
  }

  return {
    resolveCandidateImage,
    prefetchCategoryImages,
    fetchImage,
    startBackgroundPrefetch
  };
})();
