import { useAtom } from "jotai";
import { themeAtom, type Theme } from "@/state/theme/theme.atoms";

export function useTheme(): {
    theme: Theme;
    toggle: () => void;
    setTheme: (next: Theme) => void;
} {
    const [theme, setTheme] = useAtom(themeAtom);
    const toggle = () => setTheme((t) => (t === "dark" ? "light" : "dark"));
    return { theme, toggle, setTheme };
}
