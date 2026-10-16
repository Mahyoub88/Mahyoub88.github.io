import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const content = JSON.parse(fs.readFileSync(path.join(root, 'src/data/defaultContent.json'), 'utf8'))
const settings = content.siteSettings
if (settings) {
  const escape = value => String(value).replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
  const seo = settings.seo
  let html = fs.readFileSync(path.join(root, 'index.html'), 'utf8')
  if (seo) {
    const canonical = new URL(seo.canonicalUrl)
    if (!['http:', 'https:'].includes(canonical.protocol)) throw new Error('Canonical URL must use http(s)')
    const image = new URL(seo.socialImage, canonical).href
    html = html.replace(/<html\b[^>]*>/, `<html lang="${escape(seo.language)}" data-default-theme="${escape(settings.appearance?.defaultTheme ?? 'dark')}">`).replace(/<title>[\s\S]*?<\/title>/, `<title>${escape(seo.title)}</title>`)
    const values = { description: seo.description, 'og:title': seo.socialTitle, 'twitter:title': seo.socialTitle, 'og:description': seo.socialDescription, 'twitter:description': seo.socialDescription, 'og:image': image, 'twitter:image': image, 'og:image:alt': seo.socialTitle, 'og:url': canonical.href, 'og:locale': seo.locale }
    for (const [key, value] of Object.entries(values)) html = html.replace(new RegExp(`<meta\\s+(?:name|property)="${key}"\\s+content="[^"]*"\\s*\\/?>`), match => match.replace(/content="[^"]*"/, `content="${escape(value)}"`))
    html = html.replace(/<link rel="canonical"[^>]*>/, `<link rel="canonical" href="${escape(canonical.href)}" />`).replace(/<link rel="icon"[^>]*>/, `<link rel="icon" href="${escape(seo.favicon)}" />`)
    html = html.replace(/\s*<meta name="robots"[^>]*>/g, '').replace('</head>', `    <meta name="robots" content="${seo.indexing ? 'index, follow' : 'noindex, nofollow'}" />\n  </head>`)
    fs.writeFileSync(path.join(root, 'public/robots.txt'), `User-agent: *\n${seo.indexing ? 'Allow: /\nDisallow: /admin' : 'Disallow: /'}\nSitemap: ${new URL('/sitemap.xml', canonical).href}\n`)
  }
  fs.writeFileSync(path.join(root, 'index.html'), html)
}
console.log('Synchronized site metadata.')
