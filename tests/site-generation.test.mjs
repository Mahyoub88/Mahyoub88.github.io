import { test } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { spawnSync } from 'node:child_process'

test('new projects generate pages; custom detail survives; SEO and theme updates are repeatable', () => {
  const parent = path.resolve('..')
  const root = fs.mkdtempSync(path.join(parent, 'admin-generation-test-'))
  assert.equal(path.dirname(root), parent)
  assert.ok(path.basename(root).startsWith('admin-generation-test-'))
  try {
    fs.mkdirSync(path.join(root, 'scripts'), { recursive: true })
    fs.mkdirSync(path.join(root, 'src/data'), { recursive: true })
    fs.mkdirSync(path.join(root, 'public/uploads'), { recursive: true })
    fs.mkdirSync(path.join(root, 'public/projects'), { recursive: true })
    for (const script of ['sync-site.mjs', 'sync-projects.mjs', 'check-projects.mjs']) fs.copyFileSync(`scripts/${script}`, path.join(root, 'scripts', script))
    fs.copyFileSync('index.html', path.join(root, 'index.html'))
    fs.copyFileSync('public/projects/case-study.css', path.join(root, 'public/projects/case-study.css'))
    fs.writeFileSync(path.join(root, 'public/uploads/example.webp'), 'fixture-image')
    fs.writeFileSync(path.join(root, 'public/favicon.svg'), '<svg></svg>')
    fs.copyFileSync('public/analytics.js', path.join(root, 'public/analytics.js'))
    const content = JSON.parse(fs.readFileSync('src/data/defaultContent.json', 'utf8'))
    content.projects = [{ ...content.projects[0], id: 'proj-new-qa', title: 'A new project', image: '/uploads/example.webp', coverImage: '/uploads/example.webp', coverLightImage: '/uploads/example.webp', coverCaption: 'Original implementation photograph', links: [] }]
    content.siteSettings.seo.title = 'QA title & metadata'
    content.siteSettings.seo.description = 'QA description <escaped>'
    content.siteSettings.seo.canonicalUrl = 'https://portfolio.example/'
    content.siteSettings.seo.indexing = false
    content.siteSettings.appearance.defaultTheme = 'light'
    const saveContent = () => fs.writeFileSync(path.join(root, 'src/data/defaultContent.json'), JSON.stringify(content))
    const run = script => {
      const result = spawnSync(process.execPath, [`scripts/${script}`], { cwd: root, encoding: 'utf8' })
      assert.equal(result.status, 0, result.stderr + result.stdout)
    }
    saveContent(); run('sync-site.mjs'); run('sync-projects.mjs'); run('check-projects.mjs')
    const page = path.join(root, 'public/projects/proj-new-qa/index.html')
    assert.match(fs.readFileSync(page, 'utf8'), /<h1>A new project<\/h1>/)
    assert.match(fs.readFileSync(path.join(root, 'public/sitemap.xml'), 'utf8'), /https:\/\/portfolio.example\/projects\/proj-new-qa\//)
    let index = fs.readFileSync(path.join(root, 'index.html'), 'utf8')
    assert.match(index, /data-default-theme="light"/)
    assert.match(index, /<title>QA title &amp; metadata<\/title>/)
    assert.match(index, /content="QA description &lt;escaped&gt;"/)
    assert.match(fs.readFileSync(path.join(root, 'public/robots.txt'), 'utf8'), /Disallow: \//)
    fs.writeFileSync(page, fs.readFileSync(page, 'utf8').replace('</main>', '<section><h2>Custom detail</h2><p>Retained technical notes.</p></section></main>'))
    content.projects[0].title = 'Updated title'; content.siteSettings.appearance.defaultTheme = 'system'
    saveContent(); run('sync-site.mjs'); run('sync-projects.mjs'); run('check-projects.mjs')
    assert.match(fs.readFileSync(page, 'utf8'), /Retained technical notes/)
    assert.match(fs.readFileSync(page, 'utf8'), /<h1>Updated title<\/h1>/)
    index = fs.readFileSync(path.join(root, 'index.html'), 'utf8')
    assert.match(index, /data-default-theme="system"/)
    run('sync-site.mjs'); assert.equal(fs.readFileSync(path.join(root, 'index.html'), 'utf8'), index)
  } finally {
    fs.rmSync(root, { recursive: true, force: true })
  }
})
