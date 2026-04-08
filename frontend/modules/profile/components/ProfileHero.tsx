
import { Globe, Mail, Star, BadgeCheck } from "lucide-react";
import { Avatar } from "@/modules/shared/components/avatar";
import { Separator } from "@/modules/shared/components/separator";
import { RoleBadge } from "@/modules/shared/components/badge";
import { cn } from "@/modules/shared";

// ─── Inline star rating display ───────────────────────────────────────────────

function RatingDisplay({ rating, count }: { rating: number; count?: number }) {
    const filled = Math.round(rating);
    return (
        <div className="flex items-center gap-1.5">
            <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((n) => (
                    <Star
                        key={n}
                        className={cn(
                            "w-4 h-4",
                            n <= filled
                                ? "text-amber-400 fill-amber-400"
                                : "text-muted-foreground/25",
                        )}
                    />
                ))}
            </div>
            <span className="text-sm font-semibold text-foreground">
                {rating.toFixed(1)}
            </span>
            {count != null && (
                <span className="text-xs text-muted-foreground">
                    ({count} review{count !== 1 ? "s" : ""})
                </span>
            )}
        </div>
    );
}

// ─── ProfileHero ──────────────────────────────────────────────────────────────

interface ProfileHeroProps {
    name: string;
    email: string;
    profilePicture?: string | null;
    role: "FREELANCER" | "CLIENT";
    /** e.g. "Full Stack Developer" for freelancer or "OmarTech" for client */
    headline?: string | null;
    bio?: string | null;
    website?: string | null;
    rating?: number | null;
    reviewCount?: number;
    /** Whether this is the viewer's own profile */
    isOwn?: boolean;
    /** Extra slot rendered in the top-right (e.g. Edit button, hire button) */
    action?: React.ReactNode;
}

export function ProfileHero({
    name,
    email,
    profilePicture,
    role,
    headline,
    bio,
    website,
    rating,
    reviewCount,
    isOwn,
    action,
}: ProfileHeroProps) {
    return (
        <div className="relative rounded-2xl border border-border bg-card overflow-hidden">
            {/* Top gradient strip — role-aware */}
            <div
                className={cn(
                    "h-24 w-full",
                    role === "FREELANCER"
                        ? "bg-linear-to-r from-emerald-500/20 via-emerald-500/10 to-transparent dark:from-emerald-500/15"
                        : "bg-linear-to-r from-blue-500/20 via-blue-500/10 to-transparent dark:from-blue-500/15",
                )}
            />

            {/* Content — overlapping the strip */}
            <div className="px-6 pb-6 -mt-10">
                {/* Avatar + action row */}
                <div className="flex items-end justify-between gap-4">
                    {/* Avatar with ring */}
                    <div
                        className={cn(
                            "rounded-full ring-4 ring-card",
                            role === "FREELANCER"
                                ? "shadow-emerald-500/20"
                                : "shadow-blue-500/20",
                        )}
                    >
                        <Avatar
                            name={name}
                            src={profilePicture ?? undefined}
                            size="xl"
                            className="w-20 h-20 text-2xl"
                        />
                    </div>

                    {/* Top-right slot */}
                    {action && <div className="shrink-0 pb-1">{action}</div>}
                </div>

                {/* Identity */}
                <div className="mt-3 space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                        <h1 className="text-xl font-bold text-foreground leading-tight">
                            {name}
                        </h1>
                        {isOwn && (
                            <BadgeCheck className="w-4.5 h-4.5 text-primary shrink-0" />
                        )}
                        <RoleBadge role={role} />
                    </div>

                    {headline && (
                        <p className="text-sm font-medium text-muted-foreground">
                            {headline}
                        </p>
                    )}

                    {/* Meta row */}
                    <div className="flex items-center gap-4 flex-wrap pt-0.5">
                        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Mail className="w-3.5 h-3.5 shrink-0" />
                            {email}
                        </span>

                        {website && (
                            <>
                                <Separator
                                    orientation="vertical"
                                    className="h-3.5"
                                />
                                <a
                                    href={website}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1.5 text-xs text-primary hover:underline underline-offset-2"
                                >
                                    <Globe className="w-3.5 h-3.5 shrink-0" />
                                    {website.replace(/^https?:\/\//, "")}
                                </a>
                            </>
                        )}
                    </div>
                </div>

                {/* Rating bar */}
                {rating != null && rating > 0 && (
                    <div className="mt-3 pt-3 border-t border-border/60">
                        <RatingDisplay rating={rating} count={reviewCount} />
                    </div>
                )}

                {/* Bio */}
                {bio && (
                    <p className="mt-3 text-sm text-muted-foreground leading-relaxed max-w-2xl">
                        {bio}
                    </p>
                )}
            </div>
        </div>
    );
}
