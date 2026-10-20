import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";
import test from "node:test";

import worker, {
    handleResourceFeedback,
    handleResourceLead,
    insertFeedbackSql,
    upsertLeadSql,
} from "../worker/index.js";

const LEAD_ID = "11111111-1111-4111-8111-111111111111";

const requestFor = (fields, url = "https://nissanka.co.uk/api/resource-lead") => {
    const body = new FormData();
    for (const [key, value] of Object.entries(fields)) body.set(key, value);
    return new Request(url, { method: "POST", body });
};

const validLeadFields = {
    session_slug: "union-bank",
    name: "  Asha Perera  ",
    email: "ASHA@EXAMPLE.COM",
    job_title: "Director",
    company: "Example PLC",
    phone: "+94 77 123 4567",
    source: "LinkedIn",
    marketing_opt_in: "1",
};

const validFeedbackFields = {
    session_slug: "union-bank",
    lead_id: LEAD_ID,
    usefulness_rating: "5",
    most_useful: "practical-use-cases",
    explore_further: "Governance in practice",
    follow_up_interest: "maybe",
    testimonial_permission: "anonymous",
};

function createDb({ leadId = LEAD_ID, leadEmail = "asha@example.com", feedbackSuccess = true } = {}) {
    const captures = [];
    return {
        captures,
        db: {
            prepare(sql) {
                const capture = { sql, values: [] };
                captures.push(capture);
                return {
                    bind(...values) {
                        capture.values = values;
                        return {
                            first: async () => sql.includes("INSERT INTO event_leads")
                                ? { id: leadId }
                                : { email: leadEmail },
                            run: async () => ({ success: feedbackSuccess }),
                        };
                    },
                };
            },
        },
    };
}

test("stores a normalised lead for an approved session and redirects correctly", async () => {
    const { db, captures } = createDb();
    const response = await handleResourceLead(requestFor(validLeadFields), { LEADS_DB: db });
    const capture = captures[0];

    assert.equal(response.status, 303);
    assert.equal(response.headers.get("location"), `https://nissanka.co.uk/sri-lanka/resources/union-bank/download/?lead=${LEAD_ID}`);
    assert.equal(capture.values[1], "union-bank-executive-session-2026-10-22");
    assert.equal(capture.values[4], "Asha Perera");
    assert.equal(capture.values[5], "asha@example.com");
    assert.equal(capture.values[9], 1);
    assert.equal(capture.values[11], "linkedin");
    assert.match(capture.sql, /ON CONFLICT\(event_slug, email\) DO UPDATE/);
});

test("treats a lead honeypot as successful without writing", async () => {
    let prepared = false;
    const response = await handleResourceLead(requestFor({ ...validLeadFields, _honey: "bot content" }), {
        LEADS_DB: { prepare: () => { prepared = true; } },
    });

    assert.equal(response.status, 303);
    assert.equal(response.headers.get("location"), "https://nissanka.co.uk/sri-lanka/resources/union-bank/download/");
    assert.equal(prepared, false);
});

test("rejects an unapproved session slug", async () => {
    const response = await handleResourceLead(requestFor({ ...validLeadFields, session_slug: "unknown-client" }), {});
    assert.equal(response.status, 400);
});

test("redirects invalid lead data back to the correct event form", async () => {
    const response = await handleResourceLead(requestFor({ ...validLeadFields, email: "invalid" }), {});
    assert.equal(response.headers.get("location"), "https://nissanka.co.uk/sri-lanka/resources/union-bank/?error=validation");
});

test("uses the configured source default when source input is unsafe", async () => {
    const { db, captures } = createDb();
    await handleResourceLead(requestFor({ ...validLeadFields, source: "unsafe value!" }), { LEADS_DB: db });
    assert.equal(captures[0].values[11], "qr");
});

test("preserves the old JKH endpoint with a forced approved session", async () => {
    const { db, captures } = createDb();
    const response = await worker.fetch(
        requestFor({ ...validLeadFields, session_slug: "unknown-client" }, "https://nissanka.co.uk/api/jkh-lead"),
        { LEADS_DB: db },
    );

    assert.equal(response.headers.get("location"), `https://nissanka.co.uk/sri-lanka/resources/jkh/download/?lead=${LEAD_ID}`);
    assert.equal(captures[0].values[1], "jkh-executive-session-2026-10-20");
});

test("stores optional feedback using the server-resolved lead email", async () => {
    const { db, captures } = createDb();
    const response = await handleResourceFeedback(
        requestFor(validFeedbackFields, "https://nissanka.co.uk/api/resource-feedback"),
        { LEADS_DB: db },
    );

    assert.equal(response.status, 303);
    assert.equal(response.headers.get("location"), "https://nissanka.co.uk/sri-lanka/resources/union-bank/download/?feedback=thanks");
    assert.equal(captures.length, 2);
    assert.equal(captures[0].values[0], LEAD_ID);
    assert.equal(captures[0].values[1], "union-bank-executive-session-2026-10-22");
    assert.equal(captures[1].values[1], "union-bank-executive-session-2026-10-22");
    assert.equal(captures[1].values[2], "asha@example.com");
    assert.equal(captures[1].values[4], 5);
    assert.equal(captures[1].values[8], "anonymous");
});

test("feedback honeypot succeeds without a database write", async () => {
    let prepared = false;
    const response = await handleResourceFeedback(
        requestFor({ ...validFeedbackFields, _honey: "bot" }, "https://nissanka.co.uk/api/resource-feedback"),
        { LEADS_DB: { prepare: () => { prepared = true; } } },
    );

    assert.equal(response.headers.get("location"), "https://nissanka.co.uk/sri-lanka/resources/union-bank/download/");
    assert.equal(prepared, false);
});

test("rejects invalid feedback without writing", async () => {
    const response = await handleResourceFeedback(
        requestFor({ ...validFeedbackFields, usefulness_rating: "6" }, "https://nissanka.co.uk/api/resource-feedback"),
        {},
    );

    assert.equal(response.headers.get("location"), `https://nissanka.co.uk/sri-lanka/resources/union-bank/feedback/?lead=${LEAD_ID}&error=validation`);
});

test("uses a branded feedback recovery state when storage fails", async () => {
    const { db } = createDb({ feedbackSuccess: false });
    const response = await handleResourceFeedback(
        requestFor(validFeedbackFields, "https://nissanka.co.uk/api/resource-feedback"),
        { LEADS_DB: db },
    );

    assert.equal(response.headers.get("location"), `https://nissanka.co.uk/sri-lanka/resources/union-bank/feedback/?lead=${LEAD_ID}&error=storage`);
});

test("API endpoints reject non-POST requests", async () => {
    for (const path of ["/api/resource-lead", "/api/jkh-lead", "/api/resource-feedback"]) {
        const response = await worker.fetch(new Request(`https://nissanka.co.uk${path}`), {});
        assert.equal(response.status, 405);
        assert.equal(response.headers.get("allow"), "POST");
    }
});

test("the lead migration preserves one row per event and email", () => {
    const database = new DatabaseSync(":memory:");
    database.exec(readFileSync(new URL("../migrations/0001_create_event_leads.sql", import.meta.url), "utf8"));

    const upsert = database.prepare(upsertLeadSql);
    const initial = [
        "first-id",
        "jkh-executive-session-2026-10-20",
        "2026-10-18T08:00:00.000Z",
        "2026-10-18T08:00:00.000Z",
        "Asha Perera",
        "asha@example.com",
        "Director",
        "Example PLC",
        null,
        1,
        "2026-10-18T08:00:00.000Z",
        "qr",
    ];
    assert.equal(upsert.get(...initial).id, "first-id");
    assert.equal(upsert.get(
        "second-id",
        initial[1],
        "2026-10-18T09:00:00.000Z",
        "2026-10-18T09:00:00.000Z",
        "Asha Perera",
        initial[5],
        "Group Director",
        initial[7],
        "+94 77 123 4567",
        0,
        null,
        "linkedin",
    ).id, "first-id");

    const rows = database.prepare("SELECT * FROM event_leads").all();
    assert.equal(rows.length, 1);
    assert.equal(rows[0].job_title, "Group Director");
    assert.equal(rows[0].marketing_opt_in, 1);
    database.close();
});

test("the feedback migration accepts the approved feedback shape", () => {
    const database = new DatabaseSync(":memory:");
    database.exec(readFileSync(new URL("../migrations/0002_create_event_feedback.sql", import.meta.url), "utf8"));
    const insert = database.prepare(insertFeedbackSql);
    insert.run(
        "feedback-id",
        "union-bank-executive-session-2026-10-22",
        "asha@example.com",
        "2026-10-21T10:00:00.000Z",
        5,
        "practical-use-cases",
        "Governance in practice",
        "maybe",
        "anonymous",
        null,
    );

    const row = database.prepare("SELECT * FROM event_feedback").get();
    assert.equal(row.usefulness_rating, 5);
    assert.equal(row.testimonial_permission, "anonymous");
    database.close();
});
