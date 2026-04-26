import type { CSSProperties, ReactNode } from "react";
import type { PortfolioBlock, PortfolioDocumentDTO, PortfolioIdentity, PortfolioTab } from "@glybette/contracts";
import type { PortfolioTemplateDefinition } from "@/components/portfolio/template-config";

export type PortfolioRenderModel = Pick<PortfolioDocumentDTO, "slug" | "identity" | "templateId" | "style" | "tabs">;

export type PortfolioChrome = "public" | "builder";

export type ProjectItem = {
    title?: string;
    summary?: string;
    detail?: string;
    url?: string;
};

export type RenderBlockWrapper = (
    block: PortfolioBlock,
    content: ReactNode,
    className: string,
    style: CSSProperties,
) => ReactNode;

export type PortfolioRendererProps = {
    portfolio: PortfolioRenderModel;
    activeTabId?: string;
    selectedBlockId?: string | null;
    onTabChange?: (tabId: string) => void;
    onBlockSelect?: (blockId: string) => void;
    renderBlockWrapper?: RenderBlockWrapper;
    chrome?: PortfolioChrome;
    showGrid?: boolean;
};

export type TemplateViewProps = {
    portfolio: PortfolioRenderModel;
    template: PortfolioTemplateDefinition;
    identity: PortfolioIdentity;
    activeTab?: PortfolioTab;
    selectedBlockId?: string | null;
    onTabChange?: (tabId: string) => void;
    onBlockSelect?: (blockId: string) => void;
    renderBlockWrapper?: RenderBlockWrapper;
    showGrid: boolean;
    radiusClassName: string;
    onProjectClick: (project: ProjectItem) => void;
};
