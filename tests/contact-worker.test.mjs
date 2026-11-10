import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";
import test from "node:test";

import worker, {
    handleContactSubmission,
    insertContactSubmissionSql,
    sendFormSubmitNotification,
} from "../worker/index.js";

const requestFor = (fields, url = "https://nissanka.co.uk/api/contact") => {
    const body = new FormData();
    for (const [key, value] of Object.entries(fields)) body.set(key, value);
    return new Request(url, { method: "POST", body });
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
                                ? { success: insertSuccess, meta: { changes: insertSuccess ? 1 : 0, last_row_id: 17 } }
                                : {
                                    success: notificationUpdateSuccess,
                                    meta: { changes: notificationUpdateSuccess ? 1 : 0 },
                                },
                            first: async () => sql.includes("INSERT INTO contact_submissions") && insertSuccess
                                ? { id: 17 }
                                : null,
                        };
                    },
                };
            },
        },
    };
}

function createExecutionContext() {
    const tasks = [];
    return {
        tasks,
        waitUntil(task) {
            tasks.push(task);
        },
    };
}

test("stores a valid contact enquiry using the real D1 first-row shape before redirecting", async () => {
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

test("a successful FormSubmit notification marks the stored enquiry as sent", async () => {
    const { db, captures } = createDb();
    const context = createExecutionContext();
    let notification;
    let captureCountWhenNotified;
    const response = await handleContactSubmission(
        requestFor(validFields),
        { LEADS_DB: db },
        {
            sendNotification: async (submission) => {
                captureCountWhenNotified = captures.length;
                notification = submission;
            },
            waitUntil: context.waitUntil,
        },
    );

    assert.equal(response.status, 303);
    assert.equal(response.headers.get("location"), "https://nissanka.co.uk/thank-you/");
    assert.equal(context.tasks.length, 1);
    await context.tasks[0];

    assert.equal(captureCountWhenNotified, 1);
    assert.equal(notification.email, "asha@example.com");
    assert.equal(notification.enquiryType, "AI & Transformation");
    assert.match(captures[0].sql, /INSERT INTO contact_submissions/);
    assert.match(captures[1].sql, /UPDATE contact_submissions/);
    assert.equal(captures[1].values[0], "sent");
    assert.equal(captures[1].values[1], 17);
});

test("FormSubmit failure marks notification failed but preserves the success redirect", async () => {
    const { db, captures } = createDb();
    const context = createExecutionContext();
    const response = await handleContactSubmission(
        requestFor(validFields),
        { LEADS_DB: db },
        {
            sendNotification: async () => { throw new Error("Email unavailable"); },
            waitUntil: context.waitUntil,
        },
    );

    assert.equal(response.status, 303);
    assert.equal(response.headers.get("location"), "https://nissanka.co.uk/thank-you/");
    assert.match(captures[0].sql, /INSERT INTO contact_submissions/);
    await context.tasks[0];

    assert.equal(captures[1].values[0], "failed");
    assert.equal(captures[1].values[1], 17);
});

test("FormSubmit timeout marks notification failed without changing the success redirect", async () => {
    const { db, captures } = createDb();
    const context = createExecutionContext();
    const fetchImpl = (_url, options) => new Promise((_resolve, reject) => {
        options.signal.addEventListener("abort", () => reject(options.signal.reason));
    });
    const response = await handleContactSubmission(
        requestFor(validFields),
        { LEADS_DB: db },
        {
            sendNotification: (submission) => sendFormSubmitNotification(submission, {
                fetchImpl,
                timeoutMs: 5,
            }),
            waitUntil: context.waitUntil,
        },
    );

    assert.equal(response.status, 303);
    await context.tasks[0];
    assert.equal(captures[1].values[0], "failed");
});

test("FormSubmit HTTP 200 with explicit JSON failure marks notification failed", async () => {
    const { db, captures } = createDb();
    const context = createExecutionContext();
    const response = await handleContactSubmission(
        requestFor(validFields),
        { LEADS_DB: db },
        {
            sendNotification: (submission) => sendFormSubmitNotification(submission, {
                fetchImpl: async () => new Response(JSON.stringify({ success: "false" }), { status: 200 }),
            }),
            waitUntil: context.waitUntil,
        },
    );

    assert.equal(response.status, 303);
    await context.tasks[0];
    assert.equal(captures[1].values[0], "failed");
});

test("malformed FormSubmit JSON marks notification failed", async () => {
    const { db, captures } = createDb();
    const context = createExecutionContext();
    const response = await handleContactSubmission(
        requestFor(validFields),
        { LEADS_DB: db },
        {
            sendNotification: (submission) => sendFormSubmitNotification(submission, {
                fetchImpl: async () => new Response("not-json", { status: 200 }),
            }),
            waitUntil: context.waitUntil,
        },
    );

    assert.equal(response.status, 303);
    await context.tasks[0];
    assert.equal(captures[1].values[0], "failed");
});

test("FormSubmit fetch exception marks notification failed", async () => {
    const { db, captures } = createDb();
    const context = createExecutionContext();
    const response = await handleContactSubmission(
        requestFor(validFields),
        { LEADS_DB: db },
        {
            sendNotification: (submission) => sendFormSubmitNotification(submission, {
                fetchImpl: async () => { throw new Error("network unavailable"); },
            }),
            waitUntil: context.waitUntil,
        },
    );

    assert.equal(response.status, 303);
    await context.tasks[0];
    assert.equal(captures[1].values[0], "failed");
});

test("D1 failure does not attempt notification", async () => {
    const { db } = createDb({ insertSuccess: false });
    const context = createExecutionContext();
    let notified = false;
    const response = await handleContactSubmission(
        requestFor(validFields),
        { LEADS_DB: db },
        {
            sendNotification: async () => { notified = true; },
            waitUntil: context.waitUntil,
        },
    );

    assert.equal(response.status, 503);
    assert.equal(notified, false);
    assert.equal(context.tasks.length, 0);
});

test("honeypot submission does not attempt notification", async () => {
    const context = createExecutionContext();
    let notified = false;
    const response = await handleContactSubmission(
        requestFor({ ...validFields, _honey: "bot content" }),
        { LEADS_DB: { prepare: () => { throw new Error("should not write"); } } },
        {
            sendNotification: async () => { notified = true; },
            waitUntil: context.waitUntil,
        },
    );

    assert.equal(response.status, 400);
    assert.equal(notified, false);
    assert.equal(context.tasks.length, 0);
});

test("invalid submission does not attempt notification", async () => {
    const context = createExecutionContext();
    let notified = false;
    const response = await handleContactSubmission(
        requestFor({ ...validFields, email: "invalid" }),
        { LEADS_DB: { prepare: () => { throw new Error("should not write"); } } },
        {
            sendNotification: async () => { notified = true; },
            waitUntil: context.waitUntil,
        },
    );

    assert.equal(response.status, 400);
    assert.equal(notified, false);
    assert.equal(context.tasks.length, 0);
});

test("notification-status update failure does not lose the stored enquiry", async () => {
    const { db, captures } = createDb({ notificationUpdateSuccess: false });
    const context = createExecutionContext();
    const response = await handleContactSubmission(
        requestFor(validFields),
        { LEADS_DB: db },
        {
            sendNotification: async () => {},
            waitUntil: context.waitUntil,
        },
    );

    assert.equal(response.status, 303);
    assert.equal(response.headers.get("location"), "https://nissanka.co.uk/thank-you/");
    await context.tasks[0];
    assert.match(captures[0].sql, /INSERT INTO contact_submissions/);
    assert.equal(captures[1].values[0], "sent");
    assert.equal(captures[2].values[0], "failed");
});

test("contact redirect preserves the production request origin", async () => {
    const { db } = createDb();
    const response = await handleContactSubmission(
        requestFor(validFields, "https://nissanka.co.uk/api/contact"),
        { LEADS_DB: db },
    );

    assert.equal(response.status, 303);
    assert.equal(response.headers.get("location"), "https://nissanka.co.uk/thank-you/");
});

test("contact redirect preserves a Cloudflare preview request origin", async () => {
    const { db } = createDb();
    const response = await handleContactSubmission(
        requestFor(validFields, "https://contact-preview.nissankaai.workers.dev/api/contact"),
        { LEADS_DB: db },
    );

    assert.equal(response.status, 303);
    assert.equal(
        response.headers.get("location"),
        "https://contact-preview.nissankaai.workers.dev/thank-you/",
    );
});

test("FormSubmit receives the approved JSON payload and subject", async () => {
    let request;
    await sendFormSubmitNotification(
        {
            name: "Asha Perera",
            email: "asha@example.com",
            organisation: "Example PLC",
            enquiryType: "AI & Transformation",
            message: "AI priorities",
        },
        {
            fetchImpl: async (url, options) => {
                request = { url, options };
                return new Response(JSON.stringify({ success: "true" }), { status: 200 });
            },
        },
    );

    assert.equal(request.url, "https://formsubmit.co/ajax/gishan@nissanka.co.uk");
    assert.equal(request.options.method, "POST");
    assert.equal(request.options.headers["Content-Type"], "application/json");
    assert.deepEqual(JSON.parse(request.options.body), {
        name: "Asha Perera",
        email: "asha@example.com",
        organisation: "Example PLC",
        enquiry_type: "AI & Transformation",
        message: "AI priorities",
        _subject: "Nissanka Advisory website enquiry",
    });
});

test("FormSubmit rejects a non-success HTTP response", async () => {
    await assert.rejects(
        sendFormSubmitNotification(
            {
                name: "Asha Perera",
                email: "asha@example.com",
                organisation: "Example PLC",
                enquiryType: "AI & Transformation",
                message: "AI priorities",
            },
            { fetchImpl: async () => new Response("Unavailable", { status: 503 }) },
        ),
        /FormSubmit returned HTTP 503/,
    );
});

test("the Worker exposes POST /api/contact and rejects other methods", async () => {
    const { db } = createDb();
    const context = createExecutionContext();
    const originalFetch = globalThis.fetch;
    let response;

    try {
        globalThis.fetch = async () => new Response(JSON.stringify({ success: "true" }), { status: 200 });
        response = await worker.fetch(requestFor(validFields), { LEADS_DB: db }, context);
        await context.tasks[0];
    } finally {
        globalThis.fetch = originalFetch;
    }

    assert.equal(response.status, 303);

    const getResponse = await worker.fetch(new Request("https://nissanka.co.uk/api/contact"), {}, context);
    assert.equal(getResponse.status, 405);
    assert.equal(getResponse.headers.get("allow"), "POST");
});

test("the contact migration accepts the stored enquiry shape", () => {
    const database = new DatabaseSync(":memory:");
    database.exec(readFileSync(new URL("../migrations/0003_create_contact_submissions.sql", import.meta.url), "utf8"));

    const inserted = database.prepare(insertContactSubmissionSql).get(
        "2026-11-10T10:00:00.000Z",
        "Asha Perera",
        "asha@example.com",
        "Example PLC",
        "AI & Transformation",
        "We would like to discuss our AI priorities.",
        "website-contact",
    );

    const row = database.prepare("SELECT * FROM contact_submissions").get();
    assert.equal(inserted.id, row.id);
    assert.equal(row.status, "new");
    assert.equal(row.notification_status, "pending");
    assert.equal(row.email, "asha@example.com");
    database.close();
});
