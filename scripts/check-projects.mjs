import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const publicRoot=path.join(root,'public');
const content=JSON.parse(fs.readFileSync(path.join(root,'src/data/defaultContent.json'),'utf8'));
const errors=[];
const unique=(values,label)=>{if(new Set(values).size!==values.length)errors.push(`Duplicate ${label}`);};
unique(content.projects.map(p=>p.id),'project ids');
unique(content.projects.map(p=>p.title),'project titles');
unique(content.projects.map(p=>p.coverImage),'generated cover paths');
unique(content.projects.filter(p=>p.coverImage&&fs.existsSync(path.join(publicRoot,p.coverImage))).map(p=>crypto.createHash('sha256').update(fs.readFileSync(path.join(publicRoot,p.coverImage))).digest('hex')),'generated cover contents');
const decode=s=>s.replaceAll('&amp;','&').replaceAll('&quot;','"').replaceAll('&lt;','<').replaceAll('&gt;','>');
const visit=dir=>fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?visit(path.join(dir,e.name)):[path.join(dir,e.name)]);
let pages=0,links=0;
const documentedFiles=[...visit(path.join(publicRoot,'projects')),...(fs.existsSync(path.join(publicRoot,'notes'))?visit(path.join(publicRoot,'notes')):[])];
for(const file of documentedFiles.filter(f=>f.endsWith('.html'))){
 pages++;
 const s=fs.readFileSync(file,'utf8');
 const ids=[...s.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
 unique(ids,path.relative(root,file)+' HTML ids');
 if(!/<html[^>]*lang=/.test(s))errors.push(`${file}: no language`);
 for(const m of s.matchAll(/\b(href|src)="([^"]+)"/g)){
  const href=decode(m[2]);
  if(/^(https?:|mailto:|data:)/.test(href)||href==='/')continue;
  links++;
  if(href.startsWith('#')){if(!ids.includes(href.slice(1)))errors.push(`${file}: missing anchor ${href}`);continue;}
  const [url]=href.split(/[?#]/);
  let target=url.startsWith('/')?path.join(publicRoot,url):path.resolve(path.dirname(file),url);
  if(fs.existsSync(target)&&fs.statSync(target).isDirectory())target=path.join(target,'index.html');
  if(!fs.existsSync(target))errors.push(`${path.relative(root,file)}: missing ${href}`);
 }
 for(const img of s.matchAll(/<img\b[^>]*>/g))if(!/\balt="[^"]+"/.test(img[0]))errors.push(`${file}: image without descriptive alt`);
}
for(const p of content.projects){
 const f=path.join(publicRoot,'projects',p.id,'index.html');
 if(!fs.existsSync(f)){errors.push(`No page for ${p.id}`);continue;}
 const s=fs.readFileSync(f,'utf8');
 const title=decode(s.match(/<h1>([\s\S]*?)<\/h1>/)?.[1]??'');
 if(title!==p.title)errors.push(`${p.id}: title differs from canonical content`);
 if(!p.imageCaption)errors.push(`${p.id}: media provenance label missing`);
 if(!p.coverImage || !p.coverAlt || p.coverCaption!=='AI-generated project cover illustration')errors.push(`${p.id}: generated cover metadata missing`);
 if(p.coverImage && !fs.existsSync(path.join(publicRoot,p.coverImage)))errors.push(`${p.id}: generated cover file missing`);
 if(p.links.some(l=>l.href.includes('VTID2-Efficient-Vehicle-Type-Classification')))errors.push(`${p.id}: private assessment repository exposed`);
 if(!fs.existsSync(path.join(publicRoot,p.image)))errors.push(`${p.id}: preview image missing`);
}
if(errors.length){console.error(errors.join('\n'));process.exitCode=1;}else console.log(`Verified ${content.projects.length} canonical projects, ${pages} pages and ${links} local resources/anchors.`);
