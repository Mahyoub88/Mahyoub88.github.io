import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const sourceArg=process.argv.indexOf('--repo-root');
if(sourceArg<0||!process.argv[sourceArg+1])throw new Error('Provide --repo-root <directory containing public source repository checkouts>.');
const repoRoot=path.resolve(process.argv[sourceArg+1]);
const manifest=JSON.parse(fs.readFileSync(path.join(root,'docs/SOURCE_MEDIA.json'),'utf8'));
const digest=bytes=>crypto.createHash('sha256').update(bytes).digest('hex');
const checked=[];
// Validate every source before copying any file, so a mismatch cannot leave a partial refresh.
for(const asset of manifest.assets){
 const source=path.resolve(repoRoot,asset.repository.split('/')[1],asset.source);
 const target=path.resolve(root,asset.path);
 if(!source.startsWith(repoRoot+path.sep)||!target.startsWith(path.join(root,'public')+path.sep))throw new Error('Source or target path leaves its expected directory.');
 const bytes=fs.readFileSync(source);
 if(digest(bytes)!==asset.sha256)throw new Error(`Source differs from pinned snapshot: ${asset.repository}/${asset.source}. Review the source and update its recorded commit/checksum before refreshing.`);
 checked.push({target,bytes});
}
for(const {target,bytes} of checked){fs.mkdirSync(path.dirname(target),{recursive:true});fs.writeFileSync(target,bytes);}
console.log(`Refreshed ${checked.length} checksum-verified public media snapshots.`);
