# Anime Oylama

Anime etkinlikleri icin oylama sitesi. GitHub Pages + Firebase Firestore altyapisi ile calisir.
Hesap acmadan anti-fraud korumasi, numaralandirilmis hatira kartlari ve guvenli admin erisimi icerir.

## Hizli Baslangic

### 1. Firebase Projesi

1. [Firebase Console](https://console.firebase.google.com/) > Proje Olustur
2. Firestore Database > Veritabani Olustur > **Test modunda** baslatin
3. Proje Ayarlari > Genel > Web uygulamasi ekle
4. Verilen config bilgilerini `js/firebase-config.js` dosyasina yapisitirin

### 2. Firestore Guvenlik Kurallari

Firebase Console > Firestore > Kurallar sekmesine `firestore.rules` dosyasinin icerigini yapisitirin.

**Onemli:** `list: false` kurali sayesinde kimse toplu oy verisi okuyamaz. Sonuclari sadece Firebase Console'dan gorebilirsiniz.

### 3. Kategori ve Adaylar

`js/data.js` dosyasini duzenleyin.

### 4. Aday Fotograflari

`img/candidates/` klasorune fotograflari ekleyin. Dosya adlari `data.js`'deki `image` alanlariyla eslesmeli. Fotograf yoksa isim bas harfleri gosterilir.

### 5. Admin Sifresi

`local/admin.html` icindeki `ADMIN_PASSWORD_HASH` degerini degistirin. Varsayilan sifre `admin`'dir.
Yeni hash almak icin tarayici konsolunda:

```javascript
crypto.subtle.digest('SHA-256', new TextEncoder().encode('yeni_sifreniz')).then(h => console.log(Array.from(new Uint8Array(h)).map(b => b.toString(16).padStart(2,'0')).join('')))
```

**Not:** Sifre hashi sadece `local/admin.html` dosyasinda bulunur, GitHub Pages'te yayinlanan kodda yoktur.

### 6. GitHub Pages

1. GitHub'da yeni repo olusturun
2. Dosyalari push edin (`local/` ve `firestore.rules` gitignore sayesinde yuklenmez)
3. Settings > Pages > Source: "main" branch, "/ (root)"
4. Site: `https://kullanici_adi.github.io/repo_adi/`

## Sonuclari Gorme (Admin)

Firestore guvenlik kurallari `list: false` oldugu icin, oy sonuclari istemci tarafindan toplanamaz. Bu sayede kimse oy dagilimini goremez.

**Sonuclari gormek icin:**

1. [Firebase Console](https://console.firebase.google.com/) > Projeniz > Firestore Database
2. `votes` koleksiyonunda tum oylar gorunur
3. Her oy belgesi: secimler, kart numarasi, zaman damgasi ve parmak izi verilerini icerir

**Alternatif (yerel admin paneli):**

`local/admin.html` dosyasi mevcuttur ancak `list: false` kurali nedeniyle direkt calismaz. Kullanmak icin:
1. Firebase Console'da Firestore kurallarinda gecici olarak `list: false` -> `list: true` yapin
2. `local/admin.html` dosyasini tarayicinizda acin
3. Isleminiz bitince `list: true` -> `list: false`'a geri donun

## Anti-Fraud Korumalari

| Katman | Mekanizma | Ne Yapar |
|--------|-----------|----------|
| 1 | FingerprintJS | Tarayici parmak izi (30+ sinyal) |
| 2 | WebGL + Canvas | Ek donanim parmak izleri (engelleme degil, log) |
| 3 | Firestore Belge | Sunucu tarafinda tekil kayit (temizlenemez) |
| 4 | localStorage + Cookie + SessionStorage | 3 farkli tarayici deposu |
| 5 | IndexedDB + Cache API + window.name | Temizlenmesi zor 3 ek depo |
| 6 | Firestore Security Rules | Ayni ID'ye ikinci yazma engeli + veri dogrulama |
| 7 | Bot Korumasi | Minimum oylama suresi kontrolu (15sn) |

Bir kullanici tekrar oy vermek icin TUM bu katmanlari ayni anda atlatmasi gerekir.

### Guvenlik Detaylari

- **Hata durumunda bypass engeli:** Firebase veya FingerprintJS baglanti hatasi olursa oylama sayfasi acilmaz, hata mesaji gosterilir
- **Veri dogrulama:** Firestore kurallari oy belgesinin yapisini, alan sayisini ve tipleri dogrular
- **Sifre hashi gizli:** Admin sifre hashi sadece `local/admin.html`'de bulunur, GitHub Pages'te yoktur
- **Referrer gizleme:** Tum sayfalarda `no-referrer` meta tagi
- **iFrame engeli:** `X-Frame-Options: DENY` meta tagi

Detayli fingerprint ve guvenlik inceleme notlari icin:

- `GUVENLIK_RAPORU.md`

## Dosya Yapisi

```
animeoylama/
├── index.html              # Karsilama sayfasi
├── oylama.html             # Oylama sayfasi
├── hatira.html             # Hatira karti (sadece oy verenler erisebilir)
├── css/style.css           # Stiller
├── js/
│   ├── data.js             # Kategori/aday verileri
│   ├── firebase-config.js  # Firebase ayarlari
│   ├── antifraud.js        # Anti-fraud sistemi + bot korumasi
│   ├── vote.js             # Oylama mantigi + numaralandirma
│   └── card.js             # Hatira karti olusturma
├── img/candidates/         # Aday fotograflari
├── local/
│   └── admin.html          # YEREL admin paneli (.gitignore'da)
├── firestore.rules         # Guvenlik kurallari (.gitignore'da)
├── robots.txt              # Arama motoru engeli
├── .gitignore              # local/ ve firestore.rules haric tutar
└── .nojekyll               # GitHub Pages icin
```

## Hatira Karti

- Her kart benzersiz numaraya sahiptir (#0001, #0002, ...)
- Sadece oylama tamamlayan kisiler erisebilir (erisim tokeni korumali)
- PNG olarak indirilebilir
- Etkinlik adi, tarih ve secimleri icerir



2. reCAPTCHA v2 Entegrasyonu
Oylama onay ekranina (oylama.html) Google reCAPTCHA v2 eklendi:

Secimler listesinin altinda, "Oylari Gonder" butonunun ustunde dark tema reCAPTCHA checkbox'i gosterilir
Kullanici reCAPTCHA'yi cozmeden oy gonderemez (buton tiklandignda kirmizi cerceve ile uyari gosterilir)
Hata durumunda reCAPTCHA otomatik sifirlanir
reCAPTCHA explicit render modunda yuklenip data.js'deki SITE_CONFIG.recaptchaSiteKey degerini kullanir
Onemli: Simdilik Google'in test key'i kullaniliyor (her zaman gecis verir). Production icin:

https://www.google.com/recaptcha/admin adresine gidin
reCAPTCHA v2 "I'm not a robot" secin
GitHub Pages domaininizi ekleyin
Aldigniz site key'i js/data.js icindeki recaptchaSiteKey alanina yazin

CAPTCHA KAPALI ŞUAN ONU AÇMAYI UNUTMA
