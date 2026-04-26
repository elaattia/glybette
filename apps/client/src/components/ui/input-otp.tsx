import * as React from "react";
import { OTPInput, OTPInputContext } from "input-otp";
import { cn } from "@/lib/utils";

function InputOTP({ className, containerClassName, ...props }: React.ComponentProps<typeof OTPInput>) {
    return (
        <OTPInput
            data-slot="input-otp"
            containerClassName={cn("flex items-center gap-2", containerClassName)}
            className={cn("disabled:cursor-not-allowed", className)}
            {...props}
        />
    );
}

function InputOTPGroup({ className, ...props }: React.ComponentProps<"div">) {
    return <div data-slot="input-otp-group" className={cn("flex items-center gap-2", className)} {...props} />;
}

function InputOTPSlot({
    index,
    className,
    ...props
}: React.ComponentProps<"div"> & {
    index: number;
}) {
    const inputOTPContext = React.use(OTPInputContext);
    const slot = inputOTPContext.slots[index];

    return (
        <div
            data-slot="input-otp-slot"
            data-active={slot.isActive}
            className={cn(
                "flex h-12 w-12 items-center justify-center rounded-xl border text-lg font-semibold text-[var(--gb-text)] transition-all",
                "border-[var(--gb-border)] bg-[var(--gb-surface2)]",
                "data-[active=true]:border-[var(--gb-primary)] data-[active=true]:ring-2 data-[active=true]:ring-[color-mix(in_srgb,var(--gb-primary)_45%,transparent)]",
                className,
            )}
            {...props}>
            {slot.char ?? <span className="text-[var(--gb-muted2)]">-</span>}
        </div>
    );
}

export { InputOTP, InputOTPGroup, InputOTPSlot };
