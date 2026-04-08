"use client";

import { useForm, useWatch } from "react-hook-form";
import { Send } from "lucide-react";
import {
    createBidSchema,
    type CreateBidFormValues,
} from "../schemas/submit-bid.schema";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { useCreateBid } from "../hooks/useFreelancerBids";
import { Alert } from "@/modules/shared/components/alert";
import { FormField } from "@/modules/shared/components/form-field";
import { Input } from "@/modules/shared/components/input";
import { Textarea } from "@/modules/shared/components/textarea";
import { Button } from "@/modules/shared/components/button";
import { parseApiError } from "@/modules/shared";

interface BidFormProps {
    projectId: string;
    onSuccess?: () => void;
}

export function BidForm({ projectId, onSuccess }: BidFormProps) {
    const submitBid = useCreateBid(projectId);

    const {
        register,
        handleSubmit,
        control,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<CreateBidFormValues>({
        resolver: standardSchemaResolver(createBidSchema),
        defaultValues: {
            proposedPrice: undefined,
            estimatedDays: undefined,
            coverLetter: "",
        },
    });

    const coverLetter = useWatch({
        control,
        name: "coverLetter",
        defaultValue: "",
    });

    const coverLetterLength = coverLetter.length;

    const onSubmit = async (values: CreateBidFormValues) => {
        try {
            await submitBid.mutateAsync(values);
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
    const errorMessage = submitBid.error
        ? parseApiError(submitBid.error)
        : null;

    return (
        <form
            onSubmit={handleSubmit(onSubmit)}
            noValidate
            className="space-y-4"
        >
            {submitBid.isError && (
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
                    <Input
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
                    <Input
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
                hint={`${coverLetterLength} / 3000 chars · min 50 — tell the client why you're the best fit`}
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
                loading={isSubmitting}
                disabled={isSubmitting}
                className="w-full"
            >
                <Send className="w-4 h-4" />
                Submit Proposal
            </Button>
        </form>
    );
}
