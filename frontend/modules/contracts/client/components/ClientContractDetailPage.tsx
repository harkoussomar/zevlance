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

    // ─── Top Level Error Handling ──────────────────────────────────────────────
    if (contractPending) return <SkeletonCard />;
    
    if (contractError || !contract) {
        return (
            <div className="pt-12">
                <EmptyState
                    preset="error"
                    title="Failed to load contract"
                    description="There was a problem retrieving this contract. Please check your connection or try again."
                    action={
                        <Button variant="outline" onClick={() => window.location.reload()}>
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

    return (
        <div className="space-y-6">
            <Link
                href="/client/contracts"
                className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
                <ArrowLeft className="w-4 h-4" /> All Contracts
            </Link>

            <PageHeader
                title={contract.projectTitle}
                subtitle={
                    <span className="font-mono text-xs">
                        #{contract.id.slice(0, 8).toUpperCase()}
                    </span>
                }
                action={isActive && <ClientContractHeaderActions contractId={contractId} />}
            />

            <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-5">
                    {/* Milestones Component now handles its own error/loading states */}
                    <ClientContractMilestones
                        contractId={contractId}
                        isActive={isActive}
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

                <ContractSidebar
                    contract={contract}
                    milestones={milestones}
                    perspective="client"
                />
            </div>
        </div>
    );
}