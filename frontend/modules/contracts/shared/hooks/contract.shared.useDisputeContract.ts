"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { disputeContract } from "../api/contract.shared.api";
import { useRouter } from "next/navigation";
import { useAuthStore, selectRole } from "@/store/auth-store";
import { contractKeys } from "./contract.keys";
import { ROLE_REDIRECT } from "@/modules/shared";
import type { FileDisputePayload } from "@/modules/dispute/types/dispute.types";

export function useDisputeContract() {
    const qc = useQueryClient();
    const router = useRouter();
    const role = useAuthStore(selectRole);

    return useMutation({
        mutationFn: ({ id, ...payload }: { id: string } & FileDisputePayload) =>
            disputeContract(id, payload),

        onSuccess: (data, variables) => {
            // Invalidate contract caches
            qc.invalidateQueries({ queryKey: contractKeys.all() });

            // Redirect to the newly created dispute room
            const basePath = role ? ROLE_REDIRECT[role] : "";
            router.push(`${basePath}/contracts/${variables.id}/dispute`);
        },
    });
}
