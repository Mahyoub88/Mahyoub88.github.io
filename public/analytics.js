/*
 * First-party visitor analytics for mahyoub88.github.io.
 *
 * Sends page views, active time and a few link clicks to the Worker in /analytics.
 * No cookies and no fingerprinting: a random id lives in the visitor's own localStorage
 * (returning-visitor detection) and another in sessionStorage (one tab session).
 * It stays silent when ENDPOINT is empty, on localhost, when the browser sends Do Not Track /
 * Global Privacy Control, and in browsers where the owner opened any page with ?notrack=1.
 * Open ?notrack=0 to switch tracking back on in that browser.
 */
;(function () {
  'use strict'

  // Set to the deployed Worker, e.g. 'https://visitor-analytics.<account>.workers.dev/collect'
  var ENDPOINT = 'https://visitor-analytics.almlike5.workers.dev/collect'

  if (!ENDPOINT) return
  var loc = window.location
  var nav = window.navigator
  if (/^(localhost|127\.0\.0\.1|\[::1\])$/.test(loc.hostname)) return
  if (nav.doNotTrack === '1' || window.doNotTrack === '1' || nav.globalPrivacyControl) return

  function store(kind, key, value) {
    try {
      var s = window[kind]
      if (value === undefined) return s.getItem(key)
      if (value === null) s.removeItem(key)
      else s.setItem(key, value)
    } catch {
      return null
    }
    return null
  }

  var flag = /[?&]notrack=([01])/.exec(loc.search)
  if (flag) store('localStorage', 'va-ignore', flag[1] === '1' ? '1' : null)
  if (store('localStorage', 'va-ignore') === '1') return

  function randomId() {
    var c = window.crypto
    if (c && c.randomUUID) return c.randomUUID()
    var bytes = new Uint8Array(16)
    if (c && c.getRandomValues) c.getRandomValues(bytes)
    else for (var i = 0; i < 16; i++) bytes[i] = Math.floor(Math.random() * 256)
    return Array.prototype.map.call(bytes, function (b) { return ('0' + b.toString(16)).slice(-2) }).join('')
  }

  var visitor = store('localStorage', 'va-vid')
  var hadVisitor = !!visitor
  if (!visitor) {
    visitor = randomId()
    store('localStorage', 'va-vid', visitor)
  }
  var session = store('sessionStorage', 'va-sid')
  var firstOfSession = !session
  if (firstOfSession) {
    session = randomId()
    store('sessionStorage', 'va-sid', session)
    store('sessionStorage', 'va-rv', hadVisitor ? '1' : '0')
  }
  var returning = store('sessionStorage', 'va-rv') === '1'

  function send(event) {
    event.v = visitor
    event.s = session
    event.rv = returning ? 1 : 0
    event.l = (nav.language || '').slice(0, 20)
    var body = JSON.stringify(event)
    try {
      if (nav.sendBeacon && nav.sendBeacon(ENDPOINT, new Blob([body], { type: 'text/plain' }))) return
    } catch {}
    try {
      fetch(ENDPOINT, { method: 'POST', body: body, headers: { 'Content-Type': 'text/plain' }, keepalive: true }).catch(function () {})
    } catch {}
  }

  var currentPath = null
  var activeSince = document.visibilityState === 'hidden' ? null : Date.now()
  var activeMs = 0

  function flushEngaged() {
    if (activeSince) {
      activeMs += Date.now() - activeSince
      activeSince = document.visibilityState === 'hidden' ? null : Date.now()
    }
    if (currentPath && activeMs >= 1000) send({ t: 'engaged', p: currentPath, ms: activeMs })
    activeMs = 0
  }

  function pageview() {
    var path = loc.pathname
    if (path === currentPath || path.indexOf('/admin') === 0) return
    flushEngaged()
    currentPath = path
    var params = new URLSearchParams(loc.search)
    send({
      t: 'pageview',
      p: path,
      ti: document.title,
      // Later pages in a session report the site itself, so only the landing page carries a source.
      r: firstOfSession ? document.referrer : loc.origin + '/',
      u: firstOfSession ? params.get('utm_source') || params.get('ref') || params.get('source') || '' : '',
    })
    firstOfSession = false
  }

  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'hidden') {
      flushEngaged()
      activeSince = null
    } else if (!activeSince) {
      activeSince = Date.now()
    }
  })
  window.addEventListener('pagehide', flushEngaged)

  // Single-page navigation (React Router uses pushState/replaceState).
  ;['pushState', 'replaceState'].forEach(function (method) {
    var original = window.history[method]
    window.history[method] = function () {
      var result = original.apply(this, arguments)
      pageview()
      return result
    }
  })
  window.addEventListener('popstate', pageview)

  function track(name) {
    if (currentPath && /^[a-z0-9_]{1,40}$/.test(name)) send({ t: 'click', p: currentPath, n: name })
  }
  window.vaTrack = track

  function nameFor(anchor) {
    var href = anchor.getAttribute('href') || ''
    if (/^mailto:/i.test(href)) return 'email'
    var url
    try { url = new URL(anchor.href, loc.href) } catch { return null }
    var host = url.hostname.toLowerCase()
    if (url.origin === loc.origin) {
      if (!/\.pdf$/i.test(url.pathname)) return null
      return /cv|resume/i.test(url.pathname) ? 'cv_download' : 'file_download'
    }
    if (/(^|\.)linkedin\.com$/.test(host)) return 'linkedin'
    if (/(^|\.)github\.com$/.test(host)) return 'github'
    if (host === 'orcid.org') return 'orcid'
    if (host === 'wa.me' || /(^|\.)whatsapp\.com$/.test(host)) return 'whatsapp'
    return null
  }

  function onClick(event) {
    var target = event.target
    var anchor = target && target.closest ? target.closest('a[href]') : null
    if (!anchor) return
    var name = nameFor(anchor)
    if (name) track(name)
  }
  document.addEventListener('click', onClick, true)
  document.addEventListener('auxclick', onClick, true)

  pageview()
})()
