"use client";

import { useForm, useWatch, Controller } from "react-hook-form";
import { Plus, DollarSign, X, Zap, CalendarDays } from "lucide-react";

import { Button } from "@/modules/shared/components/button";
import { InputField } from "@/modules/shared/components/input";
import { Textarea } from "@/modules/shared/components/textarea";
import { FormField } from "@/modules/shared/components/form-field";
import { Alert } from "@/modules/shared/components/alert";
import { DatePicker } from "@/modules/shared/components/date-picker";

import {
    addMilestoneSchema,
    type AddMilestoneFormValues,
} from "../schemas/add-milestone.schema";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { cn } from "@/modules/shared";
import type { CreateMilestoneRequest } from "../types/milestone.client";

interface AddMilestoneFormProps {
    isPending: boolean;
    serverError?: string | null;
    onAdd: (payload: CreateMilestoneRequest) => void;
    onCancel: () => void;
    /** Total agreed price of the contract */
    agreedPrice: number;
    /** Sum of all existing milestone amounts (used to compute remaining) */
    allocatedAmount: number;
    /** Contract end date (ISO string, e.g. "2026-08-01") — constrains max due date */
    contractEndDate?: string | null;
    /** Due date of the last existing milestone — constrains min due date for ordering */
    lastMilestoneDueDate?: string | null;
}

export function AddMilestoneForm({
    isPending,
    serverError,
    onAdd,
    onCancel,
    agreedPrice,
    allocatedAmount,
    contractEndDate,
    lastMilestoneDueDate,
}: AddMilestoneFormProps) {
    const today = new Date().toISOString().split("T")[0];

    // Min due date: whichever is later — today or last milestone's due date
    const minDueDate = lastMilestoneDueDate
        ? lastMilestoneDueDate > today
            ? lastMilestoneDueDate
            : today
        : today;

    const remainingAmount = Math.max(0, agreedPrice - allocatedAmount);

    const {
        register,
        handleSubmit,
        setValue,
        control,
        formState: { errors },
    } = useForm<AddMilestoneFormValues>({
        resolver: standardSchemaResolver(addMilestoneSchema),
        defaultValues: {
            title: "",
            description: "",
            amount: undefined,
            dueDate: "",
        },
    });

    const watchedAmount = useWatch({ control, name: "amount" });
    const remainingAfterThis = remainingAmount - (Number(watchedAmount) || 0);
    const isOverBudget = remainingAfterThis < 0;

    const onSubmit = (values: AddMilestoneFormValues) => {
        onAdd({
            title: values.title,
            description: values.description || undefined,
            amount: values.amount,
            dueDate: values.dueDate,
        });
    };

    return (
        <form
            onSubmit={handleSubmit(onSubmit)}
            noValidate
            className="space-y-4"
        >
            {/* Server error */}
            {serverError && (
                <Alert variant="destructive" className="text-sm">
                    {serverError}
                </Alert>
            )}

            {/* Title + Amount row */}
            <div className="grid sm:grid-cols-2 gap-3">
                <FormField
                    label="Milestone Title"
                    required
                    error={errors.title?.message}
                >
                    <InputField
                        {...register("title")}
                        placeholder="e.g. Backend API Setup"
                        disabled={isPending}
                    />
                </FormField>

                <FormField
                    label="Amount (USD)"
                    required
                    error={errors.amount?.message}
                >
                    <div className="space-y-1.5">
                        <div className="flex gap-2">
                            <InputField
                                {...register("amount", { valueAsNumber: true })}
                                type="number"
                                min={0}
                                step="0.01"
                                placeholder="400"
                                startIcon={
                                    <DollarSign className="w-3.5 h-3.5" />
                                }
                                disabled={isPending}
                                className={cn(
                                    isOverBudget &&
                                        "border-destructive focus-visible:ring-destructive/30",
                                )}
                            />
                            {remainingAmount > 0 && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="default"
                                    disabled={isPending}
                                    onClick={() =>
                                        setValue("amount", remainingAmount, {
                                            shouldValidate: true,
                                        })
                                    }
                                >
                                    <Zap className="w-3 h-3" />
                                    Use ${remainingAmount.toFixed(0)}
                                </Button>
                            )}
                        </div>

                        {/* Live remaining indicator */}
                        {watchedAmount != null && watchedAmount > 0 && (
                            <p
                                className={cn(
                                    "text-[11px] font-medium flex items-center gap-1",
                                    isOverBudget
                                        ? "text-destructive"
                                        : "text-muted-foreground",
                                )}
                            >
                                {isOverBudget ? (
                                    <>
                                        Over budget by $
                                        {Math.abs(remainingAfterThis).toFixed(
                                            2,
                                        )}
                                    </>
                                ) : (
                                    <>
                                        Remaining after this:{" "}
                                        <span className="text-foreground">
                                            ${remainingAfterThis.toFixed(2)}
                                        </span>
                                    </>
                                )}
                            </p>
                        )}
                    </div>
                </FormField>
            </div>

            {/* Due Date */}
            <FormField
                label="Due Date"
                required
                error={errors.dueDate?.message}
                hint={
                    contractEndDate
                        ? `Must be on or before the contract end date (${contractEndDate})`
                        : lastMilestoneDueDate
                          ? `Must be after the previous milestone's due date`
                          : undefined
                }
            >
                <Controller
                    control={control}
                    name="dueDate"
                    render={({ field }) => (
                        <DatePicker
                            {...field}
                            min={minDueDate}
                            max={contractEndDate ?? undefined}
                            disabled={isPending}
                            hasError={!!errors.dueDate?.message}
                        />
                    )}
                />
            </FormField>

            {/* Description */}
            <FormField
                label="Description"
                hint="What will be delivered in this milestone?"
                error={errors.description?.message}
            >
                <Textarea
                    {...register("description")}
                    placeholder="Describe the expected deliverable…"
                    rows={2}
                    disabled={isPending}
                />
            </FormField>

            {/* Actions */}
            <div className="flex gap-2 pt-1">
                <Button
                    type="submit"
                    variant="outline"
                    loading={isPending}
                    className="flex-1"
                >
                    <Plus className="w-3.5 h-3.5" />
                    Add Milestone
                </Button>
                <Button
                    type="button"
                    variant="destructive"
                    onClick={onCancel}
                    disabled={isPending}
                >
                    <X className="w-3.5 h-3.5" />
                    Cancel
                </Button>
            </div>
        </form>
    );
}
