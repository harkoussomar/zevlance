import { ClientSectionId, FreelancerSectionId } from "../types/settings.shared";

const SECTION_META: Record<
    ClientSectionId | FreelancerSectionId,
    { title: string; description: string }
> = {
    profile: {
        title: "Profile",
        description: "Update your public-facing info and appearance.",
    },
    account: {
        title: "Account security",
        description: "Manage your password and keep your account secure.",
    },
    payments: {
        title: "Payments",
        description: "Connect your bank account to receive milestone payouts.",
    },
};

export function SectionPanel({
    sectionId,
    children,
}: {
    sectionId: ClientSectionId | FreelancerSectionId;
    children: React.ReactNode;
}) {
    const { title, description } = SECTION_META[sectionId];

    return (
        <main className="min-w-0 flex-1">
            {/* Section header */}
            <div className="mb-5 pb-5 border-b border-border">
                <h2 className="text-base font-semibold text-foreground">
                    {title}
                </h2>
                <p className="mt-0.5 text-sm text-muted-foreground">
                    {description}
                </p>
            </div>

            {children}
        </main>
    );
}