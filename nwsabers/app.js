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
  var starZones = Array.prototype.slice.call(document.querySelectorAll('.site-header,.space-zone'));
  // homepage: a fixed full-page sky behind everything, same star style; static (rect never moves), so it never fights the zones' parallax
  if (document.body.classList.contains('home')) {
    var pageSky = document.createElement('div');
    pageSky.className = 'page-sky'; pageSky.setAttribute('aria-hidden', 'true');
    document.body.insertBefore(pageSky, document.body.firstChild);
    starZones.push(pageSky);
  }
  if (starZones.length) {
    var _seed = 987654321;
    function rnd() { _seed = (_seed * 1664525 + 1013904223) >>> 0; return _seed / 4294967296; }
    var starLayers = [
      { cls: 'far', size: 1, per: 6500, max: 650, aMin: .30, aMax: .62, rate: .03, glow: 0 },
      { cls: 'mid', size: 2, per: 17000, max: 300, aMin: .55, aMax: .90, rate: .14, glow: 0 },
      { cls: 'near', size: 3, per: 52000, max: 110, aMin: .85, aMax: 1, rate: .34, glow: 1 }
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
        // ambient life (skipped entirely for reduced-motion users): the mid layer drifts very
        // slowly, and a scatter of individual stars twinkle at unsynchronized rates
        if (!reduceMotion) {
          if (L.cls === 'mid') dot.classList.add('star-drift');
          if (L.cls === 'mid' || L.cls === 'near') {
            var twN = L.cls === 'near' ? 9 : 13;
            for (var t2 = 0; t2 < twN; t2++) {
              var tw = document.createElement('span');
              tw.className = 'tw-dot';
              var ts = L.size + (rnd() < .3 ? 1 : 0);
              tw.style.width = ts + 'px'; tw.style.height = ts + 'px';
              tw.style.left = Math.round(rnd() * W) + 'px';
              tw.style.top = Math.round(rnd() * Hh) + 'px';
              tw.style.setProperty('--twd', (2.4 + rnd() * 2.6).toFixed(2) + 's');
              tw.style.setProperty('--twdel', (-rnd() * 5).toFixed(2) + 's');
              tw.style.setProperty('--twlo', (0.10 + rnd() * 0.20).toFixed(2));
              tw.style.setProperty('--twhi', (0.75 + rnd() * 0.25).toFixed(2));
              if (rnd() < .22) tw.style.background = '#bcd8ff';
              div.appendChild(tw);
            }
          }
        }
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
          var shift = Math.max(-110, Math.min(110, -r.top));
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

  // ---------- shooting stars: random spawner on the page sky (homepage only) ----------
  // Irregular everything: gaps of ~6-20s (occasionally longer), scattered start points (never the
  // same quadrant twice in a row), random diagonal direction/steepness, length, speed, brightness,
  // and a low chance of a near-simultaneous second streak. Reduced-motion users get none.
  if (!reduceMotion && document.body.classList.contains('home')) {
    var skyFx = document.createElement('div');
    skyFx.className = 'meteor-layer'; skyFx.setAttribute('aria-hidden', 'true');
    document.body.appendChild(skyFx);
    var lastQuad = -1;
    function spawnMeteor() {
      var vw = window.innerWidth || 1200, vh = window.innerHeight || 800;
      var x, y, quad, tries = 0;
      do {
        x = vw * (0.05 + Math.random() * 0.80);
        y = vh * (0.02 + Math.random() * 0.50);
        quad = (x > vw / 2 ? 1 : 0) + (y > vh / 3 ? 2 : 0);
        tries++;
      } while (quad === lastQuad && tries < 6);
      lastQuad = quad;
      var m = document.createElement('div');
      m.className = 'meteor';
      var len = 90 + Math.random() * 110;              // streak length 90-200px
      m.style.width = len + 'px';
      m.style.left = x + 'px'; m.style.top = y + 'px';
      m.style.opacity = (0.55 + Math.random() * 0.45).toFixed(2);
      var ang = 24 + Math.random() * 26;               // steepness 24-50 degrees
      if (Math.random() < 0.5) ang = 180 - ang;        // half travel down-left, half down-right
      var dist = 200 + Math.random() * 260;            // travel 200-460px
      var dur = 800 + Math.random() * 600;             // 0.8-1.4s
      var rad = ang * Math.PI / 180;
      m.style.transform = 'rotate(' + ang + 'deg)';
      var anim = m.animate([
        { transform: 'rotate(' + ang + 'deg) translateX(0px)', opacity: 0 },
        { opacity: 1, offset: 0.18 },
        { opacity: 1, offset: 0.72 },
        { transform: 'rotate(' + ang + 'deg) translateX(' + dist + 'px)', opacity: 0 }
      ], { duration: dur, easing: 'ease-out' });
      skyFx.appendChild(m);
      anim.onfinish = function () { m.remove(); };
      setTimeout(function () { m.remove(); }, dur + 400); // safety cleanup
    }
    function meteorLoop() {
      if (!document.hidden) {
        spawnMeteor();
        if (Math.random() < 0.12) setTimeout(spawnMeteor, 120 + Math.random() * 240); // rare double
      }
      setTimeout(meteorLoop, 6000 + Math.random() * 14000 + (Math.random() < 0.18 ? 9000 : 0));
    }
    setTimeout(meteorLoop, 3000 + Math.random() * 6000);
  }

  // ---------- header logo menu: left slide-out panel ----------
  // Open: blade retracts at once (CSS, .62s, no delay); the panel slides in slow (1s after a .25s delay) and covers the logo; blade stays down while open.
  // Close: panel slides back (.6s); the blade's base transition carries a .55s delay, so it reignites only once the panel has left.
  var nswWrap = document.querySelector('.nsw-logo-wrap');
  var nswBtn = nswWrap ? nswWrap.querySelector('.nsw-logo-btn') : null;
  var nswMenu = nswWrap ? nswWrap.querySelector('.nsw-menu') : null;
  if (nswWrap && nswBtn && nswMenu) {
    document.body.appendChild(nswMenu); // body-level so the fixed panel paints above every section
    if (!nswMenu.querySelector('.nsw-menu-close')) {
      var nswClose = document.createElement('button');
      nswClose.type = 'button';
      nswClose.className = 'nsw-menu-close';
      nswClose.setAttribute('aria-label', 'Close menu');
      nswClose.innerHTML = '&times;&nbsp;Close';
      nswMenu.insertBefore(nswClose, nswMenu.firstChild);
      nswClose.addEventListener('click', function (e) { e.stopPropagation(); closeNsw(); });
    }
    function openNsw() {
      nswWrap.classList.add('open');
      nswMenu.classList.add('open');
      nswBtn.setAttribute('aria-expanded', 'true');
    }
    function closeNsw() {
      nswWrap.classList.remove('open');
      nswMenu.classList.remove('open');
      nswBtn.setAttribute('aria-expanded', 'false');
    }
    nswBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      if (nswWrap.classList.contains('open')) closeNsw(); else openNsw();
    });
    nswMenu.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () { closeNsw(); });
    });
    document.addEventListener('click', function (e) {
      if (nswWrap.classList.contains('open') && !nswWrap.contains(e.target) && !nswMenu.contains(e.target)) closeNsw();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeNsw();
    });
  }

  // ---------- carousels (page-by-3, wrap-around, neighbors peek + fade) ----------
  // Featured Sabers plus the six Build Your Own component rows share this one engine.
  // Each page is 84% of the viewport width and sits centered, so ~8% of the previous and next
  // pages peek in at the edges; the viewport's CSS mask dissolves those peeks into the sky.
  // A carousel with a single page of cards sits static and centered instead (.is-static).
  function initCarousel(car) {
    var track = car.querySelector('.car-track');
    var pageEls = track.querySelectorAll('.car-page');
    var pages = pageEls.length;
    if (!pages) return;
    if (pages === 1) { car.classList.add('is-static'); return; }
    // Clone the last page before the first and the first page after the last, so the centered
    // 84% layout has a neighbor peeking in on BOTH sides even on the first and last pages.
    var lastClone = pageEls[pages - 1].cloneNode(true);
    lastClone.setAttribute('aria-hidden', 'true');
    track.insertBefore(lastClone, pageEls[0]);
    var firstClone = pageEls[0].cloneNode(true);
    firstClone.setAttribute('aria-hidden', 'true');
    track.appendChild(firstClone);
    var page = 0;
    function go(p) {
      page = ((p % pages) + pages) % pages;
      var tw = track.clientWidth;
      var pw = tw * 0.84;
      var off = (tw - pw) / 2 - (page + 1) * pw;
      track.style.transform = 'translateX(' + off + 'px)';
    }
    car.querySelector('.car-prev').addEventListener('click', function () { go(page - 1); });
    car.querySelector('.car-next').addEventListener('click', function () { go(page + 1); });
    window.addEventListener('resize', function () { go(page); });
    go(0);
  }
  document.querySelectorAll('.carousel').forEach(initCarousel);
