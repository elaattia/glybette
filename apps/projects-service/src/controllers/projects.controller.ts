import { readFile } from "node:fs/promises";
import { extname, normalize, resolve } from "node:path";
import type { Context } from "hono";
import { getUserFromHeaders, UnauthorizedError, NotFoundError, BadRequestError } from "@glybette/utils";
import { validateImageUpload, type UploadProvider } from "@glybette/uploads";
import type { ProjectsService } from "../services/projects.service.js";
import {
    validateCreateCommentPayload,
    validateCreateJoinRequestPayload,
    validateCreateProjectPayload,
    validateDecideJoinRequestPayload,
    validateListProjectsQuery,
    validateObjectIdParam,
    validateUpdateProjectPayload,
} from "../services/projects.validation.js";

const EXTENSION_TO_MIME: Record<string, string> = {
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".webp": "image/webp",
};

export class ProjectsController {
    constructor(
        private readonly projectsService: ProjectsService,
        private readonly uploadProvider: UploadProvider,
        private readonly uploadDiskDir: string,
        private readonly uploadMaxMb: number,
    ) {}

    async list(c: Context): Promise<Response> {
        const auth = this.requireAuth(c);
        const query = validateListProjectsQuery(c.req.query());
        return c.json(await this.projectsService.listProjects(auth.userId, query), 200);
    }

    async getOne(c: Context): Promise<Response> {
        const auth = this.requireAuth(c);
        const projectId = validateObjectIdParam(c.req.param("id"), "project id");
        return c.json(await this.projectsService.getProject(projectId, auth.userId), 200);
    }

    async create(c: Context): Promise<Response> {
        const auth = this.requireAuth(c);
        const payload = validateCreateProjectPayload(await c.req.json().catch(() => null));
        return c.json(await this.projectsService.createProject(auth.userId, payload), 201);
    }

    async update(c: Context): Promise<Response> {
        const auth = this.requireAuth(c);
        const projectId = validateObjectIdParam(c.req.param("id"), "project id");
        const payload = validateUpdateProjectPayload(await c.req.json().catch(() => null));
        return c.json(await this.projectsService.updateProject(auth.userId, projectId, payload), 200);
    }

    async publish(c: Context): Promise<Response> {
        const auth = this.requireAuth(c);
        const projectId = validateObjectIdParam(c.req.param("id"), "project id");
        return c.json(await this.projectsService.publishProject(auth.userId, projectId), 200);
    }

    async unpublish(c: Context): Promise<Response> {
        const auth = this.requireAuth(c);
        const projectId = validateObjectIdParam(c.req.param("id"), "project id");
        return c.json(await this.projectsService.unpublishProject(auth.userId, projectId), 200);
    }

    async archive(c: Context): Promise<Response> {
        const auth = this.requireAuth(c);
        const projectId = validateObjectIdParam(c.req.param("id"), "project id");
        return c.json(await this.projectsService.archiveProject(auth.userId, projectId), 200);
    }

    async uploadCover(c: Context): Promise<Response> {
        const auth = this.requireAuth(c);
        const projectId = validateObjectIdParam(c.req.param("id"), "project id");
        const formData = await c.req.formData().catch(() => null);
        const file = formData?.get("file");
        if (!(file instanceof File)) {
            throw new BadRequestError("Cover image is required as multipart field `file`.");
        }

        const validated = await validateImageUpload(file, { maxBytes: this.uploadMaxMb * 1024 * 1024 });
        const uploaded = await this.uploadProvider.upload({
            buffer: validated.buffer,
            mimeType: validated.mimeType,
            extension: validated.extension,
            scope: `projects/${projectId}`,
        });

        return c.json(
            await this.projectsService.updateCoverAsset(auth.userId, projectId, {
                fileKey: uploaded.fileKey,
                publicUrl: uploaded.publicUrl,
                mimeType: uploaded.mimeType,
                size: uploaded.size,
            }),
            200,
        );
    }

    async createJoinRequest(c: Context): Promise<Response> {
        const auth = this.requireAuth(c);
        const projectId = validateObjectIdParam(c.req.param("id"), "project id");
        const payload = validateCreateJoinRequestPayload(await c.req.json().catch(() => null));
        return c.json(await this.projectsService.createJoinRequest(projectId, auth.userId, payload), 201);
    }

    async listJoinRequests(c: Context): Promise<Response> {
        const auth = this.requireAuth(c);
        const projectId = validateObjectIdParam(c.req.param("id"), "project id");
        return c.json(await this.projectsService.listJoinRequests(projectId, auth.userId), 200);
    }

    async approveJoinRequest(c: Context): Promise<Response> {
        return this.decideJoinRequest(c, true);
    }

    async rejectJoinRequest(c: Context): Promise<Response> {
        return this.decideJoinRequest(c, false);
    }

    async listComments(c: Context): Promise<Response> {
        const auth = this.requireAuth(c);
        const projectId = validateObjectIdParam(c.req.param("id"), "project id");
        return c.json(await this.projectsService.listComments(projectId, auth.userId), 200);
    }

    async createComment(c: Context): Promise<Response> {
        const auth = this.requireAuth(c);
        const projectId = validateObjectIdParam(c.req.param("id"), "project id");
        const payload = validateCreateCommentPayload(await c.req.json().catch(() => null));
        return c.json(await this.projectsService.createComment(projectId, auth.userId, payload), 201);
    }

    async deleteComment(c: Context): Promise<Response> {
        const auth = this.requireAuth(c);
        const projectId = validateObjectIdParam(c.req.param("id"), "project id");
        const commentId = validateObjectIdParam(c.req.param("commentId"), "comment id");
        return c.json(await this.projectsService.deleteComment(projectId, commentId, auth.userId), 200);
    }

    async serveMedia(c: Context): Promise<Response> {
        const rawPath = decodeURIComponent(new URL(c.req.url).pathname);
        const marker = "/projects/media/";
        const markerIndex = rawPath.indexOf(marker);
        if (markerIndex < 0) {
            throw new NotFoundError("Media file not found.");
        }
        const fileKey = rawPath.slice(markerIndex + marker.length).replace(/^\/+/, "");
        if (!fileKey || fileKey.includes("..")) {
            throw new NotFoundError("Media file not found.");
        }

        const root = normalize(resolve(this.uploadDiskDir));
        const target = normalize(resolve(root, fileKey));
        if (!target.startsWith(root)) {
            throw new NotFoundError("Media file not found.");
        }

        const data = await readFile(target).catch(() => null);
        if (!data) {
            throw new NotFoundError("Media file not found.");
        }

        const contentType = EXTENSION_TO_MIME[extname(target).toLowerCase()] ?? "application/octet-stream";
        return new Response(data, { headers: { "content-type": contentType, "cache-control": "public, max-age=31536000, immutable" } });
    }

    private async decideJoinRequest(c: Context, approved: boolean): Promise<Response> {
        const auth = this.requireAuth(c);
        const projectId = validateObjectIdParam(c.req.param("id"), "project id");
        const requestId = validateObjectIdParam(c.req.param("requestId"), "request id");
        const payload = validateDecideJoinRequestPayload(await c.req.json().catch(() => null));
        return c.json(await this.projectsService.decideJoinRequest(projectId, requestId, auth.userId, approved, payload), 200);
    }

    async adminList(c: Context): Promise<Response> {
        this.requireAdmin(c);
        const limit = Number(c.req.query("limit") ?? "100");
        return c.json(await this.projectsService.adminListProjects(Number.isFinite(limit) ? limit : 100), 200);
    }

    async adminGet(c: Context): Promise<Response> {
        this.requireAdmin(c);
        const projectId = validateObjectIdParam(c.req.param("id"), "project id");
        return c.json(await this.projectsService.adminGetProject(projectId), 200);
    }

    async adminDelete(c: Context): Promise<Response> {
        this.requireAdmin(c);
        const projectId = validateObjectIdParam(c.req.param("id"), "project id");
        return c.json(await this.projectsService.adminDeleteProject(projectId), 200);
    }

    private requireAuth(c: Context) {
        const auth = getUserFromHeaders(c.req.raw.headers);
        if (!auth?.userId) {
            throw new UnauthorizedError("Missing auth context");
        }
        return auth;
    }

    private requireAdmin(c: Context) {
        const auth = this.requireAuth(c);
        if (!auth.isAdmin && !auth.roles.includes("admin")) {
            throw new UnauthorizedError("Admin role required");
        }
        return auth;
    }
}
