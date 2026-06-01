import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Shield } from "lucide-react";
import { apiRequest } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type UsersPreviewResponse = { users: Array<{ id: string }> };
type ProjectsPreviewResponse = { items: Array<{ id: string }> };
type JobsPreviewResponse = { offres: Array<{ _id: string }> };
type PortfoliosPreviewResponse = { portfolios: Array<{ id: string }> };
type CvsPreviewResponse = { cvs: Array<{ _id: string }> };

export default function AdminDashboardPage() {
    const usersQuery = useQuery({
        queryKey: ["admin", "users", "preview"],
        queryFn: () => apiRequest<UsersPreviewResponse>("/api/users/admin/accounts?limit=25"),
    });
    const projectsQuery = useQuery({
        queryKey: ["admin", "projects", "preview"],
        queryFn: () => apiRequest<ProjectsPreviewResponse>("/api/projects/admin/list?limit=25"),
    });
    const jobsQuery = useQuery({
        queryKey: ["admin", "jobs", "preview"],
        queryFn: () => apiRequest<JobsPreviewResponse>("/api/jobs/admin/offres?limit=25"),
    });
    const portfoliosQuery = useQuery({
        queryKey: ["admin", "portfolio", "preview"],
        queryFn: () => apiRequest<PortfoliosPreviewResponse>("/api/portfolio/admin/list?limit=25"),
    });
    const cvsQuery = useQuery({
        queryKey: ["admin", "cv", "preview"],
        queryFn: () => apiRequest<CvsPreviewResponse>("/api/cvs/admin/list?limit=25"),
    });

    const stats = useMemo(
        () => [
            { label: "Accounts", value: usersQuery.data?.users.length ?? 0 },
            { label: "Projects", value: projectsQuery.data?.items.length ?? 0 },
            { label: "Jobs", value: jobsQuery.data?.offres.length ?? 0 },
            { label: "Portfolios", value: portfoliosQuery.data?.portfolios.length ?? 0 },
            { label: "CVs", value: cvsQuery.data?.cvs.length ?? 0 },
        ],
        [cvsQuery.data, jobsQuery.data, portfoliosQuery.data, projectsQuery.data, usersQuery.data],
    );

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
                    Platform-wide moderation and management entrypoint.
                </CardContent>
            </Card>

            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
                {stats.map((stat) => (
                    <Card key={stat.label} className="border-[var(--gb-border)] bg-[var(--gb-app-panel-bg)]">
                        <CardContent className="space-y-1 px-4 py-4">
                            <p className="text-xs uppercase tracking-[0.08em] text-[var(--gb-muted)]">{stat.label}</p>
                            <p className="text-2xl font-bold text-[var(--gb-text)]">{stat.value}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
