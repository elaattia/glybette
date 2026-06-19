import React from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import type { OffresFilters } from "@glybette/types";
import { useLocale } from "@/hooks/useLocale";
import { getFilterLabel } from "../constants";
import { listStyles as s } from "../styles";

interface FiltersPanelProps {
    filters: OffresFilters;
    searchInput: string;
    setSearchInput: (v: string) => void;
    showFilters: boolean;
    setShowFilters: (v: boolean) => void;
    activeFilters: [keyof OffresFilters, string][];
    setFilter: (key: keyof OffresFilters, value: string) => void;
    removeFilter: (key: keyof OffresFilters) => void;
    resetAll: () => void;
    onSearch: (e: React.FormEvent) => void;
}

type FilterGroupKey = "type_offre" | "source" | "teletravail" | "date_posted" | "niveau_experience" | "tri";

const FILTER_GROUPS: { key: FilterGroupKey; values: string[]; allKey?: "all" | "allFeminine" | "allPeriod" }[] = [
    { key: "type_offre", values: ["", "emploi", "stage", "pfe", "opportunite"], allKey: "all" },
    { key: "source", values: ["", "indeed", "linkedin", "welcometothejungle", "pfebooks.com"], allKey: "allFeminine" },
    { key: "teletravail", values: ["", "remote", "hybrid", "onsite"], allKey: "all" },
    { key: "date_posted", values: ["", "this_hour", "today", "3days", "this_week"], allKey: "allPeriod" },
    { key: "niveau_experience", values: ["", "junior", "mid", "senior"], allKey: "all" },
    { key: "tri", values: ["recent", "vues"] },
];

export function FiltersPanel({
    filters, searchInput, setSearchInput,
    showFilters, setShowFilters,
    activeFilters, setFilter, removeFilter, resetAll, onSearch,
}: FiltersPanelProps) {
    const { t } = useLocale("opportunities");

    const optionLabel = (groupKey: FilterGroupKey, value: string, allKey?: string) => {
        if (value === "" && allKey) return t(`filters.options.${allKey}`);
        if (groupKey === "tri") return t(`filters.options.${value}`);
        return getFilterLabel(t, groupKey, value);
    };

    return (
        <>
            <form onSubmit={onSearch} style={s.searchRow}>
                <div style={{ position: "relative", flex: 1 }}>
                    <Search size={14} style={s.searchIcon} />
                    <input
                        type="text"
                        style={s.searchInput}
                        placeholder={t("filters.searchPlaceholder")}
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                    />
                </div>
                <button type="submit" style={s.searchBtn}>{t("filters.search")}</button>
                <button
                    type="button"
                    onClick={() => setShowFilters(!showFilters)}
                    style={{
                        ...s.filterToggleBtn,
                        borderColor: showFilters ? "rgba(22,163,74,0.5)" : "var(--gb-border)",
                        color: showFilters ? "#22c55e" : "var(--gb-muted)",
                        background: showFilters ? "rgba(22,163,74,0.08)" : "transparent",
                    }}>
                    <SlidersHorizontal size={14} />
                    {t("filters.filters")} {activeFilters.length > 0 && <span style={s.filterCount}>{activeFilters.length}</span>}
                </button>
            </form>

            {showFilters && (
                <div style={s.filtersPanel}>
                    <div style={s.filtersGrid}>
                        {FILTER_GROUPS.map(({ key, values, allKey }) => (
                            <div key={key} style={s.filterGroup}>
                                <div style={s.filterLabel}>{t(`filters.groups.${key}`)}</div>
                                <select
                                    style={s.select}
                                    value={(filters as any)[key] ?? (key === "tri" ? "recent" : "")}
                                    onChange={(e) => setFilter(key as keyof OffresFilters, e.target.value)}>
                                    {values.map((val) => (
                                        <option key={val || "all"} value={val}>
                                            {optionLabel(key, val, allKey)}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        ))}
                        <div style={s.filterGroup}>
                            <div style={s.filterLabel}>{t("filters.groups.localisation")}</div>
                            <input
                                type="text"
                                placeholder={t("filters.locationPlaceholder")}
                                value={filters.localisation ?? ""}
                                onChange={(e) => setFilter("localisation", e.target.value)}
                                style={{ ...s.select, appearance: "none" as any }}
                            />
                        </div>
                    </div>
                    {activeFilters.length > 0 && (
                        <button onClick={resetAll} style={s.resetBtn}>
                            <X size={12} /> {t("filters.resetAll")}
                        </button>
                    )}
                </div>
            )}

            {activeFilters.length > 0 && (
                <div style={s.activeFilters}>
                    {activeFilters.map(([key, value]) => {
                        const label = getFilterLabel(t, key as string, value) || value;
                        return (
                            <div key={key} style={s.filterChip}>
                                {label}
                                <button onClick={() => removeFilter(key)} style={s.chipRemove}><X size={10} /></button>
                            </div>
                        );
                    })}
                </div>
            )}
        </>
    );
}
