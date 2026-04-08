import { cn } from "@/modules/shared";
import { X } from "lucide-react";
import React from "react";

interface DialogProps {
    open: boolean;
    onClose: () => void;
    title?: string;
    description?: string;
    children: React.ReactNode;
    size?: "sm" | "md" | "lg" | "xl";
}

const dialogSizes: Record<string, string> = {
    sm: "max-w-sm",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
};

export function Dialog({
    open,
    onClose,
    title,
    description,
    children,
    size = "md",
}: DialogProps) {
    React.useEffect(() => {
        if (open) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => {
            document.body.style.overflow = "";
        };
    }, [open]);

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-background/80 backdrop-blur-sm"
                onClick={onClose}
            />
            {/* Panel */}
            <div
                className={cn(
                    "relative w-full rounded-xl border border-border bg-card shadow-2xl",
                    "animate-in fade-in zoom-in-95 duration-200",
                    dialogSizes[size],
                )}
            >
                {/* Header */}
                {(title || description) && (
                    <div className="flex items-start justify-between p-5 border-b border-border">
                        <div>
                            {title && (
                                <h2 className="text-lg font-bold text-foreground">
                                    {title}
                                </h2>
                            )}
                            {description && (
                                <p className="text-sm text-muted-foreground mt-0.5">
                                    {description}
                                </p>
                            )}
                        </div>
                        <button
                            onClick={onClose}
                            className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                )}
                {/* Content */}
                <div className="p-5">{children}</div>
            </div>
        </div>
    );
}
