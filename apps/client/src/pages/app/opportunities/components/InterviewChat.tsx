import React, { useState, useEffect, useCallback, useRef } from "react";
import { Bot, User, Send, Mic, MicOff, Loader2 } from "lucide-react";
import type { ChatMessage } from "../types";

const API_BASE = (import.meta as any).env?.VITE_API_URL ?? "http://localhost:3000/api";

interface Offre {
    _id: string;
    titre: string;
    entreprise?: string;
    description?: string;
    competences: string[];
    localisation?: string;
    type_contrat?: string;
    niveau_experience?: string;
}

interface InterviewChatProps {
    offre: Offre;
    userProfile: any;
}

export function InterviewChat({ offre, userProfile }: InterviewChatProps) {
    const [messages, setMessages] = useState<ChatMessage[]>([
        {
            id: "welcome",
            role: "assistant",
            content: `Bonjour ! Je suis votre assistant carrière pour cette opportunité chez **${offre.entreprise ?? "l'entreprise"}** (${offre.titre}).\n\nJe peux vous aider à :\n• Comprendre les exigences du poste\n• Préparer vos réponses d'entretien\n• Analyser votre compatibilité avec l'offre\n• Répondre à toutes vos questions\n\nQue souhaitez-vous savoir ?`,
            timestamp: new Date(),
        },
    ]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);

    const [isVoiceActive, setIsVoiceActive] = useState(false);
    const [interimTranscript, setInterimTranscript] = useState("");
    const chatRecognitionRef = useRef<any>(null);

    const isVoiceSupported = Boolean(
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition,
    );

    const bottomRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const startChatVoice = useCallback(() => {
        const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (!SR) return;
        const r = new SR();
        r.lang = "fr-FR";
        r.continuous = true;
        r.interimResults = true;

        r.onstart = () => setIsVoiceActive(true);
        r.onerror = () => { setIsVoiceActive(false); setInterimTranscript(""); };
        r.onend   = () => { setIsVoiceActive(false); setInterimTranscript(""); };
        r.onresult = (event: any) => {
            let interim = "";
            let final   = "";
            for (let i = event.resultIndex; i < event.results.length; i++) {
                if (event.results[i].isFinal) {
                    final += event.results[i][0].transcript;
                } else {
                    interim += event.results[i][0].transcript;
                }
            }
            setInterimTranscript(interim);
            if (final) {
                setInput((prev) => (prev ? `${prev} ${final}` : final).trimStart());
                setInterimTranscript("");
            }
        };
        r.start();
        chatRecognitionRef.current = r;
    }, []);

    const stopChatVoice = useCallback(() => {
        chatRecognitionRef.current?.stop();
        setIsVoiceActive(false);
        setInterimTranscript("");
    }, []);

    const toggleChatVoice = useCallback(() => {
        isVoiceActive ? stopChatVoice() : startChatVoice();
    }, [isVoiceActive, startChatVoice, stopChatVoice]);

    const offreText = `${offre.titre}\n${offre.entreprise ?? ""}\n${offre.description ?? ""}\nCompétences: ${offre.competences?.join(", ")}\nLocalisation: ${offre.localisation ?? ""}\nNiveau: ${offre.niveau_experience ?? ""}\nContrat: ${offre.type_contrat ?? ""}`;

    const sendMessage = useCallback(async () => {
        const text = input.trim();
        if (!text || loading) return;

        if (isVoiceActive) stopChatVoice();

        const userMsg: ChatMessage = {
            id: `user-${Date.now()}`,
            role: "user",
            content: text,
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, userMsg]);
        setInput("");
        setLoading(true);

        try {
            const history = messages
                .filter((m) => m.id !== "welcome")
                .map((m) => ({ role: m.role, content: m.content }));
            history.push({ role: "user", content: text });

            const res = await fetch(`${API_BASE}/jobs/chat`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ offreText, messages: history, userProfile: userProfile ?? {} }),
            });

            if (!res.ok) throw new Error(`${res.status}`);
            const data = await res.json();

            setMessages((prev) => [...prev, {
                id: `assistant-${Date.now()}`,
                role: "assistant",
                content: data.content ?? "Je n'ai pas pu générer une réponse.",
                timestamp: new Date(),
            }]);
        } catch {
            setMessages((prev) => [...prev, {
                id: `error-${Date.now()}`,
                role: "assistant",
                content: "Désolé, une erreur s'est produite. Vérifiez que le service IA est démarré.",
                timestamp: new Date(),
            }]);
        } finally {
            setLoading(false);
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [input, loading, messages, offreText, userProfile, isVoiceActive, stopChatVoice]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
    };

    const quickSuggestions = [
        "Quelles compétences sont les plus importantes pour ce poste ?",
        "Comment préparer mon entretien pour cette offre ?",
        "Quelles questions pourraient m'être posées ?",
        "Comment mettre en valeur mon profil pour ce poste ?",
        "Quel salaire est envisageable pour ce type de poste ?",
    ];

    return (
        <div style={{ display: "flex", flexDirection: "column", height: "100%", minHeight: 500 }}>
            <div style={{
                display: "flex", alignItems: "center", gap: 10, padding: "12px 16px",
                background: "rgba(22,163,74,0.06)", borderBottom: "1px solid var(--gb-border)",
                borderRadius: "10px 10px 0 0",
            }}>
                <div style={{
                    width: 36, height: 36, borderRadius: "50%",
                    background: "linear-gradient(135deg, #16A34A, #0284C7)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                    <Bot size={18} style={{ color: "#fff" }} />
                </div>
                <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "var(--gb-text)" }}>Assistant Carrière IA</div>
                    <div style={{ fontSize: 11, color: "#22c55e", display: "flex", alignItems: "center", gap: 4 }}>
                        <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e", animation: "pulse 2s infinite" }} />
                        En ligne · Spécialisé sur cette offre
                    </div>
                </div>
                {isVoiceActive && (
                    <div style={{
                        display: "flex", alignItems: "center", gap: 6, padding: "4px 10px", borderRadius: 100,
                        background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.35)",
                        animation: "pulse 1.2s ease-in-out infinite",
                    }}>
                        <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#ef4444" }} />
                        <span style={{ fontSize: 11, fontWeight: 700, color: "#ef4444" }}>Écoute…</span>
                    </div>
                )}
            </div>

            <div style={{
                flex: 1, overflowY: "auto", padding: 16, display: "flex",
                flexDirection: "column", gap: 12, maxHeight: 460, minHeight: 300,
            }}>
                {messages.map((msg) => (
                    <div key={msg.id} style={{
                        display: "flex",
                        flexDirection: msg.role === "user" ? "row-reverse" : "row",
                        gap: 8, alignItems: "flex-start",
                    }}>
                        <div style={{
                            width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            background: msg.role === "user"
                                ? "rgba(2,132,199,0.2)"
                                : "linear-gradient(135deg, rgba(22,163,74,0.2), rgba(2,132,199,0.2))",
                            border: `1px solid ${msg.role === "user" ? "rgba(2,132,199,0.3)" : "rgba(22,163,74,0.3)"}`,
                        }}>
                            {msg.role === "user"
                                ? <User size={14} style={{ color: "#38bdf8" }} />
                                : <Bot  size={14} style={{ color: "#22c55e" }} />
                            }
                        </div>
                        <div style={{
                            maxWidth: "75%", padding: "10px 14px",
                            borderRadius: msg.role === "user" ? "18px 4px 18px 18px" : "4px 18px 18px 18px",
                            background: msg.role === "user"
                                ? "linear-gradient(135deg, rgba(2,132,199,0.15), rgba(2,132,199,0.08))"
                                : "var(--gb-app-hover)",
                            border: `1px solid ${msg.role === "user" ? "rgba(2,132,199,0.2)" : "var(--gb-border)"}`,
                            fontSize: 13, lineHeight: 1.65, color: "var(--gb-text)", whiteSpace: "pre-line",
                        }}>
                            {msg.content.split("\n").map((line, i) => {
                                const boldLine = line.replace(/\*\*(.*?)\*\*/g, (_, t) => `<strong>${t}</strong>`);
                                return (
                                    <div key={i}
                                        dangerouslySetInnerHTML={{ __html: boldLine }}
                                        style={{ marginBottom: i < msg.content.split("\n").length - 1 ? 2 : 0 }}
                                    />
                                );
                            })}
                            <div style={{ fontSize: 10, color: "var(--gb-muted)", marginTop: 6, textAlign: msg.role === "user" ? "right" : "left" }}>
                                {msg.timestamp.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                            </div>
                        </div>
                    </div>
                ))}

                {loading && (
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                        <div style={{ width: 28, height: 28, borderRadius: "50%", background: "rgba(22,163,74,0.1)", border: "1px solid rgba(22,163,74,0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <Bot size={14} style={{ color: "#22c55e" }} />
                        </div>
                        <div style={{ padding: "10px 14px", borderRadius: "4px 18px 18px 18px", background: "var(--gb-app-hover)", border: "1px solid var(--gb-border)", display: "flex", gap: 4, alignItems: "center" }}>
                            {[0, 1, 2].map((i) => (
                                <div key={i} style={{ width: 7, height: 7, borderRadius: "50%", background: "#22c55e", animation: "bounce 1.2s infinite", animationDelay: `${i * 0.2}s` }} />
                            ))}
                        </div>
                    </div>
                )}

                <div ref={bottomRef} />
            </div>

            {messages.length <= 2 && (
                <div style={{ padding: "8px 16px", borderTop: "1px solid var(--gb-border)" }}>
                    <div style={{ fontSize: 11, color: "var(--gb-muted)", marginBottom: 6, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}>
                        Questions suggérées
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                        {quickSuggestions.slice(0, 3).map((s) => (
                            <button key={s} onClick={() => { setInput(s); setTimeout(() => inputRef.current?.focus(), 50); }}
                                style={{ padding: "5px 10px", borderRadius: 100, fontSize: 11, fontWeight: 500, background: "var(--gb-app-hover)", border: "1px solid var(--gb-border)", color: "var(--gb-text-off)", cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s", textAlign: "left" }}>
                                {s}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {isVoiceActive && interimTranscript && (
                <div style={{
                    margin: "0 16px", padding: "8px 12px", borderRadius: 10,
                    background: "rgba(239,68,68,0.06)", border: "1px dashed rgba(239,68,68,0.3)",
                    fontSize: 12, fontStyle: "italic", color: "rgba(239,68,68,0.85)",
                    display: "flex", alignItems: "center", gap: 8,
                }}>
                    <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#ef4444", flexShrink: 0, animation: "pulse 0.8s infinite" }} />
                    {interimTranscript}
                </div>
            )}

            <div style={{
                padding: "12px 16px", borderTop: "1px solid var(--gb-border)",
                background: "var(--gb-app-panel-bg)", borderRadius: "0 0 10px 10px",
            }}>
                <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
                    {isVoiceSupported && (
                        <button
                            onClick={toggleChatVoice}
                            title={isVoiceActive ? "Arrêter le micro" : "Dicter un message"}
                            style={{
                                width: 42, height: 42, borderRadius: 12, flexShrink: 0,
                                display: "flex", alignItems: "center", justifyContent: "center",
                                border: "1px solid", cursor: "pointer", transition: "all 0.2s",
                                background:  isVoiceActive ? "rgba(239,68,68,0.12)" : "var(--gb-app-hover)",
                                borderColor: isVoiceActive ? "rgba(239,68,68,0.5)"  : "var(--gb-border)",
                                boxShadow:   isVoiceActive ? "0 0 0 3px rgba(239,68,68,0.12)" : "none",
                                animation:   isVoiceActive ? "pulse 1.5s ease-in-out infinite" : "none",
                            }}>
                            {isVoiceActive
                                ? <MicOff size={16} style={{ color: "#ef4444" }} />
                                : <Mic    size={16} style={{ color: "var(--gb-muted)" }} />
                            }
                        </button>
                    )}

                    <div style={{ flex: 1, position: "relative" }}>
                        <textarea
                            ref={inputRef}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder={isVoiceActive ? "Parlez maintenant… (ou tapez votre message)" : "Posez une question sur cette offre… (Entrée pour envoyer)"}
                            disabled={loading}
                            rows={2}
                            style={{
                                width: "100%", padding: "10px 14px", borderRadius: 12,
                                background: "var(--gb-bg3)",
                                border: `1px solid ${isVoiceActive ? "rgba(239,68,68,0.4)" : "var(--gb-border)"}`,
                                color: "var(--gb-text)", fontSize: 13, fontFamily: "inherit",
                                lineHeight: 1.5, outline: "none", resize: "none",
                                opacity: loading ? 0.6 : 1, boxSizing: "border-box",
                                transition: "border-color 0.2s",
                                boxShadow: isVoiceActive ? "0 0 0 2px rgba(239,68,68,0.08)" : "none",
                            }}
                        />
                        {isVoiceActive && (
                            <div style={{
                                position: "absolute", bottom: 8, right: 10,
                                display: "flex", alignItems: "center", gap: 4,
                                fontSize: 10, color: "#ef4444", fontWeight: 700, pointerEvents: "none",
                            }}>
                                <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#ef4444", animation: "pulse 0.8s infinite" }} />
                                REC
                            </div>
                        )}
                    </div>

                    <button
                        onClick={sendMessage}
                        disabled={!input.trim() || loading}
                        style={{
                            width: 42, height: 42, borderRadius: 12, flexShrink: 0,
                            background: input.trim() && !loading
                                ? "linear-gradient(135deg, #16A34A, #0284C7)"
                                : "var(--gb-app-hover)",
                            border: "none", cursor: input.trim() && !loading ? "pointer" : "not-allowed",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            transition: "all 0.2s",
                        }}>
                        {loading
                            ? <Loader2 size={16} style={{ color: "var(--gb-muted)", animation: "spin 1s linear infinite" }} />
                            : <Send    size={16} style={{ color: input.trim() ? "#fff" : "var(--gb-muted)" }} />
                        }
                    </button>
                </div>

                <div style={{ fontSize: 10, color: "var(--gb-muted)", marginTop: 5, textAlign: "center", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                    <span>Entrée pour envoyer · Maj+Entrée pour nouvelle ligne</span>
                    {isVoiceSupported && (
                        <>
                            <span style={{ opacity: 0.4 }}>·</span>
                            <span style={{ display: "flex", alignItems: "center", gap: 3 }}>
                                <Mic size={9} />
                                {isVoiceActive ? "Cliquez sur le micro pour arrêter" : "Micro disponible"}
                            </span>
                        </>
                    )}
                </div>
            </div>

            <style>{`
                @keyframes bounce { 0%,80%,100% { transform:scale(0); } 40% { transform:scale(1); } }
                @keyframes pulse  { 0%,100% { opacity:1; } 50% { opacity:0.5; } }
                @keyframes spin   { to { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
}