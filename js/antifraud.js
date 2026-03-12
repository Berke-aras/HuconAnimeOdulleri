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

  // --- Parmak Izi ---

  async function generateFallbackFingerprint() {
    const webgl = getWebGLFingerprint();
    const canvasFP = getCanvasFingerprint();

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
      webgl,
      canvasFP
    ];

    return await sha256(components.join("|||"));
  }

  async function getVisitorId() {
    try {
      let baseFp = "";
      if (typeof FingerprintJS !== "undefined") {
        const fp = await FingerprintJS.load();
        const result = await fp.get();
        baseFp = result.visitorId;
      } else {
        baseFp = await generateFallbackFingerprint();
      }
      
      // Ileri Donanim Fingerprintlerini de bekle ve birlestir
      const advancedWebGL = await getAdvancedWebGLFingerprint();
      const audioFP = await getAudioContextFingerprint();
      
      // Bunlari birlestirip yepyeni ve cok daha benzersiz bir hash uret
      const combinedRaw = baseFp + "|" + advancedWebGL + "|" + audioFP;
      return await sha256(combinedRaw);
    } catch (e) {
      return await generateFallbackFingerprint();
    }
  }

  // --- Ileri Seviye Donanim Parmak Izleri ---

  async function getAdvancedWebGLFingerprint() {
    return new Promise((resolve) => {
      try {
        const canvas = document.createElement("canvas");
        const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
        if (!gl) return resolve("no-webgl");

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
        const vertices = new Float32Array([-1,-1, 1,-1, -1,1, 1,1]);
        const vbo = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
        const locMap = gl.getAttribLocation(program, "p");
        gl.enableVertexAttribArray(locMap);
        gl.vertexAttribPointer(locMap, 2, gl.FLOAT, false, 0, 0);

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

        const debugInfo = gl.getExtension("WEBGL_debug_renderer_info");
        const vendor = debugInfo ? gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) : "unknown";
        const renderer = debugInfo ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : "unknown";

        resolve(hash.toString(16) + "~" + vendor + "~" + renderer);
      } catch (e) {
        resolve("webgl-err");
      }
    });
  }

  async function getAudioContextFingerprint() {
    return new Promise((resolve) => {
      try {
        const AudioContext = window.OfflineAudioContext || window.webkitOfflineAudioContext;
        if (!AudioContext) return resolve("no-audio");

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
        compressor.reduction.value = -20;
        compressor.attack.value = 0;
        compressor.release.value = 0.25;

        // Bagla ve calistir
        oscillator.connect(compressor);
        compressor.connect(context.destination);
        oscillator.start(0);

        context.oncomplete = (event) => {
          const buffer = event.renderedBuffer.getChannelData(0);
          let hash = 0;
          for (let i = 4500; i < 5000; i++) {
            hash += Math.abs(buffer[i]);
          }
          resolve(hash.toString());
        };

        context.startRendering();
      } catch (e) {
        resolve("audio-err");
      }
    });
  }

  function getWebGLFingerprint() {
    try {
      const canvas = document.createElement("canvas");
      const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
      if (!gl) return "no-webgl";
      const debugInfo = gl.getExtension("WEBGL_debug_renderer_info");
      if (!debugInfo) return "no-debug";
      return gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) + "~" +
             gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
    } catch (e) { return "err"; }
  }

  function getCanvasFingerprint() {
    try {
      const canvas = document.createElement("canvas");
      canvas.width = 200; canvas.height = 50;
      const ctx = canvas.getContext("2d");
      ctx.textBaseline = "alphabetic";
      ctx.fillStyle = "#f60";
      ctx.fillRect(100, 1, 62, 20);
      ctx.fillStyle = "#069";
      ctx.font = "11pt Arial";
      ctx.fillText("Anime Oylama 2026!", 2, 15);
      ctx.fillStyle = "rgba(102,204,0,0.7)";
      ctx.font = "18pt Arial";
      ctx.fillText("AnimeVote", 4, 45);
      return canvas.toDataURL();
    } catch (e) { return "err"; }
  }

  // Cihaz-seviyesi parmak izi: tarayicidan BAGIMSIZ sinyaller
  // Ayni cihazdaki farkli tarayicilarda ayni hash'i uretir
  async function generateDeviceFingerprint() {
    const components = [
      screen.width + "x" + screen.height,
      screen.availWidth + "x" + screen.availHeight,
      screen.colorDepth,
      window.devicePixelRatio || 1,
      navigator.hardwareConcurrency || 0,
      navigator.maxTouchPoints || 0,
      new Date().getTimezoneOffset(),
      Intl.DateTimeFormat().resolvedOptions().timeZone || "",
      navigator.platform || "",
      navigator.language
    ];
    return await sha256(components.join("|||"));
  }

  // --- Yerel Depolama (6 mekanizma) ---

  function setLS(key, val) {
    try { localStorage.setItem(key, val); } catch (e) {}
  }
  function getLS(key) {
    try { return localStorage.getItem(key); } catch (e) { return null; }
  }
  function setVotedLS() { setLS(_s[0], Date.now().toString()); }
  function getVotedLS() { return getLS(_s[0]) !== null; }

  function setVotedSS() {
    try { sessionStorage.setItem(_s[1], "1"); } catch (e) {}
  }

  function setCookie() {
    try {
      const d = new Date();
      d.setTime(d.getTime() + COOKIE_DAYS * 24 * 60 * 60 * 1000);
      document.cookie = `${COOKIE_NAME}=1;expires=${d.toUTCString()};path=/;SameSite=Strict`;
    } catch (e) {}
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
    } catch (e) {}
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
    } catch (e) {}
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
    } catch (e) {}
  }
  function getWindowName() {
    try { return window.name.includes(_k); } catch (e) { return false; }
  }

  // --- Firestore ---

  async function checkFirestore(visitorId) {
    const doc = await db.collection("votes").doc(visitorId).get();
    return doc.exists;
  }

  async function saveVoteAtomically(visitorId, selections) {
    const fingerprintHash = await sha256(visitorId + navigator.userAgent);
    const deviceId = await generateDeviceFingerprint();

    const counterRef = db.collection("meta").doc("counter");
    const voteRef = db.collection("votes").doc(visitorId);

    return db.runTransaction(async (tx) => {
      const counterDoc = await tx.get(counterRef);
      const voteDoc = await tx.get(voteRef);

      if (voteDoc.exists) {
        // Kullanici daha once oy vermis ama yerel verisi kaybolmus
        // Mevcut oy kaydini guncelle, kart numarasini koru
        const existingData = voteDoc.data();
        tx.update(voteRef, {
          selections: selections,
          updatedAt: Date.now(),
          fingerprintHash: fingerprintHash,
          deviceId: deviceId
        });
        return existingData.cardNumber;
      }

      let newCount;
      if (counterDoc.exists) {
        newCount = (counterDoc.data().count || 0) + 1;
        tx.update(counterRef, { count: newCount });
      } else {
        newCount = 1;
        tx.set(counterRef, { count: 1 });
      }

      tx.set(voteRef, {
        selections: selections,
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
        fingerprintHash: fingerprintHash,
        deviceId: deviceId,
        userAgent: navigator.userAgent.substring(0, 200),
        cardNumber: newCount,
        createdAt: Date.now()
      });

      return newCount;
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
    try { sessionStorage.setItem(_k + '_revote', '1'); } catch (e) {}
  }

  function clearRevoteMode() {
    try { sessionStorage.removeItem(_k + '_revote'); } catch (e) {}
  }

  async function hasAlreadyVoted() {
    // Revote modundaysa yerel ve Firestore kontrollerini atla
    if (isRevoteMode()) {
      clearRevoteMode();
      return false;
    }

    if (getVotedLS()) return true;
    if (getCookie()) return true;
    if (getWindowName()) return true;
    try { if (await getIDB()) return true; } catch (e) {}
    try { if (await getCacheAPI()) return true; } catch (e) {}

    const visitorId = await getVisitorId();
    const exists = await checkFirestore(visitorId);
    if (exists) {
      markAsVotedLocally();
      return true;
    }

    return false;
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

    const visitorId = await getVisitorId();
    const cardNumber = await saveVoteAtomically(visitorId, selections);
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
      try { sessionStorage.setItem(SELECTIONS_KEY, data); } catch (e) {}
    } catch (e) {}
  }

  function getVoteData() {
    try {
      let raw = getLS(SELECTIONS_KEY);
      if (!raw) { try { raw = sessionStorage.getItem(SELECTIONS_KEY); } catch (e) {} }
      return raw ? JSON.parse(raw) : null;
    } catch (e) { return null; }
  }

  async function clearLocalVoteData() {
    // LocalStorage - vote flag + selections
    try { localStorage.removeItem(_s[0]); } catch (e) {}
    try { localStorage.removeItem(SELECTIONS_KEY); } catch (e) {}
    // SessionStorage
    try { sessionStorage.removeItem(_s[1]); } catch (e) {}
    try { sessionStorage.removeItem(SELECTIONS_KEY); } catch (e) {}
    // Cookie
    try {
      document.cookie = `${COOKIE_NAME}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;SameSite=Strict`;
    } catch (e) {}
    // IndexedDB
    try {
      const idb = await openIDB();
      const tx = idb.transaction(IDB_STORE, "readwrite");
      tx.objectStore(IDB_STORE).delete(_s[2]);
    } catch (e) {}
    // CacheAPI
    try {
      if ("caches" in window) {
        const cache = await caches.open(IDB_NAME);
        await cache.delete("/_vf");
      }
    } catch (e) {}
    // window.name
    try {
      const parts = window.name ? window.name.split("|") : [];
      window.name = parts.filter(p => p !== _k).join("|");
    } catch (e) {}
  }

  return {
    getVisitorId,
    hasAlreadyVoted,
    submitVote,
    markVotingStarted,
    generateAccessToken,
    storeVoteData,
    getVoteData,
    clearLocalVoteData,
    enableRevoteMode,
    sha256,
    SELECTIONS_KEY
  };
})();
