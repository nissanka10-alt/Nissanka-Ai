const resourceRoot = "/sri-lanka/resources";

function createSession(config) {
    const basePath = `${resourceRoot}/${config.slug}`;

    return Object.freeze({
        ...config,
        landingPath: `${basePath}/`,
        downloadPath: `${basePath}/download/`,
        feedbackPath: `${basePath}/feedback/`,
        errorPath: `${basePath}/error/`,
        defaultSource: "qr",
    });
}

export const sessionResources = Object.freeze([
    createSession({
        slug: "jkh",
        eventSlug: "jkh-executive-session-2026-10-20",
        organisation: "John Keells Holdings",
        sessionTitle: "Executive Session",
        date: "20 October 2026",
        location: "Colombo",
        deckPath: "/resources/jkh/jkh-executive-session-slides.pdf",
        slidesReady: true,
        feedbackEnabled: true,
        active: true,
    }),
    createSession({
        slug: "union-bank",
        eventSlug: "union-bank-executive-session-2026-10-22",
        organisation: "Union Bank",
        sessionTitle: "Executive Session",
        date: "22 October 2026",
        location: "Colombo",
        deckPath: "/resources/sri-lanka/union-bank/session-slides.pdf",
        slidesReady: true,
        feedbackEnabled: true,
        active: true,
    }),
    createSession({
        slug: "vidul-lanka",
        eventSlug: "vidul-lanka-executive-session-2026-10-21",
        organisation: "Vidul Lanka",
        sessionTitle: "Executive Session",
        date: "21 October 2026",
        location: "Colombo",
        deckPath: "/resources/sri-lanka/vidul-lanka/session-slides.pdf",
        slidesReady: true,
        feedbackEnabled: true,
        active: true,
    }),
    createSession({
        slug: "aitken-spence",
        eventSlug: "aitken-spence-executive-session-2026-10-23",
        organisation: "Aitken Spence",
        sessionTitle: "Executive Session",
        date: "23 October 2026",
        location: "Colombo",
        deckPath: "/resources/sri-lanka/aitken-spence/session-slides.pdf",
        slidesReady: false,
        feedbackEnabled: true,
        active: true,
    }),
]);

export function getSessionBySlug(slug) {
    return sessionResources.find((session) => session.slug === slug && session.active);
}

export function getActiveSessions() {
    return sessionResources.filter((session) => session.active);
}

export const jkhEvent = getSessionBySlug("jkh");
