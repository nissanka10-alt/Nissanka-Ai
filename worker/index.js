import { getSessionBySlug } from "../src/config/session-resources.js";
import { sessionAttachmentFilename, sessionEmailConfig } from "../src/config/session-email.js";

const MAX_LENGTHS = Object.freeze({
    name: 120,
    email: 254,
    jobTitle: 160,
    company: 200,
    phone: 50,
    source: 48,
    sessionSlug: 64,
    leadId: 36,
    exploreFurther: 1000,
});

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

function absoluteSiteUrl(path, parameters) {
    const url = new URL(path, sessionEmailConfig.siteUrl);
    if (parameters) {
        for (const [key, value] of Object.entries(parameters)) url.searchParams.set(key, value);
    }
    return url.toString();
}

function firstName(name) {
    return name.split(/\s+/u)[0] || name;
}

function escapeHtml(value) {
    return value
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#39;");
}

async function sessionPdfAttachment(session, env) {
    if (!session.slidesReady || !env.ASSETS) return null;

    try {
        const response = await env.ASSETS.fetch(new Request(absoluteSiteUrl(session.deckPath)));
        if (!response.ok) return null;

        const contentType = response.headers.get("content-type")?.split(";", 1)[0].trim().toLowerCase();
        if (contentType !== "application/pdf") return null;

        const content = await response.arrayBuffer();
        if (!content.byteLength || content.byteLength > sessionEmailConfig.attachmentMaxBytes) return null;

        return {
            content,
            filename: sessionAttachmentFilename(session),
            type: "application/pdf",
            disposition: "attachment",
        };
    } catch {
        return null;
    }
}

export async function sendSessionResourceEmail({ env, session, leadId, name, email }) {
    if (!env.EMAIL) throw Object.assign(new Error("EMAIL binding is unavailable"), { code: "EMAIL_BINDING_UNAVAILABLE" });

    const attachment = await sessionPdfAttachment(session, env);
    const downloadUrl = absoluteSiteUrl(session.downloadPath, { lead: leadId });
    const feedbackUrl = absoluteSiteUrl(session.feedbackPath, { lead: leadId });
    const greetingName = firstName(name);
    const safeGreetingName = escapeHtml(greetingName);
    const presentationText = attachment
        ? "I've attached the presentation for your reference. I hope it helps continue the conversations around AI, work and leadership within your organisation."
        : "The presentation is available from the link below. I hope it helps continue the conversations around AI, work and leadership within your organisation.";
    const presentationHtml = escapeHtml(presentationText);
    const attachmentFallbackText = attachment ? "" : `\n\nDownload the session slides here:\n${downloadUrl}`;
    const attachmentFallbackHtml = attachment
        ? ""
        : `<p>Download the session slides here:<br><a href="${downloadUrl}">${downloadUrl}</a></p>`;

    const message = {
        to: email,
        from: sessionEmailConfig.from,
        replyTo: sessionEmailConfig.replyTo,
        subject: sessionEmailConfig.subject,
        text: `Hi ${greetingName},

Thank you for joining the session today.

${presentationText}

If there was a particular area you would like to explore further, simply reply to this email or get in touch through Nissanka Advisory.${attachmentFallbackText}

You can also share one minute of feedback here:
${feedbackUrl}

Regards,

Gishan Nissanka
Founder, Nissanka Advisory
nissanka.co.uk`,
        html: `<p>Hi ${safeGreetingName},</p>
<p>Thank you for joining the session today.</p>
<p>${presentationHtml}</p>
<p>If there was a particular area you would like to explore further, simply reply to this email or get in touch through Nissanka Advisory.</p>
${attachmentFallbackHtml}
<p>You can also share one minute of feedback here:<br><a href="${feedbackUrl}">${feedbackUrl}</a></p>
<p>Regards,</p>
<p>Gishan Nissanka<br>Founder, Nissanka Advisory<br><a href="https://nissanka.co.uk/">nissanka.co.uk</a></p>`,
    };

    if (attachment) message.attachments = [attachment];
    return env.EMAIL.send(message);
}

function emailFailureCode(error) {
    return typeof error?.code === "string" && /^[A-Z0-9_]{1,64}$/.test(error.code)
        ? error.code
        : "EMAIL_SEND_FAILED";
}

function scheduleSessionResourceEmail(ctx, details) {
    if (typeof ctx?.waitUntil !== "function") return;

    const task = sendSessionResourceEmail(details).catch((error) => {
        console.error("session-resource-email-failed", {
            session: details.session.slug,
            code: emailFailureCode(error),
        });
    });

    try {
        ctx.waitUntil(task);
    } catch {
        console.error("session-resource-email-failed", {
            session: details.session.slug,
            code: "WAIT_UNTIL_FAILED",
        });
    }
}

export async function handleResourceLead(request, env, { forcedSlug, ctx } = {}) {
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
        scheduleSessionResourceEmail(ctx, { env, session, leadId: lead.id, name, email });
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
            return handleResourceLead(request, env, { ctx });
        }

        if (url.pathname === "/api/jkh-lead") {
            if (request.method !== "POST") return methodNotAllowed();
            return handleResourceLead(request, env, { forcedSlug: "jkh", ctx });
        }

        if (url.pathname === "/api/resource-feedback") {
            if (request.method !== "POST") return methodNotAllowed();
            return handleResourceFeedback(request, env);
        }

        return env.ASSETS.fetch(request);
    },
};
