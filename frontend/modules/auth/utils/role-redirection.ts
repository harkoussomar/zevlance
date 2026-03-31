import type { Role } from "@/types";

export const ROLE_REDIRECT: Record<Role, string> = {
    CLIENT: "/client",
    FREELANCER: "/freelancer",
    ADMIN: "/admin",
};
