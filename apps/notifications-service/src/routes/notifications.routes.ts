import type { Hono } from "hono";
import type { NotificationsController } from "../controllers/notifications.controller.js";

export function registerNotificationsRoutes(app: Hono, controller: NotificationsController): void {
    app.get("/notifications", (c) => controller.list(c));
    app.get("/notifications/unread-count", (c) => controller.unreadCount(c));
    app.patch("/notifications/read-all", (c) => controller.markAllRead(c));
    app.patch("/notifications/:id/read", (c) => controller.markRead(c));
}
