// Pass 25: dark / light mode toggle. The theme itself is chosen before
// paint by the tiny inline script in each page's <head> (saved choice in
// localStorage 'kil-theme', else the visitor's system preference); this
// file only wires the header button: flip the data-theme attribute on
// <html>, remember the choice, and keep the button's label/pressed
// state honest. All styling lives in style.css under [data-theme="dark"].
(function(){
  var btn=document.getElementById('themeToggle');
  if(!btn)return;
  var root=document.documentElement;
  function sync(){
    var dark=root.getAttribute('data-theme')==='dark';
    btn.setAttribute('aria-pressed',dark?'true':'false');
    btn.setAttribute('aria-label',dark?'Switch to light mode':'Switch to dark mode');
  }
  btn.addEventListener('click',function(){
    var next=root.getAttribute('data-theme')==='dark'?'light':'dark';
    root.setAttribute('data-theme',next);
    try{window.localStorage.setItem('kil-theme',next);}catch(e){}
    sync();
  });
  sync();
})();
