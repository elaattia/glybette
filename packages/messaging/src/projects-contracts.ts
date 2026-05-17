export const PROJECT_EVENT_NAMES = [
    "join_request_created",
    "join_request_approved",
    "join_request_rejected",
    "project_comment_created",
] as const;

export type ProjectEventName = (typeof PROJECT_EVENT_NAMES)[number];

export interface ProjectDomainEvent {
    eventId: string;
    eventName: ProjectEventName;
    schemaVersion: 1;
    projectId: string;
    actorUserId: string;
    occurredAtIso: string;
    payload: Record<string, unknown>;
}

function isObject(value: unknown): value is Record<string, unknown> {
    return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

export function isProjectDomainEvent(value: unknown): value is ProjectDomainEvent {
    if (!isObject(value)) {
        return false;
    }

    const eventName = value.eventName;
    if (typeof eventName !== "string" || !PROJECT_EVENT_NAMES.includes(eventName as ProjectEventName)) {
        return false;
    }

    return (
        typeof value.eventId === "string" &&
        value.schemaVersion === 1 &&
        typeof value.projectId === "string" &&
        typeof value.actorUserId === "string" &&
        typeof value.occurredAtIso === "string" &&
        isObject(value.payload)
    );
}
