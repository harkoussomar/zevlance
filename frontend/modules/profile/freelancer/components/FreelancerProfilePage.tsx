// ─── features/profile/components/FreelancerProfilePage.tsx ────────────────────
//
// Async RSC — no client boundary needed (pure data fetch + render).
//
// Usage:
//   <FreelancerProfilePage isOwn />                   ← own profile
//   <FreelancerProfilePage freelancerId="09104f6e-…"  ← public view

import { notFound, redirect } from "next/navigation";
import { DollarSign, Star, Briefcase, Award, Code } from "lucide-react";

import { Alert } from "@/modules/shared/components/alert";
import { Tag, TagGroup } from "@/modules/shared/components/tag";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/modules/shared/components/card";

import { ServerFetchError } from "@/modules/shared/lib/server-fetch";
import {
    ProfileHero,
    ProfileStatCard,
    ProfileReviewsSection,
} from "../../shared";

import type { FreelancerProfileResponse } from "../types/profile.freelancer";
import { getMyFreelancerProfileServer } from "../services/profile.freelancer.server";
import {
    getFreelancerProfileServer,
    getFreelancerReviewsServer,
} from "../../public/services/profile.public.server";
import type { ReviewResponse } from "@/modules/review";

// ─── Props ────────────────────────────────────────────────────────────────────

type FreelancerProfilePageProps =
    | { isOwn: true; freelancerId?: never }
    | { isOwn?: false; freelancerId: string };

// ─── Inner layout — shared between own + public ───────────────────────────────

function FreelancerProfileContent({
    profile,
    reviews,
    isOwn,
}: {
    profile: FreelancerProfileResponse;
    reviews: ReviewResponse[];
    isOwn: boolean;
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
                role="FREELANCER"
                headline={
                    profile.hourlyRate ? `$${profile.hourlyRate}/hr` : undefined
                }
                bio={profile.bio}
                rating={displayRating}
                reviewCount={reviews.length}
                isOwn={isOwn}
            />

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <ProfileStatCard
                    icon={Star}
                    label="Average Rating"
                    value={
                        displayRating != null ? displayRating.toFixed(1) : "—"
                    }
                    subLabel="out of 5"
                    iconBg="bg-amber-500/10"
                    iconColor="text-amber-500"
                />
                <ProfileStatCard
                    icon={Briefcase}
                    label="Completed Contracts"
                    value={profile.completedContracts}
                    iconBg="bg-emerald-500/10"
                    iconColor="text-emerald-600"
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
                {/* Left: Skills + rate */}
                <div className="space-y-5">
                    {profile.hourlyRate != null && (
                        <Card>
                            <CardHeader className="pb-2 pt-5 px-5">
                                <CardTitle className="text-sm flex items-center gap-2">
                                    <DollarSign className="w-4 h-4 text-muted-foreground" />
                                    Hourly Rate
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="px-5 pb-5">
                                <p className="text-2xl font-bold text-foreground">
                                    ${profile.hourlyRate}
                                    <span className="text-sm font-normal text-muted-foreground ml-1">
                                        / hour
                                    </span>
                                </p>
                            </CardContent>
                        </Card>
                    )}
                    <Card>
                        <CardHeader className="pb-2 pt-5 px-5">
                            <CardTitle className="text-sm flex items-center gap-2">
                                <Code className="w-4 h-4 text-muted-foreground" />
                                Skills
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="px-5 pb-5">
                            {profile.skills.length > 0 ? (
                                <TagGroup>
                                    {profile.skills.map((skill) => (
                                        <Tag key={skill} variant="primary">
                                            {skill}
                                        </Tag>
                                    ))}
                                </TagGroup>
                            ) : (
                                <p className="text-sm text-muted-foreground">
                                    No skills listed yet.
                                </p>
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

export async function FreelancerProfilePage(props: FreelancerProfilePageProps) {
    if (props.isOwn) {
        let profile: FreelancerProfileResponse;

        try {
            profile = await getMyFreelancerProfileServer();
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

        // Reviews fetched after profile resolves (need the ID).
        // Non-critical — degrade gracefully if it fails.
        const reviews = await getFreelancerReviewsServer(profile.id).catch(
            () => [],
        );

        return (
            <FreelancerProfileContent
                profile={profile}
                reviews={reviews}
                isOwn
            />
        );
    }

    // ── Public view ──────────────────────────────────────────────────────────
    const { freelancerId } = props;

    // Fetch profile + reviews in parallel — both are public endpoints.
    const [profileResult, reviewsResult] = await Promise.allSettled([
        getFreelancerProfileServer(freelancerId),
        getFreelancerReviewsServer(freelancerId),
    ]);

    if (profileResult.status === "rejected") {
        const err = profileResult.reason;
        if (err instanceof ServerFetchError && err.status === 404) notFound();
        return (
            <Alert variant="destructive">
                Freelancer profile not found or failed to load.
            </Alert>
        );
    }

    return (
        <FreelancerProfileContent
            profile={profileResult.value}
            reviews={
                reviewsResult.status === "fulfilled" ? reviewsResult.value : []
            }
            isOwn={false}
        />
    );
}
