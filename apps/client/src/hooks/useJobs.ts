import { useState, useEffect, useCallback } from "react";
 
const API_BASE = (import.meta as any).env?.VITE_API_URL ?? "http://localhost:3000/api";
 
 
export function useOffres(filters: Record<string, unknown> = {}) {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
 
    const fetch_ = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const params = new URLSearchParams();
            for (const [k, v] of Object.entries(filters)) {
                if (v !== undefined && v !== null && v !== "") params.set(k, String(v));
            }
            const res = await fetch(`${API_BASE}/jobs/offres?${params}`, { credentials: "include" });
            if (!res.ok) throw new Error(`${res.status}`);
            setData(await res.json());
        } catch (e: any) {
            setError(e.message ?? "Erreur réseau");
        } finally {
            setLoading(false);
        }
    }, [JSON.stringify(filters)]);
 
    useEffect(() => { fetch_(); }, [fetch_]);
 
    return { data, loading, error, refetch: fetch_ };
}
 
 
export function useJobDetail(id: string | null) {
    const [offre, setOffre] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
 
    useEffect(() => {
        if (!id) return;
        setLoading(true);
        fetch(`${API_BASE}/jobs/offres/${id}`, { credentials: "include" })
            .then((r) => { if (!r.ok) throw new Error(`${r.status}`); return r.json(); })
            .then((d) => setOffre(d.offre))
            .catch((e) => setError(e.message))
            .finally(() => setLoading(false));
    }, [id]);
 
    return { offre, loading, error };
}
 
 
export function useJobMatching(offreId: string | null, userProfile: any) {
    const [matching, setMatching] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
 
    const compute = useCallback(async () => {
        if (!offreId || !userProfile) return;
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`${API_BASE}/jobs/matching/offre/${offreId}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ userProfile }),
            });
            if (!res.ok) throw new Error(`${res.status}`);
            const data = await res.json();
            setMatching(data.matching);
        } catch (e: any) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    }, [offreId, JSON.stringify(userProfile)]);

    return { matching, loading, error, refresh: compute };
}
 
 
export function useInterviewQuestions(offreId: string | null, userProfile: any) {
    const [questions, setQuestions] = useState<any>(null);
    const [loading, setLoading] = useState(false);
 
    const generate = useCallback(async () => {
        if (!offreId) return;
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE}/jobs/interview/questions/${offreId}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ userProfile: userProfile ?? {} }),
            });
            setQuestions(await res.json());
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    }, [offreId, JSON.stringify(userProfile)]);
 
    return { questions, loading, generate };
}
 
 
export function useInterviewEvaluate() {
    const [result, setResult] = useState<any>(null);
    const [loading, setLoading] = useState(false);
 
    const evaluate = useCallback(async (question: string, answer: string, jobContext = "") => {
        setLoading(true);
        setResult(null);
        try {
            const res = await fetch(`${API_BASE}/jobs/interview/evaluate`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ question, answer, jobContext }),
            });
            setResult(await res.json());
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    }, []);
 
    return { result, loading, evaluate, reset: () => setResult(null) };
}
 
 
export function useCoverLetter(offreId: string | null) {
    const [letter, setLetter] = useState<string>("");
    const [loading, setLoading] = useState(false);
 
    const generate = useCallback(async (params: {
        cvText?: string;
        tone?: "professional" | "enthusiastic" | "concise";
        userAchievements?: string[];
    } = {}) => {
        if (!offreId) return;
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE}/jobs/cover-letter/generate`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    offreId,
                    cvText: params.cvText ?? "",
                    tone: params.tone ?? "professional",
                    userAchievements: params.userAchievements ?? [],
                }),
            });
            const data = await res.json();
            setLetter(data.content ?? "");
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    }, [offreId]);
 
    const refine = useCallback(async (feedback: string) => {
        if (!offreId || !letter) return;
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE}/jobs/cover-letter/refine`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ currentLetter: letter, feedback, offreId }),
            });
            const data = await res.json();
            setLetter(data.content ?? letter);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    }, [offreId, letter]);
 
    return { letter, setLetter, loading, generate, refine };
}
 
 
export function useCvImprovements(offreId: string | null) {
    const [improvements, setImprovements] = useState<any>(null);
    const [loading, setLoading] = useState(false);
 
    const analyze = useCallback(async (cvText = "") => {
        if (!offreId) return;
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE}/jobs/matching/cv-improvements`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ offreId, cvText }),
            });
            setImprovements(await res.json());
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    }, [offreId]);
 
    return { improvements, loading, analyze };
}
 
 
export function useJobStats() {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
 
    useEffect(() => {
        fetch(`${API_BASE}/jobs/stats`, { credentials: "include" })
            .then((r) => r.json())
            .then(setStats)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);
 
    return { stats, loading };
}