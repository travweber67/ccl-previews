(function(){
  var btn=document.getElementById('menuBtn'),
      drawer=document.getElementById('drawer'),
      scrim=document.getElementById('scrim'),
      x=document.getElementById('drawerClose');
  if(!btn||!drawer||!scrim)return;
  function open(){
    drawer.classList.add('open');scrim.classList.add('show');
    drawer.setAttribute('aria-hidden','false');btn.setAttribute('aria-expanded','true');
    document.body.classList.add('drawer-open');
  }
  function close(){
    drawer.classList.remove('open');scrim.classList.remove('show');
    drawer.setAttribute('aria-hidden','true');btn.setAttribute('aria-expanded','false');
    document.body.classList.remove('drawer-open');
  }
  btn.addEventListener('click',open);
  if(x)x.addEventListener('click',close);
  scrim.addEventListener('click',close);
  drawer.querySelectorAll('a').forEach(function(a){a.addEventListener('click',close);});
  document.addEventListener('keydown',function(e){if(e.key==='Escape')close();});
})();
