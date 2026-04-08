import * as React from "react";
import { cn } from "@/modules/shared";

/* ─── SectionLabel ───────────────────────────────────────────────────────────
   The decorative section eyebrow used in FeaturesSection, TestimonialsSection,
   HowItWorksSection. Single source of truth — no more inline duplication.
   ─────────────────────────────────────────────────────────────────────────── */

interface SectionLabelProps extends React.ComponentProps<"div"> {
    children: React.ReactNode;
    /**
     * Which side the line is drawn on.
     * @default "left"
     */
    align?: "left" | "center";
    /**
     * Colour of the line and text.
     * @default "primary"
     */
    color?: "primary" | "muted";
}

function SectionLabel({
    children,
    className,
    align = "left",
    color = "primary",
    ...props
}: SectionLabelProps) {
    return (
        <div
            data-slot="section-label"
            className={cn(
                "flex items-center gap-3 mb-4",
                align === "center" && "justify-center",
                className,
            )}
            {...props}
        >
            <div
                className={cn(
                    "h-px w-8 shrink-0",
                    color === "primary" ? "bg-primary" : "bg-border",
                )}
            />
            <span
                className={cn(
                    "text-xs font-bold tracking-widest uppercase",
                    color === "primary"
                        ? "text-primary"
                        : "text-muted-foreground",
                )}
            >
                {children}
            </span>
        </div>
    );
}

export { SectionLabel };
export type { SectionLabelProps };
