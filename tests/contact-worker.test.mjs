import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";
import test from "node:test";

import worker, {
    handleContactSubmission,
    insertContactSubmissionSql,
} from "../worker/index.js";

const requestFor = (fields) => {
    const body = new FormData();
    for (const [key, value] of Object.entries(fields)) body.set(key, value);
    return new Request("https://nissanka.co.uk/api/contact", { method: "POST", body });
};

const validFields = {
    name: "  Asha Perera  ",
    email: "ASHA@EXAMPLE.COM",
    organisation: "Example PLC",
    enquiry_type: "AI & Transformation",
    message: "  We would like to discuss our AI priorities.  ",
    _honey: "",
};

function createDb({ insertSuccess = true, notificationUpdateSuccess = true } = {}) {
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
                            run: async () => sql.includes("INSERT INTO contact_submissions")
                                ? { success: insertSuccess, meta: { last_row_id: 17 } }
                                : { success: notificationUpdateSuccess },
                        };
                    },
                };
            },
        },
    };
}

test("stores a valid contact enquiry before redirecting", async () => {
    const { db, captures } = createDb();
    const response = await handleContactSubmission(requestFor(validFields), { LEADS_DB: db });

    assert.equal(response.status, 303);
    assert.equal(response.headers.get("location"), "https://nissanka.co.uk/thank-you/");
    assert.equal(captures.length, 1);
    assert.match(captures[0].sql, /INSERT INTO contact_submissions/);
    assert.equal(captures[0].values[1], "Asha Perera");
    assert.equal(captures[0].values[2], "asha@example.com");
    assert.equal(captures[0].values[3], "Example PLC");
    assert.equal(captures[0].values[4], "AI & Transformation");
    assert.equal(captures[0].values[5], "We would like to discuss our AI priorities.");
    assert.equal(captures[0].values[6], "website-contact");
});

test("rejects a missing name without writing", async () => {
    let prepared = false;
    const response = await handleContactSubmission(requestFor({ ...validFields, name: "" }), {
        LEADS_DB: { prepare: () => { prepared = true; } },
    });

    assert.equal(response.status, 400);
    assert.equal(prepared, false);
});

test("rejects an invalid email without writing", async () => {
    let prepared = false;
    const response = await handleContactSubmission(requestFor({ ...validFields, email: "invalid" }), {
        LEADS_DB: { prepare: () => { prepared = true; } },
    });

    assert.equal(response.status, 400);
    assert.equal(prepared, false);
});

test("rejects an empty message without writing", async () => {
    let prepared = false;
    const response = await handleContactSubmission(requestFor({ ...validFields, message: "  " }), {
        LEADS_DB: { prepare: () => { prepared = true; } },
    });

    assert.equal(response.status, 400);
    assert.equal(prepared, false);
});

test("rejects a populated honeypot without writing", async () => {
    let prepared = false;
    const response = await handleContactSubmission(requestFor({ ...validFields, _honey: "bot content" }), {
        LEADS_DB: { prepare: () => { prepared = true; } },
    });

    assert.equal(response.status, 400);
    assert.equal(prepared, false);
});

test("does not show success when the D1 insert fails", async () => {
    const { db } = createDb({ insertSuccess: false });
    const response = await handleContactSubmission(requestFor(validFields), { LEADS_DB: db });

    assert.equal(response.status, 503);
    assert.equal(response.headers.get("location"), null);
});

test("email notification failure still succeeds after D1 storage", async () => {
    const { db, captures } = createDb();
    const response = await handleContactSubmission(
        requestFor(validFields),
        { LEADS_DB: db },
        { sendNotification: async () => { throw new Error("Email unavailable"); } },
    );

    assert.equal(response.status, 303);
    assert.equal(response.headers.get("location"), "https://nissanka.co.uk/thank-you/");
    assert.match(captures[0].sql, /INSERT INTO contact_submissions/);
    assert.match(captures[1].sql, /UPDATE contact_submissions/);
    assert.equal(captures[1].values[0], "failed");
    assert.equal(captures[1].values[1], 17);
});

test("the Worker exposes POST /api/contact and rejects other methods", async () => {
    const { db } = createDb();
    const response = await worker.fetch(requestFor(validFields), { LEADS_DB: db });
    assert.equal(response.status, 303);

    const getResponse = await worker.fetch(new Request("https://nissanka.co.uk/api/contact"), {});
    assert.equal(getResponse.status, 405);
    assert.equal(getResponse.headers.get("allow"), "POST");
});

test("the contact migration accepts the stored enquiry shape", () => {
    const database = new DatabaseSync(":memory:");
    database.exec(readFileSync(new URL("../migrations/0003_create_contact_submissions.sql", import.meta.url), "utf8"));

    database.prepare(insertContactSubmissionSql).run(
        "2026-11-10T10:00:00.000Z",
        "Asha Perera",
        "asha@example.com",
        "Example PLC",
        "AI & Transformation",
        "We would like to discuss our AI priorities.",
        "website-contact",
    );

    const row = database.prepare("SELECT * FROM contact_submissions").get();
    assert.equal(row.status, "new");
    assert.equal(row.notification_status, "pending");
    assert.equal(row.email, "asha@example.com");
    database.close();
});
