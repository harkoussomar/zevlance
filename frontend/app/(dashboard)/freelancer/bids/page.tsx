// app/(freelancer)/bids/page.tsx

import { FreelancerBidsPanel } from "@/modules/bid/components/FreelancerBidsPanel";

export const metadata = {
    title: "My Proposals",
    description: "Track and manage all your submitted project proposals.",
};

export default function BidsPage() {
    return <FreelancerBidsPanel />;
}
