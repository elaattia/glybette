import React, { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useOffres } from "@/hooks/useJobs";
import { useJobsRealtime } from "@/hooks/useJobsRealtime";
import { useFullProfile } from "@/hooks/useUserProfile";
import { useAuth } from "@/hooks/useAuth";
import type { OffresFilters } from "@glybette/types";
import { Sparkles, Bell, RefreshCw, X, AlertTriangle } from "lucide-react";

import { JobCard, SkeletonCard } from "./components/JobCard";
import { FiltersPanel } from "./components/FiltersPanel";
import { StatsBar } from "./components/StatsBar";
import { Pagination } from "./components/Pagination";
import { EmptyState } from "./components/EmptyState";
import { listStyles as styles } from "./styles";
import { timeAgo } from "./constants";
import type { OffreWithScore } from "./types";

const API_BASE = (import.meta as any).env?.VITE_API_URL ?? "http://localhost:3000/api";
const SCORE_THRESHOLD = 15;

export default function OpportunitiesPage() {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();
    const { profile } = useFullProfile();

    const [filters, setFilters] = useState<OffresFilters>({ page: 1, limit: 18 });
    const [searchInput, setSearchInput] = useState("");
    const [showFilters, setShowFilters] = useState(false);

    const [aiScoreMap, setAiScoreMap] = useState<Record<string, number>>({});
    const [loadingScores, setLoadingScores] = useState(false);
    const scoresFetchedRef = useRef(false);

    const profileKey = JSON.stringify({
        skills: profile.skills,
        domain: profile.domain,
        journey: profile.journey,
        opportunities: profile.opportunities,
    });

    useEffect(() => {
        scoresFetchedRef.current = false;
        setAiScoreMap({});
    }, [profileKey]);

    const computeLocalScore = useCallback((offre: any): number => {
        const userSkills: string[] = profile.skills ?? [];
        const userDomain: string = profile.domain ?? "";
        const userJourney: string = profile.journey ?? "";

        if (!userSkills.length && !userDomain && !userJourney) return 0;

        let score = 0;
        const offreSkills: string[] = offre.competences ?? [];
        const offreText = `${offre.titre ?? ""} ${offre.description ?? ""} ${offreSkills.join(" ")}`.toLowerCase();

        if (userSkills.length > 0) {
            let matches = 0;
            for (const skill of userSkills) {
                if (offreText.includes(skill.toLowerCase())) matches++;
            }
            score += Math.round((matches / userSkills.length) * 50);
        }

        if (userDomain) {
            const domainWords = userDomain.toLowerCase().split(/[\s,/]+/).filter(Boolean);
            const domainMatches = domainWords.filter((w) => w.length > 2 && offreText.includes(w));
            if (domainMatches.length > 0) {
                score += Math.min(30, Math.round((domainMatches.length / domainWords.length) * 30));
            }
        }

        if (userJourney) {
            const offreExp = (offre.niveau_experience ?? "").toLowerCase();
            const journeyLower = userJourney.toLowerCase();
            if (
                (journeyLower.includes("student") && offreExp.match(/stage|intern|pfe|junior/)) ||
                (journeyLower.includes("graduate") && offreExp.match(/junior|débutant|entry|pfe|stage/)) ||
                (journeyLower.includes("job seeker") && offreExp.match(/junior|mid|confirmé|senior/))
            ) {
                score += 20;
            } else if (!offreExp) {
                score += 10;
            }
        }

        return Math.min(score, 100);
    }, [profileKey]); 

    useEffect(() => {
        if (!isAuthenticated || scoresFetchedRef.current) return;
        const hasProfile = (profile.skills?.length ?? 0) > 0 || !!profile.domain;
        if (!hasProfile) return;
        scoresFetchedRef.current = true;
        setLoadingScores(true);

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

        fetch(`${API_BASE}/jobs/matching/top`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ userProfile, limit: 50 }),
        })
            .then((r) => r.json())
            .then((data) => {
                const map: Record<string, number> = {};
                for (const item of data.matches ?? []) {
                    if (item.offre?._id && item.match?.score) {
                        map[item.offre._id] = item.match.score;
                    }
                }
                setAiScoreMap(map);
            })
            .catch(() => {})
            .finally(() => setLoadingScores(false));
    }, [isAuthenticated, profileKey]);

    const { data, loading, error, refetch } = useOffres(filters as Record<string, unknown>);

    const hasUserProfile = (profile.skills?.length ?? 0) > 0 || !!profile.domain || !!profile.journey;

    const offresRaw: OffreWithScore[] = (data?.offres ?? []).map((o: any) => {
        const localScore = hasUserProfile ? computeLocalScore(o) : 0;
        const aiScore = aiScoreMap[o._id] ?? 0;
        const finalScore = aiScore > 0 ? Math.round((aiScore + localScore) / 2) : localScore;
        return {
            ...o,
            _matchScore: finalScore > 0 ? finalScore : undefined,
            _localScore: localScore,
        };
    });

    const total = data?.total ?? 0;
    const pages = data?.pages ?? 1;
    const currentPage = filters.page ?? 1;

    const getDateMs = (o: any): number => {
        const d = o.date_publication ?? o.date_scraped;
        if (!d) return 0;
        const ms = new Date(d).getTime();
        return isNaN(ms) ? 0 : ms;
    };

    const offres = [...offresRaw].sort((a, b) => {
        const sa = (a._matchScore ?? 0) >= SCORE_THRESHOLD ? a._matchScore! : 0;
        const sb = (b._matchScore ?? 0) >= SCORE_THRESHOLD ? b._matchScore! : 0;
        const aMatched = sa > 0;
        const bMatched = sb > 0;

        if (aMatched && !bMatched) return -1;
        if (!aMatched && bMatched) return 1;

        if (aMatched && bMatched) {
            if (sb !== sa) return sb - sa;
            return getDateMs(b) - getDateMs(a);
        }

        return getDateMs(b) - getDateMs(a);
    });

    const scoredCount = offres.filter((o) => (o._matchScore ?? 0) >= SCORE_THRESHOLD).length;

    const [newOffresCount, setNewOffresCount] = useState(0);
    const [showNewBanner, setShowNewBanner] = useState(false);

    const handleNewOffres = useCallback((count: number) => {
        setNewOffresCount(count);
        setShowNewBanner(true);
    }, []);

    const { lastPolledAt, pollNow } = useJobsRealtime(handleNewOffres);

    function handleRefreshNewOffres() {
        setShowNewBanner(false);
        setNewOffresCount(0);
        setFilters({ page: 1, limit: 18, tri: "recent" as any });
        refetch?.();
    }

    const activeFilters = Object.entries(filters).filter(([k, v]) => {
        if (!v || k === "page" || k === "limit") return false;
        if (k === "tri" && v === "recent") return false;
        return true;
    }) as [keyof OffresFilters, string][];

    const applySearch = useCallback((e: React.FormEvent) => {
        e.preventDefault();
        setFilters((f) => ({ ...f, search: searchInput.trim() || undefined, page: 1 }));
    }, [searchInput]);

    const setFilter = useCallback((key: keyof OffresFilters, value: string) => {
        setFilters((f) => ({ ...f, [key]: (value || undefined) as never, page: 1 }));
    }, []);

    const removeFilter = useCallback((key: keyof OffresFilters) => {
        setFilters((f) => { const next = { ...f }; delete next[key]; next.page = 1; return next; });
        if (key === "search") setSearchInput("");
    }, []);

    const setPage = useCallback((p: number) => {
        setFilters((f) => ({ ...f, page: p }));
        window.scrollTo({ top: 0, behavior: "smooth" });
    }, []);

    const resetAll = () => { setFilters({ page: 1, limit: 18 }); setSearchInput(""); };

    return (
        <div style={styles.page}>
            {showNewBanner && newOffresCount > 0 && (
                <div style={styles.newBanner}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <Bell size={15} style={{ color: "#22c55e" }} />
                        <span style={{ fontWeight: 600, fontSize: 13 }}>
                            {newOffresCount} nouvelle{newOffresCount > 1 ? "s" : ""} offre{newOffresCount > 1 ? "s" : ""} disponible{newOffresCount > 1 ? "s" : ""} !
                        </span>
                    </div>
                    <button onClick={handleRefreshNewOffres} style={styles.newBannerBtn}>
                        <RefreshCw size={13} /> Afficher
                    </button>
                    <button onClick={() => setShowNewBanner(false)} style={styles.newBannerClose}>
                        <X size={13} />
                    </button>
                </div>
            )}

            <div style={styles.header}>
                <div style={styles.label}>Découvrir</div>
                <h1 style={styles.title}>Opportunités</h1>
                <div style={styles.headerSub}>
                    <p style={{ color: "var(--gb-muted)", fontSize: 14, margin: 0 }}>
                        {loading ? "Chargement..." : `${total.toLocaleString("fr-FR")} offres disponibles`}
                        {scoredCount > 0 && !loading && (
                            <span style={{ marginLeft: 10, color: "#22c55e", fontWeight: 600 }}>
                                · {scoredCount} matchées à votre profil
                            </span>
                        )}
                    </p>
                    <span style={styles.liveBadge}>
                        <span style={styles.liveDot} />
                        LIVE
                    </span>
                    {loadingScores && (
                        <span style={{ fontSize: 11, color: "var(--gb-muted)", display: "flex", alignItems: "center", gap: 5 }}>
                            <Sparkles size={11} style={{ color: "#a78bfa", animation: "pulse 1s infinite" }} />
                            Calcul des scores...
                        </span>
                    )}
                    {lastPolledAt && (
                        <span
                            style={{ fontSize: 11, color: "var(--gb-muted)", cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}
                            onClick={pollNow}
                            title="Vérifier les nouvelles offres">
                            <RefreshCw size={10} />
                            Mis à jour {timeAgo(lastPolledAt.toISOString())}
                        </span>
                    )}
                </div>
            </div>

            <FiltersPanel
                filters={filters}
                searchInput={searchInput}
                setSearchInput={setSearchInput}
                showFilters={showFilters}
                setShowFilters={setShowFilters}
                activeFilters={activeFilters}
                setFilter={setFilter}
                removeFilter={removeFilter}
                resetAll={resetAll}
                onSearch={applySearch}
            />

            {!loading && offres.length > 0 && (
                <StatsBar
                    visibleCount={offres.length}
                    total={total}
                    scoredCount={scoredCount}
                />
            )}

            {error && (
                <div style={styles.errorBox}>
                    <AlertTriangle size={14} style={{ marginRight: 8 }} />
                    Impossible de charger les offres. Vérifiez que le jobs-service est démarré.
                </div>
            )}

            {!loading && scoredCount > 0 && (
                <div style={styles.sectionSeparator}>
                    <div style={styles.sectionSepLine} />
                    <span style={styles.sectionSepLabel}>
                        <Sparkles size={11} />
                        Recommandées pour vous ({scoredCount})
                    </span>
                    <div style={styles.sectionSepLine} />
                </div>
            )}

            <div style={styles.grid}>
                {(loading || (isAuthenticated && loadingScores && offres.length === 0 && hasUserProfile))
                    ? Array.from({ length: 9 }).map((_, i) => <SkeletonCard key={i} />)
                    : offres.length === 0
                    ? <EmptyState onReset={resetAll} />
                    : offres.map((offre, idx) => (
                        <React.Fragment key={offre._id}>
                            {idx === scoredCount && scoredCount > 0 && scoredCount < offres.length && (
                                <div style={{ gridColumn: "1 / -1", ...styles.sectionSeparator, margin: "4px 0" }}>
                                    <div style={styles.sectionSepLine} />
                                    <span style={{ ...styles.sectionSepLabel, color: "var(--gb-muted)" }}>
                                        Autres offres ({offres.length - scoredCount})
                                    </span>
                                    <div style={styles.sectionSepLine} />
                                </div>
                            )}
                            <JobCard
                                offre={offre}
                                onClick={() => navigate(`/app/opportunities/${offre._id}`)}
                            />
                        </React.Fragment>
                    ))
                }
            </div>

            {!loading && (
                <Pagination
                    pages={pages}
                    currentPage={currentPage}
                    onPageChange={setPage}
                />
            )}

            <style>{`
                @keyframes shimmer  { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
                @keyframes pulse    { 0%,100%{opacity:1} 50%{opacity:0.4} }
                @keyframes spin     { to{transform:rotate(360deg)} }
                @keyframes slideDown{ from{opacity:0;transform:translateY(-10px)} to{opacity:1;transform:none} }
            `}</style>
        </div>
    );
}