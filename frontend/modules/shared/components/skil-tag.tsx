import { X } from "lucide-react";

export function SkillTag({
    skill,
    onRemove,
}: {
    skill: string;
    onRemove?: () => void;
}) {
    return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-secondary text-secondary-foreground text-xs font-medium border border-border">
            {skill}
            {onRemove && (
                <button
                    onClick={onRemove}
                    className="ml-0.5 hover:text-destructive transition-colors"
                >
                    <X className="w-3 h-3" />
                </button>
            )}
        </span>
    );
}