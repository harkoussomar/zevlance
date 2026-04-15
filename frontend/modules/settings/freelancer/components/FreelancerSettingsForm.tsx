// ─── features/settings/components/FreelancerSettingsForm.tsx ─────────────────

"use client";

import { useId, useState, useRef } from "react";
import { User, AlignLeft, DollarSign, Code, X, Plus } from "lucide-react";

import type { FreelancerProfileResponse } from "@/modules/profile/freelancer";
import { useMyFreelancerProfile } from "@/modules/profile/freelancer";
import { Input } from "@/modules/shared/components/input";
import { Textarea } from "@/modules/shared/components/textarea";
import { Badge } from "@/modules/shared/components/badge";
import { Button } from "@/modules/shared/components/button";
import { cn } from "@/modules/shared";
import { AvatarUploader } from "../../shared/components/AvatarUploader";
import { FieldGroup, FormFooter } from "../../shared";
import { useUpdateFreelancerProfile } from "../hooks/useUpdateFreelancerProfile";
import { UpdateFreelancerProfileRequest } from "../types/settings.freelancer";


// ─── Constants ────────────────────────────────────────────────────────────────

const MAX_SKILLS = 20;
const MAX_BIO_LENGTH = 2000;

// ─── SkillsInput ──────────────────────────────────────────────────────────────

interface SkillsInputProps {
    skills: string[];
    onChange: (next: string[]) => void;
}

function SkillsInput({ skills, onChange }: SkillsInputProps) {
    const [input, setInput] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);
    const remaining = MAX_SKILLS - skills.length;

    function addSkill() {
        const trimmed = input.trim();
        if (!trimmed || skills.includes(trimmed) || skills.length >= MAX_SKILLS)
            return;
        onChange([...skills, trimmed]);
        setInput("");
    }

    function removeSkill(skill: string) {
        onChange(skills.filter((s) => s !== skill));
    }

    function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
        if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            addSkill();
        }
        if (e.key === "Backspace" && input === "" && skills.length > 0) {
            onChange(skills.slice(0, -1));
        }
    }

    return (
        <div className="space-y-2">
            {/* Tag input container */}
            <div
                role="group"
                aria-label="Skills"
                className={cn(
                    "min-h-[2.625rem] flex flex-wrap gap-1.5 rounded-md border border-input bg-transparent px-3 py-2",
                    "transition-shadow duration-150",
                    "focus-within:outline-none focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
                    "cursor-text",
                )}
                onClick={() => inputRef.current?.focus()}
            >
                {skills.map((skill) => (
                    <Badge
                        key={skill}
                        variant="secondary"
                        className="gap-1 pr-1 text-xs font-medium"
                    >
                        {skill}
                        <button
                            type="button"
                            aria-label={`Remove ${skill}`}
                            onClick={(e) => {
                                e.stopPropagation();
                                removeSkill(skill);
                            }}
                            className="rounded-sm p-0.5 transition-colors hover:bg-muted-foreground/20"
                        >
                            <X className="h-3 w-3" />
                        </button>
                    </Badge>
                ))}

                <input
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onBlur={addSkill}
                    placeholder={
                        skills.length === 0 ? "React, Node.js, TypeScript…" : ""
                    }
                    disabled={skills.length >= MAX_SKILLS}
                    className="min-w-[8rem] flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed"
                    maxLength={50}
                />
            </div>

            {/* Helper row */}
            <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">
                    Press Enter or comma to add · {remaining} remaining
                </p>
                {input.trim() && (
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-6 gap-1 text-xs"
                        onClick={addSkill}
                    >
                        <Plus className="h-3 w-3" />
                        Add &ldquo;{input.trim()}&rdquo;
                    </Button>
                )}
            </div>
        </div>
    );
}

// ─── Form state ───────────────────────────────────────────────────────────────

interface FormState {
    name: string;
    profilePicture: string;
    bio: string;
    hourlyRate: string;
    skills: string[];
}

function toFormState(profile: FreelancerProfileResponse): FormState {
    return {
        name: profile.name ?? "",
        profilePicture: profile.profilePicture ?? "",
        bio: profile.bio ?? "",
        hourlyRate:
            profile.hourlyRate != null ? String(profile.hourlyRate) : "",
        skills: [...(profile.skills ?? [])],
    };
}

function buildPatch(
    form: FormState,
    profile: FreelancerProfileResponse,
): UpdateFreelancerProfileRequest {
    const patch: UpdateFreelancerProfileRequest = {};

    if (form.name !== (profile.name ?? "")) patch.name = form.name;
    if (form.profilePicture !== (profile.profilePicture ?? ""))
        patch.profilePicture = form.profilePicture || null;
    if (form.bio !== (profile.bio ?? "")) patch.bio = form.bio;

    const newRate = form.hourlyRate === "" ? null : Number(form.hourlyRate);
    if (newRate !== (profile.hourlyRate ?? null)) patch.hourlyRate = newRate;

    if (JSON.stringify(form.skills) !== JSON.stringify(profile.skills ?? []))
        patch.skills = form.skills;

    return patch;
}

// ─── Inner form ───────────────────────────────────────────────────────────────

function FreelancerSettingsFormInner({
    profile,
}: {
    profile: FreelancerProfileResponse;
}) {
    const uid = useId();
    const {
        mutateAsync: patchProfile,
        isError,
        isPending,
    } = useUpdateFreelancerProfile();
    const [form, setForm] = useState<FormState>(() => toFormState(profile));
    const [isSaved, setIsSaved] = useState(false);

    // Helpers
    const setField =
        (field: keyof Omit<FormState, "skills">) =>
        (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
            setForm((prev) => ({ ...prev, [field]: e.target.value }));

    const setFieldValue =
        (field: keyof Omit<FormState, "skills">) => (value: string) =>
            setForm((prev) => ({ ...prev, [field]: value }));

    const patch = buildPatch(form, profile);
    const isDirty = Object.keys(patch).length > 0;

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!isDirty) return;
        await patchProfile(patch);
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 3000);
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-0">
            {/* Avatar — auto-saves on upload */}
            <div className="py-5">
                <AvatarUploader
                    value={form.profilePicture}
                    onChange={setFieldValue("profilePicture")}
                    onSave={async (url) => {
                        await patchProfile({ profilePicture: url || null });
                    }}
                />
            </div>

            <div className="h-px bg-border" />

            <FieldGroup
                icon={User}
                label="Display Name"
                htmlFor={`${uid}-name`}
                hint="Your name shown on your public profile and in bids."
            >
                <Input
                    id={`${uid}-name`}
                    value={form.name}
                    onChange={setField("name")}
                    placeholder="Your full name"
                    maxLength={100}
                />
            </FieldGroup>

            <FieldGroup
                icon={AlignLeft}
                label="Bio"
                htmlFor={`${uid}-bio`}
                hint="Describe your background, expertise, and what you love building."
            >
                <div>
                    <Textarea
                        id={`${uid}-bio`}
                        value={form.bio}
                        onChange={setField("bio")}
                        placeholder="I'm a full-stack developer with 5 years of experience…"
                        maxLength={MAX_BIO_LENGTH}
                        rows={5}
                        className="resize-none"
                    />
                    <p className="mt-1.5 text-right text-xs text-muted-foreground tabular-nums">
                        {form.bio.length}/{MAX_BIO_LENGTH}
                    </p>
                </div>
            </FieldGroup>

            <FieldGroup
                icon={DollarSign}
                label="Hourly Rate"
                htmlFor={`${uid}-rate`}
                hint="Your default rate in USD. Shown on your public profile."
            >
                <div className="max-w-40">
                    <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground select-none">
                            $
                        </span>
                        <Input
                            id={`${uid}-rate`}
                            value={form.hourlyRate}
                            onChange={setField("hourlyRate")}
                            type="number"
                            min={0}
                            max={9999}
                            step={0.01}
                            placeholder="0.00"
                            className="pl-7"
                        />
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                        Per hour · USD
                    </p>
                </div>
            </FieldGroup>

            <FieldGroup
                icon={Code}
                label="Skills"
                hint="Technologies and tools you're proficient in. Up to 20."
            >
                <SkillsInput
                    skills={form.skills}
                    onChange={(skills) =>
                        setForm((prev) => ({ ...prev, skills }))
                    }
                />
            </FieldGroup>

            <FormFooter
                isDirty={isDirty}
                isPending={isPending}
                isError={isError}
                isSaved={isSaved}
            />
        </form>
    );
}

// ─── Shell with profile guard ─────────────────────────────────────────────────

export function FreelancerSettingsForm() {
    const { data: profile } = useMyFreelancerProfile();
    if (!profile) return null;
    return <FreelancerSettingsFormInner key={profile.id} profile={profile} />;
}
