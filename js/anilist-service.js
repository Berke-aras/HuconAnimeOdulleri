/**
 * AniList Image Service
 * Fetches cover images for anime and characters using AniList GraphQL API.
 * Includes a caching mechanism to stay within rate limits.
 */

const AniListService = (() => {
  const API_URL = 'https://graphql.anilist.co';
  const CACHE_KEY = 'anilist_image_cache';

  // Local cache to avoid repeated requests in same session
  let _cache = {};
  try {
    const saved = localStorage.getItem(CACHE_KEY);
    if (saved) _cache = JSON.parse(saved);
  } catch (e) { }

  async function queryAniList(query, variables) {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ query, variables })
    });

    if (!response.ok) {
      throw new Error('AniList API error: ' + response.statusText);
    }

    return response.json();
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

    if (_cache[cacheId]) return _cache[cacheId];

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
          _cache[cacheId] = imageUrl;
          saveCache();
          return imageUrl;
        }
      } catch (e) {
        console.warn(`AniList fetch failed for ${searchName}:`, e);
      }
    }

    return null;
  }

  function saveCache() {
    try {
      // Keep cache size manageable
      const keys = Object.keys(_cache);
      if (keys.length > 500) {
        delete _cache[keys[0]];
      }
      localStorage.setItem(CACHE_KEY, JSON.stringify(_cache));
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
    // 0. Hard block for Lazarus (User requirement: Never use AniList for Lazarus, strictly use provided local image)
    const isLazarus = ((candidate.name && candidate.name.toLowerCase().includes('lazarus')) || 
                      (candidate.anime && candidate.anime.toLowerCase().includes('lazarus'))) &&
                      !(candidate.name && candidate.name.toLowerCase().includes('skinner'));
    if (isLazarus) {
      return "img/md3fx6mbxv3f1.jpeg";
    }

    // 1. If it's already a full URL, use it
    if (candidate.image && (candidate.image.startsWith('http') || candidate.image.startsWith('https'))) {
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
    // Check raw override first (e.g. "Haruka (Wind Breaker)")
    const rawOverride = TITLE_OVERRIDES[candidate.name.toLowerCase()];
    if (rawOverride) {
      const url = await fetchImage(rawOverride, searchType);
      if (url) return url;
    }

    const cleanedName = cleanSearchName(candidate.name);
    const cleanedAnime = candidate.anime ? cleanSearchName(candidate.anime) : null;

    // Check cleaned override
    const cleanedOverride = TITLE_OVERRIDES[cleanedName.toLowerCase()];
    const nameToSearch = cleanedOverride || cleanedName;

    // 4. Special handling for Yılın Çifti (dual images)
    if (categoryId.includes('cift')) {
      const names = cleanedName.split(/\s*x\s*|\s*&\s*/i);
      const urls = await Promise.all(names.map(async (n) => {
        const charName = n.trim();
        // Try searching Character + Anime for couples to be safe
        let img = await fetchImage(charName, 'CHARACTER', cleanedAnime ? `${charName} ${cleanedAnime}` : null);
        if (!img && cleanedAnime) img = await fetchImage(cleanedAnime, 'ANIME');
        return img;
      }));
      return urls.filter(u => u != null);
    }

    let url = null;

    if (isCharacter) {
      // Try searching Character + Anime for better accuracy if they are in candidates
      const fallback = cleanedAnime ? `${nameToSearch} ${cleanedAnime}` : null;
      url = await fetchImage(nameToSearch, 'CHARACTER', fallback);

      // Secondary fallback to anime cover if character not found
      if (!url && cleanedAnime) {
        url = await fetchImage(cleanedAnime, 'ANIME');
      }
    } else {
      // For non-characters (Anime, Manga, OP/ED, etc.)

      // Attempt 1: Search by candidate.anime directly
      if (cleanedAnime) {
        url = await fetchImage(cleanedAnime, searchType);
      }

      // Attempt 2: Search by full cleaned name
      if (!url) {
        url = await fetchImage(nameToSearch, searchType);
      }

      // Attempt 3: Stripping song fallback
      if (!url && (cleanedName.includes('—') || cleanedName.includes('-'))) {
        url = await fetchImage(stripSong(cleanedName), searchType);
      }
    }

    return url;
  }

  /**
   * Prefetches images for a whole category to speed up UX.
   */
  async function prefetchCategoryImages(candidates, categoryId) {
    if (!candidates || !Array.isArray(candidates)) return;

    // Process in small batches to avoid hitting AniList rate limits too hard at once
    const batchSize = 5;
    for (let i = 0; i < candidates.length; i += batchSize) {
      const batch = candidates.slice(i, i + batchSize);
      await Promise.all(batch.map(c => resolveCandidateImage(c, categoryId)));
    }
  }

  return {
    resolveCandidateImage,
    prefetchCategoryImages,
    fetchImage
  };
})();
