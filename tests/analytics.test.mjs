import { test } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import vm from 'node:vm'
import worker from '../analytics/src/worker.js'
import { classifyReferrer, isBot, normalizePayload, parseUA, tokenMatches } from '../analytics/src/lib.js'

const ORIGIN = 'https://mahyoub88.github.io'
const CHROME_WIN = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36'
const SAFARI_IOS = 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1'

test('user agents are reduced to device, OS and browser; crawlers are rejected', () => {
  assert.deepEqual(parseUA(CHROME_WIN), { device: 'desktop', os: 'Windows', browser: 'Chrome' })
  assert.deepEqual(parseUA(SAFARI_IOS), { device: 'mobile', os: 'iOS', browser: 'Safari' })
  assert.equal(isBot('Googlebot/2.1 (+http://www.google.com/bot.html)'), true)
  assert.equal(isBot(''), true)
  assert.equal(isBot(CHROME_WIN), false)
})

test('referrers are grouped into coarse sources and internal navigation is recognised', () => {
  const own = 'mahyoub88.github.io'
  assert.equal(classifyReferrer('https://www.linkedin.com/feed/', '', own).kind, 'linkedin')
  assert.equal(classifyReferrer('https://lnkd.in/abc', '', own).kind, 'linkedin')
  assert.equal(classifyReferrer('https://www.google.com/', '', own).kind, 'google')
  assert.equal(classifyReferrer('https://example.org/x', '', own).kind, 'other')
  assert.equal(classifyReferrer('', '', own).kind, 'direct')
  assert.equal(classifyReferrer(ORIGIN + '/', '', own).kind, 'internal')
  // LinkedIn's app often strips the referrer, so a ?utm_source=linkedin hint still counts.
  assert.equal(classifyReferrer('', 'LinkedIn', own).kind, 'linkedin')
})

test('beacon payloads are validated and bounded', () => {
  const base = { t: 'pageview', p: '/projects/proj-sdn/', v: 'abcdefgh-1234', s: 'sess-12345678' }
  assert.equal(normalizePayload(base)?.path, '/projects/proj-sdn/')
  assert.equal(normalizePayload({ ...base, p: 'no-slash' }), null)
  assert.equal(normalizePayload({ ...base, v: 'short' }), null)
  assert.equal(normalizePayload({ ...base, t: 'drop table' }), null)
  assert.equal(normalizePayload({ ...base, t: 'click', n: "x'; --" }), null)
  assert.equal(normalizePayload({ ...base, t: 'click', n: 'cv_download' })?.name, 'cv_download')
  assert.equal(normalizePayload({ ...base, t: 'engaged', ms: 9e9 })?.value, 30 * 60 * 1000)
  assert.equal(normalizePayload({ ...base, t: 'engaged', ms: -5 }), null)
})

test('the dashboard token check accepts only the exact bearer token', async () => {
  assert.equal(await tokenMatches('Bearer s3cret', 's3cret'), true)
  assert.equal(await tokenMatches('Bearer s3cre', 's3cret'), false)
  assert.equal(await tokenMatches('s3cret', 's3cret'), false)
  assert.equal(await tokenMatches('Bearer ', ''), false)
  assert.equal(await tokenMatches(null, 's3cret'), false)
})

// A D1-shaped adapter over node:sqlite lets the real schema and the real queries run in the test.
let DatabaseSync = null
try {
  ;({ DatabaseSync } = await import('node:sqlite'))
} catch {
  DatabaseSync = null
}

function d1(db) {
  return {
    prepare(sql) {
      const statement = db.prepare(sql)
      const bound = (args) => ({
        run: async () => { statement.run(...args); return { success: true } },
        all: async () => ({ results: statement.all(...args).map((row) => ({ ...row })) }),
        first: async () => { const row = statement.get(...args); return row ? { ...row } : null },
      })
      return { bind: (...args) => bound(args), ...bound([]) }
    },
  }
}

test('collect and stats work end to end against the real schema', { skip: !DatabaseSync }, async () => {
  const sqlite = new DatabaseSync(':memory:')
  sqlite.exec(fs.readFileSync('analytics/schema.sql', 'utf8'))
  const alerts = []
  const originalFetch = globalThis.fetch
  globalThis.fetch = async (url, init) => { alerts.push({ url, body: init.body }); return new Response('ok') }
  const env = { DB: d1(sqlite), ALLOWED_ORIGIN: ORIGIN, DASHBOARD_TOKEN: 'test-token', ALERT_WEBHOOK_URL: 'https://ntfy.example/topic' }
  const pending = []
  const ctx = { waitUntil: (promise) => pending.push(promise) }

  const send = (payload, { ua = CHROME_WIN, origin = ORIGIN, cf } = {}) => {
    const request = new Request('https://analytics.example/collect', {
      method: 'POST',
      headers: { 'User-Agent': ua, Origin: origin, 'Content-Type': 'text/plain' },
      body: typeof payload === 'string' ? payload : JSON.stringify(payload),
    })
    if (cf) Object.defineProperty(request, 'cf', { value: cf })
    return worker.fetch(request, env, ctx)
  }
  const ids = { v: 'visitor-0001', s: 'session-0001' }
  try {
    const cf = { country: 'DE', city: 'Karlsruhe', region: 'BW' }
    assert.equal((await send({ ...ids, t: 'pageview', p: '/', ti: 'Home', r: 'https://www.linkedin.com/', rv: 0 }, { cf })).status, 204)
    assert.equal((await send({ ...ids, t: 'pageview', p: '/projects/proj-sdn/', r: ORIGIN + '/', rv: 0 }, { cf })).status, 204)
    assert.equal((await send({ ...ids, t: 'engaged', p: '/', ms: 12000 }, { cf })).status, 204)
    assert.equal((await send({ ...ids, t: 'click', p: '/', n: 'cv_download' }, { cf })).status, 204)
    assert.equal((await send({ v: 'visitor-0002', s: 'session-0002', t: 'pageview', p: '/', r: '', rv: 1 }, { ua: SAFARI_IOS })).status, 204)

    // Rejected input: foreign origin, crawler, malformed body.
    assert.equal((await send({ ...ids, t: 'pageview', p: '/' }, { origin: 'https://evil.example' })).status, 403)
    assert.equal((await send({ ...ids, t: 'pageview', p: '/' }, { ua: 'Googlebot/2.1' })).status, 204)
    assert.equal((await send('{not json')).status, 400)
    await Promise.all(pending)

    assert.equal(sqlite.prepare('SELECT COUNT(*) AS n FROM events').get().n, 5)
    assert.deepEqual(alerts.map((a) => a.body), ['CV downloaded from Karlsruhe, DE (desktop, Chrome)'])
    const columns = sqlite.prepare('PRAGMA table_info(events)').all().map((c) => c.name).join(' ')
    assert.doesNotMatch(columns, /\bip\b|user_agent/)

    const call = (token) => worker.fetch(new Request('https://analytics.example/api/stats?days=7', token ? { headers: { Authorization: 'Bearer ' + token } } : {}), env, ctx)
    assert.equal((await call()).status, 401)
    assert.equal((await call('wrong')).status, 401)
    const response = await call('test-token')
    assert.equal(response.status, 200)
    const data = await response.json()
    assert.deepEqual(data.totals, { views: 3, visitors: 2, sessions: 2, returningVisitors: 1, avgEngagedSeconds: 6 })
    assert.deepEqual(data.clicks.map((c) => [c.name, c.clicks]), [['cv_download', 1]])
    assert.deepEqual(data.sources.map((s) => [s.label, s.sessions]), [['direct', 1], ['linkedin', 1]])
    assert.equal(data.countries[0].label, 'DE')
    assert.equal(data.recent.length, 4)

    const dashboard = await worker.fetch(new Request('https://analytics.example/'), env, ctx)
    assert.match(await dashboard.text(), /Visitor Analytics/)
    assert.match(dashboard.headers.get('Content-Security-Policy'), /default-src 'none'/)
    assert.equal((await worker.fetch(new Request('https://analytics.example/api/stats'), { ...env, DASHBOARD_TOKEN: '' }, ctx)).status, 503)

    sqlite.prepare('UPDATE events SET ts = ? WHERE id = 1').run(Date.now() - 400 * 86_400_000)
    await worker.scheduled({}, { ...env, RETENTION_DAYS: '395' })
    assert.equal(sqlite.prepare('SELECT COUNT(*) AS n FROM events').get().n, 4)
  } finally {
    globalThis.fetch = originalFetch
  }
})

// Runs public/analytics.js against stubbed browser globals.
function runTracker({ endpoint = 'https://analytics.example/collect', hostname = 'mahyoub88.github.io', dnt = null, ignore = false } = {}) {
  const sent = []
  const listeners = {}
  const storage = () => {
    const data = new Map()
    return { getItem: (k) => data.get(k) ?? null, setItem: (k, v) => data.set(k, String(v)), removeItem: (k) => data.delete(k) }
  }
  const localStorage = storage()
  if (ignore) localStorage.setItem('va-ignore', '1')
  const location = { hostname, pathname: '/projects/proj-sdn/', search: '?utm_source=linkedin', origin: 'https://' + hostname, href: 'https://' + hostname + '/projects/proj-sdn/' }
  const window = {
    location, localStorage, sessionStorage: storage(), crypto: globalThis.crypto, doNotTrack: dnt, history: { pushState() {}, replaceState() {} },
    navigator: { language: 'en-US', sendBeacon: (url, blob) => { sent.push({ url, blob }); return true } },
    addEventListener: (type, fn) => { listeners['window:' + type] = fn },
  }
  window.navigator.doNotTrack = dnt
  const document = {
    title: 'SDN', referrer: '', visibilityState: 'visible',
    addEventListener: (type, fn) => { listeners[type] = fn },
  }
  const source = fs.readFileSync('public/analytics.js', 'utf8').replace("var ENDPOINT = ''", `var ENDPOINT = '${endpoint}'`)
  vm.runInNewContext(source, { window, document, navigator: window.navigator, URLSearchParams, URL, Blob, Uint8Array, Date, Math, fetch: () => Promise.resolve() })
  return { sent, listeners, window, localStorage }
}

const bodies = async (sent) => Promise.all(sent.map(async (s) => JSON.parse(await s.blob.text())))

test('the tracker is inert without an endpoint, on localhost, with Do Not Track, or when opted out', () => {
  assert.equal(runTracker({ endpoint: '' }).sent.length, 0)
  assert.equal(runTracker({ hostname: 'localhost' }).sent.length, 0)
  assert.equal(runTracker({ dnt: '1' }).sent.length, 0)
  assert.equal(runTracker({ ignore: true }).sent.length, 0)
})

test('the tracker reports a page view, its source hint, and CV / contact clicks', async () => {
  const { sent, listeners, window } = runTracker()
  const [view] = await bodies(sent)
  assert.equal(view.t, 'pageview')
  assert.equal(view.p, '/projects/proj-sdn/')
  assert.equal(view.u, 'linkedin')
  assert.equal(view.rv, 0)
  assert.match(view.v, /^[A-Za-z0-9-]{8,64}$/)

  const anchor = (href) => ({ closest: () => ({ getAttribute: () => href, href }) })
  listeners.click({ target: anchor('https://mahyoub88.github.io/Mohammed_Mahyoub_CV_1.pdf') })
  listeners.click({ target: anchor('https://www.linkedin.com/in/mohammed-mahyoub/') })
  listeners.click({ target: anchor('https://example.org/') })
  window.vaTrack('email')
  const clicks = (await bodies(sent)).filter((b) => b.t === 'click').map((b) => b.n)
  assert.deepEqual(clicks, ['cv_download', 'linkedin', 'email'])
})
