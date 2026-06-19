import type { ProjectDomainEvent } from "@glybette/messaging";

export function resolveNotificationRecipients(
    event: ProjectDomainEvent,
    memberUserIds: string[],
    parentCommentAuthorId?: string,
): string[] {
    const payload = event.payload;

    switch (event.eventName) {
        case "join_request_created": {
            const ownerId = String(payload.ownerId ?? "");
            return ownerId ? [ownerId] : [];
        }
        case "join_request_approved":
        case "join_request_rejected": {
            const requesterId = String(payload.requesterId ?? "");
            return requesterId ? [requesterId] : [];
        }
        case "project_comment_created": {
            const authorId = String(payload.authorId ?? event.actorUserId);
            const recipients = new Set(memberUserIds.filter((userId) => userId !== authorId));
            if (parentCommentAuthorId && parentCommentAuthorId !== authorId) {
                recipients.add(parentCommentAuthorId);
            }
            return [...recipients];
        }
    }
}
