// Slide-out listing panel (Item 2): clicking a listing card opens its full
// details in a panel from the right instead of navigating to a new page.
// The page never moves, so closing returns the visitor to the exact scroll
// spot. Phone / website links inside a card keep working as links.
(function(){
  var panel, scrim, body, x, lastFocus=null;

  function esc(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;');}

  function build(){
    scrim=document.createElement('div');
    scrim.className='panel-scrim'; scrim.id='panelScrim';
    panel=document.createElement('aside');
    panel.className='panel'; panel.id='panel';
    panel.setAttribute('role','dialog'); panel.setAttribute('aria-modal','true');
    panel.setAttribute('aria-hidden','true'); panel.setAttribute('aria-label','Business details');
    panel.innerHTML='<button class="panel-x" id="panelClose" aria-label="Close details">&times;</button><div class="panel-body" id="panelBody"></div>';
    document.body.appendChild(scrim);
    document.body.appendChild(panel);
    body=document.getElementById('panelBody');
    x=document.getElementById('panelClose');
    x.addEventListener('click',close);
    scrim.addEventListener('click',close);
    document.addEventListener('keydown',function(e){
      if(e.key==='Escape'&&panel.classList.contains('open'))close();
    });
  }

  function fill(l){
    var badges=(l.featured?'<span class="badge">Featured</span>':'')+(l.isnew?'<span class="badge new">What\'s New</span>':'');
    var logo=(typeof LOGOS!=='undefined'&&LOGOS[l.id])?'<span class="panel-logo"><img src="'+LOGOS[l.id]+'" alt="'+esc(l.name)+' logo"></span>':'';
    var h='';
    if(l.img)h+='<div class="panel-photo"><img src="'+l.img+'" alt="'+esc(l.name)+'"></div>';
    h+='<div class="panel-in">';
    h+='<div class="panel-head">'+logo+'<div class="panel-title"><h2>'+esc(l.name)+badges+'</h2><div class="meta">'+esc(l.town)+' &middot; '+esc(l.cat)+'</div></div></div>';
    h+='<p class="panel-desc">'+esc(l.desc)+'</p>';
    var rows='';
    if(l.addr)rows+='<div class="panel-row"><span class="panel-k">Address</span><span>'+esc(l.addr)+'<br><a href="https://maps.google.com/?q='+encodeURIComponent(l.addr)+'" target="_blank" rel="noopener">Get Directions</a></span></div>';
    if(l.phone)rows+='<div class="panel-row"><span class="panel-k">Phone</span><a href="tel:'+l.phone.replace(/[^0-9+]/g,'')+'">'+esc(l.phone)+'</a></div>';
    if(l.web)rows+='<div class="panel-row"><span class="panel-k">Website</span><a href="https://'+esc(l.web.replace(/^https?:\/\//,''))+'" target="_blank" rel="noopener">'+esc(l.web)+'</a></div>';
    if(l.email)rows+='<div class="panel-row"><span class="panel-k">Email</span><a href="mailto:'+esc(l.email)+'">'+esc(l.email)+'</a></div>';
    if(rows)h+='<div class="panel-rows">'+rows+'</div>';
    else h+='<p class="panel-note">Contact details as published on the live listing.</p>';
    h+='</div>';
    body.innerHTML=h;
    body.scrollTop=0;
  }

  function open(id,fromEl){
    var l=LISTINGS.find(function(x){return x.id===id;});
    if(!l)return;
    lastFocus=fromEl||document.activeElement;
    fill(l);
    panel.classList.add('open'); scrim.classList.add('show');
    panel.setAttribute('aria-hidden','false');
    document.body.classList.add('panel-open');
    x.focus({preventScroll:true});
  }
  function close(){
    panel.classList.remove('open'); scrim.classList.remove('show');
    panel.setAttribute('aria-hidden','true');
    document.body.classList.remove('panel-open');
    if(lastFocus&&lastFocus.focus)lastFocus.focus({preventScroll:true});
  }

  document.addEventListener('click',function(e){
    var opener=e.target.closest?e.target.closest('[data-panel-open]'):null;
    if(opener){e.preventDefault();open(opener.getAttribute('data-panel-open'),opener);return;}
    var card=e.target.closest?e.target.closest('.card'):null;
    if(!card)return;
    if(e.target.closest('.links a'))return; // phone / website links stay links
    var a=e.target.closest('a[href^="listing.html"]');
    var id=card.getAttribute('data-id');
    if(!id&&a){var q=a.getAttribute('href').split('?')[1];id=new URLSearchParams(q).get('id');}
    if(!id)return;
    e.preventDefault();
    open(id,card);
  });

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',build);
  else build();
})();
