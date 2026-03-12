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
  pills.forEach((pill, i) => {
    pill.classList.toggle('active', i === currentCategoryIndex);
    pill.classList.toggle('completed', !!selections[CATEGORIES[i].id] && i !== currentCategoryIndex);
  });
  const activePill = document.querySelector('.pill-btn.active');
  if (activePill) activePill.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
}

function jumpToCategory(index) {
  if (index === currentCategoryIndex) return;
  currentCategoryIndex = index;
  renderCategory(true);
}

async function revote() {
  if (!confirm('Oylarinizi sifirlamak ve tekrar oy vermek istediginize emin misiniz?')) return;
  try {
    await AntifraudManager.clearLocalVoteData();
  } catch (e) {}
  window.location.reload();
}

(async function init() {
  try {
    const voted = await AntifraudManager.hasAlreadyVoted();
    document.getElementById('loadingOverlay').classList.add('hidden');

    if (voted) {
      document.getElementById('alreadyVotedSection').classList.remove('hidden');
      return;
    }

    AntifraudManager.markVotingStarted();
    document.getElementById('voteSection').classList.remove('hidden');
    buildPillNav();
    renderCategory(false);
  } catch (e) {
    document.getElementById('loadingOverlay').classList.add('hidden');
    document.getElementById('errorSection').classList.remove('hidden');
  }
})();

function renderCategory(animate) {
  const cat = CATEGORIES[currentCategoryIndex];
  const total = CATEGORIES.length;

  document.getElementById('progressCategoryName').textContent = cat.title;
  document.getElementById('progressCounter').textContent = `${currentCategoryIndex + 1} / ${total}`;
  document.getElementById('progressFill').style.width = `${((currentCategoryIndex + 1) / total) * 100}%`;

  document.getElementById('categoryTitle').innerHTML = getIconSVG(cat.icon) + ' ' + cat.title;

  const grid = document.getElementById('candidatesGrid');

  if (animate) {
    grid.style.opacity = '0';
    grid.style.transform = 'translateX(24px)';
    setTimeout(() => {
      populateGrid(cat, grid);
      grid.style.transition = 'opacity 0.35s ease, transform 0.35s ease';
      grid.style.opacity = '1';
      grid.style.transform = 'translateX(0)';
    }, 150);
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
  const vh = window.innerHeight;
  const isMobile = vw <= 768;

  if (!isMobile) {
    const availW = Math.min(vw - 64, 1260);
    const gap = 20;
    const maxCols = Math.min(candidateCount, 6);
    const w = (availW - gap * (maxCols - 1)) / maxCols;
    return Math.max(160, Math.min(w, 220));
  }

  const chromeH = vw <= 400 ? 210 : 220;
  const availH = Math.max(80, vh - chromeH);
  const availW = vw - 20;
  const gap = 10;
  const infoH = vw <= 400 ? 40 : 48;
  const aspect = 3 / 4;
  const cols = 2;
  const rows = Math.ceil(candidateCount / cols);
  const wByWidth = (availW - gap * (cols - 1)) / cols;
  const cardTotalH = (availH - gap * (rows - 1)) / rows;
  const wByHeight = Math.max(0, cardTotalH - infoH) * aspect;
  const w = Math.min(wByWidth, wByHeight);
  return Math.max(80, Math.min(w, 160));
}

function populateGrid(cat, grid) {
  grid.innerHTML = '';

  const cardW = calcCardSize(cat.candidates.length);
  grid.style.setProperty('--card-w', cardW + 'px');

  cat.candidates.forEach((candidate, idx) => {
    const card = document.createElement('div');
    card.className = 'candidate-card';
    card.style.animationDelay = `${idx * 0.05}s`;
    if (selections[cat.id] === candidate.id) {
      card.classList.add('selected');
    }

    const initials = candidate.name.split(' ').map(w => w[0]).join('').substring(0, 2);

    card.innerHTML = `
      <div class="candidate-check">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
      </div>
      <div style="overflow:hidden;">
        <img
          class="candidate-image"
          src="${candidate.image}"
          alt="${candidate.name}"
          onerror="this.style.display='none';this.parentElement.querySelector('.candidate-image-placeholder').style.display='flex';"
          loading="lazy"
        >
        <div class="candidate-image-placeholder" style="display:none;">${initials}</div>
      </div>
      <div class="candidate-info">
        <h3>${candidate.name}</h3>
        <span class="anime-name">${candidate.anime}</span>
      </div>
    `;

    card.addEventListener('click', () => selectCandidate(cat.id, candidate.id, card));
    grid.appendChild(card);
  });
}

function selectCandidate(categoryId, candidateId, cardElement) {
  selections[categoryId] = candidateId;
  document.querySelectorAll('.candidate-card').forEach(c => c.classList.remove('selected'));
  cardElement.classList.add('selected');
  updateNextButton();
  updatePillNav();

  setTimeout(() => {
    const btn = document.getElementById('nextBtn');
    if (!btn) return;

    const isMobile = isTouchDevice();

    // Mobilde her secimde butona kaydir (kullanim kolayligi icin)
    if (isMobile) {
      btn.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    // PC'de her kategoride sadece ilk secimde ve buton ekranda asagi tarafta ise kaydir
    if (scrolledForCategory[categoryId]) return;

    const rect = btn.getBoundingClientRect();
    const vh = window.innerHeight || document.documentElement.clientHeight;
    const shouldScrollDown = rect.bottom > vh; // sadece buton ekranin altinda ise

    if (shouldScrollDown) {
      btn.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    scrolledForCategory[categoryId] = true;
  }, 300);
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
  } else {
    showConfirmScreen();
  }
}

function goBack() {
  if (currentCategoryIndex > 0) {
    currentCategoryIndex--;
    renderCategory(true);
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

    const initials = candidate.name.split(' ').map(w => w[0]).join('').substring(0, 2);

    const item = document.createElement('div');
    item.className = 'confirm-item';
    item.style.animation = `fadeInUp 0.4s ease ${idx * 0.05}s forwards`;
    item.style.opacity = '0';
    item.innerHTML = `
      <img
        class="confirm-item-img"
        src="${candidate.image}"
        alt="${candidate.name}"
        onerror="this.style.display='none';this.nextElementSibling.style.display='flex';"
      >
      <div class="confirm-item-img-placeholder" style="display:none;">${initials}</div>
      <div class="confirm-item-text">
        <div class="confirm-item-category">${cat.title}</div>
        <div class="confirm-item-name">${candidate.name}</div>
      </div>
    `;
    list.appendChild(item);
  });

  // Turnstile widget'ini onay ekraninda renderla
  setTimeout(() => renderTurnstile(), 100);
}

function backToVoting() {
  currentCategoryIndex = CATEGORIES.length - 1;
  renderCategory(true);
}

async function submitVotes() {
  const submitBtn = document.getElementById('submitBtn');

  if (typeof turnstile !== 'undefined' && turnstileWidgetId !== null) {
    if (!turnstileToken) {
      const recaptchaContainer = document.getElementById('recaptchaContainer');
      recaptchaContainer.style.outline = '2px solid #ef4444';
      recaptchaContainer.style.outlineOffset = '4px';
      recaptchaContainer.style.borderRadius = '8px';
      recaptchaContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setTimeout(() => { recaptchaContainer.style.outline = 'none'; }, 3000);
      return;
    }
  }

  submitBtn.disabled = true;
  document.getElementById('submitOverlay').classList.remove('hidden');

  try {
    const result = await AntifraudManager.submitVote(selections);

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
      alert('Bir hata olustu: ' + e.message + '\nLutfen tekrar deneyin.');
    }
  }
}
