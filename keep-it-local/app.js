function cardHTML(l){
  const badges=(l.featured?'<span class="badge">Featured</span>':'')+(l.isnew?'<span class="badge new">What\'s New</span>':'');
  const links=[];
  if(l.phone)links.push('<a href="tel:'+l.phone.replace(/[^0-9+]/g,'')+'">'+l.phone+'</a>');
  if(l.web)links.push('<a href="https://'+l.web.replace(/^https?:\/\//,'')+'" target="_blank" rel="noopener">Website</a>');
  return '<article class="card" data-id="'+l.id+'">'+(l.img?'<a href="listing.html?id='+l.id+'"><img class="card-img" src="'+l.img+'" alt="'+l.name+'" loading="lazy"></a>':'')+'<h3><a href="listing.html?id='+l.id+'">'+l.name+'</a>'+badges+'</h3>'+
   '<div class="meta">'+l.town+' &middot; '+l.cat+'</div><p>'+l.desc+'</p>'+
   (links.length?'<div class="links">'+links.join(' &middot; ')+'</div>':'')+'</article>';
}
function renderInto(el,list){document.getElementById(el).innerHTML=list.map(cardHTML).join('');}
