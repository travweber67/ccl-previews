// Christmas Tree Lighting countdown (Pass 61, Nov 20, 2026: Travis
// asked for SIMULATED LIGHTS on the tree photo's REAL light positions).
// A live countdown to the Annual Christmas Tree Lighting — Saturday,
// December 5, 2026, 5:00 PM PT at Walawala Plaza —
// with a progress bar running from the season kickoff (Shop Small Saturday, Nov 28, 2026) to the lighting moment. The tree photo
// (img/tree-countdown.jpg) renders in its UNLIT state (dimmed +
// desaturated via .tc-tree-dim). Over it sit ~51 hand-placed light
// dots (.tc-dot) matched to the actual bulbs in the photo — the
// swags wrapping the tree — each carrying data-h, its height from
// the bottom of the tree (0-1). A dot switches ON (.on, bright with
// a real glow) when the countdown progress reaches its height, so
// the tree lights from the BOTTOM up. A soft warm ambient glow
// (.tc-glow) rises with the lit region. The STAR (.tc-star) at the
// very top is the final light: it lights only at 100%. After the
// moment the widget flips to a fully lit "The tree is lit!" state.
// Used inside the home page's holiday panel (full size) and the
// holidays page band (.mini). Ticks every second.
(function () {
  var el = document.getElementById('treeCount');
  if (!el) return;
  var START = new Date('2026-11-28T00:00:00-08:00').getTime();
  var TARGET = new Date('2026-12-05T17:00:00-08:00').getTime();
  var label = document.getElementById('tcLabel');
  var nums = document.getElementById('tcNums');
  var dEl = document.getElementById('tcD');
  var hEl = document.getElementById('tcH');
  var mEl = document.getElementById('tcM');
  var sEl = document.getElementById('tcS');
  var fill = document.getElementById('tcFill');
  var pct = document.getElementById('tcPct');
  var frame = el.querySelector('.tc-tree-photo');
  var glow = el.querySelector('.tc-glow');
  var star = el.querySelector('.tc-star');
  var dots = el.querySelectorAll('.tc-dot');
  // The photo is cover-cropped top-aligned in its frame: only the
  // top ~84.1% of the image is visible, so the ambient glow's height
  // maps the lit fraction of the IMAGE onto the visible frame.
  var VF = 0.841;

  function paintLights(frac) {
    for (var i = 0; i < dots.length; i++) {
      var h = parseFloat(dots[i].getAttribute('data-h'));
      if (frac >= h) dots[i].classList.add('on');
      else dots[i].classList.remove('on');
    }
    if (star) {
      if (frac >= 1) star.classList.add('on');
      else star.classList.remove('on');
    }
    if (glow) {
      var lit = (frac - (1 - VF)) / VF;
      if (lit < 0) lit = 0;
      if (lit > 1) lit = 1;
      glow.style.height = (lit * 100).toFixed(1) + '%';
    }
  }

  function render() {
    var now = Date.now();
    var frac = (now - START) / (TARGET - START);
    if (frac < 0) frac = 0;
    if (frac > 1) frac = 1;
    if (fill) fill.style.width = (frac * 100).toFixed(1) + '%';
    paintLights(frac);
    if (now >= TARGET) {
      if (frame) frame.classList.add('lit');
      label.textContent = 'The tree is lit!';
      nums.innerHTML = '<span class="tc-lit-msg">Downtown is officially glowing — happy holidays!</span>';
      pct.textContent = 'The community tree was lit on Saturday, December 5 at Walawala Plaza, just before the Holiday Parade of Lights.';
      return true;
    }
    var ms = TARGET - now;
    dEl.textContent = Math.floor(ms / 864e5);
    hEl.textContent = Math.floor(ms / 36e5) % 24;
    mEl.textContent = Math.floor(ms / 6e4) % 60;
    if (sEl) sEl.textContent = Math.floor(ms / 1e3) % 60;
    pct.textContent = 'The tree is ' + Math.round(frac * 100) + '% of the way to fully lit — it gets a little brighter every day.';
    return false;
  }

  if (render()) return;
  var timer = setInterval(function () {
    if (render()) clearInterval(timer);
  }, 1000);
})();
