import { Check, Copy, ExternalLink, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { useLocale } from "@/hooks/useLocale";
import { premiumPortfolioUrl, publicPortfolioUrl } from "@/lib/portfolio-urls";
import { cn } from "@/lib/utils";

type PortfolioSaveSuccessDialogProps = {
    open: boolean;
    url: string;
    slug: string;
    isPremium: boolean;
    copied: boolean;
    onCopy: () => void;
    onClose: () => void;
};

export function PortfolioSaveSuccessDialog({
    open,
    url,
    slug,
    isPremium,
    copied,
    onCopy,
    onClose,
}: PortfolioSaveSuccessDialogProps) {
    const { t } = useLocale("portfolio");

    return (
        <Dialog
            open={open}
            onOpenChange={(nextOpen) => {
                if (!nextOpen) {
                    onClose();
                }
            }}>
            <DialogContent className="max-w-lg" aria-describedby="portfolio-save-success-description">
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_0%,rgba(22,163,74,0.24),transparent_34%),radial-gradient(circle_at_95%_18%,rgba(2,132,199,0.16),transparent_30%),linear-gradient(180deg,rgba(255,255,255,0.05),transparent_46%)]" />

                <div className="relative z-10">
                    <DialogHeader>
                        <div className="mb-2 flex items-center gap-3">
                            <div className="flex size-11 items-center justify-center rounded-2xl bg-[#16A34A]/12 text-[#16A34A]">
                                <Check className="size-5" />
                            </div>
                            <p className="gb-sec-label">{t("builder.saveSuccess.sectionLabel")}</p>
                        </div>
                        <DialogTitle>{t("builder.saveSuccess.title")}</DialogTitle>
                        <DialogDescription id="portfolio-save-success-description" className="mt-1">
                            {t("builder.saveSuccess.description")}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="mt-5 rounded-2xl border border-[var(--gb-border)] bg-[var(--gb-bg)] p-4">
                        <p className="text-xs uppercase tracking-[0.24em] text-[var(--gb-muted)]">
                            {t("builder.saveSuccess.publicLink")}
                        </p>
                        <p className="mt-2 break-all font-medium text-[var(--gb-text)]">
                            {publicPortfolioUrl(slug, isPremium, true)}
                        </p>
                    </div>

                    {!isPremium ? (
                        <div className="mt-4 rounded-2xl border border-[#16A34A]/25 bg-[#16A34A]/10 p-4">
                            <div className="flex items-start gap-3">
                                <Sparkles className="mt-0.5 size-4 text-[#16A34A]" />
                                <div>
                                    <p className="text-sm font-semibold text-[var(--gb-text)]">
                                        {t("builder.saveSuccess.proUpgradeTitle")}
                                    </p>
                                    <p className="mt-1 break-all text-xs leading-5 text-[var(--gb-muted)]">
                                        {t("builder.saveSuccess.proUpgradeHint", { url: premiumPortfolioUrl(slug) })}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ) : null}

                    <DialogFooter className="mt-6 sm:justify-stretch">
                        <Button
                            size="lg"
                            className="h-10 flex-1 rounded-xl bg-[#16A34A] px-4 text-white hover:bg-[#15803D]"
                            asChild>
                            <a href={url} target="_blank" rel="noreferrer">
                                <ExternalLink className="size-4" />
                                {t("builder.saveSuccess.openPortfolio")}
                            </a>
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            size="lg"
                            className={cn(
                                "h-10 flex-1 rounded-xl px-4",
                                copied && "border-[#16A34A]/40 text-[#16A34A]",
                            )}
                            onClick={onCopy}>
                            {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
                            {copied ? t("builder.saveSuccess.copied") : t("builder.saveSuccess.share")}
                        </Button>
                    </DialogFooter>
                </div>
            </DialogContent>
        </Dialog>
    );
}
