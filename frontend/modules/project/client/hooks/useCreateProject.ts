import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createProject } from "../services/project.client";
import { CreateProjectRequest } from "../types/project.client";
import { projectKeys } from "../../shared/hooks/project.keys";

export function useCreateProject() {
    const qc = useQueryClient();

    return useMutation({
        mutationFn: (payload: CreateProjectRequest) => createProject(payload),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: projectKeys.mine() });
            qc.invalidateQueries({ queryKey: projectKeys.lists() });
        },
    });
}
