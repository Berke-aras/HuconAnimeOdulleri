/**
 * GDPR / Fingerprinting Consent Manager
 * Handles the display of the mandatory device identification notice.
 */
(function() {
  const CONSENT_KEY = "huc_legal_ack";

  function createBanner() {
    if (localStorage.getItem(CONSENT_KEY)) return;

    const banner = document.createElement('div');
    banner.className = 'consent-banner';
    banner.id = 'gdprConsentBanner';
    
    banner.innerHTML = `
      <div class="consent-content">
        <div class="consent-title">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          Güvenlik Bildirimi
        </div>
        <p class="consent-text">
          Oylama adaletini sağlamak ve mükerrer oyları engellemek için cihaz tanımlama (fingerprinting) teknolojileri kullanmaktayız. 
          Sistemi kullanarak bu teknik verilerin işlenmesini ve <a href="kvkk.html">Aydınlatma Metni</a>'ni kabul etmiş sayılırsınız.
        </p>
        <div class="consent-actions">
          <button class="btn-ack" id="ackConsentBtn">Anladım</button>
        </div>
      </div>
    `;

    document.body.appendChild(banner);

    document.getElementById('ackConsentBtn').addEventListener('click', () => {
      localStorage.setItem(CONSENT_KEY, 'true');
      banner.style.opacity = '0';
      banner.style.transform = 'translateY(20px)';
      banner.style.transition = '0.4s ease';
      setTimeout(() => banner.remove(), 400);
    });
  }

  // Ensure DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createBanner);
  } else {
    createBanner();
  }
})();
