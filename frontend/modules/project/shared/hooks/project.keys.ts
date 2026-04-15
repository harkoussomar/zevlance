import type { MyProjectFilters } from "../../client/types/project.client";
import type { ProjectFilters } from "../../public/types/project.public";

export const projectKeys = {
    all: () => ["projects"] as const,

    lists: () => ["projects", "list"] as const,
    list: (filters: ProjectFilters) => ["projects", "list", filters] as const,

    mine: () => ["projects", "my"] as const,
    myList: (filters: MyProjectFilters) => ["projects", "my", filters] as const,

    details: () => ["projects", "detail"] as const,
    detail: (id: string) => ["projects", "detail", id] as const,
};
