"use client";
import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/modules/shared";

/* ─── Avatar ─────────────────────────────────────────────────────────────────
   API is backward-compatible with existing Sidebar and Topbar usage:
     <Avatar name={profile.name} size="sm" />
   ─────────────────────────────────────────────────────────────────────────── */

const avatarVariants = cva(
    [
        "relative inline-flex shrink-0 select-none items-center justify-center",
        "rounded-full font-bold overflow-hidden",
        "transition-opacity duration-[var(--duration-fast)]",
    ],
    {
        variants: {
            size: {
                "2xs": "w-5 h-5 text-[8px]",
                xs: "w-6 h-6 text-[9px]",
                sm: "w-7 h-7 text-[10px]",
                default: "w-8 h-8 text-xs",
                md: "w-9 h-9 text-xs",
                lg: "w-10 h-10 text-sm",
                xl: "w-12 h-12 text-sm",
                "2xl": "w-16 h-16 text-base",
            },
        },
        defaultVariants: {
            size: "default",
        },
    },
);

/* ── Deterministic color from name ──────────────────────────────────────── */

const AVATAR_COLORS: Array<{ bg: string; text: string }> = [
    {
        bg: "bg-indigo-500/15 dark:bg-indigo-500/20",
        text: "text-indigo-600 dark:text-indigo-400",
    },
    {
        bg: "bg-emerald-500/15 dark:bg-emerald-500/20",
        text: "text-emerald-600 dark:text-emerald-400",
    },
    {
        bg: "bg-amber-500/15 dark:bg-amber-500/20",
        text: "text-amber-600 dark:text-amber-400",
    },
    {
        bg: "bg-rose-500/15 dark:bg-rose-500/20",
        text: "text-rose-600 dark:text-rose-400",
    },
    {
        bg: "bg-blue-500/15 dark:bg-blue-500/20",
        text: "text-blue-600 dark:text-blue-400",
    },
    {
        bg: "bg-violet-500/15 dark:bg-violet-500/20",
        text: "text-violet-600 dark:text-violet-400",
    },
    {
        bg: "bg-cyan-500/15 dark:bg-cyan-500/20",
        text: "text-cyan-600 dark:text-cyan-400",
    },
    {
        bg: "bg-pink-500/15 dark:bg-pink-500/20",
        text: "text-pink-600 dark:text-pink-400",
    },
];

function getAvatarColor(name: string) {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function getInitials(name: string): string {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return "?";
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (
        parts[0].charAt(0) + parts[parts.length - 1].charAt(0)
    ).toUpperCase();
}

/* ── Props ──────────────────────────────────────────────────────────────── */

export interface AvatarProps extends VariantProps<typeof avatarVariants> {
    name?: string;
    src?: string | null;
    className?: string;
    style?: React.CSSProperties;
}

/* ── Component ──────────────────────────────────────────────────────────── */

function Avatar({ name = "", src, size, className, style }: AvatarProps) {
    const { bg, text } = getAvatarColor(name);
    const initials = getInitials(name);
    const [imgError, setImgError] = React.useState(false);

    const showImage = !!src && !imgError;

    return (
        <div
            data-slot="avatar"
            className={cn(
                avatarVariants({ size }),
                !showImage && bg,
                !showImage && text,
                className,
            )}
            title={name}
            aria-label={name}
            style={style}
        >
            {showImage ? (
                <img
                    src={src}
                    alt={name}
                    className="h-full w-full object-cover"
                    onError={() => setImgError(true)}
                />
            ) : (
                <span aria-hidden="true">{initials}</span>
            )}
        </div>
    );
}

/* ─── AvatarGroup ────────────────────────────────────────────────────────── */

export interface AvatarGroupProps {
    items: Array<{ name: string; src?: string | null }>;
    max?: number;
    size?: AvatarProps["size"];
    className?: string;
}

function AvatarGroup({
    items,
    max = 4,
    size = "default",
    className,
}: AvatarGroupProps) {
    const visible = items.slice(0, max);
    const overflow = items.length - max;

    return (
        <div className={cn("flex -space-x-2", className)}>
            {visible.map((item, i) => (
                <Avatar
                    key={i}
                    name={item.name}
                    src={item.src}
                    size={size}
                    className="ring-2 ring-background"
                    style={{ zIndex: visible.length - i }}
                />
            ))}
            {overflow > 0 && (
                <div
                    className={cn(
                        avatarVariants({ size }),
                        "ring-2 ring-background bg-muted text-muted-foreground",
                    )}
                    style={{ zIndex: 0 }}
                    aria-label={`${overflow} more`}
                >
                    <span>+{overflow}</span>
                </div>
            )}
        </div>
    );
}

/* ─── AvatarWithLabel — used in Sidebar footer, profile cells ────────────── */

interface AvatarWithLabelProps extends AvatarProps {
    label: string;
    sublabel?: string;
    labelClassName?: string;
}

function AvatarWithLabel({
    label,
    sublabel,
    labelClassName,
    ...avatarProps
}: AvatarWithLabelProps) {
    return (
        <div className="flex items-center gap-3 min-w-0">
            <Avatar {...avatarProps} name={label} />
            <div className="flex-1 min-w-0">
                <p
                    className={cn(
                        "text-sm font-semibold text-foreground truncate",
                        labelClassName,
                    )}
                >
                    {label}
                </p>
                {sublabel && (
                    <p className="text-xs text-muted-foreground truncate">
                        {sublabel}
                    </p>
                )}
            </div>
        </div>
    );
}

export { Avatar, AvatarGroup, AvatarWithLabel, avatarVariants };
