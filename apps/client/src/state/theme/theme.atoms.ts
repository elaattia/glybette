import { atomWithStorage } from "jotai/utils";

export type Theme = "dark" | "light";

const THEME_KEY = "gb-theme";

function systemTheme(): Theme {
    if (typeof window === "undefined") {
        return "dark";
    }
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

/** Supports legacy plain `dark`/`light` and JSON-stringified values from jotai. */
function parseStoredTheme(raw: string | null): Theme | undefined {
    if (raw == null) {
        return undefined;
    }
    if (raw === "dark" || raw === "light") {
        return raw;
    }
    try {
        const v = JSON.parse(raw) as unknown;
        if (v === "dark" || v === "light") {
            return v;
        }
    } catch {
        /* ignore */
    }
    return undefined;
}

const themeStorage = {
    getItem(key: string, initialValue: Theme): Theme {
        if (typeof window === "undefined") {
            return initialValue;
        }
        const raw = window.localStorage.getItem(key);
        const parsed = parseStoredTheme(raw);
        if (parsed !== undefined) {
            return parsed;
        }
        return systemTheme();
    },
    setItem(key: string, newValue: Theme) {
        window.localStorage.setItem(key, JSON.stringify(newValue));
    },
    removeItem(key: string) {
        window.localStorage.removeItem(key);
    },
};

export const themeAtom = atomWithStorage<Theme>(THEME_KEY, "dark", themeStorage);
