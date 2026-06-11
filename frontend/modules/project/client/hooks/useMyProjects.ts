import { useQuery } from "@tanstack/react-query";
import { getMyProjects } from "../api/project.client.api";
import { projectKeys } from "../../shared/hooks/project.keys";
import type { MyProjectFilters } from "../types/project.client";

export function useMyProjects(filters: MyProjectFilters) {
    return useQuery({
        queryKey: projectKeys.myList(filters),
        queryFn: () => getMyProjects(filters),
        placeholderData: (prev) => prev,
    });
}
