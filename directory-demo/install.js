/* Pass 41 — Item 11: service worker registration + the drawer's
   "Install the App" entry. No banners, no popups, nothing auto-prompts:
   the drawer line is the only surface. Where the browser offers an
   install prompt we use it; on iPhone/iPad (which never fires that
   event) the entry shows the Share -> Add to Home Screen steps. */
(function () {
  /* serviceWorker registration stripped for preview hosting */
  var btn = document.getElementById('installBtn');
  var hint = document.getElementById('installHint');
  if (!btn) return;
  var standalone = false;
  try {
    standalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
  } catch (e) {}
  if (standalone) { btn.hidden = true; return; }
  var deferred = null;
  window.addEventListener('beforeinstallprompt', function (e) {
    e.preventDefault();
    deferred = e;
  });
  window.addEventListener('appinstalled', function () {
    deferred = null;
    btn.hidden = true;
    if (hint) hint.hidden = true;
  });
  function showHint(text) {
    if (!hint) return;
    hint.textContent = text;
    hint.hidden = false;
  }
  btn.addEventListener('click', function () {
    if (deferred) {
      var d = deferred;
      deferred = null;
      d.prompt();
      d.userChoice.then(function (choice) {
        if (choice && choice.outcome === 'accepted') {
          btn.hidden = true;
          if (hint) hint.hidden = true;
        } else {
          showHint('No problem — you can install any time from your browser menu: look for "Install app" or "Add to Home screen".');
        }
      });
      return;
    }
    var ua = window.navigator.userAgent || '';
    var ios = /iphone|ipad|ipod/i.test(ua)
      || (window.navigator.platform === 'MacIntel' && window.navigator.maxTouchPoints > 1);
    if (ios) {
      showHint('On iPhone or iPad: tap the Share button in Safari, then tap "Add to Home Screen" — Riverside County Local Directory will sit on your home screen like an app.');
    } else {
      showHint('Open your browser menu and choose "Install app" or "Add to Home screen" — Riverside County Local Directory will sit on your home screen like an app.');
    }
  });
})();
