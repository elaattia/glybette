import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { BriefcaseBusiness, Filter, MessageSquare, Sparkles, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useProjectsList } from "@/features/projects";

const difficulties = [
    { value: "", label: "All levels" },
    { value: "beginner", label: "Beginner" },
    { value: "intermediate", label: "Intermediate" },
    { value: "advanced", label: "Advanced" },
] as const;

export default function ProjectsListPage() {
    const [search, setSearch] = useState("");
    const [domain, setDomain] = useState("");
    const [difficulty, setDifficulty] = useState<(typeof difficulties)[number]["value"]>("");
    const [technology, setTechnology] = useState("");
    const [mineOnly, setMineOnly] = useState(false);

    const query = useMemo(
        () => ({
            q: search || undefined,
            domain: domain || undefined,
            difficulty: difficulty || undefined,
            technology: technology || undefined,
            mine: mineOnly || undefined,
            page: 1,
            pageSize: 18,
        }),
        [search, domain, difficulty, technology, mineOnly],
    );

    const projectsQuery = useProjectsList(query);
    const items = projectsQuery.data?.items ?? [];

    return (
        <div className="space-y-5">
            <div className="relative overflow-hidden rounded-3xl border border-[var(--gb-border)] bg-[var(--gb-app-panel-bg)] p-6">
                <div className="pointer-events-none absolute inset-0 opacity-80">
                    <div className="absolute -left-16 -top-20 h-56 w-56 rounded-full bg-[radial-gradient(circle_at_center,rgba(22,163,74,0.3),transparent_70%)]" />
                    <div className="absolute -right-16 bottom-0 h-56 w-56 rounded-full bg-[radial-gradient(circle_at_center,rgba(2,132,199,0.26),transparent_72%)]" />
                </div>
                <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--gb-muted)]">
                            Community projects
                        </p>
                        <h1 className="mt-2 font-['Bricolage_Grotesque'] text-3xl font-extrabold text-[var(--gb-text)]">
                            Build with the Glybette network
                        </h1>
                        <p className="mt-2 max-w-2xl text-sm text-[var(--gb-text-off)]">
                            Launch ideas, recruit collaborators, and discuss progress in public threads.
                        </p>
                    </div>
                    <Button asChild className="h-11 rounded-xl px-5 text-sm font-semibold shadow-lg">
                        <Link to="/app/projects/create">
                            <Sparkles className="h-4 w-4" /> Propose a project
                        </Link>
                    </Button>
                </div>
            </div>

            <Card className="border border-[var(--gb-border)] bg-[var(--gb-app-panel-bg)]">
                <CardContent className="space-y-4 px-5 py-5">
                    <div className="flex items-center gap-2 text-sm font-semibold text-[var(--gb-text)]">
                        <Filter className="h-4 w-4 text-[#16a34a]" />
                        Filter projects
                    </div>
                    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
                        <Input
                            placeholder="Search title or problem"
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            className="h-10 border-[var(--gb-border)] bg-[var(--gb-surface)]"
                        />
                        <Input
                            placeholder="Domain (AI, Web, Data...)"
                            value={domain}
                            onChange={(event) => setDomain(event.target.value)}
                            className="h-10 border-[var(--gb-border)] bg-[var(--gb-surface)]"
                        />
                        <select
                            className="h-10 rounded-lg border border-[var(--gb-border)] bg-[var(--gb-surface)] px-3 text-sm text-[var(--gb-text)] outline-none focus:border-[var(--gb-app-ring)]"
                            value={difficulty}
                            onChange={(event) => setDifficulty(event.target.value as (typeof difficulties)[number]["value"])}>
                            {difficulties.map((option) => (
                                <option key={option.value || "all"} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                        <Input
                            placeholder="Technology tag"
                            value={technology}
                            onChange={(event) => setTechnology(event.target.value)}
                            className="h-10 border-[var(--gb-border)] bg-[var(--gb-surface)]"
                        />
                        <Button
                            type="button"
                            variant={mineOnly ? "default" : "outline"}
                            className="h-10 justify-center border-[var(--gb-border)]"
                            onClick={() => setMineOnly((value) => !value)}>
                            {mineOnly ? "Showing my projects" : "Show my projects"}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {projectsQuery.isLoading ? (
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {Array.from({ length: 6 }).map((_, idx) => (
                        <div
                            key={idx}
                            className="h-[280px] animate-pulse rounded-2xl border border-[var(--gb-border)] bg-[var(--gb-app-panel-bg)]"
                        />
                    ))}
                </div>
            ) : null}

            {!projectsQuery.isLoading && projectsQuery.isError ? (
                <Card className="border border-red-500/30 bg-red-500/5">
                    <CardContent className="px-5 py-5 text-sm text-red-200">
                        Failed to load projects. Please refresh the page.
                    </CardContent>
                </Card>
            ) : null}

            {!projectsQuery.isLoading && !projectsQuery.isError && items.length === 0 ? (
                <Card className="border border-[var(--gb-border)] bg-[var(--gb-app-panel-bg)]">
                    <CardContent className="flex flex-col items-center gap-3 px-6 py-10 text-center">
                        <BriefcaseBusiness className="h-7 w-7 text-[var(--gb-muted)]" />
                        <p className="text-base font-semibold text-[var(--gb-text)]">No projects match your filters yet.</p>
                        <p className="max-w-md text-sm text-[var(--gb-muted)]">
                            Try broadening filters or start a new project idea to attract collaborators.
                        </p>
                        <Button asChild size="sm">
                            <Link to="/app/projects/create">Create project</Link>
                        </Button>
                    </CardContent>
                </Card>
            ) : null}

            {!projectsQuery.isLoading && !projectsQuery.isError && items.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {items.map((project) => (
                        <article
                            key={project.id}
                            className="group overflow-hidden rounded-2xl border border-[var(--gb-border)] bg-[var(--gb-app-panel-bg)] shadow-[0_10px_28px_rgba(0,0,0,0.15)] transition-transform hover:-translate-y-0.5">
                            <div className="relative h-40 overflow-hidden border-b border-[var(--gb-border)] bg-[linear-gradient(145deg,#102338,#1b3651)]">
                                {project.coverAsset?.publicUrl ? (
                                    <img
                                        src={project.coverAsset.publicUrl}
                                        alt={project.title}
                                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                                    />
                                ) : (
                                    <div className="flex h-full items-center justify-center text-sm text-[var(--gb-muted)]">
                                        Cover pending
                                    </div>
                                )}
                                <span className="absolute left-3 top-3 rounded-full bg-[var(--gb-app-active-bg)] px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#16a34a]">
                                    {project.status}
                                </span>
                            </div>

                            <div className="space-y-4 p-4">
                                <div>
                                    <h2 className="font-['Bricolage_Grotesque'] text-2xl font-extrabold text-[var(--gb-text)]">
                                        {project.title}
                                    </h2>
                                    <p className="mt-2 line-clamp-3 text-sm text-[var(--gb-text-off)]">
                                        {project.shortDescription}
                                    </p>
                                </div>

                                <div className="flex flex-wrap gap-1.5">
                                    {project.technologies.slice(0, 4).map((tech) => (
                                        <Badge key={tech} variant="outline" className="border-[var(--gb-border)] bg-[var(--gb-surface)] text-[11px]">
                                            {tech}
                                        </Badge>
                                    ))}
                                </div>

                                <div className="flex items-center justify-between text-xs text-[var(--gb-muted)]">
                                    <span className="inline-flex items-center gap-1">
                                        <Users className="h-3.5 w-3.5" /> {project.memberCount} members
                                    </span>
                                    <span className="inline-flex items-center gap-1">
                                        <MessageSquare className="h-3.5 w-3.5" /> {project.commentCount} comments
                                    </span>
                                </div>

                                <div className="flex items-center justify-between gap-2">
                                    <Badge variant="secondary" className="bg-[var(--gb-app-hover)] text-[var(--gb-text-off)]">
                                        {project.difficulty}
                                    </Badge>
                                    <Button asChild size="sm">
                                        <Link to={`/app/projects/${project.id}`}>Open project</Link>
                                    </Button>
                                </div>
                            </div>
                        </article>
                    ))}
                </div>
            ) : null}
        </div>
    );
}
