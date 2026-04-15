// ─── features/settings/components/ClientSettingsForm.tsx ─────────────────────

"use client";

import { useId, useState } from "react";
import { User, Building2, Globe, AlignLeft } from "lucide-react";

import { ClientProfileResponse, useMyClientProfile } from "@/modules/profile/client";
import { Input } from "@/modules/shared/components/input";
import { Textarea } from "@/modules/shared/components/textarea";
import { UpdateClientProfileRequest } from "../types/settings.client";
import { useUpdateClientProfile } from "../hooks/useUpdateClientProfile";
import { AvatarUploader, FieldGroup, FormFooter } from "../../shared";

// ─── Form state ───────────────────────────────────────────────────────────────

interface FormState {
    name: string;
    profilePicture: string;
    companyName: string;
    companyDescription: string;
    website: string;
}

function toFormState(profile: ClientProfileResponse): FormState {
    return {
        name: profile.name ?? "",
        profilePicture: profile.profilePicture ?? "",
        companyName: profile.companyName ?? "",
        companyDescription: profile.companyDescription ?? "",
        website: profile.website ?? "",
    };
}

function buildPatch(
    form: FormState,
    profile: ClientProfileResponse,
): UpdateClientProfileRequest {
    const patch: UpdateClientProfileRequest = {};
    if (form.name !== (profile.name ?? "")) patch.name = form.name;
    if (form.profilePicture !== (profile.profilePicture ?? ""))
        patch.profilePicture = form.profilePicture || null;
    if (form.companyName !== (profile.companyName ?? ""))
        patch.companyName = form.companyName;
    if (form.companyDescription !== (profile.companyDescription ?? ""))
        patch.companyDescription = form.companyDescription;
    if (form.website !== (profile.website ?? "")) patch.website = form.website;
    return patch;
}

// ─── Inner form ───────────────────────────────────────────────────────────────

function ClientSettingsFormInner({
    profile,
}: {
    profile: ClientProfileResponse;
}) {
    const uid = useId();
    const {
        mutateAsync: patchProfile,
        isError,
        isPending,
    } = useUpdateClientProfile();
    const [form, setForm] = useState<FormState>(() => toFormState(profile));
    const [isSaved, setIsSaved] = useState(false);

    // Helpers
    const setField =
        (field: keyof FormState) =>
        (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
            setForm((prev) => ({ ...prev, [field]: e.target.value }));

    const setFieldValue = (field: keyof FormState) => (value: string) =>
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
                hint="Your name shown to freelancers across the platform."
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
                icon={Building2}
                label="Company Name"
                htmlFor={`${uid}-company`}
                hint="Helps freelancers understand who they'd be working with."
            >
                <Input
                    id={`${uid}-company`}
                    value={form.companyName}
                    onChange={setField("companyName")}
                    placeholder="Acme Corp"
                    maxLength={150}
                />
            </FieldGroup>

            <FieldGroup
                icon={Globe}
                label="Website"
                htmlFor={`${uid}-website`}
                hint="Your company or personal website."
            >
                <Input
                    id={`${uid}-website`}
                    value={form.website}
                    onChange={setField("website")}
                    placeholder="https://yourcompany.com"
                    maxLength={255}
                    type="url"
                    inputMode="url"
                />
            </FieldGroup>

            <FieldGroup
                icon={AlignLeft}
                label="About"
                htmlFor={`${uid}-about`}
                hint="A short description of your company or the projects you post."
            >
                <div>
                    <Textarea
                        id={`${uid}-about`}
                        value={form.companyDescription}
                        onChange={setField("companyDescription")}
                        placeholder="We build SaaS tools for..."
                        maxLength={1000}
                        rows={4}
                        className="resize-none"
                    />
                    <p className="mt-1.5 text-right text-xs text-muted-foreground tabular-nums">
                        {form.companyDescription.length}/1000
                    </p>
                </div>
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

export function ClientSettingsForm() {
    const { data: profile } = useMyClientProfile();
    if (!profile) return null;
    return <ClientSettingsFormInner key={profile.id} profile={profile} />;
}
