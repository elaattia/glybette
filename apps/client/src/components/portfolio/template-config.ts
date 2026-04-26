import type { PortfolioStyle, PortfolioTemplateId } from "@glybette/contracts";

export type PortfolioTemplateDefinition = {
    id: PortfolioTemplateId;
    name: string;
    tone: string;
    description: string;
    columns: number;
    defaultStyle: PortfolioStyle;
    previewClassName: string;
    surfaceClassName: string;
    accentClassName: string;
    backgroundArtClassName: string;
    pickerSurfaceClassName: string;
    pickerTitleClassName: string;
    sidebarPreviewClassName?: string;
};

export const portfolioTemplates: PortfolioTemplateDefinition[] = [
    {
        id: "atelier",
        name: "Atelier Ledger",
        tone: "Editorial, focused, quietly luxurious",
        description: "A magazine-like portfolio with generous type, calm panels, and sharp project storytelling.",
        columns: 2,
        defaultStyle: {
            theme: "dark",
            accentColor: "#16A34A",
            fontFamily: "Bricolage Grotesque",
            radius: "soft",
        },
        previewClassName: "bg-[#101714] text-[#F4F0E8]",
        surfaceClassName: "border-current/15 bg-white/7",
        accentClassName: "text-[#C8FF69]",
        backgroundArtClassName:
            "bg-[radial-gradient(circle_at_18%_12%,var(--portfolio-accent),transparent_24%),linear-gradient(135deg,rgba(255,255,255,0.08),transparent_36%),linear-gradient(90deg,transparent_49%,rgba(255,255,255,0.08)_50%,transparent_51%)]",
        pickerSurfaceClassName: "rounded-2xl",
        pickerTitleClassName: "mt-8",
    },
    {
        id: "signal",
        name: "Signal Grid",
        tone: "Industrial, technical, high-contrast",
        description: "A dense grid for builders who want the portfolio to feel like a control room.",
        columns: 2,
        defaultStyle: {
            theme: "dark",
            accentColor: "#38BDF8",
            fontFamily: "DM Sans",
            radius: "sharp",
        },
        previewClassName: "bg-[#070A0F] text-[#E8F4FF]",
        surfaceClassName: "border-current/15 bg-white/5",
        accentClassName: "text-[#38BDF8]",
        backgroundArtClassName:
            "bg-[linear-gradient(color-mix(in_srgb,var(--portfolio-accent)_12%,transparent)_1px,transparent_1px),linear-gradient(90deg,color-mix(in_srgb,var(--portfolio-accent)_12%,transparent)_1px,transparent_1px),radial-gradient(circle_at_80%_15%,var(--portfolio-accent),transparent_18%)] bg-[size:36px_36px,36px_36px,auto]",
        pickerSurfaceClassName: "rounded-lg font-mono",
        pickerTitleClassName: "mt-8",
        sidebarPreviewClassName: "rounded-none font-mono uppercase",
    },
    {
        id: "folio",
        name: "Folio Bloom",
        tone: "Soft, warm, personable",
        description: "A lighter portfolio for profiles that need warmth, clarity, and an approachable rhythm.",
        columns: 2,
        defaultStyle: {
            theme: "light",
            accentColor: "#D97706",
            fontFamily: "DM Sans",
            radius: "round",
        },
        previewClassName: "bg-[#FFF7ED] text-[#29180A]",
        surfaceClassName: "border-current/15 bg-white/70",
        accentClassName: "text-[#B45309]",
        backgroundArtClassName:
            "bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.95),transparent_28%),radial-gradient(circle_at_85%_22%,var(--portfolio-accent),transparent_18%),radial-gradient(circle_at_12%_70%,color-mix(in_srgb,var(--portfolio-accent)_38%,white),transparent_24%)]",
        pickerSurfaceClassName: "rounded-[2rem] text-center",
        pickerTitleClassName: "mt-10",
    },
    {
        id: "mono",
        name: "Mono Dispatch",
        tone: "Brutalist, compact, sharply typographic",
        description: "A stripped-back profile for technical specialists who want proof, links, and signal fast.",
        columns: 2,
        defaultStyle: {
            theme: "light",
            accentColor: "#111827",
            fontFamily: "Bricolage Grotesque",
            radius: "sharp",
        },
        previewClassName: "bg-[#F6F1E7] text-[#111827]",
        surfaceClassName: "border-current/25 bg-[#FFFDF7]",
        accentClassName: "text-[#111827]",
        backgroundArtClassName:
            "bg-[linear-gradient(90deg,color-mix(in_srgb,var(--portfolio-accent)_18%,transparent)_1px,transparent_1px),linear-gradient(color-mix(in_srgb,var(--portfolio-accent)_18%,transparent)_1px,transparent_1px)] bg-[size:18px_18px]",
        pickerSurfaceClassName: "rounded-none border-2",
        pickerTitleClassName: "mt-8 uppercase leading-none",
        sidebarPreviewClassName: "rounded-none border border-current/30 uppercase",
    },
];

export function getTemplate(templateId: PortfolioTemplateId) {
    return portfolioTemplates.find((template) => template.id === templateId) ?? portfolioTemplates[0];
}
