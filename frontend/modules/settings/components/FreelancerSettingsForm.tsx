// ─── features/settings/components/FreelancerSettingsForm.tsx ──────────────────

"use client";

import { useState, useEffect, useRef } from "react";
import {
  User,
  AlignLeft,
  DollarSign,
  Code,
  Save,
  Loader2,
  X,
  Plus,
} from "lucide-react";



import { useUpdateFreelancerProfile } from "../hooks/useSettings";
import type { UpdateFreelancerProfileRequest } from "../types";
import { Label } from "@/modules/shared/components/label";
import { cn } from "@/modules/shared";
import { Badge } from "@/modules/shared/components/badge";
import { Button } from "@/modules/shared/components/button";
import { useMyFreelancerProfile } from "@/modules/profile";
import { Input } from "@/modules/shared/components/input";
import { Separator } from "@/modules/shared/components/separator";
import { Textarea } from "@/modules/shared/components/textarea";

// ─── Field group wrapper ──────────────────────────────────────────────────────

function FieldGroup({
  icon: Icon,
  label,
  hint,
  children,
}: {
  icon: React.ElementType;
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid sm:grid-cols-[200px_1fr] gap-4 items-start py-5">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <Icon className="w-3.5 h-3.5 text-muted-foreground" />
          <Label className="text-sm font-medium text-foreground">{label}</Label>
        </div>
        {hint && (
          <p className="text-xs text-muted-foreground leading-relaxed">{hint}</p>
        )}
      </div>
      <div>{children}</div>
    </div>
  );
}

// ─── Skills tag input ─────────────────────────────────────────────────────────

function SkillsInput({
  skills,
  onChange,
}: {
  skills: string[];
  onChange: (next: string[]) => void;
}) {
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  function addSkill() {
    const trimmed = input.trim();
    if (!trimmed || skills.includes(trimmed) || skills.length >= 20) return;
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
      <div
        className={cn(
          "min-h-10.5 flex flex-wrap gap-1.5 px-3 py-2",
          "rounded-md border border-input bg-transparent",
          "focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
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
              onClick={(e) => {
                e.stopPropagation();
                removeSkill(skill);
              }}
              className="rounded-sm hover:bg-muted-foreground/20 p-0.5 transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          </Badge>
        ))}
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={addSkill}
          placeholder={skills.length === 0 ? "Type a skill, press Enter..." : ""}
          className="flex-1 min-w-30 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          maxLength={50}
        />
      </div>
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          Press Enter or comma to add. {20 - skills.length} remaining.
        </p>
        {input.trim() && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-6 text-xs gap-1"
            onClick={addSkill}
          >
            <Plus className="w-3 h-3" />
            Add &ldquo;{input.trim()}&rdquo;
          </Button>
        )}
      </div>
    </div>
  );
}

// ─── FreelancerSettingsForm ───────────────────────────────────────────────────

interface FormState {
  name: string;
  profilePicture: string;
  bio: string;
  hourlyRate: string; // string so the input stays controlled cleanly
  skills: string[];
}

function toFormState(profile: {
  name: string;
  profilePicture: string | null;
  bio: string | null;
  hourlyRate: number | null;
  skills: string[];
}): FormState {
  return {
    name:           profile.name            ?? "",
    profilePicture: profile.profilePicture  ?? "",
    bio:            profile.bio             ?? "",
    hourlyRate:     profile.hourlyRate != null ? String(profile.hourlyRate) : "",
    skills:         [...profile.skills],
  };
}

export function FreelancerSettingsForm() {
  const { data: profile } = useMyFreelancerProfile();
  const mutation = useUpdateFreelancerProfile();

  const [form, setForm] = useState<FormState>(() =>
    profile
      ? toFormState(profile)
      : { name: "", profilePicture: "", bio: "", hourlyRate: "", skills: [] },
  );
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (profile) setForm(toFormState(profile));
  }, [profile]);

  const set =
    (field: keyof Omit<FormState, "skills">) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }));

  function buildPatch(): UpdateFreelancerProfileRequest {
    if (!profile) return {};
    const patch: UpdateFreelancerProfileRequest = {};

    if (form.name !== profile.name) patch.name = form.name;

    if (form.profilePicture !== (profile.profilePicture ?? ""))
      patch.profilePicture = form.profilePicture;

    if (form.bio !== (profile.bio ?? "")) patch.bio = form.bio;

    const newRate = form.hourlyRate === "" ? null : Number(form.hourlyRate);
    if (newRate !== profile.hourlyRate) patch.hourlyRate = newRate;

    const skillsChanged =
      JSON.stringify(form.skills) !== JSON.stringify(profile.skills);
    if (skillsChanged) patch.skills = form.skills;

    return patch;
  }

  const isDirty = Object.keys(buildPatch()).length > 0;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const patch = buildPatch();
    if (!isDirty) return;

    await mutation.mutateAsync(patch);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-0">
      {/* ─── Identity ──────────────────────────────────────────────────── */}
      <FieldGroup
        icon={User}
        label="Display Name"
        hint="Your name as shown on your public profile and in bids."
      >
        <Input
          value={form.name}
          onChange={set("name")}
          placeholder="Your full name"
          maxLength={100}
        />
      </FieldGroup>

      <Separator />

      <FieldGroup
        icon={User}
        label="Profile Picture"
        hint="Paste a URL to your avatar image (Cloudinary, etc)."
      >
        <div className="space-y-2">
          <Input
            value={form.profilePicture}
            onChange={set("profilePicture")}
            placeholder="https://res.cloudinary.com/..."
            maxLength={512}
          />
          {form.profilePicture && (
            <img
              src={form.profilePicture}
              alt="Preview"
              className="w-14 h-14 rounded-full object-cover border border-border"
              onError={(e) => (e.currentTarget.style.display = "none")}
            />
          )}
        </div>
      </FieldGroup>

      <Separator />

      {/* ─── Bio ───────────────────────────────────────────────────────── */}
      <FieldGroup
        icon={AlignLeft}
        label="Bio"
        hint="Describe your background, expertise, and what you love building."
      >
        <Textarea
          value={form.bio}
          onChange={set("bio")}
          placeholder="I'm a full-stack developer with 5 years of experience..."
          maxLength={2000}
          rows={5}
          className="resize-none"
        />
        <p className="text-xs text-muted-foreground mt-1.5 text-right">
          {form.bio.length}/2000
        </p>
      </FieldGroup>

      <Separator />

      {/* ─── Rate ──────────────────────────────────────────────────────── */}
      <FieldGroup
        icon={DollarSign}
        label="Hourly Rate"
        hint="Your default rate in USD. Clients can see this on your profile."
      >
        <div className="relative max-w-40">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
            $
          </span>
          <Input
            value={form.hourlyRate}
            onChange={set("hourlyRate")}
            type="number"
            min={0}
            max={9999}
            step={0.01}
            placeholder="0.00"
            className="pl-7"
          />
        </div>
        <p className="text-xs text-muted-foreground mt-1">Per hour · USD</p>
      </FieldGroup>

      <Separator />

      {/* ─── Skills ────────────────────────────────────────────────────── */}
      <FieldGroup
        icon={Code}
        label="Skills"
        hint="Technologies and tools you're proficient in. Up to 20."
      >
        <SkillsInput
          skills={form.skills}
          onChange={(skills) => setForm((prev) => ({ ...prev, skills }))}
        />
      </FieldGroup>

      {/* ─── Footer ────────────────────────────────────────────────────── */}
      <div className="pt-6 flex items-center justify-between gap-4">
        {mutation.isError && (
          <p className="text-sm text-destructive">
            Failed to save. Please try again.
          </p>
        )}
        {saved && !mutation.isError && (
          <p className="text-sm text-emerald-500">Changes saved.</p>
        )}
        {!mutation.isError && !saved && <span />}

        <Button
          type="submit"
          disabled={!isDirty || mutation.isPending}
          className="min-w-30"
        >
          {mutation.isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Save changes
            </>
          )}
        </Button>
      </div>
    </form>
  );
}