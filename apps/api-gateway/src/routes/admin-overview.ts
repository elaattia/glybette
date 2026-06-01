import { Hono } from "hono";
import {
    AUTH_HEADER_ACCOUNT_STATUS,
    AUTH_HEADER_BASE_ROLE,
    AUTH_HEADER_IS_ADMIN,
    AUTH_HEADER_ROLES,
    AUTH_HEADER_USER_ID,
    countLastDays,
    internalRequestJson,
} from "@glybette/utils";
import type {
    AdminOverviewStats,
    ContentAdminOverviewStatsResponse,
    ProjectsAdminOverviewStatsResponse,
    ScrapingAdminStatsResponse,
    UsersAdminOverviewStatsResponse,
} from "@glybette/contracts";
import { tryResolveBetterAuthSession } from "../auth/require-auth.js";
import type { GatewayAuthPayload } from "../auth/require-auth.js";
import type { GatewayEnv } from "../config/env.js";
import type { ServiceRegistry } from "../config/services.js";

function buildAuthHeaders(auth: GatewayAuthPayload, internalSecret: string): Headers {
    const headers = new Headers();
    headers.set(AUTH_HEADER_USER_ID, auth.userId);
    headers.set(AUTH_HEADER_BASE_ROLE, auth.baseRole);
    headers.set(AUTH_HEADER_IS_ADMIN, String(auth.isAdmin));
    headers.set(AUTH_HEADER_ACCOUNT_STATUS, auth.accountStatus);
    headers.set(AUTH_HEADER_ROLES, auth.roles.join(","));
    headers.set("x-internal-secret", internalSecret);
    headers.set("accept", "application/json");
    return headers;
}

function mergeOverview(
    users: UsersAdminOverviewStatsResponse,
    projects: ProjectsAdminOverviewStatsResponse,
    cvs: ContentAdminOverviewStatsResponse,
    portfolios: ContentAdminOverviewStatsResponse,
    scraping: ScrapingAdminStatsResponse,
): AdminOverviewStats {
    return {
        totals: {
            users: users.total,
            projects: projects.total,
            cvs: cvs.total,
            portfolios: portfolios.total,
            jobsActive: scraping.total_actives,
            jobsArchived: scraping.total_archives,
        },
        deltas: {
            usersThisWeek: countLastDays(users.byDay, 7),
            projectsThisWeek: countLastDays(projects.byDay, 7),
            cvsThisWeek: countLastDays(cvs.byDay, 7),
            portfoliosThisWeek: countLastDays(portfolios.byDay, 7),
        },
        users: {
            byBaseRole: users.byBaseRole,
            verified: users.verified,
            unverified: users.unverified,
            banned: users.banned,
            admins: users.admins,
        },
        projects: {
            byStatus: projects.byStatus,
            pendingJoinRequests: projects.pendingJoinRequests,
            projectsWithPending: projects.projectsWithPending,
        },
        jobs: {
            parType: scraping.par_type ?? {},
            parSource: scraping.par_source ?? {},
            newLast24h: scraping.nouvelles_24h,
        },
        growth: {
            usersByDay: users.byDay,
            projectsByDay: projects.byDay,
            cvsByDay: cvs.byDay,
            portfoliosByDay: portfolios.byDay,
        },
    };
}

export function registerAdminOverviewRoute(
    api: Hono,
    ctx: { env: GatewayEnv; services: ServiceRegistry },
): void {
    const { env, services } = ctx;
    const sub = new Hono();
    sub.use("*", tryResolveBetterAuthSession(env, services));

    sub.get("/overview", async (c) => {
        const auth = c.get("gatewayAuth");
        if (!auth?.userId) {
            return c.json(
                {
                    error: {
                        code: "UNAUTHORIZED",
                        message: "Authentication required",
                    },
                },
                401,
            );
        }
        if (!auth.isAdmin && !auth.roles?.includes("admin")) {
            return c.json(
                {
                    error: {
                        code: "FORBIDDEN",
                        message: "Admin role required",
                    },
                },
                403,
            );
        }

        const headers = buildAuthHeaders(auth, env.INTERNAL_SERVICE_SECRET);
        const requestOpts = {
            headers,
            internalSecret: env.INTERNAL_SERVICE_SECRET,
            timeoutMs: env.PROXY_TIMEOUT_MS,
        };

        try {
            const [users, projects, cvs, portfolios, scraping] = await Promise.all([
                internalRequestJson<UsersAdminOverviewStatsResponse>(
                    `${services.users.baseUrl}/users/admin/overview-stats`,
                    requestOpts,
                ),
                internalRequestJson<ProjectsAdminOverviewStatsResponse>(
                    `${services.projects.baseUrl}/projects/admin/overview-stats`,
                    requestOpts,
                ),
                internalRequestJson<ContentAdminOverviewStatsResponse>(
                    `${services.cv.baseUrl}/api/cvs/admin/overview-stats`,
                    requestOpts,
                ),
                internalRequestJson<ContentAdminOverviewStatsResponse>(
                    `${services.portfolio.baseUrl}/portfolio/admin/overview-stats`,
                    requestOpts,
                ),
                internalRequestJson<ScrapingAdminStatsResponse>(
                    `${services.scraping.baseUrl}/admin/stats`,
                    requestOpts,
                ),
            ]);

            const overview = mergeOverview(users, projects, cvs, portfolios, scraping);
            return c.json(overview, 200);
        } catch (error) {
            console.error("[api-gateway] Admin overview aggregation failed:", error);
            throw error;
        }
    });

    api.route("/admin", sub);
}
