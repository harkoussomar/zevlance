// ─── features/settings/components/SettingsPage.tsx ────────────────────────────

"use client";

import { useState } from "react";
import { UserCircle, Lock, CreditCard, ChevronRight } from "lucide-react";

import { ClientSettingsForm } from "./ClientSettingsForm";
import { FreelancerSettingsForm } from "./FreelancerSettingsForm";
import { ChangePasswordForm } from "./ChangePasswordForm";
import { StripeConnectSection } from "./StripeConnectSection";
import { cn } from "@/modules/shared";
import { Separator } from "@/modules/shared/components/separator";
import { Skeleton } from "@/modules/shared/components/skeleton";
import { Alert } from "@/modules/shared/components/alert";
import {
  useMyClientProfile,
  useMyFreelancerProfile,
} from "@/modules/profile/hooks/useProfile";
import { StripeReturnIntent } from "@/app/(dashboard)/settings/page";

// ─── Nav types ────────────────────────────────────────────────────────────────

type ClientSectionId = "profile" | "account";
type FreelancerSectionId = "profile" | "account" | "payments";

interface NavItem<T extends string> {
  id: T;
  label: string;
  icon: React.ElementType;
  hint: string;
}

const CLIENT_NAV: NavItem<ClientSectionId>[] = [
  { id: "profile", label: "Profile", icon: UserCircle, hint: "Public info & appearance" },
  { id: "account", label: "Account", icon: Lock,       hint: "Password & security" },
];

const FREELANCER_NAV: NavItem<FreelancerSectionId>[] = [
  { id: "profile",  label: "Profile",  icon: UserCircle,  hint: "Public info & appearance" },
  { id: "account",  label: "Account",  icon: Lock,        hint: "Password & security" },
  { id: "payments", label: "Payments", icon: CreditCard,  hint: "Stripe payout account" },
];

// ─── Sidebar nav (generic) ────────────────────────────────────────────────────

function SettingsSidebar<T extends string>({
  items,
  active,
  onSelect,
}: {
  items: NavItem<T>[];
  active: T;
  onSelect: (id: T) => void;
}) {
  return (
    <nav className="space-y-1">
      {items.map(({ id, label, icon: Icon, hint }) => {
        const isActive = active === id;
        return (
          <button
            key={id}
            type="button"
            onClick={() => onSelect(id)}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors",
              isActive
                ? "bg-primary/8 text-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            <Icon
              className={cn("w-4 h-4 shrink-0", isActive && "text-primary")}
            />
            <div className="flex-1 min-w-0">
              <p
                className={cn(
                  "text-sm font-medium",
                  isActive && "text-foreground",
                )}
              >
                {label}
              </p>
              <p className="text-xs text-muted-foreground truncate">{hint}</p>
            </div>
            {isActive && (
              <ChevronRight className="w-3.5 h-3.5 text-primary shrink-0" />
            )}
          </button>
        );
      })}
    </nav>
  );
}

// ─── Section panel ────────────────────────────────────────────────────────────

function SectionPanel({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex-1 min-w-0">
      <div className="mb-5">
        <h2 className="text-base font-semibold text-foreground">{title}</h2>
        <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
      </div>
      <Separator className="mb-5" />
      {children}
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function SettingsSkeleton() {
  return (
    <div className="flex gap-8">
      <div className="w-52 shrink-0 space-y-2">
        {[1, 2].map((n) => (
          <Skeleton key={n} className="h-12 rounded-lg" />
        ))}
      </div>
      <div className="flex-1 space-y-4">
        <Skeleton className="h-5 w-36" />
        <Skeleton className="h-px w-full" />
        {[1, 2, 3, 4].map((n) => (
          <Skeleton key={n} className="h-12 rounded-md" />
        ))}
      </div>
    </div>
  );
}

// ─── Role-specific settings ───────────────────────────────────────────────────

function ClientSettings() {
  const [section, setSection] = useState<ClientSectionId>("profile");
  const { data: profile, isPending, isError } = useMyClientProfile();

  if (isPending) return <SettingsSkeleton />;
  if (isError || !profile) {
    return (
      <Alert variant="destructive">
        Failed to load settings. Please refresh.
      </Alert>
    );
  }

  return (
    <div className="flex gap-8">
      <div className="w-52 shrink-0">
        <SettingsSidebar
          items={CLIENT_NAV}
          active={section}
          onSelect={setSection}
        />
      </div>

      {section === "profile" && (
        <SectionPanel
          title="Profile"
          description="Update your public-facing info and company details."
        >
          <ClientSettingsForm />
        </SectionPanel>
      )}

      {section === "account" && (
        <SectionPanel
          title="Account security"
          description="Change your password. We recommend a strong, unique password."
        >
          <ChangePasswordForm />
        </SectionPanel>
      )}
    </div>
  );
}

function FreelancerSettings({stripeIntent}:{
  stripeIntent: StripeReturnIntent | null;
}) {
  const [section, setSection] = useState<FreelancerSectionId>("profile");
  const { data: profile, isPending, isError } = useMyFreelancerProfile();

  if (isPending) return <SettingsSkeleton />;
  if (isError || !profile) {
    return (
      <Alert variant="destructive">
        Failed to load settings. Please refresh.
      </Alert>
    );
  }

  return (
    <div className="flex gap-8">
      <div className="w-52 shrink-0">
        <SettingsSidebar
          items={FREELANCER_NAV}
          active={section}
          onSelect={setSection}
        />
      </div>

      {section === "profile" && (
        <SectionPanel
          title="Profile"
          description="Update your public profile, bio, skills, and rate."
        >
          <FreelancerSettingsForm />
        </SectionPanel>
      )}

      {section === "account" && (
        <SectionPanel
          title="Account security"
          description="Change your password. We recommend a strong, unique password."
        >
          <ChangePasswordForm />
        </SectionPanel>
      )}
      

      {section === "payments" && (
        <SectionPanel
          title="Payments"
          description="Connect your bank account to receive milestone payouts via Stripe."
        >
          <StripeConnectSection stripeIntent={stripeIntent} />
        </SectionPanel>
      )}
    </div>
  );
}

// ─── Exported page — role-aware ───────────────────────────────────────────────

export function SettingsPage({stripeIntent}: {
  stripeIntent: StripeReturnIntent | null;
}) {
  const client = useMyClientProfile();
  const freelancer = useMyFreelancerProfile();

  if (client.data) return <ClientSettings />;
  if (freelancer.data) return <FreelancerSettings stripeIntent={stripeIntent} />;
  if (client.isPending || freelancer.isPending) return <SettingsSkeleton />;

  return (
    <Alert variant="destructive">
      Failed to load settings. Please refresh the page.
    </Alert>
  );
}