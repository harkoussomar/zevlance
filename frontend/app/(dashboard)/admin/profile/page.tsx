"use client";

import { PageHeader } from "@/modules/shared/components/PageHeader";
import { useAuthStore } from "@/store/auth-store";
import { Card } from "@/modules/shared/components/card";
import { Shield } from "lucide-react";

export default function AdminProfilePage() {
  const user = useAuthStore((state) => ({ id: state.userId, name: state.name, email: state.email }));

  return (
    <>
      <PageHeader 
        title="Admin Profile"
        subtitle="Your access identity details on the FreelanceHub network."
      />
      
      <div className="mt-8 max-w-xl">
        <Card className="p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-primary/10 text-primary rounded-full">
              <Shield className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">{user.name || "Administrator"}</h2>
              <p className="text-muted-foreground">{user.email}</p>
              
              <div className="mt-6 space-y-4">
                <div>
                  <label className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Admin ID</label>
                  <p className="font-mono text-sm mt-1">{user.id}</p>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Access Level</label>
                  <p className="font-medium text-sm mt-1 text-primary">Full Administrative Access</p>
                  <p className="text-xs text-muted-foreground mt-1">Capable of moderating projects, users, and viewing private financial telemetry.</p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </>
  );
}
