import type {
    ProjectNotificationContextRequest,
    ProjectNotificationContextResponse,
    ResolveUsersResponse,
} from "@glybette/contracts";
import { internalRequestJson } from "@glybette/utils";
import type { NotificationsServiceEnv } from "../config/env.js";

export class ProjectsClient {
    constructor(
        private readonly baseUrl: string,
        private readonly internalSecret: string,
        private readonly timeoutMs: number,
    ) {}

    async getNotificationContext(
        input: ProjectNotificationContextRequest,
    ): Promise<ProjectNotificationContextResponse> {
        return internalRequestJson<ProjectNotificationContextResponse>(
            `${this.baseUrl}/internal/projects/notification-context`,
            {
                method: "POST",
                timeoutMs: this.timeoutMs,
                internalSecret: this.internalSecret,
                body: JSON.stringify(input),
            },
        );
    }
}

export class UsersClient {
    constructor(
        private readonly baseUrl: string,
        private readonly internalSecret: string,
        private readonly timeoutMs: number,
    ) {}

    async resolveDisplayNames(userIds: string[]): Promise<Map<string, string>> {
        const uniqueIds = [...new Set(userIds.map((id) => id.trim()).filter(Boolean))];
        if (uniqueIds.length === 0) {
            return new Map();
        }

        const response = await internalRequestJson<ResolveUsersResponse>(`${this.baseUrl}/users/resolve`, {
            method: "POST",
            timeoutMs: this.timeoutMs,
            internalSecret: this.internalSecret,
            body: JSON.stringify({ userIds: uniqueIds }),
        });

        return new Map(response.users.map((user) => [user.id, user.displayName]));
    }
}

export function createInteropClients(env: NotificationsServiceEnv) {
    const projectsBaseUrl = (env.PROJECTS_SERVICE_URL ?? `http://localhost:${env.PORT_PROJECTS_SERVICE}`).replace(
        /\/$/,
        "",
    );
    const usersBaseUrl = (env.USERS_SERVICE_URL ?? `http://localhost:${env.PORT_USERS_SERVICE}`).replace(/\/$/, "");

    return {
        projects: new ProjectsClient(projectsBaseUrl, env.INTERNAL_SERVICE_SECRET, env.INTEROP_SYNC_TIMEOUT_MS),
        users: new UsersClient(usersBaseUrl, env.INTERNAL_SERVICE_SECRET, env.INTEROP_SYNC_TIMEOUT_MS),
    };
}
