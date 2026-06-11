import { useQuery } from "@tanstack/react-query";
import { projectKeys } from "../../shared/hooks/project.keys";
import { getProject } from "../api/project.public.api";

export function useProject(id: string) {
    return useQuery({
        queryKey: projectKeys.detail(id),
        queryFn: () => getProject(id),
        enabled: !!id,
    });
}
