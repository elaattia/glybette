import { ExternalLink, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { PortfolioChrome, ProjectItem } from "@/components/portfolio/renderer-types";
import type { PortfolioTemplateDefinition } from "@/components/portfolio/template-config";
import { cn } from "@/lib/utils";

type ProjectDetailModalProps = {
    project: ProjectItem | null;
    chrome: PortfolioChrome;
    templateId: PortfolioTemplateDefinition["id"];
    radiusClassName: string;
    surfaceClassName: string;
    onClose: () => void;
};

type ModalTheme = {
    overlayClassName: string;
    panelClassName: string;
    eyebrowClassName: string;
    titleClassName: string;
    bodyClassName: string;
    closeClassName: string;
    primaryClassName: string;
    secondaryClassName: string;
    decoration?: "atelier" | "signal" | "folio" | "mono";
};

function getModalTheme(templateId: PortfolioTemplateDefinition["id"]): ModalTheme {
    if (templateId === "signal") {
        return {
            overlayClassName:
                "bg-[#03070D]/82 backdrop-blur-[6px] [background-image:linear-gradient(color-mix(in_srgb,var(--portfolio-accent)_14%,transparent)_1px,transparent_1px),linear-gradient(90deg,color-mix(in_srgb,var(--portfolio-accent)_12%,transparent)_1px,transparent_1px)] [background-size:30px_30px]",
            panelClassName:
                "max-w-xl border border-[color:color-mix(in_srgb,var(--portfolio-accent)_48%,transparent)] bg-[#071019]/95 p-5 font-mono text-[#E8F4FF] shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_28px_90px_rgba(0,0,0,0.55),0_0_70px_color-mix(in_srgb,var(--portfolio-accent)_22%,transparent)]",
            eyebrowClassName:
                "border-b border-[color:color-mix(in_srgb,var(--portfolio-accent)_28%,transparent)] pb-3 text-[0.65rem] uppercase tracking-[0.36em] text-[var(--portfolio-accent)]",
            titleClassName: "mt-5 font-mono text-3xl font-semibold uppercase tracking-[-0.06em] md:text-4xl",
            bodyClassName: "mt-4 text-sm leading-7 text-[#B8CADB]",
            closeClassName:
                "rounded-none border border-[color:color-mix(in_srgb,var(--portfolio-accent)_38%,transparent)] bg-black/20 text-[var(--portfolio-accent)] hover:bg-[color-mix(in_srgb,var(--portfolio-accent)_14%,transparent)] hover:text-white",
            primaryClassName:
                "rounded-none bg-[var(--portfolio-accent)] font-mono uppercase text-[var(--portfolio-accent-contrast)] hover:bg-[color-mix(in_srgb,var(--portfolio-accent)_82%,white)]",
            secondaryClassName:
                "rounded-none border-[color:color-mix(in_srgb,var(--portfolio-accent)_40%,transparent)] bg-transparent font-mono uppercase text-[#E8F4FF] hover:bg-[color-mix(in_srgb,var(--portfolio-accent)_12%,transparent)]",
            decoration: "signal",
        };
    }

    if (templateId === "folio") {
        return {
            overlayClassName:
                "bg-[#29180A]/28 backdrop-blur-md [background-image:radial-gradient(circle_at_50%_18%,rgba(255,247,237,0.72),transparent_34%),radial-gradient(circle_at_84%_20%,color-mix(in_srgb,var(--portfolio-accent)_28%,transparent),transparent_24%)]",
            panelClassName:
                "max-w-xl border border-white/70 bg-[#FFF7ED]/95 p-7 text-[#29180A] shadow-[0_28px_80px_color-mix(in_srgb,var(--portfolio-accent)_24%,transparent)]",
            eyebrowClassName:
                "inline-flex rounded-full bg-[color-mix(in_srgb,var(--portfolio-accent)_14%,white)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-[color-mix(in_srgb,var(--portfolio-accent)_70%,#29180A)]",
            titleClassName: "mt-5 text-4xl font-semibold tracking-[-0.055em] md:text-5xl",
            bodyClassName: "mt-4 text-base leading-8 text-[#5F3B1F]",
            closeClassName:
                "rounded-full border border-[#E8D2B7] bg-white/72 text-[#7A4E24] hover:bg-[#FFFDF8] hover:text-[#29180A]",
            primaryClassName:
                "rounded-full bg-[var(--portfolio-accent)] px-4 text-[var(--portfolio-accent-contrast)] shadow-[0_12px_30px_color-mix(in_srgb,var(--portfolio-accent)_28%,transparent)] hover:bg-[color-mix(in_srgb,var(--portfolio-accent)_86%,black)]",
            secondaryClassName: "rounded-full border-[#E8D2B7] bg-white/60 px-4 text-[#5F3B1F] hover:bg-white",
            decoration: "folio",
        };
    }

    if (templateId === "mono") {
        return {
            overlayClassName:
                "bg-[#111827]/42 backdrop-blur-[2px] [background-image:linear-gradient(90deg,rgba(17,24,39,0.12)_1px,transparent_1px),linear-gradient(rgba(17,24,39,0.12)_1px,transparent_1px)] [background-size:18px_18px]",
            panelClassName:
                "max-w-lg border-4 border-[#111827] bg-[#FFFDF7] p-5 text-[#111827] shadow-[10px_10px_0_var(--portfolio-accent)]",
            eyebrowClassName: "border-b-4 border-[#111827] pb-3 text-xs font-black uppercase tracking-[0.28em]",
            titleClassName: "mt-5 text-4xl font-black uppercase leading-none tracking-[-0.075em] md:text-5xl",
            bodyClassName: "mt-4 border-l-4 border-[#111827] pl-4 text-sm font-semibold leading-7",
            closeClassName:
                "rounded-none border-2 border-[#111827] bg-[#FFFDF7] text-[#111827] hover:bg-[#111827] hover:text-[#FFFDF7]",
            primaryClassName:
                "rounded-none border-2 border-[#111827] bg-[#111827] font-black uppercase text-[#FFFDF7] hover:bg-[#2B3446]",
            secondaryClassName:
                "rounded-none border-2 border-[#111827] bg-[#FFFDF7] font-black uppercase text-[#111827] hover:bg-[#111827] hover:text-[#FFFDF7]",
            decoration: "mono",
        };
    }

    return {
        overlayClassName:
            "bg-[#050807]/72 backdrop-blur-md [background-image:radial-gradient(circle_at_22%_14%,color-mix(in_srgb,var(--portfolio-accent)_22%,transparent),transparent_28%)]",
        panelClassName:
            "max-w-2xl border border-white/14 bg-[#101714]/94 p-7 text-[#F4F0E8] shadow-[0_30px_90px_rgba(0,0,0,0.52)]",
        eyebrowClassName:
            "font-['DM_Sans'] text-xs uppercase tracking-[0.34em] text-[color-mix(in_srgb,var(--portfolio-accent)_72%,#F4F0E8)]",
        titleClassName: "mt-4 text-4xl font-semibold tracking-[-0.06em] md:text-5xl",
        bodyClassName: "mt-5 max-w-prose text-base leading-8 text-[#D6D0C4]",
        closeClassName: "rounded-full border border-white/15 bg-white/8 text-[#F4F0E8] hover:bg-white/14",
        primaryClassName:
            "rounded-[var(--portfolio-radius)] bg-[var(--portfolio-accent)] text-[var(--portfolio-accent-contrast)] hover:bg-[color-mix(in_srgb,var(--portfolio-accent)_84%,white)]",
        secondaryClassName:
            "rounded-[var(--portfolio-radius)] border-white/18 bg-white/8 text-[#F4F0E8] hover:bg-white/14",
        decoration: "atelier",
    };
}

export function ProjectDetailModal({
    project,
    chrome,
    templateId,
    radiusClassName,
    surfaceClassName,
    onClose,
}: ProjectDetailModalProps) {
    if (!project) {
        return null;
    }

    const theme = getModalTheme(templateId);

    return (
        <div
            className={cn(
                "inset-0 z-50 grid place-items-center p-5 animate-in fade-in-0 duration-200",
                theme.overlayClassName,
                chrome === "builder" ? "absolute" : "fixed",
            )}
            role="dialog"
            aria-modal="true"
            aria-labelledby="project-detail-title"
            onClick={onClose}>
            <div
                className={cn(
                    "relative w-full overflow-hidden animate-in fade-in-0 duration-200",
                    surfaceClassName,
                    theme.panelClassName,
                    radiusClassName,
                )}
                onClick={(event) => event.stopPropagation()}>
                {theme.decoration === "atelier" ? (
                    <div className="pointer-events-none absolute right-6 top-6 h-24 w-24 rounded-full border border-[color:color-mix(in_srgb,var(--portfolio-accent)_42%,transparent)] opacity-50" />
                ) : null}
                {theme.decoration === "signal" ? (
                    <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-[var(--portfolio-accent)] shadow-[0_0_32px_var(--portfolio-accent)]" />
                ) : null}
                {theme.decoration === "folio" ? (
                    <div className="pointer-events-none absolute -right-12 -top-12 h-36 w-36 rounded-full bg-[color-mix(in_srgb,var(--portfolio-accent)_18%,white)] blur-2xl" />
                ) : null}
                {theme.decoration === "mono" ? (
                    <div className="pointer-events-none absolute right-4 top-4 text-xs font-black uppercase tracking-[0.24em] opacity-30">
                        Case file
                    </div>
                ) : null}

                <button
                    type="button"
                    className={cn(
                        "absolute right-4 top-4 z-10 grid size-9 place-items-center transition",
                        theme.closeClassName,
                    )}
                    onClick={onClose}
                    aria-label="Close project detail">
                    <X className="size-4" />
                </button>

                <p className={cn("pr-12", theme.eyebrowClassName)}>Project details</p>
                <h2 id="project-detail-title" className={cn("pr-10", theme.titleClassName)}>
                    {project.title}
                </h2>
                <p className={theme.bodyClassName}>{project.detail ?? project.summary}</p>
                <div className="mt-7 flex flex-wrap gap-2">
                    {project.url ? (
                        <Button className={theme.primaryClassName} asChild>
                            <a href={project.url} target="_blank" rel="noreferrer">
                                <ExternalLink />
                                Open project
                            </a>
                        </Button>
                    ) : null}
                    <Button variant="outline" className={theme.secondaryClassName} onClick={onClose}>
                        Close
                    </Button>
                </div>
            </div>
        </div>
    );
}
