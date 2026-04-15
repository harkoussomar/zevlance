
export interface UpdatePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface NavItem<T extends string> {
    id: T;
    label: string;
    icon: React.ElementType;
    description: string;
}

export type StripeReturnIntent = "success" | "refresh";


export type SettingsSectionId = ClientSectionId | FreelancerSectionId;
export type ClientSectionId = "profile" | "account";
export type FreelancerSectionId = "profile" | "account" | "payments";