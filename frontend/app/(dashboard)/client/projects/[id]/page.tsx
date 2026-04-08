import { ClientProjectBidsPanel } from "@/modules/projects/components/ClientProjectBidsPanel";

interface Props {
    params: Promise<{ id: string }>;
}

export default async function ProjectBidsPanel({ params }: Props) {
    const { id } = await params;

    return <ClientProjectBidsPanel projectId={id} />;
}
