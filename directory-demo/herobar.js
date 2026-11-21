// Pass 4: custom glass dropdowns for the hero search bar.
// Replaces native <select> controls, whose open list renders browser-default
// (white list, blue highlight) no matter how the closed control is styled.
// Pattern: button + listbox, keyboard sane (arrows, Home/End, Enter/Space,
// Esc, Tab-away, click-outside closes). Value lives in a hidden input so the
// homepage form GET and the directory filter wiring work exactly as before.
function kilDropdown(field, cfg) {
  field.classList.add('dd');
  var input = document.createElement('input');
  input.type = 'hidden';
  if (cfg.id) input.id = cfg.id;
  if (cfg.name) input.name = cfg.name;
  input.value = cfg.value || '';

  var btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'dd-btn';
  btn.setAttribute('aria-haspopup', 'listbox');
  btn.setAttribute('aria-expanded', 'false');
  if (cfg.ariaLabel) btn.setAttribute('aria-label', cfg.ariaLabel);
  var label = document.createElement('span');
  label.className = 'dd-label';
  btn.appendChild(label);
  var chev = document.createElement('span');
  chev.className = 'dd-chev';
  chev.setAttribute('aria-hidden', 'true');
  chev.innerHTML = '<svg width="11" height="7" viewBox="0 0 11 7" aria-hidden="true"><path d="M1 1l4.5 4.5L10 1" stroke="currentColor" stroke-width="1.8" fill="none" stroke-linecap="round"/></svg>';
  btn.appendChild(chev);

  var menu = document.createElement('ul');
  menu.className = 'dd-menu';
  menu.setAttribute('role', 'listbox');
  if (cfg.ariaLabel) menu.setAttribute('aria-label', cfg.ariaLabel);
  menu.hidden = true;

  var items = [{ value: '', label: cfg.allLabel }].concat(
    cfg.options.map(function (o) { return { value: o, label: o }; })
  );
  var lis = items.map(function (it) {
    var li = document.createElement('li');
    li.className = 'dd-opt';
    li.setAttribute('role', 'option');
    li.dataset.value = it.value;
    li.textContent = it.label;
    menu.appendChild(li);
    return li;
  });

  function syncLabel() {
    var cur = items[0];
    for (var i = 0; i < items.length; i++) if (items[i].value === input.value) cur = items[i];
    label.textContent = cur.label;
    lis.forEach(function (li) {
      var on = li.dataset.value === input.value;
      li.classList.toggle('sel', on);
      li.setAttribute('aria-selected', on ? 'true' : 'false');
    });
  }

  var openState = false, activeIdx = -1;
  function markActive() {
    lis.forEach(function (li, i) { li.classList.toggle('act', i === activeIdx); });
    if (activeIdx >= 0 && lis[activeIdx]) lis[activeIdx].scrollIntoView({ block: 'nearest' });
  }
  function open() {
    document.querySelectorAll('.dd-menu').forEach(function (m) { if (m !== menu) m.hidden = true; });
    document.querySelectorAll('.dd-btn[aria-expanded="true"]').forEach(function (b) { if (b !== btn) b.setAttribute('aria-expanded', 'false'); });
    menu.hidden = false;
    openState = true;
    btn.setAttribute('aria-expanded', 'true');
    activeIdx = 0;
    lis.forEach(function (li, i) { if (li.dataset.value === input.value) activeIdx = i; });
    markActive();
  }
  function close() {
    menu.hidden = true;
    openState = false;
    btn.setAttribute('aria-expanded', 'false');
    lis.forEach(function (li) { li.classList.remove('act'); });
  }
  function set(v, fire) {
    input.value = v;
    syncLabel();
    if (fire) {
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.dispatchEvent(new Event('change', { bubbles: true }));
      if (cfg.onChange) cfg.onChange(v);
    }
  }

  btn.addEventListener('click', function () { openState ? close() : open(); });
  lis.forEach(function (li) {
    li.addEventListener('click', function () { set(li.dataset.value, true); close(); btn.focus(); });
  });
  document.addEventListener('click', function (e) { if (openState && !field.contains(e.target)) close(); });
  field.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { if (openState) { close(); btn.focus(); } return; }
    if (!openState) {
      if ((e.key === 'ArrowDown' || e.key === 'ArrowUp') && document.activeElement === btn) { e.preventDefault(); open(); }
      return;
    }
    if (e.key === 'ArrowDown') { e.preventDefault(); activeIdx = Math.min(activeIdx + 1, lis.length - 1); markActive(); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); activeIdx = Math.max(activeIdx - 1, 0); markActive(); }
    else if (e.key === 'Home') { e.preventDefault(); activeIdx = 0; markActive(); }
    else if (e.key === 'End') { e.preventDefault(); activeIdx = lis.length - 1; markActive(); }
    else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); if (activeIdx >= 0) { set(lis[activeIdx].dataset.value, true); close(); btn.focus(); } }
    else if (e.key === 'Tab') { close(); }
  });

  field.appendChild(input);
  field.appendChild(btn);
  field.appendChild(menu);
  syncLabel();

  return {
    set: function (v) { set(v, false); },
    get value() { return input.value; },
    input: input,
    close: close
  };
}
