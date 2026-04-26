import { useRef } from "react";
import { X, Plus, Upload, Loader } from "lucide-react";
import type { TemplateInfo } from "../../types/cv.types";
import { getTemplate } from "../../templates";

interface CreationOptionsModalProps {
  template:      TemplateInfo;
  onClose:       () => void;
  onCreateBlank: () => void;
  onUpload:      (file: File) => void;
  isUploading?:  boolean;
}

export function CreationOptionsModal({
  template, onClose, onCreateBlank, onUpload, isUploading = false,
}: CreationOptionsModalProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const tpl     = getTemplate(template.id);

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 50,
      background: "rgba(0,0,0,0.5)", backdropFilter: "blur(6px)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "16px",
    }}>
      <div style={{
        background: "var(--gb-surface)", border: "1px solid var(--gb-border)",
        borderRadius: "20px", width: "100%", maxWidth: "520px",
        boxShadow: "0 24px 64px rgba(0,0,0,0.4)",
        animation: "modalIn 0.22s ease", overflow: "hidden",
      }}>
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "18px 22px", borderBottom: "1px solid var(--gb-border)",
        }}>
          <div>
            <h2 style={{ margin: 0, fontSize: "15px", fontWeight: 700, color: "var(--gb-text)" }}>
              Options de création
            </h2>
            <p style={{ margin: "3px 0 0", fontSize: "12px", color: "var(--gb-muted)" }}>
              Comment souhaitez-vous commencer ?
            </p>
          </div>
          <button onClick={onClose} style={{
            background: "var(--gb-app-hover)", border: "none",
            borderRadius: "8px", padding: "6px", cursor: "pointer",
            color: "var(--gb-muted)", display: "flex",
          }}>
            <X style={{ width: 15, height: 15 }} />
          </button>
        </div>

        <div style={{ padding: "20px 22px", display: "flex", gap: "18px" }}>
          <div style={{ flex: 1 }}>
            <OptionButton
              icon={<Plus style={{ width: 18, height: 18 }} />}
              iconBg="rgba(2,132,199,0.12)" iconColor="#0284C7"
              title="Créer un nouveau CV"
              subtitle="Commencer avec un formulaire vierge"
              onClick={onCreateBlank}
            />

            <OptionButton
              style={{ marginTop: "10px" }}
              icon={isUploading
                ? <Loader style={{ width: 18, height: 18, animation: "spin 1s linear infinite" }} />
                : <Upload style={{ width: 18, height: 18 }} />}
              iconBg="rgba(22,163,74,0.12)" iconColor="#16A34A"
              title={isUploading ? "Extraction en cours…" : "Importer mon CV existant"}
              subtitle="Extraction IA depuis un PDF ou Word"
              onClick={() => fileRef.current?.click()}
              disabled={isUploading}
            />
            <input
              ref={fileRef}
              type="file"
              accept=".pdf,.doc,.docx"
              style={{ display: "none" }}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) onUpload(file);
                e.target.value = "";
              }}
            />
          </div>

          <div style={{ width: "130px", flexShrink: 0 }}>
            <div style={{
              borderRadius: "10px", overflow: "hidden",
              border: "2px solid #16A34A",
              boxShadow: "0 0 0 4px rgba(22,163,74,0.12)",
            }}>
              <div style={{
                height: "148px",
                background: `linear-gradient(160deg, ${tpl.previewBg}, ${tpl.previewBg}cc)`,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <div style={{
                  width: "86px", background: "rgba(255,255,255,0.96)",
                  borderRadius: "5px", padding: "9px 8px",
                  boxShadow: "0 2px 10px rgba(0,0,0,0.18)",
                }}>
                  <div style={{ width: "100%", height: "6px", background: tpl.accentColor, borderRadius: "2px", marginBottom: "5px" }} />
                  {[80, 100, 65, 90, 75, 85].map((w, i) => (
                    <div key={i} style={{ width: `${w}%`, height: "2.5px", background: i % 3 === 0 ? `${tpl.accentColor}55` : "#e2e8f0", borderRadius: "2px", marginBottom: "2.5px" }} />
                  ))}
                </div>
              </div>
              <div style={{ padding: "7px 8px", background: "var(--gb-app-panel-bg)", textAlign: "center" }}>
                <p style={{ margin: "0 0 2px", fontSize: "8.5px", color: "#16A34A", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Modèle choisi
                </p>
                <p style={{ margin: 0, fontSize: "10.5px", fontWeight: 600, color: "var(--gb-text)", lineHeight: 1.3 }}>
                  {tpl.name}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes modalIn { from { opacity: 0; transform: translateY(12px) scale(0.98); } to { opacity: 1; transform: none; } }
        @keyframes spin    { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

function OptionButton({
  icon, iconBg, iconColor, title, subtitle, onClick, disabled, style,
}: {
  icon: React.ReactNode; iconBg: string; iconColor: string;
  title: string; subtitle: string; onClick: () => void;
  disabled?: boolean; style?: React.CSSProperties;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        width: "100%", display: "flex", alignItems: "center", gap: "12px",
        background: "transparent", border: "1px solid var(--gb-border)",
        borderRadius: "12px", padding: "12px 14px",
        cursor: disabled ? "wait" : "pointer",
        transition: "all 0.15s", textAlign: "left",
        ...(style ?? {}),
      }}
      onMouseEnter={(e) => { if (!disabled) e.currentTarget.style.borderColor = "rgba(22,163,74,0.45)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--gb-border)"; }}
    >
      <div style={{
        width: "36px", height: "36px", borderRadius: "10px",
        background: iconBg, color: iconColor,
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0,
      }}>
        {icon}
      </div>
      <div style={{ flex: 1 }}>
        <p style={{ margin: 0, fontWeight: 600, fontSize: "13px", color: "var(--gb-text)" }}>{title}</p>
        <p style={{ margin: "2px 0 0", fontSize: "11px", color: "var(--gb-muted)" }}>{subtitle}</p>
      </div>
      <span style={{ color: "var(--gb-muted)", fontSize: "16px" }}>›</span>
    </button>
  );
}