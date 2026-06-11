import { DisputeRoom } from "@/modules/dispute/components/DisputeRoom";
import { PageHeader } from "@/modules/shared/components/PageHeader";

export default async function DisputePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    return (
        <div className="space-y-4">
            <PageHeader title="Dispute Resolution Center" />
            <DisputeRoom contractId={id} />
        </div>
    );
}