const fs = require('fs');
const path = require('path');
const https = require('https');

const imgDir = path.join(__dirname, '../img/candidates');
const dataJsPath = path.join(__dirname, '../js/data.js');
const imgMapPath = path.join(__dirname, '../js/image-map.js');

// 1. Oku ve Parse Et: js/data.js
let dataJsContent = fs.readFileSync(dataJsPath, 'utf8');
dataJsContent = dataJsContent.replace(/const\s+CATEGORIES/g, 'var CATEGORIES');
dataJsContent = dataJsContent.replace(/const\s+SITE_CONFIG/g, 'var SITE_CONFIG');
eval(dataJsContent);

const API_URL = 'https://graphql.anilist.co';

const CHARACTER_QUERY = `
  query ($search: String) {
    Character (search: $search) { id image { large medium } }
  }
`;

function cleanSearchName(name) {
  if (!name) return "";
  return name.replace(/\s*\(.*?\)/g, '').replace(/[^\x00-\x7F]+/g, '').replace(/\s*Sezon\s*/gi, ' Season ').trim();
}

async function queryAniList(search) {
  let retries = 3;
  while (retries >= 0) {
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ query: CHARACTER_QUERY, variables: { search } })
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
      const res = await response.json();
      return res.data?.Character?.image?.large || null;
    } catch (e) {
      if (retries === 0) throw e;
      retries--;
      await new Promise(r => setTimeout(r, 1000));
    }
  }
  return null;
}

async function downloadImage(url, filepath) {
  if (!url || !url.startsWith('http')) return false;
  return new Promise((resolve, reject) => {
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

function clearOldSingleFiles(catId, candId) {
  const exts = ['.jpg', '.png', '.jpeg'];
  for (const ext of exts) {
    const oldPath = path.join(imgDir, `${catId}_${candId}${ext}`);
    if (fs.existsSync(oldPath)) {
      console.log(`  Eski hatalı dosya silindi: ${oldPath}`);
      fs.unlinkSync(oldPath);
    }
  }
}

async function processCouples() {
  let IMAGE_MAP = {};
  if (fs.existsSync(imgMapPath)) {
     const text = fs.readFileSync(imgMapPath, 'utf8');
     try { IMAGE_MAP = JSON.parse(text.replace('const IMAGE_MAP = ', '').replace(';', '')); } catch(e){}
  }

  const coupleCat = CATEGORIES.find(c => c.id === 'karakter-odakli-yilin-cifti');
  if (!coupleCat) return;

  for (const candidate of coupleCat.candidates) {
    console.log(`[Çift] İşleniyor: ${candidate.name}`);
    const mapKey = coupleCat.id + '_' + candidate.id;
    
    // Temizle (örn: Denji x Reze (AnimeName) -> Denji, Reze)
    const cleanedName = cleanSearchName(candidate.name);
    const names = cleanedName.split(/\s*x\s*|\s*&\s*/i).map(n => n.trim());
    
    const localPaths = [];
    
    clearOldSingleFiles(coupleCat.id, candidate.id);

    for (let i = 0; i < names.length; i++) {
      const charName = names[i];
      let url = await queryAniList(charName);
      
      // Fallback for some hard to find characters if search doesn't perfectly match
      if (!url) {
        if (charName.includes("Sakuta")) url = "https://s4.anilist.co/file/anilistcdn/character/large/b118739-YlOaORkI7s4L.png";
        if (charName.includes("Mai")) url = "https://s4.anilist.co/file/anilistcdn/character/large/b118738-QoA7D40Xf4B5.png";
      }

      if (url) {
        const ext = url.split('.').pop().split('?')[0] || 'jpg';
        const filename = `${coupleCat.id}_${candidate.id}_${i}.${ext}`;
        const localFileUrl = `img/candidates/${filename}`;
        const localFilePath = path.join(imgDir, filename);

        const success = await downloadImage(url, localFilePath);
        if (success) {
          localPaths.push(localFileUrl);
          console.log(`  -> İndirildi: ${charName}`);
        } else {
          console.log(`  -> BAŞARISIZ İNDİRME: ${charName}`);
        }
      } else {
         console.log(`  -> BULUNAMADI: ${charName}`);
      }
      await new Promise(r => setTimeout(r, 800)); // Rate limit beklemesi
    }

    if (localPaths.length > 0) {
      IMAGE_MAP[mapKey] = localPaths;
    }
  }

  const jsContent = `const IMAGE_MAP = ${JSON.stringify(IMAGE_MAP, null, 2)};`;
  fs.writeFileSync(imgMapPath, jsContent);
  console.log(`\n'js/image-map.js' başarıyla güncellendi!`);
}

processCouples();
