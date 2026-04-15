"use client";

import { useForm, useWatch, type Control } from "react-hook-form";
import { Send } from "lucide-react";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import {
    createBidSchema,
    type CreateBidFormValues,
} from "../schemas/submit-bid.schema";
import { Alert } from "@/modules/shared/components/alert";
import { FormField } from "@/modules/shared/components/form-field";
import { InputField } from "@/modules/shared/components/input";
import { Textarea } from "@/modules/shared/components/textarea";
import { Button } from "@/modules/shared/components/button";
import { parseApiError } from "@/modules/shared";
import { useCreateBid } from "../hooks/bid.freelancer.useCreateBid";

interface BidFormProps {
    projectId: string;
    onSuccess?: () => void;
}

export function BidForm({ projectId, onSuccess }: BidFormProps) {
    // 1. Added `isPending` from the mutation hook for safer button disabling
    const {
        mutateAsync: createBid,
        isError,
        error,
        isPending,
    } = useCreateBid(projectId);

    const {
        register,
        handleSubmit,
        control,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<CreateBidFormValues>({
        resolver: standardSchemaResolver(createBidSchema),
        defaultValues: {
            // Note: If your schema (e.g. Zod) uses z.coerce.number(), you don't strictly need valueAsNumber below
            proposedPrice: undefined,
            estimatedDays: undefined,
            coverLetter: "",
        },
    });

    const onSubmit = async (values: CreateBidFormValues) => {
        try {
            await createBid(values);
            reset();
            onSuccess?.();
        } catch {
            // Error is captured in submitBid.error and displayed below.
            // The catch block is required — without it, a failed mutateAsync
            // surfaces as an unhandled promise rejection inside RHF's handleSubmit.
        }
    };

    // Use parseApiError for consistent Spring Boot error extraction instead of
    // manually reaching into AxiosError internals.
    const errorMessage = error ? parseApiError(error) : null;

    // 2. Combine RHF's native submission state with React Query's mutation state
    const isFormBusy = isSubmitting || isPending;

    return (
        <form
            onSubmit={handleSubmit(onSubmit)}
            noValidate
            className="space-y-4"
        >
            {isError && (
                <Alert variant="destructive" title="Could not submit proposal">
                    {errorMessage}
                </Alert>
            )}

            <div className="grid grid-cols-2 gap-4">
                <FormField
                    label="Your Price (USD)"
                    required
                    error={errors.proposedPrice?.message}
                >
                    <InputField
                        type="number"
                        placeholder="1200"
                        startIcon={<span className="text-xs font-bold">$</span>}
                        error={errors.proposedPrice?.message}
                        {...register("proposedPrice", { valueAsNumber: true })}
                    />
                </FormField>

                <FormField
                    label="Estimated Days"
                    required
                    error={errors.estimatedDays?.message}
                >
                    <InputField
                        type="number"
                        placeholder="14"
                        error={errors.estimatedDays?.message}
                        {...register("estimatedDays", { valueAsNumber: true })}
                    />
                </FormField>
            </div>

            <FormField
                label="Cover Letter"
                required
                error={errors.coverLetter?.message}
                // 3. Render the isolated Hint component here
                hint={<CoverLetterHint control={control} />}
            >
                <Textarea
                    placeholder="I have 5+ years of experience building Spring Boot APIs in production…"
                    rows={5}
                    error={errors.coverLetter?.message}
                    {...register("coverLetter")}
                />
            </FormField>

            <Button
                type="submit"
                size="lg"
                loading={isFormBusy}
                disabled={isFormBusy}
                className="w-full"
            >
                <Send className="w-4 h-4" />
                Submit Proposal
            </Button>
        </form>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────

/**
 * 4. ISOLATED RE-RENDERS: 
 * By putting `useWatch` inside this tiny component, ONLY this span re-renders
 * when the user types in the Textarea. The main `BidForm` stays lightning fast.
 */
function CoverLetterHint({
    control,
}: {
    control: Control<CreateBidFormValues>;
}) {
    const coverLetter = useWatch({
        control,
        name: "coverLetter",
        defaultValue: "",
    });

    const currentLength = coverLetter?.length || 0;

    return (
        <span>
            {currentLength} / 3000 chars · min 50 — tell the client why you&apos;re
            the best fit
        </span>
    );
}