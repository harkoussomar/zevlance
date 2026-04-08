// ─── features/profile/index.ts ────────────────────────────────────────────────
//
// Public API surface for the profile feature module.
// Never import internal paths (hooks/, services/, etc.) from outside this module.


// ─── Reusable sub-components (composable by other modules) ────────────────────
export { ProfileHero } from "./components/ProfileHero";
export { ProfileReviewCard, StarDisplay } from "./components/ProfileReviewCard";
export { ProfileReviewsSection } from "./components/ProfileReviewsSection";
export { ProfileStatCard } from "./components/ProfileStatCard";

// ─── Hooks ────────────────────────────────────────────────────────────────────
export {
    useMyClientProfile,
    useMyFreelancerProfile,
    useFreelancerProfile,
    useFreelancerProfileReviews,
    useClientProfileReviews,
} from "./hooks/useProfile";

// ─── Types ────────────────────────────────────────────────────────────────────
export type {
    FreelancerProfileResponse,
    ClientProfileResponse,
    BasicProfileResponse,
} from "./types";
