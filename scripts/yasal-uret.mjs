// Yasal sayfaları uygulamadaki metinlerden ÜRETİR.
//
// Tek kaynak: pezzy-proje/src/legal.ts. Siteye elle kopyalarsak ikisi zamanla
// ayrışır ve Apple karşılaştırdığında sorun çıkar — bir kez bu yüzden
// düzeltme yapıldı. Bu betik metni okuyup HTML'e çevirir; arada insan eli yok.
//
// Metin değişince: önce src/legal.ts, sonra:
//   node scripts/yasal-uret.mjs
//
// Ayrıştırma deseni bilerek yasal-disa-aktar.mjs ile birebir aynı.

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const kok = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const kaynak = resolve(kok, '../pezzy-proje/src/legal.ts');

let src;
try {
  src = readFileSync(kaynak, 'utf8');
} catch {
  console.error(`Uygulama kaynagi bulunamadi: ${kaynak}`);
  console.error('pezzy-proje klasoru sitenin yaninda olmali.');
  process.exit(1);
}

const re =
  /(terms|privacy|kvkk):\s*\{\s*title:\s*'([^']+)',\s*updated:\s*'([^']+)',\s*body:\s*`([\s\S]*?)`,\s*\}/g;

const belgeler = {};
let m;
while ((m = re.exec(src))) {
  belgeler[m[1]] = { title: m[2], updated: m[3], body: m[4] };
}

// Hangi belge hangi klasore, App Store'a verilen adresler dahil
const sayfalar = {
  terms: { dizin: 'kullanim-kosullari', ad: 'Kullanım Koşulları' },
  privacy: { dizin: 'gizlilik', ad: 'Gizlilik Politikası' },
  kvkk: { dizin: 'kvkk', ad: 'KVKK Aydınlatma Metni' },
};

const eksik = Object.keys(sayfalar).filter((k) => !belgeler[k]);
if (eksik.length) {
  console.error('src/legal.ts okunamadi, eksik:', eksik.join(', '));
  process.exit(1);
}

const kacis = (s) =>
  s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

// E-posta adreslerini tiklanabilir yap — destek adresi her sayfada isini gormeli
const epostaLinkle = (s) =>
  s.replace(/([\w.+-]+@[\w-]+\.[\w.]+)/g, '<a href="mailto:$1">$1</a>');

/** legal.ts govdesini HTML'e cevirir.
 *  "1. Baslik" -> yeni bolum (details/summary), "- madde" -> ul/li, digerleri -> p
 *  Bolumler VARSAYILAN OLARAK ACIK uretilir: JS yoksa ve genis ekranda metnin
 *  tamami gorunur kalir. Akordeon davranisini menu.js yalnizca dar ekranda kurar.
 *  Ayrica icindekiler icin baslik listesini dondurur. */
function govdeyiHtmlYap(body) {
  const bloklar = body.trim().split(/\n\s*\n/);
  const basliklar = [];
  const girisParcalari = [];   // ilk basliktan onceki metin
  const bolumler = [];         // { id, ad, parcalar }

  const ekle = (html) => {
    if (bolumler.length) bolumler[bolumler.length - 1].parcalar.push(html);
    else girisParcalari.push(html);
  };

  for (const blok of bloklar) {
    const satirlar = blok.split('\n').map((s) => s.trim()).filter(Boolean);
    let liste = [];

    const listeyiBitir = () => {
      if (liste.length) {
        ekle('<ul>' + liste.map((t) => `<li>${t}</li>`).join('') + '</ul>');
        liste = [];
      }
    };

    for (const satir of satirlar) {
      const metin = epostaLinkle(kacis(satir));

      if (/^-\s+/.test(satir)) {
        liste.push(metin.replace(/^-\s+/, ''));
      } else if (/^\d+\.\s+\S/.test(satir)) {
        listeyiBitir();
        const id = 'b' + (basliklar.length + 1);
        basliklar.push({ id, ad: satir.replace(/^\d+\.\s+/, '') });
        bolumler.push({ id, baslik: metin, parcalar: [] });
      } else {
        listeyiBitir();
        ekle(`<p>${metin}</p>`);
      }
    }
    listeyiBitir();
  }

  const html = [
    ...girisParcalari,
    ...bolumler.map(
      (b) => `<details class="sec" open>
      <summary><h2 id="${b.id}">${b.baslik}</h2></summary>
      <div class="sec__body">
        ${b.parcalar.join('\n        ')}
      </div>
    </details>`
    ),
  ].join('\n      ');

  return { html, basliklar };
}

const TOPBAR = `<header class="topbar">
    <a class="wordmark" href="/">Pezzy</a>
    <nav class="topnav" aria-label="Site">
      <a href="/">Ana sayfa</a>
      <a href="/#nasil">Nasıl çalışır</a>
      <a href="/#gizlilik">Gizlilik</a>
      <a href="/destek/">Destek</a>
    </nav>
  </header>`;

const FOOT = `<footer class="shell foot">
  <nav aria-label="Alt menü">
    <a href="/">Ana sayfa</a>
    <a href="/destek/">Destek</a>
    <a href="/hesap-silme/">Hesabımı sil</a>
    <a href="mailto:pezzy@pezzyapp.com">pezzy@pezzyapp.com</a>
  </nav>
  <p>Bu metin uygulamadaki sürümle birebir aynıdır ve tek kaynaktan üretilir.</p>
  <p class="foot__legal">© 2026 Pezzy · İstanbul · 18 yaş ve üzeri</p>
</footer>`;

function sayfaYap(anahtar) {
  const belge = belgeler[anahtar];
  const { dizin, ad } = sayfalar[anahtar];
  const govde = govdeyiHtmlYap(belge.body);

  const sekmeler = Object.entries(sayfalar)
    .map(([k, v]) => {
      const simdi = k === anahtar;
      return `<a href="/${v.dizin}/"${simdi ? ' aria-current="page"' : ''}>${v.ad}</a>`;
    })
    .join('\n      ');

  return `<!DOCTYPE html>
<html lang="tr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${ad} — Pezzy</title>
<meta name="description" content="Pezzy ${ad.toLowerCase()}. ${belge.updated}.">
<link rel="canonical" href="https://pezzyapp.com/${dizin}/">
<meta name="theme-color" content="#150610">
<link rel="icon" href="/assets/icon.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Bodoni+Moda:ital,wght@0,400;0,700;1,400&display=swap&subset=latin,latin-ext" rel="stylesheet">
<link rel="stylesheet" href="/styles.css?v=4">
</head>
<body class="inner-page">

<section class="page-head">
  ${TOPBAR}
  <div class="inner">
    <h1>${ad}</h1>
    <p class="sub">${kacis(belge.updated)}</p>
  </div>
</section>

<main class="doc-wrap">
  <aside class="toc">
    <p class="toc__label">İçindekiler</p>
    <nav aria-label="İçindekiler">
      <ol>
        ${govde.basliklar.map((b) => `<li><a href="#${b.id}">${b.ad}</a></li>`).join('\n        ')}
      </ol>
    </nav>
  </aside>

  <article class="doc">
      ${govde.html}

    <nav class="pagenav" aria-label="Yasal metinler">
      ${sekmeler}
      <a href="/destek/">Destek</a>
      <a href="/hesap-silme/">Hesap silme</a>
    </nav>
  </article>
</main>

${FOOT}

<script src="/site.js" defer></script>

</body>
</html>
`;
}

for (const anahtar of Object.keys(sayfalar)) {
  const { dizin } = sayfalar[anahtar];
  mkdirSync(resolve(kok, dizin), { recursive: true });
  writeFileSync(resolve(kok, dizin, 'index.html'), sayfaYap(anahtar));
  console.log(`${dizin}/index.html yazildi  (${belgeler[anahtar].body.length} karakter metin)`);
}

console.log('\nKaynak:', kaynak);
console.log('Metinler uygulamadan geldi — elle degistirme.');
