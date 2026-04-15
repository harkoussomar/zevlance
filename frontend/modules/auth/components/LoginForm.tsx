"use client";

import { useForm } from "react-hook-form";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { ArrowRight, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { useLogin } from "../hooks/useLogin";
import { type LoginSchemaType, loginSchema } from "../schemas/login.schema";
import { Alert } from "@/modules/shared/components/alert";
import { FormField } from "@/modules/shared/components/form-field";
import { InputField } from "@/modules/shared/components/input";
import { Button } from "@/modules/shared/components/button";

export function LoginForm() {
    const { login, isLoading, serverError } = useLogin();
    const [showPassword, setShowPassword] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginSchemaType>({
        resolver: standardSchemaResolver(loginSchema),
        mode: "onBlur",
        defaultValues: {
            email: "",
            password: "",
        },
    });

    return (
        <form onSubmit={handleSubmit(login)} className="space-y-4" noValidate>
            {serverError && <Alert variant="destructive">{serverError}</Alert>}

            <FormField label="Email address" required>
                <InputField
                    type="email"
                    placeholder="you@example.com"
                    autoComplete="email"
                    error={errors.email?.message}
                    {...register("email")}
                />
            </FormField>

            <FormField label="Password" required>
                <InputField
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    error={errors.password?.message}
                    endIcon={
                        <button
                            type="button"
                            onClick={() => setShowPassword((s) => !s)}
                            className="text-muted-foreground hover:text-foreground transition-colors"
                            tabIndex={-1}
                            aria-label={
                                showPassword ? "Hide password" : "Show password"
                            }
                        >
                            {showPassword ? (
                                <EyeOff className="w-4 h-4" />
                            ) : (
                                <Eye className="w-4 h-4" />
                            )}
                        </button>
                    }
                    {...register("password")}
                />
            </FormField>

            <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input type="checkbox" className="rounded border-border" />
                    <span className="text-muted-foreground">Remember me</span>
                </label>
                {/* ↓ Updated: real link instead of href="#" */}
                <Link
                    href="/forgot-password"
                    className="text-primary font-semibold hover:underline text-xs"
                >
                    Forgot password?
                </Link>
            </div>

            <Button
                type="submit"
                size="lg"
                loading={isLoading}
                className="w-full"
            >
                Sign in
                <ArrowRight className="w-4 h-4" />
            </Button>
        </form>
    );
}
