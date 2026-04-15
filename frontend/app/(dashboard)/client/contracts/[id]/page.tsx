import { ClientContractDetailPage } from "@/modules/contracts/client";

interface Props {
    params: Promise<{ id: string }>;
    searchParams: Promise<{ funded?: string }>;
}

export default async function ContractDetailPage({
    params,
    searchParams,
}: Props) {
    const { id } = await params;
    const { funded } = await searchParams;

    return (
        <ClientContractDetailPage
            contractId={id}
            initialFundedStatus={funded}
        />
    );
}
