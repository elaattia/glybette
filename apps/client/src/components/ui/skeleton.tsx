import { cn } from "@/lib/utils";

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
    return (
        <div
            data-slot="skeleton"
            className={cn("animate-pulse rounded-md bg-[var(--gb-app-hover)]", className)}
            {...props}
        />
    );
}

export { Skeleton };
