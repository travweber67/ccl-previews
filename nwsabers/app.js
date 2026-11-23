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

  // ---------- procedural starfield: 3 depths, pin-sharp box-shadow stars, layered parallax ----------
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var starZones = document.querySelectorAll('.site-header,.space-zone');
  if (starZones.length) {
    var _seed = 987654321;
    function rnd() { _seed = (_seed * 1664525 + 1013904223) >>> 0; return _seed / 4294967296; }
    var starLayers = [
      { cls: 'far', size: 1, per: 6500, max: 650, aMin: .30, aMax: .62, rate: .05, glow: 0 },
      { cls: 'mid', size: 2, per: 17000, max: 300, aMin: .55, aMax: .90, rate: .11, glow: 0 },
      { cls: 'near', size: 3, per: 52000, max: 110, aMin: .85, aMax: 1, rate: .19, glow: 1 }
    ];
    var builtZones = [];
    function buildStars(zone) {
      var old = zone.querySelector('.starfield');
      if (old) old.remove();
      var W = zone.offsetWidth, Hh = zone.offsetHeight + 220;
      if (!W || !zone.offsetHeight) return;
      var sf = document.createElement('div');
      sf.className = 'starfield'; sf.setAttribute('aria-hidden', 'true');
      var els = [];
      starLayers.forEach(function (L) {
        var div = document.createElement('div');
        div.className = 'star-layer sl-' + L.cls;
        var dot = document.createElement('i');
        dot.style.width = L.size + 'px'; dot.style.height = L.size + 'px';
        var n = Math.min(L.max, Math.round(W * Hh / L.per));
        var sh = [];
        for (var k = 0; k < n; k++) {
          var x = Math.round(rnd() * W), y = Math.round(rnd() * Hh);
          var al = (L.aMin + rnd() * (L.aMax - L.aMin)).toFixed(2);
          var t = rnd();
          var col = t < .72 ? '255,255,255' : (t < .88 ? '190,214,255' : '255,238,205');
          sh.push(x + 'px ' + y + 'px 0 0 rgba(' + col + ',' + al + ')');
          if (L.glow) sh.push(x + 'px ' + y + 'px 7px 1px rgba(190,220,255,' + (al * .45).toFixed(2) + ')');
        }
        dot.style.boxShadow = sh.join(',');
        div.appendChild(dot);
        sf.appendChild(div);
        els.push({ el: div, rate: L.rate });
      });
      zone.insertBefore(sf, zone.firstChild);
      builtZones.push({ zone: zone, layers: els });
    }
    function buildAllStars() { builtZones = []; starZones.forEach(buildStars); }
    buildAllStars();
    var rzT = null;
    window.addEventListener('resize', function () { clearTimeout(rzT); rzT = setTimeout(buildAllStars, 250); });
    if (!reduceMotion) {
      var starTick = false;
      function starParallax() {
        builtZones.forEach(function (b) {
          var r = b.zone.getBoundingClientRect();
          if (r.bottom < -120 || r.top > (window.innerHeight || 800) + 120) return;
          var shift = Math.max(-95, Math.min(95, -r.top));
          b.layers.forEach(function (L) { L.el.style.transform = 'translateY(' + (shift * L.rate).toFixed(1) + 'px)'; });
        });
        starTick = false;
      }
      window.addEventListener('scroll', function () {
        if (!starTick) { starTick = true; window.requestAnimationFrame(starParallax); }
      }, { passive: true });
      starParallax();
    }
  }

  // ---------- header logo menu (blade retracts on open, reignites on close) ----------
  var nswWrap = document.querySelector('.nsw-logo-wrap');
  var nswBtn = nswWrap ? nswWrap.querySelector('.nsw-logo-btn') : null;
  if (nswWrap && nswBtn) {
    nswBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      var open = nswWrap.classList.toggle('open');
      nswBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    document.addEventListener('click', function (e) {
      if (!nswWrap.contains(e.target)) {
        nswWrap.classList.remove('open');
        nswBtn.setAttribute('aria-expanded', 'false');
      }
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        nswWrap.classList.remove('open');
        nswBtn.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // ---------- featured sabers carousel (page-by-3, wrap-around) ----------
  var car = document.getElementById('featured-carousel');
  if (car) {
    var track = car.querySelector('.car-track');
    var pages = car.querySelectorAll('.car-page').length;
    var page = 0;
    function go(p) {
      page = ((p % pages) + pages) % pages;
      track.style.transform = 'translateX(' + (-page * 100) + '%)';
    }
    car.querySelector('.car-prev').addEventListener('click', function () { go(page - 1); });
    car.querySelector('.car-next').addEventListener('click', function () { go(page + 1); });
  }
