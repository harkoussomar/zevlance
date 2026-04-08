import { ClientContractDetailPage } from "@/modules/contracts/components/ClientContractDetailPage";

interface Props {
    params: Promise<{ id: string }>;
}

export default async function ContractDetailPage({ params }: Props) {
    const { id } = await params;

    return <ClientContractDetailPage contractId={id} />;
}
