// ============================================================
// Hatira Karti - Canvas Tabanli Cizim
// Ozel arka plan PNG + ustune numara & secimler + aday resimleri
// PNG ve PDF olarak indirilebilir
// ============================================================

const CARD_W = 1080;
const CARD_H = 1920;
const CARD_PAD = 50;
const THUMB_SIZE = 52;

const COLORS = {
  bg: '#0c0c24',
  overlayBg: 'rgba(8, 8, 28, 0.78)',
  overlayBorder: 'rgba(124, 58, 237, 0.2)',
  title: '#ffffff',
  number: '#c084fc',
  numberGlow: 'rgba(192, 132, 252, 0.5)',
  label: '#b8b8d4',
  catName: '#8888aa',
  selName: '#f0f0ff',
  divider: 'rgba(168, 85, 247, 0.35)',
  dot: ['#7c3aed', '#ec4899', '#06b6d4', '#f59e0b', '#10b981', '#8b5cf6', '#ef4444', '#3b82f6'],
  footer: '#8888aa',
  accentStrip: ['#7c3aed', '#a855f7', '#ec4899', '#c084fc']
};

let _cardCanvas = null;

/**
 * Cihaz performansını ve ekran boyutunu göz önünde bulundurarak
 * canvas scale faktörünü belirler.
 * - Güçlü cihaz / büyük ekran → 1.0 (1080×1920)
 * - Orta cihaz → 0.75 (810×1440)
 * - Zayıf / mobil → 0.6 (648×1152)
 */
function detectScale() {
  const isMobile = window.innerWidth <= 768;
  const lowRAM = navigator.deviceMemory && navigator.deviceMemory < 3;
  const slowNet = navigator.connection &&
    (navigator.connection.effectiveType === '2g' ||
     navigator.connection.effectiveType === 'slow-2g' ||
     navigator.connection.saveData);

  if (lowRAM || slowNet) return 0.6;
  if (isMobile) return 0.75;
  return 1.0;
}

let _scale = detectScale();


// Redundant getVoteData removed. Using AntifraudManager.getVoteData() instead.

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

  // Subtle glow border around thumbnails
  ctx.strokeStyle = 'rgba(255,255,255,0.2)';
  ctx.lineWidth = 2.5;
  roundRect(ctx, x, y, size, size, radius);
  ctx.stroke();
}

function drawInitialsThumb(ctx, initials, x, y, size, radius, color) {
  ctx.save();
  roundRect(ctx, x, y, size, size, radius);
  ctx.fillStyle = color + '33';
  ctx.fill();
  ctx.restore();

  ctx.strokeStyle = color + '55';
  ctx.lineWidth = 2.5;
  roundRect(ctx, x, y, size, size, radius);
  ctx.stroke();

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = 'bold 26px Outfit, sans-serif';
  ctx.fillStyle = color;
  ctx.fillText(initials, x + size / 2, y + size / 2);
  ctx.textBaseline = 'alphabetic';
}

async function renderCard(data) {
  // Scale zaten sayfa yüklendiğinde belirlenmişti (detectScale)
  // Tekrar hesapla (kullanıcı sayfayı döndürmüş olabilir)
  _scale = detectScale();

  const canvas = document.getElementById('cardCanvas');
  const finalW = CARD_W * _scale;
  const finalH = CARD_H * _scale;

  canvas.width = finalW;
  canvas.height = finalH;

  // CSS preview boyutu — ekran genişliğine sığdır
  const maxDisplayW = Math.min(window.innerWidth - 32, 540);
  canvas.style.width = maxDisplayW + 'px';
  canvas.style.height = 'auto';

  const ctx = canvas.getContext('2d');
  ctx.scale(_scale, _scale);

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

  // Header kısmını hemen çiz (Progressive rendering — kullanıcı "boş kart" görmez)
  drawNumberSection(ctx, data, hasBg);

  // Aday listesi hazır — başlangıçta placeholder ile çiz
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

    const imgPromise = AniListService.resolveCandidateImage(candidate, cat.id).then(url => {
      if (url) {
        return loadImageSafe(url).then(img => { sel.image = img; });
      }
    });
    imagePromises.push(imgPromise);
  });

  // Seçimleri önce placeholder ile çiz (hızlı ilk render)
  drawSelectionsSection(ctx, data, hasBg, selections);

  // Tüm resimler yüklenince tekrar çiz
  await Promise.all(imagePromises);
  // Context'i sıfırla ve yeniden çiz
  ctx.setTransform(_scale, 0, 0, _scale, 0, 0);
  ctx.clearRect(0, 0, CARD_W, CARD_H);
  ctx.fillStyle = COLORS.bg;
  ctx.fillRect(0, 0, CARD_W, CARD_H);
  if (hasBg) {
    try {
      const bgImg = await loadImageSafe(SITE_CONFIG.cardBackground);
      if (bgImg) ctx.drawImage(bgImg, 0, 0, CARD_W, CARD_H);
      else drawDefaultBackground(ctx);
    } catch { drawDefaultBackground(ctx); }
  } else {
    drawDefaultBackground(ctx);
  }
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

function drawOverlayBox(ctx, x, y, w, h, hasBg) {
  // Background fill
  roundRect(ctx, x, y, w, h, 28);
  ctx.fillStyle = hasBg ? COLORS.overlayBg : 'rgba(10, 10, 30, 0.55)';
  ctx.fill();

  // Subtle border
  ctx.strokeStyle = COLORS.overlayBorder;
  ctx.lineWidth = 1.5;
  roundRect(ctx, x, y, w, h, 28);
  ctx.stroke();

  // Accent gradient strip at top of box
  ctx.save();
  roundRect(ctx, x, y, w, 5, 28);
  ctx.clip();
  const stripGrad = ctx.createLinearGradient(x, y, x + w, y);
  stripGrad.addColorStop(0, COLORS.accentStrip[0]);
  stripGrad.addColorStop(0.33, COLORS.accentStrip[1]);
  stripGrad.addColorStop(0.66, COLORS.accentStrip[2]);
  stripGrad.addColorStop(1, COLORS.accentStrip[3]);
  ctx.fillStyle = stripGrad;
  ctx.fillRect(x, y, w, 5);
  ctx.restore();
}

function drawNumberSection(ctx, data, hasBg) {
  const numStr = '#' + String(data.cardNumber).padStart(4, '0');
  const sectionH = 340;
  const contentW = CARD_W - CARD_PAD * 2;

  drawOverlayBox(ctx, CARD_PAD, CARD_PAD, contentW, sectionH, hasBg);

  ctx.textAlign = 'center';
  ctx.font = '600 30px Outfit, sans-serif';
  ctx.fillStyle = COLORS.label;
  ctx.letterSpacing = '10px';
  ctx.fillText('KATILIMCI', CARD_W / 2, CARD_PAD + 85);
  ctx.letterSpacing = '0px';

  ctx.font = 'bold 120px Outfit, sans-serif';

  // Mobil/düşük güçlü cihazlarda (scale < 1) gölge kapalı — GPU'yu rahatlatır
  if (_scale >= 1.0) {
    ctx.shadowColor = COLORS.numberGlow;
    ctx.shadowBlur = 50;
  }

  ctx.fillStyle = COLORS.number;
  ctx.fillText(numStr, CARD_W / 2, CARD_PAD + 225);
  ctx.shadowBlur = 0;

  ctx.font = '500 26px Outfit, sans-serif';
  ctx.fillStyle = COLORS.footer;
  ctx.letterSpacing = '5px';
  ctx.fillText(SITE_CONFIG.eventName.toUpperCase(), CARD_W / 2, CARD_PAD + 300);
  ctx.letterSpacing = '0px';
}

function drawSelectionsSection(ctx, data, hasBg, selections) {
  const cols = 2;
  const colGap = 18;
  const innerPad = 28;
  const cellH = 110;
  const cellGap = 14;
  const cellThumb = 72;
  const cellRadius = 16;
  const headerH = 75;
  const footerH = 65;

  const rows = Math.ceil(selections.length / cols);
  const gridH = rows * cellH + (rows - 1) * cellGap;
  const sectionH = headerH + gridH + footerH + innerPad * 2;
  const sectionY = CARD_H - CARD_PAD - sectionH;
  const contentW = CARD_W - CARD_PAD * 2;

  // Ana overlay kutusu
  drawOverlayBox(ctx, CARD_PAD, sectionY, contentW, sectionH, hasBg);

  // "SECIMLERIM" baslik
  const headerY = sectionY + headerH / 2 + innerPad;
  const centerX = CARD_W / 2;
  const lineW = 130;
  const textW = 220;

  // Decorative lines
  const lineGrad1 = ctx.createLinearGradient(centerX - textW / 2 - lineW, headerY, centerX - textW / 2 - 10, headerY);
  lineGrad1.addColorStop(0, 'transparent');
  lineGrad1.addColorStop(1, COLORS.divider);
  ctx.strokeStyle = lineGrad1;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(centerX - textW / 2 - lineW, headerY);
  ctx.lineTo(centerX - textW / 2 - 10, headerY);
  ctx.stroke();

  const lineGrad2 = ctx.createLinearGradient(centerX + textW / 2 + 10, headerY, centerX + textW / 2 + lineW, headerY);
  lineGrad2.addColorStop(0, COLORS.divider);
  lineGrad2.addColorStop(1, 'transparent');
  ctx.strokeStyle = lineGrad2;
  ctx.beginPath();
  ctx.moveTo(centerX + textW / 2 + 10, headerY);
  ctx.lineTo(centerX + textW / 2 + lineW, headerY);
  ctx.stroke();

  // Decorative dots
  ctx.fillStyle = COLORS.number;
  ctx.beginPath(); ctx.arc(centerX - textW / 2 - lineW - 6, headerY, 4, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(centerX + textW / 2 + lineW + 6, headerY, 4, 0, Math.PI * 2); ctx.fill();

  ctx.textAlign = 'center';
  ctx.font = 'bold 24px Outfit, sans-serif';
  ctx.fillStyle = COLORS.label;
  ctx.letterSpacing = '8px';
  ctx.fillText('SEÇİMLERİM', centerX, headerY + 7);
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

    // Hucre arka plani - subtle gradient
    roundRect(ctx, cellX, cellY, colW, cellH, cellRadius);
    const cellGrad = ctx.createLinearGradient(cellX, cellY, cellX + colW, cellY + cellH);
    cellGrad.addColorStop(0, 'rgba(255, 255, 255, 0.05)');
    cellGrad.addColorStop(1, 'rgba(255, 255, 255, 0.02)');
    ctx.fillStyle = cellGrad;
    ctx.fill();

    // Cell border with color accent
    ctx.strokeStyle = sel.color + '30';
    ctx.lineWidth = 1.5;
    roundRect(ctx, cellX, cellY, colW, cellH, cellRadius);
    ctx.stroke();

    // Sol kenar renk aksani - thicker and glowing
    ctx.save();
    roundRect(ctx, cellX, cellY, 5, cellH, 3);
    ctx.clip();
    const edgeGrad = ctx.createLinearGradient(cellX, cellY, cellX, cellY + cellH);
    edgeGrad.addColorStop(0, sel.color + 'cc');
    edgeGrad.addColorStop(0.5, sel.color + 'ff');
    edgeGrad.addColorStop(1, sel.color + '88');
    ctx.fillStyle = edgeGrad;
    ctx.fillRect(cellX, cellY, 5, cellH);
    ctx.restore();

    // Thumbnail - larger
    const thumbPad = 16;
    const thumbX = cellX + thumbPad + 6;
    const thumbY = cellY + (cellH - cellThumb) / 2;

    if (sel.image) {
      drawRoundedImage(ctx, sel.image, thumbX, thumbY, cellThumb, 12);
    } else {
      drawInitialsThumb(ctx, sel.initials, thumbX, thumbY, cellThumb, 12, sel.color);
    }

    // Metin alani
    const txtX = thumbX + cellThumb + 16;
    const txtMaxW = colW - cellThumb - thumbPad - 40;

    // Kategori adi
    ctx.textAlign = 'left';
    ctx.font = '500 20px Outfit, sans-serif';
    ctx.fillStyle = COLORS.catName;
    ctx.fillText(truncateText(ctx, sel.cat.toUpperCase(), txtMaxW), txtX, cellY + 42);

    // Aday adi - bigger and bolder
    ctx.font = 'bold 28px Outfit, sans-serif';
    ctx.fillStyle = COLORS.selName;
    ctx.fillText(truncateText(ctx, sel.name, txtMaxW), txtX, cellY + 74);
  });

  // Footer
  const footerY = gridStartY + gridH + 20;
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
  ctx.font = '500 22px Outfit, sans-serif';
  ctx.fillStyle = COLORS.footer;
  const footerText = SITE_CONFIG.eventName + '  •  Katılımcı #' + String(data.cardNumber).padStart(4, '0');
  ctx.fillText(footerText, centerX, footerY + 38);
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

async function init() {
  let data = await AntifraudManager.getVoteData();

  // Veri dogrulama ve kurtarma (Tamper Protection)
  try {
    const voted = await AntifraudManager.hasAlreadyVoted();
    if (typeof voted === 'object' && (voted.status === 'device_block' || voted.status === 'visitor_match') && voted.data) {
      const d = voted.data;

      // Local veri yoksa veya DB ile uyusmuyorsa guncelle
      let needsUpdate = false;
      if (!data) {
        needsUpdate = true;
      } else {
        const localSels = JSON.stringify(data.selections || {});
        const dbSels = JSON.stringify(d.selections || {});
        if (localSels !== dbSels || data.cardNumber !== d.cardNumber) {
          console.warn("Yerel veri uyusmazligi tespit edildi. DB verileri kullaniliyor.");
          needsUpdate = true;
        }
      }

      if (needsUpdate) {
        const accessToken = await AntifraudManager.generateAccessToken(d.visitorId, d.cardNumber);
        AntifraudManager.storeVoteData(d.selections, d.cardNumber, accessToken);
        data = { selections: d.selections, cardNumber: d.cardNumber, accessToken: accessToken };
      }
    }
  } catch (e) {
    console.warn("Dogrulama sirasinda hata:", e);
  }

  _voteData = data;
  document.getElementById('loadingOverlay').classList.add('hidden');

  if (!data || !data.accessToken || !data.selections || !data.cardNumber || Object.keys(data.selections).length === 0) {
    document.getElementById('noDataSection').classList.remove('hidden');
    return;
  }

  document.getElementById('cardSection').classList.remove('hidden');
  await renderCard(data);

  // Mobilde native share butonunu goster
  if (navigator.share) {
    document.getElementById('shareNativeBtn').style.display = 'inline-flex';
  }
}
init();
