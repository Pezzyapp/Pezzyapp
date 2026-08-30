// Üretilen yasal sayfaların metni, uygulamadaki src/legal.ts ile birebir mi?
//
// Apple siteyi uygulamayla karşılaştırıyor. Bu betik ayrışmayı yayına
// çıkmadan yakalar. Çalıştırma:  node scripts/yasal-dogrula.mjs
// Ayrışma varsa çıkış kodu 1.

import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const kok = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const src = readFileSync(resolve(kok, '../pezzy-proje/src/legal.ts'), 'utf8');

const re =
  /(terms|privacy|kvkk):\s*\{\s*title:\s*'([^']+)',\s*updated:\s*'([^']+)',\s*body:\s*`([\s\S]*?)`,\s*\}/g;

const belgeler = {};
let m;
while ((m = re.exec(src))) belgeler[m[1]] = { title: m[2], updated: m[3], body: m[4] };

const sayfalar = {
  terms: 'kullanim-kosullari',
  privacy: 'gizlilik',
  kvkk: 'kvkk',
};

// HTML'den duz metin: etiketleri at, varlıkları coz, bosluklari sadelestir
const duzMetin = (html) =>
  html
    .replace(/<\/(h2|p|li|ul)>/g, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean)
    .join('\n');

// legal.ts govdesini ayni bicime indirge ("- " isaretleri dusuyor)
const kaynakMetin = (body) =>
  body
    .trim()
    .split('\n')
    .map((s) => s.trim().replace(/^-\s+/, ''))
    .filter(Boolean)
    .join('\n');

let hata = 0;

for (const [anahtar, dizin] of Object.entries(sayfalar)) {
  const html = readFileSync(resolve(kok, dizin, 'index.html'), 'utf8');
  // Yalnizca yasal metnin bulundugu bolum: <article class="doc"> ile <nav arasi.
  // Icindekiler <aside> icinde ve bu araligin disinda — metne karismaz.
  const isaret = '<article class="doc">';
  const bas = html.indexOf(isaret);
  if (bas === -1) {
    hata++;
    console.error(`FARK  /${dizin}/  — doc__body bolumu bulunamadi (sablon degismis olabilir)`);
    continue;
  }
  const govde = html.slice(bas + isaret.length).split('<nav')[0];

  const bekleniyor = kaynakMetin(belgeler[anahtar].body);
  const bulunan = duzMetin(govde);

  if (bekleniyor === bulunan) {
    console.log(`OK    /${dizin}/  — ${bekleniyor.split('\n').length} satır, uygulamayla birebir`);
  } else {
    hata++;
    console.error(`FARK  /${dizin}/  — uygulamadaki metinle AYRIŞIYOR`);
    const a = bekleniyor.split('\n');
    const b = bulunan.split('\n');
    for (let i = 0; i < Math.max(a.length, b.length); i++) {
      if (a[i] !== b[i]) {
        console.error(`  satır ${i + 1}`);
        console.error(`    uygulama: ${a[i] ?? '(yok)'}`);
        console.error(`    site    : ${b[i] ?? '(yok)'}`);
        break;
      }
    }
  }

  // Baslik ve tarih de eslesmeli
  if (!html.includes(belgeler[anahtar].updated)) {
    hata++;
    console.error(`FARK  /${dizin}/  — "${belgeler[anahtar].updated}" sayfada yok`);
  }
}

if (hata) {
  console.error(`\n${hata} ayrışma var. Once src/legal.ts'i duzelt, sonra: node scripts/yasal-uret.mjs`);
  process.exit(1);
}
console.log('\nUc belge de uygulamayla birebir ayni.');
