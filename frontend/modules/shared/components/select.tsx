import { cn } from "@/modules/shared";
import { AlertCircle, ChevronDown } from "lucide-react";
import React from "react";

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    error?: string;
    placeholder?: string;
    options: Array<{ value: string; label: string }>;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
    ({ className, error, placeholder, options, ...props }, ref) => (
        <div className="relative w-full">
            <select
                ref={ref}
                className={cn(
                    "flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 pr-9 text-sm appearance-none cursor-pointer",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-ring",
                    "disabled:cursor-not-allowed disabled:opacity-50 transition-colors duration-200",
                    error &&
                        "border-destructive focus-visible:ring-destructive/30",
                    className,
                )}
                {...props}
            >
                {placeholder && (
                    <option value="" className="text-muted-foreground">
                        {placeholder}
                    </option>
                )}
                {options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                        {opt.label}
                    </option>
                ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            {error && (
                <p className="mt-1.5 text-xs text-destructive flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    {error}
                </p>
            )}
        </div>
    ),
);
Select.displayName = "Select";
