import { useState, useEffect, useCallback, useRef } from "react";
import type { Offre, Matching, InterviewQuestions } from "../types";
import { getJobsApiUrl } from "@/lib/env";

interface UseJobDetailReturn {
    offre: Offre | null;
    matching: Matching | null;
    questions: InterviewQuestions | null;
    loadingOffre: boolean;
    loadingMatchDb: boolean;
    loadingMatchAi: boolean;
    loadingQuestions: boolean;
    refreshMatching: () => Promise<void>;
    generateQuestions: () => Promise<void>;
}

export function useJobDetail(
    id: string | undefined,
    userProfile: any,
    profileReady = true,
): UseJobDetailReturn {
    const [offre, setOffre] = useState<Offre | null>(null);
    const [matching, setMatching] = useState<Matching | null>(null);
    const [questions, setQuestions] = useState<InterviewQuestions | null>(null);
    const [loadingOffre, setLoadingOffre] = useState(true);
    const [loadingMatchDb, setLoadingMatchDb] = useState(false);
    const [loadingMatchAi, setLoadingMatchAi] = useState(false);
    const [loadingQuestions, setLoadingQuestions] = useState(false);

    const profileKey = JSON.stringify(userProfile);
    const matchRequestRef = useRef(0);

    useEffect(() => {
        if (!id) return;
        setLoadingOffre(true);
        fetch(getJobsApiUrl(`/offres/${id}`), { credentials: "include" })
            .then((r) => r.json())
            .then((d) => setOffre(d.offre))
            .catch(console.error)
            .finally(() => setLoadingOffre(false));
    }, [id]);

    const computeMatching = useCallback(async () => {
        if (!id) return;
        setLoadingMatchAi(true);
        try {
            const res = await fetch(getJobsApiUrl(`/matching/offre/${id}`), {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ userProfile }),
            });
            const data = await res.json();
            setMatching(data.matching);
        } catch (e) {
            console.error(e);
        } finally {
            setLoadingMatchAi(false);
        }
    }, [id, profileKey]);

    const refreshMatching = useCallback(async () => {
        await computeMatching();
    }, [computeMatching]);

    useEffect(() => {
        if (!id || !profileReady) return;

        const requestId = ++matchRequestRef.current;
        setMatching(null);

        async function loadMatching() {
            setLoadingMatchDb(true);
            try {
                const res = await fetch(getJobsApiUrl(`/matching/offre/${id}`), {
                    credentials: "include",
                });
                const data = await res.json();
                if (requestId !== matchRequestRef.current) return;

                if (data.matching) {
                    setMatching(data.matching);
                    return;
                }
            } catch (e) {
                console.error(e);
            } finally {
                if (requestId === matchRequestRef.current) {
                    setLoadingMatchDb(false);
                }
            }

            if (requestId !== matchRequestRef.current) return;

            setLoadingMatchAi(true);
            try {
                const res = await fetch(getJobsApiUrl(`/matching/offre/${id}`), {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                    body: JSON.stringify({ userProfile }),
                });
                const data = await res.json();
                if (requestId === matchRequestRef.current) {
                    setMatching(data.matching);
                }
            } catch (e) {
                console.error(e);
            } finally {
                if (requestId === matchRequestRef.current) {
                    setLoadingMatchAi(false);
                }
            }
        }

        loadMatching();
    }, [id, profileKey, profileReady]);

    const generateQuestions = useCallback(async () => {
        if (!id || questions) return;
        setLoadingQuestions(true);
        try {
            const res = await fetch(getJobsApiUrl(`/interview/questions/${id}`), {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ userProfile }),
            });
            setQuestions(await res.json());
        } catch (e) {
            console.error(e);
        } finally {
            setLoadingQuestions(false);
        }
    }, [id, questions, profileKey]);

    return {
        offre,
        matching,
        questions,
        loadingOffre,
        loadingMatchDb,
        loadingMatchAi,
        loadingQuestions,
        refreshMatching,
        generateQuestions,
    };
}
