-- D1 schema. Applied by the platform on deploy (only when app.manifest.json
-- sets "db": true). ONE database is shared by preview + prod — keep every
-- change additive (CREATE TABLE IF NOT EXISTS / ADD COLUMN); a destructive
-- change hits production data. Bound as env.DB (see src/lib/bindings.server.ts).
--
CREATE TABLE IF NOT EXISTS leads (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  kind TEXT NOT NULL CHECK (kind IN ('contact', 'notify')),
  name TEXT,
  email TEXT NOT NULL,
  phone TEXT,
  industry TEXT,
  revenue TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
