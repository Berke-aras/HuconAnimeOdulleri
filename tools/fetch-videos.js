const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const videoDir = path.join(__dirname, '../video');
const dataJsPath = path.join(__dirname, '../js/data.js');
const ytdlpPath = path.join(__dirname, 'yt-dlp');

if (!fs.existsSync(videoDir)) fs.mkdirSync(videoDir, { recursive: true });

let dataJsContent = fs.readFileSync(dataJsPath, 'utf8');
dataJsContent = dataJsContent.replace(/const\s+CATEGORIES/g, 'var CATEGORIES');
dataJsContent = dataJsContent.replace(/const\s+SITE_CONFIG/g, 'var SITE_CONFIG');
eval(dataJsContent);

const targetCategories = ['gorsel-isitsel-en-iyi-acilis-op', 'gorsel-isitsel-en-iyi-ending'];

for (const cat of CATEGORIES) {
  if (!targetCategories.includes(cat.id)) continue;

  console.log(`\n=== İndiriliyor: ${cat.title} ===`);
  const isOP = cat.id.includes('op');

  for (const candidate of cat.candidates) {
    const filename = `${candidate.id}.mp4`;
    const filepath = path.join(videoDir, filename);

    if (fs.existsSync(filepath)) {
      console.log(`[MEVCUT] Atlanıyor: ${candidate.name}`);
      continue;
    }

    console.log(`[İNDİRİLİYOR] ${candidate.name}`);
    const cleanName = candidate.name.replace(/"/g, '');
    let animeName = candidate.anime || "";
    // Temizle
    animeName = animeName.replace(/\s*\(.*?\)/g, '').replace(/[^\x00-\x7F]+/g, '').trim();

    // Query for yt-dlp search
    // Using official / anime OP / ED keywords to avoid hour-long loops
    const suffix = isOP ? 'anime opening' : 'anime ending';
    const searchQuery = `ytsearch1:${cleanName} ${animeName} ${suffix}`;
    
    // YTDLP format: best mp4 <=480p OR fall back to best <=480p.
    // ffmpeg yüklü olmadığı için ASLA '+' kullanma, birleştirilmiş versiyon indir ("best[ext=mp4]")
    const format = `"best[ext=mp4][height<=480]/best[ext=mp4]/best"`;
    
    const cmd = `"${ytdlpPath}" -f ${format} --match-filter "duration <= 400" -o "${filepath}" "${searchQuery}"`;
    
    try {
      execSync(cmd, { stdio: 'inherit' });
      console.log(`[BAŞARILI] ${candidate.name} indirildi.`);
    } catch (e) {
      console.error(`[HATA] ${candidate.name} indirilirken sorun oluştu.`);
    }
  }
}
console.log("\n[ÖZET] Bütün video indirme işlemleri tamamlandı.");
