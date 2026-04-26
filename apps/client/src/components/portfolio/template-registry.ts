import type { ComponentType } from "react";
import type { PortfolioTemplateId } from "@glybette/contracts";
import { AtelierPortfolio } from "@/components/portfolio/templates/AtelierPortfolio";
import { FolioPortfolio } from "@/components/portfolio/templates/FolioPortfolio";
import { MonoPortfolio } from "@/components/portfolio/templates/MonoPortfolio";
import { SignalPortfolio } from "@/components/portfolio/templates/SignalPortfolio";
import { getTemplate, portfolioTemplates, type PortfolioTemplateDefinition } from "@/components/portfolio/template-config";
import type { TemplateViewProps } from "@/components/portfolio/renderer-types";

export type PortfolioTemplateRegistryEntry = {
    config: PortfolioTemplateDefinition;
    Component: ComponentType<TemplateViewProps>;
};

export const portfolioTemplateRegistry: Record<PortfolioTemplateId, PortfolioTemplateRegistryEntry> = {
    atelier: {
        config: getTemplate("atelier"),
        Component: AtelierPortfolio,
    },
    signal: {
        config: getTemplate("signal"),
        Component: SignalPortfolio,
    },
    folio: {
        config: getTemplate("folio"),
        Component: FolioPortfolio,
    },
    mono: {
        config: getTemplate("mono"),
        Component: MonoPortfolio,
    },
};

export function getTemplateEntry(templateId: PortfolioTemplateId) {
    return portfolioTemplateRegistry[templateId] ?? portfolioTemplateRegistry[portfolioTemplates[0].id];
}
