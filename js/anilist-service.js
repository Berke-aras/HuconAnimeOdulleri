/**
 * AniList Image Service
 * Fetches cover images for anime and characters using AniList GraphQL API.
 * Includes a caching mechanism to stay within rate limits.
 */

const AniListService = (() => {
  // GraphQL connection entirely severed for performance on low-end devices.
  async function fetchImage(name, type, fallback) {
    return null; // Harici servis devre dışı
  }

  /**
   * Resolves a candidate's image URL locally.
   */
  async function resolveCandidateImage(candidate, categoryId) {
    if (!candidate) return null;

    // YEREL SUNUCU (IMAGE_MAP) KONTROLÜ
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

    // 1. If it's already a provided image url
    if (candidate.image && typeof candidate.image === 'string' && candidate.image.trim() !== "") {
      return candidate.image;
    }

    // Harici AniList GraphQL servisleri performans için kalıcı olarak devre dışı bırakıldı.
    // Herhangi bir haritalanmamış görsel varsa null dönecektir ve varsayılan placeholder gösterilecektir.
    return null; 
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
      
      // Sadece dışarıdan (AniList üzerinden) yüklenecek olanlar varsa bekleme süresi koyalım
      const requiresApi = batch.some(c => {
        const mapKey = categoryId + '_' + c.id;
        return !(typeof IMAGE_MAP !== 'undefined' && IMAGE_MAP[mapKey]) && !c.image;
      });

      await Promise.allSettled(batch.map(c => resolveCandidateImage(c, categoryId)));
      
      // Aynı anda devasa patlamalar (burst) yaşanmaması için ufak dinlenme (sadece apiye ihtiyaç varsa)
      if (requiresApi) {
        await new Promise(r => setTimeout(r, 200));
      }
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
        const mapKey = cat.id + '_' + candidate.id;
        const isLocal = (typeof IMAGE_MAP !== 'undefined' && IMAGE_MAP[mapKey]) || candidate.image;
        
        // Sunucuyu kızdırmamak ve interneti sömürmemek için sadece AniList e giden isteklerde bekle
        if (!isLocal) {
          await new Promise(r => setTimeout(r, 1500));
        } else {
          await new Promise(r => setTimeout(r, 10)); // Çok kısa beklet
        }
        
        try {
          const url = await resolveCandidateImage(candidate, cat.id);
          if (url) {
            // Resim URL'sini tarayıcının HTTP önbelleğine ardışık (sequential) olarak indir
            // Aynı anda 200 istek atıp ağ kuyruğunu (stalled) tıkamamak için tamamlanmasını bekle
            const imgUrls = Array.isArray(url) ? url : [url];
            const loadPromises = imgUrls.map(u => {
              return new Promise(resolve => {
                const img = new Image();
                // Yüklendiğinde veya hata verdiğinde beklemeden çık ki sonraki resme geçsin
                img.onload = () => resolve();
                img.onerror = () => resolve();
                img.src = u;
              });
            });
            // Resimlerin fiziksel olarak inmesini bekle
            await Promise.all(loadPromises);
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
