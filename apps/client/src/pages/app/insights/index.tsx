import { useMemo, useState } from "react";
import {
    Briefcase,
    BarChart3,
    Globe2,
    Sparkles,
    TrendingUp,
    Users,
    MapPin,
    Clock,
    Target,
    Layers,
    Monitor,
    Award,
    Activity,
    ChevronRight,
    ArrowUpRight,
    Zap,
    Database,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarRow, ChartSection, fmt, fmtPct, topEntries } from "@/components/charts";
import { useOffres } from "@/hooks/useJobs";

function parseSalary(value: unknown): number | null {
    if (!value || typeof value !== "string") return null;
    const m = value.replace(/\s+/g, "").match(/(\d+(?:[.,]\d+)?)/g);
    if (!m) return null;
    const nums = m.map((n) => Number(n.replace(",", "."))).filter(Number.isFinite);
    return nums.length ? nums[0] : null;
}

function daysSince(dateStr: string | undefined): number | null {
    if (!dateStr) return null;
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return null;
    return Math.floor((Date.now() - d.getTime()) / 86_400_000);
}


function StatCard({
    label,
    value,
    sub,
    icon: Icon,
    accent,
}: {
    label: string;
    value: string | number;
    sub?: string;
    icon: React.ElementType;
    accent: string;
}) {
    return (
        <Card className="border-[var(--gb-border)] bg-[var(--gb-app-panel-bg)] shadow-none">
            <CardContent className="px-5 pt-5 pb-5 md:px-6">
                <div className="flex items-start justify-between gap-2">
                    <div>
                        <p className="text-xs text-[var(--gb-text-off)] mb-1">{label}</p>
                        <div className="text-3xl font-semibold text-[var(--gb-text)] tabular-nums">
                            {value}
                        </div>
                        {sub && (
                            <p className="mt-1 text-xs text-[var(--gb-text-off)] leading-5">{sub}</p>
                        )}
                    </div>
                    <div
                        className="h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                        style={{ background: `${accent}18` }}
                    >
                        <Icon className="h-4 w-4" style={{ color: accent }} />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

export default function CareerInsightsPage() {
    const { data, loading, error } = useOffres({ page: 1, limit: 500 });
    const offres: any[] = data?.offres ?? data?.items ?? [];

    const stats = useMemo(() => {
        const total = offres.length;

        const types: string[] = [];
        const sources: string[] = [];
        const domains: string[] = [];
        const companies: string[] = [];
        const telework: string[] = [];
        const locations: string[] = [];
        const contractTypes: string[] = [];
        const expLevels: string[] = [];
        const skills: string[] = [];
        const salaries: number[] = [];
        const pubDates: number[] = [];

        offres.forEach((o: any) => {
            if (o.type_offre) types.push(o.type_offre);
            if (o.source_site) sources.push(o.source_site);
            if (o.domaine) domains.push(o.domaine);
            if (o.entreprise) companies.push(o.entreprise);
            if (o.teletravail) telework.push(o.teletravail);
            if (o.localisation) locations.push(o.localisation);
            if (o.type_contrat) contractTypes.push(o.type_contrat);
            if (o.niveau_experience) expLevels.push(o.niveau_experience);
            (o.competences ?? []).forEach((s: string) => { if (s) skills.push(s); });

            const sal = parseSalary(o.salaire);
            if (sal !== null) salaries.push(sal);

            const d = daysSince(o.date_publication ?? o.date_scraped);
            if (d !== null) pubDates.push(d);
        });

        const freshness = {
            last24h: pubDates.filter((d) => d <= 1).length,
            last3days: pubDates.filter((d) => d <= 3).length,
            lastWeek: pubDates.filter((d) => d <= 7).length,
            older: pubDates.filter((d) => d > 7).length,
        };

        const avgSalary = salaries.length
            ? Math.round(salaries.reduce((a, b) => a + b, 0) / salaries.length)
            : null;
        const minSalary = salaries.length ? Math.min(...salaries) : null;
        const maxSalary = salaries.length ? Math.max(...salaries) : null;

        const withDescription = offres.filter((o: any) => o.description).length;
        const withCompany = offres.filter((o: any) => o.entreprise).length;
        const withSalary = offres.filter((o: any) => o.salaire).length;
        const withSkills = offres.filter((o: any) => (o.competences ?? []).length > 0).length;
        const withTelework = offres.filter((o: any) => o.teletravail).length;
        const withExpLevel = offres.filter((o: any) => o.niveau_experience).length;

        return {
            total,
            uniqueCompanies: new Set(companies).size,
            uniqueLocations: new Set(locations).size,
            uniqueSkills: new Set(skills).size,

            topTypes: topEntries(types, 6),
            topSources: topEntries(sources, 8),
            topDomains: topEntries(domains, 8),
            topLocations: topEntries(locations, 8),
            topSkills: topEntries(skills, 12),
            topContracts: topEntries(contractTypes, 6),
            topExpLevels: topEntries(expLevels, 5),
            remoteBreakdown: topEntries(telework, 5),

            freshness,
            avgSalary,
            minSalary,
            maxSalary,
            salaryCount: salaries.length,

            completeness: {
                description: withDescription,
                company: withCompany,
                salary: withSalary,
                skills: withSkills,
                telework: withTelework,
                expLevel: withExpLevel,
            },
        };
    }, [offres]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-48 text-sm text-[var(--gb-text-off)]">
                Chargement des données...
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-48 text-sm text-destructive">
                Erreur : {error}
            </div>
        );
    }

    const maxSource = stats.topSources[0]?.count ?? 1;
    const maxDomain = stats.topDomains[0]?.count ?? 1;
    const maxLocation = stats.topLocations[0]?.count ?? 1;
    const maxSkill = stats.topSkills[0]?.count ?? 1;
    const maxContract = stats.topContracts[0]?.count ?? 1;
    const maxExp = stats.topExpLevels[0]?.count ?? 1;
    const maxRemote = stats.remoteBreakdown[0]?.count ?? 1;
    const maxType = stats.topTypes[0]?.count ?? 1;

    const freshnessTotal = stats.total || 1;

    return (
        <div className="space-y-6">

            <div className="flex flex-col gap-1">
                <h1 className="text-lg font-semibold text-[var(--gb-text)]">Career Insights</h1>
                <p className="text-sm text-[var(--gb-text-off)] max-w-2xl">
                    Analyse statistique en temps réel des offres scrappées — sources, domaines, compétences, salaires et fraîcheur des données.
                </p>
            </div>

            <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard label="Offres actives" value={fmt(stats.total)} sub="dans votre pipeline" icon={Database} accent="#16a34a" />
                <StatCard label="Entreprises uniques" value={fmt(stats.uniqueCompanies)} sub="ayant publié au moins une offre" icon={Users} accent="#2563eb" />
                <StatCard label="Localisations" value={fmt(stats.uniqueLocations)} sub="villes et régions distinctes" icon={MapPin} accent="#f97316" />
                <StatCard label="Compétences distinctes" value={fmt(stats.uniqueSkills)} sub="mentionnées dans les offres" icon={Award} accent="#8b5cf6" />
            </section>

            <section className="grid gap-4 lg:grid-cols-2">

                <Card className="border-[var(--gb-border)] bg-[var(--gb-app-panel-bg)] shadow-none">
                    <CardHeader className="px-5 pt-5 md:px-6 pb-3">
                        <ChartSection title="Fraîcheur des offres" icon={Clock} accent="#14b8a6" />
                    </CardHeader>
                    <CardContent className="px-5 pb-5 md:px-6 space-y-3">
                        {[
                            { label: "Dernières 24 h", count: stats.freshness.last24h },
                            { label: "Derniers 3 jours", count: stats.freshness.last3days },
                            { label: "Dernière semaine", count: stats.freshness.lastWeek },
                            { label: "Plus d'une semaine", count: stats.freshness.older },
                        ].map(({ label, count }) => (
                            <BarRow
                                key={label}
                                label={label}
                                count={count}
                                max={stats.total}
                                pct={(count / freshnessTotal) * 100}
                                accent="#14b8a6"
                            />
                        ))}
                    </CardContent>
                </Card>

                <Card className="border-[var(--gb-border)] bg-[var(--gb-app-panel-bg)] shadow-none">
                    <CardHeader className="px-5 pt-5 md:px-6 pb-3">
                        <ChartSection title="Données salariales" icon={TrendingUp} accent="#f59e0b" />
                    </CardHeader>
                    <CardContent className="px-5 pb-5 md:px-6">
                        {stats.salaryCount === 0 ? (
                            <p className="text-sm text-[var(--gb-text-off)]">
                                Aucune donnée salariale structurée disponible pour le moment.
                            </p>
                        ) : (
                            <div className="space-y-4">
                                <div className="grid grid-cols-3 gap-3">
                                    {[
                                        { label: "Minimum", value: stats.minSalary },
                                        { label: "Moyenne", value: stats.avgSalary },
                                        { label: "Maximum", value: stats.maxSalary },
                                    ].map(({ label, value }) => (
                                        <div key={label} className="rounded-xl border border-[var(--gb-border)] px-3 py-3 text-center">
                                            <p className="text-xs text-[var(--gb-text-off)] mb-1">{label}</p>
                                            <p className="text-base font-semibold text-[var(--gb-text)] tabular-nums">
                                                {value !== null
                                                    ? new Intl.NumberFormat("fr-FR", {
                                                          style: "currency",
                                                          currency: "TND",
                                                          maximumFractionDigits: 0,
                                                      }).format(value)
                                                    : "—"}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                                <p className="text-xs text-[var(--gb-text-off)]">
                                    Basé sur {fmt(stats.salaryCount)} offre{stats.salaryCount > 1 ? "s" : ""} avec salaire renseigné
                                    ({fmtPct((stats.salaryCount / Math.max(stats.total, 1)) * 100)} du total).
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </section>

            <Card className="border-[var(--gb-border)] bg-[var(--gb-app-panel-bg)] shadow-none">
                <CardHeader className="px-5 pt-5 md:px-6 pb-3">
                    <ChartSection title="Complétude des données" icon={Activity} accent="#6366f1" />
                </CardHeader>
                <CardContent className="px-5 pb-5 md:px-6">
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {[
                            { label: "Avec description", count: stats.completeness.description, accent: "#6366f1" },
                            { label: "Entreprise renseignée", count: stats.completeness.company, accent: "#2563eb" },
                            { label: "Salaire renseigné", count: stats.completeness.salary, accent: "#f59e0b" },
                            { label: "Compétences listées", count: stats.completeness.skills, accent: "#16a34a" },
                            { label: "Info télétravail", count: stats.completeness.telework, accent: "#14b8a6" },
                            { label: "Niveau d'expérience", count: stats.completeness.expLevel, accent: "#8b5cf6" },
                        ].map(({ label, count, accent }) => {
                            const pct = stats.total ? (count / stats.total) * 100 : 0;
                            return (
                                <div key={label} className="space-y-1.5">
                                    <div className="flex justify-between text-xs">
                                        <span className="text-[var(--gb-text)]">{label}</span>
                                        <span className="text-[var(--gb-text-off)] tabular-nums">
                                            {fmt(count)} <span className="opacity-60">({fmtPct(pct)})</span>
                                        </span>
                                    </div>
                                    <div className="h-1.5 w-full rounded-full bg-[var(--gb-border)]">
                                        <div
                                            className="h-1.5 rounded-full"
                                            style={{ width: `${pct}%`, background: accent }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>

            <section className="grid gap-4 lg:grid-cols-2">
                <Card className="border-[var(--gb-border)] bg-[var(--gb-app-panel-bg)] shadow-none">
                    <CardHeader className="px-5 pt-5 md:px-6 pb-3">
                        <ChartSection title="Sources de scraping" icon={Globe2} accent="#14b8a6" />
                    </CardHeader>
                    <CardContent className="px-5 pb-5 md:px-6 space-y-3">
                        {stats.topSources.length === 0 ? (
                            <p className="text-sm text-[var(--gb-text-off)]">Aucune source détectée.</p>
                        ) : (
                            stats.topSources.map(({ label, count }) => (
                                <BarRow
                                    key={label}
                                    label={label}
                                    count={count}
                                    max={maxSource}
                                    pct={(count / Math.max(stats.total, 1)) * 100}
                                    accent="#14b8a6"
                                />
                            ))
                        )}
                    </CardContent>
                </Card>

                <Card className="border-[var(--gb-border)] bg-[var(--gb-app-panel-bg)] shadow-none">
                    <CardHeader className="px-5 pt-5 md:px-6 pb-3">
                        <ChartSection title="Types d'offres" icon={Briefcase} accent="#8b5cf6" />
                    </CardHeader>
                    <CardContent className="px-5 pb-5 md:px-6 space-y-3">
                        {stats.topTypes.length === 0 ? (
                            <p className="text-sm text-[var(--gb-text-off)]">Aucun type détecté.</p>
                        ) : (
                            stats.topTypes.map(({ label, count }) => (
                                <BarRow
                                    key={label}
                                    label={label}
                                    count={count}
                                    max={maxType}
                                    pct={(count / Math.max(stats.total, 1)) * 100}
                                    accent="#8b5cf6"
                                />
                            ))
                        )}
                    </CardContent>
                </Card>
            </section>

            <section className="grid gap-4 lg:grid-cols-2">
                <Card className="border-[var(--gb-border)] bg-[var(--gb-app-panel-bg)] shadow-none">
                    <CardHeader className="px-5 pt-5 md:px-6 pb-3">
                        <ChartSection title="Types de contrat" icon={Layers} accent="#f97316" />
                    </CardHeader>
                    <CardContent className="px-5 pb-5 md:px-6 space-y-3">
                        {stats.topContracts.length === 0 ? (
                            <p className="text-sm text-[var(--gb-text-off)]">Aucun type de contrat détecté.</p>
                        ) : (
                            stats.topContracts.map(({ label, count }) => (
                                <BarRow
                                    key={label}
                                    label={label}
                                    count={count}
                                    max={maxContract}
                                    pct={(count / Math.max(stats.total, 1)) * 100}
                                    accent="#f97316"
                                />
                            ))
                        )}
                    </CardContent>
                </Card>

                <Card className="border-[var(--gb-border)] bg-[var(--gb-app-panel-bg)] shadow-none">
                    <CardHeader className="px-5 pt-5 md:px-6 pb-3">
                        <ChartSection title="Niveaux d'expérience" icon={Target} accent="#16a34a" />
                    </CardHeader>
                    <CardContent className="px-5 pb-5 md:px-6 space-y-3">
                        {stats.topExpLevels.length === 0 ? (
                            <p className="text-sm text-[var(--gb-text-off)]">Aucun niveau d'expérience détecté.</p>
                        ) : (
                            stats.topExpLevels.map(({ label, count }) => (
                                <BarRow
                                    key={label}
                                    label={label}
                                    count={count}
                                    max={maxExp}
                                    pct={(count / Math.max(stats.total, 1)) * 100}
                                    accent="#16a34a"
                                />
                            ))
                        )}
                    </CardContent>
                </Card>
            </section>

            <Card className="border-[var(--gb-border)] bg-[var(--gb-app-panel-bg)] shadow-none">
                <CardHeader className="px-5 pt-5 md:px-6 pb-3">
                    <ChartSection title="Répartition télétravail" icon={Monitor} accent="#2563eb" />
                </CardHeader>
                <CardContent className="px-5 pb-5 md:px-6">
                    {stats.remoteBreakdown.length === 0 ? (
                        <p className="text-sm text-[var(--gb-text-off)]">Aucune information sur le télétravail.</p>
                    ) : (
                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                            {stats.remoteBreakdown.map(({ label, count }) => {
                                const pct = (count / Math.max(stats.total, 1)) * 100;
                                return (
                                    <div key={label} className="rounded-xl border border-[var(--gb-border)] px-4 py-3">
                                        <p className="text-xs text-[var(--gb-text-off)] truncate mb-1">{label}</p>
                                        <p className="text-xl font-semibold text-[var(--gb-text)] tabular-nums">{fmt(count)}</p>
                                        <p className="text-xs text-[var(--gb-text-off)]">{fmtPct(pct)}</p>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </CardContent>
            </Card>

            <Card className="border-[var(--gb-border)] bg-[var(--gb-app-panel-bg)] shadow-none">
                <CardHeader className="px-5 pt-5 md:px-6 pb-3">
                    <ChartSection title="Principales localisations" icon={MapPin} accent="#f97316" />
                </CardHeader>
                <CardContent className="px-5 pb-5 md:px-6 space-y-3">
                    {stats.topLocations.length === 0 ? (
                        <p className="text-sm text-[var(--gb-text-off)]">Aucune localisation détectée.</p>
                    ) : (
                        stats.topLocations.map(({ label, count }) => (
                            <BarRow
                                key={label}
                                label={label}
                                count={count}
                                max={maxLocation}
                                pct={(count / Math.max(stats.total, 1)) * 100}
                                accent="#f97316"
                            />
                        ))
                    )}
                </CardContent>
            </Card>

            <section className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
                <Card className="border-[var(--gb-border)] bg-[var(--gb-app-panel-bg)] shadow-none">
                    <CardHeader className="px-5 pt-5 md:px-6 pb-3">
                        <ChartSection title="Compétences les plus demandées" icon={Zap} accent="#f59e0b" />
                    </CardHeader>
                    <CardContent className="px-5 pb-5 md:px-6 space-y-3">
                        {stats.topSkills.length === 0 ? (
                            <p className="text-sm text-[var(--gb-text-off)]">Aucune compétence détectée.</p>
                        ) : (
                            stats.topSkills.map(({ label, count }) => (
                                <BarRow
                                    key={label}
                                    label={label}
                                    count={count}
                                    max={maxSkill}
                                    accent="#f59e0b"
                                />
                            ))
                        )}
                    </CardContent>
                </Card>

                <Card className="border-[var(--gb-border)] bg-[var(--gb-app-panel-bg)] shadow-none">
                    <CardHeader className="px-5 pt-5 md:px-6 pb-3">
                        <ChartSection title="Domaines en vogue" icon={Sparkles} accent="#16a34a" />
                    </CardHeader>
                    <CardContent className="px-5 pb-5 md:px-6 space-y-3">
                        {stats.topDomains.length === 0 ? (
                            <p className="text-sm text-[var(--gb-text-off)]">Aucun domaine détecté.</p>
                        ) : (
                            stats.topDomains.map(({ label, count }) => (
                                <BarRow
                                    key={label}
                                    label={label}
                                    count={count}
                                    max={maxDomain}
                                    pct={(count / Math.max(stats.total, 1)) * 100}
                                    accent="#16a34a"
                                />
                            ))
                        )}
                    </CardContent>
                </Card>
            </section>

        </div>
    );
}