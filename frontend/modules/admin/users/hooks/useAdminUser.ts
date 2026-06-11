import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminKeys } from "../../shared/hooks/admin.keys";
import { adminUsersApi } from "../api/admin.users.api";

export function useAdminUsers(
    page: number,
    role?: string,
    status?: string,
    search?: string,
) {
    return useQuery({
        queryKey: adminKeys.users(page, { role, status, search }),
        queryFn: ({ signal }) =>
            adminUsersApi.getUsers({ page, role, status, search }, signal),
    });
}

export function useAdminUserDetail(id: string) {
    return useQuery({
        queryKey: [...adminKeys.all, "user-detail", id] as const,
        queryFn: ({ signal }) => adminUsersApi.getUserDetail(id, signal),
        enabled: !!id,
    });
}

// ─── Mutations ────────────────────────────────────────────────────────────────

export function useSuspendUser() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, reason }: { id: string; reason: string }) =>
            adminUsersApi.suspendUser(id, reason),
        onSuccess: (_data, variables) => {
            // Invalidate the paginated list
            queryClient.invalidateQueries({ queryKey: [...adminKeys.all, "users"] });
            // Also invalidate the specific user-detail query so the status badge
            // on the detail page refreshes immediately without a manual reload.
            queryClient.invalidateQueries({
                queryKey: [...adminKeys.all, "user-detail", variables.id],
            });
            queryClient.invalidateQueries({ queryKey: adminKeys.auditLog(0) });
        },
    });
}

export function useActivateUser() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, reason }: { id: string; reason: string }) =>
            adminUsersApi.activateUser(id, reason),
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: [...adminKeys.all, "users"] });
            queryClient.invalidateQueries({
                queryKey: [...adminKeys.all, "user-detail", variables.id],
            });
            queryClient.invalidateQueries({ queryKey: adminKeys.auditLog(0) });
        },
    });
}