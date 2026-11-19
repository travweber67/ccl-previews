/* Keep It Local demo — news engine (News round, Nov 19, 2026).
   Renders her real news posts (news-data.js, carried verbatim from
   keepitlocalcc.com/news/): the News page list of expandable post
   cards, and the home page's compact latest-3 block. A post card
   shows its featured image, title and real published date, and her
   excerpt; "Read the full post" expands the complete body in place
   (no dead-end links). Home cards link to news.html#<slug>, and the
   News page opens anchored posts expanded, scrolled into view. */
"use strict";
function kilNewsEsc(s){return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");}
function kilNewsCard(p){
  return '<article class="news-card" id="post-'+kilNewsEsc(p.slug)+'">'
    + '<div class="news-img"><img src="'+kilNewsEsc(p.img)+'" alt="" loading="lazy"></div>'
    + '<div class="news-in">'
    + '<h3 class="news-title">'+kilNewsEsc(p.title)+'</h3>'
    + '<p class="news-date">'+kilNewsEsc(p.date)+'</p>'
    + '<p class="news-excerpt">'+kilNewsEsc(p.excerpt)+'</p>'
    + '<div class="news-body" hidden>'+p.body+'</div>'
    + '<div class="news-foot">'
    + '<button type="button" class="news-more" aria-expanded="false">Read the full post</button>'
    + '<a class="news-src" href="'+kilNewsEsc(p.src)+'" target="_blank" rel="noopener">Original post on keepitlocalcc.com &rarr;</a>'
    + '</div></div></article>';
}
function kilNewsHomeCard(p){
  return '<a class="news-mini" href="news.html#post-'+kilNewsEsc(p.slug)+'">'
    + '<span class="news-mini-img"><img src="'+kilNewsEsc(p.img)+'" alt="" loading="lazy"></span>'
    + '<span class="news-mini-in"><span class="news-mini-title">'+kilNewsEsc(p.title)+'</span>'
    + '<span class="news-date">'+kilNewsEsc(p.date)+'</span></span></a>';
}
(function(){
  if(typeof NEWS_POSTS==="undefined")return;
  var list=document.getElementById("newsList");
  if(list){
    list.innerHTML=NEWS_POSTS.map(kilNewsCard).join("");
    list.addEventListener("click",function(e){
      var b=e.target.closest?e.target.closest(".news-more"):null;
      if(!b)return;
      var card=b.closest(".news-card"), body=card.querySelector(".news-body");
      var open=body.hasAttribute("hidden");
      if(open){body.removeAttribute("hidden");}else{body.setAttribute("hidden","");}
      b.setAttribute("aria-expanded",open?"true":"false");
      b.textContent=open?"Show less":"Read the full post";
    });
    if(location.hash){
      var target=document.querySelector(location.hash);
      if(target&&target.classList.contains("news-card")){
        var body=target.querySelector(".news-body"), btn=target.querySelector(".news-more");
        if(body&&btn){body.removeAttribute("hidden");btn.setAttribute("aria-expanded","true");btn.textContent="Show less";}
        setTimeout(function(){target.scrollIntoView({block:"start"});},60);
      }
    }
  }
  var home=document.getElementById("newsHome");
  if(home){
    home.innerHTML=NEWS_POSTS.slice(0,3).map(kilNewsHomeCard).join("");
  }
})();
