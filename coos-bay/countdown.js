// Pass 59: Christmas Tree Lighting countdown (Travis, Nov 20, 2026).
// A live countdown to the Annual Christmas Tree Lighting — Saturday,
// November 28, 2026, about 5:45 PM PT at the Coos Bay Visitor Center —
// with a progress bar running from the season kickoff (the Holiday
// Open House, Nov 13, 2026) to the lighting moment. The SVG tree's
// lights pop on one by one as the bar fills, and its halo and star
// brighten with the same fraction, so the closer the day gets, the
// more lit the tree looks. After the moment passes, the widget flips
// to a fully lit "The tree is lit!" state. Used inside the home
// page's holiday panel (full size, Pass 60 — moved out of the hero
// at Travis's direction) and the holidays page band (.mini).
(function () {
  var el = document.getElementById('treeCount');
  if (!el) return;
  var START = new Date('2026-11-13T00:00:00-08:00').getTime();
  var TARGET = new Date('2026-11-28T17:45:00-08:00').getTime();
  var label = document.getElementById('tcLabel');
  var nums = document.getElementById('tcNums');
  var dEl = document.getElementById('tcD');
  var hEl = document.getElementById('tcH');
  var mEl = document.getElementById('tcM');
  var fill = document.getElementById('tcFill');
  var pct = document.getElementById('tcPct');
  var halo = el.querySelector('.tc-halo');
  var star = el.querySelector('.tc-star');
  var lights = Array.prototype.slice.call(el.querySelectorAll('.tc-light'));

  function render() {
    var now = Date.now();
    var frac = (now - START) / (TARGET - START);
    if (frac < 0) frac = 0;
    if (frac > 1) frac = 1;
    fill.style.width = (frac * 100).toFixed(1) + '%';
    var litCount = Math.round(frac * lights.length);
    lights.forEach(function (c, i) {
      if (i < litCount) {
        c.setAttribute('opacity', '1');
        c.style.filter = 'drop-shadow(0 0 2.5px ' + c.getAttribute('fill') + ')';
      } else {
        c.setAttribute('opacity', '.22');
        c.style.filter = '';
      }
    });
    if (halo) halo.setAttribute('opacity', (0.12 + 0.88 * frac).toFixed(2));
    if (star) star.setAttribute('opacity', (0.35 + 0.65 * frac).toFixed(2));
    if (now >= TARGET) {
      label.textContent = 'The tree is lit!';
      nums.innerHTML = '<span class="tc-lit-msg">Downtown is officially glowing — happy holidays!</span>';
      pct.textContent = 'Santa and Mayor Joe Benetti lit the tree on Saturday, November 28 at the Visitor Center.';
      return true;
    }
    var ms = TARGET - now;
    dEl.textContent = Math.floor(ms / 864e5);
    hEl.textContent = Math.floor(ms / 36e5) % 24;
    mEl.textContent = Math.floor(ms / 6e4) % 60;
    pct.textContent = 'The tree is ' + Math.round(frac * 100) + '% of the way to fully lit — it gets a little brighter every day.';
    return false;
  }

  if (render()) return;
  setInterval(render, 20000);
})();
