/* Directory sales demo — events engine (Item 8, Nov 19, 2026;
   Pass 29 fixes, Nov 19, 2026).
   Renders the home events block (mini-month + next events on
   desktop; a swipeable day-pill strip + list on mobile), the events
   page (navigable month grid + list + illustrated county map), and
   the Add to Calendar controls. ONE calendar action everywhere
   (Travis, Nov 18, ~11:53 PM): the .ics download, which opens the
   visitor's own calendar app — no separate Google Calendar link.
   Data: events-data.js (KIL_EVENTS). Map (Pass 30): a real Leaflet
   map on the events page, set up the way Columbia County Live does
   it — Leaflet 1.9.4 + OpenStreetMap tiles, fitted to the Columbia
   County bounds, pins at the geocoded venue coordinates. The pure
   builder (kilIcs) carries no DOM code so it can be exercised
   headlessly. */
"use strict";
const KIL_MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const KIL_MON3 = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const KIL_DAYS = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
function kilPad(n){return (n<10?"0":"")+n;}
function kilParts(d){const p=d.split("-");return {y:+p[0],m:+p[1],d:+p[2]};}
function kilDateStr(dt){return dt.getFullYear()+"-"+kilPad(dt.getMonth()+1)+"-"+kilPad(dt.getDate());}
function kilTodayStr(){return kilDateStr(new Date());}
function kilDow(d){const p=kilParts(d);return new Date(p.y,p.m-1,p.d).getDay();}
function kilDateLong(d){const p=kilParts(d);return KIL_DAYS[kilDow(d)]+", "+KIL_MONTHS[p.m-1]+" "+p.d+", "+p.y;}
function kilFmtTime(t){if(!t)return "";let h=+t.slice(0,2),m=t.slice(3,5);const ap=h>=12?"PM":"AM";h=h%12;if(h===0)h=12;return h+":"+m+" "+ap;}
function kilTimeRange(ev){if(!ev.s)return "All day";return kilFmtTime(ev.s)+(ev.e?" – "+kilFmtTime(ev.e):"");}
function kilSlug(ev){return ev.d+"-"+ev.t.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,"").slice(0,42);}
function kilEsc(s){return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");}
function kilIcsEscape(s){return String(s).replace(/\\/g,"\\\\").replace(/;/g,"\\;").replace(/,/g,"\\,").replace(/\r?\n/g,"\\n");}
function kilIcsFold(line){let out="";while(line.length>72){out+=line.slice(0,72)+"\r\n ";line=line.slice(72);}return out+line;}
function kilIcsStamp(ev,hm){const p=kilParts(ev.d);return p.y+kilPad(p.m)+kilPad(p.d)+"T"+hm.replace(":","")+"00";}
function kilIcsEnd(ev){ /* end stamp: real end, else +2h, computed in local parts */
  const p=kilParts(ev.d);const s=ev.s.split(":");let h=+s[0]+2,dd=p.d;
  if(h>=24){h-=24;dd+=1;}
  const dt=new Date(p.y,p.m-1,dd);
  return dt.getFullYear()+kilPad(dt.getMonth()+1)+kilPad(dt.getDate())+"T"+kilPad(h)+s[1]+"00";
}
function kilNextDay(d){const p=kilParts(d);const dt=new Date(p.y,p.m-1,p.d+1);return dt.getFullYear()+kilPad(dt.getMonth()+1)+kilPad(dt.getDate());}
function kilIcs(ev){
  const lines=["BEGIN:VCALENDAR","VERSION:2.0","PRODID:-//Riverside County Local Directory//Events//EN","BEGIN:VEVENT"];
  lines.push("UID:"+kilSlug(ev)+"@riversidecountylocal");
  const now=new Date();lines.push("DTSTAMP:"+now.getUTCFullYear()+kilPad(now.getUTCMonth()+1)+kilPad(now.getUTCDate())+"T"+kilPad(now.getUTCHours())+kilPad(now.getUTCMinutes())+kilPad(now.getUTCSeconds())+"Z");
  if(ev.s){
    lines.push("DTSTART:"+kilIcsStamp(ev,ev.s));
    lines.push("DTEND:"+(ev.e?kilIcsStamp(ev,ev.e):kilIcsEnd(ev)));
  }else{
    const p=kilParts(ev.d);
    lines.push("DTSTART;VALUE=DATE:"+p.y+kilPad(p.m)+kilPad(p.d));
    lines.push("DTEND;VALUE=DATE:"+kilNextDay(ev.d));
  }
  lines.push("SUMMARY:"+kilIcsEscape(ev.t));
  if(ev.place)lines.push("LOCATION:"+kilIcsEscape(ev.place));
  const det=[ev.desc||"",ev.url?("Event page: "+ev.url):"",ev.phone?("Phone: "+ev.phone):""].filter(Boolean).join("\n");
  if(det)lines.push("DESCRIPTION:"+kilIcsEscape(det));
  if(ev.url)lines.push("URL:"+ev.url);
  lines.push("END:VEVENT","END:VCALENDAR");
  return lines.map(kilIcsFold).join("\r\n")+"\r\n";
}
function kilDownloadIcs(ev){
  const blob=new Blob([kilIcs(ev)],{type:"text/calendar;charset=utf-8"});
  const a=document.createElement("a");
  a.href=URL.createObjectURL(blob);a.download=kilSlug(ev)+".ics";
  document.body.appendChild(a);a.click();
  setTimeout(function(){URL.revokeObjectURL(a.href);a.remove();},400);
}
function kilByDate(){return KIL_EVENTS.slice().sort(function(a,b){return a.d<b.d?-1:a.d>b.d?1:((a.s||"99")<(b.s||"99")?-1:1);});}
function kilUpcoming(){const t=kilTodayStr();return kilByDate().filter(function(ev){return ev.d>=t;});}
function kilCard(ev){
  const p=kilParts(ev.d);
  let h='<article class="ev-card" id="ev-'+kilSlug(ev)+'">';
  h+='<div class="ev-body">';
  h+='<div class="ev-badge"><span class="ev-mon">'+KIL_MON3[p.m-1]+'</span><span class="ev-day">'+p.d+'</span><span class="ev-dow">'+KIL_DAYS[kilDow(ev.d)].slice(0,3)+'</span></div>';
  h+='<div class="ev-main"><h3 class="ev-title">'+kilEsc(ev.t)+(ev.price?' <span class="ev-price">'+kilEsc(ev.price)+'</span>':"")+'</h3>';
  h+='<p class="ev-when">'+kilDateLong(ev.d)+' &middot; '+kilTimeRange(ev)+'</p>';
  if(ev.place)h+='<p class="ev-place">'+kilEsc(ev.place)+(ev.phone?' &middot; '+kilEsc(ev.phone):"")+'</p>';
  if(ev.desc)h+='<p class="ev-desc">'+kilEsc(ev.desc)+'</p>';
  h+='<div class="ev-actions"><button type="button" class="ev-btn" data-ics="'+kilSlug(ev)+'">Add to Calendar</button>';
  if(ev.url)h+='<a class="ev-src" target="_blank" rel="noopener" href="'+kilEsc(ev.url)+'">Event details &rarr;</a>';
  h+='</div></div></div>';
  /* picture panel (Fix 5, revised Pass 30): ev.img follows the
     sourcing order — the event's OWN real image first (img/events/…),
     its venue's real photo second, else a folk illustration made for
     THIS event alone (img/ev/…): unique per event, matched to the
     event's type, composed so its subject fits the panel.
     Pass 32: ev.fit marks a real poster/poster — it renders WHOLE
     (object-fit:contain over a blurred, dimmed extension of itself),
     never cover-cropped; photos and illustrations keep cover. */
  if(ev.img){
    if(ev.fit)h+='<div class="ev-pic ev-pic-fit" aria-hidden="true"><img class="ev-fit-bg" src="'+kilEsc(ev.img)+'" alt=""><img class="ev-fit-fg" src="'+kilEsc(ev.img)+'" alt=""></div>';
    else h+='<div class="ev-pic" style="background-image:url(\''+kilEsc(ev.img)+'\')'+(ev.pos?';background-position:'+kilEsc(ev.pos):"")+'" aria-hidden="true"></div>';
  }
  h+='</article>';
  return h;
}
function kilWireIcs(root){
  root.addEventListener("click",function(e){
    const b=e.target.closest?e.target.closest("[data-ics]"):null;
    if(!b)return;
    const ev=KIL_EVENTS.find(function(x){return kilSlug(x)===b.getAttribute("data-ics");});
    if(ev)kilDownloadIcs(ev);
  });
}
/* ---------- home block: mini-month + what's coming up ---------- */
function kilMiniMonth(){
  const now=new Date(),y=now.getFullYear(),m=now.getMonth();
  const evDays={};kilUpcoming().forEach(function(ev){const p=kilParts(ev.d);if(p.y===y&&p.m===m+1)evDays[p.d]=true;});
  const first=new Date(y,m,1).getDay(),days=new Date(y,m+1,0).getDate(),today=now.getDate();
  let h='<div class="mini-head">'+KIL_MONTHS[m]+' '+y+'</div><table class="mini-cal"><thead><tr>';
  ["Su","Mo","Tu","We","Th","Fr","Sa"].forEach(function(d){h+="<th>"+d+"</th>";});
  h+="</tr></thead><tbody><tr>";
  let cell=0;
  for(let i=0;i<first;i++){h+="<td></td>";cell++;}
  for(let d=1;d<=days;d++){
    if(cell>0&&cell%7===0)h+="</tr><tr>";
    const has=evDays[d];
    h+='<td class="'+(has?"has":"")+(d===today?" today":"")+'">'+(has?'<a href="events.html" aria-label="Events on '+KIL_MONTHS[m]+" "+d+'">'+d+"</a>":d)+"</td>";
    cell++;
  }
  while(cell%7!==0){h+="<td></td>";cell++;}
  h+="</tr></tbody></table>";
  return h;
}
/* Mobile day-pill strip (Fix 4): on small screens the home block
   swaps the mini-month for a horizontally swipeable strip of day
   pills covering ~30 days from today, modeled on Columbia County
   Live's forecast pills. Tapping a pill lists that day's events;
   tapping it again (or the "Coming up" reset chip) returns to the
   next-5 view. Desktop keeps the mini-month, untouched. */
let kilHomeDay=null;
const KIL_DOW3=["Su","Mo","Tu","We","Th","Fr","Sa"];
function kilRenderPills(){
  const box=document.getElementById("evPills");
  if(!box)return;
  const evDays={};kilUpcoming().forEach(function(ev){evDays[ev.d]=true;});
  const now=new Date(),todayStr=kilTodayStr();
  let h="";
  for(let i=0;i<30;i++){
    const dt=new Date(now.getFullYear(),now.getMonth(),now.getDate()+i);
    const ds=kilDateStr(dt);
    h+='<button type="button" class="ev-pill'+(ds===todayStr?" today":"")+(kilHomeDay===ds?" sel":"")+'" data-pill="'+ds+'" aria-pressed="'+(kilHomeDay===ds)+'" aria-label="Events on '+kilDateLong(ds)+'"><span class="ev-pill-dow">'+KIL_DOW3[dt.getDay()]+'</span><span class="ev-pill-num">'+dt.getDate()+'</span>'+(evDays[ds]?'<span class="ev-pill-dot" aria-hidden="true"></span>':"")+"</button>";
  }
  box.innerHTML=h;
  /* start scrolled to today */
  const t=box.querySelector(".ev-pill.today");
  if(t)box.scrollLeft=Math.max(0,t.offsetLeft-10);
}
function kilRenderHomeList(){
  const next=document.getElementById("evNext");
  if(!next||!next.classList.contains("ev-next-list"))return;
  const head=document.getElementById("evNextH"),reset=document.getElementById("evHomeReset");
  if(kilHomeDay){
    const evs=kilUpcoming().filter(function(ev){return ev.d===kilHomeDay;});
    if(head)head.textContent=kilDateLong(kilHomeDay);
    if(reset)reset.hidden=false;
    next.innerHTML=evs.length?evs.map(kilCard).join(""):'<p class="sub">No events listed for that day yet.</p>';
  }else{
    if(head)head.textContent="What\u2019s coming up";
    if(reset)reset.hidden=true;
    next.innerHTML=kilUpcoming().slice(0,5).map(kilCard).join("");
  }
}
function kilRenderHome(){
  const mini=document.getElementById("evMini");
  if(mini)mini.innerHTML=kilMiniMonth();
  /* the cards go ONLY into the home block's list container — never
     into any other element that happens to share the id (the events
     page's month-nav button used to collide; it is evNextM now, and
     this class check is the belt to that suspenders) */
  kilRenderPills();
  kilRenderHomeList();
}
function kilWireHome(){
  const box=document.getElementById("evPills");
  if(box){
    box.addEventListener("click",function(e){
      const b=e.target.closest?e.target.closest("[data-pill]"):null;
      if(!b)return;
      const ds=b.getAttribute("data-pill");
      kilHomeDay=(kilHomeDay===ds)?null:ds;
      kilRenderPills();kilRenderHomeList();
      /* re-rendering the strip resets its scroll; put the selected
         pill (or today) back in view */
      const keep=box.querySelector(kilHomeDay?".ev-pill.sel":".ev-pill.today");
      if(keep)keep.scrollIntoView({block:"nearest",inline:"center"});
    });
  }
  const reset=document.getElementById("evHomeReset");
  if(reset)reset.addEventListener("click",function(){kilHomeDay=null;kilRenderPills();kilRenderHomeList();});
  /* if the viewport grows past the mobile layout with a day picked,
     hand the block back to the desktop default */
  if(window.matchMedia){
    const mq=window.matchMedia("(max-width: 900px)");
    const onChange=function(){if(!mq.matches&&kilHomeDay){kilHomeDay=null;kilRenderPills();kilRenderHomeList();}};
    if(mq.addEventListener)mq.addEventListener("change",onChange);
  }
}
/* ---------- events page: month grid + list + map ---------- */
let kilView=null; /* {y, m} month being viewed */
let kilFilterDay=null;
function kilMonthGrid(){
  const grid=document.getElementById("evGrid"),name=document.getElementById("evMonthName");
  if(!grid)return;
  const y=kilView.y,m=kilView.m;
  name.textContent=KIL_MONTHS[m]+" "+y;
  const byDay={};
  kilByDate().forEach(function(ev){const p=kilParts(ev.d);if(p.y===y&&p.m===m+1){(byDay[p.d]=byDay[p.d]||[]).push(ev);}});
  const first=new Date(y,m,1).getDay(),days=new Date(y,m+1,0).getDate();
  const todayStr=kilTodayStr();
  let h='<div class="mg-head">Sun</div><div class="mg-head">Mon</div><div class="mg-head">Tue</div><div class="mg-head">Wed</div><div class="mg-head">Thu</div><div class="mg-head">Fri</div><div class="mg-head">Sat</div>';
  let cell=0;
  for(let i=0;i<first;i++){h+='<div class="mg-cell empty"></div>';cell++;}
  for(let d=1;d<=days;d++){
    const evs=byDay[d]||[];
    const ds=y+"-"+kilPad(m+1)+"-"+kilPad(d);
    h+='<div class="mg-cell'+(evs.length?" has":"")+(ds===todayStr?" today":"")+(kilFilterDay===ds?" sel":"")+'"'+(evs.length?' data-day="'+ds+'" role="button" tabindex="0" aria-label="'+evs.length+" event"+(evs.length>1?"s":"")+" on "+KIL_MONTHS[m]+" "+d+'"':"")+'>';
    h+='<span class="mg-num">'+d+"</span>";
    /* every chip carries its own Add to Calendar action (Fix 2 +
       the Nov 18 one-button decision): the same single .ics
       download as the list cards. It is a real <button> wired by
       the document-level [data-ics] delegate; the grid's day-pick
       handlers ignore clicks that land on it, so adding an event
       never triggers the day filter. */
    evs.slice(0,2).forEach(function(ev){h+='<span class="mg-ev"><span class="mg-ev-t">'+kilEsc(ev.t)+'</span><button type="button" class="mg-add" data-ics="'+kilSlug(ev)+'" title="Add to Calendar" aria-label="Add '+kilEsc(ev.t)+' to calendar"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><rect x="3.5" y="5" width="17" height="15.5" rx="2.5"/><path d="M3.5 10h17M8 3v4M16 3v4M12 13v5M9.5 15.5h5"/></svg></button></span>';});
    if(evs.length>2)h+='<span class="mg-more">+'+(evs.length-2)+" more</span>";
    if(evs.length)h+='<span class="mg-dots">'+evs.map(function(){return "<i></i>";}).join("")+"</span>";
    h+="</div>";cell++;
  }
  while(cell%7!==0){h+='<div class="mg-cell empty"></div>';cell++;}
  grid.innerHTML=h;
}
/* Events-page list (Fix 3): the full upcoming list is long, so it
   opens with the next 6 and a "See more events" pull-down that
   reveals the rest in place (and collapses back). A day filter
   always shows its full (small) match set and hides the expander;
   clearing the filter restores the collapsed default. */
const KIL_LIST_FIRST=6;
let kilListOpen=false;
function kilRenderList(){
  const list=document.getElementById("evList"),note=document.getElementById("evFilterNote");
  if(!list)return;
  let evs=kilUpcoming();
  if(kilFilterDay){
    evs=evs.filter(function(ev){return ev.d===kilFilterDay;});
    if(note){note.hidden=false;note.querySelector("span").textContent="Showing events for "+kilDateLong(kilFilterDay)+".";}
  }else if(note){note.hidden=true;}
  if(!evs.length){
    list.innerHTML='<p class="sub">No events listed for that day. <button type="button" class="ev-linkbtn" id="evReset2">Show all upcoming events</button></p>';
    const r0=document.getElementById("evReset2");if(r0)r0.addEventListener("click",kilResetFilter);
    return;
  }
  const collapsed=!kilFilterDay&&!kilListOpen&&evs.length>KIL_LIST_FIRST;
  const shown=collapsed?evs.slice(0,KIL_LIST_FIRST):evs;
  let h=shown.map(kilCard).join("");
  if(!kilFilterDay&&evs.length>KIL_LIST_FIRST){
    h+='<div class="ev-more-wrap"><button type="button" class="ev-more" id="evMoreBtn" aria-expanded="'+kilListOpen+'">'+(kilListOpen?"Show fewer events":"See more events")+' <span class="ev-more-n">'+(kilListOpen?"&#9650;":"("+(evs.length-KIL_LIST_FIRST)+" more) &#9660;")+"</span></button></div>";
  }
  list.innerHTML=h;
  const mb=document.getElementById("evMoreBtn");
  if(mb)mb.addEventListener("click",function(){
    kilListOpen=!kilListOpen;kilRenderList();
    if(!kilListOpen){const l=document.getElementById("evList");if(l)l.scrollIntoView({behavior:"smooth",block:"start"});}
  });
}
function kilResetFilter(){kilFilterDay=null;kilListOpen=false;kilMonthGrid();kilRenderList();}
/* Real county map (Pass 30; Travis, Nov 19, ~12:15 AM — supersedes
   the folk-art illustration): built the way Columbia County Live
   builds its maps — Leaflet 1.9.4 from unpkg + the OpenStreetMap
   base tile layer, nothing else on it (no trails or overlays).
   Opens fitted to the Columbia County bounds (the bbox of the
   county boundary CCL publishes: W -123.366, S 45.7211,
   E -122.7601, N 46.189), zoom + pan on (scroll-wheel zoom off,
   CCL's pattern, so the page never gets scroll-trapped; the +/-
   control, double-click and pinch all zoom). Pins sit at the
   events' geocoded venue coordinates, grouped by venue with a
   count badge where events share a spot; a pin click names its
   event(s) in a popup AND scrolls to + flashes the first event's
   card in the list below. */
let kilLeafletMap=null;
function kilBuildMap(){
  const box=document.getElementById("evMap");
  if(!box)return;
  if(typeof L==="undefined"){
    box.innerHTML='<p class="sub">The map could not load just now. Every event above lists its location.</p>';
    return;
  }
  box.innerHTML='<div id="kilMap" class="kil-lmap" role="application" aria-label="Map of event locations across Columbia County"></div>';
  const map=L.map("kilMap",{scrollWheelZoom:false});
  kilLeafletMap=map;
  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png",{
    maxZoom:18,
    attribution:'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map);
  map.fitBounds([[45.7211,-123.366],[46.189,-122.7601]],{padding:[4,4]});
  const groups={};
  kilUpcoming().forEach(function(ev){if(ev.lat===null||ev.lat===undefined)return;const k=ev.lat+","+ev.lng;(groups[k]=groups[k]||[]).push(ev);});
  Object.keys(groups).forEach(function(k){
    const evs=groups[k],first=evs[0];
    const icon=L.divIcon({
      className:"kil-lpin-wrap",
      html:'<span class="kil-lpin"><span class="kil-lpin-dot"></span>'+(evs.length>1?'<span class="kil-lpin-n">'+evs.length+"</span>":"")+"</span>",
      iconSize:[26,26],iconAnchor:[13,13]
    });
    const mk=L.marker([first.lat,first.lng],{icon:icon,title:evs.map(function(ev){return ev.t;}).join(" · ")}).addTo(map);
    mk.bindPopup('<div class="kil-pop">'+evs.map(function(ev){return kilEsc(ev.t);}).join("<br>")+"</div>");
    mk.on("click",function(){
      const card=document.getElementById("ev-"+kilSlug(first));
      if(card){card.scrollIntoView({behavior:"smooth",block:"center"});card.classList.remove("flash");void card.offsetWidth;card.classList.add("flash");}
    });
  });
  /* the panel is laid out before Leaflet measures it in some
     browsers; a beat later, re-measure so tiles fill the frame */
  setTimeout(function(){try{map.invalidateSize();}catch(e){}},150);
}
function kilRenderEventsPage(){
  const now=new Date();
  kilView={y:now.getFullYear(),m:now.getMonth()};
  kilMonthGrid();kilRenderList();kilBuildMap();
  const prev=document.getElementById("evPrevM"),next=document.getElementById("evNextM");
  if(prev)prev.addEventListener("click",function(){kilView.m--;if(kilView.m<0){kilView.m=11;kilView.y--;}kilMonthGrid();});
  if(next)next.addEventListener("click",function(){kilView.m++;if(kilView.m>11){kilView.m=0;kilView.y++;}kilMonthGrid();});
  const grid=document.getElementById("evGrid");
  if(grid){
    const pick=function(el){if(!el)return;kilFilterDay=(kilFilterDay===el.getAttribute("data-day"))?null:el.getAttribute("data-day");kilListOpen=false;kilMonthGrid();kilRenderList();if(kilFilterDay){const l=document.getElementById("evList");if(l)l.scrollIntoView({behavior:"smooth",block:"start"});}};
    /* clicks on a chip's Add to Calendar button belong to the
       button (the [data-ics] delegate fires the download) — never
       to the day filter */
    grid.addEventListener("click",function(e){if(e.target.closest&&e.target.closest(".mg-add"))return;pick(e.target.closest?e.target.closest("[data-day]"):null);});
    grid.addEventListener("keydown",function(e){if(e.target.closest&&e.target.closest(".mg-add"))return;if(e.key==="Enter"||e.key===" "){const el=e.target.closest?e.target.closest("[data-day]"):null;if(el){e.preventDefault();pick(el);}}});
  }
  const reset=document.getElementById("evShowAll");
  if(reset)reset.addEventListener("click",kilResetFilter);
}
if(typeof document!=="undefined"){
  document.addEventListener("DOMContentLoaded",function(){
    kilRenderHome();
    kilWireHome();
    if(document.getElementById("evGrid"))kilRenderEventsPage();
    kilWireIcs(document);
  });
}
