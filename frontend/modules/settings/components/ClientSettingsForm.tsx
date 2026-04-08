// ─── features/settings/components/ClientSettingsForm.tsx ──────────────────────

"use client";

import { useState, useEffect } from "react";
import { User, Building2, Globe, AlignLeft, Save, Loader2 } from "lucide-react";


import { useUpdateClientProfile } from "../hooks/useSettings";
import type { UpdateClientProfileRequest } from "../types";
import { Label } from "@/modules/shared/components/label";
import { useMyClientProfile } from "@/modules/profile";
import { Input } from "@/modules/shared/components/input";
import { Separator } from "@/modules/shared/components/separator";
import { Textarea } from "@/modules/shared/components/textarea";
import { Button } from "@/modules/shared/components/button";

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

// ─── ClientSettingsForm ───────────────────────────────────────────────────────

interface FormState {
  name: string;
  profilePicture: string;
  companyName: string;
  companyDescription: string;
  website: string;
}

function toFormState(profile: {
  name: string;
  profilePicture: string | null;
  companyName: string | null;
  companyDescription: string | null;
  website: string | null;
}): FormState {
  return {
    name:               profile.name               ?? "",
    profilePicture:     profile.profilePicture      ?? "",
    companyName:        profile.companyName         ?? "",
    companyDescription: profile.companyDescription  ?? "",
    website:            profile.website             ?? "",
  };
}

export function ClientSettingsForm() {
  const { data: profile } = useMyClientProfile();
  const mutation = useUpdateClientProfile();

  const [form, setForm] = useState<FormState>(() =>
    profile ? toFormState(profile) : {
      name: "", profilePicture: "", companyName: "",
      companyDescription: "", website: "",
    },
  );
  const [saved, setSaved] = useState(false);

  // Sync form when profile loads (handles first render after cache miss)
  useEffect(() => {
    if (profile) setForm(toFormState(profile));
  }, [profile]);

  const set = (field: keyof FormState) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }));

  // Build patch body — only send fields that changed
  function buildPatch(): UpdateClientProfileRequest {
    if (!profile) return {};
    const patch: UpdateClientProfileRequest = {};

    if (form.name !== profile.name) patch.name = form.name;
    if (form.profilePicture !== (profile.profilePicture ?? ""))
      patch.profilePicture = form.profilePicture;
    if (form.companyName !== (profile.companyName ?? ""))
      patch.companyName = form.companyName;
    if (form.companyDescription !== (profile.companyDescription ?? ""))
      patch.companyDescription = form.companyDescription;
    if (form.website !== (profile.website ?? ""))
      patch.website = form.website;

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
        hint="Your name as shown to freelancers across the platform."
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

      {/* ─── Company ───────────────────────────────────────────────────── */}
      <FieldGroup
        icon={Building2}
        label="Company Name"
        hint="Helps freelancers understand who they'd be working with."
      >
        <Input
          value={form.companyName}
          onChange={set("companyName")}
          placeholder="Acme Corp"
          maxLength={150}
        />
      </FieldGroup>

      <Separator />

      <FieldGroup
        icon={Globe}
        label="Website"
        hint="Your company or personal website."
      >
        <Input
          value={form.website}
          onChange={set("website")}
          placeholder="https://yourcompany.com"
          maxLength={255}
          type="url"
        />
      </FieldGroup>

      <Separator />

      <FieldGroup
        icon={AlignLeft}
        label="About"
        hint="A short description of your company or projects you post."
      >
        <Textarea
          value={form.companyDescription}
          onChange={set("companyDescription")}
          placeholder="We build SaaS tools for..."
          maxLength={1000}
          rows={4}
          className="resize-none"
        />
        <p className="text-xs text-muted-foreground mt-1.5 text-right">
          {form.companyDescription.length}/1000
        </p>
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