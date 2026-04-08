import { ReactNode } from "react";
import type { Role } from "@/modules/shared/types";

export interface NavItem {
    label: string;
    href: string;
    icon: ReactNode;
    roles: Role[];
    badge?: number;
    exact?: boolean;
}

export interface SidebarProps {
    /** When true (mobile), hides the collapse toggle and forces expanded layout */
    isMobile?: boolean;
}

export interface MobileSidebarProps {
    open: boolean;
    onClose: () => void;
}
