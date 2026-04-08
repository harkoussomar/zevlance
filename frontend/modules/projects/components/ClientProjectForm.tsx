// features/projects/components/ProjectForm.tsx
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import {
    Briefcase,
    DollarSign,
    Tag,
    Calendar,
    Eye,
    PlusCircle,
    CheckCircle2,
    Clock,
    GitBranch,
    AlertCircle,
} from "lucide-react";

import {
    projectSchema,
    type ProjectFormValues,
} from "../schema/create.project.schema";
import { useCreateProject, useUpdateProject } from "../hooks/useProject";
import { cn } from "@/modules/shared";

import { Card, CardContent } from "@/modules/shared/components/card";
import { FormField } from "@/modules/shared/components/form-field";
import { Input } from "@/modules/shared/components/input";
import { Textarea } from "@/modules/shared/components/textarea";
import { Select } from "@/modules/shared/components/select";
import { Button } from "@/modules/shared/components/button";
import { Alert } from "@/modules/shared/components/alert";
import {
    CategoryBadge,
    ProjectStatusBadge,
} from "@/modules/shared/components/status-badge";
import { SkillTag } from "@/modules/shared/components/skil-tag";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { ProjectCategory } from "../types";
import { CATEGORY_OPTIONS } from "@/modules/shared";

// ─── Step Progress ────────────────────────────────────────────────────────────

interface Step {
    number: number;
    label: string;
    icon: React.ReactNode;
    color: string;
    fields: (keyof ProjectFormValues)[];
}

const STEPS: Step[] = [
    {
        number: 1,
        label: "Project Basics",
        icon: <Briefcase className="w-3.5 h-3.5" />,
        color: "text-primary bg-primary/10",
        fields: ["title", "category", "description"],
    },
    {
        number: 2,
        label: "Budget Range",
        icon: <DollarSign className="w-3.5 h-3.5" />,
        color: "text-emerald-600 bg-emerald-500/10",
        fields: ["budgetMin", "budgetMax"],
    },
    {
        number: 3,
        label: "Skills & Timeline",
        icon: <Tag className="w-3.5 h-3.5" />,
        color: "text-purple-600 bg-purple-500/10",
        fields: ["requiredSkills", "deadline"],
    },
];

function StepProgress({
    values,
    errors,
}: {
    values: Partial<ProjectFormValues>;
    errors: Record<string, unknown>;
}) {
    const isStepFilled = (step: Step) =>
        step.fields.every((f) => {
            const v = values[f];
            if (Array.isArray(v)) return true; // skills optional
            return !!v && !errors[f];
        });

    return (
        <div className="space-y-2">
            {STEPS.map((step) => {
                const filled = isStepFilled(step);
                return (
                    <div
                        key={step.number}
                        className={cn(
                            "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200",
                            filled ? "bg-muted/50" : "bg-transparent",
                        )}
                    >
                        <div
                            className={cn(
                                "w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-all duration-200",
                                filled
                                    ? "bg-emerald-500/10 text-emerald-600"
                                    : step.color,
                            )}
                        >
                            {filled ? (
                                <CheckCircle2 className="w-3.5 h-3.5" />
                            ) : (
                                step.icon
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p
                                className={cn(
                                    "text-xs font-semibold transition-colors",
                                    filled
                                        ? "text-foreground"
                                        : "text-muted-foreground",
                                )}
                            >
                                {step.label}
                            </p>
                        </div>
                        {filled && (
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                        )}
                    </div>
                );
            })}
        </div>
    );
}

// ─── Live Preview Card ─────────────────────────────────────────────────────────

function LivePreview({ values }: { values: Partial<ProjectFormValues> }) {
    const hasContent = values.title || values.category;

    return (
        <div className="space-y-3">
            <div className="flex items-center gap-2">
                <div className="p-1 rounded bg-muted">
                    <Eye className="w-3.5 h-3.5 text-muted-foreground" />
                </div>
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Live Preview
                </span>
            </div>

            <Card
                className={cn(
                    "transition-all duration-300 overflow-hidden",
                    !hasContent && "opacity-40",
                )}
            >
                <CardContent className="p-4 space-y-3">
                    {/* Badges */}
                    <div className="flex items-center gap-2 flex-wrap">
                        {values.category ? (
                            <CategoryBadge category={values.category} />
                        ) : (
                            <span className="inline-flex items-center h-5 px-2 rounded-full bg-muted text-muted-foreground text-[10px] font-semibold">
                                Category
                            </span>
                        )}
                        <ProjectStatusBadge status="OPEN" />
                    </div>

                    {/* Title */}
                    <p
                        className={cn(
                            "text-sm font-bold leading-snug line-clamp-2",
                            !values.title && "text-muted-foreground italic",
                        )}
                    >
                        {values.title || "Your project title will appear here…"}
                    </p>

                    {/* Description snippet */}
                    {values.description && (
                        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                            {values.description}
                        </p>
                    )}

                    {/* Meta row */}
                    <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                            <GitBranch className="w-3 h-3" />
                            <span className="text-foreground font-semibold">
                                0
                            </span>{" "}
                            proposals
                        </span>
                        {values.deadline && (
                            <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                Due{" "}
                                {new Date(values.deadline).toLocaleDateString(
                                    "en-US",
                                    {
                                        month: "short",
                                        day: "numeric",
                                        year: "numeric",
                                    },
                                )}
                            </span>
                        )}
                        {values.budgetMin && values.budgetMax && (
                            <span className="font-semibold text-foreground">
                                ${Number(values.budgetMin).toLocaleString()}
                                {" – "}$
                                {Number(values.budgetMax).toLocaleString()}
                            </span>
                        )}
                    </div>

                    {/* Skills */}
                    {values.requiredSkills &&
                    values.requiredSkills.length > 0 ? (
                        <div className="flex gap-1.5 flex-wrap">
                            {values.requiredSkills.slice(0, 5).map((skill) => (
                                <SkillTag key={skill} skill={skill} />
                            ))}
                            {values.requiredSkills.length > 5 && (
                                <span className="text-[10px] text-muted-foreground font-medium self-center">
                                    +{values.requiredSkills.length - 5}
                                </span>
                            )}
                        </div>
                    ) : (
                        <div className="flex gap-1.5">
                            {["Skill 1", "Skill 2"].map((s) => (
                                <span
                                    key={s}
                                    className="text-[10px] px-2 py-0.5 rounded-md bg-muted text-muted-foreground font-medium"
                                >
                                    {s}
                                </span>
                            ))}
                        </div>
                    )}

                    {/* Budget bar */}
                    {values.budgetMin &&
                        values.budgetMax &&
                        Number(values.budgetMax) >=
                            Number(values.budgetMin) && (
                            <div className="pt-1 space-y-1">
                                <div className="flex justify-between text-[10px] text-muted-foreground">
                                    <span>
                                        $
                                        {Number(
                                            values.budgetMin,
                                        ).toLocaleString()}
                                    </span>
                                    <span>
                                        $
                                        {Number(
                                            values.budgetMax,
                                        ).toLocaleString()}
                                    </span>
                                </div>
                                <div className="h-1 rounded-full bg-muted overflow-hidden">
                                    <div
                                        className="h-full rounded-full bg-linear-to-r from-primary/60 to-primary"
                                        style={{
                                            width: `${Math.min(
                                                100,
                                                Math.max(
                                                    20,
                                                    (Number(values.budgetMax) /
                                                        Math.max(
                                                            Number(
                                                                values.budgetMax,
                                                            ) * 1.5,
                                                            10000,
                                                        )) *
                                                        100,
                                                ),
                                            )}%`,
                                        }}
                                    />
                                </div>
                            </div>
                        )}
                </CardContent>
            </Card>

            {!hasContent && (
                <p className="text-xs text-muted-foreground text-center">
                    Start filling in the form to see a preview
                </p>
            )}
        </div>
    );
}

// ─── Props ─────────────────────────────────────────────────────────────────────

interface ProjectFormProps {
    mode: "create" | "edit";
    defaultValues?: Partial<ProjectFormValues>;
    projectId?: string;
    onSuccess?: () => void;
}

// ─── Main Component ────────────────────────────────────────────────────────────

export function ProjectForm({
    mode,
    defaultValues,
    projectId,
    onSuccess,
}: ProjectFormProps) {
    const [skillInput, setSkillInput] = useState("");
    const [submitted, setSubmitted] = useState(false);

    const createProject = useCreateProject();
    const updateProject = useUpdateProject(projectId ?? "");

    const mutation = mode === "create" ? createProject : updateProject;

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors, isSubmitting },
    } = useForm<ProjectFormValues>({
        resolver: standardSchemaResolver(projectSchema),
        defaultValues: {
            requiredSkills: [],
            ...defaultValues,
        },
    });

    const watchedValues = watch();
    const skills = watchedValues.requiredSkills ?? [];

    const addSkill = () => {
        const skill = skillInput.trim();
        if (skill && !skills.includes(skill) && skills.length < 10) {
            setValue("requiredSkills", [...skills, skill], {
                shouldValidate: true,
            });
            setSkillInput("");
        }
    };

    const removeSkill = (skill: string) => {
        setValue(
            "requiredSkills",
            skills.filter((s) => s !== skill),
            { shouldValidate: true },
        );
    };

    const onSubmit = async (values: ProjectFormValues) => {
        await mutation.mutateAsync(values as never);
        setSubmitted(true);
        onSuccess?.();
    };

    const serverError = mutation.isError
        ? ((mutation.error as Error)?.message ??
          "Something went wrong. Please try again.")
        : null;

    const today = new Date().toISOString().split("T")[0];
    const isEdit = mode === "edit";

    return (
        <form
            onSubmit={handleSubmit(onSubmit)}
            noValidate
            className="space-y-0"
        >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* ── Left: Form sections ───────────────────────────────────────── */}
                <div className="lg:col-span-7 space-y-5">
                    {serverError && (
                        <Alert variant="destructive">
                            <AlertCircle className="w-4 h-4" />
                            {serverError}
                        </Alert>
                    )}

                    {/* Section 1: Basics */}
                    <Card>
                        <CardContent className="p-6 space-y-5">
                            <div className="flex items-center gap-2.5">
                                <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                                    <span className="text-xs font-bold">1</span>
                                </div>
                                <h2 className="font-bold text-foreground">
                                    Project Basics
                                </h2>
                            </div>

                            <FormField
                                label="Project Title"
                                required
                                error={errors.title?.message}
                                hint='Be specific — e.g. "Spring Boot REST API with JWT auth and PostgreSQL"'
                            >
                                <Input
                                    placeholder="Build a production-grade REST API…"
                                    maxLength={200}
                                    error={errors.title?.message}
                                    {...register("title")}
                                />
                                <div className="text-right text-[10px] text-muted-foreground mt-1">
                                    {(watchedValues.title ?? "").length}/200
                                </div>
                            </FormField>

                            <FormField
                                label="Category"
                                required
                                error={errors.category?.message}
                            >
                                <Select
                                    value={watchedValues.category ?? ""}
                                    onChange={(e) =>
                                        setValue(
                                            "category",
                                            e.target.value as ProjectCategory,
                                            {
                                                shouldValidate: true,
                                            },
                                        )
                                    }
                                    placeholder="Select a category"
                                    options={CATEGORY_OPTIONS}
                                    error={errors.category?.message}
                                />
                            </FormField>

                            <FormField
                                label="Description"
                                required
                                error={errors.description?.message}
                                hint="Describe goals, deliverables, tech stack, and constraints. 200+ words recommended."
                            >
                                <Textarea
                                    placeholder="We need a production-grade REST API built with Spring Boot 3.x. The API must include JWT-based authentication, role-based access control, PostgreSQL integration via JPA/Hibernate…"
                                    rows={7}
                                    error={errors.description?.message}
                                    {...register("description")}
                                />
                            </FormField>
                        </CardContent>
                    </Card>

                    {/* Section 2: Budget */}
                    <Card>
                        <CardContent className="p-6 space-y-5">
                            <div className="flex items-center gap-2.5">
                                <div className="w-7 h-7 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
                                    <span className="text-xs font-bold">2</span>
                                </div>
                                <h2 className="font-bold text-foreground">
                                    Budget Range
                                </h2>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    label="Minimum (USD)"
                                    required
                                    error={errors.budgetMin?.message}
                                >
                                    <Input
                                        type="number"
                                        placeholder="500"
                                        min="1"
                                        error={errors.budgetMin?.message}
                                        startIcon={
                                            <span className="text-xs font-bold">
                                                $
                                            </span>
                                        }
                                        {...register("budgetMin")}
                                    />
                                </FormField>

                                <FormField
                                    label="Maximum (USD)"
                                    required
                                    error={errors.budgetMax?.message}
                                >
                                    <Input
                                        type="number"
                                        placeholder="2000"
                                        min="1"
                                        error={errors.budgetMax?.message}
                                        startIcon={
                                            <span className="text-xs font-bold">
                                                $
                                            </span>
                                        }
                                        {...register("budgetMax")}
                                    />
                                </FormField>
                            </div>

                            {/* Budget range visual */}
                            {watchedValues.budgetMin &&
                                watchedValues.budgetMax &&
                                Number(watchedValues.budgetMax) >=
                                    Number(watchedValues.budgetMin) && (
                                    <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-emerald-500/5 border border-emerald-500/15">
                                        <DollarSign className="w-4 h-4 text-emerald-600 shrink-0" />
                                        <p className="text-sm font-semibold text-foreground">
                                            $
                                            {Number(
                                                watchedValues.budgetMin,
                                            ).toLocaleString()}
                                            <span className="text-muted-foreground font-normal mx-1.5">
                                                –
                                            </span>
                                            $
                                            {Number(
                                                watchedValues.budgetMax,
                                            ).toLocaleString()}
                                        </p>
                                        <span className="text-xs text-emerald-600 font-medium ml-auto">
                                            Range looks good
                                        </span>
                                    </div>
                                )}
                        </CardContent>
                    </Card>

                    {/* Section 3: Skills + Deadline */}
                    <Card>
                        <CardContent className="p-6 space-y-5">
                            <div className="flex items-center gap-2.5">
                                <div className="w-7 h-7 rounded-full bg-purple-500/10 text-purple-600 flex items-center justify-center shrink-0">
                                    <span className="text-xs font-bold">3</span>
                                </div>
                                <h2 className="font-bold text-foreground">
                                    Skills & Timeline
                                </h2>
                            </div>

                            {/* Skills input */}
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-foreground">
                                    Required Skills
                                </label>
                                <div className="flex gap-2">
                                    <Input
                                        placeholder="e.g. Java, Spring Boot, PostgreSQL…"
                                        value={skillInput}
                                        onChange={(e) =>
                                            setSkillInput(e.target.value)
                                        }
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter") {
                                                e.preventDefault();
                                                addSkill();
                                            }
                                        }}
                                    />
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={addSkill}
                                        disabled={
                                            !skillInput.trim() ||
                                            skills.length >= 10
                                        }
                                    >
                                        <PlusCircle className="w-4 h-4" />
                                        Add
                                    </Button>
                                </div>

                                {skills.length > 0 && (
                                    <div className="flex flex-wrap gap-2 pt-1">
                                        {skills.map((skill) => (
                                            <SkillTag
                                                key={skill}
                                                skill={skill}
                                                onRemove={() =>
                                                    removeSkill(skill)
                                                }
                                            />
                                        ))}
                                    </div>
                                )}

                                <p className="text-xs text-muted-foreground">
                                    Press Enter or click Add. Max 10 skills. (
                                    {skills.length}/10)
                                </p>
                            </div>

                            {/* Deadline */}
                            <FormField
                                label="Deadline"
                                required
                                error={errors.deadline?.message}
                                hint="The date by which you need the project completed"
                            >
                                <Input
                                    type="date"
                                    min={today}
                                    error={errors.deadline?.message}
                                    startIcon={<Calendar className="w-4 h-4" />}
                                    {...register("deadline")}
                                />
                            </FormField>
                        </CardContent>
                    </Card>

                    {/* Submit */}
                    <div className="flex gap-3 pb-8">
                        <Button
                            type="submit"
                            size="lg"
                            variant="outline"
                            loading={isSubmitting}
                            disabled={isSubmitting}
                            className="gap-2"
                        >
                            {isEdit ? (
                                <>
                                    <CheckCircle2 className="w-4 h-4" />
                                    Save Changes
                                </>
                            ) : (
                                " Publish Project"
                            )}
                        </Button>
                        <Button
                            type="button"
                            variant="destructive"
                            size="lg"
                            onClick={() => window.history.back()}
                        >
                            Cancel
                        </Button>
                    </div>
                </div>

                {/* ── Right: Sticky sidebar ─────────────────────────────────────── */}
                <div className="hidden lg:block lg:col-span-5">
                    <div className="sticky top-24 space-y-6">
                        {/* Progress tracker */}
                        <Card>
                            <CardContent className="p-4">
                                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3 px-1">
                                    Completion
                                </p>
                                <StepProgress
                                    values={watchedValues}
                                    errors={errors}
                                />
                            </CardContent>
                        </Card>

                        {/* Live preview */}
                        <LivePreview values={watchedValues} />
                    </div>
                </div>
            </div>
        </form>
    );
}
