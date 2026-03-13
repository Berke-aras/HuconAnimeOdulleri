// ============================================================
// Firebase Konfigürasyonu
// Firebase Console'dan aldığınız bilgileri buraya yapıştırın
// https://console.firebase.google.com/
// ============================================================

const firebaseConfig = {
  apiKey: "AIzaSyBr8870-IeBtjDo8EvWtwKXSX81yCur5ao",
  authDomain: "hucon-ef39c.firebaseapp.com",
  projectId: "hucon-ef39c",
  storageBucket: "hucon-ef39c.firebasestorage.app",
  messagingSenderId: "87014862177",
  appId: "1:87014862177:web:0beb8c03579ee2be142920",
  measurementId: "G-1BSX4N50X5"
};

firebase.initializeApp(firebaseConfig);

// AdGuard ve bazı engelleyiciler Firestore'un varsayılan bağlantı yöntemini (streaming)
// bozabiliyor. Long-polling'e zorlamak bağlantı hatalarını azaltır.
const db = firebase.firestore();
try {
  // Bazı tarayıcı ve engelleyici durumlarında streaming (varsayılan) bozulabiliyor.
  // Force ve AutoDetect çakışmasını önlemek için ikisini birden ayarlıyoruz.
  db.settings({ 
    experimentalForceLongPolling: true,
    experimentalAutoDetectLongPolling: false 
  });
} catch (e) {
  console.warn("Firestore settings error (ignored):", e);
}

// Diğer scriptlerin (app-core.js vb.) erişebilmesi için global'e çıkarıyoruz
window.db = db;
