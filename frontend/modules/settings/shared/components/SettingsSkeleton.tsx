import { Skeleton } from "@/modules/shared/components/skeleton";

export function SettingsSkeleton({ itemCount = 2 }: { itemCount?: number }) {
    return (
        <div className="flex gap-8">
            {/* Sidebar skeleton */}
            <div className="w-56 shrink-0 space-y-4">
                <Skeleton className="h-13 w-full rounded-xl" />
                {Array.from({ length: itemCount }).map((_, i) => (
                    <Skeleton
                        key={i}
                        className="h-13 w-full rounded-lg"
                    />
                ))}
            </div>
            {/* Content skeleton */}
            <div className="flex-1 space-y-4">
                <Skeleton className="h-5 w-36" />
                <Skeleton className="h-4 w-64" />
                <Skeleton className="h-px w-full" />
                {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full rounded-md" />
                ))}
            </div>
        </div>
    );
}