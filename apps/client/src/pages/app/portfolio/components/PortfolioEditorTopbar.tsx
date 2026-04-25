import { Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { publicPortfolioUrl } from "@/lib/portfolio-urls";

type PortfolioEditorTopbarProps = {
    slug: string;
    isPremium: boolean;
    localSavedAt: string | null;
    isSaving: boolean;
    onSave: () => void;
};

export function PortfolioEditorTopbar({
    slug,
    isPremium,
    localSavedAt,
    isSaving,
    onSave,
}: PortfolioEditorTopbarProps) {
    return (
        <div className="sticky top-0 z-20 -mx-4 border-b border-[var(--gb-border)] bg-[var(--gb-bg)]/90 px-4 py-3 backdrop-blur md:-mx-6 md:px-6">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div>
                    <p className="text-xs uppercase tracking-[0.28em] text-[var(--gb-muted)]">Live URL</p>
                    <p className="font-medium text-[var(--gb-text)]">{publicPortfolioUrl(slug, isPremium)}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs text-[var(--gb-muted)]">
                        Local autosave {localSavedAt ? `at ${localSavedAt}` : "ready"}
                    </span>
                    <Button variant="outline" asChild>
                        <a href={`/user/${slug}`} target="_blank" rel="noreferrer">
                            Preview
                        </a>
                    </Button>
                    <Button onClick={onSave} disabled={isSaving}>
                        {isSaving ? <Loader2 className="animate-spin" /> : <Save />}
                        Save live
                    </Button>
                </div>
            </div>
        </div>
    );
}
