import { Check, Star } from "lucide-react";
import type { TemplateInfo } from "../types/cv.types";

interface TemplateCardProps {
  template:   TemplateInfo;
  isSelected: boolean;
  onClick:    () => void;
}

export function TemplateCard({ template, isSelected, onClick }: TemplateCardProps) {
  return (
    <button
      onClick={onClick}
      style={{
        cursor:       "pointer",
        borderRadius: "16px",
        overflow:     "hidden",
        border:       `2px solid ${isSelected ? template.accentColor : "transparent"}`,
        background:   "var(--gb-app-panel-bg)",
        padding:      0,
        transition:   "all 0.22s cubic-bezier(0.34,1.56,0.64,1)",
        boxShadow:    isSelected
          ? `0 0 0 4px ${template.accentColor}30, 0 8px 32px rgba(0,0,0,0.18)`
          : "0 2px 12px rgba(0,0,0,0.1)",
        position:     "relative",
        textAlign:    "left",
        width:        "100%",
      }}
      onMouseEnter={(e) => {
        if (!isSelected) {
          e.currentTarget.style.transform  = "translateY(-4px) scale(1.02)";
          e.currentTarget.style.boxShadow  = "0 16px 40px rgba(0,0,0,0.2)";
          e.currentTarget.style.border     = `2px solid ${template.accentColor}80`;
        }
      }}
      onMouseLeave={(e) => {
        if (!isSelected) {
          e.currentTarget.style.transform  = "translateY(0) scale(1)";
          e.currentTarget.style.boxShadow  = "0 2px 12px rgba(0,0,0,0.1)";
          e.currentTarget.style.border     = "2px solid transparent";
        }
      }}
    >
      {/* CV Preview , white paper look */}
      <div style={{
        height:   "210px",
        position: "relative",
        overflow: "hidden",
        background: "#f0f2f5",
        display:  "flex",
        alignItems: "center",
        justifyContent: "center",
        padding:  "10px",
      }}>
        {/* Paper shadow */}
        <div style={{
          width:        "100%",
          height:       "100%",
          background:   "#fff",
          borderRadius: "3px",
          boxShadow:    "0 4px 20px rgba(0,0,0,0.18), 0 1px 4px rgba(0,0,0,0.12)",
          overflow:     "hidden",
          position:     "relative",
        }}>
          <MiniCvPreview template={template} />
        </div>

        {/* ATS badge */}
        {template.isAtsReady && (
          <div style={{
            position:    "absolute", top: "14px", left: "14px",
            background:  "#16A34A",
            color:       "#fff",
            fontSize:    "8.5px", fontWeight: 800,
            padding:     "3px 9px", borderRadius: "99px",
            letterSpacing: "0.08em", zIndex: 3,
            boxShadow:   "0 2px 8px rgba(22,163,74,0.4)",
            textTransform: "uppercase",
          }}>
            ATS-Ready
          </div>
        )}

        {/* Fancy badge */}
        {template.category === "fancy" && (
          <div style={{
            position:  "absolute", top: "14px", right: "14px",
            background: `${template.accentColor}`,
            color:      "#fff",
            fontSize:   "8.5px", fontWeight: 800,
            padding:    "3px 9px", borderRadius: "99px",
            letterSpacing: "0.08em", zIndex: 3,
            display:    "flex", alignItems: "center", gap: "3px",
            boxShadow:  `0 2px 8px ${template.accentColor}60`,
          }}>
            <Star style={{ width: 8, height: 8 }} /> Fancy
          </div>
        )}

        {/* Selected checkmark */}
        {isSelected && (
          <div style={{
            position:   "absolute", bottom: "14px", right: "14px",
            width:      "26px", height: "26px", borderRadius: "50%",
            background: template.accentColor, zIndex: 3,
            display:    "flex", alignItems: "center", justifyContent: "center",
            boxShadow:  `0 2px 10px ${template.accentColor}60`,
          }}>
            <Check style={{ width: 13, height: 13, color: "#fff" }} />
          </div>
        )}
      </div>

      {/* Label */}
      <div style={{
        padding:    "10px 12px 11px",
        borderTop:  "1px solid var(--gb-border)",
        background: "var(--gb-app-panel-bg)",
      }}>
        <p style={{
          margin: 0, fontSize: "12.5px", fontWeight: 700,
          color:  "var(--gb-text)", lineHeight: 1.3,
        }}>
          {template.name}
        </p>
        <p style={{
          margin: "3px 0 0", fontSize: "10.5px",
          color:  "var(--gb-muted)", lineHeight: 1.4,
        }}>
          {template.description}
        </p>
      </div>
    </button>
  );
}

// Mini CV Preview , each template renders a distinct miniature document 

function MiniCvPreview({ template }: { template: TemplateInfo }) {
  const { id, accentColor: A, previewBg: BG } = template;

  // Shared sample data
  const NAME  = "PRÉNOM NOM";
  const ROLE  = "Titre du poste visé";
  const EMAIL = "email@exemple.com";
  const PHONE = "+216 XX XXX XXX";
  const LOC   = "Tunis, Tunisie";

  switch (id) {
    //  1. Moderne Stratège 
    case "modern-strategy":
      return (
        <div style={{ width: "100%", height: "100%", fontFamily: "Arial, sans-serif", fontSize: "6px", color: "#1a1a1a" }}>
          {/* Dark header */}
          <div style={{ background: BG, padding: "8px 9px 7px", color: "#fff" }}>
            <div style={{ fontSize: "9px", fontWeight: 800, color: "#fff", letterSpacing: "0.3px", marginBottom: "2px" }}>{NAME}</div>
            <div style={{ fontSize: "6.5px", color: A, fontWeight: 600, marginBottom: "4px" }}>{ROLE}</div>
            <div style={{ display: "flex", gap: "6px", opacity: 0.75, fontSize: "5px" }}>
              <span>{EMAIL}</span><span>·</span><span>{PHONE}</span><span>·</span><span>{LOC}</span>
            </div>
          </div>
          {/* Body */}
          <div style={{ padding: "6px 9px" }}>
            <MiniSection title="PROFIL" accent={A} />
            <MiniLines lines={[90, 80, 70]} color="#ccd" />
            <div style={{ height: "5px" }} />
            <MiniSection title="EXPÉRIENCE" accent={A} />
            {[1,2].map(i => (
              <div key={i} style={{ marginBottom: "4px" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <MiniBlock w={38} h={4} color="#222" />
                  <MiniBlock w={16} h={3} color="#aaa" />
                </div>
                <MiniBlock w={26} h={3} color={A} style={{ margin: "1px 0" }} />
                <MiniLines lines={[82, 68]} color="#dde" />
              </div>
            ))}
            <div style={{ height: "5px" }} />
            <MiniSection title="COMPÉTENCES" accent={A} />
            <div style={{ display: "flex", gap: "2px", flexWrap: "wrap" }}>
              {[24,20,28,18,22,25].map((w,i) => (
                <div key={i} style={{ height: "8px", width: `${w}%`, background: `${A}25`, borderRadius: "99px" }} />
              ))}
            </div>
          </div>
        </div>
      );

    //  2. Académique Structuré 
    case "academic":
      return (
        <div style={{ width: "100%", height: "100%", fontFamily: "Georgia, serif", fontSize: "6px", color: "#2c1810", background: "#fdf9f5" }}>
          <div style={{ height: "3px", background: `linear-gradient(90deg,${BG},${A})` }} />
          <div style={{ padding: "7px 9px" }}>
            {/* Centered header */}
            <div style={{ textAlign: "center", paddingBottom: "6px", marginBottom: "6px", borderBottom: `1px solid ${A}66` }}>
              <div style={{ fontSize: "9px", fontWeight: 700, color: BG, letterSpacing: "0.5px", marginBottom: "2px" }}>{NAME}</div>
              <div style={{ fontSize: "6px", color: A, fontStyle: "italic", marginBottom: "3px" }}>{ROLE}</div>
              <div style={{ display: "flex", justifyContent: "center", gap: "5px", fontSize: "4.5px", color: "#6b4226" }}>
                <span>{EMAIL}</span><span>·</span><span>{LOC}</span>
              </div>
            </div>
            <AcadSection title="Expérience Professionnelle" accent={A} bg={BG} />
            {[1,2].map(i => (
              <div key={i} style={{ marginBottom: "4px" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <MiniBlock w={36} h={4} color="#333" />
                  <MiniBlock w={14} h={3} color="#999" />
                </div>
                <MiniBlock w={24} h={3} color={A} style={{ margin: "1px 0", fontStyle: "italic" }} />
                <MiniLines lines={[80, 65]} color="#c9b49a" />
              </div>
            ))}
            <AcadSection title="Formation Académique" accent={A} bg={BG} />
            <div style={{ marginBottom: "4px" }}>
              <MiniBlock w={50} h={4} color="#333" />
              <MiniBlock w={32} h={3} color={A} style={{ margin: "1px 0" }} />
              <MiniBlock w={16} h={3} color="#999" />
            </div>
            <AcadSection title="Compétences" accent={A} bg={BG} />
            <MiniLines lines={[85, 70, 75]} color="#c9b49a" />
          </div>
        </div>
      );

    //  3. Minimaliste Épuré 
    case "minimalist":
      return (
        <div style={{ width: "100%", height: "100%", fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: "6px", color: "#111", background: "#fff" }}>
          <div style={{ height: "2.5px", background: A }} />
          <div style={{ padding: "10px 11px" }}>
            {/* Large name */}
            <div style={{ fontSize: "11px", fontWeight: 300, letterSpacing: "3px", textTransform: "uppercase", marginBottom: "2px", color: "#111" }}>{NAME}</div>
            <div style={{ fontSize: "6px", color: "#666", fontStyle: "italic", marginBottom: "4px" }}>{ROLE}</div>
            <div style={{ height: "1px", background: "#e0e0e0", marginBottom: "5px" }} />
            <div style={{ display: "flex", gap: "8px", fontSize: "4.5px", color: "#888", marginBottom: "7px" }}>
              <span>{EMAIL}</span><span>{PHONE}</span><span>{LOC}</span>
            </div>
            {[
              { label: "EXPÉRIENCE", lines: [85,70,78] },
              { label: "FORMATION", lines: [60,45] },
              { label: "COMPÉTENCES", lines: [] },
            ].map((s,i) => (
              <div key={i} style={{ marginBottom: "7px" }}>
                <div style={{ fontSize: "5px", fontWeight: 700, letterSpacing: "2px", color: A, marginBottom: "4px" }}>{s.label}</div>
                <MiniLines lines={s.lines} color="#ddd" />
                {s.label === "COMPÉTENCES" && (
                  <div style={{ display: "flex", gap: "2px" }}>
                    {[18,15,22,16,20].map((w,j) => (
                      <div key={j} style={{ height: "8px", width: `${w}%`, border: `1px solid ${A}66`, borderRadius: "99px" }} />
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      );

    //  4. Développeur Tech 
    case "tech":
      return (
        <div style={{ width: "100%", height: "100%", fontFamily: "'Courier New', monospace", fontSize: "5.5px", color: "#e2e8f0", background: "#0f172a" }}>
          {/* Header */}
          <div style={{ background: BG, borderBottom: `1.5px solid ${A}`, padding: "7px 9px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <div style={{ fontSize: "9px", fontWeight: 700, color: "#f8fafc", marginBottom: "1px" }}>{NAME}</div>
                <div style={{ color: A, fontSize: "6px" }}>&gt; {ROLE}</div>
              </div>
              <div style={{ textAlign: "right", fontSize: "4.5px", color: "#64748b" }}>
                <div>{EMAIL}</div><div>{PHONE}</div><div>github.com/user</div>
              </div>
            </div>
          </div>
          <div style={{ padding: "5px 9px" }}>
            {/* Skills */}
            <div style={{ marginBottom: "4px" }}>
              <div style={{ fontSize: "5.5px", color: A, fontWeight: 700, marginBottom: "3px" }}>// HARD SKILLS</div>
              {[{cat:"Frontend",pct:88},{cat:"Backend",pct:72},{cat:"DevOps",pct:65}].map(s => (
                <div key={s.cat} style={{ display: "flex", alignItems: "center", gap: "4px", marginBottom: "2px" }}>
                  <span style={{ color: A, width: "28px", fontSize: "4.5px" }}>{s.cat}:</span>
                  <div style={{ flex: 1, height: "3px", background: "#1e293b", borderRadius: "99px", overflow: "hidden" }}>
                    <div style={{ width: `${s.pct}%`, height: "100%", background: A, borderRadius: "99px" }} />
                  </div>
                </div>
              ))}
            </div>
            {/* Experience */}
            <div style={{ fontSize: "5.5px", color: A, fontWeight: 700, marginBottom: "3px" }}>// EXPÉRIENCE</div>
            {[1,2].map(i => (
              <div key={i} style={{ background: "#1e293b", borderRadius: "3px", padding: "3px 4px", marginBottom: "3px" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <MiniBlock w={40} h={3.5} color="#f1f5f9" />
                  <MiniBlock w={14} h={3} color="#64748b" />
                </div>
                <MiniBlock w={26} h={3} color={A} style={{ margin: "1px 0" }} />
                <MiniBlock w={75} h={2.5} color="#334155" />
              </div>
            ))}
            {/* Projects */}
            <div style={{ fontSize: "5.5px", color: A, fontWeight: 700, marginBottom: "3px", marginTop: "3px" }}>// PROJETS</div>
            <div style={{ display: "flex", gap: "2px" }}>
              {[1,2].map(i => (
                <div key={i} style={{ flex: 1, background: "#1e293b", borderRadius: "3px", padding: "3px 4px" }}>
                  <MiniBlock w={80} h={3} color="#f1f5f9" style={{ marginBottom: "1px" }} />
                  <MiniBlock w={60} h={2.5} color="#334155" />
                </div>
              ))}
            </div>
          </div>
        </div>
      );

    //  5. Classique Réinventé 
    case "classic-reinvented":
      return (
        <div style={{ width: "100%", height: "100%", fontFamily: "Arial, sans-serif", fontSize: "6px", color: "#1c2b3a", background: "#fff" }}>
          <div style={{ background: BG, padding: "8px 9px" }}>
            <div style={{ fontSize: "9.5px", fontWeight: 700, color: "#fff", marginBottom: "1px" }}>{NAME}</div>
            <div style={{ fontSize: "6.5px", color: A, fontWeight: 600, marginBottom: "3px" }}>{ROLE}</div>
            <div style={{ display: "flex", gap: "5px", fontSize: "4.5px", color: "rgba(255,255,255,0.7)" }}>
              <span>✉ {EMAIL}</span><span>📱 {PHONE}</span><span> {LOC}</span>
            </div>
          </div>
          <div style={{ height: "2.5px", background: A }} />
          <div style={{ padding: "5px 9px" }}>
            <MiniLines lines={[88,72]} color="#bbc" style={{ marginBottom: "5px" }} />
            <ClassicRow title="Expérience" accent={A} bg={BG} />
            {[1,2].map(i => (
              <div key={i} style={{ marginBottom: "4px" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <MiniBlock w={38} h={4} color={BG} />
                  <MiniBlock w={14} h={3} color="#aaa" />
                </div>
                <MiniBlock w={26} h={3} color={A} style={{ margin: "1px 0" }} />
                <MiniLines lines={[80,65]} color="#dde" />
              </div>
            ))}
            {/* Two-column */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "5px", marginTop: "5px" }}>
              <div>
                <ClassicRow title="Compétences" accent={A} bg={BG} />
                {[22,18,24,20].map((w,i) => (
                  <div key={i} style={{ height: "7px", width: `${w*3}%`, background: `${A}20`, borderRadius: "99px", marginBottom: "2px" }} />
                ))}
              </div>
              <div>
                <ClassicRow title="Langues" accent={A} bg={BG} />
                <MiniLines lines={[70,60,55]} color="#dde" />
              </div>
            </div>
          </div>
        </div>
      );

    //  6. Créatif Audacieux 
    case "creative":
      return (
        <div style={{ width: "100%", height: "100%", display: "flex", fontFamily: "Arial, sans-serif", fontSize: "6px" }}>
          {/* Sidebar */}
          <div style={{ width: "40%", background: BG, padding: "8px 7px", color: "#fff", display: "flex", flexDirection: "column" }}>
            {/* Photo circle */}
            <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: `${A}80`, border: "2.5px solid rgba(255,255,255,0.35)", margin: "0 auto 5px", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div style={{ width: "16px", height: "16px", borderRadius: "50%", background: "rgba(255,255,255,0.5)" }} />
            </div>
            <div style={{ fontSize: "7px", fontWeight: 700, color: "#fff", textAlign: "center", marginBottom: "1px" }}>{NAME}</div>
            <div style={{ fontSize: "5px", color: "rgba(255,255,255,0.6)", textAlign: "center", marginBottom: "7px", fontStyle: "italic" }}>{ROLE}</div>
            <div style={{ fontSize: "4.5px", color: "rgba(255,255,255,0.5)", marginBottom: "3px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px" }}>Contact</div>
            {[EMAIL, PHONE, LOC].map((v,i) => (
              <div key={i} style={{ fontSize: "4.5px", color: "rgba(255,255,255,0.75)", marginBottom: "2px" }}>{v}</div>
            ))}
            <div style={{ marginTop: "6px", fontSize: "4.5px", color: "rgba(255,255,255,0.5)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", marginBottom: "4px" }}>Compétences</div>
            {[{cat:"Design",pct:90},{cat:"Motion",pct:75},{cat:"Branding",pct:85},{cat:"UX",pct:80}].map(s => (
              <div key={s.cat} style={{ marginBottom: "3px" }}>
                <div style={{ height: "3px", background: "rgba(255,255,255,0.15)", borderRadius: "99px", overflow: "hidden" }}>
                  <div style={{ width: `${s.pct}%`, height: "100%", background: "rgba(255,255,255,0.65)", borderRadius: "99px" }} />
                </div>
              </div>
            ))}
          </div>
          {/* Main */}
          <div style={{ flex: 1, padding: "8px 7px", background: "#fff" }}>
            <div style={{ background: `${A}12`, borderLeft: `2px solid ${A}`, borderRadius: "0 4px 4px 0", padding: "4px 5px", marginBottom: "6px" }}>
              <MiniLines lines={[90,75]} color="#555" />
            </div>
            <CreatRow title="Expérience" accent={A} />
            {[1,2].map(i => (
              <div key={i} style={{ marginBottom: "4px", paddingLeft: "4px", borderLeft: `1.5px solid #f0f0f0` }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <MiniBlock w={38} h={3.5} color="#111" />
                  <MiniBlock w={14} h={3} color="#aaa" />
                </div>
                <MiniBlock w={24} h={3} color={A} style={{ margin: "1px 0" }} />
                <MiniLines lines={[78]} color="#ddd" />
              </div>
            ))}
            <CreatRow title="Formation" accent={A} />
            <div style={{ marginBottom: "4px" }}>
              <MiniBlock w={55} h={3.5} color="#111" />
              <MiniBlock w={35} h={3} color={A} style={{ margin: "1px 0" }} />
            </div>
          </div>
        </div>
      );

    //  7. International 
    case "international":
      return (
        <div style={{ width: "100%", height: "100%", fontFamily: "Arial, sans-serif", fontSize: "6px", color: "#1a1a1a", background: "#fff" }}>
          <div style={{ background: `linear-gradient(135deg, ${BG} 55%, ${A})`, padding: "9px 9px 11px" }}>
            <div style={{ display: "flex", gap: "7px", alignItems: "center" }}>
              <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: "rgba(255,255,255,0.25)", border: "2px solid rgba(255,255,255,0.4)", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div style={{ width: "12px", height: "12px", borderRadius: "50%", background: "rgba(255,255,255,0.5)" }} />
              </div>
              <div>
                <div style={{ fontSize: "8.5px", fontWeight: 700, color: "#fff", marginBottom: "1px" }}>{NAME}</div>
                <div style={{ fontSize: "6px", color: "rgba(255,255,255,0.75)" }}>{ROLE}</div>
              </div>
            </div>
            <div style={{ display: "flex", gap: "5px", marginTop: "4px", fontSize: "4.5px", color: "rgba(255,255,255,0.6)" }}>
              <span>{EMAIL}</span><span>·</span><span>{PHONE}</span><span>·</span><span>{LOC}</span>
            </div>
          </div>
          <div style={{ padding: "6px 9px" }}>
            <IntlSection title="EXPÉRIENCE" accent={A} />
            <div style={{ display: "flex", gap: "4px", marginBottom: "5px" }}>
              {[1,2].map(i => (
                <div key={i} style={{ flex: 1, background: `${A}10`, borderRadius: "4px", padding: "4px 5px" }}>
                  <MiniBlock w={80} h={3.5} color="#222" style={{ marginBottom: "1px" }} />
                  <MiniBlock w={55} h={3} color={A} style={{ marginBottom: "2px" }} />
                  <MiniLines lines={[88]} color="#ddd" />
                </div>
              ))}
            </div>
            <IntlSection title="COMPÉTENCES" accent={A} />
            <div style={{ display: "flex", gap: "2px", flexWrap: "wrap" }}>
              {[22,18,26,20,24,16].map((w,i) => (
                <div key={i} style={{ height: "9px", width: `${w}%`, background: i%2===0 ? `${A}20` : `${BG}18`, borderRadius: "99px" }} />
              ))}
            </div>
            <IntlSection title="LANGUES" accent={A} />
            <MiniLines lines={[55,48,42]} color="#dde" />
          </div>
        </div>
      );

    //  8. Design Épuré 
    case "design-epure":
      return (
        <div style={{ width: "100%", height: "100%", fontFamily: "Arial, sans-serif", fontSize: "6px", color: "#e2e8f0", background: BG, display: "flex" }}>
          <div style={{ width: "4px", background: A, flexShrink: 0 }} />
          <div style={{ flex: 1, padding: "9px 8px" }}>
            <div style={{ marginBottom: "8px" }}>
              <div style={{ fontSize: "10px", fontWeight: 700, color: "rgba(255,255,255,0.92)", marginBottom: "2px", letterSpacing: "0.5px" }}>{NAME}</div>
              <div style={{ fontSize: "6.5px", color: A, fontWeight: 600, marginBottom: "4px" }}>{ROLE}</div>
              <div style={{ height: "1px", background: `${A}40`, marginBottom: "4px" }} />
              <div style={{ display: "flex", gap: "5px", fontSize: "4.5px", color: "rgba(255,255,255,0.45)" }}>
                <span>{EMAIL}</span><span>·</span><span>{LOC}</span>
              </div>
            </div>
            {[
              { title: "Expérience", lines: [88,72,80] },
              { title: "Formation", lines: [65,50] },
              { title: "Compétences", lines: [] },
            ].map((s,i) => (
              <div key={i} style={{ marginBottom: "6px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "4px", marginBottom: "3px" }}>
                  <div style={{ width: "2px", height: "10px", background: A, borderRadius: "1px", flexShrink: 0 }} />
                  <div style={{ fontSize: "5px", fontWeight: 700, color: "rgba(255,255,255,0.55)", textTransform: "uppercase", letterSpacing: "1.5px" }}>{s.title}</div>
                </div>
                {i < 2 ? (
                  <MiniLines lines={s.lines} color="rgba(255,255,255,0.15)" />
                ) : (
                  <div style={{ display: "flex", gap: "2px", flexWrap: "wrap" }}>
                    {[20,16,24,18,22].map((w,j) => (
                      <div key={j} style={{ height: "9px", width: `${w}%`, background: `${A}30`, border: `1px solid ${A}50`, borderRadius: "3px" }} />
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      );

    //  9. Focus Compétences 
    case "skills-focus":
      return (
        <div style={{ width: "100%", height: "100%", display: "flex", fontFamily: "Arial, sans-serif", fontSize: "6px", background: "#fff" }}>
          {/* Main left */}
          <div style={{ flex: 1, padding: "8px 7px" }}>
            <div style={{ marginBottom: "7px" }}>
              <div style={{ fontSize: "9px", fontWeight: 700, color: "#111", marginBottom: "1px" }}>{NAME}</div>
              <div style={{ fontSize: "6px", color: A, fontWeight: 600, marginBottom: "3px" }}>{ROLE}</div>
              <div style={{ height: "1px", background: `${A}44`, marginBottom: "4px" }} />
            </div>
            <SkillsRow title="Expérience" accent={A} />
            {[1,2].map(i => (
              <div key={i} style={{ marginBottom: "5px" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <MiniBlock w={40} h={3.5} color="#111" />
                  <MiniBlock w={14} h={3} color="#aaa" />
                </div>
                <MiniBlock w={28} h={3} color={A} style={{ margin: "1px 0" }} />
                <MiniLines lines={[80,65]} color="#ddd" />
              </div>
            ))}
            <SkillsRow title="Formation" accent={A} />
            <div>
              <MiniBlock w={55} h={3.5} color="#111" />
              <MiniBlock w={38} h={3} color={A} style={{ margin: "1px 0" }} />
              <MiniBlock w={20} h={3} color="#aaa" />
            </div>
          </div>
          {/* Right skills panel */}
          <div style={{ width: "38%", background: "#f8f4ef", padding: "8px 6px" }}>
            {/* Photo */}
            <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: A, margin: "0 auto 5px", opacity: 0.75 }} />
            <div style={{ fontSize: "5.5px", fontWeight: 700, textAlign: "center", marginBottom: "1px", color: "#111" }}>{NAME.split(" ")[0]}</div>
            <div style={{ fontSize: "4.5px", textAlign: "center", color: "#666", marginBottom: "7px" }}>{ROLE}</div>
            <div style={{ fontSize: "4.5px", fontWeight: 700, color: "#333", marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.8px" }}>Compétences</div>
            {[
              {label:"React/Vue", pct:88},
              {label:"Python",    pct:75},
              {label:"DevOps",    pct:65},
              {label:"SQL",       pct:80},
              {label:"UI Design", pct:70},
            ].map(s => (
              <div key={s.label} style={{ marginBottom: "4px" }}>
                <div style={{ fontSize: "4px", color: "#444", marginBottom: "1px" }}>{s.label}</div>
                <div style={{ height: "3.5px", background: "#e5e0d8", borderRadius: "99px", overflow: "hidden" }}>
                  <div style={{ width: `${s.pct}%`, height: "100%", background: A, borderRadius: "99px" }} />
                </div>
              </div>
            ))}
            <div style={{ marginTop: "5px", fontSize: "4.5px", fontWeight: 700, color: "#333", marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.8px" }}>Langues</div>
            <MiniLines lines={[75,65]} color="#c9b49a" />
          </div>
        </div>
      );

    //  10. Start-up 
    case "startup":
      return (
        <div style={{ width: "100%", height: "100%", fontFamily: "Arial, sans-serif", fontSize: "6px", color: "#1a1a1a", background: "#fff" }}>
          <div style={{
            background: `linear-gradient(120deg, ${BG} 58%, ${A})`,
            padding: "9px 9px 16px",
            clipPath: "polygon(0 0,100% 0,100% 70%,0 100%)",
          }}>
            <div style={{ display: "flex", gap: "7px", alignItems: "center" }}>
              <div style={{ width: "26px", height: "26px", borderRadius: "7px", background: "rgba(255,255,255,0.22)", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div style={{ width: "14px", height: "14px", borderRadius: "4px", background: "rgba(255,255,255,0.5)" }} />
              </div>
              <div>
                <div style={{ fontSize: "8.5px", fontWeight: 800, color: "#fff", marginBottom: "1px" }}>{NAME}</div>
                <div style={{ fontSize: "6px", color: "rgba(255,255,255,0.7)" }}>{ROLE}</div>
              </div>
            </div>
            <div style={{ display: "flex", gap: "5px", marginTop: "3px", fontSize: "4.5px", color: "rgba(255,255,255,0.55)" }}>
              <span>{EMAIL}</span><span>·</span><span>{PHONE}</span>
            </div>
          </div>
          <div style={{ padding: "14px 9px 6px" }}>
            {/* Skill badges */}
            <div style={{ display: "flex", gap: "2px", flexWrap: "wrap", marginBottom: "6px" }}>
              {[20,16,24,18,22].map((w,i) => (
                <div key={i} style={{ height: "9px", width: `${w}%`, background: `${A}18`, border: `1px solid ${A}40`, borderRadius: "99px" }} />
              ))}
            </div>
            <StartupRow title="Expérience" accent={A} />
            {[1,2].map(i => (
              <div key={i} style={{ marginBottom: "4px", padding: "3px 5px", background: "#f9f9f9", borderRadius: "4px", borderLeft: `2px solid ${A}` }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <MiniBlock w={38} h={3.5} color="#111" />
                  <MiniBlock w={14} h={3} color="#aaa" />
                </div>
                <MiniBlock w={26} h={3} color={A} style={{ margin: "1px 0" }} />
                <MiniLines lines={[75]} color="#ddd" />
              </div>
            ))}
            <StartupRow title="Projets" accent={A} />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "3px" }}>
              {[1,2].map(i => (
                <div key={i} style={{ background: `${A}08`, borderRadius: "4px", padding: "4px" }}>
                  <MiniBlock w={80} h={3} color="#333" style={{ marginBottom: "1px" }} />
                  <MiniLines lines={[65]} color="#ddd" />
                </div>
              ))}
            </div>
          </div>
        </div>
      );

    default:
      return <div style={{ background: "#f5f5f5", width: "100%", height: "100%" }} />;
  }
}

//  Shared mini elements 

function MiniBlock({ w, h, color, style = {} }: { w: number; h: number; color: string; style?: React.CSSProperties }) {
  return <div style={{ width: `${w}%`, height: `${h}px`, background: color, borderRadius: "1px", ...style }} />;
}

function MiniLines({ lines, color, style = {} }: { lines: number[]; color: string; style?: React.CSSProperties }) {
  return (
    <div style={style}>
      {lines.map((w, i) => (
        <div key={i} style={{ width: `${w}%`, height: "2.5px", background: color, borderRadius: "1px", marginBottom: "2px" }} />
      ))}
    </div>
  );
}

function MiniSection({ title, accent }: { title: string; accent: string }) {
  return (
    <div style={{ fontSize: "5px", fontWeight: 700, color: accent, letterSpacing: "1px", borderBottom: `1px solid ${accent}55`, paddingBottom: "1.5px", marginBottom: "3px" }}>
      {title}
    </div>
  );
}

function AcadSection({ title, accent, bg }: { title: string; accent: string; bg: string }) {
  return (
    <div style={{ fontSize: "5.5px", fontWeight: 700, color: bg, borderBottom: `1px solid ${accent}44`, paddingBottom: "1.5px", marginBottom: "3px", fontVariant: "small-caps" }}>
      {title}
    </div>
  );
}

function ClassicRow({ title, accent, bg }: { title: string; accent: string; bg: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "3px", marginBottom: "3px" }}>
      <div style={{ width: "2px", height: "9px", background: accent, borderRadius: "1px", flexShrink: 0 }} />
      <div style={{ fontSize: "5px", fontWeight: 700, color: bg, textTransform: "uppercase", letterSpacing: "0.5px" }}>{title}</div>
    </div>
  );
}

function CreatRow({ title, accent }: { title: string; accent: string }) {
  return (
    <div style={{ fontSize: "5.5px", fontWeight: 700, color: accent, textTransform: "uppercase", letterSpacing: "0.8px", borderBottom: `1px solid ${accent}22`, paddingBottom: "1.5px", marginBottom: "3px" }}>
      {title}
    </div>
  );
}

function IntlSection({ title, accent }: { title: string; accent: string }) {
  return (
    <div style={{ fontSize: "5px", fontWeight: 700, color: accent, letterSpacing: "1px", marginBottom: "3px", marginTop: "4px" }}>
      {title}
    </div>
  );
}

function SkillsRow({ title, accent }: { title: string; accent: string }) {
  return (
    <div style={{ fontSize: "5px", fontWeight: 700, color: accent, borderBottom: `1px solid ${accent}33`, paddingBottom: "1.5px", marginBottom: "3px" }}>
      {title.toUpperCase()}
    </div>
  );
}

function StartupRow({ title, accent }: { title: string; accent: string }) {
  return (
    <div style={{ fontSize: "5.5px", fontWeight: 800, color: accent, textTransform: "uppercase", letterSpacing: "1px", marginBottom: "4px" }}>
      {title}
    </div>
  );
}