import { serverFetch } from "@/modules/shared/lib/bff/server-fetch";
import type { PlatformStats } from "../types/admin.overview.types";



export function getPlatformStatsServer(): Promise<PlatformStats> {
  return serverFetch<PlatformStats>("/admin/overview");
}