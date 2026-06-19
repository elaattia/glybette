// Auth & user types for API responses and requests

export const AUTH_PROVIDERS = ["google", "github", "linkedin", "email"] as const;
export type AuthProvider = (typeof AUTH_PROVIDERS)[number];
export const BASE_ROLES = ["student", "enterprise"] as const;
export type BaseRole = (typeof BASE_ROLES)[number];
export const ACCOUNT_STATUSES = ["active", "banned"] as const;
export type AccountStatus = (typeof ACCOUNT_STATUSES)[number];

export interface UserDTO {
    id: string;
    email?: string;
    emailVerified: boolean;
    firstName?: string;
    lastName?: string;
    displayName: string;
    avatarUrl?: string;
    isPremium: boolean;
    baseRole: BaseRole;
    isAdmin: boolean;
    accountStatus: AccountStatus;
    roles: string[];
    provider: AuthProvider;
    hasPassword: boolean;
    connectedProviders: AuthProvider[];
    companyName?: string;
}

export interface SelfResponse {
    user: UserDTO;
}

export interface PublicUserSummaryDTO {
    id: string;
    displayName: string;
    avatarUrl?: string;
    isPremium: boolean;
    baseRole: BaseRole;
    isAdmin: boolean;
    accountStatus: AccountStatus;
    roles: string[];
}

export interface AdminUsersListResponse {
    users: UserDTO[];
}

export type {
    AdminOverviewStats,
    DailyCountPoint,
    UsersAdminOverviewStatsResponse,
    ProjectsAdminOverviewStatsResponse,
    ContentAdminOverviewStatsResponse,
    ScrapingAdminStatsResponse,
} from "./admin-overview.js";

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

export interface UpdateOwnProfileRequest {
    profile: {
        phone?: string;
        location?: string;
        country?: string;
        university?: string;
        degree?: string;
        specialization?: string;
        graduationYear?: string;
        journey?: string;
        opportunities?: string[];
        domain?: string;
        companyName?: string;
    };
}

export interface OwnProfileResponse {
    profile: {
        phone?: string;
        location?: string;
        country?: string;
        university?: string;
        degree?: string;
        specialization?: string;
        graduationYear?: string;
        journey?: string;
        opportunities?: string[];
        domain?: string;
        companyName?: string;
    };
}

export interface UpdateOwnAccountRequest {
    firstName: string;
    lastName: string;
    email: string;
}

export interface OwnAccountResponse {
    user: UserDTO;
    requiresEmailVerification: boolean;
}

export interface ChangeOwnPasswordRequest {
    currentPassword: string;
    newPassword: string;
}

export interface DeleteOwnAccountRequest {
    confirmText: string;
    currentPassword?: string;
}

export interface ResolveUsersRequest {
    userIds: string[];
}

export interface ResolveUsersResponse {
    users: PublicUserSummaryDTO[];
}

export interface CompleteOnboardingRequest {
    role: "student" | "enterprise";
    companyName?: string;
}

export interface CompleteOnboardingResponse {
    ok: true;
    baseRole: BaseRole;
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

export interface AdminPortfolioDocumentDTO extends PortfolioDocumentDTO {
    owner?: PublicUserSummaryDTO;
}

export interface PortfolioResponse {
    portfolio: PortfolioDocumentDTO | null;
}

export interface PublicPortfolioResponse {
    portfolio: PortfolioDocumentDTO;
}

export interface AdminPortfolioListResponse {
    portfolios: AdminPortfolioDocumentDTO[];
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

export interface AdminCvSummaryDTO {
    _id: string;
    userId: string;
    owner?: PublicUserSummaryDTO;
    title: string;
    template: string;
    sections: unknown[];
    atsScore?: number;
    pdfUrl?: string;
    shareToken?: string;
    isPublic: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface AdminCvListResponse {
    cvs: AdminCvSummaryDTO[];
}

export {
    PROJECT_STATUSES,
    PROJECT_DIFFICULTIES,
    PROJECT_WORK_MODES,
    PROJECT_DOMAINS,
    PROJECT_MEMBERSHIP_ROLES,
    PROJECT_JOIN_REQUEST_STATUSES,
    PROJECT_COMMENT_STATUSES,
    type ProjectStatus,
    type ProjectDifficulty,
    type ProjectWorkMode,
    type ProjectDomain,
    type ProjectMembershipRole,
    type ProjectJoinRequestStatus,
    type ProjectCommentStatus,
    type UploadedAssetDTO,
    type ProjectUserSummaryDTO,
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

// Application/Candidature types
export const APPLICATION_STATUSES = ["pending", "viewed", "accepted", "rejected"] as const;
export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];

export interface OffreDTO {
    _id: string;
    titre: string;
    entreprise?: string;
    description?: string;
    competences: string[];
    localisation?: string;
    salaire?: string;
    type_contrat?: string;
    type_offre: string;
    domaine?: string;
    source_site: string;
    date_publication?: string;
    date_scraped: string;
}

export interface ApplicationDTO {
    _id: string;
    userId: string;
    offreId: string;
    status: ApplicationStatus;
    appliedAt: string;
    coverLetter: string;
    resumeUrl?: string;
    coverLetterUrl?: string;
    recruiterNotes?: string;
    rating?: number;
    reviewedAt?: string;
    reviewedBy?: string;
}

export interface ApplicationWithOffreDTO extends ApplicationDTO {
    offre: OffreDTO;
}

export interface SubmitApplicationRequest {
    offreId: string;
    coverLetter: string;
    resumeUrl?: string;
}

export interface UpdateApplicationStatusRequest {
    status: ApplicationStatus;
    recruiterNotes?: string;
    rating?: number;
}

export interface ApplicationsResponse {
    applications: ApplicationDTO[];
}

export interface ApplicationsWithOffreResponse {
    applications: ApplicationWithOffreDTO[];
}

export interface EnterpriseApplicationsResponse {
    applications: ApplicationWithOffreDTO[];
    stats: Record<string, Record<string, number>>;
}

export {
    NOTIFICATION_TYPES,
    type NotificationType,
    type NotificationDTO,
    type NotificationsListResponse,
    type NotificationsUnreadCountResponse,
    type MarkNotificationReadResponse,
    type MarkAllNotificationsReadResponse,
    type ProjectNotificationContextRequest,
    type ProjectNotificationContextResponse,
} from "./notifications.js";

