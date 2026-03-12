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
      if (typeof FingerprintJS !== "undefined") {
        const fp = await FingerprintJS.load();
        const result = await fp.get();
        return result.visitorId;
      }
      throw new Error("FingerprintJS not available");
    } catch (e) {
      return await generateFallbackFingerprint();
    }
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

  async function hasAlreadyVoted() {
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
    sha256,
    SELECTIONS_KEY
  };
})();
