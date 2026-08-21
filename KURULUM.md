# londre.ge — kurulum ve yayına alma

Statik site. Build gerekmez, dosyaları olduğu gibi yükle.

```
index.html      Ana sayfa
about.html      Kompani / şirket
services.html   Hizmetler
app.html        Mobil uygulama
contact.html    İletişim + resmi rekvizitler
privacy.html    Gizlilik Politikası
terms.html      Kullanım Şartları
404.html        Hata sayfası
robots.txt, sitemap.xml
assets/         logo, favicon, styles.css, site.js
build.py        İçerik kaynağı (EN+GE tek yerde) — sunucuya yüklemene gerek yok
```

---

## 1. Yayına alma (en hızlısı: Cloudflare Pages)

1. `dash.cloudflare.com` → Workers & Pages → Create → Pages → **Upload assets**
2. Bu klasörü (build.py hariç) sürükle bırak
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

İki yol var:

**A. Doğrudan HTML.** Her metin iki blok halinde:
```html
<div class="en">İngilizce</div><div class="ka">ქართული</div>
```
Sadece ilgili bloğu düzenle. `html[lang]` seçicisi hangisinin görüneceğine karar veriyor.

**B. build.py üzerinden (önerilen).** Metinler `t("English", "ქართული")` ve `blk(...)` çiftleri halinde tek yerde. Düzenle, sonra:
```bash
python3 build.py
```
Tüm HTML sayfaları yeniden üretilir.

---

## 5. Sonra eklenebilecekler

- App Store / Google Play rozetleri (uygulama yayınlandığında `app.html`)
- Telefon numarası — `contact.html` ve footer'a
- Gerçek uygulama ekran görüntüleri (`app.html`)
- Google Maps gömme (`contact.html`)

---

## Notlar

- Gizlilik Politikası ve Kullanım Şartları, uygulamanın gerçekte topladığı verilere göre yazıldı (telefon/SMS OTP, konum, sipariş kayıtları, ödeme, sağlayıcı belgeleri). App Store başvurusunda gizlilik politikası zaten zorunlu — `https://londre.ge/privacy.html` adresini oraya verebilirsin.
- İkisi de bir avukata okutulmalı; Gürcistan mevzuatına göre son hâlini vermek gerekir. Bu metinler taslak niteliğinde.
- Yazı tipleri Google Fonts'tan yükleniyor. Tamamen self-hosted istersen fontları `assets/` altına indirip `@font-face` ile bağlayabilirsin.
