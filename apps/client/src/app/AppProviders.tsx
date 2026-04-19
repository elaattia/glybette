import type { PropsWithChildren } from "react";
import { Provider as JotaiProvider } from "jotai";
import { QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider } from "@/context/ThemeContext";
import { appQueryClient } from "@/app/query-client";
import { TooltipProvider } from "@/components/ui/tooltip";

export function AppProviders({ children }: PropsWithChildren) {
    return (
        <JotaiProvider>
            <QueryClientProvider client={appQueryClient}>
                <ThemeProvider>
                    <TooltipProvider delayDuration={200} skipDelayDuration={0}>
                        <BrowserRouter>{children}</BrowserRouter>
                    </TooltipProvider>
                </ThemeProvider>
            </QueryClientProvider>
        </JotaiProvider>
    );
}
