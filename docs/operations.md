# Operations runbook

Internal deployment and compliance notes for [londre.ge](https://londre.ge).
For the project overview, local development and content conventions, see the
[README](../README.md).

Static site. No build step; upload the files as they are.

```
index.html      Home
about.html      About us (company, platform, roles, verification, coverage)
services.html   Services and prices (GEL)
app.html        Mobile application
contact.html    Contact + official company details
privacy.html    Privacy Policy
terms.html      Terms of Service
refund.html     Delivery, cancellation and refund policy
404.html        Error page
robots.txt, sitemap.xml
assets/         logo, favicon, styles.css, site.js
assets/fonts/   FiraGO woff2 (subset, self-hosted)
tools/          Font build script + OG image source — DO NOT UPLOAD
_fontsrc/       Font build working directory — DO NOT UPLOAD (gitignored)
```

> Do not include the `tools/` and `_fontsrc/` directories when uploading. They
> serve no purpose on the site itself; they exist only to regenerate assets.

---

## 1. Deployment (fastest: Cloudflare Pages)

1. `dash.cloudflare.com` → Workers & Pages → Create → Pages → **Upload assets**
2. Drag and drop this folder (excluding `tools/` and `_fontsrc/`)
3. Deploy → you get a temporary `*.pages.dev` address
4. Custom domains → add `londre.ge` and `www.londre.ge`
5. Update the DNS records as Cloudflare instructs
6. SSL is provisioned automatically

**Netlify alternative:** `app.netlify.com/drop` → drag the folder → Domain settings → add `londre.ge`.

**On your own server:** copy the files to the web root (`/var/www/londre.ge`) and obtain a certificate with Let's Encrypt.

## 2. Post-deployment checks

- [ ] `https://londre.ge` opens in a private window, without a VPN
- [ ] `https://www.londre.ge` works too (a redirect is sufficient)
- [ ] The SSL certificate is valid and the browser shows no warning
- [ ] The EN/GE switch works
- [ ] The menu opens on mobile
- [ ] `official@londre.ge` genuinely works and receives mail

> That last item matters: Apple sometimes writes to this address. Set the
> mailbox up if it is not active.

---

## 3. Apple Developer — reapplication

There was a single reason for the rejection: the site given in the application
did not have enough content. This site meets those requirements:

| What Apple asked for | Where it is on the site |
|---|---|
| A public, working site | All pages are static, no login |
| Domain matches the company | `londre.ge` ↔ LONDRE AI LLC |
| Not a social media link | Its own domain |
| Not "minimal content" | 9 pages, two languages |
| Not a registrar parking page | Real content |
| Legal identity visible | Footer + contact.html + about.html |

**Order of operations:**

1. Deploy the site and **wait 24 hours** (so DNS + SSL settle fully)
2. Verify that the company name on the D-U-N-S record is character-for-character identical to **LONDRE AI LLC**
3. Apple Developer → Enrollment → reapply
4. Enter `https://londre.ge` in the Website field
5. The company name and address in the application must be character-for-character identical to `contact.html`

---

## 4. Bank of Georgia — online payment requirements

Before it issues payment credentials, Bank of Georgia checks that the site
clearly shows the following. Each one has a fixed home:

| What the bank asks for | Where it is on the site |
|---|---|
| About the company | `about.html` (nav: About us) |
| Phone, email and address | `contact.html`, the footer of every page, JSON-LD |
| Description of the services | `services.html` |
| Prices, amount and currency | `services.html#prices` — tables in GEL |
| Delivery, return, cancellation and refund policy | `refund.html` (+ summary in `terms.html` §4–6) |
| Privacy policy | `privacy.html` |
| Other terms of use | `terms.html` |

**The business model the site states** (agreed 2026-10-26): a tow is vehicle
transport only, at a fixed tariff; a car wash request goes out without a price
and each car wash offers its own; the customer pays in full, by card, before
the service; cash is not accepted. So the site publishes the tow tariff but no
car wash prices.

The tow tariff and the cancellation fees are copied from the app's server
config (`app_config/pricing` and `app_config/fees`, defaults in
`londre-flutter/functions/src/config.ts` and `pricing.ts`). They are not read
live. When a value changes there, change it here in the same step:
`services.html#prices`, `refund.html` §4, `terms.html` §6 — otherwise the site
and the app charge different amounts.

The app does not yet work this way everywhere: car washes are still charged a
fixed catalogue price, and payment is a card hold captured at completion
rather than a full prepayment. Until the app follows the model above, the site
describes the agreed model, not the current build.

The phone number (+995 597 98 01 88) appears in the same places as the email
address: the footer of every page, `contact.html`, the policies and JSON-LD.
Change all of them together: `grep -rn '597980188\|597 98 01 88' *.html`.

---

## 5. Updating content and fonts

Covered in the [README](../README.md#editing-content) — the bilingual block
convention and the font rebuild script. Not duplicated here, so the two cannot
drift apart.

## 6. Possible additions later

- App Store / Google Play badges (in `app.html`, once the app is published)
- Real application screenshots (`app.html`)
- Google Maps embed (`contact.html`)

If you need to change the OG image (`assets/og.png`), the source is
`tools/og-source.html` — edit it, then take a 1200×630 headless screenshot.

---

## Notes

- The Privacy Policy and Terms of Service were written to match what the app actually collects (phone/SMS OTP, location, order records, payment, provider documents). A privacy policy is already mandatory for an App Store submission — you can give `https://londre.ge/privacy.html` as that address.
- Both should be reviewed by a lawyer; they need to be finalised under Georgian law. These texts are drafts.
- The fonts are self-hosted (FiraGO, SIL OFL). No request goes to Google Fonts — this was chosen for both privacy and speed.

### Where the legal identity lives (take care when changing it)

Apple's verification depends on the legal entity name being visible on the site.
The identity information is deliberately kept in **one canonical set of places**
rather than scattered across pages:

| Place | What it holds |
|---|---|
| The footer of every page | LONDRE AI LLC + full address |
| The details table in `contact.html` | Legal entity, legal form, jurisdiction, address, email |
| The JSON-LD `Organization` on every page | The same information, machine-readable |

Do not break these three. The company name and address you give in the
application must be character-for-character identical to the table in
`contact.html` — and must match the D-U-N-S record too.
