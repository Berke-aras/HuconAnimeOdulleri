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
    if (!message) return "empty";
    const msgBuffer = new TextEncoder().encode(String(message));
    const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
  }

  function getClockDrift() {
    try {
      // performance.timeOrigin tarayicinin baslatildigi anin en kesin (mikrosaniye) timestampidir.
      // Eger yoksa Date.now() - performance.now() ile simüle ediyoruz.
      const origin = performance.timeOrigin || (Date.now() - performance.now());
      return Number(origin).toFixed(4); // 4 basamakli kesinlik
    } catch (e) {
      return (Date.now() - (performance.now() || 0)).toFixed(4);
    }
  }

  async function getIPHash() {
    const providers = [
      "https://1.1.1.1/cdn-cgi/trace",
      "https://cloudflare.com/cdn-cgi/trace",
      "https://api.ipify.org?format=json"
    ];

    for (const url of providers) {
      try {
        const resp = await fetch(url);
        const text = await resp.text();
        let ip = "";
        if (url.includes("json")) {
          ip = JSON.parse(text).ip;
        } else {
          const match = text.match(/ip=([0-9a-f.:]+)/);
          if (match) ip = match[1];
        }
        if (ip) return await sha256(ip + "anime_vote_salt_2026");
      } catch (e) {}
    }
    
    // Tüm IP servisleri blokluysa (AdGuard vb. çok katıysa)
    console.warn("Ag kontrolü engellendi. Ag imzasi olmadan devam ediliyor.");
    return "blocked_network";
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
        try {
          const fp = await FingerprintJS.load();
          const result = await fp.get();
          baseFp = result.visitorId;
        } catch (e) { baseFp = await generateFallbackFingerprint(); }
      } else {
        baseFp = await generateFallbackFingerprint();
      }
    } catch (e) {
      baseFp = await generateFallbackFingerprint();
    }

    // Ileri Donanim Fingerprintlerini bekle
    const signals = await Promise.allSettled([
      getAdvancedWebGLFingerprint(),
      getAudioContextFingerprint(),
      getSpeechVoicesFingerprint()
    ]);

    const sigData = signals.map(s => s.status === 'fulfilled' ? s.value : 'err');
    const combinedRaw = baseFp + "|" + sigData.join("|");
    return await sha256(combinedRaw);
  }

  // --- Ileri Seviye Donanim Parmak Izleri ---

  async function getAdvancedWebGLFingerprint() {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error("WebGL dogrulamasi zaman asimina ugradi.")), 3000);
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
          const p = pixels[i] || 0;
          hash = ((hash << 5) - hash) + p;
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
    return new Promise((resolve, reject) => {
      // Yavas mobil cihazlari da goz onunde bulundurarak 3000ms timeout
      const timeout = setTimeout(() => reject(new Error("Ses dogrulamasi zaman asimina ugradi.")), 3000);

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
            // Gürültüye (noise) karşı daha dirençli: Düşük frekanslı örnekleri normalize et
            let hash = 5381;
            for (let i = 0; i < buffer.length; i += 100) {
              // Değerleri belli bir hassasiyete yuvarlayarak mikro-gürültüleri yoksayalım
              const val = Math.floor(Math.abs(buffer[i] || 0) * 1000);
              hash = ((hash << 5) + hash) + val;
            }
            hash = hash & 0x7fffffff;
            resolve(hash.toString(36));
          } catch (err) {
            reject(new Error("Ses imzasi olusturulamadi."));
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

  function getWebRTCIP() {
    return new Promise((resolve) => {
      const timeout = setTimeout(() => resolve("webrtc-timeout"), 800);
      try {
        const RTCPeerConnection = window.RTCPeerConnection || window.mozRTCPeerConnection || window.webkitRTCPeerConnection;
        if (!RTCPeerConnection) return resolve("no-webrtc");
        
        const pc = new RTCPeerConnection({ iceServers: [] });
        pc.createDataChannel("");
        pc.createOffer().then(offer => pc.setLocalDescription(offer)).catch(() => {});
        
        pc.onicecandidate = (ice) => {
          if (!ice || !ice.candidate || !ice.candidate.candidate) return;
          const candidate = ice.candidate.candidate;
          const match = /([0-9]{1,3}(\.[0-9]{1,3}){3}|[a-f0-9]{1,4}(:[a-f0-9]{1,4}){7})/.exec(candidate);
          if (match) {
            clearTimeout(timeout);
            pc.close();
            resolve(match[1]);
          }
        };
      } catch (e) {
        clearTimeout(timeout);
        resolve("webrtc-err");
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
      // toDataURL yerine ham piksel verisini (ImageData) hash'liyoruz.
      // Safari gibi tarayicilar gizli sekmede toDataURL'e gürültü ekler, 
      // ImageData üzerinden bit-masking yaparak bu gürültüyü eziyoruz.
      const pixels = ctx.getImageData(0, 0, 280, 60).data;
      let hash = 0;
      for (let i = 0; i < pixels.length; i += 4) {
        // En düsük 1-2 biti maskeleyerek (yok sayarak) tarayicinin eklediği minik gürültüleri eliyoruz
        const r = pixels[i] & 0xFC;
        const g = pixels[i+1] & 0xFC;
        const b = pixels[i+2] & 0xFC;
        const a = pixels[i+3] & 0xFC;
        
        hash = ((hash << 5) - hash) + (r + g + b + a);
        hash = hash & hash;
      }

      return "canvas-" + Math.abs(hash).toString(16);
    } catch (e) { return "err"; }
  }

  // Cihaz-seviyesi parmak izi: tarayicidan BAGIMSIZ sinyaller
  // Ayni cihazdaki farkli tarayicilarda ayni hash'i uretmesi hedeflenir
  async function generateHardwareHashes() {
    const audioRaw = await getAudioContextFingerprint();
    const fontRaw = getFontFingerprint();
    const voicesRaw = await getSpeechVoicesFingerprint();
    const webrtcRaw = await getWebRTCIP();
    const webglHardware = getWebGLFingerprint();
    const webglAdvanced = await getAdvancedWebGLFingerprint();
    const canvasRaw = getCanvasFingerprint();

    const audioHash = await sha256(audioRaw);
    const fontHash = await sha256(fontRaw);
    const voicesHash = await sha256(voicesRaw);
    const localIpHash = await sha256(webrtcRaw);
    const canvasHash = await sha256(canvasRaw);
    
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

    return { audioHash, fontHash, voicesHash, webglHash, canvasHash, hardwareProfile };
  }

  async function generateHardwareSignature() {
    const hh = await generateHardwareHashes();
    // 7 kalemden imza üret (Local IP artik düşük ağırlıklı bir parça)
    return await sha256([hh.audioHash, hh.fontHash, hh.voicesHash, hh.localIpHash, hh.webglHash, hh.canvasHash, hh.hardwareProfile].join("|"));
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
    if (!hashes.audioHash || !hashes.webglHash || !hashes.fontHash) return null;

    // 1. Kesin DeviceId esleşmesi (Aynı tarayıcı)
    const exactQuery = await db.collection("votes")
      .where("deviceId", "==", deviceId || "none")
      .where("ipHash", "==", ipHash || "none")
      .limit(1)
      .get();
    
    if (!exactQuery.empty) return { id: exactQuery.docs[0].id, ...exactQuery.docs[0].data() };

    // --- Aday Havuzu (Potansiyel eslesmeleri toplayip en iyisini sececegiz) ---
    let candidates = [];

    // 2. Senaryo A: Donanım Kalemlerinden (Audio, WebGL, Font) sorgula
    const hardwareQuery = await db.collection("votes")
      .where("audioHash", "==", hashes.audioHash || "none")
      .where("webglHash", "==", hashes.webglHash || "none")
      .where("fontHash", "==", hashes.fontHash || "none")
      .limit(10)
      .get();
    
    hardwareQuery.docs.forEach(doc => {
      const v = doc.data();
      let matchCount = (v.ipHash === ipHash) ? 1 : 0;
      matchCount += 3; // Audio, WebGL, Font zaten eslesti
      if (v.canvasHash === hashes.canvasHash) matchCount++;
      if (v.voicesHash === hashes.voicesHash) matchCount++;
      if (v.localIpHash === hashes.localIpHash) matchCount++;

      if (matchCount >= 3) {
        candidates.push({ id: doc.id, ...v, _matchCount: matchCount });
      }
    });

    // 3. Senaryo B: IP üzerinden sorgula (Donanimlar farkli olsa da IP ayni olabilir)
    const ipQuery = await db.collection("votes")
      .where("ipHash", "==", ipHash || "none")
      .limit(10)
      .get();
      
    ipQuery.docs.forEach(doc => {
      // Zaten donanim sorgusunda bulduysak tekrar ekleme (De-duplication)
      if (candidates.some(c => c.id === doc.id)) return;

      const v = doc.data();
      let matchCount = 1; // IP eslesiyor
      if (v.audioHash === hashes.audioHash) matchCount++;
      if (v.webglHash === hashes.webglHash) matchCount++;
      if (v.fontHash === hashes.fontHash) matchCount++;
      if (v.canvasHash === hashes.canvasHash) matchCount++;
      if (v.voicesHash === hashes.voicesHash) matchCount++;
      if (v.localIpHash === hashes.localIpHash) matchCount++;

      if (matchCount >= 3) {
        candidates.push({ id: doc.id, ...v, _matchCount: matchCount });
      }
    });

    // --- EN IYI ADAYI SEC (Weighted Best Candidate Selection) ---
    const targetDrift = parseFloat(getClockDrift()) || 0;
    
    // Sinyal agirliklari (Cihazı ne kadar benzersiz kildigi)
    const weights = {
      ip: 1.0,      // Ağ kimliği
      webgl: 1.5,   // En güçlü donanim sinyali (GPU)
      canvas: 1.2,  // Hassas grafik imzasi
      audio: 0.8,   // Sürücü bazli (Class ID)
      localIp: 1.0, // İç ağ kimliği
      voices: 0.5,  // Yazilim bazli
      font: 0.5     // Yazilim bazli
    };

    return candidates.sort((a, b) => {
      // 1- Önce Ham Eşleşme Puanına (Match Count) bak
      if (b._matchCount !== a._matchCount) {
        return b._matchCount - a._matchCount;
      }
      
      // 2- Puanlar eşitse "Ağırlıklı Skor" hesapla (Hangi sinyaller daha kaliteli?)
      const getWeightedScore = (c) => {
        let score = (c.ipHash === ipHash ? weights.ip : 0);
        score += (c.webglHash === hashes.webglHash ? weights.webgl : 0);
        score += (c.canvasHash === hashes.canvasHash ? weights.canvas : 0);
        score += (c.audioHash === hashes.audioHash ? weights.audio : 0);
        score += (c.localIpHash === hashes.localIpHash ? weights.localIp : 0);
        score += (c.voicesHash === hashes.voicesHash ? weights.voices : 0);
        score += (c.fontHash === hashes.fontHash ? weights.font : 0);
        return score;
      };

      const scoreA = getWeightedScore(a);
      const scoreB = getWeightedScore(b);

      if (scoreB !== scoreA) {
        return scoreB - scoreA;
      }

      // 3- Her şey eşitse Saat Sapması (Drift) en yakın olana bak (Fotofiniş)
      const driftDiffA = Math.abs((parseFloat(a.clockDrift) || 0) - targetDrift);
      const driftDiffB = Math.abs((parseFloat(b.clockDrift) || 0) - targetDrift);
      return driftDiffA - driftDiffB;
    })[0];
  }

  async function saveVoteAtomically(visitorId, selections, trustData = {}) {
    const fingerprintHash = await sha256(visitorId + navigator.userAgent);
    const deviceId = await generateDeviceFingerprint();
    const hardwareHashes = await generateHardwareHashes();
    const hardwareSignature = await generateHardwareSignature(); // Tek bir disiplin altina aldik
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
        voicesHash: hardwareHashes.voicesHash,
        localIpHash: hardwareHashes.localIpHash,
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

      clearRevoteMode(); // Başarılı gönderimden sonra bayrağı temizle
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
      // Artık burada silmiyoruz, başarılı gönderimden sonra submitVote içinde siliyoruz.
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
      throw new Error("Kimlik dogrulama engellendi. Reklam engelleyicinizi (AdGuard vb.) kapatin.");
    }

    if (visitorId) {
      const storedData = await checkFirestore(visitorId);
      if (storedData) {
        markAsVotedLocally();
        return { status: 'visitor_match', data: storedData };
      }
    }

    if (localFlag) return true; // Firestore'da yoksa ama localde varsa (belki henüz senkronize olmadı?)

    // 3. Gizli sekme / Cross-browser / IP-Device Kontrolü (KESIN ENGELLEME)
    // Revote modundaysa bu kontrolü de atlıyoruz
    if (isRevoteMode()) {
      return false;
    }

    const deviceId = await generateDeviceFingerprint();
    const hardwareHashes = await generateHardwareHashes();
    const ipHash = await getIPHash();
    const matchedData = await findMatchedVoteData(deviceId, ipHash, hardwareHashes);
    
    if (matchedData) {
      markAsVotedLocally();
      // VERİ GERİ ÇEKME (Recovery): 
      // 7 sinyalden 3 tanesinin eşleşmesi (3/7) Safari ve diğer 
      // agresif tarayıcı taktiklerini aşmak için en ideal seviyedir.
      if (matchedData._matchCount >= 3) {
        return { status: "device_block", data: matchedData };
      }
    }

    return false;
  }

  async function checkSuspicionStatus() {
    const hardwareHashes = await generateHardwareHashes();
    const ipHash = await getIPHash();

    if (!hardwareHashes.audioHash || !hardwareHashes.canvasHash) return { trustScore: "high", suspicionReason: null };

    // IP + Donanim sinyallerini kontrol et
    const ipQuery = await db.collection("votes").where("ipHash", "==", ipHash || "none").limit(10).get();
    
    let maxMatch = 0;
    for(const doc of ipQuery.docs) {
      const v = doc.data();
      let matchCount = 1; // IP eslesiyor
      if(v.audioHash === hardwareHashes.audioHash) matchCount++;
      if(v.webglHash === hardwareHashes.webglHash) matchCount++;
      if(v.fontHash === hardwareHashes.fontHash) matchCount++;
      if(v.canvasHash === hardwareHashes.canvasHash) matchCount++;
      if(v.voicesHash === hardwareHashes.voicesHash) matchCount++;
      if(v.localIpHash === hardwareHashes.localIpHash) matchCount++;
      
      if(matchCount > maxMatch) maxMatch = matchCount;
    }

    // IP disindaki donanim eslesmelerine de bakalim
    // En kararlı 3 sinyal (Audio, WebGL, Font) üzerinden kontrol
    const hardwareQuery = await db.collection("votes")
      .where("audioHash", "==", hardwareHashes.audioHash || "none_a")
      .where("webglHash", "==", hardwareHashes.webglHash || "none_w")
      .where("fontHash", "==", hardwareHashes.fontHash || "none_f")
      .limit(5)
      .get();
    
    if (!hardwareQuery.empty) {
      // Donanim eslesiyorsa (IP farkli olsa bile) supheli kabul et
      // Bu adaylar icinden en yüksek matchCount'u bulmaya calis
      for(const doc of hardwareQuery.docs) {
        const v = doc.data();
        let matchCount = (v.ipHash === ipHash) ? 1 : 0;
        matchCount += 3; // Audio, WebGL, Font esleşti
        if(v.canvasHash === hardwareHashes.canvasHash) matchCount++;
        if(v.voicesHash === hardwareHashes.voicesHash) matchCount++;
        if(v.localIpHash === hardwareHashes.localIpHash) matchCount++;
        if(matchCount > maxMatch) maxMatch = matchCount;
      }
    }

    // 7 sinyal üzerinden (IP + 6 Donanim)
    if (maxMatch >= 4) {
      return { trustScore: "low", suspicionReason: "strict_hardware_match" };
    } else if (maxMatch === 3) {
      return { trustScore: "low", suspicionReason: "3_of_7_match" };
    } else if (maxMatch === 2) {
      return { trustScore: "high", suspicionReason: "possible_device_similarity" };
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
    try {
      if (_votingStartedAt === 0) {
        throw new Error("Oylama oturumu baslatilmadi. Lutfen sayfayi yenileyip tekrar deneyin.");
      }
      const elapsed = Date.now() - _votingStartedAt;
      if (elapsed < MIN_VOTING_DURATION_MS) {
        throw new Error("Cok hizli oylama tespit edildi. Lutfen biraz bekleyip tekrar deneyin.");
      }

      // 1. Tekrar oy kontrolü
      const alreadyVotedStatus = await hasAlreadyVoted();
      if (alreadyVotedStatus) {
        // visitor_match veya device_block fark etmeksizin engelleyelim
        throw new Error("Bu cihazdan veya agdan zaten oy verilmis. Tekrar oy kullanamazsiniz.");
      }

      // 2. Güvenlik sinyallerini topla
      const trustData = await checkSuspicionStatus();
      
      // Eğer trust score "low" gelirse ama matchedData'da yakalanmadiysa (limitler yüzünden), yine de engelle
      if (trustData.trustScore === "low") {
        throw new Error("Guvenlik denetimi basarisiz. Bu cihazdan artik oy kullanilamaz.");
      }

      const visitorId = await getVisitorId();
      const cleanedSelections = sanitizeSelections(selections);

      // 3. Firestore kaydet
      const cardNumber = await saveVoteAtomically(visitorId, cleanedSelections, trustData);
      markAsVotedLocally();

      return { visitorId, cardNumber };
    } catch (err) {
      console.error("AntifraudManager Error:", err);
      
      const msg = err.message || "";
      const stack = err.stack || "";
      
      // Eğer hata "Ağ kontrolü" veya "Kimlik doğrulaması" gibi bizim attığımız özel bir hataysa direkt geç
      if (msg.includes("engellendi") || msg.includes("kapatin")) {
        throw err;
      }

      if (err.code === 'permission-denied') {
        throw new Error("Erişim reddedildi. Yetkiniz yok veya sistem kapali.");
      }

      // Network engellemesi tespiti (ERR_BLOCKED_BY_CLIENT vb.)
      if (stack.includes("BLOCKED_BY_CLIENT") || stack.includes("access control checks") || !navigator.onLine) {
        throw new Error("Baglanti engellendi! Reklam engelleyicinizi (AdGuard vb.) devre dışı bırakıp tekrar deneyin.");
      }

      throw new Error(msg || "Bilinmeyen bir hata olustu. Lutfen internetinizi kontrol edin.");
    }
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
