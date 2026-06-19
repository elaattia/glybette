import type { PortfolioIdentity, PortfolioTab } from "@glybette/contracts";
import { useLocale } from "@/hooks/useLocale";
import { cn } from "@/lib/utils";

type PortfolioNameProps = {
    identity: PortfolioIdentity;
    titleClassName?: string;
};

export function PortfolioName({ identity, titleClassName }: PortfolioNameProps) {
    return (
        <>
            {identity.eyebrowPlacement === "above" ? (
                <p className="text-xs font-semibold uppercase tracking-[0.4em] text-[var(--portfolio-accent)]">
                    {identity.eyebrowText}
                </p>
            ) : null}
            <h1
                className={cn(
                    "text-5xl font-semibold tracking-[-0.07em] md:text-7xl",
                    identity.eyebrowPlacement === "above" && "mt-3",
                    titleClassName,
                )}>
                {identity.displayName}
            </h1>
            {identity.eyebrowPlacement === "below" ? (
                <p className="mt-3 text-xs font-semibold uppercase tracking-[0.4em] text-[var(--portfolio-accent)]">
                    {identity.eyebrowText}
                </p>
            ) : null}
        </>
    );
}

type PortfolioTabNavProps = {
    tabs: PortfolioTab[];
    activeTab?: PortfolioTab;
    onTabChange?: (tabId: string) => void;
    className?: string;
    buttonClassName?: string;
};

export function PortfolioTabNav({ tabs, activeTab, onTabChange, className, buttonClassName }: PortfolioTabNavProps) {
    return (
        <nav className={cn("flex flex-wrap gap-2", className)}>
            {tabs.map((tab) => (
                <button
                    key={tab.id}
                    type="button"
                    onClick={() => onTabChange?.(tab.id)}
                    className={cn(
                        "border px-4 py-2 text-sm transition",
                        buttonClassName,
                        "rounded-[var(--portfolio-radius)]",
                        activeTab?.id === tab.id
                            ? "border-transparent bg-[var(--portfolio-accent)] text-[var(--portfolio-accent-contrast)]"
                            : "border-current/15 hover:border-current/40",
                    )}>
                    {tab.label}
                </button>
            ))}
        </nav>
    );
}

export function PortfolioFooter() {
    const { t } = useLocale("portfolio");
    return (
        <footer className="relative mt-auto pt-10 text-center text-xs uppercase tracking-[0.35em] opacity-55">
            {t("renderer.footer")}
        </footer>
    );
}
