import { cn } from "@/modules/shared";
import { Role } from "@/modules/shared/types";
import { ArrowRight, Check } from "lucide-react";
import Link from "next/link";
import { SignupStep } from "../types";
import { Button } from "@/modules/shared/components/button";
import { ROLE_OPTIONS } from "../config/role-options";

export const RoleSelector = ({
    selectedRole,
    setSelectedRole,
    setStep,
}: {
    selectedRole: Role;
    setSelectedRole: (role: Role) => void;
    setStep: (step: SignupStep) => void;
}) => {
    return (
        <div>
            <h2 className="text-2xl font-bold text-foreground mb-1">
                I want to…
            </h2>
            <p className="text-muted-foreground text-sm mb-8">
                Choose how you&apos;ll use Zevlance.
            </p>

            <div className="grid gap-4">
                {ROLE_OPTIONS.map((option) => (
                    <button
                        key={option.role}
                        onClick={() => setSelectedRole(option.role)}
                        className={cn(
                            "w-full text-left p-5 rounded-xl border-2 transition-all duration-200",
                            selectedRole === option.role
                                ? "border-primary bg-primary/5"
                                : "border-border hover:border-primary/40 hover:bg-muted/50",
                        )}
                    >
                        <div className="flex items-start gap-4">
                            <div
                                className={cn(
                                    "p-2.5 rounded-lg shrink-0",
                                    selectedRole === option.role
                                        ? "bg-primary/15 text-primary"
                                        : "bg-muted text-muted-foreground",
                                )}
                            >
                                {option.icon}
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center justify-between mb-1">
                                    <h3 className="font-bold text-foreground">
                                        {option.label}
                                    </h3>
                                    {selectedRole === option.role && (
                                        <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                                            <Check className="w-3 h-3 text-primary-foreground" />
                                        </div>
                                    )}
                                </div>
                                <p className="text-sm text-muted-foreground mb-3">
                                    {option.description}
                                </p>
                                <ul className="space-y-1">
                                    {option.perks.map((perk) => (
                                        <li
                                            key={perk}
                                            className="flex items-center gap-2 text-xs text-muted-foreground"
                                        >
                                            <div className="w-1 h-1 rounded-full bg-primary shrink-0" />
                                            {perk}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </button>
                ))}
            </div>

            <Button
                size="lg"
                className="w-full mt-6"
                disabled={!selectedRole}
                onClick={() => setStep("form")}
            >
                Continue as{" "}
                {selectedRole
                    ? ROLE_OPTIONS.find((o) => o.role === selectedRole)?.label
                    : "…"}
                <ArrowRight className="w-4 h-4" />
            </Button>

            <p className="mt-4 text-center text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link
                    href="/login"
                    className="text-primary font-semibold hover:underline"
                >
                    Sign in
                </Link>
            </p>
        </div>
    );
};
