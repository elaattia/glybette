import { useState, useEffect, useCallback } from "react";
import type { Offre, Matching, InterviewQuestions } from "../types";

const API_BASE = (import.meta as any).env?.VITE_API_URL ?? "http://localhost:3000/api";

interface UseJobDetailReturn {
    offre: Offre | null;
    matching: Matching | null;
    questions: InterviewQuestions | null;
    loadingOffre: boolean;
    loadingMatch: boolean;
    loadingQuestions: boolean;
    computeMatching: () => Promise<void>;
    generateQuestions: () => Promise<void>;
}

export function useJobDetail(id: string | undefined, userProfile: any): UseJobDetailReturn {
    const [offre, setOffre]           = useState<Offre | null>(null);
    const [matching, setMatching]     = useState<Matching | null>(null);
    const [questions, setQuestions]   = useState<InterviewQuestions | null>(null);
    const [loadingOffre, setLoadingOffre]       = useState(true);
    const [loadingMatch, setLoadingMatch]       = useState(false);
    const [loadingQuestions, setLoadingQuestions] = useState(false);

    const profileKey = JSON.stringify(userProfile);

    useEffect(() => {
        if (!id) return;
        setLoadingOffre(true);
        fetch(`${API_BASE}/jobs/offres/${id}`, { credentials: "include" })
            .then((r) => r.json())
            .then((d) => setOffre(d.offre))
            .catch(console.error)
            .finally(() => setLoadingOffre(false));
    }, [id]);

    const computeMatching = useCallback(async () => {
        if (!id) return;
        setLoadingMatch(true);
        try {
            const res = await fetch(`${API_BASE}/jobs/matching/offre/${id}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ userProfile }),
            });
            const data = await res.json();
            setMatching(data.matching);
        } catch (e) { console.error(e); }
        finally { setLoadingMatch(false); }
    }, [id, profileKey]); 

    useEffect(() => { computeMatching(); }, [computeMatching]);

    const generateQuestions = useCallback(async () => {
        if (!id || questions) return;
        setLoadingQuestions(true);
        try {
            const res = await fetch(`${API_BASE}/jobs/interview/questions/${id}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ userProfile }),
            });
            setQuestions(await res.json());
        } catch (e) { console.error(e); }
        finally { setLoadingQuestions(false); }
    }, [id, questions, profileKey]); 

    return {
        offre, matching, questions,
        loadingOffre, loadingMatch, loadingQuestions,
        computeMatching, generateQuestions,
    };
}