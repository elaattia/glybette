import { useState, useCallback, useEffect } from "react";

const STORAGE_KEY = "glybette:opportunities:saved";

export function useSavedOffers() {
    const [savedIds, setSavedIds] = useState<Set<string>>(() => {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            return raw ? new Set<string>(JSON.parse(raw)) : new Set<string>();
        } catch {
            return new Set<string>();
        }
    });

    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify([...savedIds]));
        } catch {}
    }, [savedIds]);

    const toggle = useCallback((id: string) => {
        setSavedIds((prev) => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    }, []);

    const isSaved = useCallback((id: string) => savedIds.has(id), [savedIds]);

    return { savedIds, toggle, isSaved };
}