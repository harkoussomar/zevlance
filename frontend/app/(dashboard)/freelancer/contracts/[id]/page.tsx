import { FreelancerContractDetailPage } from "@/modules/contracts/components/FreelancerContractDetailPage";

interface Props {
    params: Promise<{ id: string }>;
}

export default async function ContractDetailPage({ params }: Props) {
    const { id } = await params;

    return <FreelancerContractDetailPage contractId={id} />;
}
