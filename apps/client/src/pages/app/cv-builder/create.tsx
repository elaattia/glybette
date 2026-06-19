import * as pdfjsLib from "pdfjs-dist";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import type { TFunction } from "i18next";
import { FileText, Bot, Sparkles } from "lucide-react";
import { TemplatePickerView } from "@/features/cv-builder";
import { makeDefaultSections } from "@/features/cv-builder";
import { cvApi } from "@/features/cv-builder";
import { CV_LIST_KEY } from "@/features/cv-builder/hooks/useCvList";
import type { TemplateInfo, ExtractResult } from "@/features/cv-builder";

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

type UploadStep = "reading" | "extracting" | "creating" | null;

function UploadProgressOverlay({ step, fileName, t }: { step: UploadStep; fileName?: string; t: TFunction }) {
    if (!step) return null;
    const STEPS: { key: UploadStep & string; labelKey: string; Icon: React.ComponentType<{ size?: number; style?: React.CSSProperties }> }[] = [
        { key: "reading", labelKey: "create.upload.steps.reading", Icon: FileText },
        { key: "extracting", labelKey: "create.upload.steps.extracting", Icon: Bot },
        { key: "creating", labelKey: "create.upload.steps.creating", Icon: Sparkles },
    ];
    const currentIdx = STEPS.findIndex((s) => s.key === step);
    const CurrentIcon = STEPS[currentIdx]?.Icon;
    return (
        <div
            style={{
                position: "fixed",
                inset: 0,
                zIndex: 100,
                background: "rgba(0,0,0,0.65)",
                backdropFilter: "blur(8px)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
            }}>
            <div
                style={{
                    background: "var(--gb-surface)",
                    border: "1px solid var(--gb-border)",
                    borderRadius: "20px",
                    padding: "36px 40px",
                    maxWidth: "420px",
                    width: "90%",
                    boxShadow: "0 24px 64px rgba(0,0,0,0.4)",
                    textAlign: "center",
                }}>
                <div
                    style={{
                        width: "72px",
                        height: "72px",
                        borderRadius: "20px",
                        background: "linear-gradient(135deg,rgba(22,163,74,0.15),rgba(2,132,199,0.15))",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        margin: "0 auto 20px",
                        animation: "pulse 1.5s ease-in-out infinite",
                    }}>
                    {CurrentIcon && <CurrentIcon size={32} style={{ color: "#16A34A" }} />}
                </div>
                <h3 style={{ margin: "0 0 6px", fontSize: "16px", fontWeight: 700, color: "var(--gb-text)" }}>
                    {t("create.upload.title")}
                </h3>
                {fileName && (
                    <p
                        style={{
                            margin: "0 0 20px",
                            fontSize: "12px",
                            color: "var(--gb-muted)",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                        }}>
                        {fileName}
                    </p>
                )}
                <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "24px" }}>
                    {STEPS.map((s, idx) => {
                        const isDone = idx < currentIdx;
                        const isActive = idx === currentIdx;
                        const StepIcon = s.Icon;
                        return (
                            <div
                                key={s.key}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "10px",
                                    padding: "10px 14px",
                                    borderRadius: "10px",
                                    background: isActive ? "rgba(22,163,74,0.08)" : "transparent",
                                    border: isActive ? "1px solid rgba(22,163,74,0.2)" : "1px solid transparent",
                                    transition: "all 0.3s",
                                }}>
                                <div
                                    style={{
                                        width: "24px",
                                        height: "24px",
                                        borderRadius: "50%",
                                        background: isDone
                                            ? "#16A34A"
                                            : isActive
                                                ? "transparent"
                                                : "var(--gb-app-hover)",
                                        border: isActive ? "2px solid #16A34A" : "none",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        flexShrink: 0,
                                        animation: isActive ? "spin 1s linear infinite" : "none",
                                    }}>
                                    {isDone && <span style={{ color: "#fff", fontSize: "12px" }}>✓</span>}
                                    {isActive && (
                                        <div
                                            style={{
                                                width: "10px",
                                                height: "10px",
                                                borderRadius: "50%",
                                                background: "#16A34A",
                                            }}
                                        />
                                    )}
                                </div>
                                <StepIcon size={14} style={{ color: isDone ? "#16A34A" : isActive ? "var(--gb-text)" : "var(--gb-muted)", flexShrink: 0 }} />
                                <span
                                    style={{
                                        fontSize: "13px",
                                        fontWeight: isActive ? 600 : 400,
                                        color: isDone ? "#16A34A" : isActive ? "var(--gb-text)" : "var(--gb-muted)",
                                    }}>
                                    {t(s.labelKey)}
                                </span>
                            </div>
                        );
                    })}
                </div>
                <div
                    style={{
                        height: "4px",
                        background: "var(--gb-app-hover)",
                        borderRadius: "99px",
                        overflow: "hidden",
                    }}>
                    <div
                        style={{
                            height: "100%",
                            width: `${((currentIdx + 1) / STEPS.length) * 100}%`,
                            background: "linear-gradient(90deg,#16A34A,#0284C7)",
                            borderRadius: "99px",
                            transition: "width 0.5s ease",
                        }}
                    />
                </div>
                <p style={{ margin: "12px 0 0", fontSize: "11px", color: "var(--gb-muted)" }}>
                    {step === "extracting" ? t("create.upload.extractingHint") : t("create.upload.pleaseWait")}
                </p>
            </div>
            <style>{`
        @keyframes spin  { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100% { opacity:1;transform:scale(1); } 50% { opacity:0.8;transform:scale(0.96); } }
      `}</style>
        </div>
    );
}

async function extractTextFromFile(file: File, t: TFunction): Promise<string> {
    if (file.name.toLowerCase().endsWith(".docx") || file.name.toLowerCase().endsWith(".doc")) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const binary = e.target?.result as ArrayBuffer;
                const bytes = new Uint8Array(binary);
                let text = "";
                for (let i = 0; i < bytes.length; i++) {
                    const c = bytes[i];
                    if ((c >= 0x20 && c <= 0x7e) || c === 0x0a || c === 0x0d || c === 0x09) {
                        text += String.fromCharCode(c);
                    }
                }
                const clean = text
                    .replace(/[\x00-\x08\x0b\x0c\x0e-\x1f]/g, " ")
                    .replace(/[^\x20-\x7e\n\r\t]/g, " ")
                    .replace(/\s{4,}/g, "\n")
                    .replace(/([a-z])([A-Z])/g, "$1 $2")
                    .trim()
                    .slice(0, 10000);
                resolve(clean.length > 50 ? clean : `[DOCX: ${file.name}]`);
            };
            reader.onerror = () => reject(new Error(t("create.docxReadError")));
            reader.readAsArrayBuffer(file);
        });
    }
    if (file.name.toLowerCase().endsWith(".pdf")) {
        try {
            const arrayBuffer = await file.arrayBuffer();
            const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
            let fullText = "";
            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const textContent = await page.getTextContent();

                const pageText = textContent.items.map((item: any) => item.str).join(" ");

                fullText += pageText + "\n";
            }
            const clean = fullText
                .replace(/\s{3,}/g, "\n")
                .trim()
                .slice(0, 10000);
            console.log("[extractTextFromFile] Le vrai texte décodé :", clean.slice(0, 200));
            return clean.length > 50 ? clean : `[PDF: ${file.name}]`;
        } catch (error) {
            console.error("Échec critique du parsing PDF", error);
            throw new Error(t("create.pdfReadError"));
        }
    }
    return "";
}

function extractResultToSections(result: ExtractResult, templateId?: string, t?: TFunction) {
    const sections = makeDefaultSections(templateId, t);

    const personalSection = sections.find((s) => s.type === "personal-info");
    if (personalSection && result.personalInfo) {
        const pi = result.personalInfo;
        const piAny = pi as unknown as Record<string, string>;

        personalSection.data = {
            firstName: pi.firstName || "",
            lastName: pi.lastName || "",
            roleTitle: pi.roleTitle || "",
            email: pi.email || "",
            phone: pi.phone || "",
            location: pi.location || "",
            linkedin: pi.linkedin || "",
            github: pi.github || "",
            portfolio: piAny.portfolio || piAny.website || "",
            photo: "",
        };
    }

    const summarySection = sections.find((s) => s.type === "summary");
    if (summarySection && result.summary?.trim()) {
        summarySection.data = { text: result.summary };
    }

    const expSection = sections.find((s) => s.type === "experience");
    if (expSection && result.experience?.length) {
        expSection.data = result.experience
            .filter((e) => e.company || e.position)
            .map((e) => ({
                id: crypto.randomUUID(),
                company: e.company || "",
                position: e.position || "",
                startDate: e.startDate || "",
                endDate: e.endDate || "",
                current: e.current || false,
                location: e.location || "",
                description: e.description || "",
                highlights: [],
            }));
    }

    const eduSection = sections.find((s) => s.type === "education");
    if (eduSection && result.education?.length) {
        eduSection.data = result.education
            .filter((e) => e.institution || e.degree)
            .map((e) => ({
                id: crypto.randomUUID(),
                institution: e.institution || "",
                degree: e.degree || "",
                field: e.field || "",
                startDate: e.startDate || "",
                endDate: e.endDate || "",
                current: false,
                gpa: e.gpa || "",
                description: "",
            }));
    }

    const skillsSection = sections.find((s) => s.type === "skills");
    if ((result.skills || []).length > 0) {
        const filteredSkills = result.skills!.filter((g) => g.skills?.length > 0);
        if (filteredSkills.length > 0) {
            if (skillsSection) {
                skillsSection.data = filteredSkills.map((g) => ({
                    id: crypto.randomUUID(),
                    category: g.category || "",
                    skills: g.skills || [],
                }));
            }
        }
    }

    if ((result.projects || []).filter((p) => p.name).length > 0) {
        const existing = sections.find((s) => s.type === "projects");
        if (existing) {
            existing.data = result.projects!
                .filter((p) => p.name)
                .map((p) => ({
                    id: crypto.randomUUID(),
                    name: p.name || "",
                    description: p.description || "",
                    technologies: p.technologies || [],
                    url: "",
                    github: "",
                }));
        } else {
            sections.push({
                type: "projects",
                order: sections.length,
                data: result.projects
                    .filter((p) => p.name)
                    .map((p) => ({
                        id: crypto.randomUUID(),
                        name: p.name || "",
                        description: p.description || "",
                        technologies: p.technologies || [],
                        url: "",
                        github: "",
                    })),
            });
        }
    }

    if ((result.languages || []).filter((l) => l.language).length > 0) {
        const existing = sections.find((s) => s.type === "languages");
        if (existing) {
            existing.data = result.languages!
                .filter((l) => l.language)
                .map((l) => ({
                    id: crypto.randomUUID(),
                    language: l.language || "",
                    level: (l.level || "B2") as never,
                }));
        } else {
            sections.push({
                type: "languages",
                order: sections.length,
                data: result.languages!
                    .filter((l) => l.language)
                    .map((l) => ({
                        id: crypto.randomUUID(),
                        language: l.language || "",
                        level: (l.level || "B2") as never,
                    })),
            });
        }
    }

    if ((result.certifications || []).filter((c) => c.name).length > 0) {
        const existing = sections.find((s) => s.type === "certifications");
        if (existing) {
            existing.data = result.certifications!
                .filter((c) => c.name)
                .map((c) => ({
                    id: crypto.randomUUID(),
                    name: c.name || "",
                    issuer: c.issuer || "",
                    date: c.date || "",
                    url: "",
                }));
        } else {
            sections.push({
                type: "certifications",
                order: sections.length,
                data: result.certifications
                    .filter((c) => c.name)
                    .map((c) => ({
                        id: crypto.randomUUID(),
                        name: c.name || "",
                        issuer: c.issuer || "",
                        date: c.date || "",
                        url: "",
                    })),
            });
        }
    }

    return sections;
}

export default function CvCreatePage() {
    const { t } = useTranslation("cvBuilder");
    const navigate = useNavigate();
    const qc = useQueryClient();
    const [uploadStep, setUploadStep] = useState<UploadStep>(null);
    const [uploadFile, setUploadFile] = useState<string | undefined>();

    const handleReady = async (template: TemplateInfo, mode: "blank" | "upload", file?: File) => {
        if (mode === "blank") {
            try {
                const { cv } = await cvApi.create({
                    title: t("create.defaultTitle"),
                    template: template.id,
                    sections: makeDefaultSections(template.id, t),
                });
                qc.invalidateQueries({ queryKey: CV_LIST_KEY });
                navigate(`/app/cv/${cv._id}`);
            } catch (err) {
                console.error("[create] Failed to create blank CV", err);
                alert(t("create.createError"));
            }
            return;
        }

        if (mode === "upload" && file) {
            setUploadFile(file.name);
            try {
                setUploadStep("reading");
                const rawText = await extractTextFromFile(file, t);
                console.log("[create] extracted text length:", rawText.length);
                console.log("[create] text preview:", rawText.slice(0, 300));

                setUploadStep("extracting");
                let sections = makeDefaultSections(template.id, t);

                if (rawText.length > 50 && !rawText.startsWith("[PDF:") && !rawText.startsWith("[DOCX:")) {
                    try {
                        const extracted = await cvApi.extractFromText(rawText);
                        console.log("[create] extraction result:", {
                            firstName: extracted.personalInfo?.firstName,
                            expCount: extracted.experience?.length,
                            eduCount: extracted.education?.length,
                            skillCount: extracted.skills?.length,
                        });

                        const hasData =
                            extracted.personalInfo?.firstName ||
                            extracted.personalInfo?.email ||
                            extracted.experience?.length > 0 ||
                            extracted.education?.length > 0 ||
                            extracted.skills?.length > 0;

                        if (hasData) {
                            sections = extractResultToSections(extracted, template.id, t) as typeof sections;
                        } else {
                            alert(t("create.importFailedAlert"));
                            console.warn("[create] extraction returned no meaningful data, using blank sections");
                        }
                    } catch (err) {
                        console.warn("[create] AI extraction failed:", err);
                    }
                } else {
                    console.warn("[create] text too short or placeholder, skipping AI extraction");
                }

                setUploadStep("creating");
                const title = file.name
                    .replace(/\.[^.]+$/, "")
                    .replace(/[-_]/g, " ")
                    .trim();

                const { cv } = await cvApi.create({
                    title: title || t("create.importedTitle"),
                    template: template.id,
                    sections,
                });
                qc.invalidateQueries({ queryKey: CV_LIST_KEY });
                navigate(`/app/cv/${cv._id}`);
            } catch (err) {
                console.error("[create] upload pipeline failed:", err);
                setUploadStep("creating");
                const { cv } = await cvApi.create({
                    title: file.name.replace(/\.[^.]+$/, "") || t("create.importedTitle"),
                    template: template.id,
                    sections: makeDefaultSections(template.id, t),
                });
                qc.invalidateQueries({ queryKey: CV_LIST_KEY });
                navigate(`/app/cv/${cv._id}`);
            } finally {
                setUploadStep(null);
                setUploadFile(undefined);
            }
        }
    };

    return (
        <>
            <UploadProgressOverlay step={uploadStep} fileName={uploadFile} t={t} />
            <TemplatePickerView
                onBack={() => navigate("/app/cv")}
                onReady={handleReady}
                isUploading={uploadStep !== null}
            />
        </>
    );
}