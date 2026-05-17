import { useState, useEffect } from "react";
import type { ScrapingStats } from "@glybette/types";


const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:3000/api";

export function useStats() {
    const [stats, setStats] = useState<ScrapingStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`${API_BASE}/scraping/stats`)
            .then((r) => r.json())
            .then(setStats)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    return { stats, loading };
}

export function useTriggerScraping() {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);

    const trigger = async (source: string = "all") => {
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE}/scraping/trigger`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ source }),
            });
            setResult(await res.json());
        } finally {
            setLoading(false);
        }
    };

    return { trigger, loading, result };
}
