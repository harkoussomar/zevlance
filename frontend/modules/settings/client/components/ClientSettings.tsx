import { Alert, AlertDescription } from "@/modules/shared/components/alert";
import { useState } from "react";
import {
    ChangePasswordForm,
    ClientSectionId,
    NavItem,
    SectionPanel,
    SettingsSidebar,
    SettingsSkeleton,
} from "../../shared";
import { useMyClientProfile } from "@/modules/profile/client";
import { ClientSettingsForm } from "./ClientSettingsForm";
import { Lock, UserCircle } from "lucide-react";

const CLIENT_NAV: NavItem<ClientSectionId>[] = [
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
];

export function ClientSettings() {
    const [section, setSection] = useState<ClientSectionId>("profile");
    const { data: profile, isPending, isError } = useMyClientProfile();

    if (isPending) return <SettingsSkeleton />;
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
                items={CLIENT_NAV}
                active={section}
                onSelect={setSection}
            />

            <SectionPanel sectionId={section}>
                {section === "profile" && <ClientSettingsForm />}
                {section === "account" && <ChangePasswordForm />}
            </SectionPanel>
        </div>
    );
}
