import { cn } from "@/modules/shared";
import { Label } from "./label";

interface FormFieldProps {
    label: string;
    required?: boolean;
    hint?: string;
    error?: string;
    className?: string;
    children: React.ReactNode;
}

export function FormField({
    label,
    required,
    hint,
    error,
    className,
    children,
}: FormFieldProps) {
    return (
        <div className={cn("flex flex-col gap-1.5", className)}>
            <Label required={required}>{label}</Label>
            {children}
            {hint && !error && (
                <p className="text-xs text-muted-foreground">{hint}</p>
            )}
        </div>
    );
}
