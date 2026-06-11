import api from "@/modules/shared/lib/axios";
import {
    PlatformStats,
    PlatformStatsSchema,
} from "../types/admin.overview.types";

export const adminOverviewApi = {
    getStats: (signal?: AbortSignal): Promise<PlatformStats> =>
        api
            .get<PlatformStats>("/admin/overview", { signal })
            .then((r) => PlatformStatsSchema.parse(r.data)),
};
