export const USER_EVENT_NAMES = ["users.profile.upserted"] as const;
export type UserEventName = (typeof USER_EVENT_NAMES)[number];

export interface UserPublicProfileSnapshot {
    userId: string;
    displayName: string;
    avatarUrl?: string;
    isPremium: boolean;
    roles: string[];
}

export interface UserProfileUpsertedEvent {
    eventId: string;
    eventName: "users.profile.upserted";
    schemaVersion: 1;
    occurredAtIso: string;
    profile: UserPublicProfileSnapshot;
}

function isObject(value: unknown): value is Record<string, unknown> {
    return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

export function isUserProfileUpsertedEvent(value: unknown): value is UserProfileUpsertedEvent {
    if (!isObject(value)) {
        return false;
    }
    if (value.eventName !== "users.profile.upserted") {
        return false;
    }
    if (value.schemaVersion !== 1) {
        return false;
    }
    if (typeof value.eventId !== "string" || typeof value.occurredAtIso !== "string") {
        return false;
    }
    if (!isObject(value.profile)) {
        return false;
    }

    const profile = value.profile;
    return (
        typeof profile.userId === "string" &&
        typeof profile.displayName === "string" &&
        (profile.avatarUrl === undefined || typeof profile.avatarUrl === "string") &&
        typeof profile.isPremium === "boolean" &&
        Array.isArray(profile.roles) &&
        profile.roles.every((role) => typeof role === "string")
    );
}
