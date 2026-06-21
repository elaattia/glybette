import React, { useState, useCallback } from "react";
import { Mic, MicOff, Send, MessageCircle, Play, Lightbulb, CheckCircle, AlertTriangle, Key } from "lucide-react";
import { useLocale } from "@/hooks/useLocale";
import { getIntlLocale } from "@/lib/locale-format";
import { InterviewChat } from "./InterviewChat";
import { detailStyles as styles } from "../styles";
import type { Offre, InterviewQuestions, AnswerEval } from "../types";
import { getJobsApiUrl } from "@/lib/env";

interface InterviewTabProps {
    offre: Offre;
    userProfile: any;
    questions: InterviewQuestions | null;
    loading: boolean;
    onGenerateQuestions: () => void;
}

export function InterviewTab({ offre, userProfile, questions, loading, onGenerateQuestions }: InterviewTabProps) {
    const { t, locale } = useLocale("opportunities");
    const [subTab, setSubTab] = useState<"questions" | "chat">("questions");
    const [category, setCategory] = useState<"behavioural" | "technical" | "situational">("behavioural");
    const [currentIdx, setCurrentIdx] = useState(0);
    const [answer, setAnswer] = useState("");
    const [eval_, setEval] = useState<AnswerEval | null>(null);
    const [loadingEval, setLoadingEval] = useState(false);

    const [isListening, setIsListening] = useState(false);
    const recognitionRef = React.useRef<any>(null);
    const isVoiceSupported = Boolean((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);
    const speechLang = getIntlLocale(locale);

    const toggleVoice = useCallback(() => {
        if (isListening) {
            recognitionRef.current?.stop();
            setIsListening(false);
            return;
        }
        const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (!SR) return;
        const r = new SR();
        r.lang = speechLang; r.continuous = true; r.interimResults = true;
        r.onstart = () => setIsListening(true);
        r.onerror = () => setIsListening(false);
        r.onend = () => setIsListening(false);
        r.onresult = (event: any) => {
            let final = "";
            for (let i = event.resultIndex; i < event.results.length; i++) {
                if (event.results[i].isFinal) final += event.results[i][0].transcript;
            }
            if (final) setAnswer((prev) => prev ? `${prev} ${final}` : final);
        };
        r.start();
        recognitionRef.current = r;
    }, [isListening, speechLang]);

    const evaluateAnswer = useCallback(async () => {
        if (!answer.trim() || !questions) return;
        setLoadingEval(true); setEval(null);
        try {
            const question = questions[category][currentIdx] ?? "";
            const res = await fetch(getJobsApiUrl("/interview/evaluate"), {
                method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include",
                body: JSON.stringify({ question, answer, jobContext: offre.titre }),
            });
            setEval(await res.json());
        } catch (e) { console.error(e); }
        finally { setLoadingEval(false); }
    }, [answer, questions, category, currentIdx, offre.titre]);

    const qList = questions?.[category] ?? [];
    const currentQ = qList[currentIdx] ?? "";

    const resetQuestion = (cat: typeof category, idx: number) => {
        setCategory(cat); setCurrentIdx(idx); setAnswer(""); setEval(null);
    };

    return (
        <div style={styles.tabContent}>
            <div style={styles.subTabBar}>
                <button
                    onClick={() => { setSubTab("questions"); if (!questions) onGenerateQuestions(); }}
                    style={styles.subTabBtn(subTab === "questions")}>
                    <Mic size={13} /> {t("detail.interview.subTabs.questions")}
                </button>
                <button onClick={() => setSubTab("chat")} style={styles.subTabBtn(subTab === "chat")}>
                    <MessageCircle size={13} /> {t("detail.interview.subTabs.chat")}
                </button>
            </div>

            {subTab === "questions" && (
                <div>
                    {loading ? (
                        <div style={styles.loadingBlock}>
                            <div style={styles.spinnerSm} />
                            <p style={{ color: "var(--gb-muted)", fontSize: 13 }}>{t("detail.interview.generatingQuestions")}</p>
                        </div>
                    ) : questions ? (
                        <div>
                            <div style={styles.catTabs}>
                                {(["behavioural", "technical", "situational"] as const).map((cat) => (
                                    <button key={cat} onClick={() => resetQuestion(cat, 0)} style={styles.catTab(category === cat)}>
                                        {t(`detail.interview.categories.${cat}`)}
                                        <span style={styles.catCount}>{questions[cat]?.length ?? 0}</span>
                                    </button>
                                ))}
                            </div>

                            {qList.length > 0 && (
                                <div>
                                    <div style={styles.questionCard}>
                                        <div style={styles.questionNumber}>
                                            {t("detail.interview.questionNumber", { current: currentIdx + 1, total: qList.length })}
                                        </div>
                                        <p style={styles.questionText}>"{currentQ}"</p>
                                        <div style={styles.questionNav}>
                                            <button
                                                onClick={() => resetQuestion(category, Math.max(0, currentIdx - 1))}
                                                disabled={currentIdx === 0}
                                                style={styles.navBtn}>
                                                {t("detail.interview.previous")}
                                            </button>
                                            <button
                                                onClick={() => resetQuestion(category, Math.min(qList.length - 1, currentIdx + 1))}
                                                disabled={currentIdx === qList.length - 1}
                                                style={styles.navBtn}>
                                                {t("detail.interview.next")}
                                            </button>
                                        </div>
                                    </div>

                                    <div style={styles.section}>
                                        <div style={styles.sectionTitle}>{t("detail.interview.yourAnswer")}</div>
                                        {isVoiceSupported && (
                                            <div style={{ marginBottom: 8 }}>
                                                <button onClick={toggleVoice} style={{
                                                    display: "flex", alignItems: "center", gap: 7, padding: "7px 16px", borderRadius: 10,
                                                    background: isListening ? "#ef4444" : "rgba(2,132,199,0.12)",
                                                    border: `1px solid ${isListening ? "#ef4444" : "rgba(2,132,199,0.3)"}`,
                                                    color: isListening ? "#fff" : "#38bdf8",
                                                    fontSize: 12, fontWeight: 600, cursor: "pointer",
                                                    animation: isListening ? "pulse 1.5s infinite" : "none",
                                                }}>
                                                    {isListening ? <MicOff size={14} /> : <Mic size={14} />}
                                                    {isListening ? t("detail.interview.voiceStop") : t("detail.interview.voiceStart")}
                                                </button>
                                            </div>
                                        )}
                                        <textarea
                                            value={answer}
                                            onChange={(e) => setAnswer(e.target.value)}
                                            placeholder={t("detail.interview.answerPlaceholder")}
                                            style={styles.textarea}
                                            rows={5}
                                        />
                                        <button onClick={evaluateAnswer} disabled={!answer.trim() || loadingEval} style={styles.evalBtn}>
                                            {loadingEval
                                                ? <><div style={styles.spinnerXs} /> {t("detail.interview.evaluating")}</>
                                                : <><Send size={14} /> {t("detail.interview.submitEvaluation")}</>
                                            }
                                        </button>
                                    </div>

                                    {eval_ && (
                                        <div style={styles.evalResult}>
                                            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                                                <div style={styles.evalScore(eval_.score)}>{eval_.score}/10</div>
                                                <span style={{ fontWeight: 600, fontSize: 14, color: "var(--gb-text)" }}>{t("detail.interview.evaluation")}</span>
                                            </div>
                                            <div style={styles.evalGrid}>
                                                <div>
                                                    <div style={{ ...styles.evalSubTitle, display: "flex", alignItems: "center", gap: 5 }}>
                                                        <CheckCircle size={13} style={{ color: "#22c55e" }} /> {t("detail.interview.evalStrengths")}
                                                    </div>
                                                    {eval_.strengths.map((s, i) => <div key={i} style={styles.evalItem("success")}>{s}</div>)}
                                                </div>
                                                <div>
                                                    <div style={{ ...styles.evalSubTitle, display: "flex", alignItems: "center", gap: 5 }}>
                                                        <AlertTriangle size={13} style={{ color: "#f59e0b" }} /> {t("detail.interview.evalImprove")}
                                                    </div>
                                                    {eval_.improvements.map((s, i) => <div key={i} style={styles.evalItem("warn")}>{s}</div>)}
                                                </div>
                                            </div>
                                            {eval_.keywords.length > 0 && (
                                                <div style={{ marginTop: 12 }}>
                                                    <div style={{ ...styles.evalSubTitle, display: "flex", alignItems: "center", gap: 5 }}>
                                                        <Key size={13} style={{ color: "#a78bfa" }} /> {t("detail.interview.keywords")}
                                                    </div>
                                                    <div style={styles.skillsRow}>
                                                        {eval_.keywords.map((k, i) => <span key={i} style={styles.skillBadge("kw")}>{k}</span>)}
                                                    </div>
                                                </div>
                                            )}
                                            <div style={{ marginTop: 14 }}>
                                                <div style={{ ...styles.evalSubTitle, display: "flex", alignItems: "center", gap: 5 }}>
                                                    <Lightbulb size={13} style={{ color: "#f59e0b" }} /> {t("detail.interview.suggestedAnswer")}
                                                </div>
                                                <div style={styles.suggestedAnswer}>{eval_.suggestedAnswer}</div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {questions.tips?.length > 0 && (
                                <div style={styles.tipsBox}>
                                    <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 8, color: "var(--gb-text)", display: "flex", alignItems: "center", gap: 6 }}>
                                        <Lightbulb size={14} style={{ verticalAlign: "middle" }} /> {t("detail.interview.tips")}
                                    </div>
                                    {questions.tips.map((tip, i) => <div key={i} style={styles.tip}>{tip}</div>)}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div style={styles.loadingBlock}>
                            <button onClick={onGenerateQuestions} style={styles.generateBtn}>
                                <Play size={14} /> {t("detail.interview.generateQuestions")}
                            </button>
                        </div>
                    )}
                </div>
            )}

            {subTab === "chat" && (
                <div style={{ border: "1px solid var(--gb-border)", borderRadius: 10, overflow: "hidden" }}>
                    <InterviewChat offre={offre} userProfile={userProfile} />
                </div>
            )}
        </div>
    );
}
