// ============================================================
// Oylama Mantigi v2
// Pill navigasyon, gecis animasyonlari, gelismis kart sistemi
// ============================================================

let currentCategoryIndex = 0;
let selections = {};
let turnstileWidgetId = null;
let turnstileToken = null;
// Aynı kategoride scroll davranisini sadece ilk secimde calistirmak icin
const scrolledForCategory = {};

// XSS onleme: HTML ozel karakterlerini encode et
function escapeHTML(str) {
  const div = document.createElement('div');
  div.appendChild(document.createTextNode(str));
  return div.innerHTML;
}

function isTouchDevice() {
  return (
    (typeof window !== 'undefined' && 'ontouchstart' in window) ||
    (typeof navigator !== 'undefined' && (
      navigator.maxTouchPoints > 0 ||
      navigator.msMaxTouchPoints > 0
    )) ||
    (typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(pointer: coarse)').matches)
  );
}

function renderTurnstile() {
  const container = document.getElementById('recaptchaWidget');
  if (container && typeof turnstile !== 'undefined' && SITE_CONFIG.turnstileSiteKey) {
    turnstileWidgetId = turnstile.render('#recaptchaWidget', {
      sitekey: SITE_CONFIG.turnstileSiteKey,
      theme: 'dark',
      callback: function(token) {
        turnstileToken = token;
      },
      'expired-callback': function() {
        turnstileToken = null;
      }
    });
  }
}

const ICON_MAP = {
  trophy: '<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>',
  sword: '<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="14.5 17.5 3 6 3 3 6 3 17.5 14.5"/><line x1="13" y1="19" x2="19" y2="13"/><line x1="16" y1="16" x2="20" y2="20"/><line x1="19" y1="21" x2="21" y2="19"/></svg>',
  sparkles: '<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/><path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/></svg>',
  skull: '<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="12" r="1"/><circle cx="15" cy="12" r="1"/><path d="M8 20v2h8v-2"/><path d="m12.5 17-.5-1-.5 1h1z"/><path d="M16 20a2 2 0 0 0 1.56-3.25 8 8 0 1 0-11.12 0A2 2 0 0 0 8 20"/></svg>',
  flame: '<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>',
  heart: '<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>',
  music: '<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>',
  "heart-handshake": '<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/><path d="M12 5 9.04 7.96a2.17 2.17 0 0 0 0 3.08v0c.82.82 2.13.85 3 .07l2.07-1.9a2.82 2.82 0 0 1 3.79 0l2.96 2.66"/><path d="m18 15-2-2"/><path d="m15 18-2-2"/></svg>'
};

function getIconSVG(iconName) {
  return ICON_MAP[iconName] || ICON_MAP.trophy;
}

function buildPillNav() {
  const nav = document.getElementById('pillNav');
  if (!nav) return;
  nav.innerHTML = '';
  CATEGORIES.forEach((cat, i) => {
    const btn = document.createElement('button');
    btn.className = 'pill-btn';
    btn.textContent = cat.title;
    btn.dataset.index = i;
    if (i === currentCategoryIndex) btn.classList.add('active');
    if (selections[cat.id]) btn.classList.add('completed');
    btn.addEventListener('click', () => jumpToCategory(i));
    nav.appendChild(btn);
  });
}

function updatePillNav() {
  const pills = document.querySelectorAll('.pill-btn');
  let activePill = null;
  pills.forEach((pill, i) => {
    const isActive = i === currentCategoryIndex;
    pill.classList.toggle('active', isActive);
    pill.classList.toggle('completed', !!selections[CATEGORIES[i].id] && i !== currentCategoryIndex);
    if (isActive) activePill = pill;
  });
  
  if (activePill) {
    activePill.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  }
}

function jumpToCategory(index) {
  if (index === currentCategoryIndex) return;
  currentCategoryIndex = index;
  renderCategory(true);
}

async function revote() {
  if (!confirm('Oylarınızı sıfırlamak ve tekrar oy vermek istediğinize emin misiniz?')) return;
  try {
    await AntifraudManager.clearLocalVoteData();
    AntifraudManager.enableRevoteMode();
  } catch (e) {}
  window.location.reload();
}

// Antifraud warmup işlemini hemen başlat (arka planda çalışsın)
if (typeof AntifraudManager !== 'undefined') {
  AntifraudManager.warmup();
}

(async function init() {
  const loadingOverlay = document.getElementById('loadingOverlay');
  const initLoadingText = document.getElementById('initLoadingText');
  const alreadyVotedSection = document.getElementById('alreadyVotedSection');
  const voteSection = document.getElementById('voteSection');

  // Güçsüz cihazlar için dönen loading mesajları
  const loadingMessages = ['Kontrol ediliyor...', 'Güvenlik kontrolü yapılıyor...', 'Lütfen bekleyin...', 'Bağlantı sağlanıyor...', 'Neredeyse hazır...'];
  let msgIdx = 0;
  const msgInterval = setInterval(() => {
    msgIdx = (msgIdx + 1) % loadingMessages.length;
    if (initLoadingText) initLoadingText.textContent = loadingMessages[msgIdx];
  }, 1800);

  console.log("Vote UI: Initializing...");
  // --- LAZY INITIALIZATION ---
  // 1. UI'yi hemen hazırla
  buildPillNav();
  renderCategory(false);
  console.log("Vote UI: Initial rendering complete.");
  
  // 2. Arka plan kontrollerini yaparken loading'i kaldır (Hızlı yükleme hissi)
  // Sadece oylamanın başlangıç zamanını kaydet
  if (typeof AntifraudManager !== 'undefined') {
    AntifraudManager.markVotingStarted();
  }

  try {
    // 3. Hızlı Yerel Kontrol (Cookie check)
    const hasVotedFlag = document.cookie.includes('animeoy_v');
    if (hasVotedFlag) {
      clearInterval(msgInterval);
      loadingOverlay.classList.add('hidden');
      alreadyVotedSection.classList.remove('hidden');
      voteSection.classList.add('hidden');
      return;
    }

    // 4. Derin Kontrollere sessizce başla (Loading'i biraz daha tutabiliriz ama UI arkada hazır)
    const votedPromise = AntifraudManager.hasAlreadyVoted();
    
    // UI'yi oylamaya hazır hale getir ama henüz oylama ekranını tam açma 
    // (Eğer zaten oy vermişse saniyeler içinde ekran değişecek)
    const voted = await Promise.race([
      votedPromise,
      new Promise(resolve => setTimeout(() => resolve('timeout'), 8000)) // Güçsüz cihazlar için yeterli süre
    ]);
    
    clearInterval(msgInterval);
    loadingOverlay.classList.add('hidden');

    if (voted === 'timeout') {
      console.warn("Antifraud: Warmup timeout. UI is ready.");
      voteSection.classList.remove('hidden');
      requestAnimationFrame(() => requestAnimationFrame(() => voteSection.classList.add('visible')));
    } else if (voted) {
      if (typeof voted === 'object' && voted.data) {
        const d = voted.data;
        const accessToken = await AntifraudManager.generateAccessToken(d.visitorId, d.cardNumber);
        AntifraudManager.storeVoteData(d.selections, d.cardNumber, accessToken);
        document.getElementById('identityRecoveredSection').classList.remove('hidden');
      } else {
        alreadyVotedSection.classList.remove('hidden');
      }
      voteSection.classList.add('hidden'); // Oylama alanını sakla
      return;
    } else {
      // Sorun yok, oylamaya devam
      voteSection.classList.remove('hidden');
      requestAnimationFrame(() => requestAnimationFrame(() => voteSection.classList.add('visible')));
    }

  } catch (e) {
    clearInterval(msgInterval);
    console.error("Lazy Init Check failed:", e);
    loadingOverlay.classList.add('hidden');

    const code = e.code || "";
    const msg = e.message || "";

    // Firebase kota veya bağlantı sınırı hatası
    if (code === 'resource-exhausted' || code === 'unavailable' || msg.includes('quota') || msg.includes('limit')) {
      document.getElementById('systemBusySection').classList.remove('hidden');
      voteSection.classList.add('hidden');
      return;
    }

    // Eğer Firestore kilitliyse bile (Adblock vb.) oylama ekranını açalım
    voteSection.classList.remove('hidden');
    requestAnimationFrame(() => requestAnimationFrame(() => voteSection.classList.add('visible')));
  }
})();

function renderCategory(animate) {
  const cat = CATEGORIES[currentCategoryIndex];
  const total = CATEGORIES.length;

  document.getElementById('progressCounter').textContent = `${currentCategoryIndex + 1} / ${total}`;
  document.getElementById('progressFill').style.width = `${((currentCategoryIndex + 1) / total) * 100}%`;

  document.getElementById('categoryTitle').innerHTML = getIconSVG(cat.icon) + ' ' + escapeHTML(cat.title);

  const grid = document.getElementById('candidatesGrid');

  if (animate) {
    grid.style.opacity = '0';
    grid.style.transform = 'translateY(16px)';
    // No setTimeout delay needed if we handle it cleanly
    populateGrid(cat, grid);
    requestAnimationFrame(() => {
      grid.style.transition = 'opacity 0.5s cubic-bezier(0.2, 0.8, 0.2, 1), transform 0.5s cubic-bezier(0.2, 0.8, 0.2, 1)';
      grid.style.opacity = '1';
      grid.style.transform = 'translateY(0)';
    });
  } else {
    populateGrid(cat, grid);
  }

  updatePillNav();

  document.getElementById('prevBtn').style.visibility = currentCategoryIndex === 0 ? 'hidden' : 'visible';
  updateNextButton();

  document.getElementById('categoryContent').classList.remove('hidden');
  document.getElementById('confirmSection').classList.add('hidden');
  document.getElementById('progressContainer').classList.remove('hidden');
}

function calcCardSize(candidateCount) {
  const vw = window.innerWidth;
  const isMobile = vw <= 768;

  if (!isMobile) {
    // Masaüstü: maks 6 sütun, 160-220px arası
    const availW = Math.min(vw - 64, 1260);
    const gap = 20;
    const maxCols = Math.min(candidateCount, 6);
    const w = (availW - gap * (maxCols - 1)) / maxCols;
    return Math.max(160, Math.min(w, 220));
  }

  // Mobil: kesin sütun sayısı belirle
  // ≤400px → max 2 sütun | 401-600px → max 3 sütun | 601-768px → max 3 sütun
  const maxCols = vw <= 400 ? 2 : 3;
  const cols = Math.min(candidateCount, maxCols);
  const gap = 10;
  const padding = 16; // her iki yandan padding (8 + 8)
  const availW = vw - padding * 2;
  const cardW = (availW - gap * (cols - 1)) / cols;

  // Minimum 100px, maximum 180px
  return Math.max(100, Math.min(cardW, 180));
}


function populateGrid(cat, grid) {
  grid.innerHTML = '';

  const cardW = calcCardSize(cat.candidates.length);
  grid.style.setProperty('--card-w', cardW + 'px');

  cat.candidates.forEach((candidate, idx) => {
    const card = document.createElement('div');
    card.className = 'candidate-card';
    card.style.animation = `fadeInUp 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) ${idx * 0.03}s forwards`;
    card.style.opacity = '0';
    if (selections[cat.id] === candidate.id) {
      card.classList.add('selected');
    }

    const initials = escapeHTML(candidate.name.split(' ').map(w => w[0]).join('').substring(0, 2));

    card.innerHTML = `
      <div class="candidate-check">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
      </div>
      <div class="candidate-image-container" style="overflow:hidden; position:relative; width:100%; aspect-ratio: 3/4; display: flex;">
        <div class="candidate-image-wrapper" style="width:100%; height:100%; position:relative; display:flex;">
           <img
            class="candidate-image"
            src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"
            alt="${escapeHTML(candidate.name)}"
            style="opacity: 0; transition: opacity 0.5s ease; width:100%; height:100%; object-fit:cover;"
            onerror="this.style.display='none'; if(!this.parentElement.querySelector('.candidate-image-placeholder')) this.parentElement.insertAdjacentHTML('beforeend', '<div class=\'candidate-image-placeholder\' style=\'display:flex;\'>${initials}</div>');"
          >
        </div>
        <div class="candidate-image-placeholder" style="display:flex;">${initials}</div>
      </div>
      <div class="candidate-info">
        <h3>${escapeHTML(candidate.name)}</h3>
        <span class="anime-name">${escapeHTML(candidate.anime)}</span>
      </div>
    `;

    // Lazy loading yerine doğrudan başlat (AniListService zaten deduplication ve caching yapıyor)
    loadCandidateImage(card, candidate, cat.id);

    card.addEventListener('click', () => selectCandidate(cat.id, candidate.id, card));
    grid.appendChild(card);
  });

  // Arkaplanda bir sonraki kategorinin resimlerini on yukle (UX hızlandırma)
  const nextCatIdx = CATEGORIES.findIndex(c => c.id === cat.id) + 1;
  if (nextCatIdx < CATEGORIES.length) {
    const nextCat = CATEGORIES[nextCatIdx];
    setTimeout(() => {
      AniListService.prefetchCategoryImages(nextCat.candidates, nextCat.id);
    }, 1000);
  }
}

/**
 * Modern asenkron resim yükleme ve UI güncelleme mantığı
 */
async function loadCandidateImage(card, candidate, categoryId) {
  const imageUrl = await AniListService.resolveCandidateImage(candidate, categoryId);
  const img = card.querySelector('.candidate-image');
  const placeholder = card.querySelector('.candidate-image-placeholder');
  const wrapper = card.querySelector('.candidate-image-wrapper');
  
  if (!imageUrl) {
    if (img) img.onerror();
    return;
  }

  if (Array.isArray(imageUrl) && imageUrl.length > 1) {
    // Çiftler için iki resim göster
    wrapper.innerHTML = '';
    const promises = imageUrl.map((url, index) => {
      return new Promise(resolve => {
        const sideImg = document.createElement('img');
        sideImg.className = 'candidate-image';
        sideImg.src = url;
        sideImg.style.cssText = `width:50%; height:100%; object-fit:cover; transition: opacity 0.5s ease; opacity: 0; ${index === 0 ? 'border-right:1px solid rgba(255,255,255,0.1)' : ''}`;
        sideImg.onload = () => {
          sideImg.style.opacity = '1';
          resolve();
        };
        wrapper.appendChild(sideImg);
      });
    });
    await Promise.all(promises);
    placeholder.style.display = 'none';
  } else {
    // Tek resim
    const finalUrl = Array.isArray(imageUrl) ? imageUrl[0] : imageUrl;
    
    // Güvenli yükleme (cached olsa bile load veya error fırlatır)
    img.onload = () => {
      img.style.opacity = '1';
      placeholder.style.display = 'none';
      wrapper.style.backgroundColor = 'transparent';
    };
    img.src = finalUrl;
  }
}

function selectCandidate(categoryId, candidateId, cardElement) {
  selections[categoryId] = candidateId;
  document.querySelectorAll('.candidate-card').forEach(c => c.classList.remove('selected'));
  cardElement.classList.add('selected');
  updateNextButton();
  updatePillNav();

  updateNextButton();
  updatePillNav();
}

function updateNextButton() {
  const cat = CATEGORIES[currentCategoryIndex];
  const btn = document.getElementById('nextBtn');
  btn.disabled = !selections[cat.id];

  if (currentCategoryIndex === CATEGORIES.length - 1) {
    btn.innerHTML = `
      Onayla
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="20 6 9 17 4 12"/>
      </svg>
    `;
  } else {
    btn.innerHTML = `
      Sonraki
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
      </svg>
    `;
  }
}

function goNext() {
  const cat = CATEGORIES[currentCategoryIndex];
  if (!selections[cat.id]) return;

  if (currentCategoryIndex < CATEGORIES.length - 1) {
    currentCategoryIndex++;
    renderCategory(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } else {
    showConfirmScreen();
  }
}

function goBack() {
  if (currentCategoryIndex > 0) {
    currentCategoryIndex--;
    renderCategory(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

function showConfirmScreen() {
  document.getElementById('categoryContent').classList.add('hidden');
  document.getElementById('progressContainer').classList.add('hidden');
  document.getElementById('confirmSection').classList.remove('hidden');

  const list = document.getElementById('confirmList');
  list.innerHTML = '';

  CATEGORIES.forEach((cat, idx) => {
    const selectedId = selections[cat.id];
    const candidate = cat.candidates.find(c => c.id === selectedId);
    if (!candidate) return;

    const initials = escapeHTML(candidate.name.split(' ').map(w => w[0]).join('').substring(0, 2));

    const item = document.createElement('div');
    item.className = 'confirm-item';
    item.style.animation = `fadeInUp 0.4s ease ${idx * 0.05}s forwards`;
    item.style.opacity = '0';
    item.innerHTML = `
      <img
        class="confirm-item-img"
        src="${escapeHTML(candidate.image)}"
        alt="${escapeHTML(candidate.name)}"
        onerror="this.style.display='none';this.nextElementSibling.style.display='flex';"
      >
      <div class="confirm-item-img-placeholder" style="display:none;">${initials}</div>
      <div class="confirm-item-text">
        <div class="confirm-item-category">${escapeHTML(cat.title)}</div>
        <div class="confirm-item-name">${escapeHTML(candidate.name)}</div>
      </div>
    `;
    list.appendChild(item);
  });

  // Turnstile widget'ini onay ekraninda renderla
  setTimeout(() => {
    renderTurnstile();
    // KVKK checkbox dinleyici ekle
    const checkbox = document.getElementById('kvkkCheckbox');
    if (checkbox) {
      checkbox.checked = false; // Reset on screen show
      checkbox.addEventListener('change', updateSubmitButtonState);
      updateSubmitButtonState();
    }
  }, 100);
}

function backToVoting() {
  currentCategoryIndex = CATEGORIES.length - 1;
  renderCategory(true);
}

function updateSubmitButtonState() {
  const checkbox = document.getElementById('kvkkCheckbox');
  const submitBtn = document.getElementById('submitBtn');
  if (checkbox && submitBtn) {
    submitBtn.disabled = !checkbox.checked;
    submitBtn.style.opacity = checkbox.checked ? '1' : '0.5';
  }
}

async function submitVotes() {
  const submitBtn = document.getElementById('submitBtn');

  if (typeof turnstile !== 'undefined' && turnstileWidgetId !== null) {
    if (!turnstileToken) {
      const recaptchaContainer = document.getElementById('recaptchaContainer');
      recaptchaContainer.style.outline = '2px solid #ef4444';
      recaptchaContainer.style.outlineOffset = '4px';
      recaptchaContainer.style.borderRadius = '8px';
      /* recaptchaContainer.scrollIntoView({ behavior: 'smooth', block: 'center' }); */
      setTimeout(() => { recaptchaContainer.style.outline = 'none'; }, 3000);
      return;
    }
  }

  const checkbox = document.getElementById('kvkkCheckbox');
  if (checkbox && !checkbox.checked) {
    alert('Lütfen Aydınlatma Metni\'ni onaylayın.');
    return;
  }

  submitBtn.disabled = true;
  const overlay = document.getElementById('submitOverlay');
  const loadingText = overlay.querySelector('.loading-text');
  
  overlay.classList.remove('hidden');

  try {
    let forceFallback = false;
    let fallbackTimeout = null;

    // Karmaşık Arka Plan Bekleme Mantığı (UI Desteğiyle)
    if (typeof AntifraudManager !== 'undefined' && AntifraudManager.warmup) {
      const warmupPromise = AntifraudManager.warmup();
      
      // 15 saniyelik "Zorunlu Geçiş" sayacı
      const timeoutPromise = new Promise(resolve => {
        fallbackTimeout = setTimeout(() => {
          console.warn("Submission: Background checks timed out. Forcing fallback.");
          forceFallback = true;
          loadingText.textContent = "Bağlantı zayıf, güvenli modda gönderiliyor...";
          resolve('timeout');
        }, 15000);
      });

      // Warmup bittiğinde yazıyı güncelle
      warmupPromise.then(() => {
        if (!overlay.classList.contains('hidden') && !forceFallback) {
          loadingText.textContent = "Oylarınız gönderiliyor...";
          if (fallbackTimeout) clearTimeout(fallbackTimeout);
        }
      });

      // Önce warmup'ı bekle (Max 15 sn)
      await Promise.race([warmupPromise, timeoutPromise]);
    }

    const result = await AntifraudManager.submitVote(selections, forceFallback);

    const accessToken = await AntifraudManager.generateAccessToken(
      result.visitorId, result.cardNumber
    );
    AntifraudManager.storeVoteData(selections, result.cardNumber, accessToken);

    window.location.href = 'hatira.html';
  } catch (e) {
    document.getElementById('submitOverlay').classList.add('hidden');
    submitBtn.disabled = false;
    if (typeof turnstile !== 'undefined' && turnstileWidgetId !== null) {
      turnstile.reset(turnstileWidgetId);
      turnstileToken = null;
    }

    if (e.message.includes('zaten')) {
      document.getElementById('voteSection').classList.add('hidden');
      document.getElementById('alreadyVotedSection').classList.remove('hidden');
    } else {
      alert(e.message || 'Bir hata oluştu. Lütfen tekrar deneyin.');
    }
  }
}
