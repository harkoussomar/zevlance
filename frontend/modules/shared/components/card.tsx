import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/modules/shared";

/* ─── Card ───────────────────────────────────────────────────────────────────
   Replaces the scattered `rounded-xl border border-border bg-card` patterns.
   ─────────────────────────────────────────────────────────────────────────── */

const cardVariants = cva(
    "relative rounded-xl border bg-card text-card-foreground",
    {
        variants: {
            variant: {
                default: "border-border",
                interactive: [
                    "border-border cursor-pointer",
                    "hover:border-primary/30 hover:shadow-[var(--shadow-lg)] hover:-translate-y-0.5",
                    "transition-all duration-[var(--duration-base)] ease-[var(--ease-standard)]",
                ],
                elevated: "border-border shadow-[var(--shadow-md)]",
                inset: "border-border bg-muted/30",
                ghost: "border-transparent bg-transparent shadow-none",
                dark: "border-border bg-foreground text-background",
            },
            padding: {
                none: "",
                xs: "p-3",
                sm: "p-4",
                default: "p-6",
                lg: "p-8",
                xl: "p-10 md:p-12",
            },
            radius: {
                default: "rounded-xl",
                lg: "rounded-2xl",
                sm: "rounded-lg",
            },
        },
        defaultVariants: {
            variant: "default",
            padding: "default",
            radius: "default",
        },
    },
);

/* ─── Card root ──────────────────────────────────────────────────────────── */

function Card({
    className,
    variant,
    padding,
    radius,
    ...props
}: React.ComponentProps<"div"> & VariantProps<typeof cardVariants>) {
    return (
        <div
            data-slot="card"
            data-variant={variant}
            className={cn(
                cardVariants({ variant, padding, radius }),
                className,
            )}
            {...props}
        />
    );
}

/* ─── Card sub-components ────────────────────────────────────────────────── */

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
    return (
        <div
            data-slot="card-header"
            className={cn("flex flex-col gap-1.5 pb-4", className)}
            {...props}
        />
    );
}

function CardTitle({ className, ...props }: React.ComponentProps<"h3">) {
    return (
        <h3
            data-slot="card-title"
            className={cn(
                "text-base font-semibold leading-tight tracking-tight text-card-foreground",
                className,
            )}
            {...props}
        />
    );
}

function CardDescription({ className, ...props }: React.ComponentProps<"p">) {
    return (
        <p
            data-slot="card-description"
            className={cn(
                "text-sm text-muted-foreground leading-relaxed",
                className,
            )}
            {...props}
        />
    );
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
    return (
        <div
            data-slot="card-content"
            className={cn("", className)}
            {...props}
        />
    );
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
    return (
        <div
            data-slot="card-footer"
            className={cn(
                "-mx-6 -mb-6 px-6 pb-6 pt-4",
                "flex items-center gap-2",
                "border-t border-border mt-4",
                className,
            )}
            {...props}
        />
    );
}

/* ─── CardAccentBar — the top accent line on hover ──────────────────────── */
function CardAccentBar({
    color = "primary",
}: {
    color?: "primary" | "success" | "warning" | "destructive";
}) {
    const colorMap = {
        primary: "bg-primary",
        success: "bg-success",
        warning: "bg-warning",
        destructive: "bg-destructive",
    };
    return (
        <div
            aria-hidden
            className={cn(
                "absolute top-0 inset-x-6 h-px rounded-full",
                "opacity-0 group-hover:opacity-100 transition-opacity duration-(--duration-base)",
                colorMap[color],
            )}
        />
    );
}

export {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
    CardFooter,
    CardAccentBar,
    cardVariants,
};
