import { FreelancerContractDetailPage } from "@/modules/contracts/freelance";

interface Props {
    params: Promise<{ id: string }>;
}

export default async function ContractDetailPage({ params }: Props) {
    const { id } = await params;

    return <FreelancerContractDetailPage contractId={id} />;
}
