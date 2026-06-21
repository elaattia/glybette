import { useState, useEffect, useRef, useCallback } from "react";
import { getJobsApiUrl } from "@/lib/env";

const POLL_INTERVAL_MS = parseInt(
    (import.meta as any).env?.VITE_JOBS_POLL_INTERVAL_MS ?? "30000",
    10
);

interface NewOffresResult {
    newCount: number;
    polling: boolean;
    lastPolledAt: Date | null;
    acknowledge: () => void;
    pollNow: () => void;
}

/**
 * @param onNewOffres callback appelee quand de nouvelles offres sont disponibles
 */
export function useJobsRealtime(
    onNewOffres?: (count: number) => void
): NewOffresResult {
    const [newCount, setNewCount] = useState(0);
    const [polling, setPolling] = useState(false);
    const [lastPolledAt, setLastPolledAt] = useState<Date | null>(null);

    const baselineCountRef = useRef<number | null>(null);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const poll = useCallback(async () => {
        setPolling(true);
        try {
            const res = await fetch(getJobsApiUrl("/offres?limit=1&tri=recent"), {
                credentials: "include",
            });
            if (!res.ok) return;
            const data = await res.json();
            const currentTotal: number = data.total ?? 0;

            if (baselineCountRef.current === null) {
                baselineCountRef.current = currentTotal;
            } else {
                const diff = currentTotal - baselineCountRef.current;
                if (diff > 0) {
                    setNewCount(diff);
                    onNewOffres?.(diff);
                }
            }
            setLastPolledAt(new Date());
        } catch {
        } finally {
            setPolling(false);
        }
    }, [onNewOffres]);

    useEffect(() => {
        poll(); 
        intervalRef.current = setInterval(poll, POLL_INTERVAL_MS);
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [poll]);

    const acknowledge = useCallback(() => {
        if (baselineCountRef.current !== null) {
            baselineCountRef.current = (baselineCountRef.current ?? 0) + newCount;
        }
        setNewCount(0);
    }, [newCount]);

    const pollNow = useCallback(() => {
        poll();
    }, [poll]);

    return { newCount, polling, lastPolledAt, acknowledge, pollNow };
}