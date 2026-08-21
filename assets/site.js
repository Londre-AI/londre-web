/* =========================================================================
   Londre — londre.ge
   Language switching · mobile navigation · header state · scroll reveal
   No dependencies. Everything degrades gracefully without JS.
   ========================================================================= */
(function () {
  'use strict';

  var doc  = document;
  var root = doc.documentElement;
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

  /* ---------------------------------------------------------- scroll reveal */

  var reduced = window.matchMedia &&
                window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!reduced && 'IntersectionObserver' in window) {
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
    var targets = [];

    groups.forEach(function (selector) {
      doc.querySelectorAll(selector).forEach(function (el) {
        if (seen.has(el)) return;
        seen.add(el);
        targets.push(el);
      });
    });

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        // stagger siblings so a row of cards arrives in sequence
        var delay = Number(el.dataset.revealIndex || 0) * 70;
        setTimeout(function () { el.classList.add('in'); }, delay);
        io.unobserve(el);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

    targets.forEach(function (el) {
      var siblings = el.parentElement ? Array.prototype.slice.call(el.parentElement.children) : [];
      var index = siblings.indexOf(el);
      el.dataset.revealIndex = String(Math.min(index < 0 ? 0 : index, 5));
      el.classList.add('reveal');
      io.observe(el);
    });
  }
})();
