export const aiIllusionStatuses = ["Draft", "Published"] as const;

export type AiIllusionStatus = (typeof aiIllusionStatuses)[number];

export interface AiIllusionEdition {
    title: string;
    subtitle?: string;
    slug: string;
    issueNumber?: string;
    summary?: string;
    published?: string;
    updated?: string;
    topic?: string;
    featured: boolean;
    status: AiIllusionStatus;
}

export const aiIllusionEditions: AiIllusionEdition[] = [
    {
        title: "The AI Illusion",
        subtitle: "AI can do your job, but not your work",
        slug: "ai-can-do-your-job-but-not-your-work",
        featured: false,
        status: "Draft",
    },
];

export const publishedAiIllusionEditions = aiIllusionEditions.filter((edition) => edition.status === "Published");

export interface IdeasSubscriptionProvision {
    enabled: boolean;
    possibleLabels: string[];
}

export const ideasSubscriptionProvision: IdeasSubscriptionProvision = {
    enabled: false,
    possibleLabels: ["Nissanka Ideas", "AI Illusion"],
};
