-- Visitor analytics store (Cloudflare D1). Apply with:
--   npx wrangler d1 execute visitor-analytics --remote --file=schema.sql
-- No IP address, user agent string or cookie is stored: only the derived,
-- coarse fields below plus a random per-browser id generated on the visitor's device.
CREATE TABLE IF NOT EXISTS events (
  id        INTEGER PRIMARY KEY AUTOINCREMENT,
  ts        INTEGER NOT NULL,              -- epoch milliseconds
  type      TEXT    NOT NULL,              -- pageview | engaged | click
  path      TEXT    NOT NULL,
  title     TEXT,
  ref_host  TEXT,                          -- referring hostname (first page of a session only)
  ref_kind  TEXT    NOT NULL DEFAULT 'direct', -- direct | internal | linkedin | github | google | ...
  country   TEXT,
  region    TEXT,
  city      TEXT,
  device    TEXT,                          -- desktop | mobile | tablet
  os        TEXT,
  browser   TEXT,
  lang      TEXT,
  visitor   TEXT    NOT NULL,              -- random id kept in the visitor's localStorage
  session   TEXT    NOT NULL,              -- random id kept in sessionStorage (per tab)
  is_returning INTEGER NOT NULL DEFAULT 0,   -- 1 when this browser had visited before this session
  name      TEXT,                          -- click events: cv_download, linkedin, github, ...
  value     INTEGER                        -- engaged events: active milliseconds on the page
);
CREATE INDEX IF NOT EXISTS idx_events_ts ON events (ts);
CREATE INDEX IF NOT EXISTS idx_events_type_ts ON events (type, ts);
