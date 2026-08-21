/* =========================================================================
   Londre — londre.ge
   Language switching · mobile navigation · header state · scroll reveal
   No dependencies. Everything degrades gracefully without JS.
   ========================================================================= */
(function () {
  'use strict';

  var doc  = document;
  var root = doc.documentElement;
  /* Kept in sync by hand with the inline font-preload script in every <head>.
     If this key or the 'ka' sniff changes, change it there too, or a Georgian
     visitor loses the preload and waits on the swap. */
  var STORE_KEY = 'londre-lang';
  var LANGS = ['en', 'ka'];

  /* ------------------------------------------------------------ language */

  var titles = {
    en: getMeta('title-en'),
    ka: getMeta('title-ka')
  };

  function getMeta(name) {
    var el = doc.querySelector('meta[name="' + name + '"]');
    return el ? el.getAttribute('content') : null;
  }

  function store(key, value) {
    try { localStorage.setItem(key, value); } catch (e) { /* private mode */ }
  }

  function read(key) {
    try { return localStorage.getItem(key); } catch (e) { return null; }
  }

  function setLang(lang, persist) {
    if (LANGS.indexOf(lang) === -1) lang = 'en';

    root.setAttribute('lang', lang);

    if (titles[lang]) doc.title = titles[lang];

    doc.querySelectorAll('.lang button[data-lang]').forEach(function (btn) {
      btn.setAttribute('aria-pressed', String(btn.dataset.lang === lang));
    });

    if (persist) store(STORE_KEY, lang);
  }

  /* Stored choice wins; otherwise fall back to the browser's language so a
     Georgian visitor lands on Georgian. */
  var saved = read(STORE_KEY);
  if (saved) {
    setLang(saved, false);
  } else if ((navigator.language || '').toLowerCase().indexOf('ka') === 0) {
    setLang('ka', false);
  } else {
    setLang(root.getAttribute('lang') || 'en', false);
  }

  doc.querySelectorAll('.lang button[data-lang]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      setLang(btn.dataset.lang, true);
    });
  });

  /* ---------------------------------------------------- mobile navigation */

  var header = doc.querySelector('.site-header');
  var toggle = doc.querySelector('.nav-toggle');

  function closeNav() {
    if (!header || !header.classList.contains('open')) return;
    header.classList.remove('open');
    if (toggle) toggle.setAttribute('aria-expanded', 'false');
  }

  if (header && toggle) {
    toggle.addEventListener('click', function (e) {
      e.stopPropagation();
      var open = header.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(open));
    });

    doc.addEventListener('click', function (e) {
      if (header.classList.contains('open') && !header.contains(e.target)) closeNav();
    });

    doc.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeNav();
    });

    doc.querySelectorAll('.nav-links a').forEach(function (a) {
      a.addEventListener('click', closeNav);
    });

    window.addEventListener('resize', function () {
      if (window.innerWidth > 900) closeNav();
    });
  }

  /* ------------------------------------------------------- header on scroll */

  if (header) {
    var ticking = false;

    var onScroll = function () {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(function () {
        header.classList.toggle('scrolled', window.scrollY > 8);
        ticking = false;
      });
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ------------------------------------------------------------------ motion */

  var reduced = window.matchMedia &&
                window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasIO   = 'IntersectionObserver' in window;

  /* One observer serves both the reveals and the status panel. Each target
     carries its own callback, so there is a single scroll-driven code path. */
  var io = null;
  if (hasIO) {
    io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        io.unobserve(entry.target);
        var queue = entry.target._onEnter || [];
        queue.forEach(function (fn) { fn(entry.target); });
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
  }

  /* An element can be registered more than once — the hero status panel is both
     a reveal target and an animation target — so callbacks stack rather than
     replace, and the element is only observed the first time round. */
  function watch(el, fn) {
    if (!io) return;
    if (el._onEnter) { el._onEnter.push(fn); return; }
    el._onEnter = [fn];
    io.observe(el);
  }

  /* --- scroll reveal -------------------------------------------------------
     The stagger lives in CSS as transition-delay: calc(var(--i) * 70ms). JS
     only marks position, so the sequencing is the browser's job, not a pile
     of timers. .reveal is added here so no-JS visitors never see opacity: 0. */

  if (!reduced && hasIO) {
    var groups = [
      '.hero-grid > *',
      '.section-head',
      '.grid > *',
      '.steps > .step',
      '.table-shell',
      '.contact-item',
      '.cta > .wrap'
    ];

    var seen = new Set();

    groups.forEach(function (selector) {
      doc.querySelectorAll(selector).forEach(function (el) {
        if (seen.has(el)) return;
        seen.add(el);

        var siblings = el.parentElement
          ? Array.prototype.slice.call(el.parentElement.children)
          : [];
        var index = siblings.indexOf(el);
        el.style.setProperty('--i', String(Math.min(index < 0 ? 0 : index, 5)));
        el.classList.add('reveal');

        watch(el, function (node) { node.classList.add('in'); });
      });
    });
  }

  /* --- status panel: play the order through once ---------------------------
     Marking .anim is what arms the CSS; the panel's resting state is the
     finished one, so without JS it simply reads as a completed timeline. */

  var panel = doc.querySelector('.status-panel');
  if (panel && !reduced && hasIO) {
    var rows = panel.querySelectorAll('.status-list li');
    Array.prototype.forEach.call(rows, function (li, i) {
      li.style.setProperty('--i', String(i));
    });
    panel.classList.add('anim');
    watch(panel, function (node) { node.classList.add('ran'); });
  }

  /* --- card hover sheen ----------------------------------------------------
     One delegated listener for every card on the page, coalesced into an
     animation frame. Skipped on coarse pointers, where hover does not exist. */

  var fine = window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (fine && !reduced) {
    var card = null, px = 0, py = 0, queued = false;

    doc.addEventListener('pointermove', function (e) {
      var hit = e.target.closest && e.target.closest('.card');
      if (!hit) return;
      card = hit; px = e.clientX; py = e.clientY;

      if (queued) return;
      queued = true;
      window.requestAnimationFrame(function () {
        queued = false;
        if (!card) return;
        var r = card.getBoundingClientRect();
        card.style.setProperty('--mx', ((px - r.left) / r.width  * 100) + '%');
        card.style.setProperty('--my', ((py - r.top)  / r.height * 100) + '%');
      });
    }, { passive: true });
  }

  /* --- nav sliding marker --------------------------------------------------
     Desktop only: below 901px the nav is a stacked drop-down where a sliding
     pill would mean nothing. Writes three custom properties; CSS animates. */

  var navLinks = doc.querySelector('.nav-links');
  if (navLinks && !reduced && window.matchMedia) {
    var wide = window.matchMedia('(min-width: 901px)');

    var moveTo = function (link) {
      if (!link) {
        navLinks.style.setProperty('--marker-o', '0');
        return;
      }
      var a = link.getBoundingClientRect();
      var b = navLinks.getBoundingClientRect();
      navLinks.style.setProperty('--marker-x', (a.left - b.left) + 'px');
      navLinks.style.setProperty('--marker-w', a.width + 'px');
      navLinks.style.setProperty('--marker-o', '1');
    };

    var current = function () { return navLinks.querySelector('a[aria-current="page"]'); };
    var rest = function () { moveTo(current()); };

    var enable = function () {
      if (!wide.matches) {
        navLinks.classList.remove('has-marker');
        navLinks.style.setProperty('--marker-o', '0');
        return;
      }
      navLinks.classList.add('has-marker');
      rest();
    };

    navLinks.addEventListener('pointerover', function (e) {
      if (!wide.matches) return;
      var a = e.target.closest && e.target.closest('a');
      if (a) moveTo(a);
    });
    navLinks.addEventListener('pointerleave', function () {
      if (wide.matches) rest();
    });

    if (wide.addEventListener) wide.addEventListener('change', enable);
    window.addEventListener('resize', enable);

    /* Wait for the webfont before measuring — link widths shift when FiraGO
       replaces the fallback, and a marker sized against the wrong metrics
       sits visibly off. */
    if (doc.fonts && doc.fonts.ready) doc.fonts.ready.then(enable);
    else enable();
    enable();
  }
})();
