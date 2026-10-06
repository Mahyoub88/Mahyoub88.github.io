import fs from 'node:fs';
import path from 'node:path';
const publicDir=path.resolve('public');
const content=JSON.parse(fs.readFileSync('src/data/defaultContent.json','utf8'));
const failures=[]; const external=new Set(); let refs=0; let figures=0;
function target(from,url){if(/^(https?:)?\/\//.test(url)){external.add(url);return;}if(/^(mailto:|tel:|data:)/.test(url))return;const [pathname,fragment]=url.split('#');let absolute=pathname.startsWith('/')?path.join(publicDir,pathname):path.resolve(path.dirname(from),pathname||path.basename(from));if(fs.existsSync(absolute)&&fs.statSync(absolute).isDirectory())absolute=path.join(absolute,'index.html');if(pathname==='/'||absolute===path.join(publicDir,'index.html'))return;refs++;if(!fs.existsSync(absolute)){failures.push(`${path.relative(publicDir,from)} → ${url}`);return;}if(fragment&&absolute.endsWith('.html')){const html=fs.readFileSync(absolute,'utf8');if(!html.includes(`id="${fragment}"`))failures.push(`Missing anchor: ${url}`);}}
function walk(dir){for(const entry of fs.readdirSync(dir,{withFileTypes:true})){const full=path.join(dir,entry.name);if(entry.isDirectory())walk(full);else if(entry.name.endsWith('.html')){const html=fs.readFileSync(full,'utf8');for(const m of html.matchAll(/(?:href|src)="([^"]+)"/g))target(full,m[1].replaceAll('&amp;','&'));figures+=(html.match(/<figure\b/g)||[]).length;}}}
walk(path.join(publicDir,'projects'));
const ids=new Set();for(const p of content.projects){if(ids.has(p.id))failures.push(`Duplicate project ${p.id}`);ids.add(p.id);for(const l of p.links||[])target(path.join(publicDir,'index.html'),l.href);if(p.image)target(path.join(publicDir,'index.html'),p.image);}
fs.mkdirSync('../audit',{recursive:true});fs.writeFileSync('../audit/external-links.json',JSON.stringify([...external].sort(),null,2));
console.log(JSON.stringify({projects:ids.size,localReferences:refs,figures,externalLinks:external.size,failures},null,2));if(failures.length)process.exitCode=1;
