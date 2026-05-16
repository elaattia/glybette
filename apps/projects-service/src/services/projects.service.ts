import { randomUUID } from "node:crypto";
import mongoose from "mongoose";
import type {
    CreateJoinRequestRequest,
    CreateProjectCommentRequest,
    CreateProjectRequest,
    DecideJoinRequestRequest,
    ProjectCommentDTO,
    ProjectCommentStatus,
    ProjectCommentsResponse,
    ProjectDTO,
    ProjectJoinRequestDTO,
    ProjectJoinRequestsResponse,
    ProjectMembershipRole,
    ProjectResponse,
    ProjectStatus,
    ProjectSummaryDTO,
    ProjectsListResponse,
    ProjectUserSummaryDTO,
    UpdateProjectRequest,
    UploadedAssetDTO,
} from "@glybette/contracts";
import type { ProjectEventName } from "@glybette/messaging";
import type { UserProfileUpsertedEvent } from "@glybette/messaging";
import { BadRequestError, NotFoundError, ServiceUnavailableError, UnauthorizedError } from "@glybette/utils";
import type { ListProjectsQuery } from "./projects.validation.js";

type ProjectRoleNeedDocument = {
    id: string;
    title: string;
    quantity: number;
    skills: string[];
};

type ProjectMilestoneDocument = {
    id: string;
    title: string;
    description: string;
    status: "todo" | "in_progress" | "done";
};

type ProjectDocument = {
    _id: mongoose.Types.ObjectId;
    ownerId: string;
    title: string;
    shortDescription: string;
    description: string;
    domain: string;
    difficulty: "beginner" | "intermediate" | "advanced";
    technologies: string[];
    status: ProjectStatus;
    coverAsset?: UploadedAssetDTO;
    teamSizeTarget: number;
    engagement: {
        hoursPerWeek: number;
        workMode: "async" | "hybrid" | "live";
    };
    openRoles: ProjectRoleNeedDocument[];
    milestones: ProjectMilestoneDocument[];
    createdAt: Date;
    updatedAt: Date;
    publishedAt?: Date;
    archivedAt?: Date;
};

type MembershipDocument = {
    _id: mongoose.Types.ObjectId;
    projectId: mongoose.Types.ObjectId;
    userId: string;
    role: ProjectMembershipRole;
    createdAt: Date;
};

type JoinRequestDocument = {
    _id: mongoose.Types.ObjectId;
    projectId: mongoose.Types.ObjectId;
    userId: string;
    status: "pending" | "approved" | "rejected";
    message?: string;
    createdAt: Date;
    decidedAt?: Date;
    decidedByUserId?: string;
    decisionReason?: string;
};

type CommentDocument = {
    _id: mongoose.Types.ObjectId;
    projectId: mongoose.Types.ObjectId;
    authorId: string;
    parentId?: mongoose.Types.ObjectId;
    content: string;
    status: ProjectCommentStatus;
    createdAt: Date;
    updatedAt: Date;
    deletedAt?: Date;
};

type OptionalCountRow = { _id: mongoose.Types.ObjectId; pendingCount?: number; memberCount?: number; commentCount?: number };

type EventPublisher = (eventName: ProjectEventName, payload: Record<string, unknown>) => Promise<void>;
type UserResolver = (userIds: string[]) => Promise<ProjectUserSummaryDTO[]>;

type UserProfileSnapshotDocument = {
    _id: mongoose.Types.ObjectId;
    userId: string;
    displayName: string;
    avatarUrl?: string;
    isPremium: boolean;
    roles: string[];
    sourceUpdatedAt: Date;
    updatedAt: Date;
};

export class ProjectsService {
    constructor(
        private readonly publishEvent?: EventPublisher,
        private readonly resolveUsers?: UserResolver,
    ) {}

    private projectsCollection() {
        const db = mongoose.connection.db;
        if (!db) throw new ServiceUnavailableError("Projects database is not initialized");
        return db.collection<ProjectDocument>("projects");
    }

    private membershipsCollection() {
        const db = mongoose.connection.db;
        if (!db) throw new ServiceUnavailableError("Projects database is not initialized");
        return db.collection<MembershipDocument>("project_memberships");
    }

    private joinRequestsCollection() {
        const db = mongoose.connection.db;
        if (!db) throw new ServiceUnavailableError("Projects database is not initialized");
        return db.collection<JoinRequestDocument>("project_join_requests");
    }

    private commentsCollection() {
        const db = mongoose.connection.db;
        if (!db) throw new ServiceUnavailableError("Projects database is not initialized");
        return db.collection<CommentDocument>("project_comments");
    }

    private userProfilesCollection() {
        const db = mongoose.connection.db;
        if (!db) throw new ServiceUnavailableError("Projects database is not initialized");
        return db.collection<UserProfileSnapshotDocument>("project_user_profiles");
    }

    async ensureIndexes(): Promise<void> {
        await this.projectsCollection().createIndexes([
            { key: { ownerId: 1, updatedAt: -1 } },
            { key: { status: 1, updatedAt: -1 } },
            { key: { domain: 1, status: 1, updatedAt: -1 } },
            { key: { technologies: 1 } },
            { key: { title: "text", shortDescription: "text", description: "text" } },
        ]);

        await this.membershipsCollection().createIndexes([
            { key: { projectId: 1, userId: 1 }, unique: true },
            { key: { projectId: 1, role: 1 } },
            { key: { userId: 1, role: 1 } },
        ]);

        await this.joinRequestsCollection().createIndexes([
            { key: { projectId: 1, createdAt: -1 } },
            { key: { projectId: 1, userId: 1, status: 1 } },
            {
                key: { projectId: 1, userId: 1 },
                unique: true,
                partialFilterExpression: { status: "pending" },
                name: "uniq_pending_join_request_per_user_project",
            },
        ]);

        await this.commentsCollection().createIndexes([
            { key: { projectId: 1, parentId: 1, createdAt: -1 } },
            { key: { projectId: 1, status: 1, createdAt: -1 } },
            { key: { authorId: 1, createdAt: -1 } },
        ]);

        await this.userProfilesCollection().createIndexes([
            { key: { userId: 1 }, unique: true },
            { key: { updatedAt: -1 } },
        ]);
    }

    async applyUserProfileUpsertedEvent(event: UserProfileUpsertedEvent): Promise<void> {
        const sourceUpdatedAt = new Date(event.occurredAtIso);
        const profile = event.profile;

        await this.userProfilesCollection().updateOne(
            {
                userId: profile.userId,
                $or: [{ sourceUpdatedAt: { $exists: false } }, { sourceUpdatedAt: { $lte: sourceUpdatedAt } }],
            },
            {
                $set: {
                    displayName: profile.displayName,
                    avatarUrl: profile.avatarUrl,
                    isPremium: profile.isPremium,
                    roles: profile.roles,
                    sourceUpdatedAt,
                    updatedAt: new Date(),
                },
                $setOnInsert: {
                    _id: new mongoose.Types.ObjectId(),
                    userId: profile.userId,
                },
            },
            { upsert: true },
        );
    }

    async listProjects(userId: string, query: ListProjectsQuery): Promise<ProjectsListResponse> {
        const page = query.page ?? 1;
        const pageSize = query.pageSize ?? 12;
        const skip = (page - 1) * pageSize;

        const filter: Record<string, unknown> = {};
        if (query.mine) {
            filter.ownerId = userId;
            filter.status = { $ne: "archived" };
        } else {
            filter.status = "published";
        }
        if (query.domain) filter.domain = query.domain;
        if (query.difficulty) filter.difficulty = query.difficulty;
        if (query.technology) filter.technologies = query.technology;
        if (query.q) {
            filter.$text = { $search: query.q };
        }

        const [items, total] = await Promise.all([
            this.projectsCollection().find(filter).sort({ updatedAt: -1 }).skip(skip).limit(pageSize).toArray(),
            this.projectsCollection().countDocuments(filter),
        ]);

        const ids = items.map((item) => item._id);
        const [memberCounts, commentCounts, pendingCounts] = await Promise.all([
            this.aggregateCounts(this.membershipsCollection(), ids, "memberCount"),
            this.aggregateCounts(this.commentsCollection(), ids, "commentCount", { status: "active" }),
            this.aggregateCounts(this.joinRequestsCollection(), ids, "pendingCount", { status: "pending" }),
        ]);
        const ownerProfiles = await this.getUserSummariesByIds(items.map((item) => item.ownerId));

        return {
            items: items.map((item) =>
                this.toSummaryDto(item, {
                    memberCount: memberCounts.get(item._id.toString()) ?? 0,
                    commentCount: commentCounts.get(item._id.toString()) ?? 0,
                    pendingJoinRequestCount: pendingCounts.get(item._id.toString()) ?? 0,
                    owner: ownerProfiles.get(item.ownerId),
                }),
            ),
            page,
            pageSize,
            total,
        };
    }

    async getProject(projectId: string, viewerId: string): Promise<ProjectResponse> {
        const projectObjectId = new mongoose.Types.ObjectId(projectId);
        const project = await this.projectsCollection().findOne({ _id: projectObjectId });
        if (!project) {
            throw new NotFoundError("Project not found.");
        }

        const isOwner = project.ownerId === viewerId;
        if (!isOwner && project.status !== "published") {
            throw new NotFoundError("Project not found.");
        }

        const [members, viewerMembership, viewerJoinRequest, commentCount, pendingJoinCount] = await Promise.all([
            this.membershipsCollection().find({ projectId: projectObjectId }).sort({ createdAt: 1 }).toArray(),
            this.membershipsCollection().findOne({ projectId: projectObjectId, userId: viewerId }),
            this.joinRequestsCollection().findOne(
                { projectId: projectObjectId, userId: viewerId },
                { sort: { createdAt: -1 } },
            ),
            this.commentsCollection().countDocuments({ projectId: projectObjectId, status: "active" }),
            this.joinRequestsCollection().countDocuments({ projectId: projectObjectId, status: "pending" }),
        ]);
        const relatedUserIds = [project.ownerId, ...members.map((member) => member.userId)];
        if (viewerJoinRequest?.userId) {
            relatedUserIds.push(viewerJoinRequest.userId);
        }
        const users = await this.getUserSummariesByIds(relatedUserIds);

        return {
            project: this.toProjectDto(project, {
                memberCount: members.length,
                commentCount,
                pendingJoinRequestCount: pendingJoinCount,
                members: members.map((member) => ({
                    userId: member.userId,
                    role: member.role,
                    joinedAt: member.createdAt.toISOString(),
                    user: users.get(member.userId) ?? this.fallbackUserSummary(member.userId),
                })),
                viewerMembershipRole: viewerMembership?.role,
                viewerJoinRequestStatus: viewerJoinRequest?.status,
                owner: users.get(project.ownerId) ?? this.fallbackUserSummary(project.ownerId),
            }),
        };
    }

    async createProject(ownerId: string, payload: CreateProjectRequest): Promise<ProjectResponse> {
        const now = new Date();
        const projectObjectId = new mongoose.Types.ObjectId();
        const status: ProjectStatus = payload.publish ? "published" : "draft";

        const project: ProjectDocument = {
            _id: projectObjectId,
            ownerId,
            title: payload.title,
            shortDescription: payload.shortDescription,
            description: payload.description,
            domain: payload.domain,
            difficulty: payload.difficulty,
            technologies: dedupe(payload.technologies),
            status,
            teamSizeTarget: payload.teamSizeTarget,
            engagement: payload.engagement,
            openRoles: payload.openRoles.map((role) => ({ ...role, id: role.id || randomUUID(), skills: dedupe(role.skills) })),
            milestones: payload.milestones.map((milestone) => ({ ...milestone, id: milestone.id || randomUUID() })),
            createdAt: now,
            updatedAt: now,
            publishedAt: status === "published" ? now : undefined,
            archivedAt: undefined,
        };

        await this.projectsCollection().insertOne(project);
        await this.membershipsCollection().insertOne({
            _id: new mongoose.Types.ObjectId(),
            projectId: projectObjectId,
            userId: ownerId,
            role: "owner",
            createdAt: now,
        });

        return {
            project: this.toProjectDto(project, {
                members: [
                    {
                        userId: ownerId,
                        role: "owner",
                        joinedAt: now.toISOString(),
                        user: this.fallbackUserSummary(ownerId),
                    },
                ],
                memberCount: 1,
                commentCount: 0,
                pendingJoinRequestCount: 0,
                viewerMembershipRole: "owner",
                owner: this.fallbackUserSummary(ownerId),
            }),
        };
    }

    async updateProject(ownerId: string, projectId: string, payload: UpdateProjectRequest): Promise<ProjectResponse> {
        const projectObjectId = new mongoose.Types.ObjectId(projectId);
        const existing = await this.projectsCollection().findOne({ _id: projectObjectId });
        if (!existing) {
            throw new NotFoundError("Project not found.");
        }
        if (existing.ownerId !== ownerId) {
            throw new UnauthorizedError("Only project owner can edit this project.");
        }
        if (existing.status === "archived") {
            throw new BadRequestError("Archived projects cannot be edited.");
        }

        const now = new Date();
        const patch: Partial<ProjectDocument> & { updatedAt: Date } = { updatedAt: now };

        if (payload.title !== undefined) patch.title = payload.title;
        if (payload.shortDescription !== undefined) patch.shortDescription = payload.shortDescription;
        if (payload.description !== undefined) patch.description = payload.description;
        if (payload.domain !== undefined) patch.domain = payload.domain;
        if (payload.difficulty !== undefined) patch.difficulty = payload.difficulty;
        if (payload.technologies !== undefined) patch.technologies = dedupe(payload.technologies);
        if (payload.teamSizeTarget !== undefined) patch.teamSizeTarget = payload.teamSizeTarget;
        if (payload.engagement !== undefined) patch.engagement = payload.engagement;
        if (payload.openRoles !== undefined) {
            patch.openRoles = payload.openRoles.map((role) => ({
                ...role,
                id: role.id || randomUUID(),
                skills: dedupe(role.skills),
            }));
        }
        if (payload.milestones !== undefined) {
            patch.milestones = payload.milestones.map((milestone) => ({
                ...milestone,
                id: milestone.id || randomUUID(),
            }));
        }
        if (payload.publish !== undefined) {
            patch.status = payload.publish ? "published" : "draft";
            patch.publishedAt = payload.publish ? existing.publishedAt ?? now : undefined;
        }

        await this.projectsCollection().updateOne(
            { _id: projectObjectId },
            {
                $set: patch,
            },
        );

        return this.getProject(projectId, ownerId);
    }

    async publishProject(ownerId: string, projectId: string): Promise<ProjectResponse> {
        return this.updateProject(ownerId, projectId, { publish: true });
    }

    async unpublishProject(ownerId: string, projectId: string): Promise<ProjectResponse> {
        return this.updateProject(ownerId, projectId, { publish: false });
    }

    async archiveProject(ownerId: string, projectId: string): Promise<ProjectResponse> {
        const projectObjectId = new mongoose.Types.ObjectId(projectId);
        const project = await this.projectsCollection().findOne({ _id: projectObjectId });
        if (!project) throw new NotFoundError("Project not found.");
        if (project.ownerId !== ownerId) throw new UnauthorizedError("Only project owner can archive this project.");
        if (project.status === "archived") return this.getProject(projectId, ownerId);

        await this.projectsCollection().updateOne(
            { _id: projectObjectId },
            {
                $set: { status: "archived", archivedAt: new Date(), updatedAt: new Date() },
            },
        );

        return this.getProject(projectId, ownerId);
    }

    async updateCoverAsset(ownerId: string, projectId: string, asset: UploadedAssetDTO): Promise<ProjectResponse> {
        await this.ensureOwnerAccess(projectId, ownerId);
        await this.projectsCollection().updateOne(
            { _id: new mongoose.Types.ObjectId(projectId) },
            { $set: { coverAsset: asset, updatedAt: new Date() } },
        );
        return this.getProject(projectId, ownerId);
    }

    async createJoinRequest(
        projectId: string,
        userId: string,
        payload: CreateJoinRequestRequest,
    ): Promise<{ request: ProjectJoinRequestDTO }> {
        const projectObjectId = new mongoose.Types.ObjectId(projectId);
        const project = await this.projectsCollection().findOne({ _id: projectObjectId });
        if (!project || project.status !== "published") {
            throw new NotFoundError("Project not found.");
        }
        if (project.ownerId === userId) {
            throw new BadRequestError("Project owner is already part of the project.");
        }

        const existingMembership = await this.membershipsCollection().findOne({ projectId: projectObjectId, userId });
        if (existingMembership) {
            throw new BadRequestError("You are already a member of this project.");
        }

        const pending = await this.joinRequestsCollection().findOne({ projectId: projectObjectId, userId, status: "pending" });
        if (pending) {
            throw new BadRequestError("You already have a pending request for this project.");
        }

        const now = new Date();
        const requestDoc: JoinRequestDocument = {
            _id: new mongoose.Types.ObjectId(),
            projectId: projectObjectId,
            userId,
            status: "pending",
            message: payload.message?.trim() || undefined,
            createdAt: now,
        };

        await this.joinRequestsCollection().insertOne(requestDoc);
        await this.emit("join_request_created", {
            projectId,
            requestId: requestDoc._id.toString(),
            ownerId: project.ownerId,
            requesterId: userId,
            createdAt: now.toISOString(),
        });

        return { request: this.toJoinRequestDto(requestDoc) };
    }

    async listJoinRequests(projectId: string, ownerId: string): Promise<ProjectJoinRequestsResponse> {
        await this.ensureOwnerAccess(projectId, ownerId);
        const projectObjectId = new mongoose.Types.ObjectId(projectId);
        const requests = await this.joinRequestsCollection().find({ projectId: projectObjectId }).sort({ createdAt: -1 }).toArray();
        const users = await this.getUserSummariesByIds(
            requests.flatMap((request) => [request.userId, request.decidedByUserId].filter(Boolean) as string[]),
        );
        return {
            requests: requests.map((request) => this.toJoinRequestDto(request, users)),
        };
    }

    async decideJoinRequest(
        projectId: string,
        requestId: string,
        ownerId: string,
        approved: boolean,
        payload: DecideJoinRequestRequest,
    ): Promise<{ request: ProjectJoinRequestDTO }> {
        const projectObjectId = new mongoose.Types.ObjectId(projectId);
        const project = await this.projectsCollection().findOne({ _id: projectObjectId });
        if (!project) throw new NotFoundError("Project not found.");
        if (project.ownerId !== ownerId) throw new UnauthorizedError("Only project owner can decide join requests.");

        const requestObjectId = new mongoose.Types.ObjectId(requestId);
        const request = await this.joinRequestsCollection().findOne({ _id: requestObjectId, projectId: projectObjectId });
        if (!request) throw new NotFoundError("Join request not found.");
        if (request.status !== "pending") throw new BadRequestError("Join request has already been decided.");

        const now = new Date();
        const status = approved ? "approved" : "rejected";

        await this.joinRequestsCollection().updateOne(
            { _id: requestObjectId },
            {
                $set: {
                    status,
                    decidedAt: now,
                    decidedByUserId: ownerId,
                    decisionReason: payload.reason?.trim() || undefined,
                },
            },
        );

        if (approved) {
            await this.membershipsCollection().updateOne(
                { projectId: projectObjectId, userId: request.userId },
                {
                    $setOnInsert: {
                        _id: new mongoose.Types.ObjectId(),
                        createdAt: now,
                    },
                    $set: {
                        role: "member",
                    },
                },
                { upsert: true },
            );
        }

        await this.emit(approved ? "join_request_approved" : "join_request_rejected", {
            projectId,
            requestId,
            ownerId,
            requesterId: request.userId,
            decidedAt: now.toISOString(),
            reason: payload.reason,
        });

        const updated = await this.joinRequestsCollection().findOne({ _id: requestObjectId });
        if (!updated) throw new NotFoundError("Join request not found after update.");
        const users = await this.getUserSummariesByIds([updated.userId, updated.decidedByUserId].filter(Boolean) as string[]);
        return { request: this.toJoinRequestDto(updated, users) };
    }

    async listComments(projectId: string, viewerId: string): Promise<ProjectCommentsResponse> {
        await this.assertProjectReadable(projectId, viewerId);
        const projectObjectId = new mongoose.Types.ObjectId(projectId);
        const comments = await this.commentsCollection().find({ projectId: projectObjectId }).sort({ createdAt: 1 }).toArray();
        const users = await this.getUserSummariesByIds(comments.map((comment) => comment.authorId));

        const topLevel: ProjectCommentDTO[] = [];
        const repliesByParent = new Map<string, ProjectCommentDTO[]>();

        for (const row of comments) {
            const dto = this.toCommentDto(row, users);
            if (!row.parentId) {
                topLevel.push(dto);
                continue;
            }
            const key = row.parentId.toString();
            const list = repliesByParent.get(key) ?? [];
            list.push(dto);
            repliesByParent.set(key, list);
        }

        return {
            threads: topLevel.map((comment) => ({
                comment,
                replies: repliesByParent.get(comment.id) ?? [],
            })),
            totalTopLevel: topLevel.filter((comment) => comment.status === "active").length,
        };
    }

    async createComment(
        projectId: string,
        authorId: string,
        payload: CreateProjectCommentRequest,
    ): Promise<{ comment: ProjectCommentDTO }> {
        await this.assertProjectReadable(projectId, authorId);
        const projectObjectId = new mongoose.Types.ObjectId(projectId);
        const now = new Date();
        let parentObjectId: mongoose.Types.ObjectId | undefined;

        if (payload.parentId) {
            parentObjectId = new mongoose.Types.ObjectId(payload.parentId);
            const parent = await this.commentsCollection().findOne({ _id: parentObjectId, projectId: projectObjectId });
            if (!parent) {
                throw new NotFoundError("Parent comment not found.");
            }
            if (parent.parentId) {
                throw new BadRequestError("Replies can only target top-level comments.");
            }
            if (parent.status !== "active") {
                throw new BadRequestError("Cannot reply to a deleted comment.");
            }
        }

        const comment: CommentDocument = {
            _id: new mongoose.Types.ObjectId(),
            projectId: projectObjectId,
            authorId,
            parentId: parentObjectId,
            content: payload.content.trim(),
            status: "active",
            createdAt: now,
            updatedAt: now,
        };
        await this.commentsCollection().insertOne(comment);

        await this.emit("project_comment_created", {
            projectId,
            commentId: comment._id.toString(),
            authorId,
            parentId: comment.parentId?.toString(),
            createdAt: now.toISOString(),
        });

        const users = await this.getUserSummariesByIds([authorId]);
        return { comment: this.toCommentDto(comment, users) };
    }

    async deleteComment(projectId: string, commentId: string, actorUserId: string): Promise<{ ok: true }> {
        const project = await this.assertProjectReadable(projectId, actorUserId);
        const commentObjectId = new mongoose.Types.ObjectId(commentId);
        const projectObjectId = new mongoose.Types.ObjectId(projectId);
        const comment = await this.commentsCollection().findOne({ _id: commentObjectId, projectId: projectObjectId });
        if (!comment) throw new NotFoundError("Comment not found.");
        if (comment.status === "deleted") return { ok: true };

        const canDelete = comment.authorId === actorUserId || project.ownerId === actorUserId;
        if (!canDelete) {
            throw new UnauthorizedError("Only comment author or project owner can delete this comment.");
        }

        await this.commentsCollection().updateOne(
            { _id: commentObjectId },
            {
                $set: {
                    status: "deleted",
                    content: "[deleted]",
                    updatedAt: new Date(),
                    deletedAt: new Date(),
                },
            },
        );

        return { ok: true };
    }

    private async ensureOwnerAccess(projectId: string, ownerId: string): Promise<ProjectDocument> {
        const project = await this.projectsCollection().findOne({ _id: new mongoose.Types.ObjectId(projectId) });
        if (!project) {
            throw new NotFoundError("Project not found.");
        }
        if (project.ownerId !== ownerId) {
            throw new UnauthorizedError("Only project owner can perform this action.");
        }
        return project;
    }

    private async assertProjectReadable(projectId: string, viewerId: string): Promise<ProjectDocument> {
        const project = await this.projectsCollection().findOne({ _id: new mongoose.Types.ObjectId(projectId) });
        if (!project) {
            throw new NotFoundError("Project not found.");
        }
        if (project.status !== "published" && project.ownerId !== viewerId) {
            throw new NotFoundError("Project not found.");
        }
        return project;
    }

    private async aggregateCounts(
        collection: {
            aggregate: (pipeline: Record<string, unknown>[]) => { toArray: () => Promise<OptionalCountRow[]> };
        },
        projectIds: mongoose.Types.ObjectId[],
        fieldName: keyof OptionalCountRow,
        extraMatch: Record<string, unknown> = {},
    ): Promise<Map<string, number>> {
        if (projectIds.length === 0) {
            return new Map();
        }

        const rows = await collection
            .aggregate([
                { $match: { projectId: { $in: projectIds }, ...extraMatch } },
                { $group: { _id: "$projectId", [fieldName]: { $sum: 1 } } },
            ])
            .toArray();

        const map = new Map<string, number>();
        for (const row of rows) {
            const count = Number(row[fieldName] ?? 0);
            map.set(row._id.toString(), count);
        }
        return map;
    }

    private toSummaryDto(
        doc: ProjectDocument,
        counts: {
            memberCount: number;
            commentCount: number;
            pendingJoinRequestCount: number;
            owner?: ProjectUserSummaryDTO;
        },
    ): ProjectSummaryDTO {
        return {
            id: doc._id.toString(),
            ownerId: doc.ownerId,
            owner: counts.owner ?? this.fallbackUserSummary(doc.ownerId),
            title: doc.title,
            shortDescription: doc.shortDescription,
            domain: doc.domain,
            difficulty: doc.difficulty,
            technologies: doc.technologies,
            status: doc.status,
            coverAsset: doc.coverAsset,
            teamSizeTarget: doc.teamSizeTarget,
            engagement: doc.engagement,
            openRoles: doc.openRoles,
            memberCount: counts.memberCount,
            commentCount: counts.commentCount,
            pendingJoinRequestCount: counts.pendingJoinRequestCount,
            createdAt: doc.createdAt.toISOString(),
            updatedAt: doc.updatedAt.toISOString(),
            publishedAt: doc.publishedAt?.toISOString(),
        };
    }

    private toProjectDto(
        doc: ProjectDocument,
        extras: {
            memberCount: number;
            commentCount: number;
            pendingJoinRequestCount: number;
            members: { userId: string; role: ProjectMembershipRole; joinedAt: string; user?: ProjectUserSummaryDTO }[];
            owner?: ProjectUserSummaryDTO;
            viewerMembershipRole?: ProjectMembershipRole;
            viewerJoinRequestStatus?: "pending" | "approved" | "rejected";
        },
    ): ProjectDTO {
        return {
            ...this.toSummaryDto(doc, extras),
            description: doc.description,
            milestones: doc.milestones,
            members: extras.members,
            viewerMembershipRole: extras.viewerMembershipRole,
            viewerJoinRequestStatus: extras.viewerJoinRequestStatus,
        };
    }

    private toJoinRequestDto(
        request: JoinRequestDocument,
        users: Map<string, ProjectUserSummaryDTO> = new Map(),
    ): ProjectJoinRequestDTO {
        return {
            id: request._id.toString(),
            projectId: request.projectId.toString(),
            userId: request.userId,
            user: users.get(request.userId) ?? this.fallbackUserSummary(request.userId),
            status: request.status,
            message: request.message,
            createdAt: request.createdAt.toISOString(),
            decidedAt: request.decidedAt?.toISOString(),
            decidedByUserId: request.decidedByUserId,
            decidedByUser: request.decidedByUserId
                ? users.get(request.decidedByUserId) ?? this.fallbackUserSummary(request.decidedByUserId)
                : undefined,
            decisionReason: request.decisionReason,
        };
    }

    private toCommentDto(comment: CommentDocument, users: Map<string, ProjectUserSummaryDTO> = new Map()): ProjectCommentDTO {
        return {
            id: comment._id.toString(),
            projectId: comment.projectId.toString(),
            authorId: comment.authorId,
            author: users.get(comment.authorId) ?? this.fallbackUserSummary(comment.authorId),
            parentId: comment.parentId?.toString(),
            content: comment.content,
            status: comment.status,
            createdAt: comment.createdAt.toISOString(),
            updatedAt: comment.updatedAt.toISOString(),
        };
    }

    private async getUserSummariesByIds(userIds: string[]): Promise<Map<string, ProjectUserSummaryDTO>> {
        const ids = [...new Set(userIds.map((id) => id?.trim()).filter(Boolean) as string[])];
        if (ids.length === 0) {
            return new Map();
        }

        const existing = await this.userProfilesCollection().find({ userId: { $in: ids } }).toArray();
        const result = new Map<string, ProjectUserSummaryDTO>();
        for (const profile of existing) {
            result.set(profile.userId, {
                id: profile.userId,
                displayName: profile.displayName,
                avatarUrl: profile.avatarUrl,
                isPremium: profile.isPremium,
                roles: profile.roles,
            });
        }

        const missingIds = ids.filter((id) => !result.has(id));
        if (missingIds.length > 0 && this.resolveUsers) {
            const resolvedUsers = await this.resolveUsers(missingIds).catch(() => []);
            if (resolvedUsers.length > 0) {
                await Promise.all(
                    resolvedUsers.map((user) =>
                        this.userProfilesCollection().updateOne(
                            { userId: user.id },
                            {
                                $set: {
                                    displayName: user.displayName,
                                    avatarUrl: user.avatarUrl,
                                    isPremium: user.isPremium,
                                    roles: user.roles,
                                    updatedAt: new Date(),
                                },
                                $setOnInsert: {
                                    _id: new mongoose.Types.ObjectId(),
                                    userId: user.id,
                                    sourceUpdatedAt: new Date(),
                                },
                            },
                            { upsert: true },
                        ),
                    ),
                );
                for (const user of resolvedUsers) {
                    result.set(user.id, user);
                }
            }
        }

        return result;
    }

    private fallbackUserSummary(userId: string): ProjectUserSummaryDTO {
        return {
            id: userId,
            displayName: "User",
            avatarUrl: undefined,
            isPremium: false,
            roles: ["user"],
        };
    }

    private async emit(eventName: ProjectEventName, payload: Record<string, unknown>): Promise<void> {
        if (!this.publishEvent) return;
        await this.publishEvent(eventName, payload);
    }
}

function dedupe(values: string[]): string[] {
    return [...new Set(values.map((value) => value.trim()).filter(Boolean))];
}
