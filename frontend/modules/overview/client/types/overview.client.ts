import type { ProjectStatus } from "@/modules/project/shared/types/project.shared";
import type { MilestoneSummary } from "../../freelancer/types/overview.freelancer";
import type { ContractStatus } from "@/modules/contracts/shared";

export interface OverviewContractItem {
    id: string;
    projectTitle: string;
    clientName?: string;
    freelancerName?: string;
    agreedPrice: number;
    status: ContractStatus;
    milestoneSummary: MilestoneSummary;
}

export interface OverviewProjectItem {
    id: string;
    title: string;
    status: ProjectStatus;
    budgetMin: number;
    budgetMax: number;
    deadline: string;
    bidCount: number;
    requiredSkills: string[];
}

export interface ClientOverviewStats {
    openProjectsCount: number;
    activeContractsCount: number;
    totalBidsReceived: number;
    totalSpent: number;
}

export interface ClientOverviewResponse {
    user: { id: string; name: string };
    stats: ClientOverviewStats;
    recentProjects: OverviewProjectItem[];
    activeContracts: OverviewContractItem[];
}
