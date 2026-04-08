import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/modules/shared";
import { ProjectCategory, ProjectStatus } from "@/modules/projects/types";
import { Role } from "@/modules/shared/types";

/* ─── Variants ───────────────────────────────────────────────────────────── */

const badgeVariants = cva(
    [
        "inline-flex shrink-0 items-center gap-1.5 font-semibold border",
        "transition-colors duration-[var(--duration-fast)]",
        "[&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-3",
    ],
    {
        variants: {
            variant: {
                /* ── Brand ── */
                default:
                    "bg-primary/10 text-primary border-primary/20 dark:bg-primary/15 dark:border-primary/25",
                secondary:
                    "bg-secondary text-secondary-foreground border-transparent",
                outline: "bg-transparent text-foreground border-border",
                ghost: "bg-muted/60 text-muted-foreground border-transparent",

                /* ── Semantic status ── */
                success: "bg-success/10 text-success border-success/20",
                warning: "bg-warning/10 text-warning border-warning/20",
                destructive:
                    "bg-destructive/10 text-destructive border-destructive/20",
                info: "bg-info/10 text-info border-info/20",

                /* ── Role ── */
                "role-client":
                    "bg-role-client/10 text-role-client border-role-client/20",
                "role-freelancer":
                    "bg-role-freelancer/10 text-role-freelancer border-role-freelancer/20",
                "role-admin":
                    "bg-role-admin/10 text-role-admin border-role-admin/20",

                /* ── Project category ── */
                "cat-web":
                    "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
                "cat-mobile":
                    "bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20",
                "cat-design":
                    "bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-500/20",
                "cat-data":
                    "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
                "cat-devops":
                    "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20",
                "cat-writing":
                    "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
                "cat-marketing":
                    "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20",
                "cat-other":
                    "bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/20",
            },

            size: {
                xs: "text-[9px] tracking-wide px-1 py-px rounded-[4px] leading-4",
                sm: "text-[10px] tracking-wide px-1.5 py-0.5 rounded-md leading-4",
                default: "text-xs px-2 py-0.5 rounded-md leading-5",
                lg: "text-xs px-2.5 py-1 rounded-lg leading-5",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
        },
    },
);

/* ─── Props ──────────────────────────────────────────────────────────────── */

export interface BadgeProps
    extends React.ComponentProps<"span">, VariantProps<typeof badgeVariants> {
    /** Show a status dot on the left */
    dot?: boolean;
    /** Animate the dot with a ping effect */
    pulse?: boolean;
    /** Apply uppercase + tracking-widest */
    uppercase?: boolean;
    /** Optional icon on the left (before dot) */
    icon?: React.ReactNode;
}

/* ─── Component ──────────────────────────────────────────────────────────── */

function Badge({
    className,
    variant,
    size,
    dot,
    pulse = false,
    uppercase = false,
    icon,
    children,
    ...props
}: BadgeProps) {
    return (
        <span
            data-slot="badge"
            className={cn(
                badgeVariants({ variant, size }),
                uppercase && "tracking-widest uppercase",
                className,
            )}
            {...props}
        >
            {icon && <span className="shrink-0">{icon}</span>}

            {dot && (
                <span className="relative flex h-1.5 w-1.5 shrink-0">
                    {pulse && (
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-current opacity-75" />
                    )}
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-current" />
                </span>
            )}

            {children}
        </span>
    );
}

const STATUS_PROPS: Record<
    ProjectStatus,
    Pick<BadgeProps, "variant" | "dot" | "pulse" | "uppercase"> & {
        label: string;
    }
> = {
    OPEN: {
        variant: "success",
        dot: true,
        pulse: true,
        uppercase: true,
        label: "Open",
    },
    IN_PROGRESS: {
        variant: "info",
        dot: true,
        pulse: false,
        uppercase: true,
        label: "In Progress",
    },
    COMPLETED: {
        variant: "ghost",
        dot: false,
        pulse: false,
        uppercase: true,
        label: "Completed",
    },
    CANCELLED: {
        variant: "destructive",
        dot: false,
        pulse: false,
        uppercase: true,
        label: "Cancelled",
    },
};

function StatusBadge({
    status,
    size,
}: {
    status: ProjectStatus;
    size?: BadgeProps["size"];
}) {
    const { label, ...badgeProps } = STATUS_PROPS[status];
    return (
        <Badge {...badgeProps} size={size ?? "sm"}>
            {label}
        </Badge>
    );
}

const CATEGORY_PROPS: Record<
    ProjectCategory,
    Pick<BadgeProps, "variant"> & { label: string }
> = {
    WEB_DEV: { variant: "cat-web", label: "Web Dev" },
    MOBILE: { variant: "cat-mobile", label: "Mobile" },
    DESIGN: { variant: "cat-design", label: "Design" },
    DATA_SCIENCE: { variant: "cat-data", label: "Data Science" },
    DEVOPS: { variant: "cat-devops", label: "DevOps" },
    WRITING: { variant: "cat-writing", label: "Writing" },
    MARKETING: { variant: "cat-marketing", label: "Marketing" },
    OTHER: { variant: "cat-other", label: "Other" },
};

function CategoryBadge({
    category,
    size,
}: {
    category: ProjectCategory;
    size?: BadgeProps["size"];
}) {
    const { label, ...badgeProps } = CATEGORY_PROPS[category];
    return (
        <Badge {...badgeProps} size={size ?? "sm"} uppercase>
            {label}
        </Badge>
    );
}

const ROLE_PROPS: Record<Role, Pick<BadgeProps, "variant">> = {
    CLIENT: { variant: "role-client" },
    FREELANCER: { variant: "role-freelancer" },
    ADMIN: { variant: "role-admin" },
};

function RoleBadge({ role, size }: { role: Role; size?: BadgeProps["size"] }) {
    return (
        <Badge {...ROLE_PROPS[role]} size={size ?? "sm"} uppercase>
            {role}
        </Badge>
    );
}

/* ─── Exports ────────────────────────────────────────────────────────────── */
export { Badge, StatusBadge, CategoryBadge, RoleBadge, badgeVariants };
