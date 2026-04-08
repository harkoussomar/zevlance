import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/modules/shared";

/* ─── Tag ────────────────────────────────────────────────────────────────────
   Lightweight chip for skills, filters, and taxonomy labels.
   Distinct from Badge: Tags are dismissible, interactive, and content-neutral.
   Badges carry semantic status meaning.
   ─────────────────────────────────────────────────────────────────────────── */

const tagVariants = cva(
    [
        "inline-flex items-center gap-1 font-medium select-none",
        "transition-colors duration-[var(--duration-fast)]",
        "[&_svg:not([class*='size-'])]:size-3",
    ],
    {
        variants: {
            variant: {
                default: "bg-muted text-muted-foreground hover:bg-muted/80",
                primary:
                    "bg-primary/10 text-primary hover:bg-primary/15 border border-primary/20",
                outline:
                    "border border-border text-muted-foreground hover:border-primary/50 hover:text-primary bg-transparent",
                solid: "bg-secondary text-secondary-foreground",
            },
            size: {
                xs: "text-[9px]  px-1    py-px   rounded-[3px]",
                sm: "text-[10px] px-1.5  py-0.5  rounded-md",
                default: "text-xs    px-2    py-0.5  rounded-md",
                lg: "text-xs    px-2.5  py-1    rounded-lg",
            },
            interactive: {
                true: "cursor-pointer",
                false: "cursor-default",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
            interactive: false,
        },
    },
);

export interface TagProps
    extends
        Omit<React.ComponentProps<"span">, "onClick">,
        VariantProps<typeof tagVariants> {
    /** Show a remove (×) button */
    removable?: boolean;
    onRemove?: (e: React.MouseEvent) => void;
    onClick?: (e: React.MouseEvent<HTMLSpanElement>) => void;
    icon?: React.ReactNode;
}

function Tag({
    className,
    variant,
    size,
    interactive,
    removable,
    onRemove,
    onClick,
    icon,
    children,
    ...props
}: TagProps) {
    const isInteractive = interactive ?? (!!onClick || !!removable);

    return (
        <span
            data-slot="tag"
            role={onClick ? "button" : undefined}
            tabIndex={onClick ? 0 : undefined}
            className={cn(
                tagVariants({ variant, size, interactive: isInteractive }),
                className,
            )}
            onClick={onClick}
            onKeyDown={
                onClick
                    ? (e) => {
                          if (e.key === "Enter" || e.key === " ")
                              onClick(
                                  e as unknown as React.MouseEvent<HTMLSpanElement>,
                              );
                      }
                    : undefined
            }
            {...props}
        >
            {icon && <span className="shrink-0">{icon}</span>}
            <span>{children}</span>

            {removable && (
                <button
                    type="button"
                    data-slot="tag-remove"
                    aria-label={`Remove ${children}`}
                    className={cn(
                        "shrink-0 rounded-sm opacity-50 hover:opacity-100",
                        "transition-opacity duration-(--duration-fast)",
                        "ml-0.5 -mr-0.5",
                        "focus:outline-none focus:opacity-100",
                    )}
                    onClick={(e) => {
                        e.stopPropagation();
                        onRemove?.(e);
                    }}
                >
                    <svg
                        width="8"
                        height="8"
                        viewBox="0 0 8 8"
                        fill="none"
                        aria-hidden="true"
                    >
                        <path
                            d="M1.5 1.5L6.5 6.5M6.5 1.5L1.5 6.5"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                        />
                    </svg>
                </button>
            )}
        </span>
    );
}

/* ─── TagGroup ───────────────────────────────────────────────────────────── */
interface TagGroupProps {
    children: React.ReactNode;
    className?: string;
    gap?: "sm" | "default";
}

function TagGroup({ children, className, gap = "default" }: TagGroupProps) {
    return (
        <div
            data-slot="tag-group"
            className={cn(
                "flex flex-wrap items-center",
                gap === "sm" ? "gap-1" : "gap-1.5",
                className,
            )}
        >
            {children}
        </div>
    );
}

export { Tag, TagGroup, tagVariants };
