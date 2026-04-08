import type { Role } from "@/modules/shared/types";

export const ROLE_REDIRECT: Record<Role, string> = {
    CLIENT: "/client",
    FREELANCER: "/freelancer",
    ADMIN: "/admin",
};
