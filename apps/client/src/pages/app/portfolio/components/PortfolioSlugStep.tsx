import { Check, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { normalizePortfolioSlug } from "@/lib/portfolio";
import { premiumPortfolioUrl, publicPortfolioUrl } from "@/lib/portfolio-urls";

type PortfolioSlugStepProps = {
    slugInput: string;
    setSlugInput: (value: string) => void;
    slugMessage: string;
    isPremium: boolean;
    isCheckingSlug: boolean;
    onContinue: () => void;
};

export function PortfolioSlugStep({
    slugInput,
    setSlugInput,
    slugMessage,
    isPremium,
    isCheckingSlug,
    onContinue,
}: PortfolioSlugStepProps) {
    const normalizedSlug = normalizePortfolioSlug(slugInput);

    return (
        <div className="mx-auto max-w-3xl space-y-5">
            <Card className="border-[var(--gb-border)] bg-[var(--gb-app-panel-bg)] py-0 shadow-none">
                <CardHeader className="px-6 pt-6">
                    <div className="mb-3 flex size-11 items-center justify-center rounded-2xl bg-[#16A34A]/10 text-[#16A34A]">
                        <Sparkles className="size-5" />
                    </div>
                    <CardTitle className="font-['Bricolage_Grotesque'] text-3xl tracking-[-0.04em]">
                        Claim your portfolio URL
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-5 px-6 pb-6">
                    <div className="space-y-2">
                        <Label htmlFor="portfolio-slug">Portfolio name</Label>
                        <Input
                            id="portfolio-slug"
                            value={slugInput}
                            onChange={(event) => setSlugInput(event.target.value)}
                            placeholder="your-name"
                            className="h-11 border-[var(--gb-border)] bg-[var(--gb-bg)]"
                        />
                        <p className="text-xs text-[var(--gb-muted)]">
                            Letters, numbers, and hyphens only. You can change it later, but the link will change.
                        </p>
                    </div>
                    <div className="grid gap-3 rounded-2xl border border-[var(--gb-border)] bg-[var(--gb-bg)] p-4 text-sm">
                        <div>
                            <p className="text-xs uppercase tracking-[0.24em] text-[var(--gb-muted)]">
                                Your public link
                            </p>
                            <p className="mt-1 font-medium text-[var(--gb-text)]">
                                {publicPortfolioUrl(normalizedSlug || "name", isPremium, true)}
                            </p>
                        </div>
                        {!isPremium ? (
                            <div className="rounded-xl border border-[#16A34A]/20 bg-[#16A34A]/10 p-3">
                                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#16A34A]">
                                    Pro URL preview
                                </p>
                                <p className="mt-1 text-[var(--gb-text)]">{premiumPortfolioUrl(normalizedSlug)}</p>
                                <p className="mt-1 text-xs text-[var(--gb-muted)]">
                                    Upgrade to Pro for a professional portfolio URL.
                                </p>
                            </div>
                        ) : null}
                    </div>
                    {slugMessage ? <p className="text-sm text-destructive">{slugMessage}</p> : null}
                    <Button
                        className="gb-btn-primary h-10"
                        onClick={onContinue}
                        disabled={isCheckingSlug || normalizedSlug.length < 3}
                    >
                        {isCheckingSlug ? <Loader2 className="animate-spin" /> : <Check />}
                        Continue to templates
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
