"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, RefreshCcw } from "lucide-react";

import { SkeletonCard } from "@/modules/shared/components/skeleton";
import { EmptyState } from "@/modules/shared/components/empty-state";
import { Button } from "@/modules/shared/components/button";
import { ContractSidebar } from "../../shared/components/ContractSidebar";
import { PageHeader } from "@/modules/shared/components/PageHeader";

import { useContract } from "../../shared/hooks/contract.shared.useContract";
import { useContractMilestones } from "@/modules/milestone/shared";

// Feature Components
import { ClientContractHeaderActions } from "./ClientContractHeaderActions";
import { ClientContractMilestones } from "./ClientContractMilestones";
import { ContractReview } from "@/modules/review";
import { DisputeFrozenBanner } from "@/modules/dispute/components/DisputeFrozenBanner";

interface ClientContractDetailPageProps {
    contractId: string;
    initialFundedStatus?: string;
}

export function ClientContractDetailPage({
    contractId,
    initialFundedStatus,
}: ClientContractDetailPageProps) {
    const router = useRouter();
    const pathname = usePathname();
    const toastFiredRef = useRef(false);

    useEffect(() => {
        if (!initialFundedStatus || toastFiredRef.current) return;
        toastFiredRef.current = true;

        if (initialFundedStatus === "true") {
            toast.success("Milestone funded! The freelancer can now begin work.");
        } else {
            toast.error("Payment was cancelled.");
        }
        router.replace(pathname);
    }, [initialFundedStatus, pathname, router]);

    const {
        data: contract,
        isPending: contractPending,
        isError: contractError,
    } = useContract(contractId);

    const {
        data: milestones = [],
        isPending: milestonesPending,
        isError: milestonesError,
    } = useContractMilestones(contractId);

    // ─── Guard Returns ─────────────────────────────────────────────────────────
    if (contractPending) return <SkeletonCard />;

    if (contractError || !contract) {
        return (
            <div className="pt-8 px-4">
                <EmptyState
                    preset="error"
                    title="Failed to load contract"
                    description="There was a problem retrieving this contract. Please check your connection or try again."
                    action={
                        <Button
                            variant="outline"
                            onClick={() => window.location.reload()}
                        >
                            <RefreshCcw className="w-4 h-4 mr-2" />
                            Refresh Page
                        </Button>
                    }
                />
            </div>
        );
    }

    const isActive = contract.status === "ACTIVE";
    const isCompleted = contract.status === "COMPLETED";
    const isDisputed = contract.status === "DISPUTED";

    // ─── Main Render ───────────────────────────────────────────────────────────
    return (
        <div className="space-y-4 md:space-y-6">
            {/* Back navigation */}
            <Link
                href="/client/contracts"
                className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors min-h-[44px] -ml-1 px-1 rounded-md hover:bg-muted/40"
            >
                <ArrowLeft className="w-4 h-4 shrink-0" />
                <span>All Contracts</span>
            </Link>

            <PageHeader
                title={contract.projectTitle}
                subtitle={
                    <span className="font-mono text-xs">
                        #{contract.id.slice(0, 8).toUpperCase()}
                    </span>
                }
                // Header actions hidden when disputed — banner replaces them
                action={
                    isActive && !isDisputed ? (
                        <ClientContractHeaderActions
                            contractId={contractId}
                            milestones={milestones}
                        />
                    ) : undefined
                }
            />

            {isDisputed && (
                <DisputeFrozenBanner
                    contractId={contractId}
                />
            )}

            <div className="grid gap-4 md:gap-6 md:grid-cols-3">
                {/* ── Primary content ─────────────────────────────────────── */}
                <div className="md:col-span-2 space-y-4 md:space-y-5">
                    <ClientContractMilestones
                        contractId={contractId}
                        // Milestones are read-only when disputed
                        isActive={isActive && !isDisputed}
                        contract={contract}
                        milestones={milestones}
                        isPending={milestonesPending}
                        isError={milestonesError}
                    />

                    {isCompleted && (
                        <ContractReview
                            contractId={contractId}
                            revieweeName={contract.freelancerName}
                        />
                    )}
                </div>

                {/* ── Sidebar ─────────────────────────────────────────────── */}
                <ContractSidebar
                    contract={contract}
                    perspective="client"
                />
            </div>
        </div>
    );
}