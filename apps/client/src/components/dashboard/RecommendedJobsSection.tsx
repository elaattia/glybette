import { Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useFullProfile } from "@/hooks/useUserProfile";
import { useAuth } from "@/hooks/useAuth";
import type { AppLocale } from "@/i18n";
import { formatDate } from "@/lib/locale-format";
import { getJobsApiUrl } from "@/lib/env";
const SESSION_MATCHES_KEY = "glybette-dashboard-matches";
const SESSION_FETCHED_KEY = "glybette-dashboard-matching-fetched";

interface JobMatch {
    match: { score: number; explication: string };
    offre: {
        _id: string;
        titre: string;
        entreprise?: string;
        localisation?: string;
        competences: string[];
        type_offre: string;
        date_scraped: string;
        lien_original: string;
    };
}

function scoreColor(score: number) {
    if (score >= 85) return "#22c55e";
    if (score >= 65) return "#f59e0b";
    return "#ef4444";
}

async function fetchOffresFallback(): Promise<JobMatch[]> {
    const res = await fetch(getJobsApiUrl("/offres?limit=3"), { credentials: "include" });
    const data = await res.json();
    return (data.offres ?? []).map((o: JobMatch["offre"]) => ({
        match: { score: 0, explication: "" },
        offre: o,
    }));
}

export default function RecommendedJobsSection() {
    const { t, i18n } = useTranslation("dashboard");
    const locale = (i18n.language === "fr" ? "fr" : "en") as AppLocale;
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();
    const { profile, hasProfile, isProfileReady } = useFullProfile();

    const [matches, setMatches] = useState<JobMatch[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!isAuthenticated || !isProfileReady) return;

        const cached = sessionStorage.getItem(SESSION_MATCHES_KEY);
        if (cached) {
            try {
                setMatches(JSON.parse(cached));
                return;
            } catch {
                sessionStorage.removeItem(SESSION_MATCHES_KEY);
            }
        }

        if (sessionStorage.getItem(SESSION_FETCHED_KEY)) return;

        const userProfile = {
            summary: profile.summary ?? "",
            skills: profile.skills ?? [],
            experience: profile.experience ?? [],
            education: profile.education ?? [],
            languages: profile.languages ?? [],
            lookingFor: profile.opportunities ?? [],
            domain: profile.domain,
            journey: profile.journey,
        };

        setLoading(true);

        const loadFallback = () =>
            fetchOffresFallback()
                .then((fallback) => {
                    setMatches(fallback);
                    sessionStorage.setItem(SESSION_MATCHES_KEY, JSON.stringify(fallback));
                })
                .catch(() => {});

        if (!hasProfile) {
            loadFallback().finally(() => {
                sessionStorage.setItem(SESSION_FETCHED_KEY, "1");
                setLoading(false);
            });
            return;
        }

        fetch(getJobsApiUrl("/matching/top"), {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ userProfile, limit: 3 }),
        })
            .then((res) => {
                if (!res.ok) throw new Error(`${res.status}`);
                return res.json();
            })
            .then((data) => {
                const result = (data.matches ?? []).slice(0, 3);
                setMatches(result);
                sessionStorage.setItem(SESSION_MATCHES_KEY, JSON.stringify(result));
                sessionStorage.setItem(SESSION_FETCHED_KEY, "1");
            })
            .catch(() => loadFallback().finally(() => {
                sessionStorage.setItem(SESSION_FETCHED_KEY, "1");
            }))
            .finally(() => setLoading(false));
    }, [isAuthenticated, isProfileReady, hasProfile]);

    const typeColors: Record<string, string> = {
        emploi: "#22c55e",
        stage: "#38bdf8",
        pfe: "#a78bfa",
        opportunite: "#fb923c",
    };

    const background = profile.domain ?? profile.journey ?? t("recommendedJobs.defaultBackground");

    return (
        <Card className="border-[var(--gb-border)] bg-[var(--gb-app-panel-bg)] py-0 shadow-none">
            <CardHeader className="px-5 pt-5 md:px-6">
                <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-[#a78bfa]" />
                        <CardTitle className="text-lg text-[var(--gb-text)]">{t("recommendedJobs.title")}</CardTitle>
                    </div>
                    <Button
                        variant="link"
                        className="h-auto p-0 text-sm text-[#16A34A]"
                        onClick={() => navigate("/app/opportunities")}>
                        {t("recommendedJobs.seeAll")}
                    </Button>
                </div>
                <p className="text-sm text-[var(--gb-muted)]">
                    {hasProfile
                        ? t("recommendedJobs.matchedSubtitle", { background })
                        : t("recommendedJobs.genericSubtitle")}
                </p>
            </CardHeader>

            <CardContent className="px-5 pb-5 md:px-6 md:pb-6">
                {!isAuthenticated ? (
                    <p className="text-sm text-[var(--gb-muted)]">{t("recommendedJobs.signInPrompt")}</p>
                ) : loading ? (
                    <div className="grid gap-3 md:grid-cols-3">
                        {[1, 2, 3].map((i) => (
                            <div
                                key={i}
                                className="animate-pulse rounded-xl border border-[var(--gb-border)] bg-[var(--gb-bg)] h-36"
                            />
                        ))}
                    </div>
                ) : matches.length === 0 ? (
                    <div className="text-center py-8">
                        <p className="text-sm text-[var(--gb-muted)] mb-3">{t("recommendedJobs.empty")}</p>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate("/app/opportunities")}
                            className="border-[var(--gb-border)]">
                            {t("recommendedJobs.browseAll")}
                        </Button>
                    </div>
                ) : (
                    <div className="grid gap-3 md:grid-cols-3">
                        {matches.map(({ match, offre }) => (
                            <article
                                key={offre._id}
                                className="rounded-xl border border-[var(--gb-border)] bg-[var(--gb-bg)] p-4 transition hover:border-[var(--gb-app-ring)] cursor-pointer"
                                onClick={() => navigate(`/app/opportunities/${offre._id}`)}>

                                {match.score > 0 && (
                                    <Badge
                                        className="mb-3 rounded-full text-xs font-bold"
                                        style={{
                                            background: `${scoreColor(match.score)}1A`,
                                            color: scoreColor(match.score),
                                            border: `1px solid ${scoreColor(match.score)}44`,
                                        }}>
                                        <Sparkles className="h-2.5 w-2.5 mr-1" />
                                        {t("recommendedJobs.matchBadge", { score: match.score })}
                                    </Badge>
                                )}

                                <h3 className="text-sm font-semibold text-[var(--gb-text)] leading-tight mb-1">
                                    {offre.titre}
                                </h3>
                                <p className="text-xs text-[var(--gb-muted)] mb-2">
                                    {offre.entreprise ?? t("recommendedJobs.unknownCompany")}
                                    {offre.localisation ? ` • ${offre.localisation}` : ""}
                                </p>

                                <div className="flex flex-wrap gap-1 mb-3">
                                    <Badge
                                        variant="outline"
                                        className="text-[10px] rounded-md border-0"
                                        style={{
                                            background: `${typeColors[offre.type_offre] ?? "#94a3b8"}15`,
                                            color: typeColors[offre.type_offre] ?? "#94a3b8",
                                        }}>
                                        {offre.type_offre}
                                    </Badge>
                                    {offre.competences.slice(0, 2).map((tag) => (
                                        <Badge
                                            key={tag}
                                            variant="outline"
                                            className="text-[10px] rounded-md border-[var(--gb-border)] text-[var(--gb-muted)]">
                                            {tag}
                                        </Badge>
                                    ))}
                                </div>

                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] text-[var(--gb-muted)]">
                                        {formatDate(offre.date_scraped, locale, {
                                            day: "numeric",
                                            month: "short",
                                        })}
                                    </span>
                                    <Button
                                        type="button"
                                        variant="link"
                                        className="h-auto p-0 text-xs text-[#16A34A]"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            navigate(`/app/opportunities/${offre._id}`);
                                        }}>
                                        {t("recommendedJobs.view")}
                                    </Button>
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
