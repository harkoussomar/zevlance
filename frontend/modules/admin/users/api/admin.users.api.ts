import api from "@/modules/shared/lib/axios";
import {
    UserDetailResponseSchema,
    UserResponseSchema,
    type GetUsersParams,
    type UserDetailResponse,
    type UserResponse,
} from "../types/admin.users.types";
import {
    PaginatedResponseSchema,
    type PaginatedResponse,
} from "@/modules/shared/types";

function buildQs(
    params: Record<string, string | number | undefined | null>,
): string {
    const qs = new URLSearchParams();
    for (const [key, val] of Object.entries(params)) {
        if (val !== undefined && val !== null && val !== "") {
            qs.set(key, String(val));
        }
    }
    return qs.toString();
}

export const adminUsersApi = {
    // ── Users ────────────────────────────────────────────────────────────────

    getUsers: (
        params: GetUsersParams,
        signal?: AbortSignal,
    ): Promise<PaginatedResponse<UserResponse>> => {
        const qs = buildQs({
            page: params.page,
            size: params.size ?? 20,
            role: params.role,
            status: params.status,
            search: params.search,
        });
        return api
            .get<
                PaginatedResponse<UserResponse>
            >(`/admin/users?${qs}`, { signal })
            .then((r) =>
                PaginatedResponseSchema(UserResponseSchema).parse(r.data),
            );
    },

    getUserDetail: (
        id: string,
        signal?: AbortSignal,
    ): Promise<UserDetailResponse> =>
        api
            .get<UserDetailResponse>(`/admin/users/${id}`, { signal })
            .then((r) => UserDetailResponseSchema.parse(r.data)),


            
    suspendUser: (id: string, reason: string): Promise<void> =>
        api
            .patch(`/admin/users/${id}/suspend`, { reason })
            .then(() => undefined),

    activateUser: (id: string, reason: string): Promise<void> =>
        api
            .patch(`/admin/users/${id}/activate`, { reason })
            .then(() => undefined),
};
