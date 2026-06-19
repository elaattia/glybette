import mongoose from "mongoose";
import type { NotificationType } from "@glybette/contracts";

export type NotificationDocument = {
    _id: mongoose.Types.ObjectId;
    userId: string;
    type: NotificationType;
    eventId: string;
    title: string;
    body: string;
    preview?: string;
    actorUserId: string;
    actorDisplayName: string;
    projectId?: string;
    projectTitle?: string;
    href: string;
    readAt?: Date;
    createdAt: Date;
};

export type CreateNotificationInput = {
    userId: string;
    type: NotificationType;
    eventId: string;
    title: string;
    body: string;
    preview?: string;
    actorUserId: string;
    actorDisplayName: string;
    projectId?: string;
    projectTitle?: string;
    href: string;
    createdAt: Date;
};

let indexesEnsured = false;

export function notificationsCollection() {
    return mongoose.connection.collection<NotificationDocument>("notifications");
}

export async function ensureNotificationIndexes(): Promise<void> {
    if (indexesEnsured) {
        return;
    }

    const collection = notificationsCollection();
    await collection.createIndex({ userId: 1, createdAt: -1 });
    await collection.createIndex({ eventId: 1, userId: 1 }, { unique: true });
    indexesEnsured = true;
}
