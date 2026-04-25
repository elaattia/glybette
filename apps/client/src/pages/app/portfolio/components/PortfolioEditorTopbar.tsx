import { useState } from "react";
import { ExternalLink, Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { publicPortfolioUrl } from "@/lib/portfolio-urls";
import { PortfolioSaveSuccessDialog } from "@/pages/app/portfolio/components/PortfolioSaveSuccessDialog";

type PortfolioEditorTopbarProps = {
    slug: string;
    isPremium: boolean;
    localSavedAt: string | null;
    isSaving: boolean;
    onSave: () => Promise<boolean>;
};

export function PortfolioEditorTopbar({
    slug,
    isPremium,
    localSavedAt,
    isSaving,
    onSave,
}: PortfolioEditorTopbarProps) {
    const [successOpen, setSuccessOpen] = useState(false);
    const [copied, setCopied] = useState(false);
    const portfolioUrl = publicPortfolioUrl(slug, isPremium);

    const copyPortfolioUrl = async () => {
        try {
            await navigator.clipboard.writeText(portfolioUrl);
        } catch {
            const textarea = document.createElement("textarea");
            textarea.value = portfolioUrl;
            textarea.style.position = "fixed";
            textarea.style.opacity = "0";
            document.body.append(textarea);
            textarea.select();
            document.execCommand("copy");
            textarea.remove();
        }
        setCopied(true);
    };

    const saveAndShowSuccess = async () => {
        const saved = await onSave();
        if (saved) {
            setCopied(false);
            setSuccessOpen(true);
        }
    };

    const openPortfolio = () => {
        window.open(portfolioUrl, "_blank", "noopener,noreferrer");
    };

    return (
        <>
            <div className="sticky top-0 z-20 -mx-4 border-b border-[var(--gb-border)] bg-[var(--gb-bg)]/90 px-4 py-3 backdrop-blur md:-mx-6 md:px-6">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <p className="text-xs uppercase tracking-[0.28em] text-[var(--gb-muted)]">Live URL</p>
                        <p className="font-medium text-[var(--gb-text)]">
                            {publicPortfolioUrl(slug, isPremium, true)}
                        </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs text-[var(--gb-muted)]">
                            Local autosave {localSavedAt ? `at ${localSavedAt}` : "ready"}
                        </span>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={openPortfolio}
                            disabled={!slug.trim()}
                            title="Open public portfolio in a new tab"
                        >
                            <ExternalLink />
                            Open
                        </Button>
                        <Button onClick={saveAndShowSuccess} disabled={isSaving}>
                            {isSaving ? <Loader2 className="animate-spin" /> : <Save />}
                            Save
                        </Button>
                    </div>
                </div>
            </div>
            <PortfolioSaveSuccessDialog
                open={successOpen}
                url={portfolioUrl}
                slug={slug}
                isPremium={isPremium}
                copied={copied}
                onCopy={copyPortfolioUrl}
                onClose={() => setSuccessOpen(false)}
            />
        </>
    );
}
