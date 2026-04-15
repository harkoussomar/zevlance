"use client";
import { Alert, AlertDescription } from "@/modules/shared/components/alert";
import { useMyClientProfile } from "@/modules/profile/client";
import { useMyFreelancerProfile } from "@/modules/profile/freelancer";
import { ClientSettings } from "../../client";
import { StripeReturnIntent } from "../types/settings.shared";
import { SettingsSkeleton } from "./SettingsSkeleton";
import { FreelancerSettings } from "../../freelancer";

export function SettingsPage({
    stripeIntent,
}: {
    stripeIntent: StripeReturnIntent | null;
}) {
    const client = useMyClientProfile();
    const freelancer = useMyFreelancerProfile();

    console.log("isloading", client.isPending);

    if (client.isLoading || freelancer.isLoading) return <SettingsSkeleton />;
    if (client.data) return <ClientSettings />;
    if (freelancer.data)
        return <FreelancerSettings stripeIntent={stripeIntent} />;

    return (
        <Alert variant="destructive">
            <AlertDescription>
                Failed to load settings. Please refresh the page.
            </AlertDescription>
        </Alert>
    );
}
