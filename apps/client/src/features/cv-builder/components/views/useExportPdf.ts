import { useState } from "react";
import { cvApi } from "../../api/cv.api";
import { getTemplate } from "../../templates";


export function useExportPdf(editor: {
    state: { id: string; title: string; template: string; isSaving?: boolean };
    saveNow: () => Promise<void>;
    setPdfUrl: (url: string) => void;
}) {
    const [exportLoading, setExportLoading] = useState(false);

    const exportPdf = async () => {
        if (!editor.state.id) await editor.saveNow();
        if (!editor.state.id) return;

        setExportLoading(true);
        try {
            const html2pdf = (await import("html2pdf.js")).default;
            const element = document.getElementById("cv-pdf-content");
            if (!element) throw new Error("Preview element not found");

            const currentTpl = getTemplate(editor.state.template);
            const pxPerMm = element.offsetWidth / 210;
            const printableHeightPx = 267 * pxPerMm;
            const totalPages = Math.max(1, Math.ceil(element.scrollHeight / printableHeightPx));
            const originalMinHeight = element.style.minHeight;
            element.style.minHeight = `${totalPages * 267}mm`;

            const opt = {
                margin: [15, 0],
                filename: `${editor.state.title || "cv"}.pdf`,
                image: { type: "jpeg", quality: 0.98 },
                html2canvas: { scale: 2, useCORS: true, logging: false },
                jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
                pagebreak: { mode: ["css", "legacy"], avoid: ".cv-section" },
            };

            await html2pdf()
                .set(opt)
                .from(element)
                .toPdf()
                .get("pdf")
                .then((pdf: any) => {
                    const pages = pdf.internal.getNumberOfPages();
                    for (let i = 1; i <= pages; i++) {
                        pdf.setPage(i);
                        if (editor.state.template === "creative") {
                            pdf.setFillColor(currentTpl.previewBg || "#000000");
                            pdf.rect(0, 0, 210 * 0.38, 15, "F");
                            pdf.rect(0, 297 - 15, 210 * 0.38, 15, "F");
                            pdf.setFillColor("#ffffff");
                            pdf.rect(210 * 0.38, 0, 210 * 0.62, 15, "F");
                            pdf.rect(210 * 0.38, 297 - 15, 210 * 0.62, 15, "F");
                        } else {
                            const bg = currentTpl.previewBg || "#ffffff";
                            if (bg !== "#ffffff") {
                                pdf.setFillColor(bg);
                                pdf.rect(0, 0, 210, 15, "F");
                                pdf.rect(0, 297 - 15, 210, 15, "F");
                            }
                        }
                    }
                })
                .save();

            element.style.minHeight = originalMinHeight;

            cvApi
                .generatePdf(editor.state.id)
                .then((res) => { if (res?.pdfUrl) editor.setPdfUrl(res.pdfUrl); })
                .catch((e) => console.warn("Background pdf save failed", e));

        } catch (e) {
            console.error("PDF Export failed", e);
            try {
                const { pdfUrl } = await cvApi.generatePdf(editor.state.id);
                editor.setPdfUrl(pdfUrl);
                const a = document.createElement("a");
                a.href = pdfUrl;
                a.download = `${editor.state.title || "cv"}.pdf`;
                a.click();
            } catch {
                alert("Erreur lors de l'export PDF. Veuillez réessayer.");
            }
        } finally {
            setExportLoading(false);
        }
    };

    return { exportPdf, exportLoading };
}