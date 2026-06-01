import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export type ConfirmActionTone = "danger" | "neutral";

type ConfirmActionDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    description: string;
    confirmLabel: string;
    tone?: ConfirmActionTone;
    onConfirm: () => void;
    isLoading?: boolean;
};

export function ConfirmActionDialog({
    open,
    onOpenChange,
    title,
    description,
    confirmLabel,
    tone = "neutral",
    onConfirm,
    isLoading = false,
}: ConfirmActionDialogProps) {
    const handleConfirm = () => {
        onConfirm();
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md" showCloseButton={false}>
                <DialogHeader>
                    <div className="mb-2 flex items-center gap-3">
                        <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--gb-border)] bg-[var(--gb-surface)]">
                            <AlertTriangle className="h-5 w-5 text-[#f59e0b]" />
                        </div>
                        <DialogTitle className="text-xl">{title}</DialogTitle>
                    </div>
                    <DialogDescription>{description}</DialogDescription>
                </DialogHeader>
                <DialogFooter className="mt-4">
                    <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
                        Cancel
                    </Button>
                    <Button type="button" variant={tone === "danger" ? "destructive" : "default"} onClick={handleConfirm} disabled={isLoading}>
                        {confirmLabel}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
