// ============================================================
// Anti-Fraud Sistemi v4
// FingerprintJS + Firestore + 6 yerel depo + bot korumasi
// + Cihaz-seviyesi parmak izi (cross-browser koruma)
// ============================================================

const AntifraudManager = (() => {
  const _k = btoa("animeoy").slice(0, 6);
  const _s = [_k + "_v", _k + "_t", _k + "_h"];
  const COOKIE_NAME = _s[0];
  const IDB_NAME = "AoDB";
  const IDB_STORE = "d";
  const COOKIE_DAYS = 400;
  const SELECTIONS_KEY = _k + "_sel";

  const MIN_VOTING_DURATION_MS = 15000;
  let _votingStartedAt = 0;

  async function sha256(message) {
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
  }

  async function getIPHash() {
    try {
      // Cloudflare trace üzerinden kullanicinin tam IP'sini alalim
      const resp = await fetch("https://1.1.1.1/cdn-cgi/trace");
      const text = await resp.text();
      const ipMatch = text.match(/ip=([0-9a-f.:]+)/);
      if (ipMatch && ipMatch[1]) {
        // Gizlilik için IP'yi ham yazmak yerine bir "salt" ile hash'liyoruz.
        // Boylece admin panelinde bile gercek IP gorunmez, ama eslesme tam calisir.
        return await sha256(ipMatch[1] + "anime_vote_salt_2026");
      }
      return "none";
    } catch (e) {
      return "err";
    }
  }

  // --- Parmak Izi ---

  async function generateFallbackFingerprint() {
    const webgl = getWebGLFingerprint();
    const canvasFP = getCanvasFingerprint();
    const fontFP = getFontFingerprint();

    const components = [
      navigator.userAgent,
      navigator.language,
      navigator.languages ? navigator.languages.join(",") : "",
      screen.width + "x" + screen.height,
      screen.availWidth + "x" + screen.availHeight,
      screen.colorDepth,
      window.devicePixelRatio || 1,
      new Date().getTimezoneOffset(),
      Intl.DateTimeFormat().resolvedOptions().timeZone || "",
      navigator.hardwareConcurrency || 0,
      navigator.maxTouchPoints || 0,
      navigator.platform || "",
      navigator.deviceMemory || 0,
      webgl,
      canvasFP,
      fontFP
    ];

    return await sha256(components.join("|||"));
  }

  async function getVisitorId() {
    let baseFp = "";
    try {
      if (typeof FingerprintJS !== "undefined") {
        const fp = await FingerprintJS.load();
        const result = await fp.get();
        baseFp = result.visitorId;
      } else {
        baseFp = await generateFallbackFingerprint();
      }
    } catch (e) {
      baseFp = await generateFallbackFingerprint();
    }

    try {
      // Ileri Donanim Fingerprintlerini her halukarda bekle ve birlestir (Paralel olarak daha hizli yuklenir)
      const [advancedWebGL, audioFP, speechFP] = await Promise.all([
        getAdvancedWebGLFingerprint(),
        getAudioContextFingerprint(),
        getSpeechVoicesFingerprint()
      ]);

      // Bunlari birlestirip yepyeni ve cok daha benzersiz bir hash uret
      const combinedRaw = baseFp + "|" + advancedWebGL + "|" + audioFP + "|" + speechFP;
      return await sha256(combinedRaw);
    } catch (err) {
      return await sha256(baseFp); // En kotu senaryoda sadece baseFp'yi hashle
    }
  }

  // --- Ileri Seviye Donanim Parmak Izleri ---

  async function getAdvancedWebGLFingerprint() {
    return new Promise((resolve) => {
      const timeout = setTimeout(() => resolve("webgl-timeout"), 1000);
      try {
        const canvas = document.createElement("canvas");
        const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
        if (!gl) {
          clearTimeout(timeout);
          return resolve("no-webgl");
        }

        // Basit Vertex Shader
        const vShader = gl.createShader(gl.VERTEX_SHADER);
        gl.shaderSource(vShader, `attribute vec2 p;void main(){gl_Position=vec4(p,0,1);}`);
        gl.compileShader(vShader);

        // Geometri ve matematiksel karmasiklik iceren Fragment Shader
        const fShader = gl.createShader(gl.FRAGMENT_SHADER);
        gl.shaderSource(fShader, `precision mediump float;void main(){gl_FragColor=vec4(fract(sin(gl_FragCoord.x*12.9898+gl_FragCoord.y*78.233)*43758.5453),fract(cos(gl_FragCoord.x*4.898+gl_FragCoord.y*7.23)*23421.631),0.5,1.0);}`);
        gl.compileShader(fShader);

        const program = gl.createProgram();
        gl.attachShader(program, vShader);
        gl.attachShader(program, fShader);
        gl.linkProgram(program);
        gl.useProgram(program);

        // Cizim alani tanimla
        const vertices = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]);
        const vbo = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
        const locMap = gl.getAttribLocation(program, "p");
        if (locMap >= 0) {
          gl.enableVertexAttribArray(locMap);
          gl.vertexAttribPointer(locMap, 2, gl.FLOAT, false, 0, 0);
        }

        // Ekran boyutu ve renk islemesi
        gl.viewport(0, 0, 8, 8);
        gl.clearColor(0.2, 0.4, 0.6, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

        // Pikselleri oku (GPU'muzun pikselleri nasil yuvarladigi cok ozel bir imzadir)
        const pixels = new Uint8Array(8 * 8 * 4);
        gl.readPixels(0, 0, 8, 8, gl.RGBA, gl.UNSIGNED_BYTE, pixels);

        // Pikselleri temizle
        let hash = 0;
        for (let i = 0; i < pixels.length; i++) {
          hash = ((hash << 5) - hash) + pixels[i];
          hash = hash & hash;
        }

        let vendor = "unknown";
        let renderer = "unknown";
        try {
          const debugInfo = gl.getExtension("WEBGL_debug_renderer_info");
          if (debugInfo) {
            vendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) || "unknown";
            renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) || "unknown";
          }
        } catch (extError) { }

        // WebGL desteklenen extension listesi - ek entropy kaynagi
        let extensions = "";
        try {
          const extList = gl.getSupportedExtensions();
          extensions = extList ? extList.sort().join(",") : "";
        } catch (extErr) {}

        // WebGL parametreleri - GPU yeteneklerini ayirt eder
        let params = "";
        try {
          params = [
            gl.getParameter(gl.MAX_TEXTURE_SIZE),
            gl.getParameter(gl.MAX_VERTEX_ATTRIBS),
            gl.getParameter(gl.MAX_VERTEX_UNIFORM_VECTORS),
            gl.getParameter(gl.MAX_VARYING_VECTORS),
            gl.getParameter(gl.MAX_FRAGMENT_UNIFORM_VECTORS),
            gl.getParameter(gl.MAX_RENDERBUFFER_SIZE),
            gl.getParameter(gl.ALIASED_LINE_WIDTH_RANGE) ? gl.getParameter(gl.ALIASED_LINE_WIDTH_RANGE).toString() : "",
            gl.getParameter(gl.ALIASED_POINT_SIZE_RANGE) ? gl.getParameter(gl.ALIASED_POINT_SIZE_RANGE).toString() : ""
          ].join(",");
        } catch (paramErr) {}

        // WebGL kaynaklarini temizle (memory leak onleme)
        try {
          gl.deleteBuffer(vbo);
          gl.deleteShader(vShader);
          gl.deleteShader(fShader);
          gl.deleteProgram(program);
          const loseCtx = gl.getExtension("WEBGL_lose_context");
          if (loseCtx) loseCtx.loseContext();
        } catch (cleanupErr) {}

        clearTimeout(timeout);
        resolve(hash.toString(16) + "~" + vendor + "~" + renderer + "~" + extensions.length + "~" + params);
      } catch (e) {
        clearTimeout(timeout);
        resolve("webgl-err");
      }
    });
  }

  async function getAudioContextFingerprint() {
    return new Promise((resolve) => {
      // Yavas mobil cihazlari da goz onunde bulundurarak 1000ms timeout
      const timeout = setTimeout(() => resolve("audio-timeout"), 1000);

      try {
        const AudioContext = window.OfflineAudioContext || window.webkitOfflineAudioContext;
        if (!AudioContext) {
          clearTimeout(timeout);
          return resolve("no-audio");
        }

        // 44100Hz'de 1 saniyelik buffer
        const context = new AudioContext(1, 44100, 44100);

        // Oscillator ve Compressor olustur
        const oscillator = context.createOscillator();
        oscillator.type = "triangle";
        oscillator.frequency.value = 10000;

        const compressor = context.createDynamicsCompressor();
        compressor.threshold.value = -50;
        compressor.knee.value = 40;
        compressor.ratio.value = 12;
        compressor.attack.value = 0;
        compressor.release.value = 0.25;

        // Bagla ve calistir
        oscillator.connect(compressor);
        compressor.connect(context.destination);
        oscillator.start(0);

        context.oncomplete = (event) => {
          clearTimeout(timeout);
          try {
            const buffer = event.renderedBuffer.getChannelData(0);
            // Daha genis aralik ve daha kararlı hash (Sadece tam sayıları kullan)
            let hash = 5381;
            for (let i = 4000; i < 6000; i += 2) {
              const val = Math.floor(Math.abs(buffer[i]) * 10000);
              hash = ((hash << 5) + hash) + val;
              hash = hash & 0x7fffffff;
            }
            resolve(hash.toString(36));
          } catch (err) {
            resolve("audio-err");
          }
        };

        const renderPromise = context.startRendering();
        if (renderPromise && typeof renderPromise.catch === "function") {
          renderPromise.catch(() => {
            clearTimeout(timeout);
            resolve("audio-err");
          });
        }
      } catch (e) {
        clearTimeout(timeout);
        resolve("audio-err");
      }
    });
  }

  // SpeechSynthesis API ses listesi - tarayiciya ozel entropy kaynagi
  function getSpeechVoicesFingerprint() {
    return new Promise((resolve) => {
      const timeout = setTimeout(() => resolve("speech-timeout"), 500);
      try {
        if (!window.speechSynthesis) {
          clearTimeout(timeout);
          return resolve("no-speech");
        }
        const voices = window.speechSynthesis.getVoices();
        if (voices.length > 0) {
          clearTimeout(timeout);
          return resolve(voices.map(v => v.name + ":" + v.lang).sort().join(","));
        }
        // Bazi tarayicilarda sesler async yuklenir
        window.speechSynthesis.onvoiceschanged = () => {
          clearTimeout(timeout);
          const v = window.speechSynthesis.getVoices();
          resolve(v.map(vi => vi.name + ":" + vi.lang).sort().join(","));
        };
      } catch (e) {
        clearTimeout(timeout);
        resolve("speech-err");
      }
    });
  }

  // Font kullanilabilirlik testi - her cihazda farkli fontlar yuklu
  function getFontFingerprint() {
    try {
      const testFonts = [
        "Arial", "Verdana", "Times New Roman", "Courier New", "Georgia",
        "Comic Sans MS", "Impact", "Trebuchet MS", "Palatino Linotype",
        "Lucida Console", "Tahoma", "Segoe UI", "Roboto", "Noto Sans",
        "Calibri", "Cambria", "Consolas", "Helvetica Neue", "Ubuntu",
        "Cantarell", "DejaVu Sans", "Liberation Mono", "Noto Color Emoji"
      ];

      const canvas = document.createElement("canvas");
      canvas.width = 300;
      canvas.height = 30;
      const ctx = canvas.getContext("2d");
      const testStr = "mmMwWLli10O&";
      const baseFont = "72px monospace";

      ctx.font = baseFont;
      const baseWidth = ctx.measureText(testStr).width;

      const detected = [];
      for (const font of testFonts) {
        ctx.font = "72px '" + font + "', monospace";
        if (ctx.measureText(testStr).width !== baseWidth) {
          detected.push(font);
        }
      }
      return detected.join(",");
    } catch (e) {
      return "font-err";
    }
  }

  function getWebGLFingerprint() {
    try {
      const canvas = document.createElement("canvas");
      const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
      if (!gl) return "no-webgl";
      const debugInfo = gl.getExtension("WEBGL_debug_renderer_info");
      if (!debugInfo) return "no-debug";
      const result = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) + "~" +
             gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
      // Kaynaklari temizle
      try {
        const loseCtx = gl.getExtension("WEBGL_lose_context");
        if (loseCtx) loseCtx.loseContext();
      } catch (cleanupErr) {}
      return result;
    } catch (e) { return "err"; }
  }

  function getCanvasFingerprint() {
    try {
      const canvas = document.createElement("canvas");
      canvas.width = 280; canvas.height = 60;
      const ctx = canvas.getContext("2d");

      // Gradient arka plan - GPU renk karistirmasini test eder
      const gradient = ctx.createLinearGradient(0, 0, 280, 0);
      gradient.addColorStop(0, "#ff6600");
      gradient.addColorStop(0.5, "#0066ff");
      gradient.addColorStop(1, "#00ff66");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 280, 60);

      // Dikdortgen - basit sekil
      ctx.fillStyle = "#f60";
      ctx.fillRect(100, 1, 62, 20);

      // Metin render - font rasterization farkliliklari
      ctx.textBaseline = "alphabetic";
      ctx.fillStyle = "#069";
      ctx.font = "11pt Arial";
      ctx.fillText("Anime Oylama 2026!", 2, 15);
      ctx.fillStyle = "rgba(102,204,0,0.7)";
      ctx.font = "18pt Arial";
      ctx.fillText("AnimeVote", 4, 45);

      // Arc ve Bezier - vektorel cizim farkliliklari
      ctx.beginPath();
      ctx.arc(200, 30, 15, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255,0,128,0.5)";
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(230, 5);
      ctx.bezierCurveTo(240, 25, 260, 35, 275, 55);
      ctx.strokeStyle = "rgba(0,128,255,0.6)";
      ctx.lineWidth = 2;
      ctx.stroke();

      return canvas.toDataURL();
    } catch (e) { return "err"; }
  }

  // Cihaz-seviyesi parmak izi: tarayicidan BAGIMSIZ sinyaller
  // Ayni cihazdaki farkli tarayicilarda ayni hash'i uretmesi hedeflenir
  async function generateHardwareHashes() {
    const audioRaw = await getAudioContextFingerprint();
    const fontRaw = getFontFingerprint();
    const webglHardware = getWebGLFingerprint();
    const webglAdvanced = await getAdvancedWebGLFingerprint();

    // Ses ve fontlari hashliyoruz
    const audioHash = await sha256(audioRaw);
    const fontHash = await sha256(fontRaw);
    
    // WebGL icin hem ham donanim bilgisini hem de shader hesaplama sonucunu kullaniyoruz
    const webglHash = await sha256(webglHardware + "|||" + webglAdvanced);

    // Kaba ekran/donanim profili (False positive engellemek icin ek sigorta)
    const hardwareProfile = await sha256([
      screen.colorDepth || 24,
      navigator.hardwareConcurrency || 0,
      navigator.maxTouchPoints || 0,
      navigator.deviceMemory || 0,
      new Date().getTimezoneOffset(),
      Math.round(Math.max(screen.width, screen.height) / 100) * 100 + "x" + Math.round(Math.min(screen.width, screen.height) / 100) * 100
    ].join("|"));

    return { audioHash, fontHash, webglHash, hardwareProfile };
  }

  async function generateHardwareSignature() {
    const { audioHash, fontHash, webglHash, hardwareProfile } = await generateHardwareHashes();
    return await sha256(audioHash + fontHash + webglHash + hardwareProfile);
  }

  async function generateDeviceFingerprint() {
    const hardware = await generateHardwareSignature();
    const components = [
      hardware,
      navigator.pdfViewerEnabled ? "pdf" : "no-pdf",
      navigator.languages ? navigator.languages[0] : "tr"
    ];
    return await sha256(components.join(":::"));
  }

  function sanitizeSelections(selections) {
    if (!selections || typeof selections !== "object" || Array.isArray(selections)) {
      throw new Error("Gecersiz oy verisi.");
    }

    const categoryMap = new Map();
    CATEGORIES.forEach((category) => {
      categoryMap.set(category.id, new Set(category.candidates.map((candidate) => candidate.id)));
    });

    const cleanedSelections = {};
    const incomingKeys = Object.keys(selections);

    if (incomingKeys.length !== CATEGORIES.length) {
      throw new Error("Eksik veya gecersiz kategori secimi.");
    }

    for (const category of CATEGORIES) {
      const selectedCandidate = selections[category.id];
      if (typeof selectedCandidate !== "string" || !categoryMap.get(category.id).has(selectedCandidate)) {
        throw new Error("Gecersiz aday secimi tespit edildi.");
      }
      cleanedSelections[category.id] = selectedCandidate;
    }

    if (Object.keys(cleanedSelections).length !== incomingKeys.length) {
      throw new Error("Beklenmeyen secim verisi tespit edildi.");
    }

    return cleanedSelections;
  }

  // --- Yerel Depolama (6 mekanizma) ---

  function setLS(key, val) {
    try { localStorage.setItem(key, val); } catch (e) { }
  }
  function getLS(key) {
    try { return localStorage.getItem(key); } catch (e) { return null; }
  }
  function setVotedLS() { setLS(_s[0], Date.now().toString()); }
  function getVotedLS() { return getLS(_s[0]) !== null; }

  function setVotedSS() {
    try { sessionStorage.setItem(_s[1], "1"); } catch (e) { }
  }

  function setCookie() {
    try {
      const d = new Date();
      d.setTime(d.getTime() + COOKIE_DAYS * 24 * 60 * 60 * 1000);
      const secure = location.protocol === "https:" ? ";Secure" : "";
      document.cookie = `${COOKIE_NAME}=1;expires=${d.toUTCString()};path=/;SameSite=Strict${secure}`;
    } catch (e) { }
  }
  function getCookie() {
    try {
      return document.cookie.split(";").some(c => c.trim().startsWith(COOKIE_NAME + "="));
    } catch (e) { return false; }
  }

  function openIDB() {
    return new Promise((resolve, reject) => {
      try {
        const req = indexedDB.open(IDB_NAME, 1);
        req.onupgradeneeded = (e) => {
          e.target.result.createObjectStore(IDB_STORE, { keyPath: "id" });
        };
        req.onsuccess = (e) => resolve(e.target.result);
        req.onerror = () => reject();
      } catch (e) { reject(e); }
    });
  }
  async function setIDB() {
    try {
      const idb = await openIDB();
      const tx = idb.transaction(IDB_STORE, "readwrite");
      tx.objectStore(IDB_STORE).put({ id: _s[2], ts: Date.now() });
    } catch (e) { }
  }
  async function getIDB() {
    try {
      const idb = await openIDB();
      return new Promise((resolve) => {
        const tx = idb.transaction(IDB_STORE, "readonly");
        const req = tx.objectStore(IDB_STORE).get(_s[2]);
        req.onsuccess = () => resolve(req.result !== undefined);
        req.onerror = () => resolve(false);
      });
    } catch (e) { return false; }
  }

  async function setCacheAPI() {
    try {
      if (!("caches" in window)) return;
      const cache = await caches.open(IDB_NAME);
      await cache.put("/_vf", new Response(Date.now().toString()));
    } catch (e) { }
  }
  async function getCacheAPI() {
    try {
      if (!("caches" in window)) return false;
      const cache = await caches.open(IDB_NAME);
      return (await cache.match("/_vf")) !== undefined;
    } catch (e) { return false; }
  }

  function setWindowName() {
    try {
      const existing = window.name ? window.name.split("|") : [];
      if (!existing.includes(_k)) {
        existing.push(_k);
        window.name = existing.join("|");
      }
    } catch (e) { }
  }
  function getWindowName() {
    try { return window.name.includes(_k); } catch (e) { return false; }
  }

  // --- Firestore ---

  async function checkFirestore(visitorId) {
    const doc = await db.collection("votes").doc(visitorId).get();
    return doc.exists ? { id: doc.id, ...doc.data() } : null;
  }

  async function checkDeviceInFirestore(deviceId, ipHash, hashes) {
    const match = await findMatchedVoteData(deviceId, ipHash, hashes);
    return !!match;
  }

  async function findMatchedVoteData(deviceId, ipHash, hashes) {
    // 1. Kesin DeviceId eslesmesi (Ayni tarayici)
    const exactQuery = await db.collection("votes")
      .where("deviceId", "==", deviceId)
      .where("ipHash", "==", ipHash)
      .limit(1)
      .get();
    
    if (!exactQuery.empty) return { id: exactQuery.docs[0].id, ...exactQuery.docs[0].data() };

    // 2. 3/4 Eşleşme Mantığı (IP, Audio, WebGL, Font)
    // Audio bizim ana anahtarımız (Cross-browser için en stabil olan)
    
    // Senaryo A: Donanım kalemleri birebir aynı (Audio+WebGL+Font)
    const hardwareQuery = await db.collection("votes")
      .where("audioHash", "==", hashes.audioHash)
      .where("webglHash", "==", hashes.webglHash)
      .where("fontHash", "==", hashes.fontHash)
      .limit(1)
      .get();
    if (!hardwareQuery.empty) return { id: hardwareQuery.docs[0].id, ...hardwareQuery.docs[0].data() };

    // Senaryo B: IP aynı ve Audio + (WebGL veya Font) aynı
    const ipQuery = await db.collection("votes")
      .where("ipHash", "==", ipHash)
      .limit(10)
      .get();
      
    const candidates = [];

    for (const doc of ipQuery.docs) {
      const v = doc.data();
      let matchCount = 1; // IP eşleşiyor
      if (v.audioHash === hashes.audioHash) matchCount++;
      if (v.webglHash === hashes.webglHash) matchCount++;
      if (v.fontHash === hashes.fontHash) matchCount++;
      if (v.canvasHash === hashes.canvasHash) matchCount++;

      // 5 sinyalden (IP+4 Donanim) en az 4'ü tutmalı (veya IP hariç 4 donanım tutmalı)
      if (matchCount >= 4 || (matchCount >= 4 && v.ipHash !== ipHash)) {
        candidates.push({ id: doc.id, ...v });
      }
    }

    if (candidates.length === 0) return null;
    if (candidates.length === 1) return candidates[0];

    // Birden fazla aday varsa TIE-BREAKER (Hakem) uygula
    const targetDrift = parseFloat(getClockDrift());
    return candidates.sort((a, b) => {
      const driftA = Math.abs(parseFloat(a.clockDrift || 0) - targetDrift);
      const driftB = Math.abs(parseFloat(b.clockDrift || 0) - targetDrift);
      return driftA - driftB; // En küçük saat sapması olan kazanır
    })[0];
  }

  async function saveVoteAtomically(visitorId, selections, trustData = {}) {
    const fingerprintHash = await sha256(visitorId + navigator.userAgent);
    const deviceId = await generateDeviceFingerprint();
    const hardwareHashes = await generateHardwareHashes();
    const hardwareSignature = await sha256(hardwareHashes.canvasHash + hardwareHashes.audioHash + hardwareHashes.fontHash + hardwareHashes.webglHash);
    const ipHash = await getIPHash();
    const clockDrift = getClockDrift();
    
    // Admin paneli icin detayli donanim bilgisi
    const deviceData = {
      memory: navigator.deviceMemory || "bilinmiyor",
      cores: navigator.hardwareConcurrency || "bilinmiyor",
      touch: navigator.maxTouchPoints || 0,
      pdf: navigator.pdfViewerEnabled || false,
      screen: `${screen.width}x${screen.height}`,
      timezone: new Date().getTimezoneOffset(),
      languages: navigator.languages ? navigator.languages.join(",") : navigator.language
    };

    const counterRef = db.collection("meta").doc("counter");
    const voteRef = db.collection("votes").doc(visitorId);

    return db.runTransaction(async (tx) => {
      const counterDoc = await tx.get(counterRef);
      const voteDoc = await tx.get(voteRef);

      const commonData = {
        updatedAt: Date.now(),
        visitorId: visitorId,
        fingerprintHash: fingerprintHash,
        deviceId: deviceId,
        hardwareSignature: hardwareSignature,
        audioHash: hardwareHashes.audioHash,
        webglHash: hardwareHashes.webglHash,
        fontHash: hardwareHashes.fontHash,
        canvasHash: hardwareHashes.canvasHash,
        clockDrift: clockDrift,
        ipHash: ipHash,
        deviceData: deviceData,
        trustScore: trustData.trustScore || "high",
        suspicionReason: trustData.suspicionReason || null,
        userAgent: navigator.userAgent
      };

      if (voteDoc.exists) {
        const existingData = voteDoc.data();
        tx.update(voteRef, { ...commonData, selections: selections });
        return existingData.cardNumber;
      }

      const nextNumber = counterDoc.exists ? (counterDoc.data().count || 0) + 1 : 1;
      tx.set(counterRef, { count: nextNumber });
      tx.set(voteRef, {
        ...commonData,
        cardNumber: nextNumber,
        selections: selections,
        createdAt: Date.now()
      });

      return nextNumber;
    });
  }

  // --- Kontroller ---

  function markAsVotedLocally() {
    setVotedLS();
    setVotedSS();
    setCookie();
    setIDB();
    setCacheAPI();
    setWindowName();
  }

  function isRevoteMode() {
    try { return sessionStorage.getItem(_k + '_revote') === '1'; } catch (e) { return false; }
  }

  function enableRevoteMode() {
    try { sessionStorage.setItem(_k + '_revote', '1'); } catch (e) { }
  }

  function clearRevoteMode() {
    try { sessionStorage.removeItem(_k + '_revote'); } catch (e) { }
  }

  async function hasAlreadyVoted() {
    // Revote modundaysa yerel ve Firestore kontrollerini atla
    if (isRevoteMode()) {
      clearRevoteMode();
      return false;
    }

    // 1. Yerel depo kontrolleri (Hizli)
    const localFlag = getVotedLS() || getCookie() || getWindowName();
    
    // 2. Tarayici bazli Firestore kontrolü (visitorId)
    // Bu durumda HARD BLOCK uyguluyoruz çünkü tarayıcı kimliği tam eşleşiyor.
    let visitorId = "";
    try {
      visitorId = await getVisitorId();
    } catch (e) {
      console.warn("VisitorId generation failed:", e);
    }

    if (visitorId) {
      try {
        const storedData = await checkFirestore(visitorId);
        if (storedData) {
          markAsVotedLocally();
          return { status: 'visitor_match', data: storedData };
        }
      } catch (e) {
        console.warn("checkFirestore failed (blocked?):", e);
      }
    }

    if (localFlag) return true; // Firestore'da yoksa ama localde varsa (belki henüz senkronize olmadı?)

    // 3. Gizli sekme / Cross-browser / IP-Device Kontrolü (KESIN ENGELLEME)
    // Revote modundaysa bu kontrolü de atlıyoruz
    if (isRevoteMode()) {
      clearRevoteMode();
      return false;
    }

    try {
      const deviceId = await generateDeviceFingerprint();
      const hardwareHashes = await generateHardwareHashes();
      const ipHash = await getIPHash();
      const matchedData = await findMatchedVoteData(deviceId, ipHash, hardwareHashes);
      
      if (matchedData) {
        markAsVotedLocally();
        // Gizli sekme vb. durumlarda geri donen data ile sayfada karti gosterebiliriz
        return { status: "device_block", data: matchedData }; 
      }
    } catch (e) {
      console.error("Advanced fingerprint matching failed:", e);
      // Bu adım başarısız olursa kullanıcının devam etmesine izin ver (veya blokla, ama şuan izin veriyoruz)
    }

    return false;

    return false;
  }

  async function checkSuspicionStatus() {
    const hardwareHashes = await generateHardwareHashes();
    const ipHash = await getIPHash();

    // IP + Donanim sinyallerini kontrol et
    const ipQuery = await db.collection("votes").where("ipHash", "==", ipHash).limit(10).get();
    
    let maxMatch = 0;
    for(const doc of ipQuery.docs) {
      const v = doc.data();
      let matchCount = 1; // IP eslesiyor
      if(v.audioHash === hardwareHashes.audioHash) matchCount++;
      if(v.webglHash === hardwareHashes.webglHash) matchCount++;
      if(v.fontHash === hardwareHashes.fontHash) matchCount++;
      if(v.canvasHash === hardwareHashes.canvasHash) matchCount++;
      
      if(matchCount > maxMatch) maxMatch = matchCount;
    }

    // IP disindaki donanim eslesmelerine de bakalim (Farkli IP, ayni cihaz)
    const hardwareQuery = await db.collection("votes")
      .where("audioHash", "==", hardwareHashes.audioHash)
      .where("webglHash", "==", hardwareHashes.webglHash)
      .where("fontHash", "==", hardwareHashes.fontHash)
      .where("canvasHash", "==", hardwareHashes.canvasHash)
      .limit(1)
      .get();
    
    if (!hardwareQuery.empty) {
      if (maxMatch < 4) maxMatch = 4;
    }

    // 5 sinyal üzerinden (IP, Audio, WebGL, Font, Canvas)
    if (maxMatch >= 4) {
      return { trustScore: "low", suspicionReason: "4plus_match_block_bypass" };
    } else if (maxMatch === 3) {
      return { trustScore: "low", suspicionReason: "3_of_5_match" };
    } else if (maxMatch === 2) {
      return { trustScore: "high", suspicionReason: "potential_match" };
    }

    return {
      trustScore: "high",
      suspicionReason: null
    };
  }

  function markVotingStarted() {
    _votingStartedAt = Date.now();
  }

  async function submitVote(selections) {
    if (_votingStartedAt === 0) {
      throw new Error("Oylama oturumu baslatilmadi. Lutfen sayfayi yenileyip tekrar deneyin.");
    }
    const elapsed = Date.now() - _votingStartedAt;
    if (elapsed < MIN_VOTING_DURATION_MS) {
      throw new Error("Cok hizli oylama tespit edildi. Lutfen biraz bekleyip tekrar deneyin.");
    }

    // Gonderim oncesi son bir kez daha tekrar oy kontrolu
    const alreadyVotedStatus = await hasAlreadyVoted();
    if (alreadyVotedStatus === true || (typeof alreadyVotedStatus === 'object' && alreadyVotedStatus.status === "device_block")) {
      throw new Error("Bu cihazdan veya agdan zaten oy verilmis. Tekrar oy kullanamazsiniz.");
    }

    // Supheli durum kontrolu (Marking)
    const trustData = await checkSuspicionStatus();

    const cleanedSelections = sanitizeSelections(selections);
    const visitorId = await getVisitorId();
    const cardNumber = await saveVoteAtomically(visitorId, cleanedSelections, trustData);
    markAsVotedLocally();

    return { visitorId, cardNumber };
  }

  // --- Erisim Tokeni ---

  async function generateAccessToken(visitorId, cardNumber) {
    const raw = visitorId + "|" + cardNumber + "|" + navigator.userAgent + "|anime2026";
    return await sha256(raw);
  }

  function storeVoteData(selections, cardNumber, accessToken) {
    try {
      const data = JSON.stringify({ selections, cardNumber, accessToken, ts: Date.now() });
      setLS(SELECTIONS_KEY, data);
      try { sessionStorage.setItem(SELECTIONS_KEY, data); } catch (e) { }
    } catch (e) { }
  }

  function getVoteData() {
    try {
      let raw = getLS(SELECTIONS_KEY);
      if (!raw) { try { raw = sessionStorage.getItem(SELECTIONS_KEY); } catch (e) { } }
      return raw ? JSON.parse(raw) : null;
    } catch (e) { return null; }
  }

  async function clearLocalVoteData() {
    // LocalStorage - vote flag + selections
    try { localStorage.removeItem(_s[0]); } catch (e) { }
    try { localStorage.removeItem(SELECTIONS_KEY); } catch (e) { }
    // SessionStorage
    try { sessionStorage.removeItem(_s[1]); } catch (e) { }
    try { sessionStorage.removeItem(SELECTIONS_KEY); } catch (e) { }
    // Cookie
    try {
      const secure = location.protocol === "https:" ? ";Secure" : "";
      document.cookie = `${COOKIE_NAME}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;SameSite=Strict${secure}`;
    } catch (e) { }
    // IndexedDB
    try {
      const idb = await openIDB();
      const tx = idb.transaction(IDB_STORE, "readwrite");
      tx.objectStore(IDB_STORE).delete(_s[2]);
    } catch (e) { }
    // CacheAPI
    try {
      if ("caches" in window) {
        const cache = await caches.open(IDB_NAME);
        await cache.delete("/_vf");
      }
    } catch (e) { }
    // window.name
    try {
      const parts = window.name ? window.name.split("|") : [];
      window.name = parts.filter(p => p !== _k).join("|");
    } catch (e) { }
  }

  return {
    getVisitorId,
    hasAlreadyVoted,
    checkSuspicionStatus,
    submitVote,
    markVotingStarted,
    generateAccessToken,
    storeVoteData,
    getVoteData,
    clearLocalVoteData,
    enableRevoteMode,
    clearRevoteMode,
    sha256,
    getIPHash,
    generateHardwareSignature,
    SELECTIONS_KEY
  };
})();

// Hatira sayfasindan tekrar oy verme fonksiyonu
async function hatiraRevote(e) {
  if (e) e.preventDefault();
  if (!confirm('Mevcut oyunuzu güncellemek ve tekrar oy vermek istiyor musunuz?')) return;
  try {
    await AntifraudManager.clearLocalVoteData();
    AntifraudManager.enableRevoteMode();
  } catch (err) {}
  window.location.href = 'oylama.html';
}
