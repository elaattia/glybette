import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PortfolioRenderer } from "@/components/portfolio/PortfolioRenderer";
import { getPublicPortfolio, portfolioQueryKeys, resolvePublicPortfolio } from "@/hooks/usePortfolio";
import { useLocale } from "@/hooks/useLocale";

type PublicPortfolioPageProps = {
    slug?: string;
    resolveFromHost?: boolean;
};

export function PublicPortfolioPage({ slug: forcedSlug, resolveFromHost = false }: PublicPortfolioPageProps) {
    const { t } = useLocale("portfolio");
    const params = useParams();
    const slug = forcedSlug ?? params.slug ?? "";
    const [activeTabId, setActiveTabId] = useState<string | undefined>();
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
    const portfolio = query.data?.portfolio;
    const resolvedActiveTabId = portfolio?.tabs.some((tab) => tab.id === activeTabId)
        ? activeTabId
        : portfolio?.tabs[0]?.id;

    if (query.isPending) {
        return (
            <main className="grid min-h-screen place-items-center bg-[#070A0F] text-white">
                <div className="text-center">
                    <Loader2 className="mx-auto mb-3 size-6 animate-spin text-[#16A34A]" />
                    <p className="text-sm opacity-70">{t("public.loading")}</p>
                </div>
            </main>
        );
    }

    if (query.isError || !portfolio) {
        return (
            <main className="grid min-h-screen place-items-center bg-[#070A0F] px-6 text-white">
                <div className="max-w-md text-center">
                    <p className="text-xs uppercase tracking-[0.4em] text-[#16A34A]">{t("public.notFoundLabel")}</p>
                    <h1 className="mt-4 text-4xl font-semibold tracking-[-0.06em]">{t("public.notFoundTitle")}</h1>
                    <p className="mt-3 text-sm leading-6 opacity-70">{t("public.notFoundDescription")}</p>
                    <Button className="mt-6" asChild>
                        <Link to="/">{t("public.goToGlybette")}</Link>
                    </Button>
                </div>
            </main>
        );
    }

    return <PortfolioRenderer portfolio={portfolio} activeTabId={resolvedActiveTabId} onTabChange={setActiveTabId} />;
}
