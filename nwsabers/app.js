// NW Saber Syndicate — static preview copy interactions
(function () {
  // Travis (round 9, standing rule for all his apps): no pinch-zoom on mobile — the
  // viewport meta blocks scaling in most browsers, but iOS Safari ignores
  // user-scalable=no, so swallow the pinch gesture events there too.
  document.addEventListener('gesturestart', function (e) { e.preventDefault(); });
  document.addEventListener('gesturechange', function (e) { e.preventDefault(); });

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
  if (!document.querySelector('.page-sky')) {
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

  // ---------- holiday fly-by INSIDE the banner: TWO Santa-hat TIEs in loose formation ----------
  // Round 6 put the ship inside the holiday banner (the snowy alien-planet band under the
  // header), not roaming the whole page sky. Round 7 (Travis): the fly-by SOUND is cut
  // entirely, and the lone ship becomes a two-ship formation - a leader and a trailing
  // wingman flying together but NOT on rails. The trailer sits ~90-160px behind the leader
  // and ~10-25% of the band height above or below it, is a little smaller, runs +/-3-6%
  // faster or slower, and each ship wobbles on its own period (a few px of vertical drift,
  // a degree or two of rotation), so the gap breathes like two pilots, not a duplicated
  // image. Each ship keeps the depth pass (small at the edges, biggest near the middle)
  // with its peak offset from the other's, so they never swell in lockstep. The banner
  // clips them (overflow:hidden, .tie-layer absolute inset 0). Crossings are slow (5-8s),
  // gaps ~15-40s randomized, direction varies per crossing and the formation flips
  // together. Pure decoration: pointer-events:none, aria-hidden; hidden tabs skip;
  // reduced-motion gets none.
  var saleBand = document.querySelector('.sale-band');
  if (!reduceMotion && saleBand && document.body.classList.contains('home')) {
    var tieLayer = document.createElement('div');
    tieLayer.className = 'tie-layer'; tieLayer.setAttribute('aria-hidden', 'true');
    saleBand.appendChild(tieLayer);
    var TIE_STEPS = 12; // keyframes per crossing; the extra steps carry the wobble
    function flyShip(o) {
      var bw = saleBand.clientWidth || 1200;
      var ship = document.createElement('img');
      ship.className = 'tie-ship';
      ship.src = 'img/tie-santa.png'; ship.alt = '';
      ship.style.top = o.topPct + '%';
      if (o.heightPct) ship.style.height = o.heightPct + '%';
      tieLayer.appendChild(ship);
      var w = ship.offsetWidth || 130;
      // Round 7f (Travis): BOTH endpoints are the FULL crossing for every ship - start
      // fully off the entry edge, end fully off the exit edge. The old code shifted both
      // endpoints by the formation offset, so the trailer's final keyframe sat gap-px
      // SHORT of the exit edge and the ship was removed while still on screen (the
      // mid-air vanish on right-bound crossings; mirrored on left-bound). The offset
      // now rides as a start DELAY on the same full path: the trailer follows a beat
      // behind the leader, which holds the gap (breathing via the +/-3-6% duration
      // delta, as before) and guarantees a ship only finishes once it has fully
      // cleared the edge it is exiting.
      var startX = o.ltr ? -w - 16 : bw + 16;
      var endX = o.ltr ? bw + 16 : -w - 16;
      var delayMs = o.behind > 0 ? (o.behind / (bw + w + 32)) * o.dur : 0;
      var frames = [];
      for (var i = 0; i <= TIE_STEPS; i++) {
        var t = i / TIE_STEPS;
        var x = startX + (endX - startX) * t;
        // depth pass: small at the edges, biggest at this ship's own closest point
        var d = (t - o.peakAt) / Math.max(o.peakAt, 1 - o.peakAt);
        var s = o.edgeScale + (o.peakScale - o.edgeScale) * Math.max(0, 1 - d * d);
        // independent wobble: slow vertical drift + a whisper of rotation, own period/phase
        var y = Math.sin(t * o.wobCycles * 2 * Math.PI + o.wobPhase) * o.wobAmp;
        var rot = o.bank * Math.cos(t * Math.PI) + Math.sin(t * o.rotCycles * 2 * Math.PI + o.rotPhase) * o.rotAmp;
        frames.push({ transform: 'translate(' + x.toFixed(1) + 'px, ' + y.toFixed(1) + 'px) rotate(' + rot.toFixed(2) + 'deg) scale(' + (o.flip * s).toFixed(3) + ', ' + s.toFixed(3) + ')' });
      }
      var anim = ship.animate(frames, { duration: o.dur, delay: delayMs, fill: 'backwards', easing: 'linear' });
      anim.onfinish = function () { ship.remove(); };
      setTimeout(function () { ship.remove(); }, o.dur + delayMs + 500); // safety cleanup
    }
    function spawnFormation() {
      var ltr = Math.random() < 0.5;
      var flip = ltr ? 1 : -1;
      var gap = 90 + Math.random() * 70;                     // trailer rides 90-160px behind
      var leaderTop = 4 + Math.random() * 7;                 // % of band height
      var vOff = (10 + Math.random() * 15) * (Math.random() < 0.5 ? -1 : 1); // +/-10-25%
      var trailerTop = Math.min(30, Math.max(1, leaderTop + vOff));
      var leaderDur = 5000 + Math.random() * 3000;           // 5-8s crossing of the band
      var trailerDur = leaderDur * (1 + (0.03 + Math.random() * 0.03) * (Math.random() < 0.5 ? -1 : 1)); // +/-3-6%
      var bankBase = (2 + Math.random() * 4) * (ltr ? 1 : -1);
      // Wingman spawned first so it paints behind the leader.
      flyShip({
        ltr: ltr, flip: flip, behind: gap, topPct: trailerTop, heightPct: 63,
        dur: trailerDur, edgeScale: 0.5, peakScale: 1.0, peakAt: 0.5 + (Math.random() * 0.14 - 0.07),
        bank: bankBase * (0.7 + Math.random() * 0.5),
        wobAmp: 2.5 + Math.random() * 2, wobCycles: 1.4 + Math.random() * 1.2, wobPhase: Math.random() * 6.28,
        rotAmp: 1.0 + Math.random() * 0.8, rotCycles: 1.2 + Math.random() * 1.1, rotPhase: Math.random() * 6.28
      });
      flyShip({
        ltr: ltr, flip: flip, behind: 0, topPct: leaderTop, heightPct: 0,
        dur: leaderDur, edgeScale: 0.55, peakScale: 1.1, peakAt: 0.5,
        bank: bankBase,
        wobAmp: 2 + Math.random() * 1.5, wobCycles: 1.3 + Math.random() * 1.1, wobPhase: Math.random() * 6.28,
        rotAmp: 0.8 + Math.random() * 0.7, rotCycles: 1.1 + Math.random() * 1.0, rotPhase: Math.random() * 6.28
      });
    }
    function tieLoop() {
      if (!document.hidden) spawnFormation();
      setTimeout(tieLoop, 15000 + Math.random() * 25000);   // gaps ~15-40s, randomized
    }
    setTimeout(tieLoop, 3500 + Math.random() * 3000);
    window.NSW = window.NSW || {};
    window.NSW.tieFlyby = spawnFormation; // test hook: force a formation crossing on demand (QC)
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
    // Round 7e (Travis): while the panel is open, scrolling belongs to the panel alone.
    // The page is locked (overflow hidden on html+body, toggled with the open state) and
    // the panel itself carries overscroll-behavior:contain (style.css), so hitting the
    // panel's top/bottom never chains through to the page. The pre-open scroll position
    // is recorded and restored verbatim on close.
    var nswSavedScrollY = null;
    function lockPageScroll() {
      if (nswSavedScrollY === null) {
        nswSavedScrollY = window.scrollY || window.pageYOffset || 0;
        document.documentElement.classList.add('nsw-scroll-lock');
        document.body.classList.add('nsw-scroll-lock');
      }
    }
    function unlockPageScroll() {
      if (nswSavedScrollY !== null) {
        document.documentElement.classList.remove('nsw-scroll-lock');
        document.body.classList.remove('nsw-scroll-lock');
        if ((window.scrollY || window.pageYOffset || 0) !== nswSavedScrollY) window.scrollTo(0, nswSavedScrollY);
        nswSavedScrollY = null;
      }
    }
    function openNsw() {
      lockPageScroll();
      nswWrap.classList.add('open');
      nswMenu.classList.add('open');
      nswBtn.setAttribute('aria-expanded', 'true');
    }
    function closeNsw() {
      nswWrap.classList.remove('open');
      nswMenu.classList.remove('open');
      nswBtn.setAttribute('aria-expanded', 'false');
      unlockPageScroll();
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

  // ---------- "Questions" chat widget (round 7g, Travis) ----------
  // Mirrors the Wix Chat tab on David's live site (bottom-right, NSW logo + QUESTIONS),
  // restyled to the house buttons. The panel carries the same contact form his widget
  // asks for (name, email, message). STATIC PREVIEW: the submit interaction and success
  // state are fully wired, but nothing is transmitted anywhere - on David's live site
  // this form posts into his Wix Chat / Wix Inbox, which is where the production
  // version connects when the rebuild goes live on his domain.
  (function initQuestions() {
    if (document.querySelector('.nsw-q-btn')) return;
    var root = window.location.pathname.indexOf('/product/') >= 0 ? '../' : '';
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'nsw-q-btn';
    btn.setAttribute('aria-expanded', 'false');
    btn.setAttribute('aria-label', 'Questions - send us a message');
    btn.innerHTML = '<img src="' + root + 'img/logo-base.png" alt="">QUESTIONS';
    var panel = document.createElement('div');
    panel.className = 'nsw-q-panel';
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-label', 'Send us a message');
    panel.innerHTML =
      '<div class="nsw-q-head"><span class="nsw-q-title">Questions</span>' +
      '<button type="button" class="nsw-q-close" aria-label="Close chat">&times;&nbsp;Close</button></div>' +
      '<div class="nsw-q-body">' +
      '<form class="nsw-q-form" novalidate>' +
      '<p class="nsw-q-intro">Send us a message and we will get back to you, usually within 24 hours.</p>' +
      '<label for="nsw-q-name">Name</label><input id="nsw-q-name" name="name" type="text" autocomplete="name" required>' +
      '<label for="nsw-q-email">Email</label><input id="nsw-q-email" name="email" type="email" autocomplete="email" required>' +
      '<label for="nsw-q-msg">Message</label><textarea id="nsw-q-msg" name="message" required></textarea>' +
      '<button type="submit" class="nsw-q-send">Send Message</button></form>' +
      '<div class="nsw-q-done"><p class="q-big">Message sent!</p>' +
      '<p>Thanks for reaching out - we will get back to you soon.</p>' +
      '<button type="button" class="nsw-q-again">Send another message</button></div>' +
      '</div>';
    document.body.appendChild(panel);
    document.body.appendChild(btn);
    var form = panel.querySelector('.nsw-q-form');
    var done = panel.querySelector('.nsw-q-done');

    // ---------- Round 10 (Travis): keep the open panel usable with the phone
    // keyboard up. The keyboard covers the bottom of the LAYOUT viewport, but a
    // position:fixed panel is laid out against that full viewport, so the lower
    // fields sat behind the keyboard - invisible and unreachable. The VISUAL
    // viewport is the part of the page actually visible: when it shrinks well
    // below the layout viewport (keyboard open), pin the panel just above the
    // keyboard via the --q-bottom / --q-maxh custom properties the stylesheet
    // reads, capped to the visible height. The form area scrolls inside the
    // panel (stylesheet: flex column, .nsw-q-body is the scroller, header
    // pinned), and the focused field is scrolled into view inside that area.
    // Desktop and the keyboard-closed phone state clear the overrides, so the
    // round-9 geometry is exactly what returns when the keyboard goes away,
    // the panel closes, or the phone rotates.
    var qBody = panel.querySelector('.nsw-q-body');
    var qVV = window.visualViewport || null;
    var qPhone = window.matchMedia('(max-width: 640px)');
    var qSyncTimer = null;
    function clearQViewport() {
      panel.style.removeProperty('--q-bottom');
      panel.style.removeProperty('--q-maxh');
    }
    function scrollQFieldIntoView(field) {
      if (!field || !qBody.contains(field)) return;
      var c = qBody.getBoundingClientRect();
      var topEl = field;
      var prev = field.previousElementSibling;
      if (prev && prev.tagName === 'LABEL') topEl = prev; // keep the field's label in view too
      var tr = topEl.getBoundingClientRect();
      var fr = field.getBoundingClientRect();
      var pad = 10;
      if (tr.top < c.top + pad) qBody.scrollTop -= (c.top + pad - tr.top);
      else if (fr.bottom > c.bottom - pad) qBody.scrollTop += (fr.bottom - (c.bottom - pad));
    }
    function syncQViewport() {
      if (!qVV || !panel.classList.contains('open') || !qPhone.matches) { clearQViewport(); return; }
      // Layout-viewport px hidden below the visible area = the keyboard's height when it is up.
      var hiddenBelow = window.innerHeight - (qVV.offsetTop + qVV.height);
      if (hiddenBelow > 100) {
        panel.style.setProperty('--q-bottom', Math.round(hiddenBelow + 12) + 'px');
        panel.style.setProperty('--q-maxh', Math.max(180, Math.round(qVV.height - 24)) + 'px');
      } else {
        clearQViewport();
      }
    }
    function syncQViewportSoon() {
      if (qSyncTimer) clearTimeout(qSyncTimer);
      qSyncTimer = setTimeout(function () {
        qSyncTimer = null;
        syncQViewport();
        var a = document.activeElement;
        if (a && panel.contains(a) && (a.tagName === 'INPUT' || a.tagName === 'TEXTAREA')) scrollQFieldIntoView(a);
      }, 60);
    }
    if (qVV) {
      qVV.addEventListener('resize', syncQViewportSoon);
      qVV.addEventListener('scroll', syncQViewportSoon);
    }
    window.addEventListener('orientationchange', syncQViewportSoon);
    panel.addEventListener('focusin', function (e) {
      var t = e.target;
      if (!t || (t.tagName !== 'INPUT' && t.tagName !== 'TEXTAREA')) return;
      scrollQFieldIntoView(t); // keyboard already up, or field already in the scroll area
      // A freshly opening keyboard takes a few hundred ms to resize the visual
      // viewport; re-check once it settles so the field stays in view.
      setTimeout(function () { syncQViewport(); scrollQFieldIntoView(t); }, 350);
    });

    function setOpen(open) {
      panel.classList.toggle('open', open);
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      if (open) { syncQViewportSoon(); var f = panel.querySelector('input'); if (f) f.focus(); }
      else clearQViewport();
    }
    btn.addEventListener('click', function () { setOpen(!panel.classList.contains('open')); });
    panel.querySelector('.nsw-q-close').addEventListener('click', function () { setOpen(false); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setOpen(false); });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!form.checkValidity()) { form.reportValidity(); return; }
      form.style.display = 'none';
      done.style.display = 'block';
    });
    panel.querySelector('.nsw-q-again').addEventListener('click', function () {
      form.reset();
      done.style.display = 'none';
      form.style.display = '';
    });
  })();

  // ---------- carousels (page-by-3, wrap-around, neighbors peek + fade) ----------
  // One shared engine (Featured Sabers is the homepage instance). Each page is 84% of the
  // viewport width and sits centered, so ~8% of the previous and next pages peek in at the
  // edges; the viewport's CSS mask dissolves those peeks into the sky.
  // A carousel with a single page of cards sits static and centered instead (.is-static).
  // WRAP RULE (round 6 fix): the end clones are bridges, not destinations. Paging past either
  // end slides ONE page into the clone, then snaps without animation to the matching real
  // page and RESTS there - every real page is a stable stop, and the wrap is never a
  // multi-page rewind sweep (the old engine wrapped the page counter first, so the track
  // animated backwards across every page and the end pages could not be rested on).
  function initCarousel(car) {
    var track = car.querySelector('.car-track');
    var pageEls = track.querySelectorAll('.car-page');
    var pages = pageEls.length;
    if (!pages) return;
    // Round 9 (Travis): on phones the carousel is a native swipe strip — the round-9
    // CSS turns the viewport into a scroll-snap scroller and flattens the pages, so
    // the paging engine (clones, transform offsets, arrow wiring) must NOT run there.
    if (window.matchMedia('(max-width: 640px)').matches) { car.classList.add('is-native'); return; }
    if (pages === 1) { car.classList.add('is-static'); return; }
    // Clone the last page before the first and the first page after the last: neighbors peek
    // in on BOTH sides even on the first and last pages, and the clones bridge the wrap.
    var lastClone = pageEls[pages - 1].cloneNode(true);
    lastClone.setAttribute('aria-hidden', 'true');
    track.insertBefore(lastClone, pageEls[0]);
    var firstClone = pageEls[0].cloneNode(true);
    firstClone.setAttribute('aria-hidden', 'true');
    track.appendChild(firstClone);
    var idx = 1; // track position: 1..pages are the real pages; 0 and pages+1 are the clones
    var snapTimer = null;
    function offsetFor(i) {
      var tw = track.clientWidth;
      var pw = tw * 0.84;
      return (tw - pw) / 2 - i * pw;
    }
    function render(animate) {
      if (!animate) {
        track.style.transition = 'none';
        track.style.transform = 'translateX(' + offsetFor(idx) + 'px)';
        void track.offsetWidth; // flush so the no-animation jump applies at once
        track.style.transition = '';
      } else {
        track.style.transform = 'translateX(' + offsetFor(idx) + 'px)';
      }
    }
    function settle() {
      // Landed on a clone: snap (no animation) to the matching real page and rest there.
      if (idx === 0) { idx = pages; render(false); }
      else if (idx === pages + 1) { idx = 1; render(false); }
    }
    function go(delta) {
      if (idx === 0 || idx === pages + 1) settle(); // a wrap snap was still pending: finish it first
      idx += delta;
      render(true);
      if (snapTimer) { clearTimeout(snapTimer); snapTimer = null; }
      if (idx === 0 || idx === pages + 1) {
        // Fallback in case transitionend does not fire (e.g. reduced motion kills the transition)
        snapTimer = setTimeout(function () { snapTimer = null; settle(); }, 580);
      }
    }
    track.addEventListener('transitionend', function (e) {
      if (e.propertyName === 'transform' && (idx === 0 || idx === pages + 1)) {
        if (snapTimer) { clearTimeout(snapTimer); snapTimer = null; }
        settle();
      }
    });
    car.querySelector('.car-prev').addEventListener('click', function () { go(-1); });
    car.querySelector('.car-next').addEventListener('click', function () { go(1); });
    window.addEventListener('resize', function () { render(false); });
    render(false);
  }
  document.querySelectorAll('.carousel').forEach(initCarousel);
