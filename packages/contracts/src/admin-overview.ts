export type DailyCountPoint = { date: string; count: number };

export interface AdminOverviewStats {
    totals: {
        users: number;
        projects: number;
        cvs: number;
        portfolios: number;
        jobsActive: number;
        jobsArchived: number;
    };
    deltas: {
        usersThisWeek: number;
        projectsThisWeek: number;
        cvsThisWeek: number;
        portfoliosThisWeek: number;
    };
    users: {
        byBaseRole: Record<string, number>;
        verified: number;
        unverified: number;
        banned: number;
        admins: number;
    };
    projects: {
        byStatus: Record<string, number>;
        pendingJoinRequests: number;
        projectsWithPending: number;
    };
    jobs: {
        parType: Record<string, number>;
        parSource: Record<string, number>;
        newLast24h: number;
    };
    growth: {
        usersByDay: DailyCountPoint[];
        projectsByDay: DailyCountPoint[];
        cvsByDay: DailyCountPoint[];
        portfoliosByDay: DailyCountPoint[];
    };
}

export interface UsersAdminOverviewStatsResponse {
    total: number;
    byBaseRole: Record<string, number>;
    verified: number;
    unverified: number;
    banned: number;
    admins: number;
    byDay: DailyCountPoint[];
}

export interface ProjectsAdminOverviewStatsResponse {
    total: number;
    byStatus: Record<string, number>;
    pendingJoinRequests: number;
    projectsWithPending: number;
    byDay: DailyCountPoint[];
}

export interface ContentAdminOverviewStatsResponse {
    total: number;
    byDay: DailyCountPoint[];
}

export interface ScrapingAdminStatsResponse {
    total_actives: number;
    total_archives: number;
    nouvelles_24h: number;
    par_type: Record<string, number>;
    par_source: Record<string, number>;
}
