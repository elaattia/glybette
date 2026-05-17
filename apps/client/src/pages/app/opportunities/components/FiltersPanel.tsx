import React from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import type { OffresFilters } from "@glybette/types";
import { FILTER_LABELS } from "../constants";
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

export function FiltersPanel({
    filters, searchInput, setSearchInput,
    showFilters, setShowFilters,
    activeFilters, setFilter, removeFilter, resetAll, onSearch,
}: FiltersPanelProps) {
    return (
        <>
            <form onSubmit={onSearch} style={s.searchRow}>
                <div style={{ position: "relative", flex: 1 }}>
                    <Search size={14} style={s.searchIcon} />
                    <input
                        type="text"
                        style={s.searchInput}
                        placeholder="Rechercher un poste, entreprise, compétence..."
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                    />
                </div>
                <button type="submit" style={s.searchBtn}>Rechercher</button>
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
                    Filtres {activeFilters.length > 0 && <span style={s.filterCount}>{activeFilters.length}</span>}
                </button>
            </form>

            {showFilters && (
                <div style={s.filtersPanel}>
                    <div style={s.filtersGrid}>
                        {[
                            { label: "Type d'offre", key: "type_offre", options: [["", "Tous"], ["emploi", "Emploi"], ["stage", "Stage"], ["pfe", "PFE"], ["opportunite", "Opportunité"]] },
                            { label: "Source",        key: "source",     options: [["", "Toutes"], ["indeed", "Indeed"], ["linkedin", "LinkedIn"], ["welcometothejungle", "WTTJ"], ["pfebooks.com", "PFEBooks"]] },
                            { label: "Mode de travail", key: "teletravail", options: [["", "Tous"], ["remote", "Full Remote"], ["hybrid", "Hybride"], ["onsite", "Présentiel"]] },
                            { label: "Publié",        key: "date_posted", options: [["", "Toute période"], ["this_hour", "Cette heure"], ["today", "Aujourd'hui"], ["3days", "3 derniers jours"], ["this_week", "Cette semaine"]] },
                            { label: "Niveau",        key: "niveau_experience", options: [["", "Tous"], ["junior", "Junior"], ["mid", "Intermédiaire"], ["senior", "Senior"]] },
                            { label: "Trier par",     key: "tri",        options: [["recent", "Plus récents"], ["vues", "Plus vus"]] },
                        ].map(({ label, key, options }) => (
                            <div key={key} style={s.filterGroup}>
                                <div style={s.filterLabel}>{label}</div>
                                <select
                                    style={s.select}
                                    value={(filters as any)[key] ?? ""}
                                    onChange={(e) => setFilter(key as keyof OffresFilters, e.target.value)}>
                                    {options.map(([val, lbl]) => (
                                        <option key={val} value={val}>{lbl}</option>
                                    ))}
                                </select>
                            </div>
                        ))}
                        <div style={s.filterGroup}>
                            <div style={s.filterLabel}>Localisation</div>
                            <input
                                type="text"
                                placeholder="Ex: Tunis, Paris..."
                                value={filters.localisation ?? ""}
                                onChange={(e) => setFilter("localisation", e.target.value)}
                                style={{ ...s.select, appearance: "none" as any }}
                            />
                        </div>
                    </div>
                    {activeFilters.length > 0 && (
                        <button onClick={resetAll} style={s.resetBtn}>
                            <X size={12} /> Réinitialiser tous les filtres
                        </button>
                    )}
                </div>
            )}

            {activeFilters.length > 0 && (
                <div style={s.activeFilters}>
                    {activeFilters.map(([key, value]) => {
                        const label = FILTER_LABELS[key]?.[value] ?? value;
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