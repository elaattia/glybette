import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type AdminChartCardSkeletonProps = {
    className?: string;
    rows?: number;
};

export function AdminChartCardSkeleton({ className, rows = 4 }: AdminChartCardSkeletonProps) {
    return (
        <Card className={cn("border-[var(--gb-border)] bg-[var(--gb-app-panel-bg)] shadow-none", className)}>
            <CardHeader className="px-5 pt-5 pb-3 md:px-6">
                <Skeleton className="h-5 w-40" />
            </CardHeader>
            <CardContent className="space-y-3 px-5 pb-5 md:px-6 md:pb-6">
                {Array.from({ length: rows }).map((_, index) => (
                    <div key={index} className="space-y-1.5">
                        <div className="flex justify-between gap-2">
                            <Skeleton className="h-3 w-28" />
                            <Skeleton className="h-3 w-10" />
                        </div>
                        <Skeleton className="h-1.5 w-full rounded-full" />
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}

export function AdminGrowthChartSkeleton() {
    return (
        <Card className="border-[var(--gb-border)] bg-[var(--gb-app-panel-bg)] shadow-none">
            <CardHeader className="px-5 pt-5 pb-3 md:px-6">
                <Skeleton className="h-5 w-48" />
            </CardHeader>
            <CardContent className="px-5 pb-5 md:px-6 md:pb-6">
                <Skeleton className="h-[200px] w-full rounded-xl" />
            </CardContent>
        </Card>
    );
}
