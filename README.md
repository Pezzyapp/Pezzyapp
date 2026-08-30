# pezzyapp.com

Pezzy'nin tanıtım sitesi. Yapı taşı yok, derleme adımı yok — düz HTML + tek CSS
dosyası. GitHub Pages'e olduğu gibi konulur.

```
index.html              ana sayfa — aşama akışı (1.0 → 4.0)
tokens.css              renk / tipografi / boşluk / hareket jetonları
styles.css              tüm site; ilk satırda tasarım damgası
gizlilik/               Gizlilik Politikası      ← App Store'a verilen adres
kullanim-kosullari/     Kullanım Koşulları
kvkk/                   KVKK Aydınlatma Metni
destek/                 Destek                   ← App Store Support URL
hesap-silme/            Hesap silme adımları
404.html  CNAME  robots.txt  sitemap.xml  .nojekyll
assets/                 uygulama ekran görüntüleri (JPEG, 692 KB)
scripts/                yasal metin üretici + doğrulayıcı
.hallmark/log.json      tasarım kararlarının kaydı
```

Yapı taşı, derleme adımı, JavaScript yok.

## Tasarım

`styles.css`'in ilk satırındaki damga kararları kaydeder: editorial tür,
Narrative Workflow makro yapısı, kenara hizalı gezinme (N9), künye altbilgi
(Ft4), uygulamadan türetilmiş özel palet.

**Renk ve font eklerken önce `tokens.css`'e jeton olarak gir**, sonra
`var(--...)` ile kullan. Gövdeye doğrudan `#hex` veya `oklch()` yazma —
sistem üçüncü düzenlemede dağılıyor.

Üç yazı karakteri tavan: Bodoni Moda (başlık), IBM Plex Sans (gövde),
IBM Plex Mono (yalnızca künye/ek açıklama rolü — buton ve gezinmede
kullanma).

Başlıklar **roman**; italik başlık kullanma.

---

## Yasal metinlere ELLE DOKUNMA

Üç yasal sayfanın metni **uygulamadan üretilir**. Tek kaynak:
`../pezzy-proje/src/legal.ts`.

Apple, incelemede siteyi uygulamayla karşılaştırıyor; ikisi ayrışırsa başvuru
takılıyor. Bu yüzden arada insan eli yok:

```bash
node scripts/yasal-uret.mjs
```

`gizlilik/`, `kullanim-kosullari/` ve `kvkk/` içindeki `index.html` dosyalarını
sıfırdan yazar. Bu üç dosyayı elle düzenlersen ilk üretimde kaybolur — zaten
amaç bu.

Yayına çıkmadan önce her seferinde:

```bash
node scripts/yasal-dogrula.mjs
```

Üç belgeyi uygulamadaki metinle satır satır karşılaştırır. Ayrışma varsa
hangi satırda olduğunu yazar ve çıkış kodu 1 döner.

**Metin değişecekse sıra şu:** önce `pezzy-proje/src/legal.ts` → sonra
`node scripts/yasal-uret.mjs` → sonra `node scripts/yasal-dogrula.mjs` → sonra
yayına al.

---

## Yerelde çalıştırma

```bash
python3 -m http.server 8765
```

Sonra `http://localhost:8765`. Alt sayfaların `/gizlilik/` gibi çalışması için
sunucu şart; dosyayı çift tıklayıp açma.

---

## Yayına alma

Site GitHub Pages'te, `pezzyapp.github.io` hesabından servis ediliyor
(`www.pezzyapp.com` CNAME kaydı oraya bakıyor).

```bash
git clone https://github.com/pezzyapp/pezzyapp.github.io.git /tmp/pezzy-site
```

Depodaki eski `index.html` (957 KB'lık tek parça "bundled page") **silinmeli** —
yenisiyle aynı ada sahip, üzerine yazılacak, ama eski depoda başka artık dosya
varsa onları da temizle.

```bash
cp -R /Users/mahsunkaraca/Desktop/pezzywebsite/. /tmp/pezzy-site/
```

`.claude/` ve `README.md` gitmesin istersen `.gitignore`'a ekle; zararları yok.

`CNAME` dosyası depoda **kalmalı** — içinde `pezzyapp.com` yazıyor, özel alan
adını o tutuyor. Silinirse site `pezzyapp.github.io` adresine düşer.

```bash
cd /tmp/pezzy-site && git add -A && git commit -m "Site yeniden yazıldı" && git push
```

Pages birkaç dakikada yayınlar. Sonra şunu doğrula:

```bash
curl -o /dev/null -w "%{http_code}\n" https://pezzyapp.com/gizlilik/
```

`200` görmen gerekiyor. App Store'a yazılacak adres bu.

---

## App Store Connect'e girilecek adresler

| Alan | Değer |
|---|---|
| Support URL | `https://pezzyapp.com/destek/` |
| Marketing URL | `https://pezzyapp.com` |
| Privacy Policy URL | `https://pezzyapp.com/gizlilik/` |

`store/magaza-metinleri.md` dosyasında Support URL `https://pezzyapp.com` ve
gizlilik adresi `https://pezzyapp.com/gizlilik` (sondaki eğik çizgi yok) olarak
yazılı. İkisi de çalışıyor — GitHub Pages `/gizlilik` isteğini `/gizlilik/`
adresine yönlendirir. Yine de mağaza metnindeki Support URL'i `/destek/` olarak
güncellemek daha doğru: Apple destek adresinde iletişim yolu arar, ana sayfa
değil o sayfa karşılıyor.
