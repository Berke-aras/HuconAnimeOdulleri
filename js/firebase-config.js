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
const db = firebase.firestore();
