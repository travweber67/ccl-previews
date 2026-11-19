/* Keep It Local demo — events engine (Item 8, Nov 19, 2026).
   Renders the home events block (mini-month + next events), the
   events page (navigable month grid + list + county map), and the
   Add to Calendar controls (.ics download + Google Calendar link).
   Data: events-data.js (KIL_EVENTS). Map boundary: county-path.js
   (COUNTY_RING). The pure builders (kilIcs / kilGcal) carry no DOM
   code so they can be exercised headlessly. */
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
  const lines=["BEGIN:VCALENDAR","VERSION:2.0","PRODID:-//Keep It Local Columbia County//Events//EN","BEGIN:VEVENT"];
  lines.push("UID:"+kilSlug(ev)+"@keepitlocalcc");
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
function kilGcal(ev){
  let dates;
  if(ev.s){dates=kilIcsStamp(ev,ev.s)+"/"+(ev.e?kilIcsStamp(ev,ev.e):kilIcsEnd(ev));}
  else{const p=kilParts(ev.d);dates=p.y+kilPad(p.m)+kilPad(p.d)+"/"+kilNextDay(ev.d);}
  const det=[ev.desc||"",ev.url?("Event page: "+ev.url):""].filter(Boolean).join("\n");
  return "https://calendar.google.com/calendar/render?action=TEMPLATE&text="+encodeURIComponent(ev.t)+"&dates="+dates+"&details="+encodeURIComponent(det)+"&location="+encodeURIComponent(ev.place||"");
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
  h+='<div class="ev-badge"><span class="ev-mon">'+KIL_MON3[p.m-1]+'</span><span class="ev-day">'+p.d+'</span><span class="ev-dow">'+KIL_DAYS[kilDow(ev.d)].slice(0,3)+'</span></div>';
  h+='<div class="ev-main"><h3 class="ev-title">'+kilEsc(ev.t)+(ev.price?' <span class="ev-price">'+kilEsc(ev.price)+'</span>':"")+'</h3>';
  h+='<p class="ev-when">'+kilDateLong(ev.d)+' &middot; '+kilTimeRange(ev)+'</p>';
  if(ev.place)h+='<p class="ev-place">'+kilEsc(ev.place)+(ev.phone?' &middot; '+kilEsc(ev.phone):"")+'</p>';
  if(ev.desc)h+='<p class="ev-desc">'+kilEsc(ev.desc)+'</p>';
  h+='<div class="ev-actions"><button type="button" class="ev-btn" data-ics="'+kilSlug(ev)+'">Add to Calendar</button><a class="ev-gcal" target="_blank" rel="noopener" href="'+kilGcal(ev)+'">Google Calendar</a>';
  if(ev.url)h+='<a class="ev-src" target="_blank" rel="noopener" href="'+kilEsc(ev.url)+'">Event details &rarr;</a>';
  h+='</div></div></article>';
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
function kilRenderHome(){
  const mini=document.getElementById("evMini"),next=document.getElementById("evNext");
  if(mini)mini.innerHTML=kilMiniMonth();
  /* the cards go ONLY into the home block's list container — never
     into any other element that happens to share the id (the events
     page's month-nav button used to collide; it is evNextM now, and
     this class check is the belt to that suspenders) */
  if(next&&next.classList.contains("ev-next-list"))next.innerHTML=kilUpcoming().slice(0,5).map(kilCard).join("");
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
    evs.slice(0,2).forEach(function(ev){h+='<span class="mg-ev">'+kilEsc(ev.t)+"</span>";});
    if(evs.length>2)h+='<span class="mg-more">+'+(evs.length-2)+" more</span>";
    if(evs.length)h+='<span class="mg-dots">'+evs.map(function(){return "<i></i>";}).join("")+"</span>";
    h+="</div>";cell++;
  }
  while(cell%7!==0){h+='<div class="mg-cell empty"></div>';cell++;}
  grid.innerHTML=h;
}
function kilRenderList(){
  const list=document.getElementById("evList"),note=document.getElementById("evFilterNote");
  if(!list)return;
  let evs=kilUpcoming();
  if(kilFilterDay){
    evs=evs.filter(function(ev){return ev.d===kilFilterDay;});
    if(note){note.hidden=false;note.querySelector("span").textContent="Showing events for "+kilDateLong(kilFilterDay)+".";}
  }else if(note){note.hidden=true;}
  list.innerHTML=evs.length?evs.map(kilCard).join(""):'<p class="sub">No events listed for that day. <button type="button" class="ev-linkbtn" id="evReset2">Show all upcoming events</button></p>';
  const r=document.getElementById("evReset2");if(r)r.addEventListener("click",kilResetFilter);
}
function kilResetFilter(){kilFilterDay=null;kilMonthGrid();kilRenderList();}
function kilBuildMap(){
  const box=document.getElementById("evMap");
  if(!box||typeof COUNTY_RING==="undefined")return;
  let lngMin=1e9,lngMax=-1e9,latMin=1e9,latMax=-1e9;
  COUNTY_RING.forEach(function(p){lngMin=Math.min(lngMin,p[0]);lngMax=Math.max(lngMax,p[0]);latMin=Math.min(latMin,p[1]);latMax=Math.max(latMax,p[1]);});
  const K=Math.cos(46*Math.PI/180),W=720,H=540,PAD=20;
  const xr=(lngMax-lngMin)*K,yr=latMax-latMin;
  const sc=Math.min((W-2*PAD)/xr,(H-2*PAD)/yr);
  const ox=(W-xr*sc)/2,oy=(H-yr*sc)/2;
  function px(lng,lat){return [ox+(lng-lngMin)*K*sc,oy+(latMax-lat)*sc];}
  let path="";
  COUNTY_RING.forEach(function(p,i){const c=px(p[0],p[1]);path+=(i?"L":"M")+c[0].toFixed(1)+" "+c[1].toFixed(1);});
  path+="Z";
  const towns=[["St. Helens",-122.7979,45.8695],["Scappoose",-122.8769,45.7625],["Columbia City",-122.8083,45.8955],["Warren",-122.8417,45.8340],["Rainier",-122.9364,46.0950],["Clatskanie",-123.2020,46.1105],["Vernonia",-123.1967,45.8645]];
  let h='<svg viewBox="0 0 '+W+" "+H+'" role="img" aria-label="Map of Columbia County with event locations">';
  h+='<path class="map-land" d="'+path+'"/>';
  towns.forEach(function(t){const c=px(t[1],t[2]);h+='<text class="map-town" x="'+c[0].toFixed(1)+'" y="'+c[1].toFixed(1)+'" text-anchor="middle">'+t[0]+"</text>";});
  const groups={};
  kilUpcoming().forEach(function(ev){if(ev.lat===null||ev.lat===undefined)return;const k=ev.lat+","+ev.lng;(groups[k]=groups[k]||[]).push(ev);});
  Object.keys(groups).forEach(function(k){
    const evs=groups[k],c=px(evs[0].lng,evs[0].lat);
    const titles=evs.map(function(ev){return ev.t;}).join(" · ");
    h+='<g class="ev-pin" data-target="ev-'+kilSlug(evs[0])+'" transform="translate('+c[0].toFixed(1)+","+c[1].toFixed(1)+')"><title>'+kilEsc(titles)+'</title><circle class="pin-body" r="8"/><circle class="pin-dot" r="3"/>'+(evs.length>1?'<text class="pin-n" y="-13">'+evs.length+"</text>":"")+"</g>";
  });
  h+="</svg>";
  box.innerHTML=h;
  box.addEventListener("click",function(e){
    const g=e.target.closest?e.target.closest(".ev-pin"):null;
    if(!g)return;
    const card=document.getElementById(g.getAttribute("data-target"));
    if(card){card.scrollIntoView({behavior:"smooth",block:"center"});card.classList.remove("flash");void card.offsetWidth;card.classList.add("flash");}
  });
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
    const pick=function(el){if(!el)return;kilFilterDay=(kilFilterDay===el.getAttribute("data-day"))?null:el.getAttribute("data-day");kilMonthGrid();kilRenderList();if(kilFilterDay){const l=document.getElementById("evList");if(l)l.scrollIntoView({behavior:"smooth",block:"start"});}};
    grid.addEventListener("click",function(e){pick(e.target.closest?e.target.closest("[data-day]"):null);});
    grid.addEventListener("keydown",function(e){if(e.key==="Enter"||e.key===" "){const el=e.target.closest?e.target.closest("[data-day]"):null;if(el){e.preventDefault();pick(el);}}});
  }
  const reset=document.getElementById("evShowAll");
  if(reset)reset.addEventListener("click",kilResetFilter);
}
if(typeof document!=="undefined"){
  document.addEventListener("DOMContentLoaded",function(){
    kilRenderHome();
    if(document.getElementById("evGrid"))kilRenderEventsPage();
    kilWireIcs(document);
  });
}
