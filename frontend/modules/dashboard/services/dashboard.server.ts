import "server-only";
import { serverFetch } from "@/modules/shared/lib/server-fetch";
import type {
    FreelancerDashboardResponse,
    ClientDashboardResponse,
} from "../types";

export const getFreelancerDashboard =
    (): Promise<FreelancerDashboardResponse> =>
        serverFetch("/dashboard/freelancer");

export const getClientDashboard =
    (): Promise<ClientDashboardResponse> =>
        serverFetch("/dashboard/client");