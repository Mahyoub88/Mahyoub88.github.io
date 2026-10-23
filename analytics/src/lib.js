// Pure helpers for the analytics Worker. No Cloudflare APIs here so they can be unit-tested in Node.

export const MAX_BODY = 2048

const BOT_RE = /bot|crawl|spider|slurp|headless|lighthouse|pagespeed|preview|facebookexternalhit|curl|wget|python|node-fetch|axios|go-http|java\/|monitor|uptime|scanner/i

export function isBot(ua) {
  return !ua || BOT_RE.test(ua)
}

export function parseUA(ua = '') {
  const device = /iPad|Tablet/i.test(ua) || (/Android/i.test(ua) && !/Mobile/i.test(ua))
    ? 'tablet'
    : /Mobi|iPhone|Android/i.test(ua) ? 'mobile' : 'desktop'
  const os = /Windows/i.test(ua) ? 'Windows'
    : /iPhone|iPad|iPod/i.test(ua) ? 'iOS'
    : /Android/i.test(ua) ? 'Android'
    : /Mac OS X|Macintosh/i.test(ua) ? 'macOS'
    : /CrOS/i.test(ua) ? 'ChromeOS'
    : /Linux/i.test(ua) ? 'Linux' : 'Other'
  const browser = /Edg\//i.test(ua) ? 'Edge'
    : /OPR\/|Opera/i.test(ua) ? 'Opera'
    : /SamsungBrowser/i.test(ua) ? 'Samsung Internet'
    : /Firefox|FxiOS/i.test(ua) ? 'Firefox'
    : /Chrome|CriOS/i.test(ua) ? 'Chrome'
    : /Safari/i.test(ua) ? 'Safari' : 'Other'
  return { device, os, browser }
}

const REFERRERS = [
  ['linkedin', /(^|\.)linkedin\.com$|^lnkd\.in$/],
  ['github', /(^|\.)github\.com$|(^|\.)github\.io$/],
  ['google', /(^|\.)google\.[a-z.]+$/],
  ['bing', /(^|\.)bing\.com$/],
  ['duckduckgo', /(^|\.)duckduckgo\.com$/],
  ['x', /^(t\.co|x\.com|twitter\.com)$/],
  ['facebook', /(^|\.)facebook\.com$|^fb\.me$/],
  ['whatsapp', /(^|\.)whatsapp\.com$|^wa\.me$/],
]

/** Maps a referrer URL (or a utm_source/ref hint) to a coarse source. */
export function classifyReferrer(referrer, hint, ownHost) {
  let host = ''
  try { host = referrer ? new URL(referrer).hostname.toLowerCase() : '' } catch { host = '' }
  if (host && host === ownHost) return { host, kind: 'internal' }
  const hinted = String(hint || '').toLowerCase().slice(0, 40)
  if (hinted) {
    const known = REFERRERS.find(([kind]) => kind === hinted || (hinted === 'twitter' && kind === 'x'))
    return { host: host || hinted, kind: known ? known[0] : 'other' }
  }
  if (!host) return { host: '', kind: 'direct' }
  const match = REFERRERS.find(([, re]) => re.test(host))
  return { host, kind: match ? match[0] : 'other' }
}

const clip = (value, max) => (typeof value === 'string' ? value.slice(0, max) : '')
const ID_RE = /^[A-Za-z0-9-]{8,64}$/
const NAME_RE = /^[a-z0-9_]{1,40}$/

/** Validates the beacon body. Returns null for anything malformed. */
export function normalizePayload(raw) {
  if (!raw || typeof raw !== 'object') return null
  if (!['pageview', 'engaged', 'click'].includes(raw.t)) return null
  if (!ID_RE.test(raw.v || '') || !ID_RE.test(raw.s || '')) return null
  const path = clip(raw.p, 300)
  if (!path.startsWith('/')) return null
  const event = {
    type: raw.t,
    path,
    title: clip(raw.ti, 200),
    referrer: clip(raw.r, 500),
    hint: clip(raw.u, 40),
    visitor: raw.v,
    session: raw.s,
    returning: raw.rv ? 1 : 0,
    lang: clip(raw.l, 20),
    name: null,
    value: null,
  }
  if (raw.t === 'click') {
    if (!NAME_RE.test(raw.n || '')) return null
    event.name = raw.n
  }
  if (raw.t === 'engaged') {
    const ms = Number(raw.ms)
    if (!Number.isFinite(ms) || ms < 0) return null
    event.value = Math.min(Math.round(ms), 30 * 60 * 1000)
  }
  return event
}

/** Constant-time bearer token check; compares fixed-length digests. */
export async function tokenMatches(header, expected) {
  if (!expected) return false
  const given = /^Bearer (.+)$/.exec(header || '')?.[1] || ''
  const enc = new TextEncoder()
  const [a, b] = await Promise.all([
    crypto.subtle.digest('SHA-256', enc.encode(given)),
    crypto.subtle.digest('SHA-256', enc.encode(expected)),
  ])
  const x = new Uint8Array(a)
  const y = new Uint8Array(b)
  let diff = 0
  for (let i = 0; i < x.length; i++) diff |= x[i] ^ y[i]
  return diff === 0
}
