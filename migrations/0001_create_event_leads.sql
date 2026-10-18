CREATE TABLE IF NOT EXISTS event_leads (
    id TEXT PRIMARY KEY,
    event_slug TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    name TEXT NOT NULL CHECK (length(name) <= 120),
    email TEXT NOT NULL CHECK (length(email) <= 254),
    job_title TEXT NOT NULL CHECK (length(job_title) <= 160),
    company TEXT NOT NULL CHECK (length(company) <= 200),
    phone TEXT CHECK (phone IS NULL OR length(phone) <= 50),
    marketing_opt_in INTEGER NOT NULL DEFAULT 0 CHECK (marketing_opt_in IN (0, 1)),
    marketing_opt_in_at TEXT,
    source TEXT NOT NULL CHECK (length(source) <= 48),
    UNIQUE (event_slug, email)
);

CREATE INDEX IF NOT EXISTS event_leads_created_at_idx
    ON event_leads (created_at);

CREATE INDEX IF NOT EXISTS event_leads_event_slug_idx
    ON event_leads (event_slug);
