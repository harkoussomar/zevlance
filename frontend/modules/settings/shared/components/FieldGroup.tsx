import { Label } from "@/modules/shared/components/label";
import { Separator } from "@/modules/shared/components/separator";

interface FieldGroupProps {
  icon: React.ElementType;
  label: string;
  htmlFor?: string;
  hint?: string;
  children: React.ReactNode;
}

export function FieldGroup({
  icon: Icon,
  label,
  htmlFor,
  hint,
  children,
}: FieldGroupProps) {
  return (
    <>
      <div className="grid gap-4 items-start py-5 sm:grid-cols-[200px_1fr]">
        <div className="space-y-1 pt-0.5">
          <div className="flex items-center gap-2">
            <Icon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            <Label
              htmlFor={htmlFor}
              className="text-sm font-medium text-foreground cursor-pointer"
            >
              {label}
            </Label>
          </div>
          {hint && (
            <p className="text-xs text-muted-foreground leading-relaxed pl-5.5">
              {hint}
            </p>
          )}
        </div>
        <div>{children}</div>
      </div>
      <Separator />
    </>
  );
}