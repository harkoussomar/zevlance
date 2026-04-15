import { cn } from "@/modules/shared";
import { Label } from "./label";

interface FormFieldProps {
    label: string;
    required?: boolean;
    hint?: React.ReactNode; // 1. CHANGE: from string to React.ReactNode
    error?: string;         // (You can also change this to ReactNode if you ever want bold text in errors!)
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
                /* 2. CHANGE: <p> to <div>. 
                   Why? If you ever pass a React element that contains a <div> into 'hint', 
                   putting a <div> inside a <p> is invalid HTML and causes browser hydration errors. */
                <div className="text-xs text-muted-foreground">{hint}</div>
            )}
        </div>
    );
}