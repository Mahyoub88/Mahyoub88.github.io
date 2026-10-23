// Shell page only: it contains no data. Numbers are fetched from /api/stats with the
// bearer token the owner types in, and everything is rendered with textContent.
// The page script below deliberately avoids backticks and ${} so it can live in this template string.
export const DASHBOARD_HTML = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>Visitor Analytics</title>
<style>
:root{--bg:#f6f7f9;--card:#fff;--text:#14181f;--muted:#5d6675;--line:#e1e5ec;--accent:#2f6fed}
@media (prefers-color-scheme:dark){:root{--bg:#0b0e14;--card:#131824;--text:#e8ecf3;--muted:#98a2b3;--line:#232b3b;--accent:#6c9cff}}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--text);font:15px/1.5 system-ui,sans-serif}
main{max-width:1100px;margin:0 auto;padding:16px}
h1{font-size:1.4rem;margin:8px 0 16px}h2{font-size:1rem;margin:0 0 8px}
.bar{display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-bottom:16px}
input,select,button{font:inherit;padding:8px 10px;border:1px solid var(--line);border-radius:8px;background:var(--card);color:var(--text)}
button{background:var(--accent);color:#fff;border-color:var(--accent);cursor:pointer}
.grid{display:grid;gap:12px;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));margin-bottom:12px}
.two{display:grid;gap:12px;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));margin-bottom:12px}
.card{background:var(--card);border:1px solid var(--line);border-radius:12px;padding:14px;overflow:auto}
.kpi b{display:block;font-size:1.7rem}.kpi span,.muted{color:var(--muted);font-size:.85rem}
table{width:100%;border-collapse:collapse;font-size:.88rem}td,th{text-align:left;padding:5px 6px;border-bottom:1px solid var(--line);white-space:nowrap}
td.n,th.n{text-align:right}
svg{width:100%;height:140px;display:block}.err{color:#d33}
</style>
</head>
<body>
<main>
<h1>Visitor Analytics</h1>
<form class="bar" id="login">
<input id="token" type="password" placeholder="Dashboard token" autocomplete="off" required>
<select id="days"><option value="7">7 days</option><option value="30" selected>30 days</option><option value="90">90 days</option><option value="365">1 year</option></select>
<button type="submit">Load</button><span id="msg" class="err"></span>
</form>
<div id="out"></div>
</main>
<script>
(function(){
var out=document.getElementById('out'),msg=document.getElementById('msg'),tokenInput=document.getElementById('token'),days=document.getElementById('days');
var KIND={cv_download:'CV downloads',linkedin:'LinkedIn link clicks',github:'GitHub link clicks',orcid:'ORCID link clicks',email:'Email clicks',whatsapp:'WhatsApp clicks'};
try{tokenInput.value=sessionStorage.getItem('va-token')||''}catch(e){}
function el(tag,text,cls){var n=document.createElement(tag);if(text!=null)n.textContent=String(text);if(cls)n.className=cls;return n}
function card(title){var c=el('div',null,'card');c.appendChild(el('h2',title));return c}
function kpi(label,value){var c=el('div',null,'card kpi');c.appendChild(el('b',value));c.appendChild(el('span',label));return c}
function table(cols,rows){
  var t=el('table'),h=el('tr');
  cols.forEach(function(c){h.appendChild(el('th',c.h,c.n?'n':''))});t.appendChild(h);
  if(!rows.length){var e=el('tr'),d=el('td','No data yet');d.colSpan=cols.length;e.appendChild(d);t.appendChild(e)}
  rows.forEach(function(r){var tr=el('tr');cols.forEach(function(c){tr.appendChild(el('td',c.f(r),c.n?'n':''))});t.appendChild(tr)});
  return t}
function listCard(title,rows,label,valueKey,valueHead){var c=card(title);c.appendChild(table([{h:label,f:function(r){return r.label||r.path||r.name}},{h:valueHead,n:1,f:function(r){return r[valueKey]}}],rows));return c}
function chart(daily){
  var c=card('Daily page views'),ns='http://www.w3.org/2000/svg',svg=document.createElementNS(ns,'svg');
  svg.setAttribute('viewBox','0 0 600 140');svg.setAttribute('preserveAspectRatio','none');
  var max=Math.max.apply(null,[1].concat(daily.map(function(d){return d.views}))),w=600/Math.max(daily.length,1);
  daily.forEach(function(d,i){var h=d.views/max*120,r=document.createElementNS(ns,'rect');
    r.setAttribute('x',i*w+1);r.setAttribute('y',130-h);r.setAttribute('width',Math.max(w-2,1));r.setAttribute('height',h);r.setAttribute('fill','var(--accent)');
    var t=document.createElementNS(ns,'title');t.textContent=d.day+': '+d.views+' views, '+d.visitors+' visitors';r.appendChild(t);svg.appendChild(r)});
  c.appendChild(svg);
  c.appendChild(el('div',daily.length?daily[0].day+' to '+daily[daily.length-1].day+' (peak '+max+' views/day)':'No visits recorded yet','muted'));return c}
function render(s){
  out.textContent='';
  var t=s.totals,cv=0,li=0;
  s.clicks.forEach(function(c){if(c.name==='cv_download')cv=c.clicks});
  s.sources.forEach(function(c){if(c.label==='linkedin')li=c.sessions});
  var g=el('div',null,'grid');
  g.appendChild(kpi('Page views',t.views));g.appendChild(kpi('Unique visitors',t.visitors));g.appendChild(kpi('Sessions',t.sessions));
  g.appendChild(kpi('Returning visitors',t.returningVisitors));g.appendChild(kpi('Avg. active time / session',t.avgEngagedSeconds+' s'));
  g.appendChild(kpi('CV downloads',cv));g.appendChild(kpi('LinkedIn visits',li));out.appendChild(g);
  out.appendChild(chart(s.daily));
  var a=el('div',null,'two');
  a.appendChild(listCard('Top pages and projects',s.pages,'Page','views','Views'));
  a.appendChild(listCard('Traffic sources (sessions)',s.sources,'Source','sessions','Sessions'));
  var ev=s.clicks.map(function(c){return {label:KIND[c.name]||c.name,clicks:c.clicks}});
  a.appendChild(listCard('Interactions',ev,'Event','clicks','Clicks'));
  a.appendChild(listCard('Countries',s.countries,'Country','visitors','Visitors'));
  a.appendChild(listCard('Cities',s.cities,'City','visitors','Visitors'));
  a.appendChild(listCard('Devices',s.devices,'Device','visitors','Visitors'));
  a.appendChild(listCard('Operating systems',s.systems,'OS','visitors','Visitors'));
  a.appendChild(listCard('Browsers',s.browsers,'Browser','visitors','Visitors'));
  out.appendChild(a);
  var log=card('Visit log (latest 100)');
  log.appendChild(table([
    {h:'Time',f:function(r){return new Date(r.ts).toLocaleString()}},
    {h:'Event',f:function(r){return r.type==='click'?'click: '+(KIND[r.name]||r.name):'view'}},
    {h:'Page',f:function(r){return r.path}},
    {h:'Source',f:function(r){return r.ref_kind==='internal'?'':r.ref_kind}},
    {h:'Location',f:function(r){return [r.city,r.country].filter(Boolean).join(', ')}},
    {h:'Device',f:function(r){return [r.device,r.os,r.browser].join(' / ')}},
    {h:'Returning',f:function(r){return r.is_returning?'yes':''}}
  ],s.recent));
  out.appendChild(log)}
function load(){
  msg.textContent='';
  fetch('/api/stats?days='+encodeURIComponent(days.value),{headers:{Authorization:'Bearer '+tokenInput.value},cache:'no-store'})
    .then(function(r){if(r.status===401)throw new Error('Wrong token');if(!r.ok)throw new Error('Request failed ('+r.status+')');return r.json()})
    .then(function(s){try{sessionStorage.setItem('va-token',tokenInput.value)}catch(e){}render(s)})
    .catch(function(e){out.textContent='';msg.textContent=e.message})}
document.getElementById('login').addEventListener('submit',function(e){e.preventDefault();load()});
if(tokenInput.value)load();
})();
</script>
</body>
</html>`
