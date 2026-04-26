import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { TemplateCard } from "../TemplateCard";
import { CreationOptionsModal } from "./CreationOptionsModal";
import { TEMPLATES, DOMAIN_LABELS, filterTemplates } from "../../templates";
import type { CvTemplateCategory, CvTemplateDomain, TemplateInfo } from "../../types/cv.types";

interface TemplatePickerViewProps {
  onBack:       () => void;
  onReady:      (template: TemplateInfo, mode: "blank" | "upload", file?: File) => void;
  isUploading?: boolean;
}

const ALL_DOMAINS = Array.from(
  new Set(TEMPLATES.flatMap((t) => t.domains))
) as CvTemplateDomain[];

export function TemplatePickerView({ onBack, onReady, isUploading = false }: TemplatePickerViewProps) {
  const [category,  setCategory]  = useState<CvTemplateCategory | "all">("all");
  const [domain,    setDomain]    = useState<CvTemplateDomain | "all">("all");
  const [selected,  setSelected]  = useState<TemplateInfo | null>(null);
  const [showModal, setShowModal] = useState(false);

  const filtered = filterTemplates(
    category === "all" ? undefined : category,
    domain   === "all" ? undefined : domain,
  );

  const handleCardClick = (t: TemplateInfo) => {
    setSelected(t);
    setShowModal(true);
  };

  return (
    <div>
      <button
        onClick={onBack}
        style={{
          display: "inline-flex", alignItems: "center", gap: "6px",
          background: "transparent", border: "none", cursor: "pointer",
          color: "var(--gb-muted)", fontSize: "13px", fontWeight: 500,
          padding: "0 0 18px", transition: "color 0.15s",
        }}
        onMouseEnter={(e) => e.currentTarget.style.color = "var(--gb-text)"}
        onMouseLeave={(e) => e.currentTarget.style.color = "var(--gb-muted)"}
      >
        <ArrowLeft style={{ width: 14, height: 14 }} /> Retour
      </button>

      <h1 style={{
        fontFamily: "'Bricolage Grotesque', sans-serif",
        fontSize: "1.55rem", fontWeight: 800,
        color: "var(--gb-text)", letterSpacing: "-0.03em", margin: "0 0 6px",
      }}>
        Galerie de Templates
      </h1>
      <p style={{ fontSize: "13.5px", color: "var(--gb-muted)", marginBottom: "22px" }}>
        Tous nos templates sont optimisés ATS et conçus pour maximiser vos chances.
      </p>

      <div style={{ display: "flex", gap: "12px", marginBottom: "24px", flexWrap: "wrap", alignItems: "center" }}>
        <div style={{
          display: "inline-flex", background: "var(--gb-app-hover)",
          borderRadius: "12px", padding: "4px", gap: "3px",
        }}>
          {(["all", "ats", "fancy"] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              style={{
                padding: "6px 16px", borderRadius: "9px", border: "none",
                background: category === cat ? "var(--gb-app-panel-bg)" : "transparent",
                color: category === cat ? "var(--gb-text)" : "var(--gb-muted)",
                fontWeight: category === cat ? 600 : 400,
                fontSize: "12.5px", cursor: "pointer",
                boxShadow: category === cat ? "0 1px 4px rgba(0,0,0,0.1)" : "none",
                transition: "all 0.15s", fontFamily: "inherit",
              }}
            >
              {cat === "all" ? "Tous" : cat === "ats" ? "ATS" : "Fancy"}
            </button>
          ))}
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
          <button
            onClick={() => setDomain("all")}
            style={{
              padding: "5px 12px", borderRadius: "99px", border: "none",
              background: domain === "all" ? "#16A34A" : "var(--gb-app-hover)",
              color: domain === "all" ? "#fff" : "var(--gb-muted)",
              fontSize: "11.5px", fontWeight: 500, cursor: "pointer",
              transition: "all 0.15s", fontFamily: "inherit",
            }}
          >
            Tous les domaines
          </button>
          {ALL_DOMAINS.map((d) => (
            <button
              key={d}
              onClick={() => setDomain(d)}
              style={{
                padding: "5px 12px", borderRadius: "99px", border: "none",
                background: domain === d ? "#16A34A" : "var(--gb-app-hover)",
                color: domain === d ? "#fff" : "var(--gb-muted)",
                fontSize: "11.5px", fontWeight: 500, cursor: "pointer",
                transition: "all 0.15s", fontFamily: "inherit",
              }}
            >
              {DOMAIN_LABELS[d]}
            </button>
          ))}
        </div>
      </div>

      <p style={{ fontSize: "12px", color: "var(--gb-muted)", marginBottom: "14px" }}>
        {filtered.length} template{filtered.length !== 1 ? "s" : ""} disponible{filtered.length !== 1 ? "s" : ""}
      </p>

      {filtered.length === 0 ? (
        <div style={{
          textAlign: "center", padding: "48px 24px",
          background: "var(--gb-app-panel-bg)",
          border: "1px dashed var(--gb-border2)", borderRadius: "16px",
        }}>
          <p style={{ fontSize: "14px", color: "var(--gb-muted)" }}>
            Aucun template pour cette combinaison de filtres.
          </p>
          <button
            onClick={() => { setCategory("all"); setDomain("all"); }}
            style={{
              marginTop: "12px", padding: "8px 18px",
              background: "var(--gb-app-hover)", border: "1px solid var(--gb-border)",
              borderRadius: "9px", fontSize: "13px", color: "var(--gb-text-off)",
              cursor: "pointer", fontFamily: "inherit",
            }}
          >
            Réinitialiser les filtres
          </button>
        </div>
      ) : (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(170px, 1fr))",
          gap: "14px",
        }}>
          {filtered.map((t) => (
            <TemplateCard
              key={t.id}
              template={t}
              isSelected={selected?.id === t.id}
              onClick={() => handleCardClick(t)}
            />
          ))}
        </div>
      )}

      {showModal && selected && (
        <CreationOptionsModal
          template={selected}
          onClose={() => setShowModal(false)}
          onCreateBlank={() => { setShowModal(false); onReady(selected, "blank"); }}
          onUpload={(file) => { setShowModal(false); onReady(selected, "upload", file); }}
          isUploading={isUploading}
        />
      )}
    </div>
  );
}