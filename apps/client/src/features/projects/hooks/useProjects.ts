import type { CreateProjectRequest, UpdateProjectRequest } from "@glybette/contracts";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { projectsApi, type ProjectsListParams } from "../api/projects.api";

export const projectsQueryKeys = {
    list: (params: ProjectsListParams) => ["projects", "list", params] as const,
    detail: (projectId: string) => ["projects", "detail", projectId] as const,
    comments: (projectId: string) => ["projects", "comments", projectId] as const,
    joinRequests: (projectId: string) => ["projects", "joinRequests", projectId] as const,
};

export function useProjectsList(params: ProjectsListParams) {
    const auth = useAuth();
    return useQuery({
        queryKey: projectsQueryKeys.list(params),
        queryFn: () => projectsApi.list(params),
        enabled: auth.isAuthenticated,
        staleTime: 30_000,
    });
}

export function useProjectDetail(projectId: string) {
    const auth = useAuth();
    return useQuery({
        queryKey: projectsQueryKeys.detail(projectId),
        queryFn: () => projectsApi.getOne(projectId),
        enabled: auth.isAuthenticated && Boolean(projectId),
    });
}

export function useProjectComments(projectId: string) {
    const auth = useAuth();
    return useQuery({
        queryKey: projectsQueryKeys.comments(projectId),
        queryFn: () => projectsApi.listComments(projectId),
        enabled: auth.isAuthenticated && Boolean(projectId),
    });
}

export function useProjectJoinRequests(projectId: string, enabled: boolean) {
    const auth = useAuth();
    return useQuery({
        queryKey: projectsQueryKeys.joinRequests(projectId),
        queryFn: () => projectsApi.listJoinRequests(projectId),
        enabled: auth.isAuthenticated && Boolean(projectId) && enabled,
    });
}

export function useProjectsMutations(projectId?: string) {
    const queryClient = useQueryClient();

    const invalidateProject = async (id: string) => {
        await Promise.all([
            queryClient.invalidateQueries({ queryKey: ["projects", "list"] }),
            queryClient.invalidateQueries({ queryKey: projectsQueryKeys.detail(id) }),
            queryClient.invalidateQueries({ queryKey: projectsQueryKeys.comments(id) }),
            queryClient.invalidateQueries({ queryKey: projectsQueryKeys.joinRequests(id) }),
        ]);
    };

    const createProject = useMutation({
        mutationFn: (payload: CreateProjectRequest) => projectsApi.create(payload),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ["projects", "list"] });
        },
    });

    const updateProject = useMutation({
        mutationFn: ({ id, payload }: { id: string; payload: UpdateProjectRequest }) => projectsApi.update(id, payload),
        onSuccess: async (response, variables) => {
            queryClient.setQueryData(projectsQueryKeys.detail(variables.id), response);
            await queryClient.invalidateQueries({ queryKey: ["projects", "list"] });
        },
    });

    const publishProject = useMutation({
        mutationFn: (id: string) => projectsApi.publish(id),
        onSuccess: async (_response, id) => {
            await invalidateProject(id);
        },
    });

    const unpublishProject = useMutation({
        mutationFn: (id: string) => projectsApi.unpublish(id),
        onSuccess: async (_response, id) => {
            await invalidateProject(id);
        },
    });

    const archiveProject = useMutation({
        mutationFn: (id: string) => projectsApi.archive(id),
        onSuccess: async (_response, id) => {
            await invalidateProject(id);
        },
    });

    const uploadCover = useMutation({
        mutationFn: ({ id, file }: { id: string; file: File }) => projectsApi.uploadCover(id, file),
        onSuccess: async (_response, variables) => {
            await invalidateProject(variables.id);
        },
    });

    const createJoinRequest = useMutation({
        mutationFn: ({ id, message }: { id: string; message?: string }) => projectsApi.createJoinRequest(id, { message }),
        onSuccess: async (_response, variables) => {
            await invalidateProject(variables.id);
        },
    });

    const approveJoinRequest = useMutation({
        mutationFn: ({ id, requestId, reason }: { id: string; requestId: string; reason?: string }) =>
            projectsApi.approveJoinRequest(id, requestId, { reason }),
        onSuccess: async (_response, variables) => {
            await invalidateProject(variables.id);
        },
    });

    const rejectJoinRequest = useMutation({
        mutationFn: ({ id, requestId, reason }: { id: string; requestId: string; reason?: string }) =>
            projectsApi.rejectJoinRequest(id, requestId, { reason }),
        onSuccess: async (_response, variables) => {
            await invalidateProject(variables.id);
        },
    });

    const createComment = useMutation({
        mutationFn: ({ id, content, parentId }: { id: string; content: string; parentId?: string }) =>
            projectsApi.createComment(id, { content, parentId }),
        onSuccess: async (_response, variables) => {
            await invalidateProject(variables.id);
        },
    });

    const deleteComment = useMutation({
        mutationFn: ({ id, commentId }: { id: string; commentId: string }) => projectsApi.deleteComment(id, commentId),
        onSuccess: async (_response, variables) => {
            await invalidateProject(variables.id);
        },
    });

    return {
        createProject,
        updateProject,
        publishProject,
        unpublishProject,
        archiveProject,
        uploadCover,
        createJoinRequest,
        approveJoinRequest,
        rejectJoinRequest,
        createComment,
        deleteComment,
        currentProjectId: projectId,
    };
}
