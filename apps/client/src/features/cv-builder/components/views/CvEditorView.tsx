import { useState } from "react";
import {
    ArrowLeft, Save, Download, Sparkles, LayoutTemplate,
    Check, Loader, Eye, Edit3, Plus, ChevronDown, ChevronRight,
} from "lucide-react";

import { CvPreview } from "../CvPreview/CvPreview";
import { AtsScorePanel } from "../AtsScorePanel";
import { AiSuggestionsPanel } from "../ai/AiSuggestionsPanel";
import { ResizeHandle } from "./ResizableSplit";
import { CustomSectionModal } from "./CustomSectionModal";
import { renderSectionContent } from "./sectionRenderer";
import { useExportPdf } from "./useExportPdf";

import { useCvEditor } from "../../hooks/useCvEditor";
import { useAiFeatures } from "../../hooks/useAiFeatures";
import { TEMPLATES, getTemplate } from "../../templates";
import { SECTION_DEFS } from "./sectionDefs";

import type { CvEditorState, CvSection, CvTemplate, EditorView } from "../../types/cv.types";
import type { ExperienceItem } from "../../types/cv.types";

interface CvEditorViewProps {
    initialState: CvEditorState;
    onBack: () => void;
}

export function CvEditorView({ initialState, onBack }: CvEditorViewProps) {
    const editor = useCvEditor(initialState);
    const ai = useAiFeatures(editor.state.id);
    const { exportPdf, exportLoading } = useExportPdf(editor);

    const [view, setView] = useState<EditorView>("edit");
    const [expanded, setExpanded] = useState<Set<string>>(new Set(["personal-info", "summary"]));
    const [showModal, setShowModal] = useState(false);
    const [showAiPanel, setShowAiPanel] = useState(false);
    const [showTplMenu, setShowTplMenu] = useState(false);
    const [formWidth, setFormWidth] = useState(420);

    const { state } = editor;
    const activeSectionTypes = new Set(state.sections.map((s) => s.type));
    const currentTpl = getTemplate(state.template);

    const toggleExpanded = (type: string) =>
        setExpanded((prev) => {
            const next = new Set(prev);
            next.has(type) ? next.delete(type) : next.add(type);
            return next;
        });

    const handleAddSection = (section: CvSection) => {
        editor.addSection(section);
        setExpanded((prev) => new Set([...prev, section.type]));
        setShowModal(false);
    };

    const allActiveSections = [
        ...SECTION_DEFS.filter((d) => activeSectionTypes.has(d.type)),
        ...state.sections
            .filter((s) => s.type === "custom")
            .map((s) => {
                const raw = s.data as unknown as Record<string, unknown>;
                return {
                    type: "custom",
                    label: (s as { label?: string }).label ?? (raw.title as string) ?? "Section",
                    icon: <Plus style={{ width: 14, height: 14 }} />,
                    defaultData: s.data,
                };
            }),
    ];

    const saveStatusColor = !state.isDirty && state.lastSaved ? "#16A34A" : "var(--gb-muted)";
    const saveBtnLabel = state.isSaving ? "Sauvegarde..." : state.isDirty ? "Sauvegarder" : "Sauvegardé";

    return (
        <div style={{ height: "100vh", display: "flex", flexDirection: "column", margin: "-24px", overflow: "hidden" }}>

            <TopBar
                state={state}
                view={view}
                currentTplName={currentTpl.name}
                showTplMenu={showTplMenu}
                exportLoading={exportLoading}
                saveStatusColor={saveStatusColor}
                saveBtnLabel={saveBtnLabel}
                onBack={onBack}
                onSetView={setView}
                onToggleTplMenu={() => setShowTplMenu((v) => !v)}
                onCloseTplMenu={() => setShowTplMenu(false)}
                onSelectTemplate={(id) => { editor.setTemplate(id as CvTemplate); setShowTplMenu(false); }}
                onOpenAiPanel={() => setShowAiPanel(true)}
                onSave={editor.saveNow}
                onExportPdf={exportPdf}
                onTitleChange={(t) => editor.setTitle(t)}
            />

            <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>

                {view === "edit" && (
                    <div style={{ width: `${formWidth}px`, flexShrink: 0, overflowY: "auto", background: "var(--gb-bg)" }}>
                        <div style={{ padding: "14px 18px 0" }}>
                            <AtsScorePanel
                                score={state.atsScore}
                                result={ai.atsResult}
                                isLoading={ai.loadingAts}
                                hasCvId={!!state.id}
                                onCheck={(jd) => {
                                    ai.checkAts(jd)?.then((r) => { if (r) editor.setAtsScore(r.score); });
                                }}
                            />
                        </div>

                        <div style={{ padding: "8px 18px 20px" }}>
                            {allActiveSections.map((def) => {
                                const isOpen = expanded.has(def.type);
                                return (
                                    <div
                                        key={`${def.type}-${def.label}`}
                                        style={{
                                            marginBottom: "5px",
                                            border: "1px solid var(--gb-border)",
                                            borderRadius: "12px",
                                            overflow: "hidden",
                                            background: "var(--gb-app-panel-bg)",
                                        }}>
                                        <div
                                            onClick={() => toggleExpanded(def.type)}
                                            style={{ display: "flex", alignItems: "center", gap: "9px", padding: "11px 13px", cursor: "pointer", userSelect: "none" }}>
                                            <span style={{ color: "#16A34A", display: "flex" }}>{def.icon}</span>
                                            <span style={{ flex: 1, fontSize: "13px", fontWeight: 600, color: "var(--gb-text)" }}>{def.label}</span>
                                            {isOpen
                                                ? <ChevronDown style={{ width: 13, height: 13, color: "var(--gb-muted)" }} />
                                                : <ChevronRight style={{ width: 13, height: 13, color: "var(--gb-muted)" }} />
                                            }
                                        </div>
                                        {isOpen && (
                                            <div style={{ padding: "13px", borderTop: "1px solid var(--gb-border)" }}>
                                                {renderSectionContent(def, state.sections, editor, ai)}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}

                            <button
                                onClick={() => setShowModal(true)}
                                style={addSectionBtnStyle}
                                onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(22,163,74,0.4)"; e.currentTarget.style.color = "#16A34A"; }}
                                onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--gb-border2)"; e.currentTarget.style.color = "var(--gb-muted)"; }}>
                                <Plus style={{ width: 13, height: 13 }} /> Ajouter une section
                            </button>
                        </div>
                    </div>
                )}

                {view === "edit" && (
                    <ResizeHandle leftWidth={formWidth} onWidthChange={setFormWidth} minLeft={280} maxLeft={700} />
                )}

                <div style={{ flex: 1, overflowY: "auto", background: "#e2e5e9", display: "flex", justifyContent: "center", padding: "28px" }}>
                    <div style={{ width: "100%", maxWidth: "680px", background: "#fff", boxShadow: "0 4px 40px rgba(0,0,0,0.14)", borderRadius: "3px", minHeight: "880px" }}>
                        <CvPreview template={state.template} sections={state.sections} />
                    </div>
                </div>
            </div>

            {showModal && (
                <CustomSectionModal
                    onClose={() => setShowModal(false)}
                    onAdd={handleAddSection}
                    existingTypes={activeSectionTypes}
                    nextOrder={state.sections.length}
                />
            )}

            {showAiPanel && (
                <AiSuggestionsPanel
                    suggestions={ai.suggestions}
                    isLoading={ai.loadingSuggestions}
                    hasCvId={!!state.id}
                    error={ai.error}
                    onClose={() => setShowAiPanel(false)}
                    onRefresh={() => ai.getSuggestions()}
                />
            )}

            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
}


interface TopBarProps {
    state: CvEditorState;
    view: EditorView;
    currentTplName: string;
    showTplMenu: boolean;
    exportLoading: boolean;
    saveStatusColor: string;
    saveBtnLabel: string;
    onBack: () => void;
    onSetView: (v: EditorView) => void;
    onToggleTplMenu: () => void;
    onCloseTplMenu: () => void;
    onSelectTemplate: (id: string) => void;
    onOpenAiPanel: () => void;
    onSave: () => void;
    onExportPdf: () => void;
    onTitleChange: (t: string) => void;
}

function TopBar({
    state, view, currentTplName, showTplMenu, exportLoading,
    saveStatusColor, saveBtnLabel,
    onBack, onSetView, onToggleTplMenu, onCloseTplMenu,
    onSelectTemplate, onOpenAiPanel, onSave, onExportPdf, onTitleChange,
}: TopBarProps) {
    return (
        <div style={{ height: "52px", flexShrink: 0, background: "var(--gb-app-topbar-bg)", borderBottom: "1px solid var(--gb-border)", backdropFilter: "blur(16px)", display: "flex", alignItems: "center", padding: "0 16px", gap: "10px", zIndex: 30 }}>

            <button onClick={onBack} style={topBtnBase}>
                <ArrowLeft style={{ width: 13, height: 13 }} /> Mes CVs
            </button>

            <Divider />

            <div style={{ flex: 1, minWidth: 0, display: "flex", alignItems: "center", gap: "8px" }}>
                <input
                    value={state.title}
                    onChange={(e) => onTitleChange(e.target.value)}
                    style={{ background: "transparent", border: "none", outline: "none", fontSize: "13px", fontWeight: 600, color: "var(--gb-text)", fontFamily: "'DM Sans', sans-serif", maxWidth: "220px" }}
                />
                <span style={{ fontSize: "11px", color: saveStatusColor, display: "flex", alignItems: "center", gap: "3px" }}>
                    {state.isSaving
                        ? <Loader style={{ width: 11, height: 11, animation: "spin 1s linear infinite" }} />
                        : !state.isDirty && state.lastSaved
                            ? <Check style={{ width: 11, height: 11 }} />
                            : null}
                    {state.isSaving
                        ? "Sauvegarde…"
                        : state.lastSaved && !state.isDirty
                            ? `Sauvegardé ${state.lastSaved.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}`
                            : state.isDirty ? "Non sauvegardé" : ""}
                </span>
            </div>

            <div style={{ display: "flex", background: "var(--gb-app-hover)", borderRadius: "9px", padding: "3px", gap: "2px" }}>
                {(["edit", "preview"] as EditorView[]).map((v) => (
                    <button key={v} onClick={() => onSetView(v)}
                        style={{ display: "flex", alignItems: "center", gap: "5px", padding: "5px 11px", borderRadius: "7px", border: "none", background: view === v ? "var(--gb-app-panel-bg)" : "transparent", color: view === v ? "var(--gb-text)" : "var(--gb-muted)", fontWeight: view === v ? 600 : 400, fontSize: "12px", cursor: "pointer", boxShadow: view === v ? "0 1px 4px rgba(0,0,0,0.1)" : "none" }}>
                        {v === "edit" ? <Edit3 style={{ width: 12, height: 12 }} /> : <Eye style={{ width: 12, height: 12 }} />}
                        {v === "edit" ? "Éditer" : "Aperçu"}
                    </button>
                ))}
            </div>

            <div style={{ position: "relative" }}>
                <button onClick={onToggleTplMenu} style={{ ...topBtnBase, background: "var(--gb-app-hover)", border: "1px solid var(--gb-border)" }}>
                    <LayoutTemplate style={{ width: 13, height: 13 }} />
                    <span style={{ maxWidth: "90px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{currentTplName}</span>
                </button>
                {showTplMenu && (
                    <>
                        <div style={{ position: "fixed", inset: 0, zIndex: 10 }} onClick={onCloseTplMenu} />
                        <div style={{ position: "absolute", top: "calc(100% + 6px)", right: 0, zIndex: 20, background: "var(--gb-app-panel-bg)", border: "1px solid var(--gb-border)", borderRadius: "14px", padding: "8px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "5px", minWidth: "210px", boxShadow: "0 12px 36px rgba(0,0,0,0.22)" }}>
                            {TEMPLATES.map((t) => (
                                <button key={t.id} onClick={() => onSelectTemplate(t.id)}
                                    style={{ background: state.template === t.id ? "var(--gb-app-active-bg)" : "transparent", border: state.template === t.id ? "1px solid var(--gb-app-active-border)" : "1px solid transparent", borderRadius: "9px", padding: "8px", cursor: "pointer", textAlign: "left" }}>
                                    <div style={{ width: "100%", height: "4px", background: t.accentColor, borderRadius: "2px", marginBottom: "4px" }} />
                                    <span style={{ fontSize: "10px", fontWeight: 500, color: "var(--gb-text-off)", lineHeight: 1.3, display: "block" }}>{t.name}</span>
                                </button>
                            ))}
                        </div>
                    </>
                )}
            </div>

            <button onClick={onOpenAiPanel} style={{ ...topBtnBase, background: "rgba(139,92,246,0.12)", border: "1px solid rgba(139,92,246,0.28)", color: "#a78bfa" }}>
                <Sparkles style={{ width: 13, height: 13 }} /> AI Improve
            </button>

            <button onClick={onSave} disabled={state.isSaving || !state.isDirty}
                style={{ ...topBtnBase, background: "var(--gb-app-hover)", border: "1px solid var(--gb-border)", opacity: !state.isDirty ? 0.55 : 1 }}>
                {state.isSaving ? <Loader style={{ width: 13, height: 13, animation: "spin 1s linear infinite" }} /> : <Save style={{ width: 13, height: 13 }} />}
                {saveBtnLabel}
            </button>

            <button onClick={onExportPdf} disabled={exportLoading}
                style={{ ...topBtnBase, background: "linear-gradient(90deg,#16A34A,#0284C7)", border: "none", color: "#fff", boxShadow: "0 0 18px rgba(22,163,74,0.28)" }}>
                {exportLoading ? <Loader style={{ width: 13, height: 13, animation: "spin 1s linear infinite" }} /> : <Download style={{ width: 13, height: 13 }} />}
                Export PDF
            </button>
        </div>
    );
}


const topBtnBase: React.CSSProperties = {
    display: "flex", alignItems: "center", gap: "6px",
    background: "transparent", border: "1px solid transparent",
    borderRadius: "9px", padding: "6px 11px",
    cursor: "pointer", color: "var(--gb-text-off)",
    fontSize: "12px", fontWeight: 500,
    fontFamily: "'DM Sans', sans-serif",
    flexShrink: 0, transition: "background 0.15s, color 0.15s",
};

const addSectionBtnStyle: React.CSSProperties = {
    width: "100%", display: "flex", alignItems: "center", justifyContent: "center",
    gap: "6px", background: "transparent", border: "1.5px dashed var(--gb-border2)",
    borderRadius: "11px", padding: "10px", color: "var(--gb-muted)",
    fontSize: "13px", fontWeight: 500, cursor: "pointer",
    transition: "all 0.15s", marginTop: "4px",
};

function Divider() {
    return <div style={{ width: "1px", height: "20px", background: "var(--gb-border)", flexShrink: 0 }} />;
}