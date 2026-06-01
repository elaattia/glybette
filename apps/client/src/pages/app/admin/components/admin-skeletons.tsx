import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const TABLE_CELL_WIDTHS = ["w-28", "w-36", "w-24", "w-32", "w-20", "w-40", "w-28"] as const;

type AdminTableSkeletonProps = {
    columns: number;
    rows?: number;
};

export function AdminTableSkeleton({ columns, rows = 7 }: AdminTableSkeletonProps) {
    return (
        <>
            {Array.from({ length: rows }).map((_, rowIndex) => (
                <tr key={rowIndex} className="border-t border-[var(--gb-border)]">
                    {Array.from({ length: columns }).map((_, colIndex) => (
                        <td key={colIndex} className="px-3 py-3">
                            <Skeleton className={`h-4 ${TABLE_CELL_WIDTHS[colIndex % TABLE_CELL_WIDTHS.length]}`} />
                        </td>
                    ))}
                </tr>
            ))}
        </>
    );
}

type AdminStatCardSkeletonProps = {
    className?: string;
};

export function AdminStatCardSkeleton({ className }: AdminStatCardSkeletonProps) {
    return (
        <Card className={cn("border-[var(--gb-border)] bg-[var(--gb-app-panel-bg)]", className)}>
            <CardContent className="space-y-2 px-4 py-4">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-8 w-14" />
            </CardContent>
        </Card>
    );
}

type AdminStatCardsSkeletonProps = {
    count?: number;
    className?: string;
};

export function AdminStatCardsSkeleton({ count = 5, className }: AdminStatCardsSkeletonProps) {
    return (
        <>
            {Array.from({ length: count }).map((_, index) => (
                <AdminStatCardSkeleton key={index} className={className} />
            ))}
        </>
    );
}
