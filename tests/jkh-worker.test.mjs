import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";
import test from "node:test";

import worker, { handleJkhLead, upsertLeadSql } from "../worker/index.js";

const requestFor = (fields, url = "https://nissanka.co.uk/api/jkh-lead") => {
    const body = new FormData();
    for (const [key, value] of Object.entries(fields)) body.set(key, value);
    return new Request(url, { method: "POST", body });
};

const validFields = {
    name: "  Asha Perera  ",
    email: "ASHA@EXAMPLE.COM",
    job_title: "Director",
    company: "Example PLC",
    phone: "+94 77 123 4567",
    source: "LinkedIn",
    marketing_opt_in: "1",
};

function createDb({ success = true } = {}) {
    const capture = { sql: "", values: [] };
    return {
        capture,
        db: {
            prepare(sql) {
                capture.sql = sql;
                return {
                    bind(...values) {
                        capture.values = values;
                        return { run: async () => ({ success }) };
                    },
                };
            },
        },
    };
}

test("stores a normalised lead and redirects to the resource", async () => {
    const { db, capture } = createDb();
    const response = await handleJkhLead(requestFor(validFields), { LEADS_DB: db });

    assert.equal(response.status, 303);
    assert.equal(response.headers.get("location"), "https://nissanka.co.uk/jkh/download/");
    assert.equal(capture.values[1], "jkh-executive-session-2026-10-20");
    assert.equal(capture.values[4], "Asha Perera");
    assert.equal(capture.values[5], "asha@example.com");
    assert.equal(capture.values[9], 1);
    assert.equal(capture.values[11], "linkedin");
    assert.match(capture.sql, /ON CONFLICT\(event_slug, email\) DO UPDATE/);
});

test("treats a honeypot submission as successful without writing", async () => {
    let prepared = false;
    const request = requestFor({ ...validFields, _honey: "bot content" });
    const response = await handleJkhLead(request, {
        LEADS_DB: { prepare: () => { prepared = true; } },
    });

    assert.equal(response.status, 303);
    assert.equal(response.headers.get("location"), "https://nissanka.co.uk/jkh/download/");
    assert.equal(prepared, false);
});

test("redirects invalid data back to the form", async () => {
    const response = await handleJkhLead(requestFor({ ...validFields, email: "invalid" }), {});
    assert.equal(response.status, 303);
    assert.equal(response.headers.get("location"), "https://nissanka.co.uk/jkh/?error=validation");
});

test("uses a safe default for an invalid source", async () => {
    const { db, capture } = createDb();
    await handleJkhLead(requestFor({ ...validFields, source: "unsafe value!" }), { LEADS_DB: db });
    assert.equal(capture.values[11], "qr");
});

test("redirects to the branded recovery page when storage fails", async () => {
    const response = await handleJkhLead(requestFor(validFields), {});
    assert.equal(response.status, 303);
    assert.equal(response.headers.get("location"), "https://nissanka.co.uk/jkh/error/");
});

test("rejects non-POST endpoint requests", async () => {
    const response = await worker.fetch(new Request("https://nissanka.co.uk/api/jkh-lead"), {});
    assert.equal(response.status, 405);
    assert.equal(response.headers.get("allow"), "POST");
});

test("the duplicate strategy is an upsert that preserves existing consent", () => {
    assert.match(upsertLeadSql, /ON CONFLICT\(event_slug, email\) DO UPDATE/);
    assert.match(upsertLeadSql, /ELSE event_leads\.marketing_opt_in/);
});

test("the migration and upsert keep one row for a repeated event email", () => {
    const database = new DatabaseSync(":memory:");
    const migration = readFileSync(new URL("../migrations/0001_create_event_leads.sql", import.meta.url), "utf8");
    database.exec(migration);

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
    upsert.run(...initial);
    upsert.run(
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
    );

    const rows = database.prepare("SELECT * FROM event_leads").all();
    assert.equal(rows.length, 1);
    assert.equal(rows[0].id, "first-id");
    assert.equal(rows[0].job_title, "Group Director");
    assert.equal(rows[0].marketing_opt_in, 1);
    assert.equal(rows[0].source, "linkedin");
    database.close();
});
