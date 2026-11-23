// NW Saber Syndicate — static preview copy interactions
(function () {
  // mobile nav + MORE dropdown
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.querySelector('.main-nav');
  if (toggle && nav) toggle.addEventListener('click', function () { nav.classList.toggle('open'); });
  var moreWrap = document.querySelector('.more-wrap');
  var moreBtn = document.querySelector('.more-btn');
  if (moreWrap && moreBtn) {
    moreBtn.addEventListener('click', function (e) { e.stopPropagation(); moreWrap.classList.toggle('open'); });
    document.addEventListener('click', function () { moreWrap.classList.remove('open'); });
  }

  // subscribe form (dead form on the copy — mirrors the real thank-you message)
  var sub = document.getElementById('subscribe-form');
  if (sub) sub.addEventListener('submit', function (e) {
    e.preventDefault();
    var t = document.querySelector('.sub-thanks');
    if (t) t.style.display = 'block';
  });

  // header search -> shop page
  var searchForm = document.getElementById('site-search');
  if (searchForm) searchForm.addEventListener('submit', function (e) {
    e.preventDefault();
    var q = document.getElementById('site-search-input').value.trim();
    var base = searchForm.getAttribute('data-shop');
    window.location.href = base + (q ? '?q=' + encodeURIComponent(q) : '');
  });

  // ---------- shop filtering ----------
  var grid = document.getElementById('product-grid');
  if (grid) {
    var cards = Array.prototype.slice.call(grid.querySelectorAll('.card'));
    var chips = Array.prototype.slice.call(document.querySelectorAll('.chip'));
    var countEl = document.getElementById('shop-count');
    var noRes = document.getElementById('no-results');
    var sortSel = document.getElementById('sort-select');
    var params = new URLSearchParams(window.location.search);
    var state = {
      cat: params.get('cat') || 'All Products',
      min: params.get('min') ? parseFloat(params.get('min')) : null,
      max: params.get('max') ? parseFloat(params.get('max')) : null,
      q: (params.get('q') || '').toLowerCase()
    };
    function effPrice(card) { return parseFloat(card.getAttribute('data-price')); }
    function apply() {
      var visible = 0;
      cards.forEach(function (card) {
        var cats = (card.getAttribute('data-cats') || '').split('|');
        var name = (card.getAttribute('data-name') || '').toLowerCase();
        var price = effPrice(card);
        var ok = true;
        if (state.cat !== 'All Products' && cats.indexOf(state.cat) === -1) ok = false;
        if (state.min !== null && price < state.min) ok = false;
        if (state.max !== null && price > state.max) ok = false;
        if (state.q && name.indexOf(state.q) === -1) ok = false;
        card.style.display = ok ? '' : 'none';
        if (ok) visible++;
      });
      if (countEl) countEl.textContent = visible + (visible === 1 ? ' product' : ' products');
      if (noRes) noRes.style.display = visible ? 'none' : 'block';
      chips.forEach(function (c) { c.classList.toggle('active', c.getAttribute('data-cat') === state.cat && state.min === null && state.max === null); });
    }
    chips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        state.cat = chip.getAttribute('data-cat');
        state.min = null; state.max = null;
        apply();
      });
    });
    if (sortSel) sortSel.addEventListener('change', function () {
      var v = sortSel.value;
      var sorted = cards.slice().sort(function (a, b) {
        if (v === 'price-asc') return effPrice(a) - effPrice(b);
        if (v === 'price-desc') return effPrice(b) - effPrice(a);
        if (v === 'name') return (a.getAttribute('data-name') || '').localeCompare(b.getAttribute('data-name') || '');
        return parseInt(a.getAttribute('data-idx'), 10) - parseInt(b.getAttribute('data-idx'), 10);
      });
      sorted.forEach(function (c) { grid.appendChild(c); });
      cards = sorted;
      apply();
    });
    if (state.q) {
      var si = document.getElementById('site-search-input');
      if (si) si.value = params.get('q');
    }
    apply();
  }

  // ---------- product page ----------
  var mainImg = document.getElementById('p-main');
  if (mainImg) {
    var thumbs = Array.prototype.slice.call(document.querySelectorAll('.p-thumbs img'));
    thumbs.forEach(function (t) {
      t.addEventListener('click', function () {
        mainImg.src = t.getAttribute('data-full');
        thumbs.forEach(function (x) { x.classList.remove('sel'); });
        t.classList.add('sel');
      });
    });
  }
  document.querySelectorAll('.acc-head').forEach(function (h) {
    h.addEventListener('click', function () {
      var acc = h.parentElement;
      var open = acc.classList.toggle('open');
      var sign = h.querySelector('.acc-sign');
      if (sign) sign.textContent = open ? '−' : '+';
    });
  });
  document.querySelectorAll('.p-field input[type=text][maxlength]').forEach(function (inp) {
    var counter = inp.parentElement.querySelector('.counter');
    inp.addEventListener('input', function () { if (counter) counter.textContent = inp.value.length + '/' + inp.getAttribute('maxlength'); });
  });
  var qtyInp = document.getElementById('qty-input');
  if (qtyInp) {
    document.getElementById('qty-minus').addEventListener('click', function () { qtyInp.value = Math.max(1, parseInt(qtyInp.value || '1', 10) - 1); });
    document.getElementById('qty-plus').addEventListener('click', function () { qtyInp.value = Math.min(99, parseInt(qtyInp.value || '1', 10) + 1); });
  }
})();

  // ---------- logo button dropdown menu ----------
  var logoWrap = document.querySelector('.logo-wrap');
  var logoBtn = document.getElementById('logo-menu-btn');
  if (logoWrap && logoBtn) {
    logoBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      var open = logoWrap.classList.toggle('open');
      logoBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    document.addEventListener('click', function (e) {
      if (!logoWrap.contains(e.target)) {
        logoWrap.classList.remove('open');
        logoBtn.setAttribute('aria-expanded', 'false');
      }
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        logoWrap.classList.remove('open');
        logoBtn.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // ---------- header starfield parallax (subtle, rAF-throttled) ----------
  var header = document.querySelector('.site-header');
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (header && !reduceMotion) {
    var ticking = false;
    function parallax() {
      var y = window.scrollY || 0;
      if (y < 600) header.style.backgroundPosition = 'center ' + Math.round(y * 0.22) + 'px';
      ticking = false;
    }
    window.addEventListener('scroll', function () {
      if (!ticking) { ticking = true; window.requestAnimationFrame(parallax); }
    }, { passive: true });
  }
