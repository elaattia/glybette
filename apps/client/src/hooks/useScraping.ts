import { useState, useEffect } from "react";
import type { ScrapingStats } from "@glybette/types";
import { apiPrefix } from "@/lib/env";

export function useStats() {
    const [stats, setStats] = useState<ScrapingStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`${apiPrefix}/scraping/stats`)
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
            const res = await fetch(`${apiPrefix}/scraping/trigger`, {
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
