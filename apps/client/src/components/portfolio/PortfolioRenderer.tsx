import { useMemo, useState } from "react";
import type { PortfolioIdentity, PortfolioTab } from "@glybette/contracts";
import { PortfolioThemeRoot } from "@/components/portfolio/shared/PortfolioThemeRoot";
import { ProjectDetailModal } from "@/components/portfolio/shared/ProjectDetailModal";
import { getTemplateEntry } from "@/components/portfolio/template-registry";
import type { PortfolioRendererProps, ProjectItem } from "@/components/portfolio/renderer-types";

export type { PortfolioRenderModel, PortfolioRendererProps } from "@/components/portfolio/renderer-types";

function getRadiusClassName(radius: string) {
    if (radius === "sharp") {
        return "rounded-none";
    }
    if (radius === "round") {
        return "rounded-[2rem]";
    }
    return "rounded-3xl";
}

function getPortfolioIdentity(portfolio: PortfolioRendererProps["portfolio"]): PortfolioIdentity {
    return (
        portfolio.identity ?? {
            displayName: portfolio.slug,
            eyebrowText: "Independent portfolio",
            eyebrowPlacement: "above",
        }
    );
}

export function PortfolioRenderer({
    portfolio,
    activeTabId,
    selectedBlockId,
    onTabChange,
    onBlockSelect,
    renderBlockWrapper,
    chrome = "public",
    showGrid = false,
}: PortfolioRendererProps) {
    const [project, setProject] = useState<ProjectItem | null>(null);
    const { config: template, Component } = getTemplateEntry(portfolio.templateId);
    const activeTab = useMemo<PortfolioTab | undefined>(
        () => portfolio.tabs.find((tab) => tab.id === activeTabId) ?? portfolio.tabs[0],
        [activeTabId, portfolio.tabs],
    );
    const radiusClassName = getRadiusClassName(portfolio.style.radius);

    return (
        <PortfolioThemeRoot portfolio={portfolio} template={template} chrome={chrome}>
            <Component
                portfolio={portfolio}
                template={template}
                identity={getPortfolioIdentity(portfolio)}
                activeTab={activeTab}
                selectedBlockId={selectedBlockId}
                onTabChange={onTabChange}
                onBlockSelect={onBlockSelect}
                renderBlockWrapper={renderBlockWrapper}
                showGrid={showGrid}
                radiusClassName={radiusClassName}
                onProjectClick={setProject}
            />
            <ProjectDetailModal
                project={project}
                chrome={chrome}
                templateId={template.id}
                radiusClassName={radiusClassName}
                surfaceClassName={template.surfaceClassName}
                onClose={() => setProject(null)}
            />
        </PortfolioThemeRoot>
    );
}
