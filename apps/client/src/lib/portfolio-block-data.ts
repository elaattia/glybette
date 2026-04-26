export function getText(data: Record<string, unknown>, key: string, fallback = "") {
    const value = data[key];
    return typeof value === "string" ? value : fallback;
}

export function getStringList(data: Record<string, unknown>, key: string) {
    const value = data[key];
    return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

export function getObjectList<T extends Record<string, unknown>>(data: Record<string, unknown>, key: string) {
    const value = data[key];
    return Array.isArray(value)
        ? value.filter((item): item is T => Boolean(item && typeof item === "object" && !Array.isArray(item)))
        : [];
}

export type PortfolioSkillGroup = {
    label: string;
    skills: string[];
};

export function getSkillGroups(data: Record<string, unknown>) {
    const groups = getObjectList<{ label?: string; skills?: unknown }>(data, "skillGroups")
        .map((group) => ({
            label: typeof group.label === "string" ? group.label : "Skill group",
            skills: Array.isArray(group.skills)
                ? group.skills.filter((skill): skill is string => typeof skill === "string")
                : [],
        }))
        .filter((group) => group.label.trim() || group.skills.length > 0);

    if (groups.length > 0) {
        return groups;
    }

    const skills = getStringList(data, "skills");
    return skills.length > 0 ? [{ label: "Core", skills }] : [];
}
