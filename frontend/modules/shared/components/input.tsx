"use client";

import * as React from "react";
import { AlertCircle } from "lucide-react";
import { cn } from "@/modules/shared";

// ─── Base Input (shadcn primitive + your sizing/bg tweaks) ────────────────────

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        // your sizing (h-10, px-3) over shadcn's h-8/px-2.5
        "flex h-10 w-full min-w-0 rounded-lg border border-input bg-background px-3 py-2 text-sm",
        "placeholder:text-muted-foreground/60",
        // shadcn focus ring pattern
        "outline-none transition-colors duration-200",
        "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
        "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        // shadcn dark + file input extras
        "file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground",
        "dark:bg-input/30 dark:disabled:bg-input/80",
        // shadcn aria-invalid pattern (works alongside your error prop)
        "aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20",
        "dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
        className,
      )}
      {...props}
    />
  );
}

// ─── InputField (your icon + error wrapper) ───────────────────────────────────

export interface InputFieldProps extends React.ComponentProps<"input"> {
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  error?: string;
}

const InputField = React.forwardRef<HTMLInputElement, InputFieldProps>(
  ({ className, startIcon, endIcon, error, ...props }, ref) => (
    <div className="relative w-full">
      {startIcon && (
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
          {startIcon}
        </div>
      )}

      <Input
        ref={ref}
        aria-invalid={!!error || undefined}
        className={cn(
          startIcon && "pl-9",
          endIcon && "pr-9",
          className,
        )}
        {...props}
      />

      {endIcon && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
          {endIcon}
        </div>
      )}

      {error && (
        <p className="mt-1.5 text-xs text-destructive flex items-center gap-1">
          <AlertCircle className="w-3 h-3 shrink-0" />
          {error}
        </p>
      )}
    </div>
  ),
);

InputField.displayName = "InputField";

export { Input, InputField };