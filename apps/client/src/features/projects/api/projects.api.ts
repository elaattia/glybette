import type {
    CreateJoinRequestRequest,
    CreateProjectCommentRequest,
    CreateProjectRequest,
    DecideJoinRequestRequest,
    ProjectCommentDTO,
    ProjectCommentsResponse,
    ProjectJoinRequestDTO,
    ProjectJoinRequestsResponse,
    ProjectResponse,
    ProjectsListResponse,
    UpdateProjectRequest,
} from "@glybette/contracts";
import { apiRequest } from "@/lib/api";

export interface ProjectsListParams {
    q?: string;
    domain?: string;
    difficulty?: "beginner" | "intermediate" | "advanced";
    technology?: string;
    mine?: boolean;
    page?: number;
    pageSize?: number;
}

function toQueryString(params: ProjectsListParams): string {
    const query = new URLSearchParams();
    if (params.q) query.set("q", params.q);
    if (params.domain) query.set("domain", params.domain);
    if (params.difficulty) query.set("difficulty", params.difficulty);
    if (params.technology) query.set("technology", params.technology);
    if (params.mine !== undefined) query.set("mine", String(params.mine));
    if (params.page) query.set("page", String(params.page));
    if (params.pageSize) query.set("pageSize", String(params.pageSize));
    const result = query.toString();
    return result ? `?${result}` : "";
}

export const projectsApi = {
    list(params: ProjectsListParams = {}): Promise<ProjectsListResponse> {
        return apiRequest<ProjectsListResponse>(`/api/projects${toQueryString(params)}`);
    },

    getOne(projectId: string): Promise<ProjectResponse> {
        return apiRequest<ProjectResponse>(`/api/projects/${projectId}`);
    },

    create(payload: CreateProjectRequest): Promise<ProjectResponse> {
        return apiRequest<ProjectResponse>("/api/projects", {
            method: "POST",
            body: JSON.stringify(payload),
        });
    },

    update(projectId: string, payload: UpdateProjectRequest): Promise<ProjectResponse> {
        return apiRequest<ProjectResponse>(`/api/projects/${projectId}`, {
            method: "PATCH",
            body: JSON.stringify(payload),
        });
    },

    publish(projectId: string): Promise<ProjectResponse> {
        return apiRequest<ProjectResponse>(`/api/projects/${projectId}/publish`, { method: "POST" });
    },

    unpublish(projectId: string): Promise<ProjectResponse> {
        return apiRequest<ProjectResponse>(`/api/projects/${projectId}/unpublish`, { method: "POST" });
    },

    archive(projectId: string): Promise<ProjectResponse> {
        return apiRequest<ProjectResponse>(`/api/projects/${projectId}/archive`, { method: "POST" });
    },

    uploadCover(projectId: string, file: File): Promise<ProjectResponse> {
        const body = new FormData();
        body.set("file", file);
        return apiRequest<ProjectResponse>(`/api/projects/${projectId}/cover`, {
            method: "POST",
            body,
        });
    },

    createJoinRequest(projectId: string, payload: CreateJoinRequestRequest): Promise<{ request: ProjectJoinRequestDTO }> {
        return apiRequest<{ request: ProjectJoinRequestDTO }>(`/api/projects/${projectId}/join-requests`, {
            method: "POST",
            body: JSON.stringify(payload),
        });
    },

    listJoinRequests(projectId: string): Promise<ProjectJoinRequestsResponse> {
        return apiRequest<ProjectJoinRequestsResponse>(`/api/projects/${projectId}/join-requests`);
    },

    approveJoinRequest(
        projectId: string,
        requestId: string,
        payload: DecideJoinRequestRequest = {},
    ): Promise<{ request: ProjectJoinRequestDTO }> {
        return apiRequest<{ request: ProjectJoinRequestDTO }>(`/api/projects/${projectId}/join-requests/${requestId}/approve`, {
            method: "POST",
            body: JSON.stringify(payload),
        });
    },

    rejectJoinRequest(
        projectId: string,
        requestId: string,
        payload: DecideJoinRequestRequest = {},
    ): Promise<{ request: ProjectJoinRequestDTO }> {
        return apiRequest<{ request: ProjectJoinRequestDTO }>(`/api/projects/${projectId}/join-requests/${requestId}/reject`, {
            method: "POST",
            body: JSON.stringify(payload),
        });
    },

    listComments(projectId: string): Promise<ProjectCommentsResponse> {
        return apiRequest<ProjectCommentsResponse>(`/api/projects/${projectId}/comments`);
    },

    createComment(projectId: string, payload: CreateProjectCommentRequest): Promise<{ comment: ProjectCommentDTO }> {
        return apiRequest<{ comment: ProjectCommentDTO }>(`/api/projects/${projectId}/comments`, {
            method: "POST",
            body: JSON.stringify(payload),
        });
    },

    deleteComment(projectId: string, commentId: string): Promise<{ ok: true }> {
        return apiRequest<{ ok: true }>(`/api/projects/${projectId}/comments/${commentId}`, { method: "DELETE" });
    },
};
