import { ProjectBidsPanel } from "@/modules/project/client";

interface Props {
    params: Promise<{ id: string }>;
}

export default async function ProjectBidsPanelPage({ params }: Props) {
    const { id } = await params;

    return <ProjectBidsPanel projectId={id} />;
}
