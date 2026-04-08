import {
  useMutation,
  useQuery,
  useQueryClient,
  type QueryClient,
  type QueryKey,
} from "@tanstack/react-query";
import type {
  CreateProjectRequest,
  MyProjectFilters,
  ProjectFilters,
  UpdateProjectRequest,
} from "../types";
import {
  cancelProject,
  createProject,
  getMyProjects,
  getProject,
  getProjects,
  updateProject,
} from "../services/projects.service";

// ─── Query Key Factory ────────────────────────────────────────────────────────
//
// Key hierarchy:
//
//   ["projects"]                             ← invalidates everything
//   ["projects", "list"]                     ← invalidates all public lists
//   ["projects", "list", { ...filters }]     ← specific public list
//   ["projects", "my"]                       ← invalidates all my-project lists
//   ["projects", "my",  { page, size }]      ← specific my-project page
//   ["projects", "detail"]                   ← invalidates all details
//   ["projects", "detail", id]               ← specific project detail
//

export const projectKeys = {
  all: () => ["projects"] as const,

  lists: () => ["projects", "list"] as const,
  list: (filters: ProjectFilters) => ["projects", "list", filters] as const,

  mine: () => ["projects", "my"] as const,
  myList: (filters: MyProjectFilters) => ["projects", "my", filters] as const,

  details: () => ["projects", "detail"] as const,
  detail: (id: string) => ["projects", "detail", id] as const,
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function invalidateAllProjects(qc: QueryClient) {
  return qc.invalidateQueries({ queryKey: projectKeys.all() });
}

// ─── useProjects (public browse) ─────────────────────────────────────────────

/**
 * Paginated list of public projects for the marketplace.
 * Supports filters: category, status, budgetMin, budgetMax, skill.
 *
 * - placeholderData keeps old results visible while new page/filter loads.
 *
 * @example
 * const { data, isLoading } = useProjects({ page: 0, size: 10, category: "WEB_DEV" });
 */
export function useProjects(filters: ProjectFilters) {
  return useQuery({
    queryKey: projectKeys.list(filters),
    queryFn: () => getProjects(filters),
    placeholderData: (prev) => prev,
  });
}

// ─── useProject (single, public) ─────────────────────────────────────────────

/**
 * Fetch a single project by ID. Disabled when id is empty.
 *
 * @example
 * const { data: project, isLoading } = useProject(id);
 */
export function useProject(id: string) {
  return useQuery({
    queryKey: projectKeys.detail(id),
    queryFn: () => getProject(id),
    enabled: !!id,
  });
}

// ─── useMyProjects (CLIENT) ───────────────────────────────────────────────────

/**
 * Authenticated client's own projects, paginated.
 *
 * Uses a large default size so the client-projects page can filter/search
 * entirely on the client without extra API round-trips.
 *
 * The service layer strips all params except `page` and `size` before the
 * request is sent — the backend endpoint accepts no other query params.
 *
 * @example
 * const { data, isLoading } = useMyProjects({ page: 0, size: 50 });
 */
export function useMyProjects(filters: MyProjectFilters) {
  return useQuery({
    queryKey: projectKeys.myList(filters),
    queryFn: () => getMyProjects(filters),
    placeholderData: (prev) => prev,
  });
}

// ─── useCreateProject ─────────────────────────────────────────────────────────

/**
 * Post a new project to the marketplace.
 *
 * On success: invalidates all "my" lists and the public list so they refresh.
 *
 * @example
 * const { mutateAsync, isPending } = useCreateProject();
 * await mutateAsync({ title: "...", ... });
 */
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

// ─── useUpdateProject ─────────────────────────────────────────────────────────

/**
 * Partially update an existing project (CLIENT owner, OPEN status only).
 *
 * On success:
 *   - writes the updated project directly into the detail cache (snappy UX),
 *   - invalidates the my-list and public list so they re-fetch.
 *
 * @example
 * const { mutateAsync, isPending } = useUpdateProject(projectId);
 * await mutateAsync({ title: "Updated Title" });
 */
export function useUpdateProject(id: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateProjectRequest) => updateProject(id, payload),
    onSuccess: (updated) => {
      qc.setQueryData(projectKeys.detail(id), updated);
      qc.invalidateQueries({ queryKey: projectKeys.mine() });
      qc.invalidateQueries({ queryKey: projectKeys.lists() });
    },
  });
}

// ─── useCancelProject ─────────────────────────────────────────────────────────

type MyProjectsPage = Awaited<ReturnType<typeof getMyProjects>>;

type CancelContext = {
  /** Snapshot of every active "my projects" cache entry before the optimistic update. */
  previousSnapshots: [QueryKey, MyProjectsPage | undefined][];
};

/**
 * Cancel an open project with an optimistic UI update.
 *
 * - Immediately flips the project's status to CANCELLED in every active
 *   "my" cache page for instant feedback.
 * - Rolls back all changes on error.
 * - Invalidates all project caches on settle (success or error).
 *
 * @example
 * const { mutate, isPending } = useCancelProject();
 * mutate(project.id);
 */
export function useCancelProject() {
  const qc = useQueryClient();

  return useMutation<void, Error, string, CancelContext>({
    mutationFn: (projectId: string) => cancelProject(projectId),

    onMutate: async (projectId: string): Promise<CancelContext> => {
      // Cancel any in-flight queries so they don't overwrite the optimistic update.
      await qc.cancelQueries({ queryKey: projectKeys.mine() });

      // Snapshot current state for rollback.
      const previousSnapshots = qc.getQueriesData<MyProjectsPage>({
        queryKey: projectKeys.mine(),
      });

      // Optimistically flip status to CANCELLED.
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
      // Restore every snapshot.
      for (const [key, data] of context.previousSnapshots) {
        qc.setQueryData(key, data);
      }
    },

    onSettled: () => {
      // Always re-sync with the server after success or error.
      invalidateAllProjects(qc);
    },
  });
}