import { Alert, AlertDescription } from "@/modules/shared/components/alert";
import {
  ChangePasswordForm,
    FreelancerSectionId,
    NavItem,
    SettingsSkeleton,
    StripeReturnIntent,
} from "../../shared";
import { useState } from "react";
import { SettingsSidebar } from "../../shared/components/SettingsSidebar";
import { SectionPanel } from "../../shared/components/SectionPanel";
import { StripeConnectSection } from "../../client/components/StripeConnectSection";
import { FreelancerSettingsForm } from "./FreelancerSettingsForm";
import { CreditCard, Lock, UserCircle } from "lucide-react";
import { useMyFreelancerProfile } from "@/modules/profile/freelancer";

const FREELANCER_NAV: NavItem<FreelancerSectionId>[] = [
    {
        id: "profile",
        label: "Profile",
        icon: UserCircle,
        description: "Public info & appearance",
    },
    {
        id: "account",
        label: "Account",
        icon: Lock,
        description: "Password & security",
    },
    {
        id: "payments",
        label: "Payments",
        icon: CreditCard,
        description: "Stripe payout account",
    },
];

export function FreelancerSettings({
    stripeIntent,
}: {
    stripeIntent: StripeReturnIntent | null;
}) {
    const [section, setSection] = useState<FreelancerSectionId>("profile");
    const { data: profile, isPending, isError } = useMyFreelancerProfile();

    if (isPending) return <SettingsSkeleton itemCount={3} />;
    if (isError || !profile) {
        return (
            <Alert variant="destructive">
                <AlertDescription>
                    Failed to load settings. Please refresh.
                </AlertDescription>
            </Alert>
        );
    }

    return (
        <div className="flex gap-8">
            <SettingsSidebar
                items={FREELANCER_NAV}
                active={section}
                onSelect={setSection}
            />

            <SectionPanel sectionId={section}>
                {section === "profile" && <FreelancerSettingsForm />}
                {section === "account" && <ChangePasswordForm />}
                {section === "payments" && (
                    <StripeConnectSection stripeIntent={stripeIntent} />
                )}
            </SectionPanel>
        </div>
    );
}
