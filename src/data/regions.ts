import type { RegionalTheme } from "./insights";

export interface RegionalThemeDefinition {
    name: RegionalTheme;
    description: string;
}

export const sriLankaThemes: RegionalThemeDefinition[] = [
    {
        name: "Data & Trust",
        description: "Practical guidance on data protection, governance and responsible use of AI.",
    },
    {
        name: "Workforce & Growth",
        description: "How better workforce intelligence can support productivity, capability and business growth.",
    },
    {
        name: "AI & Transformation",
        description: "Practical approaches to moving from AI experimentation to organisational value.",
    },
];

export const sriLankaNavigationProvision = [
    { location: "Insights", enabled: false },
    { location: "Tools", enabled: false },
    { location: "Footer", enabled: false },
    { location: "Ideas", enabled: false },
] as const;
