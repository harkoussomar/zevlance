"use client";

import { Role } from "@/types";
import { ArrowLeft } from "lucide-react";
import { useState } from "react";
import { RoleSelector } from "./RoleSelector";
import { SignupStep } from "../types";
import { RegisterForm } from "./RegisterForm";

export const SignupFlow = () => {
    const [step, setStep] = useState<SignupStep>("role");
    const [selectedRole, setSelectedRole] = useState<Role>("FREELANCER");

    return (
        <div className="flex-1 flex items-center justify-center p-6 lg:p-12 overflow-y-auto">
            <div className="w-full max-w-lg">

                {/* Step 1 — Role selection */}
                {step === "role" && (
                    <RoleSelector
                        selectedRole={selectedRole}
                        setSelectedRole={setSelectedRole}
                        setStep={setStep}
                    />
                )}

                {/* Step 2 — Registration form */}
                {step === "form" && (
                    <div>
                        <button
                            onClick={() => setStep("role")}
                            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back
                        </button>

                        <h2 className="text-2xl font-bold text-foreground mb-1">
                            Create your account
                        </h2>
                        <p className="text-muted-foreground text-sm mb-8">
                            Registering as a{" "}
                            <span className="font-semibold text-foreground capitalize">
                                {selectedRole.toLowerCase()}
                            </span>
                            .
                        </p>

                        <RegisterForm role={selectedRole} />
                    </div>
                )}

            </div>
        </div>
    );
};