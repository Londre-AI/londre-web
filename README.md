# londre.ge — kurulum ve yayına alma

Statik site. Build gerekmez, dosyaları olduğu gibi yükle.

```
index.html      Ana sayfa
about.html      Nasıl çalışır (platform, roller, doğrulama, kapsam)
services.html   Hizmetler
app.html        Mobil uygulama
contact.html    İletişim + resmi rekvizitler
privacy.html    Gizlilik Politikası
terms.html      Kullanım Şartları
404.html        Hata sayfası
robots.txt, sitemap.xml
assets/         logo, favicon, styles.css, site.js
assets/fonts/   FiraGO woff2 (subset edilmiş, self-hosted)
tools/          Font build script + OG görsel kaynağı — YÜKLEME
_fontsrc/       Font build çalışma klasörü — YÜKLEME (gitignore'da)
```

> Yükleme sırasında `tools/` ve `_fontsrc/` klasörlerini dahil etme. Site
> tarafında hiçbir işe yaramazlar; sadece varlıkları yeniden üretmek için.

---

## 1. Yayına alma (en hızlısı: Cloudflare Pages)

1. `dash.cloudflare.com` → Workers & Pages → Create → Pages → **Upload assets**
2. Bu klasörü (`tools/` ve `_fontsrc/` hariç) sürükle bırak
3. Deploy → geçici bir `*.pages.dev` adresi verir
4. Custom domains → `londre.ge` ve `www.londre.ge` ekle
5. DNS kayıtlarını Cloudflare gösterdiği gibi güncelle
6. SSL otomatik gelir

**Netlify alternatifi:** `app.netlify.com/drop` → klasörü sürükle → Domain settings → `londre.ge` ekle.

**Kendi sunucun varsa:** dosyaları web root'a (`/var/www/londre.ge`) kopyala, Let's Encrypt ile sertifika al.

## 2. Yayından sonra kontrol et

- [ ] `https://londre.ge` gizli sekmede, VPN'siz açılıyor
- [ ] `https://www.londre.ge` de çalışıyor (yönlendirme yeterli)
- [ ] SSL sertifikası geçerli, tarayıcı uyarı vermiyor
- [ ] EN/GE geçişi çalışıyor
- [ ] Mobilde menü açılıyor
- [ ] `official@londre.ge` gerçekten çalışıyor ve mail alıyor

> Son madde önemli: Apple bazen bu adrese yazıyor. Mailbox aktif değilse ayarla.

---

## 3. Apple Developer — yeniden başvuru

Reddedilme sebebi tek şeydi: başvuruda verilen sitede yeterli içerik yoktu. Bu site şu gereklilikleri karşılıyor:

| Apple'ın istediği | Sitede nerede |
|---|---|
| Kamuya açık, çalışan site | Tüm sayfalar statik, login yok |
| Domain şirketle eşleşiyor | `londre.ge` ↔ LONDRE AI LLC |
| Sosyal medya linki değil | Kendi domain'i |
| "Minimal content" değil | 8 sayfa, iki dil |
| Registrar park sayfası değil | Gerçek içerik |
| Yasal kimlik görünür | Footer + contact.html + about.html |

**Sıra:**

1. Siteyi yayına al, **24 saat bekle** (DNS + SSL tam otursun)
2. D-U-N-S kaydındaki şirket adının **LONDRE AI LLC** ile birebir aynı olduğunu doğrula
3. Apple Developer → Enrollment → yeniden başvur
4. Website alanına `https://londre.ge` yaz
5. Başvurudaki şirket adı ve adres, sitedeki `contact.html` ile birebir aynı olsun

---

## 4. İçerik güncelleme

Doğrudan HTML üzerinden. Her metin iki blok halinde:
```html
<div class="en">İngilizce</div><div class="ka">ქართული</div>
```
Sadece ilgili bloğu düzenle. `html[lang]` seçicisi hangisinin görüneceğine karar veriyor.

> Eski sürümlerde bir `build.py` vardı; artık yok. Tek kaynak HTML dosyalarının
> kendisi. İki dilden birini güncellerken diğerini de güncellemeyi unutma.

### Yazı tipi hakkında

Fontlar **self-hosted** (`assets/fonts/`), Google Fonts'a bağımlılık yok.
FiraGO, Latin ve Gürcü alfabesini tek ailede taşıyor — dil değişince yazı
karakteri değişmiyor. Dosyalar `unicode-range` ile ikiye bölünmüş: İngilizce
ziyaretçi Gürcüce glifleri hiç indirmiyor.

Yeni bir ağırlık gerekirse veya karakter seti genişlerse:
```bash
./tools/build-fonts.sh
```
Script fontları indirir, subset eder, `assets/fonts/` içine yazar. Çıktıyı
commit'le. Sadece `python3` gerekiyor; venv'i kendi kuruyor.

> Metne FiraGO'da olmayan bir sembol eklersen (örn. bir ok veya ikon karakteri)
> tarayıcı yedek fonta düşer ve tutarsız görünür. Böyle durumlarda ya karakteri
> `tools/build-fonts.sh` içindeki `LATIN` aralığına ekle, ya da — ikonsa —
> `styles.css`'teki `.nav-toggle` gibi CSS ile çiz.

---

## 5. Sonra eklenebilecekler

- App Store / Google Play rozetleri (uygulama yayınlandığında `app.html`)
- Telefon numarası — `contact.html` ve footer'a
- Gerçek uygulama ekran görüntüleri (`app.html`)
- Google Maps gömme (`contact.html`)

OG görselini (`assets/og.png`) değiştirmen gerekirse kaynağı
`tools/og-source.html` — düzenle, sonra 1200×630 headless screenshot al.

---

## Notlar

- Gizlilik Politikası ve Kullanım Şartları, uygulamanın gerçekte topladığı verilere göre yazıldı (telefon/SMS OTP, konum, sipariş kayıtları, ödeme, sağlayıcı belgeleri). App Store başvurusunda gizlilik politikası zaten zorunlu — `https://londre.ge/privacy.html` adresini oraya verebilirsin.
- İkisi de bir avukata okutulmalı; Gürcistan mevzuatına göre son hâlini vermek gerekir. Bu metinler taslak niteliğinde.
- Yazı tipleri self-hosted (FiraGO, SIL OFL). Google Fonts'a hiçbir istek gitmiyor — bu hem gizlilik hem hız açısından tercih edildi.

### Yasal kimlik nerede duruyor (değiştirirken dikkat)

Apple'ın doğrulaması sitede tüzel kişi adının görünmesine bağlı. Kimlik bilgisi
bilinçli olarak **tek kanonik yerde** tutuluyor, sayfalara dağıtılmadı:

| Yer | Ne var |
|---|---|
| Her sayfanın footer'ı | LONDRE AI LLC + tam adres |
| `contact.html` künye tablosu | Tüzel kişi, hukuki form, yargı yetkisi, adres, e-posta |
| Her sayfada JSON-LD `Organization` | Makine tarafından okunabilir aynı bilgi |

Bu üçünü bozma. Başvuruda verdiğin şirket adı ve adres, `contact.html`'deki
tablo ile birebir aynı olmalı — D-U-N-S kaydıyla da eşleşmeli.
