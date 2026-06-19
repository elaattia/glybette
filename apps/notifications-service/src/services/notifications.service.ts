import mongoose from "mongoose";
import type { NotificationDTO, NotificationType } from "@glybette/contracts";
import type { ProjectDomainEvent } from "@glybette/messaging";
import { NotFoundError } from "@glybette/utils";
import {
    ensureNotificationIndexes,
    notificationsCollection,
    type CreateNotificationInput,
    type NotificationDocument,
} from "../repositories/notifications.repository.js";
import type { ProjectsClient, UsersClient } from "./interop.clients.js";
import { resolveNotificationRecipients } from "./notifications.logic.js";

const INBOX_LIMIT = 50;

function projectHref(projectId: string): string {
    return `/app/projects/${projectId}`;
}

function fallbackDisplayName(userId: string): string {
    return userId.slice(0, 8);
}

function toNotificationDto(doc: NotificationDocument): NotificationDTO {
    return {
        id: doc._id.toString(),
        type: doc.type,
        title: doc.title,
        body: doc.body,
        preview: doc.preview,
        actorUserId: doc.actorUserId,
        actorDisplayName: doc.actorDisplayName,
        projectId: doc.projectId,
        projectTitle: doc.projectTitle,
        href: doc.href,
        readAt: doc.readAt?.toISOString(),
        createdAt: doc.createdAt.toISOString(),
    };
}

function buildNotificationContent(
    type: NotificationType,
    actorDisplayName: string,
    projectTitle: string,
    preview?: string,
): Pick<CreateNotificationInput, "title" | "body" | "preview"> {
    switch (type) {
        case "join_request_created":
            return {
                title: "New join request",
                body: `${actorDisplayName} requested to join ${projectTitle}`,
                preview: preview ?? "No message provided.",
            };
        case "join_request_approved":
            return {
                title: "Join request approved",
                body: `Your request to join ${projectTitle} was approved`,
            };
        case "join_request_rejected":
            return {
                title: "Join request declined",
                body: `Your request to join ${projectTitle} was declined`,
            };
        case "project_comment_created":
            return {
                title: "New comment",
                body: `${actorDisplayName} commented on ${projectTitle}`,
                preview,
            };
    }
}

function resolveRecipients(event: ProjectDomainEvent, memberUserIds: string[], parentCommentAuthorId?: string): string[] {
    return resolveNotificationRecipients(event, memberUserIds, parentCommentAuthorId);
}

export class NotificationsService {
    constructor(
        private readonly projectsClient: ProjectsClient,
        private readonly usersClient: UsersClient,
    ) {}

    async listInbox(userId: string): Promise<NotificationDTO[]> {
        await ensureNotificationIndexes();
        const docs = await notificationsCollection()
            .find({ userId })
            .sort({ createdAt: -1 })
            .limit(INBOX_LIMIT)
            .toArray();

        return docs.map(toNotificationDto);
    }

    async getUnreadCount(userId: string): Promise<number> {
        await ensureNotificationIndexes();
        return notificationsCollection().countDocuments({ userId, readAt: { $exists: false } });
    }

    async markRead(userId: string, notificationId: string): Promise<NotificationDTO> {
        await ensureNotificationIndexes();

        let objectId: mongoose.Types.ObjectId;
        try {
            objectId = new mongoose.Types.ObjectId(notificationId);
        } catch {
            throw new NotFoundError("Notification not found.");
        }

        const result = await notificationsCollection().findOneAndUpdate(
            { _id: objectId, userId },
            { $set: { readAt: new Date() } },
            { returnDocument: "after" },
        );

        if (!result) {
            throw new NotFoundError("Notification not found.");
        }

        return toNotificationDto(result);
    }

    async markAllRead(userId: string): Promise<number> {
        await ensureNotificationIndexes();
        const result = await notificationsCollection().updateMany(
            { userId, readAt: { $exists: false } },
            { $set: { readAt: new Date() } },
        );
        return result.modifiedCount;
    }

    async handleProjectDomainEvent(event: ProjectDomainEvent): Promise<void> {
        await ensureNotificationIndexes();

        const requestId = typeof event.payload.requestId === "string" ? event.payload.requestId : undefined;
        const commentId = typeof event.payload.commentId === "string" ? event.payload.commentId : undefined;

        const context = await this.projectsClient.getNotificationContext({
            projectId: event.projectId,
            requestId,
            commentId,
        });

        const recipients = resolveRecipients(event, context.memberUserIds, context.parentCommentAuthorId);
        if (recipients.length === 0) {
            return;
        }

        const displayNames = await this.usersClient.resolveDisplayNames([event.actorUserId, ...recipients]);
        const actorDisplayName = displayNames.get(event.actorUserId) ?? fallbackDisplayName(event.actorUserId);
        const content = buildNotificationContent(
            event.eventName,
            actorDisplayName,
            context.projectTitle,
            event.eventName === "join_request_created"
                ? context.joinRequestMessage
                : event.eventName === "project_comment_created"
                  ? context.commentContent
                  : undefined,
        );

        const createdAt = new Date(event.occurredAtIso);
        const baseInput: Omit<CreateNotificationInput, "userId"> = {
            type: event.eventName,
            eventId: event.eventId,
            title: content.title,
            body: content.body,
            preview: content.preview,
            actorUserId: event.actorUserId,
            actorDisplayName,
            projectId: event.projectId,
            projectTitle: context.projectTitle,
            href: projectHref(event.projectId),
            createdAt,
        };

        for (const userId of recipients) {
            try {
                await notificationsCollection().insertOne({
                    _id: new mongoose.Types.ObjectId(),
                    userId,
                    ...baseInput,
                });
            } catch (error) {
                if (error && typeof error === "object" && "code" in error && error.code === 11000) {
                    continue;
                }
                throw error;
            }
        }
    }
}
