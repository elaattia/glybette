import { useMemo, type ElementType, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
    BriefcaseBusiness,
    ChevronRight,
    FileUser,
    FolderKanban,
    Handshake,
    Shield,
    TrendingUp,
    UserCheck,
    Users,
    Workflow,
} from "lucide-react";
import type { AdminOverviewStats } from "@glybette/contracts";
import { apiRequest } from "@/lib/api";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
    AdminChartCardSkeleton,
    AdminGrowthChartSkeleton,
    BarRow,
    ChartSection,
    fmt,
    maxCount,
    recordToEntries,
    TimeSeriesChart,
} from "@/components/charts";
import { AdminStatCardSkeleton } from "@/pages/app/admin/components/admin-skeletons";

const ACCENT = "#16A34A";

const ROLE_LABELS: Record<string, string> = {
    student: "Student",
    enterprise: "Enterprise",
};

const PROJECT_STATUS_LABELS: Record<string, string> = {
    draft: "Draft",
    published: "Published",
    archived: "Archived",
};

function formatDelta(value: number) {
    if (value <= 0) return null;
    return `+${fmt(value)} this week`;
}

type ChartCardProps = {
    title: string;
    icon: ElementType;
    accent?: string;
    to?: string;
    linkLabel?: string;
    isLoading: boolean;
    emptyMessage?: string;
    isEmpty?: boolean;
    children: ReactNode;
    skeletonRows?: number;
};

function OverviewChartCard({
    title,
    icon,
    accent = ACCENT,
    to,
    linkLabel = "Manage",
    isLoading,
    emptyMessage = "No data yet.",
    isEmpty = false,
    children,
    skeletonRows = 4,
}: ChartCardProps) {
    if (isLoading) {
        return <AdminChartCardSkeleton rows={skeletonRows} />;
    }

    return (
        <Card className="flex h-full flex-col border-[var(--gb-border)] bg-[var(--gb-app-panel-bg)] shadow-none">
            <CardHeader className="px-5 pt-5 pb-0 md:px-6">
                <ChartSection title={title} icon={icon} accent={accent} />
            </CardHeader>
            <CardContent className="flex-1 px-5 pb-4 md:px-6">
                {isEmpty ? <p className="text-sm text-[var(--gb-muted)]">{emptyMessage}</p> : children}
            </CardContent>
            {to ? (
                <CardFooter className="border-t border-[var(--gb-border)] px-5 py-3 md:px-6">
                    <Link
                        to={to}
                        className="inline-flex items-center gap-1 text-xs font-medium text-[#16A34A] hover:underline"
                    >
                        {linkLabel}
                        <ChevronRight className="h-3.5 w-3.5" aria-hidden />
                    </Link>
                </CardFooter>
            ) : null}
        </Card>
    );
}

export default function AdminDashboardPage() {
    const overviewQuery = useQuery({
        queryKey: ["admin", "overview"],
        queryFn: () => apiRequest<AdminOverviewStats>("/api/admin/overview"),
    });

    const data = overviewQuery.data;
    const isLoading = overviewQuery.isPending;

    const contentVolume = useMemo(() => {
        if (!data) return [];
        return [
            { label: "Projects", count: data.totals.projects },
            { label: "CVs", count: data.totals.cvs },
            { label: "Portfolios", count: data.totals.portfolios },
            { label: "Active jobs", count: data.totals.jobsActive },
        ].filter((row) => row.count > 0);
    }, [data]);

    const roleEntries = useMemo(
        () =>
            data
                ? recordToEntries(data.users.byBaseRole).map((entry) => ({
                      ...entry,
                      label: ROLE_LABELS[entry.label] ?? entry.label,
                  }))
                : [],
        [data],
    );

    const projectStatusEntries = useMemo(
        () =>
            data
                ? recordToEntries(data.projects.byStatus).map((entry) => ({
                      ...entry,
                      label: PROJECT_STATUS_LABELS[entry.label] ?? entry.label,
                  }))
                : [],
        [data],
    );

    const jobSourceEntries = useMemo(() => (data ? recordToEntries(data.jobs.parSource, 10) : []), [data]);
    const jobTypeEntries = useMemo(() => (data ? recordToEntries(data.jobs.parType, 10) : []), [data]);

    const accountHealthRows = useMemo(() => {
        if (!data) return [];
        return [
            { label: "Verified", count: data.users.verified, accent: "#16A34A" },
            { label: "Unverified", count: data.users.unverified, accent: "#f97316" },
            { label: "Banned", count: data.users.banned, accent: "#ef4444" },
            { label: "Admins", count: data.users.admins, accent: "#8b5cf6" },
        ].filter((row) => row.count > 0);
    }, [data]);

    const pipelineRows = useMemo(() => {
        if (!data) return [];
        return [
            { label: "Active offers", count: data.totals.jobsActive },
            { label: "Archived offers", count: data.totals.jobsArchived },
            { label: "New (24h)", count: data.jobs.newLast24h },
        ];
    }, [data]);

    const growthSeries = useMemo(() => {
        if (!data) return [];
        return [
            { key: "users", label: "Accounts", color: "#16A34A", data: data.growth.usersByDay },
            { key: "projects", label: "Projects", color: "#2563eb", data: data.growth.projectsByDay },
            { key: "cvs", label: "CVs", color: "#8b5cf6", data: data.growth.cvsByDay },
            { key: "portfolios", label: "Portfolios", color: "#f97316", data: data.growth.portfoliosByDay },
        ];
    }, [data]);

    const kpiStats = useMemo(
        () => [
            {
                label: "Accounts",
                value: data?.totals.users ?? 0,
                delta: data ? formatDelta(data.deltas.usersThisWeek) : null,
                to: "/app/admin/users",
            },
            {
                label: "Projects",
                value: data?.totals.projects ?? 0,
                delta: data ? formatDelta(data.deltas.projectsThisWeek) : null,
                to: "/app/admin/projects",
            },
            {
                label: "Jobs",
                value: data?.totals.jobsActive ?? 0,
                delta: data?.jobs.newLast24h ? `${fmt(data.jobs.newLast24h)} new (24h)` : null,
                to: "/app/admin/jobs",
            },
            {
                label: "Portfolios",
                value: data?.totals.portfolios ?? 0,
                delta: data ? formatDelta(data.deltas.portfoliosThisWeek) : null,
                to: "/app/admin/portfolio",
            },
            {
                label: "CVs",
                value: data?.totals.cvs ?? 0,
                delta: data ? formatDelta(data.deltas.cvsThisWeek) : null,
                to: "/app/admin/cv",
            },
        ],
        [data],
    );

    const usersTotal = data?.totals.users ?? 1;
    const projectsTotal = data?.totals.projects ?? 1;

    return (
        <div className="space-y-5">
            <Card className="border-[var(--gb-border)] bg-[var(--gb-app-panel-bg)] py-0 shadow-none">
                <CardHeader className="px-5 pt-5 md:px-6">
                    <CardTitle className="flex items-center gap-2 text-lg text-[var(--gb-text)]">
                        <Shield className="h-4 w-4 text-[#16A34A]" />
                        Admin dashboard
                    </CardTitle>
                </CardHeader>
                <CardContent className="px-5 pb-5 text-sm text-[var(--gb-muted)] md:px-6 md:pb-6">
                    Platform-wide metrics, moderation signals, and growth over the last 30 days.
                </CardContent>
            </Card>

            {overviewQuery.isError ? (
                <Card className="border-destructive/30 bg-[var(--gb-app-panel-bg)]">
                    <CardContent className="px-5 py-4 text-sm text-destructive">
                        Failed to load overview statistics. Try refreshing the page.
                    </CardContent>
                </Card>
            ) : null}

            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
                {isLoading
                    ? Array.from({ length: 5 }).map((_, index) => <AdminStatCardSkeleton key={index} />)
                    : kpiStats.map((stat) => (
                          <Card
                              key={stat.label}
                              className="border-[var(--gb-border)] bg-[var(--gb-app-panel-bg)]"
                          >
                              <CardContent className="space-y-1 px-4 py-4">
                                  <p className="text-xs uppercase tracking-[0.08em] text-[var(--gb-muted)]">
                                      {stat.label}
                                  </p>
                                  <p className="text-2xl font-bold tabular-nums text-[var(--gb-text)]">
                                      {fmt(stat.value)}
                                  </p>
                                  {stat.delta ? (
                                      <p className="text-xs text-[var(--gb-muted)]">{stat.delta}</p>
                                  ) : null}
                              </CardContent>
                          </Card>
                      ))}
            </div>

            <section className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
                <OverviewChartCard
                    title="Content volume"
                    icon={TrendingUp}
                    accent="#2563eb"
                    to="/app/admin/projects"
                    isLoading={isLoading}
                    isEmpty={contentVolume.length === 0}
                >
                    <div className="space-y-3">
                        {contentVolume.map((row) => (
                            <BarRow
                                key={row.label}
                                label={row.label}
                                count={row.count}
                                max={maxCount(contentVolume)}
                                accent="#2563eb"
                            />
                        ))}
                    </div>
                </OverviewChartCard>

                <OverviewChartCard
                    title="Accounts by role"
                    icon={Users}
                    to="/app/admin/users"
                    isLoading={isLoading}
                    isEmpty={roleEntries.length === 0}
                    skeletonRows={2}
                >
                    <div className="space-y-3">
                        {roleEntries.map((row) => (
                            <BarRow
                                key={row.label}
                                label={row.label}
                                count={row.count}
                                max={maxCount(roleEntries)}
                                pct={(row.count / usersTotal) * 100}
                                accent={ACCENT}
                            />
                        ))}
                    </div>
                </OverviewChartCard>

                <OverviewChartCard
                    title="Account health"
                    icon={UserCheck}
                    accent="#8b5cf6"
                    to="/app/admin/users"
                    isLoading={isLoading}
                    isEmpty={accountHealthRows.length === 0}
                >
                    <div className="space-y-3">
                        {accountHealthRows.map((row) => (
                            <BarRow
                                key={row.label}
                                label={row.label}
                                count={row.count}
                                max={maxCount(accountHealthRows)}
                                pct={(row.count / usersTotal) * 100}
                                accent={row.accent}
                            />
                        ))}
                    </div>
                </OverviewChartCard>
            </section>

            <section className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
                <OverviewChartCard
                    title="Offers by source"
                    icon={BriefcaseBusiness}
                    accent="#14b8a6"
                    to="/app/admin/scraping"
                    linkLabel="Scraping"
                    isLoading={isLoading}
                    isEmpty={jobSourceEntries.length === 0}
                >
                    <div className="space-y-3">
                        {jobSourceEntries.map((row) => (
                            <BarRow
                                key={row.label}
                                label={row.label}
                                count={row.count}
                                max={maxCount(jobSourceEntries)}
                                accent="#14b8a6"
                            />
                        ))}
                    </div>
                </OverviewChartCard>

                <OverviewChartCard
                    title="Offers by type"
                    icon={BriefcaseBusiness}
                    accent="#8b5cf6"
                    to="/app/admin/jobs"
                    isLoading={isLoading}
                    isEmpty={jobTypeEntries.length === 0}
                >
                    <div className="space-y-3">
                        {jobTypeEntries.map((row) => (
                            <BarRow
                                key={row.label}
                                label={row.label}
                                count={row.count}
                                max={maxCount(jobTypeEntries)}
                                accent="#8b5cf6"
                            />
                        ))}
                    </div>
                </OverviewChartCard>

                <OverviewChartCard
                    title="Job pipeline"
                    icon={Workflow}
                    accent="#f97316"
                    to="/app/admin/jobs"
                    isLoading={isLoading}
                    isEmpty={pipelineRows.every((row) => row.count === 0)}
                    skeletonRows={3}
                >
                    <div className="space-y-3">
                        {pipelineRows.map((row) => (
                            <BarRow
                                key={row.label}
                                label={row.label}
                                count={row.count}
                                max={maxCount(pipelineRows)}
                                accent="#f97316"
                            />
                        ))}
                    </div>
                </OverviewChartCard>
            </section>

            <section className="grid gap-4 lg:grid-cols-2">
                <OverviewChartCard
                    title="Projects by status"
                    icon={Handshake}
                    to="/app/admin/projects"
                    isLoading={isLoading}
                    isEmpty={projectStatusEntries.length === 0}
                    skeletonRows={3}
                >
                    <div className="space-y-3">
                        {projectStatusEntries.map((row) => (
                            <BarRow
                                key={row.label}
                                label={row.label}
                                count={row.count}
                                max={maxCount(projectStatusEntries)}
                                pct={(row.count / projectsTotal) * 100}
                                accent={ACCENT}
                            />
                        ))}
                    </div>
                </OverviewChartCard>

                <OverviewChartCard
                    title="Moderation queue"
                    icon={FolderKanban}
                    accent="#ef4444"
                    to="/app/admin/projects"
                    isLoading={isLoading}
                    isEmpty={!data?.projects.pendingJoinRequests && !data?.projects.projectsWithPending}
                    skeletonRows={2}
                >
                    <div className="space-y-4">
                        <div className="rounded-xl border border-[var(--gb-border)] px-4 py-3">
                            <p className="text-xs text-[var(--gb-muted)]">Pending join requests</p>
                            <p className="mt-1 text-2xl font-semibold tabular-nums text-[var(--gb-text)]">
                                {fmt(data?.projects.pendingJoinRequests ?? 0)}
                            </p>
                        </div>
                        <div className="rounded-xl border border-[var(--gb-border)] px-4 py-3">
                            <p className="text-xs text-[var(--gb-muted)]">Projects with pending requests</p>
                            <p className="mt-1 text-2xl font-semibold tabular-nums text-[var(--gb-text)]">
                                {fmt(data?.projects.projectsWithPending ?? 0)}
                            </p>
                        </div>
                    </div>
                </OverviewChartCard>
            </section>

            {isLoading ? (
                <AdminGrowthChartSkeleton />
            ) : (
                <Card className="border-[var(--gb-border)] bg-[var(--gb-app-panel-bg)] shadow-none">
                    <CardHeader className="px-5 pt-5 pb-0 md:px-6">
                        <ChartSection title="Growth (last 30 days)" icon={FileUser} accent={ACCENT} />
                    </CardHeader>
                    <CardContent className="px-5 pb-5 md:px-6 md:pb-6">
                        <TimeSeriesChart series={growthSeries} />
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
