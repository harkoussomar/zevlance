import { LeftDecorativePanel, SignupFlow } from "@/modules/auth";



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
