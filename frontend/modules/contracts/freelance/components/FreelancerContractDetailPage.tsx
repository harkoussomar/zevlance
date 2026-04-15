"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { SkeletonCard } from "@/modules/shared/components/skeleton";
import { Alert } from "@/modules/shared/components/alert";
import { ContractSidebar } from "../../shared";
import { PageHeader } from "@/modules/shared/components/PageHeader";

import { useContract } from "../../shared/hooks/contract.shared.useContract";
import { useContractMilestones } from "@/modules/milestone/shared";

// Feature Components
import { FreelancerContractHeaderActions } from "./FreelancerContractHeaderActions";
import { FreelancerContractMilestones } from "./FreelancerContractMilestones";
import { ContractReview } from "@/modules/review";

interface FreelancerContractDetailPageProps {
    contractId: string;
}

export function FreelancerContractDetailPage({ contractId }: FreelancerContractDetailPageProps) {
    const { data: contract, isPending: contractPending, isError: contractError } = useContract(contractId);
    const { data: milestones = [], isPending: milestonesPending, isError: milestonesError } = useContractMilestones(contractId);

    if (contractPending) return <SkeletonCard />;
    
    if (contractError || !contract) {
        return (
            <Alert variant="destructive">
                Failed to load contract. Please refresh the page.
            </Alert>
        );
    }

    const isActive = contract.status === "ACTIVE";
    const isCompleted = contract.status === "COMPLETED";

    return (
        <div className="space-y-6">
            <Link
                href="/freelancer/contracts"
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
                action={isActive && <FreelancerContractHeaderActions contractId={contractId} />}
            />

            <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-5">
                    <FreelancerContractMilestones 
                        contractId={contractId}
                        isActive={isActive}
                        milestones={milestones}
                        isPending={milestonesPending}
                        isError={milestonesError}
                    />

                    {isCompleted && (
                        <ContractReview 
                            contractId={contractId} 
                            revieweeName={contract.clientName} 
                        />
                    )}
                </div>

                <ContractSidebar
                    contract={contract}
                    perspective="freelancer"
                />
            </div>
        </div>
    );
}