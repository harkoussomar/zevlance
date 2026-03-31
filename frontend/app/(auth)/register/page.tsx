import { LeftDecorativePanel } from "@/modules/auth/components/LeftDecorativePanel";
import { SignupFlow } from "@/modules/auth/components/SignupFlow";



export default function RegisterPage() {
    return (
        <div className="min-h-screen bg-background flex">
            {/* Left panel */}
            <LeftDecorativePanel />
            
            {/* Right: dynamic content */}
            <SignupFlow />
        </div>
    );
}
