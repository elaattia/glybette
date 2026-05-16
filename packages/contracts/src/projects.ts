export const PROJECT_STATUSES = ["draft", "published", "archived"] as const;
export type ProjectStatus = (typeof PROJECT_STATUSES)[number];

export const PROJECT_DIFFICULTIES = ["beginner", "intermediate", "advanced"] as const;
export type ProjectDifficulty = (typeof PROJECT_DIFFICULTIES)[number];

export const PROJECT_WORK_MODES = ["async", "hybrid", "live"] as const;
export type ProjectWorkMode = (typeof PROJECT_WORK_MODES)[number];

export const PROJECT_MEMBERSHIP_ROLES = ["owner", "member"] as const;
export type ProjectMembershipRole = (typeof PROJECT_MEMBERSHIP_ROLES)[number];

export const PROJECT_JOIN_REQUEST_STATUSES = ["pending", "approved", "rejected"] as const;
export type ProjectJoinRequestStatus = (typeof PROJECT_JOIN_REQUEST_STATUSES)[number];

export const PROJECT_COMMENT_STATUSES = ["active", "deleted"] as const;
export type ProjectCommentStatus = (typeof PROJECT_COMMENT_STATUSES)[number];

export interface UploadedAssetDTO {
    fileKey: string;
    publicUrl: string;
    mimeType: string;
    size: number;
}

export interface ProjectRoleRequirementDTO {
    id: string;
    title: string;
    quantity: number;
    skills: string[];
}

export interface ProjectRoleRequirementInput {
    id?: string;
    title: string;
    quantity: number;
    skills: string[];
}

export interface ProjectMilestoneDTO {
    id: string;
    title: string;
    description: string;
    status: "todo" | "in_progress" | "done";
}

export interface ProjectMilestoneInput {
    id?: string;
    title: string;
    description: string;
    status: "todo" | "in_progress" | "done";
}

export interface ProjectEngagementDTO {
    hoursPerWeek: number;
    workMode: ProjectWorkMode;
}

export interface ProjectMemberDTO {
    userId: string;
    role: ProjectMembershipRole;
    joinedAt: string;
}

export interface ProjectSummaryDTO {
    id: string;
    ownerId: string;
    title: string;
    shortDescription: string;
    domain: string;
    difficulty: ProjectDifficulty;
    technologies: string[];
    status: ProjectStatus;
    coverAsset?: UploadedAssetDTO;
    teamSizeTarget: number;
    engagement: ProjectEngagementDTO;
    openRoles: ProjectRoleRequirementDTO[];
    memberCount: number;
    commentCount: number;
    pendingJoinRequestCount: number;
    createdAt: string;
    updatedAt: string;
    publishedAt?: string;
}

export interface ProjectDTO extends ProjectSummaryDTO {
    description: string;
    milestones: ProjectMilestoneDTO[];
    members: ProjectMemberDTO[];
    viewerMembershipRole?: ProjectMembershipRole;
    viewerJoinRequestStatus?: ProjectJoinRequestStatus;
}

export interface ProjectCommentDTO {
    id: string;
    projectId: string;
    authorId: string;
    parentId?: string;
    content: string;
    status: ProjectCommentStatus;
    createdAt: string;
    updatedAt: string;
}

export interface ProjectCommentThreadDTO {
    comment: ProjectCommentDTO;
    replies: ProjectCommentDTO[];
}

export interface ProjectsListResponse {
    items: ProjectSummaryDTO[];
    page: number;
    pageSize: number;
    total: number;
}

export interface ProjectResponse {
    project: ProjectDTO;
}

export interface ProjectCommentsResponse {
    threads: ProjectCommentThreadDTO[];
    totalTopLevel: number;
}

export interface ProjectJoinRequestsResponse {
    requests: ProjectJoinRequestDTO[];
}

export interface ProjectJoinRequestDTO {
    id: string;
    projectId: string;
    userId: string;
    status: ProjectJoinRequestStatus;
    message?: string;
    createdAt: string;
    decidedAt?: string;
    decidedByUserId?: string;
    decisionReason?: string;
}

export interface UpsertProjectRequest {
    title: string;
    shortDescription: string;
    description: string;
    domain: string;
    difficulty: ProjectDifficulty;
    technologies: string[];
    teamSizeTarget: number;
    engagement: ProjectEngagementDTO;
    openRoles: ProjectRoleRequirementInput[];
    milestones: ProjectMilestoneInput[];
}

export interface CreateProjectRequest extends UpsertProjectRequest {
    publish?: boolean;
}

export interface UpdateProjectRequest extends Partial<UpsertProjectRequest> {
    publish?: boolean;
}

export interface CreateJoinRequestRequest {
    message?: string;
}

export interface DecideJoinRequestRequest {
    reason?: string;
}

export interface CreateProjectCommentRequest {
    content: string;
    parentId?: string;
}
