import { useState, useCallback, useRef } from "react";
import { useOffres, useOffre } from "@/hooks/useScraping";
import type { Offre, OffresFilters, TypeOffre, SourceSite } from "@glybette/types";

const TYPE_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
    emploi: { bg: "rgba(22,163,74,0.12)", text: "#22c55e", dot: "#22c55e" },
    stage: { bg: "rgba(2,132,199,0.12)", text: "#38bdf8", dot: "#38bdf8" },
    pfe: { bg: "rgba(139,92,246,0.12)", text: "#a78bfa", dot: "#a78bfa" },
    opportunite: { bg: "rgba(251,146,60,0.12)", text: "#fb923c", dot: "#fb923c" },
};
const FALLBACK_COLORS = { bg: "rgba(255,255,255,0.06)", text: "#94a3b8", dot: "#94a3b8" };

const SOURCE_ICONS: Record<SourceSite, string> = {
    indeed: "🔵",
    linkedin: "💼",
    welcometothejungle: "🌿",
    "pfebooks.com": "📚",
};
const SOURCE_LABELS: Record<SourceSite, string> = {
    indeed: "Indeed",
    linkedin: "LinkedIn",
    welcometothejungle: "WTTJ",
    "pfebooks.com": "PFEBooks",
};

function getTypeColors(type: string) {
    return TYPE_COLORS[type?.toLowerCase()] ?? FALLBACK_COLORS;
}

function timeAgo(dateStr?: string | null): string {
    if (!dateStr) return "Récemment";
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return "Récemment";
    const diff = Math.floor((Date.now() - date.getTime()) / 1000);
    if (diff < 0) return "À l'instant";
    if (diff < 60) return "À l'instant";
    if (diff < 3600) return `Il y a ${Math.floor(diff / 60)}min`;
    if (diff < 86400) return `Il y a ${Math.floor(diff / 3600)}h`;
    if (diff < 604800) return `Il y a ${Math.floor(diff / 86400)}j`;
    return date.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}

function getDisplayDate(offre: Offre): string {
    if (offre.date_publication) {
        return timeAgo(offre.date_publication);
    }
    return timeAgo(offre.date_scraped);
}

function getFullDate(offre: Offre): string {
    const d = offre.date_publication ?? offre.date_scraped;
    if (!d) return "";
    const date = new Date(d);
    if (isNaN(date.getTime())) return "";
    return date.toLocaleString("fr-FR", {
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

const styles = `
  .opp-page { min-height: 100vh; font-family: 'DM Sans', sans-serif; color: var(--gb-text); }

  /* Header */
  .opp-header { margin-bottom: 24px; }
  .opp-header h1 {
    font-family: 'Bricolage Grotesque', sans-serif;
    font-size: clamp(1.6rem, 3vw, 2.2rem); font-weight: 800;
    letter-spacing: -0.04em; color: var(--gb-text); margin: 4px 0 6px;
  }
  .opp-header-sub { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
  .opp-header-sub p { color: var(--gb-muted); font-size: 0.875rem; margin: 0; }
  .opp-live-badge {
    display: inline-flex; align-items: center; gap: 5px; padding: 3px 10px;
    border-radius: 100px; font-size: 0.68rem; font-weight: 700;
    background: rgba(22,163,74,0.12); border: 1px solid rgba(22,163,74,0.3); color: #22c55e;
  }
  .opp-live-dot { width: 6px; height: 6px; border-radius: 50%; background: #22c55e; animation: livePulse 2s ease-in-out infinite; }
  @keyframes livePulse { 0%,100%{opacity:1} 50%{opacity:0.3} }

  /* Toolbar row 1 - search */
  .opp-search-row { display: flex; gap: 10px; margin-bottom: 10px; }
  .opp-search-wrap { position: relative; flex: 1; }
  .opp-search-icon { position: absolute; left: 13px; top: 50%; transform: translateY(-50%); color: var(--gb-muted); pointer-events: none; }
  .opp-search {
    width: 100%; height: 42px; padding: 0 14px 0 40px;
    background: var(--gb-app-panel-bg); border: 1px solid var(--gb-border);
    border-radius: 12px; color: var(--gb-text); font-size: 0.875rem;
    font-family: 'DM Sans', sans-serif; outline: none;
    transition: border-color 0.2s, box-shadow 0.2s;
  }
  .opp-search::placeholder { color: var(--gb-muted); }
  .opp-search:focus { border-color: var(--gb-app-ring); box-shadow: 0 0 0 3px rgba(22,163,74,0.12); }
  .opp-btn-search {
    height: 42px; padding: 0 20px; border-radius: 12px; flex-shrink: 0;
    background: linear-gradient(90deg, #16A34A, #0284C7); border: none;
    color: #fff; font-family: 'DM Sans', sans-serif; font-size: 0.875rem;
    font-weight: 600; cursor: pointer; transition: opacity 0.2s, transform 0.15s; white-space: nowrap;
  }
  .opp-btn-search:hover { opacity: 0.9; transform: translateY(-1px); }

  /* Toolbar row 2 - filters */
  .opp-filters-row {
    display: flex; gap: 8px; flex-wrap: wrap; align-items: center; margin-bottom: 18px;
  }
  .opp-select {
    height: 36px; padding: 0 30px 0 11px;
    background: var(--gb-app-panel-bg); border: 1px solid var(--gb-border);
    border-radius: 10px; color: var(--gb-text); font-size: 0.8rem;
    font-family: 'DM Sans', sans-serif; outline: none; cursor: pointer; appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%237a9ab5' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");
    background-repeat: no-repeat; background-position: right 9px center;
    transition: border-color 0.2s; min-width: 0;
  }
  .opp-select:focus { border-color: var(--gb-app-ring); outline: none; }
  .opp-select.active { border-color: rgba(22,163,74,0.5); color: #22c55e; background-color: rgba(22,163,74,0.06); }
  .opp-select option { background: var(--gb-surface); color: var(--gb-text); }

  .opp-filter-sep { width: 1px; height: 20px; background: var(--gb-border); flex-shrink: 0; }

  .opp-active-filters { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 14px; }
  .opp-filter-chip {
    display: inline-flex; align-items: center; gap: 5px; padding: 3px 10px 3px 11px;
    border-radius: 100px; font-size: 0.72rem; font-weight: 600;
    background: rgba(22,163,74,0.1); border: 1px solid rgba(22,163,74,0.25); color: #22c55e;
  }
  .opp-filter-chip button {
    display: flex; align-items: center; background: transparent; border: none;
    cursor: pointer; color: #22c55e; padding: 0; font-size: 0.75rem; margin-left: 2px;
    opacity: 0.7; transition: opacity 0.15s;
  }
  .opp-filter-chip button:hover { opacity: 1; }

  /* Stats bar */
  .opp-stats-bar {
    display: flex; align-items: center; gap: 14px; margin-bottom: 18px;
    padding: 9px 14px; background: var(--gb-app-panel-bg);
    border: 1px solid var(--gb-border); border-radius: 10px; flex-wrap: wrap;
  }
  .opp-stat-sep { width: 1px; height: 14px; background: var(--gb-border); flex-shrink: 0; }
  .opp-stat-item { display: flex; align-items: center; gap: 6px; font-size: 0.76rem; color: var(--gb-muted); }
  .opp-stat-dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }
  .opp-stat-count { font-weight: 700; color: var(--gb-text); }

  /* Grid */
  .opp-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(310px, 1fr)); gap: 14px; }

  /* Job Card */
  .job-card {
    background: var(--gb-app-panel-bg); border: 1px solid var(--gb-border);
    border-radius: 16px; padding: 18px; cursor: pointer;
    transition: border-color 0.25s, transform 0.2s, box-shadow 0.25s, background 0.2s;
    position: relative; overflow: hidden; display: flex; flex-direction: column; gap: 11px;
  }
  .job-card::after {
    content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px;
    background: linear-gradient(90deg, #16A34A, #0284C7); opacity: 0; transition: opacity 0.25s;
  }
  .job-card:hover { border-color: var(--gb-app-active-border); transform: translateY(-3px); box-shadow: 0 12px 36px rgba(0,0,0,0.25); background: var(--gb-app-hover); }
  .job-card:hover::after { opacity: 1; }

  .job-top { display: flex; align-items: flex-start; gap: 11px; }
  .job-logo {
    width: 40px; height: 40px; border-radius: 10px; border: 1px solid var(--gb-border);
    overflow: hidden; flex-shrink: 0; display: flex; align-items: center;
    justify-content: center; background: var(--gb-bg3); font-size: 1.1rem;
  }
  .job-logo img { width: 100%; height: 100%; object-fit: cover; }
  .job-meta { flex: 1; min-width: 0; }
  .job-title {
    font-family: 'Bricolage Grotesque', sans-serif; font-size: 0.95rem; font-weight: 700;
    color: var(--gb-text); margin: 0 0 3px; letter-spacing: -0.02em; line-height: 1.3;
    display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
  }
  .job-company { font-size: 0.78rem; color: var(--gb-muted); font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

  .job-tags { display: flex; flex-wrap: wrap; gap: 5px; }
  .job-tag { display: inline-flex; align-items: center; gap: 4px; padding: 3px 9px; border-radius: 100px; font-size: 0.68rem; font-weight: 700; text-transform: capitalize; }
  .job-tag-dot { width: 5px; height: 5px; border-radius: 50%; flex-shrink: 0; }
  .job-tag-outline { display: inline-flex; align-items: center; padding: 3px 8px; border-radius: 100px; font-size: 0.68rem; font-weight: 500; background: transparent; border: 1px solid var(--gb-border); color: var(--gb-muted); }

  .job-skills { display: flex; flex-wrap: wrap; gap: 4px; }
  .job-skill { padding: 2px 7px; border-radius: 5px; font-size: 0.66rem; font-weight: 600; background: rgba(22,163,74,0.08); border: 1px solid rgba(22,163,74,0.18); color: #22c55e; }
  .job-skill-more { font-size: 0.66rem; color: var(--gb-muted); padding: 2px 3px; align-self: center; }

  .job-footer { display: flex; align-items: center; justify-content: space-between; gap: 6px; padding-top: 10px; border-top: 1px solid var(--gb-border); margin-top: auto; }
  .job-footer-left { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; min-width: 0; overflow: hidden; }
  .job-location { display: flex; align-items: center; gap: 3px; font-size: 0.72rem; color: var(--gb-muted); max-width: 130px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .job-time { font-size: 0.7rem; color: var(--gb-muted2); white-space: nowrap; }
  .job-source { font-size: 0.68rem; color: var(--gb-muted2); display: flex; align-items: center; gap: 3px; white-space: nowrap; flex-shrink: 0; }

  /* Skeleton */
  .opp-skeleton { background: var(--gb-app-panel-bg); border: 1px solid var(--gb-border); border-radius: 16px; padding: 18px; }
  .sk-line { border-radius: 6px; background: linear-gradient(90deg, var(--gb-bg3) 25%, var(--gb-surface2) 50%, var(--gb-bg3) 75%); background-size: 200% 100%; animation: sk-shimmer 1.5s infinite; }
  @keyframes sk-shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }

  /* Empty */
  .opp-empty { grid-column: 1 / -1; display: flex; flex-direction: column; align-items: center; padding: 72px 20px; text-align: center; gap: 10px; }
  .opp-empty-icon { font-size: 2.8rem; opacity: 0.35; }
  .opp-empty h3 { font-family: 'Bricolage Grotesque', sans-serif; font-size: 1.1rem; font-weight: 700; color: var(--gb-text-off); margin: 0; }
  .opp-empty p { font-size: 0.85rem; color: var(--gb-muted); margin: 0; }
  .opp-btn-ghost { margin-top: 4px; padding: 8px 18px; border-radius: 10px; font-size: 0.85rem; background: transparent; border: 1px solid var(--gb-border2); color: var(--gb-text-off); font-family: 'DM Sans', sans-serif; cursor: pointer; transition: all 0.2s; }
  .opp-btn-ghost:hover { border-color: var(--gb-app-ring); color: var(--gb-text); }

  /* Error */
  .opp-error { padding: 14px 18px; margin-bottom: 20px; border-radius: 12px; background: rgba(239,68,68,0.08); border: 1px solid rgba(239,68,68,0.2); color: #fca5a5; font-size: 0.875rem; display: flex; align-items: center; gap: 10px; }

  /* Pagination */
  .opp-pagination { display: flex; align-items: center; justify-content: center; gap: 6px; margin-top: 32px; flex-wrap: wrap; }
  .opp-pager { min-width: 34px; height: 34px; padding: 0 7px; border-radius: 8px; border: 1px solid var(--gb-border); background: var(--gb-app-panel-bg); color: var(--gb-muted); font-size: 0.82rem; font-family: 'DM Sans', sans-serif; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; justify-content: center; }
  .opp-pager:hover:not(:disabled):not(.active) { border-color: var(--gb-app-ring); color: var(--gb-text); background: var(--gb-app-hover); }
  .opp-pager.active { background: linear-gradient(90deg,#16A34A,#0284C7); border-color: transparent; color: #fff; font-weight: 700; }
  .opp-pager:disabled { opacity: 0.35; cursor: not-allowed; }

  /* ── Modal ── */
  .opp-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.75); backdrop-filter: blur(10px); z-index: 200; display: flex; align-items: center; justify-content: center; padding: 16px; animation: opp-fade 0.15s ease; }
  @keyframes opp-fade { from{opacity:0} to{opacity:1} }
  .opp-modal { width: 100%; max-width: 680px; max-height: 92vh; background: var(--gb-app-panel-bg); border: 1px solid var(--gb-border2); border-radius: 22px; overflow: hidden; display: flex; flex-direction: column; animation: opp-up 0.22s cubic-bezier(0.16,1,0.3,1); box-shadow: 0 40px 100px rgba(0,0,0,0.6); }
  @keyframes opp-up { from{opacity:0;transform:translateY(24px) scale(0.97)} to{opacity:1;transform:none} }

  .modal-hd { padding: 20px 20px 16px; border-bottom: 1px solid var(--gb-border); position: relative; flex-shrink: 0; }
  .modal-hd-top { display: flex; align-items: flex-start; gap: 13px; margin-bottom: 13px; }
  .modal-logo { width: 50px; height: 50px; border-radius: 12px; border: 1px solid var(--gb-border); overflow: hidden; flex-shrink: 0; display: flex; align-items: center; justify-content: center; background: var(--gb-bg3); font-size: 1.4rem; }
  .modal-logo img { width: 100%; height: 100%; object-fit: cover; }
  .modal-hd-info { flex: 1; min-width: 0; padding-right: 32px; }
  .modal-title { font-family: 'Bricolage Grotesque', sans-serif; font-size: 1.25rem; font-weight: 800; letter-spacing: -0.03em; color: var(--gb-text); margin: 0 0 3px; line-height: 1.2; }
  .modal-company { font-size: 0.875rem; color: var(--gb-muted); font-weight: 500; }
  .modal-close { position: absolute; top: 16px; right: 16px; width: 28px; height: 28px; border-radius: 7px; border: 1px solid var(--gb-border); background: transparent; color: var(--gb-muted); cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 0.82rem; transition: all 0.2s; }
  .modal-close:hover { border-color: var(--gb-border2); color: var(--gb-text); background: var(--gb-app-hover); }

  .modal-chips { display: flex; flex-wrap: wrap; gap: 6px; }
  .modal-chip { display: inline-flex; align-items: center; gap: 5px; padding: 3px 10px; border-radius: 100px; font-size: 0.73rem; font-weight: 600; background: var(--gb-app-hover); border: 1px solid var(--gb-border); color: var(--gb-text-off); }

  .modal-bd { overflow-y: auto; flex: 1; padding: 20px; scrollbar-width: thin; scrollbar-color: var(--gb-border2) transparent; }
  .modal-section { margin-bottom: 20px; }
  .modal-section:last-child { margin-bottom: 0; }
  .modal-sec-title { font-size: 0.66rem; font-weight: 700; letter-spacing: 0.11em; text-transform: uppercase; color: var(--gb-muted); margin: 0 0 9px; }

  .modal-info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
  .modal-info-cell { background: var(--gb-app-hover); border: 1px solid var(--gb-border); border-radius: 9px; padding: 9px 12px; }
  .modal-info-label { font-size: 0.65rem; color: var(--gb-muted); font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; margin-bottom: 2px; }
  .modal-info-value { font-size: 0.82rem; color: var(--gb-text); font-weight: 500; }

  .modal-skills { display: flex; flex-wrap: wrap; gap: 6px; }
  .modal-skill { padding: 3px 10px; border-radius: 7px; font-size: 0.73rem; font-weight: 600; background: rgba(22,163,74,0.1); border: 1px solid rgba(22,163,74,0.22); color: #22c55e; }

  .modal-desc { font-size: 0.85rem; line-height: 1.78; color: var(--gb-text-off); white-space: pre-line; }

  /* Description avec sections (##) */
  .modal-desc-section { margin-bottom: 16px; }
  .modal-desc-section h4 { font-family: 'Bricolage Grotesque', sans-serif; font-size: 0.88rem; font-weight: 700; color: var(--gb-text); margin: 0 0 6px; letter-spacing: -0.01em; padding-left: 10px; border-left: 2px solid #16A34A; }
  .modal-desc-section p { font-size: 0.83rem; line-height: 1.75; color: var(--gb-text-off); margin: 0; }

  .modal-company-about { font-size: 0.83rem; line-height: 1.72; color: var(--gb-text-off); padding: 12px 14px; background: var(--gb-app-hover); border: 1px solid var(--gb-border); border-radius: 10px; white-space: pre-line; }

  .modal-cats { display: flex; flex-wrap: wrap; gap: 6px; }
  .modal-cat { padding: 3px 10px; border-radius: 7px; font-size: 0.73rem; font-weight: 600; background: rgba(2,132,199,0.1); border: 1px solid rgba(2,132,199,0.2); color: #38bdf8; }

  .modal-contact { display: flex; flex-direction: column; gap: 7px; }
  .modal-contact a, .modal-contact span { display: flex; align-items: center; gap: 8px; font-size: 0.85rem; color: var(--gb-text-off); padding: 8px 12px; border-radius: 9px; background: var(--gb-app-hover); border: 1px solid var(--gb-border); text-decoration: none; transition: border-color 0.2s, color 0.2s; }
  .modal-contact a:hover { border-color: var(--gb-app-ring); color: #38bdf8; }

  .modal-ft { padding: 13px 20px; border-top: 1px solid var(--gb-border); display: flex; gap: 8px; align-items: center; justify-content: space-between; flex-wrap: wrap; flex-shrink: 0; }
  .modal-ft-meta { font-size: 0.73rem; color: var(--gb-muted2); display: flex; align-items: center; gap: 5px; }

  /* Apply button — 2 variants */
  .modal-apply-link {
    display: inline-flex; align-items: center; gap: 7px; padding: 9px 20px;
    border-radius: 10px; background: linear-gradient(90deg,#16A34A,#0284C7);
    color: #fff; font-size: 0.85rem; font-weight: 600; font-family: 'DM Sans', sans-serif;
    text-decoration: none; border: none; cursor: pointer;
    transition: opacity 0.2s, transform 0.15s, box-shadow 0.2s;
    box-shadow: 0 4px 18px rgba(22,163,74,0.28);
  }
  .modal-apply-link:hover { opacity: 0.9; transform: translateY(-1px); box-shadow: 0 8px 26px rgba(22,163,74,0.42); }
  .modal-apply-email {
    display: inline-flex; align-items: center; gap: 7px; padding: 9px 20px;
    border-radius: 10px; background: rgba(2,132,199,0.12);
    border: 1px solid rgba(2,132,199,0.35); color: #38bdf8;
    font-size: 0.85rem; font-weight: 600; font-family: 'DM Sans', sans-serif;
    text-decoration: none; cursor: pointer;
    transition: background 0.2s, border-color 0.2s, transform 0.15s;
  }
  .modal-apply-email:hover { background: rgba(2,132,199,0.2); border-color: rgba(2,132,199,0.55); transform: translateY(-1px); }

  .modal-loading { padding: 56px 20px; display: flex; flex-direction: column; align-items: center; gap: 14px; }
  .modal-spinner { width: 36px; height: 36px; border-radius: 50%; border: 3px solid var(--gb-border); border-top-color: #16A34A; animation: opp-spin 0.75s linear infinite; }
  @keyframes opp-spin { to{transform:rotate(360deg)} }

  @media (max-width: 600px) {
    .opp-grid { grid-template-columns: 1fr; }
    .opp-search-row { flex-direction: column; }
    .opp-btn-search { width: 100%; justify-content: center; }
    .opp-modal { max-height: 97vh; border-radius: 14px; }
    .modal-info-grid { grid-template-columns: 1fr; }
    .modal-hd, .modal-bd, .modal-ft { padding: 14px; }
  }
`;

function formatDescription(text: string) {
    const sections = text.split(/\n## /);
    if (sections.length === 1) {
        return <p className="modal-desc">{text}</p>;
    }
    return (
        <>
            {sections.map((section, i) => {
                if (i === 0 && section.trim()) {
                    return (
                        <p key={i} className="modal-desc" style={{ marginBottom: 12 }}>
                            {section.trim()}
                        </p>
                    );
                }
                if (i === 0) return null;
                const [title, ...bodyLines] = section.split("\n");
                const body = bodyLines.join("\n").trim();
                return (
                    <div key={i} className="modal-desc-section">
                        <h4>{title}</h4>
                        {body && <p>{body}</p>}
                    </div>
                );
            })}
        </>
    );
}

function SkeletonCard() {
    return (
        <div className="opp-skeleton">
            <div style={{ display: "flex", gap: 11, marginBottom: 11 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: "var(--gb-bg3)", flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                    <div className="sk-line" style={{ height: 12, width: "65%", marginBottom: 6 }} />
                    <div className="sk-line" style={{ height: 10, width: "40%" }} />
                </div>
            </div>
            <div style={{ display: "flex", gap: 5, marginBottom: 10 }}>
                <div className="sk-line" style={{ width: 55, height: 19, borderRadius: 100 }} />
                <div className="sk-line" style={{ width: 68, height: 19, borderRadius: 100 }} />
            </div>
            <div className="sk-line" style={{ height: 9, width: "100%" }} />
        </div>
    );
}

function JobCard({ offre, onClick }: { offre: Offre; onClick: () => void }) {
    const colors = getTypeColors(offre.type_offre);
    const icon = SOURCE_ICONS[offre.source_site] ?? "🌐";

    return (
        <div
            className="job-card"
            onClick={onClick}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && onClick()}>
            <div className="job-top">
                <div className="job-logo">
                    {offre.lien_image ? (
                        <img
                            src={offre.lien_image}
                            alt=""
                            onError={(e) => {
                                (e.currentTarget as HTMLImageElement).style.display = "none";
                            }}
                        />
                    ) : (
                        <span>{icon}</span>
                    )}
                </div>
                <div className="job-meta">
                    <div className="job-title">{offre.titre}</div>
                    <div className="job-company">{offre.entreprise ?? SOURCE_LABELS[offre.source_site]}</div>
                </div>
            </div>

            <div className="job-tags">
                <span className="job-tag" style={{ background: colors.bg, color: colors.text }}>
                    <span className="job-tag-dot" style={{ background: colors.dot }} />
                    {offre.type_offre}
                </span>
                {offre.type_contrat && <span className="job-tag-outline">{offre.type_contrat}</span>}
                {(offre as any).teletravail && (
                    <span className="job-tag-outline" style={{ color: "#38bdf8", borderColor: "rgba(2,132,199,0.3)" }}>
                        🌐 {(offre as any).teletravail}
                    </span>
                )}
                {(offre as any).niveau_experience && (
                    <span className="job-tag-outline">{(offre as any).niveau_experience}</span>
                )}
                {offre.domaine && <span className="job-tag-outline">{offre.domaine}</span>}
            </div>

            {offre.competences.length > 0 && (
                <div className="job-skills">
                    {offre.competences.slice(0, 4).map((s) => (
                        <span key={s} className="job-skill">
                            {s}
                        </span>
                    ))}
                    {offre.competences.length > 4 && (
                        <span className="job-skill-more">+{offre.competences.length - 4}</span>
                    )}
                </div>
            )}

            <div className="job-footer">
                <div className="job-footer-left">
                    {offre.localisation && (
                        <span className="job-location">
                            <svg
                                width="10"
                                height="10"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2.5">
                                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                                <circle cx="12" cy="10" r="3" />
                            </svg>
                            {offre.localisation}
                        </span>
                    )}
                    {offre.salaire && (
                        <span style={{ fontSize: "0.7rem", color: "#22c55e", fontWeight: 600 }}>
                            💰 {offre.salaire}
                        </span>
                    )}
                    <span className="job-time" title={getFullDate(offre)}>
                        {getDisplayDate(offre)}
                    </span>
                </div>
                <span className="job-source">
                    {icon} {SOURCE_LABELS[offre.source_site]}
                </span>
            </div>
        </div>
    );
}

function JobDetailModal({ offreId, onClose }: { offreId: string; onClose: () => void }) {
    const { offre, loading } = useOffre(offreId);
    const o = offre as
        | (Offre & {
              company_about?: string | null;
              niveau_experience?: string | null;
              taille_entreprise?: string | null;
              teletravail?: string | null;
              nb_candidats?: string | null;
          })
        | null;

    const colors = o ? getTypeColors(o.type_offre) : FALLBACK_COLORS;
    const icon = o ? (SOURCE_ICONS[o.source_site] ?? "🌐") : "🌐";
    const hasEmail = Boolean(o?.email_contact);
    const isPFE = o?.source_site === "pfebooks.com";

    function buildGmailUrl(to: string, subject: string, body: string): string {
        const base = "https://mail.google.com/mail/?view=cm&fs=1";
        return `${base}&to=${encodeURIComponent(to)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    }

    function buildEmailBody(): string {
        const company = o?.entreprise ?? SOURCE_LABELS[o!.source_site];
        return [
            `Bonjour,`,
            ``,
            `Je me permets de vous contacter au sujet de l'offre "${o?.titre}" publiée sur ${SOURCE_LABELS[o!.source_site]}.`,
            ``,
            `[Présentez-vous ici et exprimez votre motivation]`,
            ``,
            `Cordialement,`,
            `[Votre nom]`,
        ].join("\n");
    }

    function renderApplyButton() {
        if (!o) return null;

        const emailBody = buildEmailBody();
        const subject = `Candidature : ${o.titre}`;

        if (isPFE && o.email_contact) {
            const gmailUrl = buildGmailUrl(o.email_contact, subject, emailBody);
            return (
                <div style={{ display: "flex", gap: 8 }}>
                    <a href={gmailUrl} target="_blank" rel="noopener noreferrer" className="modal-apply-email">
                        <svg width="16" height="12" viewBox="0 0 24 18" fill="none">
                            <path d="M2 2l10 8 10-8" stroke="#4285F4" strokeWidth="2" strokeLinecap="round" />
                            <rect x="1" y="1" width="22" height="16" rx="2" stroke="#4285F4" strokeWidth="2" />
                        </svg>
                        Postuler via Gmail
                    </a>
                    <a
                        href={`mailto:${o.email_contact}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(emailBody)}`}
                        className="modal-apply-link"
                        style={{
                            padding: "9px 14px",
                            fontSize: "0.78rem",
                            background: "var(--gb-app-hover)",
                            border: "1px solid var(--gb-border)",
                            color: "var(--gb-muted)",
                            boxShadow: "none",
                        }}
                        title="Ouvrir avec votre client mail par défaut">
                        <svg
                            width="13"
                            height="13"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5">
                            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                            <polyline points="22,6 12,13 2,6" />
                        </svg>
                        Autre client
                    </a>
                </div>
            );
        }

        if (o.email_contact) {
            const gmailUrl = buildGmailUrl(o.email_contact, subject, emailBody);
            return (
                <div style={{ display: "flex", gap: 8 }}>
                    <a href={o.lien_original} target="_blank" rel="noopener noreferrer" className="modal-apply-link">
                        Postuler
                        <svg
                            width="12"
                            height="12"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5">
                            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                            <polyline points="15 3 21 3 21 9" />
                            <line x1="10" y1="14" x2="21" y2="3" />
                        </svg>
                    </a>
                    <a href={gmailUrl} target="_blank" rel="noopener noreferrer" className="modal-apply-email">
                        <svg width="16" height="12" viewBox="0 0 24 18" fill="none">
                            <path d="M2 2l10 8 10-8" stroke="#4285F4" strokeWidth="2" strokeLinecap="round" />
                            <rect x="1" y="1" width="22" height="16" rx="2" stroke="#4285F4" strokeWidth="2" />
                        </svg>
                        Gmail
                    </a>
                </div>
            );
        }

        return (
            <a href={o.lien_original} target="_blank" rel="noopener noreferrer" className="modal-apply-link">
                Postuler
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                    <polyline points="15 3 21 3 21 9" />
                    <line x1="10" y1="14" x2="21" y2="3" />
                </svg>
            </a>
        );
    }

    return (
        <div
            className="opp-backdrop"
            onClick={(e) => e.target === e.currentTarget && onClose()}
            role="dialog"
            aria-modal="true">
            <div className="opp-modal">
                {loading || !o ? (
                    <div className="modal-loading">
                        <div className="modal-spinner" />
                        <p style={{ color: "var(--gb-muted)", fontSize: "0.875rem", margin: 0 }}>Chargement...</p>
                    </div>
                ) : (
                    <>
                        <div className="modal-hd">
                            <button className="modal-close" onClick={onClose} aria-label="Fermer">
                                ✕
                            </button>
                            <div className="modal-hd-top">
                                <div className="modal-logo">
                                    {o.lien_image ? (
                                        <img
                                            src={o.lien_image}
                                            alt=""
                                            onError={(e) => {
                                                (e.currentTarget as HTMLImageElement).style.display = "none";
                                            }}
                                        />
                                    ) : (
                                        <span>{icon}</span>
                                    )}
                                </div>
                                <div className="modal-hd-info">
                                    <div className="modal-title">{o.titre}</div>
                                    <div className="modal-company">{o.entreprise ?? SOURCE_LABELS[o.source_site]}</div>
                                </div>
                            </div>
                            <div className="modal-chips">
                                <span
                                    className="modal-chip"
                                    style={{ background: colors.bg, color: colors.text, borderColor: "transparent" }}>
                                    {o.type_offre}
                                </span>
                                {o.localisation && (
                                    <span className="modal-chip">
                                        <svg
                                            width="10"
                                            height="10"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2.5">
                                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                                            <circle cx="12" cy="10" r="3" />
                                        </svg>
                                        {o.localisation}
                                    </span>
                                )}
                                {o.type_contrat && <span className="modal-chip">{o.type_contrat}</span>}
                                {o.teletravail && (
                                    <span
                                        className="modal-chip"
                                        style={{
                                            color: "#38bdf8",
                                            background: "rgba(2,132,199,0.1)",
                                            borderColor: "rgba(2,132,199,0.25)",
                                        }}>
                                        🌐 {o.teletravail}
                                    </span>
                                )}
                                {o.salaire && (
                                    <span
                                        className="modal-chip"
                                        style={{
                                            color: "#22c55e",
                                            background: "rgba(22,163,74,0.1)",
                                            borderColor: "rgba(22,163,74,0.2)",
                                        }}>
                                        💰 {o.salaire}
                                    </span>
                                )}
                                {o.niveau_experience && <span className="modal-chip">🎓 {o.niveau_experience}</span>}
                            </div>
                        </div>

                        <div className="modal-bd">
                            <div className="modal-section">
                                <div className="modal-info-grid">
                                    <div className="modal-info-cell">
                                        <div className="modal-info-label">Source</div>
                                        <div className="modal-info-value">
                                            {icon} {SOURCE_LABELS[o.source_site]}
                                        </div>
                                    </div>
                                    <div className="modal-info-cell">
                                        <div className="modal-info-label">Publié</div>
                                        <div className="modal-info-value" title={getFullDate(o)}>
                                            {getDisplayDate(o)}
                                        </div>
                                    </div>
                                    {o.domaine && (
                                        <div className="modal-info-cell">
                                            <div className="modal-info-label">Domaine</div>
                                            <div className="modal-info-value">{o.domaine}</div>
                                        </div>
                                    )}
                                    {o.taille_entreprise && (
                                        <div className="modal-info-cell">
                                            <div className="modal-info-label">Taille entreprise</div>
                                            <div className="modal-info-value">{o.taille_entreprise}</div>
                                        </div>
                                    )}
                                    {o.nb_sujets != null && (
                                        <div className="modal-info-cell">
                                            <div className="modal-info-label">Sujets PFE</div>
                                            <div className="modal-info-value">{o.nb_sujets} sujets</div>
                                        </div>
                                    )}
                                    {o.nb_candidats && (
                                        <div className="modal-info-cell">
                                            <div className="modal-info-label">Candidats</div>
                                            <div className="modal-info-value">{o.nb_candidats}</div>
                                        </div>
                                    )}
                                    <div className="modal-info-cell">
                                        <div className="modal-info-label">Vues</div>
                                        <div className="modal-info-value">{o.nb_vues}</div>
                                    </div>
                                </div>
                            </div>

                            {o.competences.length > 0 && (
                                <div className="modal-section">
                                    <div className="modal-sec-title">Compétences requises</div>
                                    <div className="modal-skills">
                                        {o.competences.map((s) => (
                                            <span key={s} className="modal-skill">
                                                {s}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {o.description && (
                                <div className="modal-section">
                                    <div className="modal-sec-title">Description du poste</div>
                                    {formatDescription(o.description)}
                                </div>
                            )}

                            {o.company_about && (
                                <div className="modal-section">
                                    <div className="modal-sec-title">À propos de l'entreprise</div>
                                    <div className="modal-company-about">{o.company_about}</div>
                                </div>
                            )}

                            {o.categories && o.categories.length > 0 && (
                                <div className="modal-section">
                                    <div className="modal-sec-title">Catégories</div>
                                    <div className="modal-cats">
                                        {o.categories.map((c) => (
                                            <span key={c} className="modal-cat">
                                                {c}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {(o.email_contact || o.telephone || o.site_web_entreprise) && (
                                <div className="modal-section">
                                    <div className="modal-sec-title">Contact</div>
                                    <div className="modal-contact">
                                        {o.email_contact && (
                                            <a href={`mailto:${o.email_contact}`}>
                                                <svg
                                                    width="13"
                                                    height="13"
                                                    viewBox="0 0 24 24"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth="2">
                                                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                                                    <polyline points="22,6 12,13 2,6" />
                                                </svg>
                                                {o.email_contact}
                                            </a>
                                        )}
                                        {o.telephone && (
                                            <span>
                                                <svg
                                                    width="13"
                                                    height="13"
                                                    viewBox="0 0 24 24"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth="2">
                                                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2.18h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.18 6.18l1.09-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
                                                </svg>
                                                {o.telephone}
                                            </span>
                                        )}
                                        {o.site_web_entreprise && (
                                            <a href={o.site_web_entreprise} target="_blank" rel="noopener noreferrer">
                                                <svg
                                                    width="13"
                                                    height="13"
                                                    viewBox="0 0 24 24"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth="2">
                                                    <circle cx="12" cy="12" r="10" />
                                                    <line x1="2" y1="12" x2="22" y2="12" />
                                                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                                                </svg>
                                                {o.site_web_entreprise}
                                            </a>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="modal-ft">
                            <div className="modal-ft-meta">
                                <svg
                                    width="11"
                                    height="11"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2">
                                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                    <circle cx="12" cy="12" r="3" />
                                </svg>
                                {o.nb_vues} vue{o.nb_vues !== 1 ? "s" : ""} · Publié {getDisplayDate(o)}
                            </div>
                            {renderApplyButton()}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

function buildPageRange(current: number, total: number): (number | "…")[] {
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
    const r: (number | "…")[] = [1];
    if (current > 3) r.push("…");
    for (let p = Math.max(2, current - 1); p <= Math.min(total - 1, current + 1); p++) r.push(p);
    if (current < total - 2) r.push("…");
    r.push(total);
    return r;
}

const FILTER_LABELS: Record<string, Record<string, string>> = {
    type_offre: { emploi: "Emploi", stage: "Stage", pfe: "PFE", opportunite: "Opportunité" },
    source: { indeed: "Indeed", linkedin: "LinkedIn", welcometothejungle: "WTTJ", "pfebooks.com": "PFEBooks" },
    tri: { recent: "Plus récents", vues: "Plus vus" },
    date_posted: {
        today: "Aujourd'hui",
        this_week: "Cette semaine",
        "3days": "3 derniers jours",
        this_hour: "Cette heure",
    },
    teletravail: { remote: "Full Remote", hybrid: "Hybride", onsite: "Présentiel" },
    niveau_experience: { junior: "Junior", mid: "Intermédiaire", senior: "Senior" },
};

export default function OpportunitiesPage() {
    const [filters, setFilters] = useState<OffresFilters>({ page: 1, limit: 18 });
    const [searchInput, setSearchInput] = useState("");
    const [selectedId, setSelectedId] = useState<string | null>(null);

    const { data, loading, error } = useOffres(filters);

    const offres = data?.offres ?? [];
    const total = data?.total ?? 0;
    const pages = data?.pages ?? 1;
    const currentPage = filters.page ?? 1;

    const activeFilters = Object.entries(filters).filter(([k, v]) => {
        if (!v || k === "page" || k === "limit") return false;
        if (k === "tri" && v === "recent") return false;
        return true;
    }) as [keyof OffresFilters, string][];

    const applySearch = useCallback(
        (e: React.FormEvent) => {
            e.preventDefault();
            setFilters((f) => ({ ...f, search: searchInput.trim() || undefined, page: 1 }));
        },
        [searchInput],
    );

    const setFilter = useCallback((key: keyof OffresFilters, value: string) => {
        setFilters((f) => ({ ...f, [key]: (value || undefined) as never, page: 1 }));
    }, []);

    const removeFilter = useCallback((key: keyof OffresFilters) => {
        setFilters((f) => {
            const next = { ...f };
            delete next[key];
            next.page = 1;
            return next;
        });
        if (key === "search") setSearchInput("");
    }, []);

    const setPage = useCallback((p: number) => {
        setFilters((f) => ({ ...f, page: p }));
        window.scrollTo({ top: 0, behavior: "smooth" });
    }, []);

    const resetAll = () => {
        setFilters({ page: 1, limit: 18 });
        setSearchInput("");
    };

    const typeCounts = offres.reduce<Partial<Record<TypeOffre, number>>>((acc, o) => {
        acc[o.type_offre] = (acc[o.type_offre] ?? 0) + 1;
        return acc;
    }, {});

    return (
        <>
            <style>{styles}</style>
            <div className="opp-page">
                <div className="opp-header">
                    <div className="gb-sec-label">Découvrir</div>
                    <h1>Opportunités</h1>
                    <div className="opp-header-sub">
                        <p>{loading ? "Chargement..." : `${total.toLocaleString("fr-FR")} offres disponibles`}</p>
                        <span className="opp-live-badge">
                            <span className="opp-live-dot" />
                            LIVE
                        </span>
                    </div>
                </div>

                <form className="opp-search-row" onSubmit={applySearch}>
                    <div className="opp-search-wrap">
                        <svg
                            className="opp-search-icon"
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5">
                            <circle cx="11" cy="11" r="8" />
                            <line x1="21" y1="21" x2="16.65" y2="16.65" />
                        </svg>
                        <input
                            type="text"
                            className="opp-search"
                            placeholder="Rechercher un poste, entreprise, compétence..."
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                        />
                    </div>
                    <button type="submit" className="opp-btn-search">
                        Rechercher
                    </button>
                </form>

                <div className="opp-filters-row">
                    <select
                        className={`opp-select${filters.type_offre ? " active" : ""}`}
                        value={filters.type_offre ?? ""}
                        onChange={(e) => setFilter("type_offre", e.target.value)}>
                        <option value="">Type</option>
                        <option value="emploi">Emploi</option>
                        <option value="stage">Stage</option>
                        <option value="pfe">PFE</option>
                        <option value="opportunite">Opportunité</option>
                    </select>

                    <select
                        className={`opp-select${filters.source ? " active" : ""}`}
                        value={filters.source ?? ""}
                        onChange={(e) => setFilter("source", e.target.value)}>
                        <option value="">Source</option>
                        <option value="indeed">Indeed</option>
                        <option value="linkedin">LinkedIn</option>
                        <option value="welcometothejungle">WTTJ</option>
                        <option value="pfebooks.com">PFEBooks</option>
                    </select>

                    <input
                        type="text"
                        placeholder="📍 Localisation"
                        value={filters.localisation ?? ""}
                        onChange={(e) => setFilter("localisation", e.target.value)}
                        style={{
                            height: 36,
                            padding: "0 11px",
                            background: filters.localisation ? "rgba(22,163,74,0.06)" : "var(--gb-app-panel-bg)",
                            border: `1px solid ${filters.localisation ? "rgba(22,163,74,0.5)" : "var(--gb-border)"}`,
                            borderRadius: 10,
                            color: filters.localisation ? "#22c55e" : "var(--gb-text)",
                            fontSize: "0.8rem",
                            fontFamily: "'DM Sans', sans-serif",
                            outline: "none",
                            minWidth: 130,
                            transition: "border-color 0.2s",
                        }}
                    />

                    <div className="opp-filter-sep" />

                    <select
                        className={`opp-select${filters.date_posted ? " active" : ""}`}
                        value={(filters as any).date_posted ?? ""}
                        onChange={(e) => setFilter("date_posted" as keyof OffresFilters, e.target.value)}>
                        <option value="">Quand</option>
                        <option value="this_hour">Cette heure</option>
                        <option value="today">Aujourd'hui</option>
                        <option value="3days">3 derniers jours</option>
                        <option value="this_week">Cette semaine</option>
                    </select>

                    <select
                        className={`opp-select${(filters as any).teletravail ? " active" : ""}`}
                        value={(filters as any).teletravail ?? ""}
                        onChange={(e) => setFilter("teletravail" as keyof OffresFilters, e.target.value)}>
                        <option value="">Mode</option>
                        <option value="remote">Full Remote</option>
                        <option value="hybrid">Hybride</option>
                        <option value="onsite">Présentiel</option>
                    </select>

                    <select
                        className={`opp-select${(filters as any).niveau_experience ? " active" : ""}`}
                        value={(filters as any).niveau_experience ?? ""}
                        onChange={(e) => setFilter("niveau_experience" as keyof OffresFilters, e.target.value)}>
                        <option value="">Niveau</option>
                        <option value="junior">Junior</option>
                        <option value="mid">Intermédiaire</option>
                        <option value="senior">Senior</option>
                    </select>

                    <div className="opp-filter-sep" />

                    <select
                        className="opp-select"
                        value={filters.tri ?? "recent"}
                        onChange={(e) => setFilter("tri", e.target.value)}>
                        <option value="recent">Plus récents</option>
                        <option value="vues">Plus vus</option>
                    </select>

                    {activeFilters.length > 0 && (
                        <button
                            onClick={resetAll}
                            style={{
                                height: 36,
                                padding: "0 12px",
                                borderRadius: 10,
                                fontSize: "0.78rem",
                                background: "transparent",
                                border: "1px solid rgba(239,68,68,0.3)",
                                color: "#fca5a5",
                                cursor: "pointer",
                                fontFamily: "'DM Sans', sans-serif",
                                transition: "all 0.2s",
                                whiteSpace: "nowrap",
                            }}>
                            ✕ Réinitialiser
                        </button>
                    )}
                </div>

                {activeFilters.length > 0 && (
                    <div className="opp-active-filters">
                        {activeFilters.map(([key, value]) => {
                            const label = FILTER_LABELS[key]?.[value] ?? value;
                            return (
                                <div key={key} className="opp-filter-chip">
                                    {label}
                                    <button onClick={() => removeFilter(key)} aria-label={`Retirer ${label}`}>
                                        ✕
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                )}

                {!loading && offres.length > 0 && (
                    <div className="opp-stats-bar">
                        <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--gb-text)" }}>
                            {offres.length} affichées
                        </span>
                        {(Object.entries(typeCounts) as [TypeOffre, number][]).map(([type, count], i) => {
                            const c = getTypeColors(type);
                            return (
                                <div key={type} style={{ display: "contents" }}>
                                    {i > 0 && <div className="opp-stat-sep" />}
                                    <div className="opp-stat-item">
                                        <div className="opp-stat-dot" style={{ background: c.dot }} />
                                        <span className="opp-stat-count">{count}</span>
                                        <span>{type}</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {error && (
                    <div className="opp-error">
                        <svg
                            width="15"
                            height="15"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2">
                            <circle cx="12" cy="12" r="10" />
                            <line x1="12" y1="8" x2="12" y2="12" />
                            <line x1="12" y1="16" x2="12.01" y2="16" />
                        </svg>
                        Impossible de charger les offres. Vérifiez que le scraping-service est démarré.
                    </div>
                )}

                <div className="opp-grid">
                    {loading ? (
                        Array.from({ length: 9 }).map((_, i) => <SkeletonCard key={i} />)
                    ) : offres.length === 0 ? (
                        <div className="opp-empty">
                            <div className="opp-empty-icon">🔍</div>
                            <h3>Aucune offre trouvée</h3>
                            <p>Essayez de modifier vos filtres ou votre recherche.</p>
                            <button className="opp-btn-ghost" onClick={resetAll}>
                                Réinitialiser les filtres
                            </button>
                        </div>
                    ) : (
                        offres.map((offre) => (
                            <JobCard key={offre._id} offre={offre} onClick={() => setSelectedId(offre._id)} />
                        ))
                    )}
                </div>

                {!loading && pages > 1 && (
                    <div className="opp-pagination">
                        <button
                            className="opp-pager"
                            disabled={currentPage <= 1}
                            onClick={() => setPage(currentPage - 1)}>
                            ←
                        </button>
                        {buildPageRange(currentPage, pages).map((p, i) =>
                            p === "…" ? (
                                <span key={`ell-${i}`} style={{ color: "var(--gb-muted)", padding: "0 4px" }}>
                                    …
                                </span>
                            ) : (
                                <button
                                    key={p}
                                    className={`opp-pager${currentPage === p ? " active" : ""}`}
                                    onClick={() => setPage(p as number)}>
                                    {p}
                                </button>
                            ),
                        )}
                        <button
                            className="opp-pager"
                            disabled={currentPage >= pages}
                            onClick={() => setPage(currentPage + 1)}>
                            →
                        </button>
                    </div>
                )}
            </div>

            {selectedId && <JobDetailModal offreId={selectedId} onClose={() => setSelectedId(null)} />}
        </>
    );
}
