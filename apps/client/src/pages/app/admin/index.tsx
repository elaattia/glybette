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
import { useLocale } from "@/hooks/useLocale";
import type { AppLocale } from "@/i18n";
import type { TFunction } from "i18next";

const ACCENT = "#16A34A";

function formatDelta(value: number, locale: AppLocale, t: TFunction<"admin">) {
    if (value <= 0) return null;
    return t("common.deltaThisWeek", { count: fmt(value, locale) });
}

type ChartCardProps = {
    title: string;
    icon: ElementType;
    accent?: string;
    to?: string;
    linkLabel: string;
    isLoading: boolean;
    emptyMessage: string;
    isEmpty?: boolean;
    children: ReactNode;
    skeletonRows?: number;
};

function OverviewChartCard({
    title,
    icon,
    accent = ACCENT,
    to,
    linkLabel,
    isLoading,
    emptyMessage,
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
    const { locale, t } = useLocale("admin");
    const overviewQuery = useQuery({
        queryKey: ["admin", "overview"],
        queryFn: () => apiRequest<AdminOverviewStats>("/api/admin/overview"),
    });

    const data = overviewQuery.data;
    const isLoading = overviewQuery.isPending;

    const contentVolume = useMemo(() => {
        if (!data) return [];
        return [
            { label: t("dashboard.contentVolume.projects"), count: data.totals.projects },
            { label: t("dashboard.contentVolume.cvs"), count: data.totals.cvs },
            { label: t("dashboard.contentVolume.portfolios"), count: data.totals.portfolios },
            { label: t("dashboard.contentVolume.activeJobs"), count: data.totals.jobsActive },
        ].filter((row) => row.count > 0);
    }, [data, t]);

    const roleEntries = useMemo(
        () =>
            data
                ? recordToEntries(data.users.byBaseRole).map((entry) => ({
                      ...entry,
                      label: t(`common.roles.${entry.label}`, { defaultValue: entry.label }),
                  }))
                : [],
        [data, t],
    );

    const projectStatusEntries = useMemo(
        () =>
            data
                ? recordToEntries(data.projects.byStatus).map((entry) => ({
                      ...entry,
                      label: t(`common.projectStatus.${entry.label}`, { defaultValue: entry.label }),
                  }))
                : [],
        [data, t],
    );

    const jobSourceEntries = useMemo(() => (data ? recordToEntries(data.jobs.parSource, 10) : []), [data]);
    const jobTypeEntries = useMemo(() => (data ? recordToEntries(data.jobs.parType, 10) : []), [data]);

    const accountHealthRows = useMemo(() => {
        if (!data) return [];
        return [
            { label: t("dashboard.accountHealth.verified"), count: data.users.verified, accent: "#16A34A" },
            { label: t("dashboard.accountHealth.unverified"), count: data.users.unverified, accent: "#f97316" },
            { label: t("dashboard.accountHealth.banned"), count: data.users.banned, accent: "#ef4444" },
            { label: t("dashboard.accountHealth.admins"), count: data.users.admins, accent: "#8b5cf6" },
        ].filter((row) => row.count > 0);
    }, [data, t]);

    const pipelineRows = useMemo(() => {
        if (!data) return [];
        return [
            { label: t("dashboard.jobPipeline.activeOffers"), count: data.totals.jobsActive },
            { label: t("dashboard.jobPipeline.archivedOffers"), count: data.totals.jobsArchived },
            { label: t("dashboard.jobPipeline.new24h"), count: data.jobs.newLast24h },
        ];
    }, [data, t]);

    const growthSeries = useMemo(() => {
        if (!data) return [];
        return [
            { key: "users", label: t("dashboard.growthSeries.accounts"), color: "#16A34A", data: data.growth.usersByDay },
            { key: "projects", label: t("dashboard.growthSeries.projects"), color: "#2563eb", data: data.growth.projectsByDay },
            { key: "cvs", label: t("dashboard.growthSeries.cvs"), color: "#8b5cf6", data: data.growth.cvsByDay },
            { key: "portfolios", label: t("dashboard.growthSeries.portfolios"), color: "#f97316", data: data.growth.portfoliosByDay },
        ];
    }, [data, t]);

    const kpiStats = useMemo(
        () => [
            {
                label: t("dashboard.kpi.accounts"),
                value: data?.totals.users ?? 0,
                delta: data ? formatDelta(data.deltas.usersThisWeek, locale, t) : null,
                to: "/app/admin/users",
            },
            {
                label: t("dashboard.kpi.projects"),
                value: data?.totals.projects ?? 0,
                delta: data ? formatDelta(data.deltas.projectsThisWeek, locale, t) : null,
                to: "/app/admin/projects",
            },
            {
                label: t("dashboard.kpi.jobs"),
                value: data?.totals.jobsActive ?? 0,
                delta: data?.jobs.newLast24h
                    ? t("common.newLast24h", { count: fmt(data.jobs.newLast24h, locale) })
                    : null,
                to: "/app/admin/jobs",
            },
            {
                label: t("dashboard.kpi.portfolios"),
                value: data?.totals.portfolios ?? 0,
                delta: data ? formatDelta(data.deltas.portfoliosThisWeek, locale, t) : null,
                to: "/app/admin/portfolio",
            },
            {
                label: t("dashboard.kpi.cvs"),
                value: data?.totals.cvs ?? 0,
                delta: data ? formatDelta(data.deltas.cvsThisWeek, locale, t) : null,
                to: "/app/admin/cv",
            },
        ],
        [data, locale, t],
    );

    const usersTotal = data?.totals.users ?? 1;
    const projectsTotal = data?.totals.projects ?? 1;
    const chartLinkLabel = t("common.manage");
    const chartEmptyMessage = t("common.noData");

    return (
        <div className="space-y-5">
            <Card className="border-[var(--gb-border)] bg-[var(--gb-app-panel-bg)] py-0 shadow-none">
                <CardHeader className="px-5 pt-5 md:px-6">
                    <CardTitle className="flex items-center gap-2 text-lg text-[var(--gb-text)]">
                        <Shield className="h-4 w-4 text-[#16A34A]" />
                        {t("dashboard.title")}
                    </CardTitle>
                </CardHeader>
                <CardContent className="px-5 pb-5 text-sm text-[var(--gb-muted)] md:px-6 md:pb-6">
                    {t("dashboard.description")}
                </CardContent>
            </Card>

            {overviewQuery.isError ? (
                <Card className="border-destructive/30 bg-[var(--gb-app-panel-bg)]">
                    <CardContent className="px-5 py-4 text-sm text-destructive">
                        {t("dashboard.loadError")}
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
                                      {fmt(stat.value, locale)}
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
                    title={t("dashboard.charts.contentVolume")}
                    icon={TrendingUp}
                    accent="#2563eb"
                    to="/app/admin/projects"
                    linkLabel={chartLinkLabel}
                    emptyMessage={chartEmptyMessage}
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
                    title={t("dashboard.charts.accountsByRole")}
                    icon={Users}
                    to="/app/admin/users"
                    linkLabel={chartLinkLabel}
                    emptyMessage={chartEmptyMessage}
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
                    title={t("dashboard.charts.accountHealth")}
                    icon={UserCheck}
                    accent="#8b5cf6"
                    to="/app/admin/users"
                    linkLabel={chartLinkLabel}
                    emptyMessage={chartEmptyMessage}
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
                    title={t("dashboard.charts.offersBySource")}
                    icon={BriefcaseBusiness}
                    accent="#14b8a6"
                    to="/app/admin/scraping"
                    linkLabel={t("common.scraping")}
                    emptyMessage={chartEmptyMessage}
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
                    title={t("dashboard.charts.offersByType")}
                    icon={BriefcaseBusiness}
                    accent="#8b5cf6"
                    to="/app/admin/jobs"
                    linkLabel={chartLinkLabel}
                    emptyMessage={chartEmptyMessage}
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
                    title={t("dashboard.charts.jobPipeline")}
                    icon={Workflow}
                    accent="#f97316"
                    to="/app/admin/jobs"
                    linkLabel={chartLinkLabel}
                    emptyMessage={chartEmptyMessage}
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
                    title={t("dashboard.charts.projectsByStatus")}
                    icon={Handshake}
                    to="/app/admin/projects"
                    linkLabel={chartLinkLabel}
                    emptyMessage={chartEmptyMessage}
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
                    title={t("dashboard.charts.moderationQueue")}
                    icon={FolderKanban}
                    accent="#ef4444"
                    to="/app/admin/projects"
                    linkLabel={chartLinkLabel}
                    emptyMessage={chartEmptyMessage}
                    isLoading={isLoading}
                    isEmpty={!data?.projects.pendingJoinRequests && !data?.projects.projectsWithPending}
                    skeletonRows={2}
                >
                    <div className="space-y-4">
                        <div className="rounded-xl border border-[var(--gb-border)] px-4 py-3">
                            <p className="text-xs text-[var(--gb-muted)]">
                                {t("dashboard.moderation.pendingJoinRequests")}
                            </p>
                            <p className="mt-1 text-2xl font-semibold tabular-nums text-[var(--gb-text)]">
                                {fmt(data?.projects.pendingJoinRequests ?? 0, locale)}
                            </p>
                        </div>
                        <div className="rounded-xl border border-[var(--gb-border)] px-4 py-3">
                            <p className="text-xs text-[var(--gb-muted)]">
                                {t("dashboard.moderation.projectsWithPending")}
                            </p>
                            <p className="mt-1 text-2xl font-semibold tabular-nums text-[var(--gb-text)]">
                                {fmt(data?.projects.projectsWithPending ?? 0, locale)}
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
                        <ChartSection title={t("dashboard.charts.growth")} icon={FileUser} accent={ACCENT} />
                    </CardHeader>
                    <CardContent className="px-5 pb-5 md:px-6 md:pb-6">
                        <TimeSeriesChart series={growthSeries} />
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
