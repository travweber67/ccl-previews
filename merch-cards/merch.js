/* Columbia County Live — merch card slider (preview build, 2026-11-21).
   Each .merch-card runs its own rotation: one product at a time,
   ~6s hold, current slide exits left, next slides in from the right,
   loops forever. Pauses on hover/focus and when the tab is hidden.
   The whole card links to the Shopify collection. */
(function () {
  var SHOP_URL = 'https://vryy5m-dh.myshopify.com/collections/columbia-county-live';
  var HOLD_MS = 6000;
  var ANIM_MS = 660;

  function initCard(card) {
    var slides = Array.prototype.slice.call(card.querySelectorAll('.merch-slide'));
    var dots = Array.prototype.slice.call(card.querySelectorAll('.merch-dot'));
    var nameEl = card.querySelector('.merch-name');
    var priceEl = card.querySelector('.merch-price');
    var metaEl = card.querySelector('.merch-meta');
    if (!slides.length) return;

    var cur = 0;
    var animating = false;
    var timer = null;
    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    slides.forEach(function (s, i) {
      if (i === 0) {
        s.classList.add('is-on');
        s.style.transform = 'translateX(0)';
      }
    });

    function setCaption(i) {
      if (!nameEl) return;
      metaEl.classList.add('fading');
      setTimeout(function () {
        nameEl.textContent = slides[i].getAttribute('data-name') || '';
        priceEl.textContent = slides[i].getAttribute('data-price') || '';
        metaEl.classList.remove('fading');
      }, 180);
    }

    function go(n, dir) {
      if (animating || n === cur) return;
      dir = dir || 1;
      animating = true;
      var prev = slides[cur];
      var next = slides[n];
      next.classList.add('no-anim');
      next.classList.add('is-on');
      next.style.transform = 'translateX(' + 103 * dir + '%)';
      /* force reflow so the entry position paints before animating */
      void next.offsetWidth;
      next.classList.remove('no-anim');
      next.style.transform = 'translateX(0)';
      prev.style.transform = 'translateX(' + -103 * dir + '%)';
      cur = n;
      dots.forEach(function (d, i) { d.classList.toggle('is-active', i === cur); });
      setCaption(cur);
      setTimeout(function () {
        prev.classList.remove('is-on');
        prev.classList.add('no-anim');
        prev.style.transform = 'translateX(103%)';
        void prev.offsetWidth;
        prev.classList.remove('no-anim');
        animating = false;
      }, ANIM_MS);
    }

    function start() {
      if (reduceMotion || timer || slides.length < 2) return;
      timer = setInterval(function () {
        if (document.hidden) return;
        go((cur + 1) % slides.length, 1);
      }, HOLD_MS);
    }
    function stop() {
      if (timer) { clearInterval(timer); timer = null; }
    }

    dots.forEach(function (d, i) {
      d.addEventListener('click', function (ev) {
        ev.stopPropagation();
        go(i, i > cur ? 1 : -1);
        stop(); start();
      });
    });

    card.addEventListener('pointerenter', stop);
    card.addEventListener('pointerleave', start);
    card.addEventListener('focusin', stop);
    card.addEventListener('focusout', start);

    /* Whole card links to the store; dots and real links keep their own behavior. */
    card.addEventListener('click', function (ev) {
      if (ev.target.closest('a, button')) return;
      window.open(SHOP_URL, '_blank', 'noopener');
    });

    start();
  }

  function init() {
    document.querySelectorAll('.merch-card').forEach(initCard);
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
