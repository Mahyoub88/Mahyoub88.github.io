import { MAX_BODY, classifyReferrer, isBot, normalizePayload, parseUA, tokenMatches } from './lib.js'
import { DASHBOARD_HTML } from './dashboard.js'

const DAY = 86_400_000

const securityHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'no-referrer',
  'X-Robots-Tag': 'noindex, nofollow',
  'Cache-Control': 'no-store',
}

function corsHeaders(env) {
  return {
    'Access-Control-Allow-Origin': env.ALLOWED_ORIGIN,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    Vary: 'Origin',
  }
}

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...securityHeaders, 'Content-Type': 'application/json; charset=utf-8' },
  })

async function collect(request, env, ctx) {
  const cors = corsHeaders(env)
  const origin = request.headers.get('Origin')
  if (origin && origin !== env.ALLOWED_ORIGIN) return new Response(null, { status: 403, headers: cors })

  const ua = request.headers.get('User-Agent') || ''
  if (isBot(ua)) return new Response(null, { status: 204, headers: cors })

  let event = null
  try {
    const text = await request.text()
    if (text.length <= MAX_BODY) event = normalizePayload(JSON.parse(text))
  } catch {
    event = null
  }
  if (!event) return new Response(null, { status: 400, headers: cors })

  const ownHost = new URL(env.ALLOWED_ORIGIN).hostname
  const ref = event.type === 'pageview'
    ? classifyReferrer(event.referrer, event.hint, ownHost)
    : { host: '', kind: 'internal' }
  const cf = request.cf || {}
  const { device, os, browser } = parseUA(ua)
  const country = typeof cf.country === 'string' ? cf.country.slice(0, 2) : null
  const region = typeof cf.region === 'string' ? cf.region.slice(0, 60) : null
  const city = typeof cf.city === 'string' ? cf.city.slice(0, 60) : null

  await env.DB.prepare(
    `INSERT INTO events (ts, type, path, title, ref_host, ref_kind, country, region, city, device, os, browser, lang, visitor, session, is_returning, name, value)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  )
    .bind(
      Date.now(), event.type, event.path, event.title, ref.host, ref.kind,
      country, region, city, device, os, browser, event.lang,
      event.visitor, event.session, event.returning, event.name, event.value,
    )
    .run()

  if (event.type === 'click' && event.name === 'cv_download' && env.ALERT_WEBHOOK_URL) {
    const where = [city, country].filter(Boolean).join(', ') || 'unknown location'
    ctx.waitUntil(
      fetch(env.ALERT_WEBHOOK_URL, {
        method: 'POST',
        body: 'CV downloaded from ' + where + ' (' + device + ', ' + browser + ')',
      }).catch(() => {}),
    )
  }
  return new Response(null, { status: 204, headers: cors })
}

// `column` is always a literal from this file, never user input.
const groupBy = (db, column, since, limit = 10) =>
  db
    .prepare(
      `SELECT COALESCE(${column}, 'Unknown') AS label, COUNT(DISTINCT visitor) AS visitors, COUNT(*) AS views
       FROM events WHERE type = 'pageview' AND ts >= ? GROUP BY label ORDER BY visitors DESC, views DESC LIMIT ${limit}`,
    )
    .bind(since)
    .all()

export async function stats(db, days, now = Date.now()) {
  const since = now - days * DAY
  const query = (sql) => db.prepare(sql).bind(since)
  const [totals, engaged, clicks, daily, pages, sources, countries, cities, browsers, systems, devices, recent] = await Promise.all([
    query(`SELECT COUNT(*) AS views, COUNT(DISTINCT visitor) AS visitors, COUNT(DISTINCT session) AS sessions,
                  COUNT(DISTINCT CASE WHEN is_returning = 1 THEN visitor END) AS returning_visitors
           FROM events WHERE type = 'pageview' AND ts >= ?`).first(),
    query(`SELECT COALESCE(SUM(value), 0) AS total FROM events WHERE type = 'engaged' AND ts >= ?`).first(),
    query(`SELECT name, COUNT(*) AS clicks, COUNT(DISTINCT visitor) AS visitors FROM events
           WHERE type = 'click' AND ts >= ? GROUP BY name ORDER BY clicks DESC`).all(),
    query(`SELECT date(ts / 1000, 'unixepoch') AS day, COUNT(*) AS views, COUNT(DISTINCT visitor) AS visitors
           FROM events WHERE type = 'pageview' AND ts >= ? GROUP BY day ORDER BY day`).all(),
    query(`SELECT path, COUNT(*) AS views, COUNT(DISTINCT visitor) AS visitors FROM events
           WHERE type = 'pageview' AND ts >= ? GROUP BY path ORDER BY views DESC LIMIT 15`).all(),
    query(`SELECT ref_kind AS label, COUNT(DISTINCT session) AS sessions FROM events
           WHERE type = 'pageview' AND ts >= ? AND ref_kind != 'internal' GROUP BY ref_kind ORDER BY sessions DESC, label`).all(),
    groupBy(db, 'country', since),
    groupBy(db, 'city', since),
    groupBy(db, 'browser', since),
    groupBy(db, 'os', since),
    groupBy(db, 'device', since),
    query(`SELECT ts, type, path, name, ref_kind, country, city, device, os, browser, is_returning FROM events
           WHERE type != 'engaged' AND ts >= ? ORDER BY ts DESC LIMIT 100`).all(),
  ])
  const sessions = totals?.sessions || 0
  return {
    days,
    generated: now,
    totals: {
      views: totals?.views || 0,
      visitors: totals?.visitors || 0,
      sessions,
      returningVisitors: totals?.returning_visitors || 0,
      avgEngagedSeconds: sessions ? Math.round((engaged?.total || 0) / sessions / 1000) : 0,
    },
    clicks: clicks.results,
    daily: daily.results,
    pages: pages.results,
    sources: sources.results,
    countries: countries.results,
    cities: cities.results,
    browsers: browsers.results,
    systems: systems.results,
    devices: devices.results,
    recent: recent.results,
  }
}

export default {
  async fetch(request, env, ctx) {
    const { pathname, searchParams } = new URL(request.url)

    if (pathname === '/collect') {
      if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: corsHeaders(env) })
      if (request.method === 'POST') return collect(request, env, ctx)
      return new Response(null, { status: 405 })
    }

    if (request.method !== 'GET') return new Response(null, { status: 405 })

    if (pathname === '/' || pathname === '/dashboard') {
      return new Response(DASHBOARD_HTML, {
        headers: {
          ...securityHeaders,
          'Content-Type': 'text/html; charset=utf-8',
          'Content-Security-Policy':
            "default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; connect-src 'self'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'",
        },
      })
    }

    if (pathname === '/api/stats') {
      if (!env.DASHBOARD_TOKEN) return json({ error: 'DASHBOARD_TOKEN is not configured' }, 503)
      if (!(await tokenMatches(request.headers.get('Authorization'), env.DASHBOARD_TOKEN))) {
        return json({ error: 'Unauthorized' }, 401)
      }
      const days = Math.min(365, Math.max(1, parseInt(searchParams.get('days') || '30', 10) || 30))
      return json(await stats(env.DB, days))
    }

    return new Response('Not found', { status: 404, headers: securityHeaders })
  },

  async scheduled(_event, env) {
    const days = parseInt(env.RETENTION_DAYS || '395', 10) || 395
    await env.DB.prepare('DELETE FROM events WHERE ts < ?').bind(Date.now() - days * DAY).run()
  },
}
