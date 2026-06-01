import type { Hono } from "hono";
import type { ProjectsController } from "../controllers/projects.controller.js";

export function registerProjectsRoutes(app: Hono, controller: ProjectsController): void {
    app.get("/projects/admin/overview-stats", (c) => controller.adminOverviewStats(c));
    app.get("/projects/admin/list", (c) => controller.adminList(c));
    app.get("/projects/admin/:id", (c) => controller.adminGet(c));
    app.delete("/projects/admin/:id", (c) => controller.adminDelete(c));

    app.get("/projects/media/*", (c) => controller.serveMedia(c));

    app.get("/projects", (c) => controller.list(c));
    app.post("/projects", (c) => controller.create(c));
    app.get("/projects/:id", (c) => controller.getOne(c));
    app.patch("/projects/:id", (c) => controller.update(c));
    app.post("/projects/:id/publish", (c) => controller.publish(c));
    app.post("/projects/:id/unpublish", (c) => controller.unpublish(c));
    app.post("/projects/:id/archive", (c) => controller.archive(c));
    app.post("/projects/:id/cover", (c) => controller.uploadCover(c));

    app.post("/projects/:id/join-requests", (c) => controller.createJoinRequest(c));
    app.get("/projects/:id/join-requests", (c) => controller.listJoinRequests(c));
    app.post("/projects/:id/join-requests/:requestId/approve", (c) => controller.approveJoinRequest(c));
    app.post("/projects/:id/join-requests/:requestId/reject", (c) => controller.rejectJoinRequest(c));

    app.get("/projects/:id/comments", (c) => controller.listComments(c));
    app.post("/projects/:id/comments", (c) => controller.createComment(c));
    app.delete("/projects/:id/comments/:commentId", (c) => controller.deleteComment(c));
}
