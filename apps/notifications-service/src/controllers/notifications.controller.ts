import type { Context } from "hono";
import { getUserFromHeaders, UnauthorizedError } from "@glybette/utils";
import type { NotificationsService } from "../services/notifications.service.js";

export class NotificationsController {
    constructor(private readonly notificationsService: NotificationsService) {}

    async list(c: Context): Promise<Response> {
        const auth = this.requireAuth(c);
        const notifications = await this.notificationsService.listInbox(auth.userId);
        return c.json({ notifications }, 200);
    }

    async unreadCount(c: Context): Promise<Response> {
        const auth = this.requireAuth(c);
        const count = await this.notificationsService.getUnreadCount(auth.userId);
        return c.json({ count }, 200);
    }

    async markRead(c: Context): Promise<Response> {
        const auth = this.requireAuth(c);
        const notificationId = c.req.param("id");
        const notification = await this.notificationsService.markRead(auth.userId, notificationId);
        return c.json({ notification }, 200);
    }

    async markAllRead(c: Context): Promise<Response> {
        const auth = this.requireAuth(c);
        const updatedCount = await this.notificationsService.markAllRead(auth.userId);
        return c.json({ updatedCount }, 200);
    }

    private requireAuth(c: Context) {
        const auth = getUserFromHeaders(c.req.raw.headers);
        if (!auth) {
            throw new UnauthorizedError("Authentication required.");
        }
        return auth;
    }
}
