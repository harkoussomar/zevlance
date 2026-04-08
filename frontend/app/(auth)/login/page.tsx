import Link from "next/link";
import { Briefcase } from "lucide-react";
import { LeftDecorativePanel, LoginForm } from "@/modules/auth";

export default function LoginPage() {
    return (
        <div className="min-h-screen bg-background flex">
            {/* Left decorative panel */}
            <LeftDecorativePanel />

            {/* Right: Form */}
            <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
                <div className="w-full max-w-sm">
                    {/* Mobile logo */}
                    <div className="flex items-center gap-2 mb-8 lg:hidden">
                        <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
                            <Briefcase className="w-4 h-4 text-primary-foreground" />
                        </div>
                        <span className="font-bold text-foreground">
                            Freelance<span className="text-primary">Hub</span>
                        </span>
                    </div>

                    <h2 className="text-2xl font-bold text-foreground mb-1">
                        Welcome back
                    </h2>
                    <p className="text-muted-foreground text-sm mb-8">
                        Sign in to your account to continue.
                    </p>

                    <LoginForm />

                    <p className="mt-6 text-center text-sm text-muted-foreground">
                        Don&apos;t have an account?{" "}
                        <Link
                            href="/register"
                            className="text-primary font-semibold hover:underline"
                        >
                            Create one
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
