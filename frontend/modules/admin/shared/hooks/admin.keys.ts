import { AdminProjectFilter } from "../../projects/types/admin.projects.types";

export const adminKeys = {
    all: ["admin"] as const,
    users: (page: number, filters?: Record<string, unknown>) =>
        [...adminKeys.all, "users", page, filters] as const,
    projects: (page: number, filters?: AdminProjectFilter) =>
        [...adminKeys.all, "projects", page, filters] as const,
    projectDetail: (id: string) => [...adminKeys.all, "projects", id] as const,
    stats: () => [...adminKeys.all, "stats"] as const,
    auditLog: (page: number) => [...adminKeys.all, "audit-log", page] as const,
};
