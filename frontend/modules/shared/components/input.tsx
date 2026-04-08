import { cn } from "@/modules/shared";
import { AlertCircle } from "lucide-react";
import React from "react";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    startIcon?: React.ReactNode;
    endIcon?: React.ReactNode;
    error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, type, startIcon, endIcon, error, ...props }, ref) => (
        <div className="relative w-full">
            {startIcon && (
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    {startIcon}
                </div>
            )}
            <input
                type={type}
                ref={ref}
                className={cn(
                    "flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm",
                    "placeholder:text-muted-foreground/60",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-ring",
                    "disabled:cursor-not-allowed disabled:opacity-50 transition-colors duration-200",
                    startIcon && "pl-9",
                    endIcon && "pr-9",
                    error &&
                        "border-destructive focus-visible:ring-destructive/30",
                    className,
                )}
                {...props}
            />
            {endIcon && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
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
Input.displayName = "Input";
