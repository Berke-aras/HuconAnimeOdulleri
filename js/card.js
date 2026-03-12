// ============================================================
// Hatira Karti - Canvas Tabanli Cizim
// Ozel arka plan PNG + ustune numara & secimler + aday resimleri
// PNG ve PDF olarak indirilebilir
// ============================================================

const CARD_W = 1080;
const CARD_H = 1920;
const CARD_PAD = 60;
const THUMB_SIZE = 52;

const COLORS = {
  bg: '#0c0c24',
  overlayBg: 'rgba(10, 10, 30, 0.82)',
  title: '#ffffff',
  number: '#a855f7',
  numberGlow: 'rgba(168, 85, 247, 0.6)',
  label: '#9999bb',
  catName: '#666688',
  selName: '#eeeeff',
  divider: 'rgba(124, 58, 237, 0.3)',
  dot: ['#7c3aed', '#ec4899', '#06b6d4', '#f59e0b', '#10b981', '#8b5cf6', '#ef4444', '#3b82f6'],
  footer: '#666688'
};

let _cardCanvas = null;

function getVoteData() {
  const _k = btoa("animeoy").slice(0, 6);
  const key = _k + "_sel";
  try {
    let raw = localStorage.getItem(key);
    if (!raw) {
      try { raw = sessionStorage.getItem(key); } catch (e) {}
    }
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Resim yuklenemedi: ' + src));
    img.src = src;
  });
}

function loadImageSafe(src) {
  return loadImage(src).catch(() => null);
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function drawRoundedImage(ctx, img, x, y, size, radius) {
  ctx.save();
  roundRect(ctx, x, y, size, size, radius);
  ctx.clip();
  ctx.drawImage(img, x, y, size, size);
  ctx.restore();

  ctx.strokeStyle = 'rgba(255,255,255,0.15)';
  ctx.lineWidth = 2;
  roundRect(ctx, x, y, size, size, radius);
  ctx.stroke();
}

function drawInitialsThumb(ctx, initials, x, y, size, radius, color) {
  ctx.save();
  roundRect(ctx, x, y, size, size, radius);
  ctx.fillStyle = color + '33';
  ctx.fill();
  ctx.restore();

  ctx.strokeStyle = color + '66';
  ctx.lineWidth = 2;
  roundRect(ctx, x, y, size, size, radius);
  ctx.stroke();

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = 'bold 22px Outfit, sans-serif';
  ctx.fillStyle = color;
  ctx.fillText(initials, x + size / 2, y + size / 2);
  ctx.textBaseline = 'alphabetic';
}

async function renderCard(data) {
  const canvas = document.getElementById('cardCanvas');
  canvas.width = CARD_W;
  canvas.height = CARD_H;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = COLORS.bg;
  ctx.fillRect(0, 0, CARD_W, CARD_H);

  let hasBg = false;
  if (SITE_CONFIG.cardBackground) {
    try {
      const bgImg = await loadImage(SITE_CONFIG.cardBackground);
      ctx.drawImage(bgImg, 0, 0, CARD_W, CARD_H);
      hasBg = true;
    } catch (e) {
      console.warn('Arka plan resmi yuklenemedi, varsayilan kullaniliyor.');
    }
  }

  if (!hasBg) {
    drawDefaultBackground(ctx);
  }

  // Secim verilerini hazirla ve resimleri onceden yukle
  const selections = [];
  const imagePromises = [];

  CATEGORIES.forEach((cat, idx) => {
    const selectedId = data.selections[cat.id];
    if (!selectedId) return;
    const candidate = cat.candidates.find(c => c.id === selectedId);
    if (!candidate) return;

    const initials = candidate.name.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();
    const sel = {
      cat: cat.title,
      name: candidate.name,
      color: COLORS.dot[idx % COLORS.dot.length],
      image: null,
      initials: initials
    };
    selections.push(sel);

    const imgPromise = loadImageSafe(candidate.image).then(img => { sel.image = img; });
    imagePromises.push(imgPromise);
  });

  await Promise.all(imagePromises);

  drawNumberSection(ctx, data, hasBg);
  drawSelectionsSection(ctx, data, hasBg, selections);

  _cardCanvas = canvas;
}

function drawDefaultBackground(ctx) {
  const g1 = ctx.createRadialGradient(CARD_W * 0.5, 0, 0, CARD_W * 0.5, 0, CARD_H * 0.6);
  g1.addColorStop(0, 'rgba(124, 58, 237, 0.15)');
  g1.addColorStop(1, 'transparent');
  ctx.fillStyle = g1;
  ctx.fillRect(0, 0, CARD_W, CARD_H);

  const g2 = ctx.createRadialGradient(CARD_W * 0.8, CARD_H, 0, CARD_W * 0.8, CARD_H, CARD_H * 0.5);
  g2.addColorStop(0, 'rgba(236, 72, 153, 0.1)');
  g2.addColorStop(1, 'transparent');
  ctx.fillStyle = g2;
  ctx.fillRect(0, 0, CARD_W, CARD_H);

  const strip = ctx.createLinearGradient(0, 0, CARD_W, 0);
  strip.addColorStop(0, '#7c3aed');
  strip.addColorStop(0.33, '#ec4899');
  strip.addColorStop(0.66, '#06b6d4');
  strip.addColorStop(1, '#7c3aed');
  ctx.fillStyle = strip;
  ctx.fillRect(0, 0, CARD_W, 8);

  ctx.textAlign = 'center';
  ctx.fillStyle = 'rgba(255,255,255,0.06)';
  ctx.font = 'bold 120px Outfit, sans-serif';
  ctx.fillText(SITE_CONFIG.title.toUpperCase(), CARD_W / 2, CARD_H / 2 + 40);
}

function drawNumberSection(ctx, data, hasBg) {
  const numStr = '#' + String(data.cardNumber).padStart(4, '0');
  const sectionH = 320;

  roundRect(ctx, CARD_PAD, CARD_PAD, CARD_W - CARD_PAD * 2, sectionH, 24);
  ctx.fillStyle = hasBg ? COLORS.overlayBg : 'rgba(10, 10, 30, 0.6)';
  ctx.fill();

  ctx.textAlign = 'center';
  ctx.font = '600 28px Outfit, sans-serif';
  ctx.fillStyle = COLORS.label;
  ctx.letterSpacing = '8px';
  ctx.fillText('KATILIMCI', CARD_W / 2, CARD_PAD + 80);
  ctx.letterSpacing = '0px';

  ctx.font = 'bold 110px Outfit, sans-serif';
  ctx.shadowColor = COLORS.numberGlow;
  ctx.shadowBlur = 40;
  ctx.fillStyle = COLORS.number;
  ctx.fillText(numStr, CARD_W / 2, CARD_PAD + 210);
  ctx.shadowBlur = 0;

  ctx.font = '500 24px Outfit, sans-serif';
  ctx.fillStyle = COLORS.footer;
  ctx.letterSpacing = '4px';
  ctx.fillText(SITE_CONFIG.eventName.toUpperCase(), CARD_W / 2, CARD_PAD + 280);
  ctx.letterSpacing = '0px';
}

function drawSelectionsSection(ctx, data, hasBg, selections) {
  const cols = 2;
  const colGap = 16;
  const innerPad = 24;
  const cellH = 100;
  const cellGap = 12;
  const cellThumb = 60;
  const cellRadius = 14;
  const headerH = 70;
  const footerH = 60;

  const rows = Math.ceil(selections.length / cols);
  const gridH = rows * cellH + (rows - 1) * cellGap;
  const sectionH = headerH + gridH + footerH + innerPad * 2;
  const sectionY = CARD_H - CARD_PAD - sectionH;
  const contentW = CARD_W - CARD_PAD * 2;

  // Ana overlay kutusu
  roundRect(ctx, CARD_PAD, sectionY, contentW, sectionH, 24);
  ctx.fillStyle = hasBg ? COLORS.overlayBg : 'rgba(10, 10, 30, 0.6)';
  ctx.fill();

  // "SECIMLERIM" baslik
  const headerY = sectionY + headerH / 2 + innerPad;
  const centerX = CARD_W / 2;
  const lineW = 120;
  const textW = 200;

  ctx.strokeStyle = COLORS.divider;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(centerX - textW / 2 - lineW, headerY);
  ctx.lineTo(centerX - textW / 2 - 10, headerY);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(centerX + textW / 2 + 10, headerY);
  ctx.lineTo(centerX + textW / 2 + lineW, headerY);
  ctx.stroke();

  ctx.fillStyle = COLORS.number;
  ctx.beginPath(); ctx.arc(centerX - textW / 2 - lineW - 6, headerY, 4, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(centerX + textW / 2 + lineW + 6, headerY, 4, 0, Math.PI * 2); ctx.fill();

  ctx.textAlign = 'center';
  ctx.font = 'bold 22px Outfit, sans-serif';
  ctx.fillStyle = COLORS.label;
  ctx.letterSpacing = '6px';
  ctx.fillText('SECIMLERIM', centerX, headerY + 6);
  ctx.letterSpacing = '0px';

  // 2 sutunlu grid
  const gridStartX = CARD_PAD + innerPad;
  const gridStartY = sectionY + headerH + innerPad + 10;
  const colW = (contentW - innerPad * 2 - colGap) / cols;

  selections.forEach((sel, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const cellX = gridStartX + col * (colW + colGap);
    const cellY = gridStartY + row * (cellH + cellGap);

    // Hucre arka plani
    roundRect(ctx, cellX, cellY, colW, cellH, cellRadius);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
    ctx.fill();
    ctx.strokeStyle = sel.color + '25';
    ctx.lineWidth = 1;
    roundRect(ctx, cellX, cellY, colW, cellH, cellRadius);
    ctx.stroke();

    // Sol kenar renk aksani
    roundRect(ctx, cellX, cellY, 4, cellH, 2);
    ctx.fillStyle = sel.color + '99';
    ctx.fill();

    // Thumbnail
    const thumbPad = 14;
    const thumbX = cellX + thumbPad + 6;
    const thumbY = cellY + (cellH - cellThumb) / 2;

    if (sel.image) {
      drawRoundedImage(ctx, sel.image, thumbX, thumbY, cellThumb, 10);
    } else {
      drawInitialsThumb(ctx, sel.initials, thumbX, thumbY, cellThumb, 10, sel.color);
    }

    // Metin alani
    const txtX = thumbX + cellThumb + 14;
    const txtMaxW = colW - cellThumb - thumbPad - 34;

    // Kategori adi
    ctx.textAlign = 'left';
    ctx.font = '500 18px Outfit, sans-serif';
    ctx.fillStyle = COLORS.catName;
    ctx.fillText(truncateText(ctx, sel.cat.toUpperCase(), txtMaxW), txtX, cellY + 38);

    // Aday adi
    ctx.font = 'bold 26px Outfit, sans-serif';
    ctx.fillStyle = COLORS.selName;
    ctx.fillText(truncateText(ctx, sel.name, txtMaxW), txtX, cellY + 68);
  });

  // Footer
  const footerY = gridStartY + gridH + 16;
  const grad = ctx.createLinearGradient(gridStartX, footerY, CARD_W - CARD_PAD - innerPad, footerY);
  grad.addColorStop(0, 'transparent');
  grad.addColorStop(0.5, COLORS.divider);
  grad.addColorStop(1, 'transparent');
  ctx.strokeStyle = grad;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(gridStartX, footerY);
  ctx.lineTo(CARD_W - CARD_PAD - innerPad, footerY);
  ctx.stroke();

  ctx.textAlign = 'center';
  ctx.font = '500 20px Outfit, sans-serif';
  ctx.fillStyle = COLORS.footer;
  const footerText = SITE_CONFIG.eventName + '  |  Katilimci #' + String(data.cardNumber).padStart(4, '0');
  ctx.fillText(footerText, centerX, footerY + 34);
}

function truncateText(ctx, text, maxW) {
  if (ctx.measureText(text).width <= maxW) return text;
  let t = text;
  while (t.length > 0 && ctx.measureText(t + '...').width > maxW) {
    t = t.slice(0, -1);
  }
  return t + '...';
}

function downloadPNG() {
  if (!_cardCanvas) return;
  const btn = document.getElementById('downloadPngBtn');
  btn.disabled = true;
  try {
    const link = document.createElement('a');
    const num = String(_voteData.cardNumber).padStart(4, '0');
    link.download = `anime-oylama-hatira-${num}.png`;
    link.href = _cardCanvas.toDataURL('image/png');
    link.click();
  } catch (e) {
    console.error('PNG indirme hatasi:', e);
    alert('PNG indirilemedi. Ekran goruntusu alin.');
  } finally {
    btn.disabled = false;
  }
}

function downloadPDF() {
  if (!_cardCanvas) return;
  const btn = document.getElementById('downloadPdfBtn');
  btn.disabled = true;
  try {
    const { jsPDF } = window.jspdf;
    const imgData = _cardCanvas.toDataURL('image/png');
    const pxToMm = 0.264583;
    const pdfW = CARD_W * pxToMm;
    const pdfH = CARD_H * pxToMm;
    const pdf = new jsPDF({
      orientation: pdfH > pdfW ? 'portrait' : 'landscape',
      unit: 'mm',
      format: [pdfW, pdfH]
    });
    pdf.addImage(imgData, 'PNG', 0, 0, pdfW, pdfH);
    const num = String(_voteData.cardNumber).padStart(4, '0');
    pdf.save(`anime-oylama-hatira-${num}.pdf`);
  } catch (e) {
    console.error('PDF indirme hatasi:', e);
    alert('PDF indirilemedi. PNG olarak indirmeyi deneyin.');
  } finally {
    btn.disabled = false;
  }
}

// ============================================================
// Sosyal Medya Paylasim
// ============================================================

const SHARE_TEXT = SITE_CONFIG.eventName + ' anime oylamamda secimlerim!';
const SHARE_HASHTAGS = 'HUCON26,anime,oylama';

function getCardBlob() {
  return new Promise((resolve) => {
    _cardCanvas.toBlob((blob) => resolve(blob), 'image/png');
  });
}

async function shareNative() {
  if (!_cardCanvas) return;
  try {
    const blob = await getCardBlob();
    const num = String(_voteData.cardNumber).padStart(4, '0');
    const file = new File([blob], `hatira-karti-${num}.png`, { type: 'image/png' });

    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({
        title: SITE_CONFIG.eventName + ' Hatira Karti',
        text: SHARE_TEXT,
        files: [file]
      });
    }
  } catch (e) {
    if (e.name !== 'AbortError') {
      console.error('Paylasim hatasi:', e);
    }
  }
}

async function shareInstagram() {
  if (!_cardCanvas) return;

  if (/Android|iPhone|iPad/i.test(navigator.userAgent) && navigator.share) {
    await shareNative();
    return;
  }

  try {
    const blob = await getCardBlob();
    await navigator.clipboard.write([
      new ClipboardItem({ 'image/png': blob })
    ]);
    showShareToast('Kart kopyalandi! Instagram\'a yapistirabilirsin.');
  } catch (e) {
    downloadPNG();
    showShareToast('Kart indirildi! Instagram\'da hikaye veya gonderi olarak paylas.');
  }
}

async function shareTikTok() {
  if (!_cardCanvas) return;

  if (/Android|iPhone|iPad/i.test(navigator.userAgent) && navigator.share) {
    await shareNative();
    return;
  }

  try {
    const blob = await getCardBlob();
    await navigator.clipboard.write([
      new ClipboardItem({ 'image/png': blob })
    ]);
    showShareToast('Kart kopyalandi! TikTok\'a yapistirabilirsin.');
  } catch (e) {
    downloadPNG();
    showShareToast('Kart indirildi! TikTok\'ta paylas.');
  }
}

function shareX() {
  const siteUrl = window.location.origin || 'https://anime-oylama.github.io';
  const text = encodeURIComponent(SHARE_TEXT);
  const hashtags = encodeURIComponent(SHARE_HASHTAGS);
  const url = encodeURIComponent(siteUrl);
  window.open(
    `https://x.com/intent/tweet?text=${text}&hashtags=${hashtags}&url=${url}`,
    '_blank',
    'width=550,height=420'
  );
}

function showShareToast(message) {
  let toast = document.getElementById('shareToast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'shareToast';
    toast.style.cssText = `
      position:fixed;bottom:32px;left:50%;transform:translateX(-50%) translateY(20px);
      background:rgba(124,58,237,0.95);color:white;padding:14px 28px;border-radius:50px;
      font-family:var(--font);font-size:0.9rem;font-weight:500;z-index:9999;
      box-shadow:0 8px 32px rgba(0,0,0,0.4);opacity:0;transition:all 0.3s ease;
      text-align:center;max-width:90vw;backdrop-filter:blur(8px);
    `;
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.style.opacity = '1';
  toast.style.transform = 'translateX(-50%) translateY(0)';
  clearTimeout(toast._timeout);
  toast._timeout = setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(-50%) translateY(20px)';
  }, 3500);
}

let _voteData = null;

(async function init() {
  const data = getVoteData();
  _voteData = data;

  document.getElementById('loadingOverlay').classList.add('hidden');

  if (!data || !data.accessToken || !data.selections || !data.cardNumber) {
    document.getElementById('noDataSection').classList.remove('hidden');
    return;
  }

  if (Object.keys(data.selections).length === 0) {
    document.getElementById('noDataSection').classList.remove('hidden');
    return;
  }

  document.getElementById('cardSection').classList.remove('hidden');
  await renderCard(data);

  // Mobilde native share butonunu goster
  if (navigator.share) {
    document.getElementById('shareNativeBtn').style.display = 'inline-flex';
  }
})();
