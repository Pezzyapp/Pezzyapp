# Sabah notları — 28 Ağustos 2026

Site bitti, yayına hazır. Aşağıda gece verdiğim kararlar ve senin onayını
bekleyen üç madde var.

---

## Ne yapıldı

Site **iki kez** yazıldı. İlk sürümü sen "çok hata görüyorum" deyip Hallmark
skill'ini verince attım ve baştan kurdum. Doğru karardı — ilk sürüm skill'in
yasakladığı yedi deseni birden taşıyordu (italik başlıklar, her bölümde
etiket, etiket-sol/başlık-sağ düzeni, üç sütunlu ikonlu kart ızgarası,
dört sütunlu "SaaS" altbilgisi, gövdeye gömülü renkler, `:focus-visible` yok).

İkinci sürümün kararları `styles.css`'in ilk satırındaki damgada ve
`.hallmark/log.json`'da kayıtlı:

| | |
|---|---|
| Tür | editorial |
| Makro yapı | Narrative Workflow — aşamalar 1.0 İncele → 2.0 Yakıştır → 3.0 Kilit → 4.0 Konuş |
| Palet | özel, uygulamanın `theme.ts`'inden türetildi; koyu kadife zemin |
| Yazı | Bodoni Moda (başlık) · IBM Plex Sans (gövde) · IBM Plex Mono (künye) |
| Gezinme | N9 kenara hizalı — wordmark solda, tek buton sağda, arası boş |
| Altbilgi | Ft4 künye |

**Makro yapıyı Narrative Workflow seçmemin sebebi:** ürün zaten sıralı bir
süreç. Aşama numaraları böylece süs değil, gerçekten sıralı — skill'in
"her bölüme etiket koyma" yasağı bu durumda geçerli değil.

**Kilit aşaması sayfanın tek ızgara kırımı:** zemini değişiyor, üst çizgisi
gül rengine dönüyor. Uygulamanın tüm mantığı orada, görsel ağırlığı da orada
olsun istedim.

## Doğrulananlar

- Yasal metinler `pezzy-proje/src/legal.ts` ile **birebir** — otomatik denetleniyor
- Kontrast: 61 metin öğesi ölçüldü, sıfır hata (WCAG 4.5:1 / 3:1)
- 320 · 375 · 414 · 768 px: yatay taşma yok, iki satıra kırılan buton yok
- Hero 1280×800'de kaydırmadan sığıyor
- Tüm sayfalar ve iç bağlantılar 200

Yerel sunucu hâlâ açık: <http://localhost:8765>

---

## Senin kararını bekleyen üç şey

**1. Meydan'ı siteden tamamen çıkardım.** Mağaza notunda "Meydan sekmesi
*çok yakında* ekranı gösteriyor, bu sürümde yok" yazıyor; eski site ise onu
çalışan bir özellik gibi anlatıyordu. Apple'ın 2.3.1 (yanıltıcı metadata)
maddesi tam olarak bu. Sitede Meydan geçmiyor. Katılmıyorsan söyle.

**2. Support URL'i `/destek/` yapmanı öneriyorum.** Mağaza metinlerinde şu an
`https://pezzyapp.com` yazıyor. Apple destek adresinde çalışan bir iletişim
yolu arar; ana sayfa değil, `/destek/` sayfası karşılıyor. Gizlilik adresi
zaten doğru: `https://pezzyapp.com/gizlilik`.

**3. "App Store'da çok yakında" butonu pasif.** Uygulama yayında olmadığı için
indirme bağlantısı vermedim. TestFlight/App Store bağlantısı çıkınca burayı
ve `index.html`'deki "Pezzy iOS için hazırlanıyor" başlığını güncellememiz
gerekecek.

---

## Yayına alma

`README.md`'de adım adım yazılı. Özet: `pezzyapp/pezzyapp.github.io` deposunu
klonla, bu klasörün içeriğini üstüne kopyala, push'la. `CNAME` dosyası
**kalmalı** — özel alan adını o tutuyor.

Yayına aldıktan sonra tek doğrulama:

```bash
curl -o /dev/null -w "%{http_code}\n" https://pezzyapp.com/gizlilik/
```

`200` görmen gerekiyor. App Store'a yazacağın adres bu.

`gh` CLI kurulu değil, GitHub hesabına da erişimim yok — o adımı senin
yapman gerekiyor, beş dakikalık iş.

---

## Metin değiştirmek gerekirse

Yasal sayfalara **elle dokunma**. Sıra:

```bash
node scripts/yasal-uret.mjs
node scripts/yasal-dogrula.mjs
```

Doğrulayıcı, üç belgeyi uygulamadaki metinle satır satır karşılaştırır;
ayrışma varsa hangi satırda olduğunu söyler ve hata koduyla çıkar. Yayına
almadan önce her seferinde çalıştır.
