import { getSessionBySlug } from "../src/config/session-resources.js";

const CONTACT_NOTIFICATION_URL = "https://formsubmit.co/ajax/gishan@nissanka.co.uk";
const CONTACT_NOTIFICATION_SUBJECT = "Nissanka Advisory website enquiry";
const CONTACT_NOTIFICATION_TIMEOUT_MS = 8000;

const MAX_LENGTHS = Object.freeze({
    name: 120,
    email: 254,
    organisation: 200,
    enquiryType: 80,
    message: 5000,
    jobTitle: 160,
    company: 200,
    phone: 50,
    source: 48,
    sessionSlug: 64,
    leadId: 36,
    exploreFurther: 1000,
});

const CONTACT_ENQUIRY_TYPES = new Set([
    "AI Opportunity & Readiness",
    "AI & Transformation",
    "Workforce Intelligence",
    "Sri Lanka / PDPA",
    "Buckinghamshire",
    "Leadership",
    "Speaking",
    "Other",
]);

const MOST_USEFUL_VALUES = new Set([
    "ai-mindset",
    "practical-use-cases",
    "governance-risk",
    "workforce-impact",
    "leadership-implications",
    "other",
]);
const FOLLOW_UP_VALUES = new Set(["yes", "maybe", "not-currently"]);
const TESTIMONIAL_VALUES = new Set(["named", "anonymous", "no"]);

export const upsertLeadSql = `
    INSERT INTO event_leads (
        id,
        event_slug,
        created_at,
        updated_at,
        name,
        email,
        job_title,
        company,
        phone,
        marketing_opt_in,
        marketing_opt_in_at,
        source
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(event_slug, email) DO UPDATE SET
        updated_at = excluded.updated_at,
        name = excluded.name,
        job_title = excluded.job_title,
        company = excluded.company,
        phone = excluded.phone,
        marketing_opt_in = CASE
            WHEN excluded.marketing_opt_in = 1 THEN 1
            ELSE event_leads.marketing_opt_in
        END,
        marketing_opt_in_at = CASE
            WHEN excluded.marketing_opt_in = 1
                THEN COALESCE(event_leads.marketing_opt_in_at, excluded.marketing_opt_in_at)
            ELSE event_leads.marketing_opt_in_at
        END,
        source = excluded.source
    RETURNING id
`;

export const selectLeadSql = `
    SELECT email
    FROM event_leads
    WHERE id = ? AND event_slug = ?
`;

export const insertFeedbackSql = `
    INSERT INTO event_feedback (
        id,
        event_slug,
        lead_email,
        created_at,
        usefulness_rating,
        most_useful,
        explore_further,
        follow_up_interest,
        testimonial_permission,
        feedback_comment
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`;

export const insertContactSubmissionSql = `
    INSERT INTO contact_submissions (
        created_at,
        name,
        email,
        organisation,
        enquiry_type,
        message,
        source,
        status,
        notification_status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, 'new', 'pending')
`;

export const updateContactNotificationSql = `
    UPDATE contact_submissions
    SET notification_status = ?
    WHERE id = ?
`;

export async function sendFormSubmitNotification(
    submission,
    { fetchImpl = fetch, timeoutMs = CONTACT_NOTIFICATION_TIMEOUT_MS } = {},
) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    try {
        const response = await fetchImpl(CONTACT_NOTIFICATION_URL, {
            method: "POST",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                name: submission.name,
                email: submission.email,
                organisation: submission.organisation,
                enquiry_type: submission.enquiryType,
                message: submission.message,
                _subject: CONTACT_NOTIFICATION_SUBJECT,
            }),
            signal: controller.signal,
        });

        if (!response.ok) {
            throw new Error(`FormSubmit returned HTTP ${response.status}`);
        }
    } finally {
        clearTimeout(timeout);
    }
}

async function attemptContactNotification(env, submissionId, submission, sendNotification) {
    let notificationStatus = "sent";

    try {
        await sendNotification(submission);
    } catch {
        notificationStatus = "failed";
    }

    if (submissionId === undefined || submissionId === null) return;

    try {
        await env.LEADS_DB.prepare(updateContactNotificationSql)
            .bind(notificationStatus, submissionId)
            .run();
    } catch {
        // The enquiry is already stored. Notification status updates must not undo success.
    }
}

function redirect(request, path) {
    return Response.redirect(new URL(path, request.url), 303);
}

function methodNotAllowed() {
    return new Response("Method Not Allowed", { status: 405, headers: { Allow: "POST" } });
}

function readText(formData, field, maxLength) {
    const value = formData.get(field);
    if (typeof value !== "string") return "";
    return value.trim().slice(0, maxLength);
}

function readValidatedText(formData, field, maxLength) {
    const value = formData.get(field);
    if (typeof value !== "string") return { value: "", valid: true };

    const trimmed = value.trim();
    return {
        value: trimmed,
        valid: trimmed.length <= maxLength,
    };
}

function normaliseEmail(value) {
    return value.toLowerCase();
}

function isValidEmail(value) {
    return value.length <= MAX_LENGTHS.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function normaliseSource(value, fallback) {
    const candidate = value.toLowerCase();
    return /^[a-z0-9_-]{1,48}$/.test(candidate) ? candidate : fallback;
}

function sessionFromForm(formData, forcedSlug) {
    const requestedSlug = forcedSlug ?? readText(formData, "session_slug", MAX_LENGTHS.sessionSlug);
    return getSessionBySlug(requestedSlug);
}

function pathWithQuery(path, parameters) {
    const query = new URLSearchParams(parameters);
    return `${path}?${query.toString()}`;
}

export async function handleContactSubmission(request, env, { sendNotification, waitUntil } = {}) {
    let formData;

    try {
        formData = await request.formData();
    } catch {
        return new Response("Invalid request", { status: 400 });
    }

    const honeypot = readValidatedText(formData, "_honey", 200);
    if (!honeypot.valid || honeypot.value) {
        return new Response("Invalid submission", { status: 400 });
    }

    const name = readValidatedText(formData, "name", MAX_LENGTHS.name);
    const email = readValidatedText(formData, "email", MAX_LENGTHS.email);
    const organisation = readValidatedText(formData, "organisation", MAX_LENGTHS.organisation);
    const enquiryType = readValidatedText(formData, "enquiry_type", MAX_LENGTHS.enquiryType);
    const message = readValidatedText(formData, "message", MAX_LENGTHS.message);
    const normalisedEmail = normaliseEmail(email.value);

    const fieldsAreValid = [name, email, organisation, enquiryType, message].every((field) => field.valid)
        && Boolean(name.value)
        && isValidEmail(normalisedEmail)
        && CONTACT_ENQUIRY_TYPES.has(enquiryType.value)
        && Boolean(message.value);

    if (!fieldsAreValid) {
        return new Response("Please check the required fields and try again.", { status: 400 });
    }

    let submissionId;
    const timestamp = new Date().toISOString();

    try {
        if (!env.LEADS_DB) throw new Error("LEADS_DB binding is unavailable");

        const result = await env.LEADS_DB.prepare(insertContactSubmissionSql)
            .bind(
                timestamp,
                name.value,
                normalisedEmail,
                organisation.value || null,
                enquiryType.value,
                message.value,
                "website-contact",
            )
            .run();

        if (!result.success) throw new Error("D1 contact write did not complete");
        submissionId = result.meta?.last_row_id;
    } catch {
        return new Response("We couldn't save your enquiry just now. Please try again.", { status: 503 });
    }

    if (typeof sendNotification === "function" && typeof waitUntil === "function") {
        const notificationTask = attemptContactNotification(
            env,
            submissionId,
            {
                name: name.value,
                email: normalisedEmail,
                organisation: organisation.value,
                enquiryType: enquiryType.value,
                message: message.value,
                timestamp,
            },
            sendNotification,
        );
        waitUntil(notificationTask);
    }

    return redirect(request, "/thank-you/");
}

export async function handleResourceLead(request, env, { forcedSlug } = {}) {
    let formData;

    try {
        formData = await request.formData();
    } catch {
        return new Response("Invalid request", { status: 400 });
    }

    const session = sessionFromForm(formData, forcedSlug);
    if (!session) return new Response("Invalid session", { status: 400 });

    const honeypot = readText(formData, "_honey", 200);
    if (honeypot) return redirect(request, session.downloadPath);

    const name = readText(formData, "name", MAX_LENGTHS.name);
    const email = normaliseEmail(readText(formData, "email", MAX_LENGTHS.email));
    const jobTitle = readText(formData, "job_title", MAX_LENGTHS.jobTitle);
    const company = readText(formData, "company", MAX_LENGTHS.company);
    const phone = readText(formData, "phone", MAX_LENGTHS.phone);
    const source = normaliseSource(readText(formData, "source", MAX_LENGTHS.source), session.defaultSource);
    const marketingOptIn = formData.get("marketing_opt_in") === "1";

    if (!name || !email || !jobTitle || !company || !isValidEmail(email)) {
        return redirect(request, pathWithQuery(session.landingPath, { error: "validation" }));
    }

    try {
        if (!env.LEADS_DB) throw new Error("LEADS_DB binding is unavailable");

        const timestamp = new Date().toISOString();
        const lead = await env.LEADS_DB.prepare(upsertLeadSql)
            .bind(
                crypto.randomUUID(),
                session.eventSlug,
                timestamp,
                timestamp,
                name,
                email,
                jobTitle,
                company,
                phone || null,
                marketingOptIn ? 1 : 0,
                marketingOptIn ? timestamp : null,
                source,
            )
            .first();

        if (!lead?.id) throw new Error("D1 write did not return a lead identifier");
        return redirect(request, pathWithQuery(session.downloadPath, { lead: lead.id }));
    } catch {
        return redirect(request, session.errorPath);
    }
}

export async function handleResourceFeedback(request, env) {
    let formData;

    try {
        formData = await request.formData();
    } catch {
        return new Response("Invalid request", { status: 400 });
    }

    const session = sessionFromForm(formData);
    if (!session || !session.feedbackEnabled) return new Response("Invalid session", { status: 400 });

    const leadId = readText(formData, "lead_id", MAX_LENGTHS.leadId);
    const honeypot = readText(formData, "_honey", 200);
    if (honeypot) return redirect(request, session.downloadPath);

    const usefulnessRating = Number.parseInt(readText(formData, "usefulness_rating", 1), 10);
    const mostUseful = readText(formData, "most_useful", 40);
    const exploreFurther = readText(formData, "explore_further", MAX_LENGTHS.exploreFurther);
    const followUpInterest = readText(formData, "follow_up_interest", 20);
    const testimonialPermission = readText(formData, "testimonial_permission", 20);

    const isValid = /^[a-f0-9-]{36}$/i.test(leadId)
        && usefulnessRating >= 1
        && usefulnessRating <= 5
        && MOST_USEFUL_VALUES.has(mostUseful)
        && FOLLOW_UP_VALUES.has(followUpInterest)
        && TESTIMONIAL_VALUES.has(testimonialPermission);

    if (!isValid) {
        return redirect(request, pathWithQuery(session.feedbackPath, { lead: leadId, error: "validation" }));
    }

    try {
        if (!env.LEADS_DB) throw new Error("LEADS_DB binding is unavailable");

        const lead = await env.LEADS_DB.prepare(selectLeadSql)
            .bind(leadId, session.eventSlug)
            .first();
        if (!lead?.email) {
            return redirect(request, pathWithQuery(session.feedbackPath, { lead: leadId, error: "validation" }));
        }

        const result = await env.LEADS_DB.prepare(insertFeedbackSql)
            .bind(
                crypto.randomUUID(),
                session.eventSlug,
                lead.email,
                new Date().toISOString(),
                usefulnessRating,
                mostUseful,
                exploreFurther || null,
                followUpInterest,
                testimonialPermission,
                null,
            )
            .run();

        if (!result.success) throw new Error("D1 feedback write did not complete");
        return redirect(request, pathWithQuery(session.downloadPath, { feedback: "thanks" }));
    } catch {
        return redirect(request, pathWithQuery(session.feedbackPath, { lead: leadId, error: "storage" }));
    }
}

export default {
    async fetch(request, env, ctx) {
        const url = new URL(request.url);

        if (url.pathname === "/api/resource-lead") {
            if (request.method !== "POST") return methodNotAllowed();
            return handleResourceLead(request, env);
        }

        if (url.pathname === "/api/jkh-lead") {
            if (request.method !== "POST") return methodNotAllowed();
            return handleResourceLead(request, env, { forcedSlug: "jkh" });
        }

        if (url.pathname === "/api/resource-feedback") {
            if (request.method !== "POST") return methodNotAllowed();
            return handleResourceFeedback(request, env);
        }

        if (url.pathname === "/api/contact") {
            if (request.method !== "POST") return methodNotAllowed();
            return handleContactSubmission(request, env, {
                sendNotification: sendFormSubmitNotification,
                waitUntil: ctx.waitUntil.bind(ctx),
            });
        }

        return env.ASSETS.fetch(request);
    },
};
