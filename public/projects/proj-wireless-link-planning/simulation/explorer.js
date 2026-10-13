const byId=id=>document.getElementById(id);
const sensitivity=[-96,-95,-92,-90,-86,-83,-77,-74,-95,-93,-90,-87,-84,-79,-78,-75];
const rate=[6.5,13,19.5,26,39,52,58.5,65,13,26,39,52,78,104,117,130];
let data;
function render(){
 const id=byId('hop').value, h=data.hops.find(h=>h.id===id),r=data.radios[id];
 const f=Number(byId('frequency').value),mast=Number(byId('mast').value),clutter=Number(byId('clutter').value),k=Number(byId('earth').value);
 if(!Number.isFinite(f)||f<4900||f>5875||mast<0||mast>60||clutter<0||clutter>30||!byId('frequency').value||!byId('mast').value||!byId('clutter').value){byId('error').textContent='Use 4,900–5,875 MHz, 0–60 m antenna height and 0–30 m clutter. Confirm actual device and local permitted frequency separately.';return;}
 byId('error').textContent='';
 const cap=byId('eirp').value==='none'?Infinity:Number(byId('eirp').value),loss=32.44+20*Math.log10(f)+20*Math.log10(h.distance_km);
 const rows=rate.map((phy,m)=>{const tx=Math.min(r.tx[m],cap-r.gain+r.feed_loss),eirp=tx+r.gain-r.feed_loss,rx=eirp+r.gain-r.feed_loss-loss-2;return {m,tx,eirp,rx,margin:rx-sensitivity[m],phy,payload:phy*.5};});
 const D=h.distance_km*1000,n=h.elev.length;
 const p=h.elev.map((ground,i)=>{const x=D*i/(n-1),los=h.elev[0]+mast+(h.elev[n-1]-h.elev[0])*x/D,bulge=x*(D-x)/(2*k*6371000),fresnel=Math.sqrt((299.792458/f)*x*(D-x)/D);return {x,ground,los,obstruction:ground+bulge+clutter,fresnel};});
 const min=Math.min(...p.slice(1,-1).map(q=>(q.los-q.obstruction)/q.fresnel));
 const m15=rows[15],best=rows.filter(r=>r.margin>=10).sort((a,b)=>b.phy-a.phy)[0];
 byId('metrics').innerHTML=[['FSPL',loss.toFixed(2)+' dB'],['MCS15 margin',m15.margin.toFixed(2)+' dB'],['Sampled Fresnel clearance',min.toFixed(2)+' × r₁'],['PHY with ≥10 dB margin',best?best.phy+' Mbps':'None'],['Payload estimate',best?best.payload+' Mbps':'None'],['Profile distance',h.distance_km.toFixed(2)+' km']].map(([label,value])=>`<div class="metric"><strong>${value}</strong><span>${label}</span></div>`).join('');
 byId('budget').querySelector('tbody').innerHTML=rows.map(r=>`<tr><td>${r.m}</td><td>${r.tx.toFixed(1)}</td><td>${r.eirp.toFixed(1)}</td><td>${r.rx.toFixed(2)}</td><td>${sensitivity[r.m]}</td><td class="${r.margin>=10?'pass':'below'}">${r.margin.toFixed(2)}</td><td>${r.phy}</td><td>${r.payload}</td></tr>`).join('');
 byId('profile-note').textContent=`${r.name}; ${h.elev[0]} → ${h.elev[n-1]} m AMSL. Sample spacing ${(D/60).toFixed(0)} m. ${mast} m antennas, ${clutter} m clutter, k=${k.toFixed(2)}. Minimum is evaluated at interior sample points only.`;
 draw(p,D);
}
function draw(p,D){
 const c=byId('profile'),ctx=c.getContext('2d'),w=c.width,h=c.height,L=80,R=25,T=30,B=65;
 const lo=Math.min(...p.map(q=>q.ground))-60,hi=Math.max(...p.map(q=>Math.max(q.los+q.fresnel,q.obstruction)))+70;
 const X=x=>L+(w-L-R)*x/D,Y=y=>T+(h-T-B)*(1-(y-lo)/(hi-lo));
 ctx.fillStyle='#f7f9fc';ctx.fillRect(0,0,w,h);ctx.font='17px Arial';ctx.lineWidth=1;
 for(let v=Math.ceil(lo/200)*200;v<=hi;v+=200){ctx.strokeStyle='#dbe3ec';ctx.beginPath();ctx.moveTo(L,Y(v));ctx.lineTo(w-R,Y(v));ctx.stroke();ctx.fillStyle='#34485d';ctx.fillText(v,12,Y(v)+5);}
 for(let i=0;i<=4;i++){ctx.fillStyle='#34485d';ctx.fillText((D/1000*i/4).toFixed(1),X(D*i/4)-12,h-B+30);}
 ctx.fillText('Distance along path (km)',w/2-95,h-10);ctx.fillText('m AMSL',10,20);
 const line=(getter,col)=>{ctx.strokeStyle=col;ctx.lineWidth=3;ctx.beginPath();p.forEach((q,i)=>i?ctx.lineTo(X(q.x),Y(getter(q))):ctx.moveTo(X(q.x),Y(getter(q))));ctx.stroke();};
 ctx.fillStyle='#55a2d44d';ctx.beginPath();p.forEach((q,i)=>i?ctx.lineTo(X(q.x),Y(q.los+.6*q.fresnel)):ctx.moveTo(X(q.x),Y(q.los+.6*q.fresnel)));[...p].reverse().forEach(q=>ctx.lineTo(X(q.x),Y(q.los-.6*q.fresnel)));ctx.closePath();ctx.fill();
 line(q=>q.obstruction,'#65754c');line(q=>q.los,'#236bc2');ctx.fillStyle='#236bc2';ctx.fillText('Line of sight',L+20,T+8);ctx.fillStyle='#65754c';ctx.fillText('Ground + curvature + clutter',L+190,T+8);ctx.fillStyle='#397a9e';ctx.fillText('60% Fresnel envelope',L+550,T+8);
}
byId('controls').addEventListener('submit',e=>e.preventDefault());
byId('controls').addEventListener('input',()=>{if(data)render();});
try{const response=await fetch('inputs.json');if(!response.ok)throw new Error('Input dataset not available');data=await response.json();render();}catch{byId('error').textContent='The calculation dataset could not be loaded. Open this page through the website or a local web server.';}
