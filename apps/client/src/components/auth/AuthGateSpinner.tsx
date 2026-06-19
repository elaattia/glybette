import { Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";

export function AuthGateSpinner() {
    const { t } = useTranslation("common");

    return (
        <main className="flex min-h-screen items-center justify-center" aria-busy="true" aria-label={t("actions.loading")}>
            <Loader2 className="size-8 animate-spin text-[var(--gb-muted)]" />
        </main>
    );
}
