// Yasal ve destek sayfalarında bölümler <details class="sec" open> olarak
// üretilir — yani JavaScript yoksa, arama motorlarında ve geniş ekranda
// metnin TAMAMI açıktır. Apple da siteyi böyle görür.
//
// Bu dosyanın tek işi: DAR ekranda bunları akordeona çevirmek.
// Bir bölüm açılınca diğerleri kapanır.
(function () {
  var secs = Array.prototype.slice.call(document.querySelectorAll('.sec'));
  if (!secs.length) return;

  var dar = window.matchMedia('(max-width: 60rem)');
  var kilit = false; // toggle olayları birbirini tetiklemesin

  function uygula() {
    kilit = true;
    // Dar ekranda HEPSİ kapalı: ekranda düzgün bir başlık listesi dursun,
    // dokununca açılsın. (İlkini açık bırakmak listeyi bozuyordu.)
    secs.forEach(function (d) {
      d.open = !dar.matches;
    });
    kilit = false;
  }

  secs.forEach(function (d) {
    d.addEventListener('toggle', function () {
      if (kilit || !dar.matches || !d.open) return;
      kilit = true;
      secs.forEach(function (o) { if (o !== d) o.open = false; });
      kilit = false;
    });
  });

  // İçindekiler bağlantısı: hedef bölümü aç, sonra oraya git
  document.querySelectorAll('.toc a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function () {
      var hedef = document.getElementById(a.getAttribute('href').slice(1));
      var bolum = hedef && hedef.closest('.sec');
      if (bolum && !bolum.open) bolum.open = true;
    });
  });

  uygula();
  dar.addEventListener('change', uygula);
})();
