import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { CvEditorView } from "@/features/cv-builder";
import { cvApi } from "@/features/cv-builder";
import type { CvEditorState } from "@/features/cv-builder";

export default function CvEditorPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const { data, isLoading, isError } = useQuery({
        queryKey: ["cvs", id],
        queryFn: () => cvApi.getOne(id!).then((r) => r.cv),
        enabled: !!id,
        staleTime: 0, 
    });

    if (isLoading) {
        return (
            <div style={{
                height: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
                background: "var(--gb-bg)",
            }}>
                <div style={{ textAlign: "center" }}>
                    <div style={{
                        width: "40px", height: "40px", borderRadius: "50%",
                        border: "3px solid var(--gb-border)",
                        borderTopColor: "#16A34A",
                        animation: "spin 0.8s linear infinite",
                        margin: "0 auto 14px",
                    }} />
                    <p style={{ fontSize: "13px", color: "var(--gb-muted)" }}>Chargement du CV...</p>
                </div>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    if (isError || !data) {
        return (
            <div style={{
                height: "100vh", display: "flex", alignItems: "center",
                justifyContent: "center", background: "var(--gb-bg)",
            }}>
                <div style={{ textAlign: "center" }}>
                    <p style={{ fontSize: "14px", color: "var(--gb-text)", marginBottom: "14px" }}>
                        CV introuvable.
                    </p>
                    <button
                        onClick={() => navigate("/app/cv")}
                        style={{
                            background: "linear-gradient(90deg,#16A34A,#0284C7)",
                            color: "#fff", border: "none", borderRadius: "10px",
                            padding: "9px 20px", fontSize: "13px",
                            fontWeight: 600, cursor: "pointer",
                        }}
                    >
                        Retour à mes CVs
                    </button>
                </div>
            </div>
        );
    }

    const initialState: CvEditorState = {
        id:        data._id,
        title:     data.title,
        template:  data.template,
        sections:  data.sections,
        pdfUrl:    data.pdfUrl,
        atsScore:  data.atsScore,
        isDirty:   false,
        isSaving:  false,
        lastSaved: new Date(data.updatedAt),
    };

    return (
        <CvEditorView
            initialState={initialState}
            onBack={() => navigate("/app/cv")}
        />
    );
}