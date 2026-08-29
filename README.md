# Londre — Website

The public website for **Londre**, an on-demand automotive services platform
operating in Georgia. Drivers use the Londre mobile app to find and order car
washing and roadside recovery; verified service businesses use the same app to
receive and fulfil those orders.

Production: **[londre.ge](https://londre.ge)**

---

## Overview

A static, dependency-free marketing and compliance site. Eight pages, fully
bilingual in English and Georgian, built to load fast on mobile networks and to
stand as the company's verifiable public presence.

There is no build step, no framework and no package manager. The HTML files are
the source of truth; deployment is a file copy.

## Highlights

- **Bilingual by construction** — every string ships in English and Georgian, switched client-side with no page reload and no duplicated pages.
- **Zero third-party requests** — no CDN, no analytics, no Google Fonts. Nothing about a visitor leaves the origin.
- **Self-hosted, script-split typography** — FiraGO renders Latin and Georgian in one type family, subset by `unicode-range` so an English visitor never downloads Georgian glyphs.
- **Accessible** — skip link, semantic landmarks, keyboard-navigable menu, and a motion layer gated behind `prefers-reduced-motion`.
- **Print-ready** — a dedicated print stylesheet strips navigation and interactive chrome, which matters for the legal pages.
- **Structured data** — JSON-LD `Organization` on every page, so the legal entity is machine-readable.

## Tech stack

| | |
|---|---|
| Markup | Hand-authored HTML5, one file per page |
| Styling | Modern CSS — custom properties, grid, `clamp()` fluid type. No framework. |
| Behaviour | Vanilla JavaScript (~277 lines), no dependencies |
| Typography | FiraGO (SIL OFL), self-hosted `woff2`, weights 400/500/600 |
| Structured data | JSON-LD (`Organization`, `PostalAddress`) |
| Tooling | `python3` — only to rebuild font subsets, never at deploy time |

Total weight of CSS, JavaScript and all six font files is **≈128 KB**.

## Project structure

```
index.html         Home
about.html         How it works — platform, roles, verification, coverage
services.html      Services
app.html           Mobile application
contact.html       Contact and official company details
privacy.html       Privacy Policy
terms.html         Terms of Service
404.html           Error page

assets/
  styles.css       All styling
  site.js          Language switching, navigation, header state, scroll reveal
  fonts/           FiraGO woff2 subsets, split Latin / Georgian
  logo·favicon·og  Brand and social-preview imagery

tools/             Font build script and OG image source — not deployed
docs/              Internal deployment and operations runbook
robots.txt, sitemap.xml
```

## Local development

No dependencies and no build. Serve the directory over HTTP — opening the files
via `file://` will break the font loading and language switching.

```bash
python3 -m http.server 8000
```

Then visit **http://localhost:8000**.

## Editing content

Every piece of copy exists as two sibling blocks. The `lang` attribute on
`<html>` decides which one is displayed:

```html
<div class="en">English copy</div>
<div class="ka">ქართული ტექსტი</div>
```

Edit only the relevant block — **and update both languages in the same change.**
A page where the two drift apart will silently show stale copy to half the
audience.

### Typography

Fonts are self-hosted and subset. If a new weight is needed, or the character
set grows, rebuild them and commit the output:

```bash
./tools/build-fonts.sh
```

If you introduce a character FiraGO does not carry — an arrow or icon glyph,
say — the browser falls back to another face and the text looks inconsistent.
Either extend the range in `tools/build-fonts.sh`, or draw the icon in CSS.

## Company details

The legal entity name and address appear in three deliberately canonical
places: the footer of every page, the details table in `contact.html`, and the
JSON-LD `Organization` block. These are relied upon for external verification
and must be kept identical to one another — see
[`docs/operations.md`](docs/operations.md) before changing them.

## Deployment

The site is static, so any host that serves files will do. `tools/` and the
gitignored `_fontsrc/` should be excluded from what gets served.

Full procedure, post-deployment checks and operational notes:
[`docs/operations.md`](docs/operations.md).

---

© LONDRE AI LLC. All rights reserved.
The FiraGO typeface is used under the SIL Open Font License 1.1.
