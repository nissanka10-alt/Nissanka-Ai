export const insightTopics = ["AI & Adoption", "Workforce Intelligence", "Leadership", "Governance", "Future of Work"] as const;
export const insightGeographies = ["Global", "UK", "Sri Lanka"] as const;
export const insightFormats = ["Article", "Research Note", "White Paper", "Research", "Framework", "Guide"] as const;
export const insightStatuses = ["Draft", "Published"] as const;
export const regionalThemes = ["Data & Trust", "Workforce & Growth", "AI & Transformation"] as const;

export type InsightTopic = (typeof insightTopics)[number];
export type InsightGeography = (typeof insightGeographies)[number];
export type InsightFormat = (typeof insightFormats)[number];
export type InsightStatus = (typeof insightStatuses)[number];
export type RegionalTheme = (typeof regionalThemes)[number];

export interface InsightDownload {
    file: string;
    label: string;
    version?: string;
}

export interface InsightReference {
    label: string;
    url: string;
}

export interface InsightResearchMetadata {
    methodology?: string;
    sampleSize?: string;
    fieldworkDates?: string;
    respondentProfile?: string;
    findings?: string[];
    limitations?: string;
}

export interface InsightLongFormMetadata {
    executiveSummary?: string;
    keyFindings?: string[];
    sections?: string[];
}

export interface InsightRegulatoryMetadata {
    jurisdiction: string;
    reviewStatus?: string;
    disclaimer?: string;
}

interface InsightBase {
    title: string;
    slug: string;
    subtitle?: string;
    summary?: string;
    published?: string;
    updated?: string;
    author?: string;
    readTime?: string;
    topic: InsightTopic;
    secondaryTopics?: InsightTopic[];
    geography: InsightGeography;
    theme?: RegionalTheme;
    audience: string[];
    format: InsightFormat;
    featured: boolean;
    status: InsightStatus;
    version?: string;
    download?: InsightDownload;
    references?: InsightReference[];
    advisoryPath?: { label: string; href: string };
    research?: InsightResearchMetadata;
    longForm?: InsightLongFormMetadata;
    regulatory?: InsightRegulatoryMetadata;
}

export interface PublishedInsight extends InsightBase {
    status: "Published";
    summary: string;
    published: string;
    author: string;
    readTime?: string;
}

export interface DraftInsight extends InsightBase {
    status: "Draft";
}

export type Insight = PublishedInsight | DraftInsight;

export const insightRecords: Insight[] = [
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
        status: "Published",
        references: [
            { label: "OpenAI — Business data privacy, security and compliance", url: "https://openai.com/business-data/" },
            { label: "UK Government — Guidance to civil servants on use of generative AI", url: "https://www.gov.uk/government/publications/guidance-to-civil-servants-on-use-of-generative-ai/guidance-to-civil-servants-on-use-of-generative-ai" },
            { label: "ICO — Accountability and governance implications of AI", url: "https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/artificial-intelligence/guidance-on-ai-and-data-protection/what-are-the-accountability-and-governance-implications-of-ai/" },
            { label: "Microsoft — Enterprise data protection in Microsoft 365 Copilot", url: "https://learn.microsoft.com/en-us/microsoft-365/copilot/enterprise-data-protection" },
            { label: "NCSC — Guidelines for secure AI system development", url: "https://www.ncsc.gov.uk/collection/guidelines-secure-ai-system-development/introduction" },
        ],
        advisoryPath: { label: "Explore AI Strategy & Transformation", href: "/advisory/ai-strategy/" },
    },
    {
        title: "PDPA for CHROs",
        subtitle: "What Sri Lankan HR leaders need to prepare before 1 January 2027",
        slug: "pdpa-for-chros",
        summary: "A practical guide to the employee-data, governance, technology and leadership questions Sri Lankan CHROs should address before key provisions of the PDPA come into operation.",
        published: "2026-10-03",
        updated: "2026-10-03",
        author: "Gishan Nissanka",
        topic: "Governance",
        geography: "Sri Lanka",
        theme: "Data & Trust",
        audience: ["CHROs", "HR leaders", "Business leaders"],
        format: "Guide",
        featured: false,
        status: "Published",
        download: {
            file: "/resources/sri-lanka/pdpa-for-chros-infographic.png",
            label: "Download the PDPA for CHROs infographic",
        },
        references: [
            { label: "Personal Data Protection Act, No. 9 of 2022 — Data Protection Authority of Sri Lanka", url: "https://www.dpa.gov.lk/acts/Data%20Protection%20Act%20SL%20-%20English%20(2).pdf" },
            { label: "Personal Data Protection (Amendment) Act, No. 22 of 2025", url: "https://documents.gov.lk/view/acts/2025/10/22-2025_E.pdf" },
            { label: "Extraordinary Gazette No. 2498/16 — 22 July 2026", url: "https://www.documents.gov.lk/view/egz/egz_2026.html" },
            { label: "Data Protection Authority of Sri Lanka", url: "https://www.dpa.gov.lk/" },
        ],
        advisoryPath: { label: "Explore AI Strategy & Transformation", href: "/advisory/ai-strategy/" },
        regulatory: {
            jurisdiction: "Sri Lanka",
            reviewStatus: "Published",
            disclaimer: "This guide is intended to support practical organisational thinking and does not constitute legal advice. Organisations should obtain appropriate legal advice on their specific obligations under Sri Lankan law.",
        },
    },
    {
        title: "What Sri Lankan Companies Can Learn From GDPR",
        slug: "what-sri-lankan-companies-can-learn-from-gdpr",
        topic: "Governance",
        geography: "Sri Lanka",
        theme: "Data & Trust",
        audience: [],
        format: "Article",
        featured: false,
        status: "Draft",
        regulatory: { jurisdiction: "Sri Lanka" },
    },
    {
        title: "Beyond HR Reporting",
        subtitle: "How People Intelligence Could Unlock Sri Lanka’s Next Chapter of Growth",
        slug: "beyond-hr-reporting-sri-lanka",
        topic: "Workforce Intelligence",
        geography: "Sri Lanka",
        theme: "Workforce & Growth",
        audience: [],
        format: "White Paper",
        featured: false,
        status: "Draft",
        research: {},
        longForm: {},
    },
    {
        title: "AI, Employee Data and PDPA",
        subtitle: "What Sri Lankan Leaders Need to Know",
        slug: "ai-employee-data-and-pdpa",
        topic: "Governance",
        secondaryTopics: ["AI & Adoption"],
        geography: "Sri Lanka",
        theme: "Data & Trust",
        audience: [],
        format: "Guide",
        featured: false,
        status: "Draft",
        regulatory: { jurisdiction: "Sri Lanka" },
    },
    {
        title: "Sri Lanka Workforce Intelligence Pulse 2026",
        slug: "sri-lanka-workforce-intelligence-pulse-2026",
        topic: "Workforce Intelligence",
        geography: "Sri Lanka",
        theme: "Workforce & Growth",
        audience: [],
        format: "Research",
        featured: false,
        status: "Draft",
        research: {},
        longForm: {},
    },
];

// Public listings, routes and schema must consume this filtered collection, never insightRecords.
export const insights = insightRecords.filter((insight): insight is PublishedInsight => insight.status === "Published");
export const featuredInsight = insights.find((insight) => insight.featured) ?? insights[0];

export function formatInsightDate(value: string): string {
    return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(`${value}T00:00:00Z`));
}
