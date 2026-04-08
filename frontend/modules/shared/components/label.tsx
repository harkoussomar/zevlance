import { cn } from "@/modules/shared";

export function Label({
    className,
    children,
    required,
    ...props
}: React.LabelHTMLAttributes<HTMLLabelElement> & { required?: boolean }) {
    return (
        <label
            className={cn(
                "text-sm font-semibold text-foreground leading-none",
                className,
            )}
            {...props}
        >
            {children}
            {required && <span className="text-destructive ml-0.5">*</span>}
        </label>
    );
}
