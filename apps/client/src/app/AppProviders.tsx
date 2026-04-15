import type { PropsWithChildren } from "react";
import { Provider as JotaiProvider } from "jotai";
import { QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider } from "@/context/ThemeContext";
import { appQueryClient } from "@/app/query-client";

export function AppProviders({ children }: PropsWithChildren) {
    return (
        <JotaiProvider>
            <QueryClientProvider client={appQueryClient}>
                <ThemeProvider>
                    <BrowserRouter>{children}</BrowserRouter>
                </ThemeProvider>
            </QueryClientProvider>
        </JotaiProvider>
    );
}
