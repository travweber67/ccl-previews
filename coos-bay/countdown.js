// Christmas Tree Lighting countdown (Pass 59; Pass 60 Nov 20, 2026:
// Travis replaced the SVG tree with a generated tree PHOTO, asked for
// the lights to climb from the BOTTOM up with the star last, and for
// SECONDS so the countdown visibly ticks). A live countdown to the
// Annual Christmas Tree Lighting — Saturday, November 28, 2026, about
// 5:45 PM PT at the Coos Bay Visitor Center — with a progress bar
// running from the season kickoff (the Holiday Open House, Nov 13,
// 2026) to the lighting moment. The tree photo is stacked in two
// copies: a dim base, and a bright copy on top clipped with
// clip-path: inset(X% 0 0 0), X = 100 - progress%, so the lit part
// reveals from the bottom upward as the day approaches; the star
// sits at the very top of the photo, so it is revealed last. At
// 100% the bright layer gets a soft gold glow and the widget flips
// to a fully lit "The tree is lit!" state. Used inside the home
// page's holiday panel (full size) and the holidays page band
// (.mini). Ticks every second.
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
  var sEl = document.getElementById('tcS');
  var fill = document.getElementById('tcFill');
  var pct = document.getElementById('tcPct');
  var frame = el.querySelector('.tc-tree-photo');
  var bright = el.querySelector('.tc-tree-bright');

  function render() {
    var now = Date.now();
    var frac = (now - START) / (TARGET - START);
    if (frac < 0) frac = 0;
    if (frac > 1) frac = 1;
    if (fill) fill.style.width = (frac * 100).toFixed(1) + '%';
    if (bright) {
      bright.style.clipPath = 'inset(' + (100 - frac * 100).toFixed(1) + '% 0 0 0)';
    }
    if (now >= TARGET) {
      if (frame) frame.classList.add('lit');
      label.textContent = 'The tree is lit!';
      nums.innerHTML = '<span class="tc-lit-msg">Downtown is officially glowing — happy holidays!</span>';
      pct.textContent = 'Santa and Mayor Joe Benetti lit the tree on Saturday, November 28 at the Visitor Center.';
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
