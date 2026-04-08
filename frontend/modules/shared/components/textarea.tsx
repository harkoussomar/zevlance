import { cn } from "@/modules/shared";
import { AlertCircle } from "lucide-react";
import React from "react";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    error?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
    ({ className, error, ...props }, ref) => (
        <div className="w-full">
            <textarea
                ref={ref}
                className={cn(
                    "flex min-h-25 w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm",
                    "placeholder:text-muted-foreground/60 resize-y",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-ring",
                    "disabled:cursor-not-allowed disabled:opacity-50 transition-colors duration-200",
                    error &&
                        "border-destructive focus-visible:ring-destructive/30",
                    className,
                )}
                {...props}
            />
            {error && (
                <p className="mt-1.5 text-xs text-destructive flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    {error}
                </p>
            )}
        </div>
    ),
);
Textarea.displayName = "Textarea";
