import { useState, useEffect, useCallback } from "react";
import type { Offre, OffresResponse, OffresFilters, ScrapingStats } from "@glybette/types";

const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:3000/api";

export function useOffres(filters: OffresFilters = {}) {
    const [data, setData] = useState<OffresResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetch_ = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const params = new URLSearchParams();
            for (const [k, v] of Object.entries(filters)) {
                if (v !== undefined && v !== null && v !== "") {
                    params.set(k, String(v));
                }
            }
            const res = await fetch(`${API_BASE}/scraping/offres?${params}`);
            if (!res.ok) throw new Error(`${res.status}`);
            setData(await res.json());
        } catch (e: any) {
            setError(e.message ?? "Erreur réseau");
        } finally {
            setLoading(false);
        }
    }, [JSON.stringify(filters)]);

    useEffect(() => {
        fetch_();
    }, [fetch_]);

    return { data, loading, error, refetch: fetch_ };
}

export function useOffre(id: string | null) {
    const [offre, setOffre] = useState<Offre | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!id) return;
        setLoading(true);
        fetch(`${API_BASE}/scraping/offres/${id}`)
            .then((r) => {
                if (!r.ok) throw new Error(`${r.status}`);
                return r.json();
            })
            .then(setOffre)
            .catch((e) => setError(e.message))
            .finally(() => setLoading(false));
    }, [id]);

    return { offre, loading, error };
}

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

    const trigger = async (source: string = "all") => {
        setLoading(true);
        try {
            await fetch(`${API_BASE}/scraping/trigger`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ source }),
            });
        } finally {
            setLoading(false);
        }
    };

    return { trigger, loading };
}
