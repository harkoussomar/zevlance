import { useQuery } from "@tanstack/react-query";
import { ProjectFilters } from "../types/project.public";
import { projectKeys } from "../../shared/hooks/project.keys";
import { getProjects } from "../api/project.public.api";

export function useProjects(filters: ProjectFilters) {
    return useQuery({
        queryKey: projectKeys.list(filters),
        queryFn: () => getProjects(filters),
        placeholderData: (prev) => prev,
    });
}
