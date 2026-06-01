import { Loader2 } from "lucide-react";

export function AuthGateSpinner() {
    return (
        <main className="flex min-h-screen items-center justify-center" aria-busy="true" aria-label="Loading">
            <Loader2 className="size-8 animate-spin text-[var(--gb-muted)]" />
        </main>
    );
}
