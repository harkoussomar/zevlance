// app/(dashboard)/client/projects/create/page.tsx
"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { ProjectForm } from "@/modules/project/client";

export default function CreateProjectPage() {
    const router = useRouter();
    const [done, setDone] = useState(false);

    if (done) {
        return (
            <div className="max-w-xl mx-auto py-24 text-center space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                </div>
                <h2 className="text-2xl font-bold text-foreground">
                    Project Published!
                </h2>
                <p className="text-muted-foreground">
                    Your project is now live and accepting proposals.
                    Redirecting…
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <Link
                    href="/client/projects"
                    className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
                >
                    <ArrowLeft className="w-4 h-4" />
                    My Projects
                </Link>
                <h1 className="text-2xl font-bold text-foreground">
                    Post a New Project
                </h1>
                <p className="text-muted-foreground mt-1">
                    The more specific you are, the better proposals you&apos;ll
                    receive.
                </p>
            </div>

            <ProjectForm
                mode="create"
                onSuccess={() => {
                    setDone(true);
                    setTimeout(() => router.push("/client/projects"), 2000);
                }}
            />
        </div>
    );
}
