import { useMutation, useQueryClient, type QueryClient, type QueryKey } from "@tanstack/react-query";
import { cancelProject, getMyProjects } from "../services/project.client";
import { projectKeys } from "../../shared/hooks/project.keys";

type MyProjectsPage = Awaited<ReturnType<typeof getMyProjects>>;
type CancelContext = {
  previousSnapshots: [QueryKey, MyProjectsPage | undefined][];
};

function invalidateAllProjects(qc: QueryClient) {
  return qc.invalidateQueries({ queryKey: projectKeys.all() });
}

export function useCancelProject() {
  const qc = useQueryClient();

  return useMutation<void, Error, string, CancelContext>({
    mutationFn: (projectId: string) => cancelProject(projectId),

    onMutate: async (projectId): Promise<CancelContext> => {
      await qc.cancelQueries({ queryKey: projectKeys.mine() });

      const previousSnapshots = qc.getQueriesData<MyProjectsPage>({
        queryKey: projectKeys.mine(),
      });

      qc.setQueriesData<MyProjectsPage>(
        { queryKey: projectKeys.mine() },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            content: old.content.map((p) =>
              p.id === projectId ? { ...p, status: "CANCELLED" as const } : p,
            ),
          };
        },
      );

      return { previousSnapshots };
    },

    onError: (_err, _projectId, context) => {
      if (!context) return;
      for (const [key, data] of context.previousSnapshots) {
        qc.setQueryData(key, data);
      }
    },

    onSettled: () => {
      invalidateAllProjects(qc);
    },
  });
}