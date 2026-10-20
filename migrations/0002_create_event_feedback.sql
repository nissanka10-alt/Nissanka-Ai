CREATE TABLE IF NOT EXISTS event_feedback (
    id TEXT PRIMARY KEY,
    event_slug TEXT NOT NULL,
    lead_email TEXT NOT NULL CHECK (length(lead_email) <= 254),
    created_at TEXT NOT NULL,
    usefulness_rating INTEGER NOT NULL CHECK (usefulness_rating BETWEEN 1 AND 5),
    most_useful TEXT NOT NULL CHECK (most_useful IN (
        'ai-mindset',
        'practical-use-cases',
        'governance-risk',
        'workforce-impact',
        'leadership-implications',
        'other'
    )),
    explore_further TEXT CHECK (explore_further IS NULL OR length(explore_further) <= 1000),
    follow_up_interest TEXT NOT NULL CHECK (follow_up_interest IN ('yes', 'maybe', 'not-currently')),
    testimonial_permission TEXT NOT NULL CHECK (testimonial_permission IN ('named', 'anonymous', 'no')),
    feedback_comment TEXT CHECK (feedback_comment IS NULL OR length(feedback_comment) <= 2000)
);

CREATE INDEX IF NOT EXISTS event_feedback_created_at_idx
    ON event_feedback (created_at);

CREATE INDEX IF NOT EXISTS event_feedback_event_slug_idx
    ON event_feedback (event_slug);

CREATE INDEX IF NOT EXISTS event_feedback_lead_email_idx
    ON event_feedback (lead_email);
