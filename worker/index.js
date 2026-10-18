import { jkhEvent } from "../src/config/jkh.js";

const MAX_LENGTHS = Object.freeze({
    name: 120,
    email: 254,
    jobTitle: 160,
    company: 200,
    phone: 50,
    source: 48,
});

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
`;

function redirect(request, path) {
    return Response.redirect(new URL(path, request.url), 303);
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

function normaliseSource(value) {
    const candidate = value.toLowerCase();
    return /^[a-z0-9_-]{1,48}$/.test(candidate) ? candidate : jkhEvent.defaultSource;
}

export async function handleJkhLead(request, env) {
    let formData;

    try {
        formData = await request.formData();
    } catch {
        return redirect(request, `${jkhEvent.landingPath}?error=validation`);
    }

    const honeypot = readText(formData, "_honey", 200);
    if (honeypot) {
        return redirect(request, jkhEvent.downloadPath);
    }

    const name = readText(formData, "name", MAX_LENGTHS.name);
    const email = normaliseEmail(readText(formData, "email", MAX_LENGTHS.email));
    const jobTitle = readText(formData, "job_title", MAX_LENGTHS.jobTitle);
    const company = readText(formData, "company", MAX_LENGTHS.company);
    const phone = readText(formData, "phone", MAX_LENGTHS.phone);
    const source = normaliseSource(readText(formData, "source", MAX_LENGTHS.source));
    const marketingOptIn = formData.get("marketing_opt_in") === "1";

    if (!name || !email || !jobTitle || !company || !isValidEmail(email)) {
        return redirect(request, `${jkhEvent.landingPath}?error=validation`);
    }

    try {
        if (!env.LEADS_DB) throw new Error("LEADS_DB binding is unavailable");

        const timestamp = new Date().toISOString();
        const result = await env.LEADS_DB.prepare(upsertLeadSql)
            .bind(
                crypto.randomUUID(),
                jkhEvent.eventSlug,
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
            .run();

        if (!result.success) throw new Error("D1 write did not complete");
        return redirect(request, jkhEvent.downloadPath);
    } catch {
        return redirect(request, jkhEvent.errorPath);
    }
}

export default {
    async fetch(request, env) {
        const url = new URL(request.url);

        if (url.pathname === "/api/jkh-lead") {
            if (request.method !== "POST") {
                return new Response("Method Not Allowed", {
                    status: 405,
                    headers: { Allow: "POST" },
                });
            }

            return handleJkhLead(request, env);
        }

        return env.ASSETS.fetch(request);
    },
};
