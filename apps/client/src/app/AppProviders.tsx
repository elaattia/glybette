import type { PropsWithChildren } from "react";
import { Provider as JotaiProvider } from "jotai";
import { QueryClientProvider } from "@tanstack/react-query";
import { I18nextProvider } from "react-i18next";
import { BrowserRouter } from "react-router-dom";
import { ThemeDocumentSync } from "@/state/theme/ThemeDocumentSync";
import { appQueryClient } from "@/app/query-client";
import { TooltipProvider } from "@/components/ui/tooltip";
import i18n from "@/i18n";

export function AppProviders({ children }: PropsWithChildren) {
    return (
        <JotaiProvider>
            <I18nextProvider i18n={i18n}>
                <ThemeDocumentSync />
                <QueryClientProvider client={appQueryClient}>
                    <TooltipProvider delayDuration={200} skipDelayDuration={0}>
                        <BrowserRouter>{children}</BrowserRouter>
                    </TooltipProvider>
                </QueryClientProvider>
            </I18nextProvider>
        </JotaiProvider>
    );
}
