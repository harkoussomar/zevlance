import { cn } from "@/modules/shared";

interface EmptyStateProps {
    icon?: React.ReactNode;
    title: string;
    description?: string;
    action?: React.ReactNode;
    className?: string;
}

export function EmptyState({
    icon,
    title,
    description,
    action,
    className,
}: EmptyStateProps) {
    return (
        <div
            className={cn(
                "flex flex-col items-center justify-center text-center py-16 px-4",
                className,
            )}
        >
            {icon && (
                <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center text-muted-foreground mb-4">
                    {icon}
                </div>
            )}
            <h3 className="text-base font-bold text-foreground mb-1.5">
                {title}
            </h3>
            {description && (
                <p className="text-sm text-muted-foreground max-w-sm mb-5">
                    {description}
                </p>
            )}
            {action}
        </div>
    );
}
