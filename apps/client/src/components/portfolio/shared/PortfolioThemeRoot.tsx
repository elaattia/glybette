import { useMemo, type CSSProperties, type ReactNode } from "react";
import type { PortfolioChrome, PortfolioRenderModel } from "@/components/portfolio/renderer-types";
import type { PortfolioTemplateDefinition } from "@/components/portfolio/template-config";
import { cn } from "@/lib/utils";

function hexToRgb(value: string) {
    const match = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(value);
    if (!match) {
        return { r: 22, g: 163, b: 74 };
    }

    return {
        r: Number.parseInt(match[1] ?? "16", 16),
        g: Number.parseInt(match[2] ?? "a3", 16),
        b: Number.parseInt(match[3] ?? "4a", 16),
    };
}

function getContrastColor(hex: string) {
    const { r, g, b } = hexToRgb(hex);
    const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
    return luminance > 0.58 ? "#07110B" : "#FFFFFF";
}

function getRadiusValue(radius: string) {
    if (radius === "sharp") {
        return "0px";
    }
    if (radius === "round") {
        return "2rem";
    }
    return "1.5rem";
}

type PortfolioThemeRootProps = {
    portfolio: PortfolioRenderModel;
    template: PortfolioTemplateDefinition;
    chrome: PortfolioChrome;
    children: ReactNode;
};

export function PortfolioThemeRoot({ portfolio, template, chrome, children }: PortfolioThemeRootProps) {
    const accentContrast = useMemo(() => getContrastColor(portfolio.style.accentColor), [portfolio.style.accentColor]);

    return (
        <div
            className={cn(
                "relative isolate min-h-full",
                template.previewClassName,
                chrome === "builder" ? "h-full overflow-y-auto" : "min-h-screen overflow-hidden",
            )}
            style={
                {
                    "--portfolio-accent": portfolio.style.accentColor,
                    "--portfolio-accent-contrast": accentContrast,
                    "--portfolio-radius": getRadiusValue(portfolio.style.radius),
                    fontFamily: portfolio.style.fontFamily,
                } as CSSProperties
            }>
            <div
                className={cn("pointer-events-none absolute inset-0 -z-10 opacity-35", template.backgroundArtClassName)}
            />
            {children}
        </div>
    );
}
