# Hucon Anime Odulleri - Fingerprint ve Guvenlik Inceleme Notu

Bu dokuman, projedeki anti-fraud/fingerprint akisini ve genel guvenlik durumunu ozetler.

## Mevcut guclu yonler

- **Cok katmanli anti-fraud:** `js/antifraud.js` icinde FingerprintJS + WebGL + AudioContext + cihaz sinyalleri + coklu yerel depo + Firestore kontrolu birlikte kullaniliyor.
- **Tekrar oy kontrolu:** Firestore'da `votes/{visitorId}` dokuman modeli duplicate kontrolu icin uygun.
- **Bot zorlastirma:** Minimum oylama suresi kontrolu (`MIN_VOTING_DURATION_MS`) mevcut.
- **Ek insan dogrulama:** Turnstile entegrasyonu (`js/vote.js`) var.
- **Kisisel veri kapsamini dar tutma:** Hash bazli alanlar kullaniliyor, ham hassas veri tutulmuyor.

## Bu PR'da yapilan guvenlik iyilestirmeleri

### 1) Oy verisi dogrulama/sanitize eklendi

`AntifraudManager.submitVote(...)` artik gonderilen `selections` verisini sunucuya yazmadan once dogruluyor:

- Girdi obje mi?
- Tum kategoriler icin secim var mi?
- Secilen adaylar ilgili kategoride whitelist icinde mi?
- Beklenmeyen/ek anahtar var mi?

Gecersiz durumda islem hata ile kesiliyor.

> Dosya: `js/antifraud.js` (`sanitizeSelections` fonksiyonu ve `submitVote` entegrasyonu)

### 2) Onceki oy kaydinin degistirilmesi (Iptal Edildi)

Orijinal PR oncesi kaydin ustune yazilmasini engelleyen bir mekanizma onermisti, ancak "Revote" (Yeniden Oylama) ozelliginin calismaya devam etmesi gerektigi icin bu degisiklik uygulanmamistir. Sadece guncellenen verinin guvenli ve test edilmis (`sanitizeSelections`) olmasi saglanmistir.

## Fingerprint tarafinda daha iyi yapilabilecekler

1. **Skor bazli risk modeli:** Tek bir "izin/verme" yerine fingerprint tutarsizliklarina puan verip risk skoru uretin (ornegin GPU degisti + timezone degisti + cookie yok).
2. **Sunucu tarafi challenge katmani:** Supheli skorda ikinci challenge (ek Turnstile veya gecikmeli onay) uygulayin.
3. **Fingerprint versiyonlama:** Hash icerigi degisirse (yeni sinyal eklendi), `fpVersion` alani tutarak geriye donuk analiz kolaylastirin.
4. **Kisa sureli hiz limiti (rate limit):** Firestore tarafinda dakika/saat bazli yazma limiti veya Cloud Function gatekeeper ekleyin.
5. **Olcumleme/izleme:** Supheli denemeler icin anonim event sayaci tutup anomali alarmi ekleyin.

## Genel guvenlik onerileri (kisa liste)

1. **Firestore security rules denetimi**
   - `list: false`
   - `update/delete: false` (oy belgeleri icin - eger Revote kullanilmayacaksa)
   - Dokuman schema dogrulama
2. **CDN guvenligi**
   - Mumkun olan scriptlerde SRI + `crossorigin` kullanimi
   - Versiyon pinleme (zaten buyuk oranda var)
3. **Icerik guvenligi basliklari**
   - Hosting katmaninda CSP, HSTS, Permissions-Policy degerlendirmesi
4. **Admin panel**
   - `local/admin.html` icin guclu parola politikasi + periyodik hash yenileme

## Sonuc

Mevcut mimari hobi/etkinlik olceginde guclu bir anti-fraud tabani sunuyor. Bu guncelleme ile:

- istemci tarafi manipule edilmis oy verileri filtrelendi,
- XSS zafiyetleri kapatildi.

Boylece fingerprint katmaninin pratikteki guvenlik etkisi artirilmis oldu.
