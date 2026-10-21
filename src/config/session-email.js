export const sessionEmailConfig = Object.freeze({
    siteUrl: "https://nissanka.co.uk",
    from: Object.freeze({
        name: "Nissanka Advisory",
        email: "gishan@nissanka.co.uk",
    }),
    replyTo: "gishan@nissanka.co.uk",
    subject: "Your slides from today’s executive session",
    attachmentMaxBytes: 3 * 1024 * 1024,
});

export function sessionAttachmentFilename(session) {
    return `nissanka-advisory-${session.slug}-session-slides.pdf`;
}
