import type {
    PortfolioResponse,
    PortfolioSlugAvailabilityResponse,
    PortfolioSlugRequest,
    PublicPortfolioResponse,
    SavePortfolioRequest,
} from "@glybette/contracts";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";

export const portfolioQueryKeys = {
    current: ["portfolio", "current"] as const,
    public: (slug: string) => ["portfolio", "public", slug] as const,
};

export function getCurrentPortfolio() {
    return apiRequest<PortfolioResponse>("/api/portfolio/me");
}

export function checkPortfolioSlug(slug: string) {
    const payload: PortfolioSlugRequest = { slug };
    return apiRequest<PortfolioSlugAvailabilityResponse>("/api/portfolio/slug/check", {
        method: "POST",
        body: JSON.stringify(payload),
    });
}

export function setPortfolioSlug(slug: string) {
    const payload: PortfolioSlugRequest = { slug };
    return apiRequest<PortfolioResponse>("/api/portfolio/me/slug", {
        method: "PUT",
        body: JSON.stringify(payload),
    });
}

export function savePortfolio(payload: SavePortfolioRequest) {
    return apiRequest<PortfolioResponse>("/api/portfolio/me", {
        method: "PUT",
        body: JSON.stringify(payload),
    });
}

export function getPublicPortfolio(slug: string) {
    return apiRequest<PublicPortfolioResponse>(`/api/portfolio/public/${encodeURIComponent(slug)}`);
}

export function resolvePublicPortfolio(slug: string) {
    return apiRequest<PublicPortfolioResponse>(`/api/portfolio/public/resolve?slug=${encodeURIComponent(slug)}`);
}

export function useCurrentPortfolio() {
    const auth = useAuth();

    return useQuery({
        queryKey: portfolioQueryKeys.current,
        queryFn: getCurrentPortfolio,
        enabled: auth.isAuthenticated,
        staleTime: 15_000,
    });
}

export function usePortfolioMutations() {
    const queryClient = useQueryClient();

    const invalidateCurrent = async () => {
        await queryClient.invalidateQueries({ queryKey: portfolioQueryKeys.current });
    };

    return {
        checkSlug: useMutation({ mutationFn: checkPortfolioSlug }),
        setSlug: useMutation({ mutationFn: setPortfolioSlug, onSuccess: invalidateCurrent }),
        save: useMutation({ mutationFn: savePortfolio, onSuccess: invalidateCurrent }),
    };
}
