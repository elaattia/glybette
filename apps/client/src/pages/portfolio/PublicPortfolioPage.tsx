import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PortfolioRenderer } from "@/components/portfolio/PortfolioRenderer";
import { getPublicPortfolio, portfolioQueryKeys, resolvePublicPortfolio } from "@/hooks/usePortfolio";

type PublicPortfolioPageProps = {
    slug?: string;
    resolveFromHost?: boolean;
};

export function PublicPortfolioPage({ slug: forcedSlug, resolveFromHost = false }: PublicPortfolioPageProps) {
    const params = useParams();
    const slug = forcedSlug ?? params.slug ?? "";
    const queryKey = useMemo(
        () => (resolveFromHost ? ["portfolio", "host", slug] : portfolioQueryKeys.public(slug)),
        [resolveFromHost, slug],
    );
    const query = useQuery({
        queryKey,
        queryFn: () => (resolveFromHost ? resolvePublicPortfolio(slug) : getPublicPortfolio(slug)),
        enabled: slug.length > 0,
        staleTime: 30_000,
    });

    if (query.isPending) {
        return (
            <main className="grid min-h-screen place-items-center bg-[#070A0F] text-white">
                <div className="text-center">
                    <Loader2 className="mx-auto mb-3 size-6 animate-spin text-[#16A34A]" />
                    <p className="text-sm opacity-70">Loading portfolio...</p>
                </div>
            </main>
        );
    }

    if (query.isError || !query.data?.portfolio) {
        return (
            <main className="grid min-h-screen place-items-center bg-[#070A0F] px-6 text-white">
                <div className="max-w-md text-center">
                    <p className="text-xs uppercase tracking-[0.4em] text-[#16A34A]">Portfolio not found</p>
                    <h1 className="mt-4 text-4xl font-semibold tracking-[-0.06em]">
                        This portfolio is not live yet.
                    </h1>
                    <p className="mt-3 text-sm leading-6 opacity-70">
                        The owner may still be building it, or the URL may have changed.
                    </p>
                    <Button className="mt-6" asChild>
                        <Link to="/">Go to Glybette</Link>
                    </Button>
                </div>
            </main>
        );
    }

    return <PortfolioRenderer portfolio={query.data.portfolio} />;
}
