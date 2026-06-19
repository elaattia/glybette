import React, { useState, useCallback } from "react";
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
import {
    computeRecommendationScore,
    RECOMMENDATION_THRESHOLD,
    type UserProfileSignals,
    type OffreSignals,
} from "./utils/scoring";

export default function OpportunitiesPage() {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();
    const { profile } = useFullProfile();


    const [filters, setFilters] = useState<OffresFilters>({ page: 1, limit: 100 });
    const [searchInput, setSearchInput] = useState("");
    const [showFilters, setShowFilters] = useState(false);

    const profileSignals: UserProfileSignals = {
        skills: profile.skills ?? [],
        domain: profile.domain ?? "",
        journey: profile.journey ?? "",
        opportunities: profile.opportunities ?? [],
    };

    const hasUserProfile =
        profileSignals.skills.length > 0 ||
        !!profileSignals.domain ||
        !!profileSignals.journey;

    const profileKey = JSON.stringify(profileSignals);

    const { data, loading, error, refetch } = useOffres(filters as Record<string, unknown>);

    const offresRaw: OffreWithScore[] = React.useMemo(() => {
        const rawOffres: any[] = data?.offres ?? [];

        if (!hasUserProfile) {
            return rawOffres.map((o) => ({ ...o, _sortScore: 0, _isRecommended: false }));
        }

        return rawOffres.map((o) => {
            const offreSignals: OffreSignals = {
                titre: o.titre ?? "",
                competences: o.competences ?? [],
                niveau_experience: o.niveau_experience ?? "",
                type_offre: o.type_offre ?? "",
                description: o.description,
                domaine: o.domaine,
            };

            const sortScore = computeRecommendationScore(offreSignals, profileSignals);
            return {
                ...o,
                _sortScore: sortScore,
                _isRecommended: sortScore >= RECOMMENDATION_THRESHOLD,
            };
        });
    }, [data?.offres, profileKey, hasUserProfile]);

    const getDateMs = (o: any): number => {
        const d = o.date_publication ?? o.date_scraped;
        if (!d) return 0;
        const ms = new Date(d).getTime();
        return isNaN(ms) ? 0 : ms;
    };

    const offres = React.useMemo(() => {
        return [...offresRaw].sort((a, b) => {
            const aRec = a._isRecommended ? 1 : 0;
            const bRec = b._isRecommended ? 1 : 0;

            if (aRec !== bRec) return bRec - aRec;

            const sDiff = (b._sortScore ?? 0) - (a._sortScore ?? 0);
            if (sDiff !== 0) return sDiff;

            return getDateMs(b) - getDateMs(a);
        });
    }, [offresRaw]);

    const total = data?.total ?? 0;
    const pages = data?.pages ?? 1;
    const currentPage = filters.page ?? 1;
    const recommendedCount = offres.filter((o) => o._isRecommended).length;

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
        setFilters({ page: 1, limit: 100 });
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

    const resetAll = () => { setFilters({ page: 1, limit: 100 }); setSearchInput(""); };

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
                        {recommendedCount > 0 && !loading && (
                            <span style={{ marginLeft: 10, color: "#22c55e", fontWeight: 600 }}>
                                · {recommendedCount} recommandées pour vous
                            </span>
                        )}
                    </p>
                    <span style={styles.liveBadge}>
                        <span style={styles.liveDot} />
                        LIVE
                    </span>
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

            <div style={{ display: "flex", gap: "8px", marginBottom: "16px", padding: "4px", background: "var(--gb-app-panel-bg)", borderRadius: "8px", border: "1px solid var(--gb-border)", width: "fit-content" }}>
                <button
                    onClick={() => setFilter("source", "")}
                    style={{
                        padding: "6px 12px",
                        borderRadius: "6px",
                        fontSize: "13px",
                        fontWeight: !filters.source ? 600 : 500,
                        background: !filters.source ? "var(--gb-surface)" : "transparent",
                        color: !filters.source ? "var(--gb-text)" : "var(--gb-muted)",
                        border: !filters.source ? "1px solid var(--gb-border)" : "1px solid transparent",
                        cursor: "pointer",
                        transition: "all 0.2s"
                    }}
                >
                    Toutes les offres
                </button>
                <button
                    onClick={() => setFilter("source", "entreprise_partenaire")}
                    style={{
                        padding: "6px 12px",
                        borderRadius: "6px",
                        fontSize: "13px",
                        fontWeight: filters.source === "entreprise_partenaire" ? 600 : 500,
                        background: filters.source === "entreprise_partenaire" ? "rgba(22,163,74,0.1)" : "transparent",
                        color: filters.source === "entreprise_partenaire" ? "#16A34A" : "var(--gb-muted)",
                        border: filters.source === "entreprise_partenaire" ? "1px solid rgba(22,163,74,0.3)" : "1px solid transparent",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        transition: "all 0.2s"
                    }}
                >
                    <Sparkles size={14} /> Offres Partenaires
                </button>
                <button
                    onClick={() => setFilter("source", "scraped")}
                    style={{
                        padding: "6px 12px",
                        borderRadius: "6px",
                        fontSize: "13px",
                        fontWeight: filters.source === "scraped" ? 600 : 500,
                        background: filters.source === "scraped" ? "var(--gb-surface)" : "transparent",
                        color: filters.source === "scraped" ? "var(--gb-text)" : "var(--gb-muted)",
                        border: filters.source === "scraped" ? "1px solid var(--gb-border)" : "1px solid transparent",
                        cursor: "pointer",
                        transition: "all 0.2s"
                    }}
                >
                    Offres Scrapées
                </button>
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
                    recommendedCount={recommendedCount}
                />
            )}

            {error && (
                <div style={styles.errorBox}>
                    <AlertTriangle size={14} style={{ marginRight: 8 }} />
                    Impossible de charger les offres. Vérifiez que le jobs-service est démarré.
                </div>
            )}

            {!loading && recommendedCount > 0 && (
                <div style={styles.sectionSeparator}>
                    <div style={styles.sectionSepLine} />
                    <span style={styles.sectionSepLabel}>
                        <Sparkles size={11} />
                        Recommandées pour vous ({recommendedCount})
                    </span>
                    <div style={styles.sectionSepLine} />
                </div>
            )}

            <div style={styles.grid}>
                {loading ? (
                    Array.from({ length: 9 }).map((_, i) => <SkeletonCard key={i} />)
                ) : offres.length === 0 ? (
                    <EmptyState onReset={resetAll} />
                ) : (
                    offres.map((offre, idx) => (
                        <React.Fragment key={offre._id}>
                            {idx === recommendedCount && recommendedCount > 0 && recommendedCount < offres.length && (
                                <div style={{ gridColumn: "1 / -1", ...styles.sectionSeparator, margin: "4px 0" }}>
                                    <div style={styles.sectionSepLine} />
                                    <span style={{ ...styles.sectionSepLabel, color: "var(--gb-muted)" }}>
                                        Autres offres ({offres.length - recommendedCount})
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
                )}
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