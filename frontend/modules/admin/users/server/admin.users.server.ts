import { serverFetch } from "@/modules/shared/lib/bff/server-fetch";
import type { GetUsersParams, UserDetailResponse, UserResponse } from "../types/admin.users.types";
import type { PaginatedResponse } from "@/modules/shared/types";


function buildQs(params: Record<string, string | number | undefined | null>): string {
  const qs = new URLSearchParams();
  for (const [key, val] of Object.entries(params)) {
    if (val !== undefined && val !== null && val !== "") {
      qs.set(key, String(val));
    }
  }
  return qs.toString();
}

export function getAdminUsersServer(
  params: GetUsersParams
): Promise<PaginatedResponse<UserResponse>> {
  const qs = buildQs({
    page: params.page,
    size: params.size ?? 20,
    role: params.role,
    status: params.status,
    search: params.search,
  });
  return serverFetch<PaginatedResponse<UserResponse>>(`/admin/users?${qs}`);
}

export function getUserDetailServer(id: string): Promise<UserDetailResponse> {
  return serverFetch<UserDetailResponse>(`/admin/users/${id}`);
}

export function suspendUserServer(id: string, reason: string): Promise<void> {
  return serverFetch(`/admin/users/${id}/suspend`, {
    method: "PATCH",
    body: JSON.stringify({ reason }),
  });
}

export function activateUserServer(id: string, reason: string): Promise<void> {
  return serverFetch(`/admin/users/${id}/activate`, {
    method: "PATCH",
    body: JSON.stringify({ reason }),
  });
}
