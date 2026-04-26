import { Plus, FileText, Sparkles } from "lucide-react";
import { CvCard } from "../CvCard";
import { useCvList } from "../../hooks/useCvList";
import type { CvDTO } from "../../types/cv.types";

interface CvListViewProps {
  onNewCv:   () => void;
  onEditCv:  (cv: CvDTO) => void;
}

export function CvListView({ onNewCv, onEditCv }: CvListViewProps) {
  const {
    cvs, isLoading,
    deleteCV, isDeletingId,
    duplicateCV, isDuplicatingId,
    exportPdf, isExportingId,
  } = useCvList();

  return (
    <div>
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        marginBottom: "28px", flexWrap: "wrap", gap: "12px",
      }}>
        <div>
          <h1 style={{
            fontFamily: "'Bricolage Grotesque', sans-serif",
            fontSize: "1.6rem", fontWeight: 800,
            color: "var(--gb-text)", letterSpacing: "-0.03em", margin: 0,
          }}>
            Mes CVs
          </h1>
          <p style={{ fontSize: "13.5px", color: "var(--gb-muted)", marginTop: "4px" }}>
            {isLoading
              ? "Chargement…"
              : `${cvs.length} CV${cvs.length !== 1 ? "s" : ""} sauvegardé${cvs.length !== 1 ? "s" : ""}`}
          </p>
        </div>

        <button
          onClick={onNewCv}
          style={{
            display: "inline-flex", alignItems: "center", gap: "8px",
            background: "linear-gradient(90deg, #16A34A, #0284C7)",
            color: "#fff", border: "none", borderRadius: "12px",
            padding: "10px 20px", fontSize: "13.5px", fontWeight: 600,
            cursor: "pointer", fontFamily: "inherit",
            boxShadow: "0 0 28px rgba(22,163,74,0.28)",
            transition: "transform 0.15s, box-shadow 0.15s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform  = "translateY(-1px)";
            e.currentTarget.style.boxShadow  = "0 6px 32px rgba(22,163,74,0.44)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform  = "none";
            e.currentTarget.style.boxShadow  = "0 0 28px rgba(22,163,74,0.28)";
          }}
        >
          <Plus style={{ width: 16, height: 16 }} />
          Créer un nouveau CV
        </button>
      </div>

      {isLoading && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(270px, 1fr))", gap: "18px" }}>
          {[1, 2, 3].map((i) => (
            <div key={i} style={{
              height: "300px", borderRadius: "16px",
              background: "var(--gb-app-hover)",
              animation: "pulse 1.4s ease-in-out infinite",
              animationDelay: `${i * 0.1}s`,
            }} />
          ))}
        </div>
      )}

      {!isLoading && cvs.length === 0 && (
        <div style={{
          display: "flex", flexDirection: "column", alignItems: "center",
          justifyContent: "center", padding: "72px 24px", textAlign: "center",
          background: "var(--gb-app-panel-bg)",
          border: "1px dashed var(--gb-border2)", borderRadius: "20px",
        }}>
          <div style={{
            width: "60px", height: "60px", borderRadius: "17px",
            background: "rgba(22,163,74,0.1)",
            display: "flex", alignItems: "center", justifyContent: "center",
            marginBottom: "18px",
          }}>
            <FileText style={{ width: 26, height: 26, color: "#16A34A" }} />
          </div>
          <h2 style={{
            fontFamily: "'Bricolage Grotesque', sans-serif",
            fontSize: "1.15rem", fontWeight: 700,
            color: "var(--gb-text)", margin: "0 0 8px",
          }}>
            Aucun CV pour le moment
          </h2>
          <p style={{ fontSize: "13.5px", color: "var(--gb-muted)", marginBottom: "24px", maxWidth: "340px" }}>
            Créez votre premier CV optimisé par l'IA en quelques minutes.
          </p>
          <button
            onClick={onNewCv}
            style={{
              display: "inline-flex", alignItems: "center", gap: "8px",
              background: "linear-gradient(90deg, #16A34A, #0284C7)",
              color: "#fff", border: "none", borderRadius: "12px",
              padding: "11px 24px", fontSize: "13.5px", fontWeight: 600,
              cursor: "pointer", fontFamily: "inherit",
            }}
          >
            <Sparkles style={{ width: 15, height: 15 }} />
            Créer mon premier CV
          </button>
        </div>
      )}

      {!isLoading && cvs.length > 0 && (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(270px, 1fr))",
          gap: "18px",
        }}>
          {cvs.map((cv) => (
            <CvCard
              key={cv._id}
              cv={cv}
              onEdit={onEditCv}
              onDelete={(id) => deleteCV(id)}
              onDuplicate={(id) => duplicateCV(id)}
              onExportPdf={(id) => exportPdf(id)}
              isExporting={isExportingId === cv._id}
              isDeleting={isDeletingId === cv._id}
              isDuplicating={isDuplicatingId === cv._id}
            />
          ))}
        </div>
      )}

      <style>{`@keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.5; } }`}</style>
    </div>
  );
}