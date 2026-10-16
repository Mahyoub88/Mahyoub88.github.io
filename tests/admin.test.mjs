import { test, afterEach } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import ts from 'typescript'
const modules = new Map()
async function load(file) {
  file = path.resolve(file)
  if (modules.has(file)) return modules.get(file)
  let source = ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext } }).outputText
  for (const match of source.matchAll(/from '(\.\/[^']+)'/g)) {
    const dependency = await load(path.resolve(path.dirname(file), match[1] + '.ts'))
    source = source.replace(match[0], `from '${dependency.url}'`)
  }
  const url = 'data:text/javascript;base64,' + Buffer.from(source).toString('base64')
  const result = { url, exports: await import(url) }; modules.set(file, result); return result
}
const repository = (await load('src/admin/repository.ts')).exports
const { validateContent } = (await load('src/admin/validateContent.ts')).exports
const { publishContentToGitHub } = (await load('src/admin/github.ts')).exports
const content = JSON.parse(fs.readFileSync('src/data/defaultContent.json', 'utf8'))
const target = { owner: 'test', repo: 'portfolio', branch: 'feature/test', path: 'src/data/defaultContent.json' }
const originalFetch = globalThis.fetch
afterEach(() => { globalThis.fetch = originalFetch })
test('published content is valid; malformed imports and duplicate IDs are rejected', () => {
  assert.deepEqual(validateContent(content), [])
  assert.ok(validateContent({}).length)
  const copy = structuredClone(content); copy.stats.push(copy.stats[0])
  assert.ok(validateContent(copy).some(message => message.includes('duplicate ID')))
  copy.hero.primaryCta.href = 'javascript:alert(1)'
  assert.ok(validateContent(copy).some(message => message.includes('http(s) URL')))
  copy.siteSettings.sections[1].id = 'hero'
  assert.ok(validateContent(copy).some(message => message.includes('duplicate homepage')))
})
test('unsafe repository paths are rejected and Unicode contents round-trip', () => {
  for (const value of ['', '../file', '/file', 'public/../file', 'public//file', 'public\\file']) assert.throws(() => repository.repositoryPath(value))
  assert.equal(repository.repositoryPath('public/hello world.html'), 'public/hello%20world.html')
  const unicode = 'العربية — 6 Countries 🌍'
  assert.equal(repository.decodeText(repository.encodeText(unicode)), unicode)
})
test('file writes carry loaded SHA and configured branch; conflicts remain errors', async () => {
  globalThis.fetch = async (url, options) => {
    const body = JSON.parse(options.body)
    assert.equal(body.sha, 'loaded-sha'); assert.equal(body.branch, target.branch)
    assert.match(url, /contents\/public\/page.html$/)
    return new Response(JSON.stringify({ message: 'Conflict' }), { status: 409 })
  }
  await assert.rejects(repository.writeRepositoryFile(target, 'test-token', 'public/page.html', 'aGVsbG8=', 'loaded-sha'), /repository changed/)
})
test('oversized uploads fail before any network request', async () => {
  globalThis.fetch = async () => { throw new Error('network must not be used') }
  await assert.rejects(repository.uploadRepositoryFile(target, 'test-token', 'public/file.pdf', { size: 21 * 1024 * 1024 }), /20 MB/)
})
test('content publishing refuses a stale baseline without a write', async () => {
  const changed = structuredClone(content); changed.brand.title = 'Edited elsewhere'
  globalThis.fetch = async (_url, options) => {
    assert.notEqual(options?.method, 'PUT')
    return new Response(JSON.stringify({ sha: 'remote-sha', content: repository.encodeText(JSON.stringify(changed)) }))
  }
  await assert.rejects(publishContentToGitHub(target, 'test-token', JSON.stringify(content), JSON.stringify(content)), /changed since/)
})
test('content publish uses remote SHA and reports exact commit for deployment tracking', async () => {
  let writes = 0
  globalThis.fetch = async (_url, options) => {
    if (options?.method === 'PUT') {
      writes++; const body = JSON.parse(options.body)
      assert.equal(body.sha, 'remote-sha'); assert.equal(body.branch, target.branch)
      return new Response(JSON.stringify({ commit: { sha: 'content-commit' } }))
    }
    return new Response(JSON.stringify({ sha: 'remote-sha', content: repository.encodeText(JSON.stringify(content)) }))
  }
  const result = await publishContentToGitHub(target, 'test-token', JSON.stringify(content), JSON.stringify(content))
  assert.equal(writes, 1); assert.equal(result.commit.sha, 'content-commit')
})
test('GitHub read failures do not become blind content overwrites', async () => {
  globalThis.fetch = async (_url, options) => {
    assert.notEqual(options?.method, 'PUT')
    return new Response(JSON.stringify({ message: 'Forbidden' }), { status: 403 })
  }
  await assert.rejects(publishContentToGitHub(target, 'test-token', JSON.stringify(content)), /Forbidden/)
})
test('deployment lookup uses the configured workflow and URL-encoded branch', async () => {
  globalThis.fetch = async url => {
    assert.match(url, /actions\/workflows\/deploy.yml\/runs\?branch=feature%2Ftest/)
    return new Response(JSON.stringify({ workflow_runs: [{ head_sha: 'exact-commit', status: 'completed', conclusion: 'success' }] }))
  }
  assert.equal((await repository.getDeploymentRuns(target, 'test-token'))[0].head_sha, 'exact-commit')
})
