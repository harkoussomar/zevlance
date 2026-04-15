import { redirect } from "next/navigation";
import {
    Building2,
    FileText,
    Star,
    MessageSquare,
    Award,
    Globe,
    AlignLeft,
} from "lucide-react";

import { Alert } from "@/modules/shared/components/alert";
import { Separator } from "@/modules/shared/components/separator";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/modules/shared/components/card";
import { Badge } from "@/modules/shared/components/badge";

import { ServerFetchError } from "@/modules/shared/lib/server-fetch";
import {
    ProfileHero,
    ProfileStatCard,
    ProfileReviewsSection,
} from "../../shared";

import type { ClientProfileResponse } from "../types/profile.client";
import Link from "next/link";
import { getMyClientProfileServer } from "../services/profile.client.server";
import { getClientReviewsServer } from "../../public/services/profile.public.server";
import type { ReviewResponse } from "@/modules/review";

// ─── Inner layout ─────────────────────────────────────────────────────────────

function ClientProfileContent({
    profile,
    reviews,
}: {
    profile: ClientProfileResponse;
    reviews: ReviewResponse[];
}) {
    const avgRating =
        reviews.length > 0
            ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
            : null;
    const fiveStarCount = reviews.filter((r) => r.rating === 5).length;
    const displayRating = profile.rating || avgRating;

    return (
        <div className="space-y-6">
            {/* Hero */}
            <ProfileHero
                name={profile.name}
                email={profile.email}
                profilePicture={profile.profilePicture}
                role="CLIENT"
                headline={profile.companyName ?? undefined}
                bio={profile.companyDescription ?? undefined}
                website={profile.website ?? undefined}
                rating={displayRating}
                reviewCount={reviews.length}
                isOwn
            />

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <ProfileStatCard
                    icon={Star}
                    label="Average Rating"
                    value={
                        displayRating != null ? displayRating.toFixed(1) : "—"
                    }
                    subLabel="from freelancers"
                    iconBg="bg-amber-500/10"
                    iconColor="text-amber-500"
                />
                <ProfileStatCard
                    icon={FileText}
                    label="Projects Posted"
                    value={profile.postedProjects}
                    iconBg="bg-blue-500/10"
                    iconColor="text-blue-600"
                />
                <ProfileStatCard
                    icon={Award}
                    label="5-Star Reviews"
                    value={fiveStarCount}
                    iconBg="bg-primary/10"
                    iconColor="text-primary"
                    className="col-span-2 sm:col-span-1"
                />
            </div>

            {/* Main grid */}
            <div className="grid lg:grid-cols-3 gap-6">
                {/* Left: Company info */}
                <div className="space-y-5">
                    <Card>
                        <CardHeader className="pb-2 pt-5 px-5">
                            <CardTitle className="text-sm flex items-center gap-2">
                                <Building2 className="w-4 h-4 text-muted-foreground" />
                                Company Info
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="px-5 pb-5 space-y-4">
                            {profile.companyName ? (
                                <div>
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">
                                        Company
                                    </p>
                                    <p className="text-sm font-semibold text-foreground">
                                        {profile.companyName}
                                    </p>
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground italic">
                                    No company name listed.
                                </p>
                            )}
                            {profile.website && (
                                <>
                                    <Separator />
                                    <div>
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">
                                            Website
                                        </p>
                                        <Link
                                            href={profile.website}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-1.5 text-sm text-primary hover:underline underline-offset-2"
                                        >
                                            <Globe className="w-3.5 h-3.5 shrink-0" />
                                            {profile.website.replace(
                                                /^https?:\/\//,
                                                "",
                                            )}
                                        </Link>
                                    </div>
                                </>
                            )}
                            {profile.companyDescription && (
                                <>
                                    <Separator />
                                    <div>
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1.5">
                                            About
                                        </p>
                                        <p className="text-sm text-muted-foreground leading-relaxed">
                                            {profile.companyDescription}
                                        </p>
                                    </div>
                                </>
                            )}
                            {!profile.companyName &&
                                !profile.website &&
                                !profile.companyDescription && (
                                    <div className="flex items-start gap-2 text-xs text-muted-foreground bg-muted/50 rounded-lg p-3">
                                        <AlignLeft className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                                        <p>
                                            Your company info helps freelancers
                                            understand who they&apos;d be
                                            working with. Add details in
                                            Settings.
                                        </p>
                                    </div>
                                )}
                        </CardContent>
                    </Card>

                    {/* Reputation card */}
                    <Card>
                        <CardHeader className="pb-2 pt-5 px-5">
                            <CardTitle className="text-sm flex items-center gap-2">
                                <MessageSquare className="w-4 h-4 text-muted-foreground" />
                                Reputation
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="px-5 pb-5 space-y-2.5">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">
                                    Reviews received
                                </span>
                                <Badge
                                    variant="secondary"
                                    className="font-mono"
                                >
                                    {reviews.length}
                                </Badge>
                            </div>
                            <Separator />
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">
                                    Avg. rating
                                </span>
                                <span className="font-semibold text-foreground">
                                    {avgRating != null ? (
                                        <span className="flex items-center gap-1">
                                            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                                            {avgRating.toFixed(1)}
                                        </span>
                                    ) : (
                                        "—"
                                    )}
                                </span>
                            </div>
                            {profile.postedProjects > 0 && (
                                <>
                                    <Separator />
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-muted-foreground">
                                            Projects posted
                                        </span>
                                        <Badge
                                            variant="secondary"
                                            className="font-mono"
                                        >
                                            {profile.postedProjects}
                                        </Badge>
                                    </div>
                                </>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Right: Reviews */}
                <div className="lg:col-span-2">
                    <ProfileReviewsSection reviews={reviews} />
                </div>
            </div>
        </div>
    );
}

// ─── Exported page ────────────────────────────────────────────────────────────

export async function ClientProfilePage() {
    let profile: ClientProfileResponse;

    try {
        profile = await getMyClientProfileServer();
    } catch (e) {
        if (
            e instanceof ServerFetchError &&
            (e.status === 401 || e.status === 403)
        ) {
            redirect("/login");
        }
        return (
            <Alert variant="destructive">
                Failed to load your profile. Please refresh.
            </Alert>
        );
    }

    const reviews = await getClientReviewsServer(profile.id).catch(() => []);

    return <ClientProfileContent profile={profile} reviews={reviews} />;
}
