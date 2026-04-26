import { useCallback, useEffect, useRef, useState } from "react";

const STORAGE_PREFIX = "gb-pref:";

/**
 * Keys must follow `<area>:<setting>` (e.g. `app:sidebar-compact`).
 * Stored in localStorage as `gb-pref:<area>:<setting>` to avoid collisions.
 */
export type LocalPreferenceKey = `${string}:${string}`;

function storageKey(preferenceKey: LocalPreferenceKey): string {
    return `${STORAGE_PREFIX}${preferenceKey}`;
}

function readFromStorage<T>(key: LocalPreferenceKey, defaultValue: T, parse: (raw: string | null) => T): T {
    if (typeof window === "undefined") {
        return defaultValue;
    }
    try {
        return parse(window.localStorage.getItem(storageKey(key)));
    } catch {
        return defaultValue;
    }
}

function writeToStorage<T>(key: LocalPreferenceKey, value: T, serialize: (value: T) => string): void {
    if (typeof window === "undefined") {
        return;
    }
    try {
        window.localStorage.setItem(storageKey(key), serialize(value));
    } catch {
        // quota / private mode
    }
}

type UseLocalPreferenceOptions<T> = {
    serialize?: (value: T) => string;
    parse?: (raw: string | null) => T;
};

const defaultSerialize = <T>(value: T) => JSON.stringify(value);

function defaultParse<T>(defaultValue: T): (raw: string | null) => T {
    return (raw) => {
        if (raw == null || raw === "") {
            return defaultValue;
        }
        try {
            return JSON.parse(raw) as T;
        } catch {
            return defaultValue;
        }
    };
}

/**
 * Persists a preference in localStorage with a typed `<area>:<setting>` key.
 * Safe for SSR (defaults until hydrated).
 */
export function useLocalPreference<T>(
    preferenceKey: LocalPreferenceKey,
    defaultValue: T,
    options?: UseLocalPreferenceOptions<T>,
): readonly [T, (value: T | ((previous: T) => T)) => void] {
    const serialize = options?.serialize ?? defaultSerialize;
    const parse = options?.parse ?? defaultParse(defaultValue);

    const [value, setValueState] = useState<T>(() => readFromStorage(preferenceKey, defaultValue, parse));

    const parseRef = useRef(parse);

    useEffect(() => {
        parseRef.current = parse;
    }, [parse]);

    useEffect(() => {
        setValueState(readFromStorage(preferenceKey, defaultValue, parseRef.current));
    }, [preferenceKey, defaultValue]);

    useEffect(() => {
        const onStorage = (event: StorageEvent) => {
            if (event.key !== storageKey(preferenceKey) || event.newValue == null) {
                return;
            }
            setValueState(parseRef.current(event.newValue));
        };
        window.addEventListener("storage", onStorage);
        return () => window.removeEventListener("storage", onStorage);
    }, [preferenceKey]);

    const setValue = useCallback(
        (next: T | ((previous: T) => T)) => {
            setValueState((previous) => {
                const resolved = typeof next === "function" ? (next as (previous: T) => T)(previous) : next;
                writeToStorage(preferenceKey, resolved, serialize);
                return resolved;
            });
        },
        [preferenceKey, serialize],
    );

    return [value, setValue] as const;
}
