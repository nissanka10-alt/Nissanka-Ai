export const insightTopics = ["AI & Adoption", "Workforce Intelligence", "Leadership", "Governance", "Future of Work"] as const;
export const insightGeographies = ["Global", "UK", "Sri Lanka"] as const;
export const insightFormats = ["Article", "Research Note", "Framework", "Guide"] as const;

export type InsightTopic = (typeof insightTopics)[number];
export type InsightGeography = (typeof insightGeographies)[number];
export type InsightFormat = (typeof insightFormats)[number];

export interface InsightDownload {
    file: string;
    label: string;
    version?: string;
}

export interface InsightReference {
    label: string;
    url: string;
}

export interface Insight {
    title: string;
    slug: string;
    summary: string;
    published: string;
    updated?: string;
    author: string;
    readTime: string;
    topic: InsightTopic;
    geography: InsightGeography;
    audience: string[];
    format: InsightFormat;
    featured: boolean;
    version?: string;
    download?: InsightDownload;
    references?: InsightReference[];
    advisoryPath?: { label: string; href: string };
}

export const insights: Insight[] = [
    {
        title: "Using AI Safely at Work: 10 Practical Questions Answered",
        slug: "safe-ai-at-work",
        summary: "Clear answers to ten common questions about ChatGPT, Copilot, sensitive information, governance, HR use cases and measuring value.",
        published: "2026-07-31",
        updated: "2026-07-31",
        author: "Gishan Nissanka",
        readTime: "12 min read",
        topic: "AI & Adoption",
        geography: "Global",
        audience: ["Employees", "HR leaders", "Business leaders"],
        format: "Guide",
        featured: true,
        references: [
            { label: "OpenAI — Business data privacy, security and compliance", url: "https://openai.com/business-data/" },
            { label: "UK Government — Guidance to civil servants on use of generative AI", url: "https://www.gov.uk/government/publications/guidance-to-civil-servants-on-use-of-generative-ai/guidance-to-civil-servants-on-use-of-generative-ai" },
            { label: "ICO — Accountability and governance implications of AI", url: "https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/artificial-intelligence/guidance-on-ai-and-data-protection/what-are-the-accountability-and-governance-implications-of-ai/" },
            { label: "Microsoft — Enterprise data protection in Microsoft 365 Copilot", url: "https://learn.microsoft.com/en-us/microsoft-365/copilot/enterprise-data-protection" },
            { label: "NCSC — Guidelines for secure AI system development", url: "https://www.ncsc.gov.uk/collection/guidelines-secure-ai-system-development/introduction" },
        ],
        advisoryPath: { label: "Explore AI Strategy & Transformation", href: "/advisory/ai-strategy/" },
    },
];

export const featuredInsight = insights.find((insight) => insight.featured) ?? insights[0];

export function formatInsightDate(value: string): string {
    return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(`${value}T00:00:00Z`));
}
