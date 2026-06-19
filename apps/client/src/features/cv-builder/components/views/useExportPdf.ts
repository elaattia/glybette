import { useState } from "react";
import { useTranslation } from "react-i18next";
import { cvApi } from "../../api/cv.api";
import { getTemplate } from "../../templates";

const A4_W = 210;
const A4_H = 297;


const MARGIN_TOP = 0;
const MARGIN_SIDE = 0;

export function useExportPdf(editor: {
    state: { id?: string; title: string; template: string; isSaving?: boolean };
    saveNow: () => Promise<void>;
    setPdfUrl: (url: string) => void;
}) {
    const { t } = useTranslation("cvBuilder");
    const [exportLoading, setExportLoading] = useState(false);

    const exportPdf = async () => {
        if (!editor.state.id) await editor.saveNow();
        if (!editor.state.id) return;

        setExportLoading(true);

        const element = document.getElementById("cv-pdf-content");
        if (!element) {
            setExportLoading(false);
            return;
        }

        const originalMinHeight = element.style.minHeight;
        const originalOverflow = element.style.overflow;

        try {
            const html2pdf = (await import("html2pdf.js")).default;
            const currentTpl = getTemplate(editor.state.template);

            element.style.minHeight = "";
            element.style.overflow = "visible";

            await new Promise((r) => setTimeout(r, 80));

            const opt = {
                margin: [MARGIN_TOP, MARGIN_SIDE] as [number, number],
                filename: `${editor.state.title || "cv"}.pdf`,
                image: { type: "jpeg" as const, quality: 0.98 },
                html2canvas: {
                    scale: 2,
                    useCORS: true,
                    logging: false,
                    windowWidth: element.scrollWidth,
                    windowHeight: element.scrollHeight,
                },
                jsPDF: {
                    unit: "mm",
                    format: "a4",
                    orientation: "portrait" as const,
                    compress: true,
                },
                pagebreak: {
                    mode: ["css", "legacy"],
                    avoid: [
                        ".cv-section",
                        ".avoid-break",
                        "li",
                        "h2",
                        "h3",
                        "h4",
                        "p",
                        ".experience-item",
                        ".education-item",
                    ],
                },
            };

            const worker = html2pdf().set(opt).from(element).toPdf();

            await worker.get("pdf").then((pdf: any) => {
                const pages = pdf.internal.getNumberOfPages();

                const isTwoCol =
                    editor.state.template === "creative" ||
                    editor.state.template === "sidebar" ||
                    editor.state.template === "modern";

                const leftRatio = 0.38;
                const leftW = A4_W * leftRatio;
                const rightW = A4_W * (1 - leftRatio);

                const sidebarBg = currentTpl.previewBg || "#1a3a5c";

                const rightBg = "#ffffff";

                for (let i = 1; i <= pages; i++) {
                    pdf.setPage(i);

                    if (isTwoCol) {
                        pdf.setFillColor(sidebarBg);
                        pdf.rect(0, 0, leftW, 1, "F");          
                        pdf.setFillColor(rightBg);
                        pdf.rect(leftW, 0, rightW, 1, "F");     

                        pdf.setFillColor(sidebarBg);
                        pdf.rect(0, A4_H - 1, leftW, 1, "F");   
                        pdf.setFillColor(rightBg);
                        pdf.rect(leftW, A4_H - 1, rightW, 1, "F"); 
                    } else {
                        const bg = currentTpl.previewBg || "#ffffff";
                        pdf.setFillColor(bg);
                        pdf.rect(0, 0, A4_W, 1, "F");           
                        pdf.rect(0, A4_H - 1, A4_W, 1, "F");    
                    }
                }
            });

            await worker.save();

            element.style.minHeight = originalMinHeight;
            element.style.overflow = originalOverflow;

            cvApi
                .generatePdf(editor.state.id)
                .then((res) => {
                    if (res?.pdfUrl) editor.setPdfUrl(res.pdfUrl);
                })
                .catch((e) => console.warn("Background pdf save failed", e));
        } catch (e) {
            console.error("PDF Export failed", e);

            element.style.minHeight = originalMinHeight;
            element.style.overflow = originalOverflow;

            try {
                const { pdfUrl } = await cvApi.generatePdf(editor.state.id);
                editor.setPdfUrl(pdfUrl);
                const a = document.createElement("a");
                a.href = pdfUrl;
                a.download = `${editor.state.title || "cv"}.pdf`;
                a.click();
            } catch {
                alert(t("editor.exportError"));
            }
        } finally {
            setExportLoading(false);
        }
    };

    return { exportPdf, exportLoading };
}