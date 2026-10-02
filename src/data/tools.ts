export const toolTypes = ["Template", "Framework", "Checklist", "Assessment", "Interactive Tool", "Guide"] as const;
export const toolAccessTypes = ["Open", "Email Required", "Interactive"] as const;
export const toolStatuses = ["Draft", "Beta", "Published"] as const;
export const toolTopics = ["AI & Adoption", "Workforce Intelligence", "Leadership", "Governance", "Future of Work", "Data Governance"] as const;
export const toolGeographies = ["Global", "UK", "Sri Lanka"] as const;

export type ToolType = (typeof toolTypes)[number];
export type ToolAccessType = (typeof toolAccessTypes)[number];
export type ToolStatus = (typeof toolStatuses)[number];
export type ToolTopic = (typeof toolTopics)[number];
export type ToolGeography = (typeof toolGeographies)[number];

export interface ToolDownload {
    file: string;
    label: string;
    fileType: "PDF" | "DOCX" | "XLSX" | string;
}

export interface ToolAdvisoryPath {
    label: string;
    href: string;
}

export interface ToolInsightLink {
    label: string;
    href: string;
}

export interface ToolPrivacyNotice {
    dataCollected: string[];
    purpose: string;
    storage: string;
    retention: string;
    marketingUse: string;
    confidentialityNotice?: string;
}

export interface ToolUsageTerms {
    internalUse?: boolean;
    adaptation?: boolean;
    commercialRedistribution?: boolean;
    attributionRequired?: boolean;
    statement?: string;
}

export interface ToolGate {
    fields: Array<"Name" | "Work Email" | "Organisation">;
    consentLabel: string;
    privacyNotice: ToolPrivacyNotice;
}

export interface InteractiveToolArchitecture {
    questionSetId: string;
    responseMode: "Single choice" | "Multiple choice" | "Scale" | "Text" | "Mixed";
    resultLogicId: string;
    resultBands?: string[];
    guidanceId?: string;
    reportEnabled: boolean;
    optionalEmail: boolean;
}

export interface ToolResource {
    title: string;
    slug: string;
    summary: string;
    description: string;
    type: ToolType;
    topic: ToolTopic;
    geography: ToolGeography[];
    audience: string[];
    version?: string;
    published?: string;
    updated?: string;
    access: ToolAccessType;
    status: ToolStatus;
    download?: ToolDownload;
    gate?: ToolGate;
    interactive?: InteractiveToolArchitecture;
    disclaimer?: string;
    usageTerms?: ToolUsageTerms;
    advisoryPath?: ToolAdvisoryPath;
    relatedInsight?: ToolInsightLink;
    featured: boolean;
}

// Resources are added only after their content, access route and supporting files are approved.
export const toolResources: ToolResource[] = [];

export function formatToolDate(value: string): string {
    return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(`${value}T00:00:00Z`));
}
