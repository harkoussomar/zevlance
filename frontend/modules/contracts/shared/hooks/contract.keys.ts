import type { ContractStatus } from "../types/contract.shared";

export interface ContractListParams {
    status?: ContractStatus | "ALL";
    page?: number;
    size?: number;
}

export const contractKeys = {
    all:     ()                        => ["contracts"] as const,
    my:      (params?: ContractListParams) => ["contracts", "my", params ?? {}] as const,
    summary: ()                        => ["contracts", "summary"] as const,
    detail:  (id: string)              => ["contracts", "detail", id] as const,
} as const;