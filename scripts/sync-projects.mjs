import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const content = JSON.parse(fs.readFileSync(path.join(root,'src/data/defaultContent.json'),'utf8'));
const check = process.argv.includes('--check');
const esc = value => String(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const base = 'https://mahyoub88.github.io';
const updates=[];
function save(relative, text) {
 const file=path.join(root,relative);
 const old=fs.existsSync(file)?fs.readFileSync(file,'utf8'):'';
 if(old!==text){updates.push(relative);if(!check){fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file,text);}}
}
function head(title,description,url,image='/social-preview.jpg') {
 return `<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width,initial-scale=1">\n<title>${esc(title)} | Mohammed Mahyoub</title>\n<meta name="description" content="${esc(description)}">\n<link rel="canonical" href="${base+url}">\n<meta property="og:type" content="website">\n<meta property="og:title" content="${esc(title)}">\n<meta property="og:description" content="${esc(description)}">\n<meta property="og:url" content="${base+url}">\n<meta property="og:image" content="${base+image}">\n<meta name="twitter:card" content="summary_large_image">\n<link rel="icon" href="/favicon.svg">\n<link rel="stylesheet" href="/projects/case-study.css">\n</head>`;
}
const header='<body>\n<a class="skip" href="#main">Skip to content</a>\n<header><nav aria-label="Portfolio navigation"><a href="/">← Engineering portfolio</a><a href="/projects/">All case studies</a></nav></header>\n<main id="main">';
const footer='<footer>Mohammed Mahyoub · Source media, explanatory diagrams and recorded results are identified in their captions.</footer>\n</body>\n</html>\n';
const card=p=>`<article class="card"><a href="/projects/${p.id}/"><img loading="lazy" class="project-cover" width="1280" height="720" src="${esc(p.coverImage??p.image)}" alt="${esc(p.coverAlt??p.imageAlt??p.title)}"></a><p class="media-label">${esc(p.coverCaption??p.imageCaption??'Project documentation')}</p><p class="eyebrow">${esc(p.category)}</p><h2>${esc(p.title)}</h2><p>${esc(p.description)}</p><a href="/projects/${p.id}/">Read case study →</a></article>`;
const collections=[{id:'proj-monitoring-apps',title:'Engineering Software — Independent Applications',description:'Four separate VB.NET applications: monitoring, service operations, RF calculation and wireless-path planning.',ids:['proj-monitoring-console','proj-service-operations','proj-rf-link-budget','proj-fresnel-planning']},{id:'proj-rf-network',title:'Network Engineering — Independent Implementations',description:'Three separate implementations: enterprise infrastructure, wireless coverage and MPLS backbone.',ids:['proj-enterprise-network','proj-wireless-coverage','proj-mpls-backbone']}];
save('public/projects/index.html',head('Engineering case studies','Twenty independent implementations and research projects, with source media and technical documentation.','/projects/')+'\n'+header+`\n<p class="eyebrow">Engineering portfolio · ${content.projects.length} projects</p><h1>Engineering case studies</h1><p class="lede">Explore the implementation, engineering decisions and documented results behind each project.</p><p>Source screenshots and photographs are distinguished from explanatory diagrams. Research code with assessment restrictions remains private.</p><div class="cards">${content.projects.map(card).join('\n')}</div><aside class="summary"><h2>Technical study notes</h2><p><a href="https://github.com/Mahyoub88/usv-systems-integration-notes">USV Systems Integration — Study Notes</a></p><p>A separate learning resource covering navigation, sensor fusion, communications and integration checks.</p></aside><nav aria-label="Project collections">${collections.map(x=>`<a href="/projects/${x.id}/">${esc(x.title)}</a>`).join('')}</nav>\n</main>\n`+footer);
for(const collection of collections){save(`public/projects/${collection.id}/index.html`,head(collection.title,collection.description,`/projects/${collection.id}/`)+'\n'+header+`\n<p class="eyebrow">Project collection · navigation index</p><h1>${esc(collection.title)}</h1><p class="lede">${esc(collection.description)}</p><p>This page groups the individual case studies below. It is not an additional project.</p><div class="cards">${collection.ids.map(id=>card(content.projects.find(p=>p.id===id))).join('\n')}</div>${collection.id==='proj-monitoring-apps'?'<aside class="summary"><h2>Technical analysis</h2><p><a href="/projects/engineering-applications-analysis/">Interface analysis, proposed designs and calculation review</a></p></aside>':''}\n</main>\n`+footer);}
for(const [index,p] of content.projects.entries()){
 const relative=`public/projects/${p.id}/index.html`;
 let s=fs.readFileSync(path.join(root,relative),'utf8');
 s=s.replace(/<!doctype html>[\s\S]*?<\/head>/i,head(p.title,p.description,`/projects/${p.id}/`,p.coverImage??p.image));
 s=s.replace(/<header>[\s\S]*?<\/header>/,header.match(/<header>[\s\S]*?<\/header>/)[0]);
 s=s.replace(/<h1>[\s\S]*?<\/h1>/,`<h1>${esc(p.title)}</h1>`);
 s=s.replace(/<p class="lede">[\s\S]*?<\/p>/,`<p class="lede">${esc(p.description)}</p>`);
 s=s.replace(/<span class="badge">[\s\S]*?<\/span>/,`<span class="badge">${esc(p.status.label)}</span>`);
 s=s.replace(/<figure class="hero-media[^>]*>[\s\S]*?<\/figure>/,`<figure class="hero-media"><a href="${esc(p.image)}"><img src="${esc(p.image)}" alt="${esc(p.imageAlt??p.title)}" fetchpriority="high"></a><figcaption>${esc(p.imageCaption??'Project documentation')} · Open image for full detail.</figcaption></figure>`);
 s=s.replace(/<div class="tags">[\s\S]*?<\/div>/,`<div class="tags">${p.tags.map(t=>`<span>${esc(t)}</span>`).join('')}</div>`);
 s=s.replace(/<div class="panel">[\s\S]*?(?=<\/section>)/,`<div class="panel"><dl class="project-facts">${(p.meta??[]).map(m=>`<div><dt>${esc(m.label)}</dt><dd>${esc(m.value)}</dd></div>`).join('')}</dl></div>`);
 s=s.replaceAll('View GitHub Repository','View repository').replaceAll('Read illustrated case study','Read case study').replaceAll('Explore case study','Read case study');
 // One instance of each figure per page. The full-resolution source remains linked.
 const used=new Set([p.image]);
 s=s.replace(/<figure\b[^>]*>[\s\S]*?<\/figure>/g,block=>{
  if(block.includes('hero-media'))return block;
  const src=block.match(/<img[^>]*src="([^"]+)/)?.[1];
  if(!src)return block;
  const full=src.startsWith('/')?src:`/projects/${p.id}/${src}`;
  if(used.has(full))return '';
  used.add(full);return block;
 });
 s=s.replace(/<nav class="project-pagination"[\s\S]*?<\/nav>/,'');
 s=s.replace(/<section id="gallery">([\s\S]*?)<\/section>/,(block)=>{
  if(block.includes('<img'))return block;
  return block.replace(/<h2>[\s\S]*?<\/h2>/,'<h2>Source context</h2>').replace(/<div class="grid">\s*<\/div>/g,'');
 });
 const prev=content.projects[index-1],next=content.projects[index+1];
 const nav=`<nav class="project-pagination" aria-label="More case studies">${prev?`<a href="/projects/${prev.id}/">← ${esc(prev.title)}</a>`:''}${next?`<a href="/projects/${next.id}/">${esc(next.title)} →</a>`:''}</nav>`;
 s=s.replace(/\s*<\/main>/,`\n${nav}\n</main>`);
 s=s.replace(/<footer>[\s\S]*?<\/footer>/,footer.match(/<footer>[\s\S]*?<\/footer>/)[0]);
 // Stable formatting makes this command idempotent and generated changes easy to review.
 save(relative,s.replace(/>\s*</g,'>\n<').trim()+'\n');
}
const entries=content.projects.map(p=>{
 const repo=p.links?.find(l=>l.href.startsWith('https://github.com/'))?.href;
 const role=p.meta?.find(m=>m.label==='Role'||m.label==='Scope')?.value??'';
 return {id:p.id,title:p.title,url:base+`/projects/${p.id}/`,repository:repo??null,status:p.status.label,role,image:p.image,imageCaption:p.imageCaption,coverImage:p.coverImage,coverAlt:p.coverAlt,coverCaption:p.coverCaption};
});
save('docs/PROJECT_REGISTRY.json',JSON.stringify({source:'src/data/defaultContent.json',projectCount:entries.length,projects:entries,collections:collections.map(x=>({id:x.id,projectIds:x.ids})),studyNotes:{title:'USV Systems Integration — Study Notes',url:'https://github.com/Mahyoub88/usv-systems-integration-notes'}},null,2)+'\n');
save('docs/PROJECTS.md','# Engineering Project Index\n\nGenerated from `src/data/defaultContent.json` using `npm run sync:projects`. The same titles, links, status labels and preview media drive the homepage and case-study index.\n\n'+entries.map((p,i)=>`${i+1}. [${p.title}](${p.url})${p.repository?` — [View repository](${p.repository})`:' — Public summary; code private during assessment.'}`).join('\n')+'\n\n## Collections\n\nCollections group existing projects and are not counted as additional implementations.\n\n'+collections.map(x=>`- [${x.title}](${base}/projects/${x.id}/)`).join('\n')+'\n\n## Technical study notes\n\n[USV Systems Integration — Study Notes](https://github.com/Mahyoub88/usv-systems-integration-notes) is a separate learning resource.\n\n## Updating content\n\nEdit canonical project fields in `src/data/defaultContent.json`, write project-specific technical sections in `public/projects/<id>/index.html`, then run `npm run sync:projects` and `npm run check:projects`. Build regenerates shared presentation fields, so admin-published project edits also reach standalone pages. Retain source captions and restrictions on private assessment material.\n');
if(check&&updates.length){console.error('Generated project presentation is out of date:\n'+updates.join('\n'));process.exitCode=1;}else console.log(`${check?'Checked':'Synchronized'} ${entries.length} projects; ${updates.length} generated files ${check?'out of date':'updated'}.`);
