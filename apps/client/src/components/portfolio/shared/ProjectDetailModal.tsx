import { Button } from "@/components/ui/button";
import type { PortfolioChrome, ProjectItem } from "@/components/portfolio/renderer-types";
import { cn } from "@/lib/utils";

type ProjectDetailModalProps = {
    project: ProjectItem | null;
    chrome: PortfolioChrome;
    radiusClassName: string;
    surfaceClassName: string;
    onClose: () => void;
};

export function ProjectDetailModal({
    project,
    chrome,
    radiusClassName,
    surfaceClassName,
    onClose,
}: ProjectDetailModalProps) {
    if (!project) {
        return null;
    }

    return (
        <div
            className={cn("inset-0 z-50 grid place-items-center bg-black/70 p-5", chrome === "builder" ? "absolute" : "fixed")}
            role="dialog"
        >
            <div
                className={cn(
                    "max-w-lg border p-6",
                    surfaceClassName,
                    "border-[color:color-mix(in_srgb,var(--portfolio-accent)_32%,transparent)] bg-[color-mix(in_srgb,var(--portfolio-accent)_10%,black)]",
                    radiusClassName,
                )}
            >
                <p className="text-xs uppercase tracking-[0.3em] text-[var(--portfolio-accent)]">
                    Project detail
                </p>
                <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em]">{project.title}</h2>
                <p className="mt-4 text-sm leading-7 opacity-75">{project.detail ?? project.summary}</p>
                <div className="mt-6 flex gap-2">
                    {project.url ? (
                        <Button
                            className="rounded-[var(--portfolio-radius)] bg-[var(--portfolio-accent)] text-[var(--portfolio-accent-contrast)] hover:bg-[color-mix(in_srgb,var(--portfolio-accent)_84%,black)]"
                            asChild
                        >
                            <a href={project.url} target="_blank" rel="noreferrer">
                                Open project
                            </a>
                        </Button>
                    ) : null}
                    <Button variant="outline" onClick={onClose}>
                        Close
                    </Button>
                </div>
            </div>
        </div>
    );
}
