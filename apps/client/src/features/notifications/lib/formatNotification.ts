import type { NotificationDTO } from "@glybette/contracts";
import type { TFunction } from "i18next";

export type FormattedNotification = {
    title: string;
    body: string;
    preview?: string;
};

export function formatNotification(notification: NotificationDTO, t: TFunction): FormattedNotification {
    const actor = notification.actorDisplayName;
    const project = notification.projectTitle ?? t("notifications:content.unknownProject");

    switch (notification.type) {
        case "join_request_created":
            return {
                title: t("notifications:content.joinRequestCreated.title"),
                body: t("notifications:content.joinRequestCreated.body", { actor, project }),
                preview: notification.preview ?? t("notifications:content.noMessageProvided"),
            };
        case "join_request_approved":
            return {
                title: t("notifications:content.joinRequestApproved.title"),
                body: t("notifications:content.joinRequestApproved.body", { project }),
            };
        case "join_request_rejected":
            return {
                title: t("notifications:content.joinRequestRejected.title"),
                body: t("notifications:content.joinRequestRejected.body", { project }),
            };
        case "project_comment_created":
            return {
                title: t("notifications:content.projectCommentCreated.title"),
                body: t("notifications:content.projectCommentCreated.body", { actor, project }),
                preview: notification.preview,
            };
    }
}
