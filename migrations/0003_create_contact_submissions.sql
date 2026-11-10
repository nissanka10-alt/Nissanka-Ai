CREATE TABLE IF NOT EXISTS contact_submissions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    created_at TEXT NOT NULL,
    name TEXT NOT NULL CHECK (length(name) BETWEEN 1 AND 120),
    email TEXT NOT NULL CHECK (length(email) BETWEEN 3 AND 254),
    organisation TEXT CHECK (organisation IS NULL OR length(organisation) <= 200),
    enquiry_type TEXT NOT NULL CHECK (length(enquiry_type) BETWEEN 1 AND 80),
    message TEXT NOT NULL CHECK (length(message) BETWEEN 1 AND 5000),
    source TEXT CHECK (source IS NULL OR length(source) <= 48),
    status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'in_progress', 'closed')),
    notification_status TEXT NOT NULL DEFAULT 'pending' CHECK (
        notification_status IN ('pending', 'sent', 'failed')
    )
);

CREATE INDEX IF NOT EXISTS contact_submissions_created_at_idx
    ON contact_submissions (created_at);

CREATE INDEX IF NOT EXISTS contact_submissions_status_idx
    ON contact_submissions (status);

CREATE INDEX IF NOT EXISTS contact_submissions_email_idx
    ON contact_submissions (email);
