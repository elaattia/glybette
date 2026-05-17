import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useFullProfile } from "@/hooks/useUserProfile";
import { ArrowLeft, Mic, FileText, Brain, Target, ChevronRight } from "lucide-react";

import { useJobDetail } from "./hooks/useJobDetail";
import { JobHeaderCard } from "./components/JobHeaderCard";
import { MatchingPanel }  from "./components/MatchingPanel";
import { OverviewTab }    from "./components/OverviewTab";
import { InterviewTab }   from "./components/InterviewTab";
import { CoverLetterTab } from "./components/CoverLetterTab";
import { CvAdaptTab }     from "./components/CvAdaptTab";
import { detailStyles as styles } from "./styles";

type Tab = "overview" | "interview" | "cover-letter" | "cv-adapt";

export default function JobDetailPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { profile, profileText } = useFullProfile();

    const [activeTab, setActiveTab] = React.useState<Tab>("overview");

    const userProfile = {
        summary:    profile.summary    ?? "",
        skills:     profile.skills     ?? [],
        experience: profile.experience ?? [],
        education:  profile.education  ?? [],
        languages:  profile.languages  ?? [],
        lookingFor: profile.opportunities ?? [],
        domain:     profile.domain,
        journey:    profile.journey,
    };

    const {
        offre, matching, questions,
        loadingOffre, loadingMatch, loadingQuestions,
        computeMatching, generateQuestions,
    } = useJobDetail(id, userProfile);

    const handleTabChange = (tab: Tab) => {
        setActiveTab(tab);
        if (tab === "interview" && !questions) generateQuestions();
    };

    if (loadingOffre) {
        return (
            <div style={styles.loadingPage}>
                <div style={styles.spinner} />
                <p style={{ color: "var(--gb-muted)", fontSize: 13 }}>Chargement de l'offre...</p>
            </div>
        );
    }
    if (!offre) {
        return (
            <div style={styles.loadingPage}>
                <p style={{ color: "var(--gb-text)", marginBottom: 14 }}>Offre introuvable.</p>
                <button onClick={() => navigate("/app/opportunities")} style={styles.backBtn}>
                    ← Retour aux offres
                </button>
            </div>
        );
    }

    const tabs = [
        { id: "overview",     label: "Vue d'ensemble", icon: <Target   size={14} /> },
        { id: "interview",    label: "Entretien",      icon: <Mic      size={14} /> },
        { id: "cover-letter", label: "Lettre",         icon: <FileText size={14} /> },
        { id: "cv-adapt",     label: "Adapter CV",     icon: <Brain    size={14} /> },
    ] as const;

    const actions = [
        { tab: "interview"    as Tab, icon: <Mic      size={16} />, label: "Préparer l'entretien", color: "#38bdf8", bg: "rgba(2,132,199,0.1)" },
        { tab: "cover-letter" as Tab, icon: <FileText size={16} />, label: "Lettre de motivation", color: "#a78bfa", bg: "rgba(139,92,246,0.1)" },
        { tab: "cv-adapt"     as Tab, icon: <Brain    size={16} />, label: "Adapter mon CV",       color: "#22c55e", bg: "rgba(22,163,74,0.1)" },
    ];

    return (
        <div style={styles.page}>
            <button onClick={() => navigate("/app/opportunities")} style={styles.backLink}>
                <ArrowLeft size={15} /> Retour aux offres
            </button>

            <div style={styles.grid}>
                <div style={styles.leftCol}>
                    <JobHeaderCard offre={offre} />

                    <MatchingPanel
                        matching={matching}
                        loading={loadingMatch}
                        onRefresh={computeMatching}
                    />

                    <div style={styles.actionsCard}>
                        <div style={styles.sectionTitle}>Actions IA</div>
                        {actions.map((a) => (
                            <button
                                key={a.tab}
                                onClick={() => handleTabChange(a.tab)}
                                style={{
                                    ...styles.actionBtn,
                                    background:  activeTab === a.tab ? a.bg : "transparent",
                                    borderColor: activeTab === a.tab ? a.color : "var(--gb-border)",
                                    color:       activeTab === a.tab ? a.color : "var(--gb-text-off)",
                                }}>
                                <span style={{ color: a.color }}>{a.icon}</span>
                                {a.label}
                                <ChevronRight size={14} style={{ marginLeft: "auto", opacity: 0.5 }} />
                            </button>
                        ))}
                    </div>
                </div>

                <div style={styles.rightCol}>
                    <div style={styles.tabBar}>
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => handleTabChange(tab.id)}
                                style={styles.tabBtn(activeTab === tab.id)}>
                                {tab.icon}<span>{tab.label}</span>
                            </button>
                        ))}
                    </div>

                    {activeTab === "overview" && (
                        <OverviewTab offre={offre} />
                    )}
                    {activeTab === "interview" && (
                        <InterviewTab
                            offre={offre}
                            userProfile={userProfile}
                            questions={questions}
                            loading={loadingQuestions}
                            onGenerateQuestions={generateQuestions}
                        />
                    )}
                    {activeTab === "cover-letter" && (
                        <CoverLetterTab offre={offre} profileText={profileText ?? ""} />
                    )}
                    {activeTab === "cv-adapt" && (
                        <CvAdaptTab
                            offre={offre}
                            userProfile={userProfile}
                            profileText={profileText ?? ""}
                            matchScore={matching?.score}
                        />
                    )}
                </div>
            </div>

            <style>{`
                @keyframes spin   { to { transform: rotate(360deg); } }
                @keyframes pulse  { 0%,100% { opacity:1; } 50% { opacity:0.5; } }
                @keyframes fadeIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:none; } }
                @keyframes bounce { 0%,80%,100% { transform:scale(0); } 40% { transform:scale(1); } }
            `}</style>
        </div>
    );
}