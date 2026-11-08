export const organisationId = "https://nissanka.co.uk/#organisation";
export const gishanId = "https://nissanka.co.uk/#gishan-nissanka";
export const gishanProfileUrl = "https://nissanka.co.uk/profile/";
export const gishanLinkedInUrl = "https://www.linkedin.com/in/gishan-nissanka-3907645/";
export const gishanConversationUrl = "https://www.linkedin.com/pulse/cultivating-ai-mindset-conversation-gishan-hsncc/";
export const gishanRole = "AI Transformation & Workforce Intelligence Leader";

export const organisationEntity = {
    "@type": "Organization",
    "@id": organisationId,
    name: "Nissanka Advisory",
    legalName: "Nissanka Group Ltd",
    url: "https://nissanka.co.uk/",
    logo: {
        "@type": "ImageObject",
        url: "https://nissanka.co.uk/apple-touch-icon.png",
        width: 180,
        height: 180,
    },
    founder: { "@id": gishanId },
};

export const gishanEntity = {
    "@type": "Person",
    "@id": gishanId,
    name: "Gishan Nissanka",
    jobTitle: gishanRole,
    description: "AI transformation and workforce intelligence leader with experience across people technology, analytics and organisational change.",
    url: gishanProfileUrl,
    worksFor: { "@id": organisationId },
    sameAs: [gishanLinkedInUrl],
};
