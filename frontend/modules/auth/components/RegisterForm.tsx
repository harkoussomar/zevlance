"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { ArrowRight, Eye, EyeOff } from "lucide-react";
import {
    registerFreelancerSchema,
    registerClientSchema,
    type RegisterFreelancerSchemaType,
    type RegisterClientSchemaType,
} from "../schemas/register.schema";
import { useRegister } from "../hooks/useRegister";
import type { Role } from "@/modules/shared/types";
import { Alert } from "@/modules/shared/components/alert";
import { FormField } from "@/modules/shared/components/form-field";
import { InputField } from "@/modules/shared/components/input";
import { Button } from "@/modules/shared/components/button";
import { Textarea } from "@/modules/shared/components/textarea";

interface RegisterFormProps {
    role: Role;
}

// ─── Shared password toggle button ───────────────────────────────────────────

function PasswordToggle({ show, onToggle }: { show: boolean; onToggle: () => void }) {
    return (
        <button
            type="button"
            tabIndex={-1}
            onClick={onToggle}
            aria-label={show ? "Hide password" : "Show password"}
            className="text-muted-foreground hover:text-foreground transition-colors"
        >
            {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
    );
}

// ─── Password hint ────────────────────────────────────────────────────────────

function PasswordHint() {
    return (
        <p className="text-xs text-muted-foreground">
            Min 8 characters · one uppercase letter · one number.
        </p>
    );
}

// ─── Terms footer ─────────────────────────────────────────────────────────────

function TermsFooter() {
    return (
        <p className="text-xs text-muted-foreground text-center">
            By creating an account you agree to our{" "}
            <a href="#" className="text-primary hover:underline">Terms</a>{" "}
            and{" "}
            <a href="#" className="text-primary hover:underline">Privacy Policy</a>.
        </p>
    );
}

// ─── Freelancer form ──────────────────────────────────────────────────────────

function FreelancerForm() {
    const { register: registerUser, isLoading, serverError } = useRegister("FREELANCER");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const { register, handleSubmit, formState: { errors } } = useForm<RegisterFreelancerSchemaType>({
        mode: "onBlur",
        resolver: standardSchemaResolver(registerFreelancerSchema),
    });

    return (
        <form onSubmit={handleSubmit(registerUser)} className="space-y-4" noValidate>
            {serverError && <Alert variant="destructive">{serverError}</Alert>}

            <div className="grid sm:grid-cols-2 gap-4">
                <FormField label="Full Name" required>
                    <InputField
                        placeholder="Sara Dev"
                        autoComplete="name"
                        error={errors.name?.message}
                        {...register("name")}
                    />
                </FormField>
                <FormField label="Phone">
                    <InputField
                        type="tel"
                        placeholder="+212 600-000-000"
                        autoComplete="tel"
                        error={errors.phone?.message}
                        {...register("phone")}
                    />
                </FormField>
            </div>

            <FormField label="Email address" required>
                <InputField
                    type="email"
                    placeholder="you@example.com"
                    autoComplete="email"
                    error={errors.email?.message}
                    {...register("email")}
                />
            </FormField>

            <div className="grid sm:grid-cols-2 gap-4">
                <FormField label="Password" required>
                    <InputField
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        autoComplete="new-password"
                        error={errors.password?.message}
                        endIcon={
                            <PasswordToggle
                                show={showPassword}
                                onToggle={() => setShowPassword((s) => !s)}
                            />
                        }
                        {...register("password")}
                    />
                </FormField>
                <FormField label="Confirm Password" required>
                    <InputField
                        type={showConfirm ? "text" : "password"}
                        placeholder="••••••••"
                        autoComplete="new-password"
                        error={errors.confirmPassword?.message}
                        endIcon={
                            <PasswordToggle
                                show={showConfirm}
                                onToggle={() => setShowConfirm((s) => !s)}
                            />
                        }
                        {...register("confirmPassword")}
                    />
                </FormField>
            </div>

            <PasswordHint />

            <Button type="submit" size="lg" loading={isLoading} className="w-full">
                Create Account
                <ArrowRight className="w-4 h-4" />
            </Button>

            <TermsFooter />
        </form>
    );
}

// ─── Client form ──────────────────────────────────────────────────────────────

function ClientForm() {
    const { register: registerUser, isLoading, serverError } = useRegister("CLIENT");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const { register, handleSubmit, formState: { errors } } = useForm<RegisterClientSchemaType>({
        resolver: standardSchemaResolver(registerClientSchema),
    });

    return (
        <form onSubmit={handleSubmit(registerUser)} className="space-y-4" noValidate>
            {serverError && <Alert variant="destructive">{serverError}</Alert>}

            <div className="grid sm:grid-cols-2 gap-4">
                <FormField label="Full Name" required>
                    <InputField
                        placeholder="Omar K."
                        autoComplete="name"
                        error={errors.name?.message}
                        {...register("name")}
                    />
                </FormField>
                <FormField label="Phone">
                    <InputField
                        type="tel"
                        placeholder="+212 600-000-000"
                        autoComplete="tel"
                        error={errors.phone?.message}
                        {...register("phone")}
                    />
                </FormField>
            </div>

            <FormField label="Email address" required>
                <InputField
                    type="email"
                    placeholder="you@company.com"
                    autoComplete="email"
                    error={errors.email?.message}
                    {...register("email")}
                />
            </FormField>

            <div className="grid sm:grid-cols-2 gap-4">
                <FormField label="Password" required>
                    <InputField
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        autoComplete="new-password"
                        error={errors.password?.message}
                        endIcon={
                            <PasswordToggle
                                show={showPassword}
                                onToggle={() => setShowPassword((s) => !s)}
                            />
                        }
                        {...register("password")}
                    />
                </FormField>
                <FormField label="Confirm Password" required>
                    <InputField
                        type={showConfirm ? "text" : "password"}
                        placeholder="••••••••"
                        autoComplete="new-password"
                        error={errors.confirmPassword?.message}
                        endIcon={
                            <PasswordToggle
                                show={showConfirm}
                                onToggle={() => setShowConfirm((s) => !s)}
                            />
                        }
                        {...register("confirmPassword")}
                    />
                </FormField>
            </div>

            <PasswordHint />

            {/* Optional company fields */}
            <div className="pt-3 border-t border-border space-y-4">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Company (optional)
                </p>

                <div className="grid sm:grid-cols-2 gap-4">
                    <FormField label="Company Name">
                        <InputField
                            placeholder="OmarTech"
                            autoComplete="organization"
                            error={errors.companyName?.message}
                            {...register("companyName")}
                        />
                    </FormField>
                    <FormField label="Website">
                        <InputField
                            type="url"
                            placeholder="https://omartech.com"
                            autoComplete="url"
                            error={errors.website?.message}
                            {...register("website")}
                        />
                    </FormField>
                </div>

                <FormField label="Company Description">
                    <Textarea
                        placeholder="What does your company do?"
                        rows={2}
                        error={errors.companyDescription?.message}
                        {...register("companyDescription")}
                    />
                </FormField>
            </div>

            <Button type="submit" size="lg" loading={isLoading} className="w-full">
                Create Account
                <ArrowRight className="w-4 h-4" />
            </Button>

            <TermsFooter />
        </form>
    );
}

// ─── RegisterForm — renders correct form for given role ───────────────────────

export function RegisterForm({ role }: RegisterFormProps) {
    if (role === "FREELANCER") return <FreelancerForm />;
    return <ClientForm />;
}