import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateProject } from "../api/project.client.api";
import type { UpdateProjectRequest } from "../types/project.client";
import { projectKeys } from "../../shared/hooks/project.keys";

export function useUpdateProject(id: string) {
    const qc = useQueryClient();

    return useMutation({
        mutationFn: (payload: UpdateProjectRequest) =>
            updateProject(id, payload),
        onSuccess: (updated) => {
            qc.setQueryData(projectKeys.detail(id), updated);
            qc.invalidateQueries({ queryKey: projectKeys.mine() });
            qc.invalidateQueries({ queryKey: projectKeys.lists() });
        },
    });
}
