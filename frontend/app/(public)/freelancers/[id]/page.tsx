import { FreelancerProfilePage } from "@/modules/profile/freelancer/components/FreelancerProfilePage";


interface Props {
    params: Promise<{ id: string }>;
}


export default async function ProfilePublicPage({ params }: Props) {
    const { id } = await params;
    
    return <FreelancerProfilePage freelancerId={id} />
}
