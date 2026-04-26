import { useState, useRef, useCallback, useEffect } from "react";
import {
    ArrowLeft,
    Save,
    Download,
    Sparkles,
    LayoutTemplate,
    Check,
    Loader,
    Eye,
    Edit3,
    User,
    AlignLeft,
    Briefcase,
    GraduationCap,
    Code2,
    FolderKanban,
    Languages,
    Award,
    Plus,
    ChevronDown,
    ChevronRight,
    X,
    GripVertical,
} from "lucide-react";
import { CvPreview } from "../CvPreview";
import { AtsScorePanel } from "../AtsScorePanel";
import { AiSuggestionsPanel } from "../ai/AiSuggestionsPanel";
import {
    PersonalInfoSection,
    SummarySection,
    ExperienceSection,
    EducationSection,
    SkillsSection,
    ProjectsSection,
    LanguagesSection,
    CertificationsSection,
    CustomSectionEditor,
} from "../sections/AllSections";
import type { CustomSectionDataV2, CustomField } from "../sections/AllSections";
import { useCvEditor } from "../../hooks/useCvEditor";
import { useAiFeatures } from "../../hooks/useAiFeatures";
import { cvApi } from "../../api/cv.api";
import { TEMPLATES, getTemplate } from "../../templates";
import type { CvEditorState, CvSection, CvSectionType, CvTemplate, EditorView } from "../../types/cv.types";
import type { ExperienceItem } from "../../types/cv.types";

const SECTION_DEFS: {
    type: CvSectionType;
    label: string;
    icon: React.ReactNode;
    defaultData: CvSection["data"];
}[] = [
    {
        type: "personal-info",
        label: "Contact",
        icon: <User style={{ width: 14, height: 14 }} />,
        defaultData: {
            firstName: "",
            lastName: "",
            roleTitle: "",
            email: "",
            phone: "",
            location: "",
            linkedin: "",
            github: "",
            portfolio: "",
        },
    },
    {
        type: "summary",
        label: "Résumé",
        icon: <AlignLeft style={{ width: 14, height: 14 }} />,
        defaultData: { text: "" },
    },
    { type: "experience", label: "Expérience", icon: <Briefcase style={{ width: 14, height: 14 }} />, defaultData: [] },
    {
        type: "education",
        label: "Formation",
        icon: <GraduationCap style={{ width: 14, height: 14 }} />,
        defaultData: [],
    },
    { type: "skills", label: "Compétences", icon: <Code2 style={{ width: 14, height: 14 }} />, defaultData: [] },
    { type: "projects", label: "Projets", icon: <FolderKanban style={{ width: 14, height: 14 }} />, defaultData: [] },
    { type: "languages", label: "Langues", icon: <Languages style={{ width: 14, height: 14 }} />, defaultData: [] },
    {
        type: "certifications",
        label: "Certifications",
        icon: <Award style={{ width: 14, height: 14 }} />,
        defaultData: [],
    },
];

interface CustomSectionModalProps {
    onClose: () => void;
    onAdd: (section: CvSection) => void;
    existingTypes: Set<string>;
    nextOrder: number;
}

function CustomSectionModal({ onClose, onAdd, existingTypes, nextOrder }: CustomSectionModalProps) {
    const [customData, setCustomData] = useState<CustomSectionDataV2>({
        title: "",
        fields: [],
    });

    const available = SECTION_DEFS.filter((d) => !existingTypes.has(d.type));

    const handleAddPredefined = (def: (typeof SECTION_DEFS)[0]) => {
        onAdd({ type: def.type, order: nextOrder, data: def.defaultData as never });
        onClose();
    };

    const handleAddCustom = () => {
        if (!customData.title.trim()) return;
        onAdd({
            type: "custom",
            order: nextOrder,
            label: customData.title.trim(),
            data: customData as never,
        });
        onClose();
    };

    return (
        <>
            <div
                style={{
                    position: "fixed",
                    inset: 0,
                    zIndex: 40,
                    background: "rgba(0,0,0,0.5)",
                    backdropFilter: "blur(4px)",
                }}
                onClick={onClose}
            />
            <div
                style={{
                    position: "fixed",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%,-50%)",
                    zIndex: 50,
                    width: "min(96vw, 520px)",
                    maxHeight: "88vh",
                    overflowY: "auto",
                    background: "var(--gb-surface)",
                    border: "1px solid var(--gb-border)",
                    borderRadius: "20px",
                    padding: "24px",
                    boxShadow: "0 24px 64px rgba(0,0,0,0.4)",
                }}>
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "20px",
                    }}>
                    <div>
                        <h3 style={{ margin: 0, fontSize: "15px", fontWeight: 700, color: "var(--gb-text)" }}>
                            Ajouter une section
                        </h3>
                        <p style={{ margin: "3px 0 0", fontSize: "12px", color: "var(--gb-muted)" }}>
                            Choisissez une section prédéfinie ou créez la vôtre
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        style={{
                            background: "var(--gb-app-hover)",
                            border: "none",
                            borderRadius: "8px",
                            padding: "6px",
                            cursor: "pointer",
                            color: "var(--gb-muted)",
                            display: "flex",
                        }}>
                        <X style={{ width: 15, height: 15 }} />
                    </button>
                </div>

                {available.length > 0 && (
                    <div style={{ marginBottom: "20px" }}>
                        <p
                            style={{
                                fontSize: "11px",
                                fontWeight: 700,
                                color: "var(--gb-muted)",
                                textTransform: "uppercase",
                                letterSpacing: "0.06em",
                                margin: "0 0 10px",
                            }}>
                            Sections disponibles
                        </p>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "7px" }}>
                            {available.map((def) => (
                                <button
                                    key={def.type}
                                    onClick={() => handleAddPredefined(def)}
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "8px",
                                        background: "var(--gb-app-hover)",
                                        border: "1px solid var(--gb-border)",
                                        borderRadius: "10px",
                                        padding: "10px 12px",
                                        cursor: "pointer",
                                        textAlign: "left",
                                        transition: "border-color 0.15s, background 0.15s",
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.borderColor = "rgba(22,163,74,0.5)";
                                        e.currentTarget.style.background = "rgba(22,163,74,0.06)";
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.borderColor = "var(--gb-border)";
                                        e.currentTarget.style.background = "var(--gb-app-hover)";
                                    }}>
                                    <span style={{ color: "#16A34A", display: "flex", flexShrink: 0 }}>{def.icon}</span>
                                    <span style={{ fontSize: "12.5px", fontWeight: 500, color: "var(--gb-text)" }}>
                                        {def.label}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "18px" }}>
                    <div style={{ flex: 1, height: "1px", background: "var(--gb-border)" }} />
                    <span style={{ fontSize: "11px", color: "var(--gb-muted)", whiteSpace: "nowrap" }}>
                        Section personnalisée
                    </span>
                    <div style={{ flex: 1, height: "1px", background: "var(--gb-border)" }} />
                </div>

                <CustomSectionEditor data={customData} onChange={setCustomData} />

                <button
                    onClick={handleAddCustom}
                    disabled={!customData.title.trim()}
                    style={{
                        marginTop: "16px",
                        width: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "7px",
                        background: customData.title.trim()
                            ? "linear-gradient(90deg,#16A34A,#0284C7)"
                            : "var(--gb-app-hover)",
                        color: customData.title.trim() ? "#fff" : "var(--gb-muted)",
                        border: "none",
                        borderRadius: "10px",
                        padding: "11px",
                        fontSize: "13px",
                        fontWeight: 600,
                        cursor: customData.title.trim() ? "pointer" : "not-allowed",
                    }}>
                    <Plus style={{ width: 14, height: 14 }} />
                    Créer la section personnalisée
                </button>
            </div>
        </>
    );
}

interface ResizableSplitProps {
    leftWidth: number;
    onWidthChange: (w: number) => void;
    minLeft?: number;
    maxLeft?: number;
}

function ResizeHandle({ leftWidth, onWidthChange, minLeft = 280, maxLeft = 700 }: ResizableSplitProps) {
    const isDragging = useRef(false);
    const startX = useRef(0);
    const startWidth = useRef(0);

    const onMouseDown = useCallback(
        (e: React.MouseEvent) => {
            isDragging.current = true;
            startX.current = e.clientX;
            startWidth.current = leftWidth;
            document.body.style.cursor = "col-resize";
            document.body.style.userSelect = "none";
            e.preventDefault();
        },
        [leftWidth],
    );

    useEffect(() => {
        const onMouseMove = (e: MouseEvent) => {
            if (!isDragging.current) return;
            const delta = e.clientX - startX.current;
            const newWidth = Math.max(minLeft, Math.min(maxLeft, startWidth.current + delta));
            onWidthChange(newWidth);
        };
        const onMouseUp = () => {
            if (!isDragging.current) return;
            isDragging.current = false;
            document.body.style.cursor = "";
            document.body.style.userSelect = "";
        };
        document.addEventListener("mousemove", onMouseMove);
        document.addEventListener("mouseup", onMouseUp);
        return () => {
            document.removeEventListener("mousemove", onMouseMove);
            document.removeEventListener("mouseup", onMouseUp);
        };
    }, [minLeft, maxLeft, onWidthChange]);

    return (
        <div
            onMouseDown={onMouseDown}
            style={{
                width: "6px",
                flexShrink: 0,
                background: "var(--gb-border)",
                cursor: "col-resize",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "background 0.15s",
                position: "relative",
                zIndex: 5,
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(22,163,74,0.5)";
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.background = "var(--gb-border)";
            }}
            title="Glisser pour redimensionner">
            <GripVertical style={{ width: 10, height: 20, color: "var(--gb-muted)", pointerEvents: "none" }} />
        </div>
    );
}

interface CvEditorViewProps {
    initialState: CvEditorState;
    onBack: () => void;
}

export function CvEditorView({ initialState, onBack }: CvEditorViewProps) {
    const editor = useCvEditor(initialState);
    const ai = useAiFeatures(editor.state.id);

    const [view, setView] = useState<EditorView>("edit");
    const [expanded, setExpanded] = useState<Set<string>>(new Set(["personal-info", "summary"]));
    const [showCustomSectionModal, setShowCustomSectionModal] = useState(false);
    const [showAiPanel, setShowAiPanel] = useState(false);
    const [showTplMenu, setShowTplMenu] = useState(false);
    const [exportLoading, setExportLoading] = useState(false);
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
        setShowCustomSectionModal(false);
    };

    const handleExportPdf = async () => {
        if (!state.id) await editor.saveNow();
        if (!state.id) return;
        setExportLoading(true);
        try {
            const { pdfUrl } = await cvApi.generatePdf(state.id);
            editor.setPdfUrl(pdfUrl);
            const a = document.createElement("a");
            a.href = pdfUrl;
            a.download = `${state.title || "cv"}.pdf`;
            a.click();
        } finally {
            setExportLoading(false);
        }
    };

    const getSectionContent = (sectionDef: { type: string; label?: string }): React.ReactNode => {
        const type = sectionDef.type;
        const s = state.sections.find((sec) => sec.type === type);
        if (!s) return null;

        switch (s.type) {
            case "personal-info":
                return <PersonalInfoSection data={s.data} onChange={(d) => editor.updateSection(type, d)} />;

            case "summary":
                return (
                    <SummarySection
                        data={s.data}
                        onChange={(d) => editor.updateSection(type, d)}
                        isEnhancing={ai.enhancingKey === "summary"}
                        onAiEnhance={async () => {
                            const enhanced = await ai.enhanceSection(s.data.text, "summary", "summary");
                            if (enhanced) editor.updateSection(type, { text: enhanced });
                        }}
                    />
                );

            case "experience":
                return (
                    <ExperienceSection
                        data={s.data}
                        onChange={(d) => editor.updateSection(type, d)}
                        enhancingKey={ai.enhancingKey}
                        onAiEnhance={async (itemId, currentText) => {
                            const key = `exp-${itemId}`;
                            const enhanced = await ai.enhanceSection(currentText, "experience description", key);
                            if (enhanced) {
                                const updated = (s.data as ExperienceItem[]).map((item) =>
                                    item.id === itemId ? { ...item, description: enhanced } : item,
                                );
                                editor.updateSection(type, updated);
                            }
                        }}
                    />
                );

            case "education":
                return <EducationSection data={s.data} onChange={(d) => editor.updateSection(type, d)} />;

            case "skills":
                return <SkillsSection data={s.data} onChange={(d) => editor.updateSection(type, d)} />;

            case "projects":
                return <ProjectsSection data={s.data} onChange={(d) => editor.updateSection(type, d)} />;

            case "languages":
                return <LanguagesSection data={s.data} onChange={(d) => editor.updateSection(type, d)} />;

            case "certifications":
                return <CertificationsSection data={s.data} onChange={(d) => editor.updateSection(type, d)} />;

            case "custom": {
                const raw = s.data as unknown as Record<string, unknown>;

                const d: CustomSectionDataV2 =
                    raw.fields && Array.isArray(raw.fields)
                        ? (raw as unknown as CustomSectionDataV2)
                        : {
                              title: (raw.title as string) ?? sectionDef.label ?? "",
                              fields: raw.content
                                  ? [
                                        {
                                            id: "legacy-1",
                                            type: "textarea" as const,
                                            label: "Contenu",
                                            value: raw.content as string,
                                        },
                                    ]
                                  : [],
                          };

                return (
                    <CustomSectionEditor
                        data={d}
                        onChange={(newData: CustomSectionDataV2) => editor.updateSection(type, newData as never)}
                    />
                );
            }

            default:
                return (
                    <p style={{ fontSize: "12px", color: "var(--gb-muted)", fontStyle: "italic" }}>
                        Section non reconnue.
                    </p>
                );
        }
    };

    const allActiveSections = [
        ...SECTION_DEFS.filter((d) => activeSectionTypes.has(d.type)).map((d) => ({ ...d, label: d.label })),
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

    const saveBtnLabel = state.isSaving ? "Sauvegarde..." : state.isDirty ? "Sauvegarder" : "Sauvegardé";
    const saveStatusColor = !state.isDirty && state.lastSaved ? "#16A34A" : "var(--gb-muted)";

    return (
        <div style={{ height: "100vh", display: "flex", flexDirection: "column", margin: "-24px", overflow: "hidden" }}>
            <div
                style={{
                    height: "52px",
                    flexShrink: 0,
                    background: "var(--gb-app-topbar-bg)",
                    borderBottom: "1px solid var(--gb-border)",
                    backdropFilter: "blur(16px)",
                    display: "flex",
                    alignItems: "center",
                    padding: "0 16px",
                    gap: "10px",
                    zIndex: 30,
                }}>
                <button onClick={onBack} style={topBtnBase}>
                    <ArrowLeft style={{ width: 13, height: 13 }} /> Mes CVs
                </button>

                <Divider />

                <div style={{ flex: 1, minWidth: 0, display: "flex", alignItems: "center", gap: "8px" }}>
                    <input
                        value={state.title}
                        onChange={(e) => editor.setTitle(e.target.value)}
                        style={{
                            background: "transparent",
                            border: "none",
                            outline: "none",
                            fontSize: "13px",
                            fontWeight: 600,
                            color: "var(--gb-text)",
                            fontFamily: "'DM Sans', sans-serif",
                            maxWidth: "220px",
                        }}
                    />
                    <span
                        style={{
                            fontSize: "11px",
                            color: saveStatusColor,
                            display: "flex",
                            alignItems: "center",
                            gap: "3px",
                        }}>
                        {state.isSaving ? (
                            <Loader style={{ width: 11, height: 11, animation: "spin 1s linear infinite" }} />
                        ) : !state.isDirty && state.lastSaved ? (
                            <Check style={{ width: 11, height: 11 }} />
                        ) : null}
                        {state.isSaving
                            ? "Sauvegarde…"
                            : state.lastSaved && !state.isDirty
                              ? `Sauvegardé ${state.lastSaved.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}`
                              : state.isDirty
                                ? "Non sauvegardé"
                                : ""}
                    </span>
                </div>

                <div
                    style={{
                        display: "flex",
                        background: "var(--gb-app-hover)",
                        borderRadius: "9px",
                        padding: "3px",
                        gap: "2px",
                    }}>
                    {(["edit", "preview"] as EditorView[]).map((v) => (
                        <button
                            key={v}
                            onClick={() => setView(v)}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "5px",
                                padding: "5px 11px",
                                borderRadius: "7px",
                                border: "none",
                                background: view === v ? "var(--gb-app-panel-bg)" : "transparent",
                                color: view === v ? "var(--gb-text)" : "var(--gb-muted)",
                                fontWeight: view === v ? 600 : 400,
                                fontSize: "12px",
                                cursor: "pointer",
                                boxShadow: view === v ? "0 1px 4px rgba(0,0,0,0.1)" : "none",
                            }}>
                            {v === "edit" ? (
                                <Edit3 style={{ width: 12, height: 12 }} />
                            ) : (
                                <Eye style={{ width: 12, height: 12 }} />
                            )}
                            {v === "edit" ? "Éditer" : "Aperçu"}
                        </button>
                    ))}
                </div>

                <div style={{ position: "relative" }}>
                    <button
                        onClick={() => setShowTplMenu(!showTplMenu)}
                        style={{
                            ...topBtnBase,
                            background: "var(--gb-app-hover)",
                            border: "1px solid var(--gb-border)",
                        }}>
                        <LayoutTemplate style={{ width: 13, height: 13 }} />
                        <span
                            style={{
                                maxWidth: "90px",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                            }}>
                            {currentTpl.name}
                        </span>
                    </button>
                    {showTplMenu && (
                        <>
                            <div
                                style={{ position: "fixed", inset: 0, zIndex: 10 }}
                                onClick={() => setShowTplMenu(false)}
                            />
                            <div
                                style={{
                                    position: "absolute",
                                    top: "calc(100% + 6px)",
                                    right: 0,
                                    zIndex: 20,
                                    background: "var(--gb-app-panel-bg)",
                                    border: "1px solid var(--gb-border)",
                                    borderRadius: "14px",
                                    padding: "8px",
                                    display: "grid",
                                    gridTemplateColumns: "1fr 1fr",
                                    gap: "5px",
                                    minWidth: "210px",
                                    boxShadow: "0 12px 36px rgba(0,0,0,0.22)",
                                }}>
                                {TEMPLATES.map((t) => (
                                    <button
                                        key={t.id}
                                        onClick={() => {
                                            editor.setTemplate(t.id as CvTemplate);
                                            setShowTplMenu(false);
                                        }}
                                        style={{
                                            background:
                                                state.template === t.id ? "var(--gb-app-active-bg)" : "transparent",
                                            border:
                                                state.template === t.id
                                                    ? "1px solid var(--gb-app-active-border)"
                                                    : "1px solid transparent",
                                            borderRadius: "9px",
                                            padding: "8px",
                                            cursor: "pointer",
                                            textAlign: "left",
                                        }}>
                                        <div
                                            style={{
                                                width: "100%",
                                                height: "4px",
                                                background: t.accentColor,
                                                borderRadius: "2px",
                                                marginBottom: "4px",
                                            }}
                                        />
                                        <span
                                            style={{
                                                fontSize: "10px",
                                                fontWeight: 500,
                                                color: "var(--gb-text-off)",
                                                lineHeight: 1.3,
                                                display: "block",
                                            }}>
                                            {t.name}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </>
                    )}
                </div>

                <button
                    onClick={() => setShowAiPanel(true)}
                    style={{
                        ...topBtnBase,
                        background: "rgba(139,92,246,0.12)",
                        border: "1px solid rgba(139,92,246,0.28)",
                        color: "#a78bfa",
                    }}>
                    <Sparkles style={{ width: 13, height: 13 }} /> AI Improve
                </button>

                <button
                    onClick={editor.saveNow}
                    disabled={state.isSaving || !state.isDirty}
                    style={{
                        ...topBtnBase,
                        background: "var(--gb-app-hover)",
                        border: "1px solid var(--gb-border)",
                        opacity: !state.isDirty ? 0.55 : 1,
                    }}>
                    {state.isSaving ? (
                        <Loader style={{ width: 13, height: 13, animation: "spin 1s linear infinite" }} />
                    ) : (
                        <Save style={{ width: 13, height: 13 }} />
                    )}
                    {saveBtnLabel}
                </button>

                <button
                    onClick={handleExportPdf}
                    disabled={exportLoading}
                    style={{
                        ...topBtnBase,
                        background: "linear-gradient(90deg,#16A34A,#0284C7)",
                        border: "none",
                        color: "#fff",
                        boxShadow: "0 0 18px rgba(22,163,74,0.28)",
                    }}>
                    {exportLoading ? (
                        <Loader style={{ width: 13, height: 13, animation: "spin 1s linear infinite" }} />
                    ) : (
                        <Download style={{ width: 13, height: 13 }} />
                    )}
                    Export PDF
                </button>
            </div>

            <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
                {view === "edit" && (
                    <div
                        style={{
                            width: `${formWidth}px`,
                            flexShrink: 0,
                            overflowY: "auto",
                            background: "var(--gb-bg)",
                            transition: "none",
                        }}>
                        <div style={{ padding: "14px 18px 0" }}>
                            <AtsScorePanel
                                score={state.atsScore}
                                result={ai.atsResult}
                                isLoading={ai.loadingAts}
                                hasCvId={!!state.id}
                                onCheck={(jd) => {
                                    ai.checkAts(jd)?.then((r) => {
                                        if (r) editor.setAtsScore(r.score);
                                    });
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
                                            style={{
                                                display: "flex",
                                                alignItems: "center",
                                                gap: "9px",
                                                padding: "11px 13px",
                                                cursor: "pointer",
                                                userSelect: "none",
                                            }}>
                                            <span style={{ color: "#16A34A", display: "flex" }}>{def.icon}</span>
                                            <span
                                                style={{
                                                    flex: 1,
                                                    fontSize: "13px",
                                                    fontWeight: 600,
                                                    color: "var(--gb-text)",
                                                }}>
                                                {def.label}
                                            </span>
                                            {isOpen ? (
                                                <ChevronDown
                                                    style={{ width: 13, height: 13, color: "var(--gb-muted)" }}
                                                />
                                            ) : (
                                                <ChevronRight
                                                    style={{ width: 13, height: 13, color: "var(--gb-muted)" }}
                                                />
                                            )}
                                        </div>
                                        {isOpen && (
                                            <div style={{ padding: "13px", borderTop: "1px solid var(--gb-border)" }}>
                                                {getSectionContent(def)}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}

                            <button
                                onClick={() => setShowCustomSectionModal(true)}
                                style={{
                                    width: "100%",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    gap: "6px",
                                    background: "transparent",
                                    border: "1.5px dashed var(--gb-border2)",
                                    borderRadius: "11px",
                                    padding: "10px",
                                    color: "var(--gb-muted)",
                                    fontSize: "13px",
                                    fontWeight: 500,
                                    cursor: "pointer",
                                    transition: "all 0.15s",
                                    marginTop: "4px",
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.borderColor = "rgba(22,163,74,0.4)";
                                    e.currentTarget.style.color = "#16A34A";
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.borderColor = "var(--gb-border2)";
                                    e.currentTarget.style.color = "var(--gb-muted)";
                                }}>
                                <Plus style={{ width: 13, height: 13 }} /> Ajouter une section
                            </button>
                        </div>
                    </div>
                )}

                {view === "edit" && (
                    <ResizeHandle leftWidth={formWidth} onWidthChange={setFormWidth} minLeft={280} maxLeft={700} />
                )}

                <div
                    style={{
                        flex: 1,
                        overflowY: "auto",
                        background: "#e2e5e9",
                        display: "flex",
                        justifyContent: "center",
                        padding: "28px",
                    }}>
                    <div
                        style={{
                            width: "100%",
                            maxWidth: "680px",
                            background: "#fff",
                            boxShadow: "0 4px 40px rgba(0,0,0,0.14)",
                            borderRadius: "3px",
                            minHeight: "880px",
                        }}>
                        <CvPreview template={state.template} sections={state.sections} />
                    </div>
                </div>
            </div>

            {showCustomSectionModal && (
                <CustomSectionModal
                    onClose={() => setShowCustomSectionModal(false)}
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

            <style>{`@keyframes spin { to { transform:rotate(360deg); } }`}</style>
        </div>
    );
}

const topBtnBase: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    background: "transparent",
    border: "1px solid transparent",
    borderRadius: "9px",
    padding: "6px 11px",
    cursor: "pointer",
    color: "var(--gb-text-off)",
    fontSize: "12px",
    fontWeight: 500,
    fontFamily: "'DM Sans', sans-serif",
    flexShrink: 0,
    transition: "background 0.15s, color 0.15s",
};

function Divider() {
    return <div style={{ width: "1px", height: "20px", background: "var(--gb-border)", flexShrink: 0 }} />;
}
