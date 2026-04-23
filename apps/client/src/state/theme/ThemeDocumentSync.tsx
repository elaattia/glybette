import { useAtomValue } from "jotai";
import { useEffect } from "react";
import { themeAtom } from "@/state/theme/theme.atoms";

/** Keeps `data-theme` on `<html>` in sync with persisted theme (used by global CSS variables). */
export function ThemeDocumentSync() {
    const theme = useAtomValue(themeAtom);

    useEffect(() => {
        document.documentElement.setAttribute("data-theme", theme);
    }, [theme]);

    return null;
}
