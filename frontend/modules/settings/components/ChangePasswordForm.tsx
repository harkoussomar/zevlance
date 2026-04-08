// ─── features/settings/components/ChangePasswordForm.tsx ──────────────────────

"use client";

import { useState } from "react";
import { Lock, Eye, EyeOff, Loader2, ShieldCheck } from "lucide-react";



import { useChangePassword } from "../hooks/useSettings";
import { cn } from "@/modules/shared";
import { Input } from "@/modules/shared/components/input";
import { Label } from "@/modules/shared/components/label";
import { Separator } from "@/modules/shared/components/separator";
import { Button } from "@/modules/shared/components/button";

// ─── Password strength meter ──────────────────────────────────────────────────

function strengthScore(pw: string): number {
  let score = 0;
  if (pw.length >= 8)  score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return score; // 0-5
}

function StrengthBar({ password }: { password: string }) {
  if (!password) return null;
  const score = strengthScore(password);
  const label = ["Very weak", "Weak", "Fair", "Good", "Strong", "Very strong"][score];
  const color = [
    "bg-destructive",
    "bg-orange-500",
    "bg-amber-400",
    "bg-yellow-400",
    "bg-emerald-400",
    "bg-emerald-500",
  ][score];

  return (
    <div className="space-y-1 mt-2">
      <div className="flex gap-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className={cn(
              "h-1 flex-1 rounded-full transition-colors duration-300",
              i < score ? color : "bg-border",
            )}
          />
        ))}
      </div>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

// ─── Reveal toggle input ──────────────────────────────────────────────────────

function PasswordInput({
  value,
  onChange,
  placeholder,
  id,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  id: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <Input
        id={id}
        type={show ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete="off"
        className="pr-10"
      />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
        tabIndex={-1}
      >
        {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
      </button>
    </div>
  );
}

// ─── ChangePasswordForm ───────────────────────────────────────────────────────

export function ChangePasswordForm() {
  const mutation = useChangePassword();

  const [current, setCurrent]   = useState("");
  const [next, setNext]         = useState("");
  const [confirm, setConfirm]   = useState("");
  const [done, setDone]         = useState(false);

  // Client-side guards
  const mismatch  = confirm.length > 0 && next !== confirm;
  const tooShort  = next.length > 0 && next.length < 8;
  const sameAsCur = next.length > 0 && next === current;
  const canSubmit =
    current.length > 0 &&
    next.length >= 8 &&
    next === confirm &&
    !sameAsCur &&
    !mutation.isPending;

  // Extract server error message (400 Bad Request body)
  const serverError =
    mutation.isError && mutation.error instanceof Error
      ? mutation.error.message
      : mutation.isError
        ? "Failed to change password. Please try again."
        : null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;

    await mutation.mutateAsync({ currentPassword: current, newPassword: next });

    // Clear & show success
    setCurrent("");
    setNext("");
    setConfirm("");
    setDone(true);
    setTimeout(() => setDone(false), 5000);
  }

  if (done) {
    return (
      <div className="flex flex-col items-center gap-3 py-10 text-center">
        <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center">
          <ShieldCheck className="w-6 h-6 text-emerald-500" />
        </div>
        <p className="font-semibold text-foreground">Password updated</p>
        <p className="text-sm text-muted-foreground">
          Your new password is active. Use it on your next login.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 max-w-sm">
      {/* Current password */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-2 mb-1">
          <Lock className="w-3.5 h-3.5 text-muted-foreground" />
          <Label htmlFor="current-pw" className="text-sm font-medium">
            Current password
          </Label>
        </div>
        <PasswordInput
          id="current-pw"
          value={current}
          onChange={setCurrent}
          placeholder="Your current password"
        />
      </div>

      <Separator />

      {/* New password */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-2 mb-1">
          <Lock className="w-3.5 h-3.5 text-muted-foreground" />
          <Label htmlFor="new-pw" className="text-sm font-medium">
            New password
          </Label>
        </div>
        <PasswordInput
          id="new-pw"
          value={next}
          onChange={setNext}
          placeholder="At least 8 characters"
        />
        {tooShort && (
          <p className="text-xs text-destructive">
            Password must be at least 8 characters.
          </p>
        )}
        {sameAsCur && (
          <p className="text-xs text-destructive">
            New password must differ from current password.
          </p>
        )}
        <StrengthBar password={next} />
      </div>

      {/* Confirm */}
      <div className="space-y-1.5">
        <Label htmlFor="confirm-pw" className="text-sm font-medium">
          Confirm new password
        </Label>
        <PasswordInput
          id="confirm-pw"
          value={confirm}
          onChange={setConfirm}
          placeholder="Repeat your new password"
        />
        {mismatch && (
          <p className="text-xs text-destructive">Passwords do not match.</p>
        )}
      </div>

      {/* Server error */}
      {serverError && (
        <p className="text-sm text-destructive">{serverError}</p>
      )}

      <Button type="submit" disabled={!canSubmit} className="w-full">
        {mutation.isPending ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          "Update password"
        )}
      </Button>
    </form>
  );
}