// Auth & user types for API responses and requests

export const AUTH_PROVIDERS = ["google", "github", "linkedin"] as const;
export type AuthProvider = (typeof AUTH_PROVIDERS)[number];

export interface UserDTO {
    id: string;
    email?: string;
    emailVerified: boolean;
    displayName: string;
    avatarUrl?: string;
    isPremium: boolean;
    roles: string[];
    provider: AuthProvider;
}

export interface SelfResponse {
    user: UserDTO;
}

export interface AuthRedirectResponse {
    redirectUrl: string;
}

export interface AuthErrorResponse {
    error: { code: string; message: string };
}

export interface VerificationStatusResponse {
    requiresEmailVerification: boolean;
    email?: string;
}

export interface OtpRequestResponse {
    ok: true;
    expiresInSeconds: number;
    cooldownSeconds: number;
}

export interface OtpVerifyResponse {
    ok: true;
    verified: boolean;
}

export const PORTFOLIO_TEMPLATE_IDS = ["atelier", "signal", "folio", "mono"] as const;
export type PortfolioTemplateId = (typeof PORTFOLIO_TEMPLATE_IDS)[number];

export const PORTFOLIO_BLOCK_TYPES = [
    "markdown",
    "socialLinks",
    "projectList",
    "experienceTimeline",
    "skills",
    "contactCta",
    "media",
    "customLink",
] as const;
export type PortfolioBlockType = (typeof PORTFOLIO_BLOCK_TYPES)[number];

export interface PortfolioBlockSource {
    kind: "manual" | "project" | "cv";
    refId?: string;
}

export interface PortfolioBlockGrid {
    column: number;
    row: number;
    columnSpan: number;
    rowSpan: number;
}

export interface PortfolioBlock {
    id: string;
    type: PortfolioBlockType;
    title?: string;
    grid: PortfolioBlockGrid;
    data: Record<string, unknown>;
    source?: PortfolioBlockSource;
}

export interface PortfolioTab {
    id: string;
    label: string;
    slug: string;
    blocks: PortfolioBlock[];
}

export interface PortfolioStyle {
    theme: "light" | "dark";
    accentColor: string;
    fontFamily: string;
    radius: "sharp" | "soft" | "round";
}

export interface PortfolioIdentity {
    displayName: string;
    eyebrowText: string;
    eyebrowPlacement: "above" | "below";
}

export interface PortfolioDocumentDTO {
    id: string;
    userId: string;
    slug: string;
    identity: PortfolioIdentity;
    templateId: PortfolioTemplateId;
    style: PortfolioStyle;
    tabs: PortfolioTab[];
    createdAt: string;
    updatedAt: string;
}

export interface PortfolioResponse {
    portfolio: PortfolioDocumentDTO | null;
}

export interface PublicPortfolioResponse {
    portfolio: PortfolioDocumentDTO;
}

export interface PortfolioSlugAvailabilityResponse {
    slug: string;
    available: boolean;
}

export interface PortfolioSlugRequest {
    slug: string;
}

export interface SavePortfolioRequest {
    slug: string;
    identity: PortfolioIdentity;
    templateId: PortfolioTemplateId;
    style: PortfolioStyle;
    tabs: PortfolioTab[];
}

export {
    PROJECT_STATUSES,
    PROJECT_DIFFICULTIES,
    PROJECT_WORK_MODES,
    PROJECT_MEMBERSHIP_ROLES,
    PROJECT_JOIN_REQUEST_STATUSES,
    PROJECT_COMMENT_STATUSES,
    type ProjectStatus,
    type ProjectDifficulty,
    type ProjectWorkMode,
    type ProjectMembershipRole,
    type ProjectJoinRequestStatus,
    type ProjectCommentStatus,
    type UploadedAssetDTO,
    type ProjectRoleRequirementDTO,
    type ProjectRoleRequirementInput,
    type ProjectMilestoneDTO,
    type ProjectMilestoneInput,
    type ProjectEngagementDTO,
    type ProjectMemberDTO,
    type ProjectSummaryDTO,
    type ProjectDTO,
    type ProjectCommentDTO,
    type ProjectCommentThreadDTO,
    type ProjectsListResponse,
    type ProjectResponse,
    type ProjectCommentsResponse,
    type ProjectJoinRequestsResponse,
    type ProjectJoinRequestDTO,
    type UpsertProjectRequest,
    type CreateProjectRequest,
    type UpdateProjectRequest,
    type CreateJoinRequestRequest,
    type DecideJoinRequestRequest,
    type CreateProjectCommentRequest,
} from "./projects.js";
