"use client";

import { Loader2 } from "lucide-react";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/modules/shared/components/alert-dialog";
import { cn } from "@/modules/shared";

type ConfirmDialogVariant = "destructive" | "warning" | "success" | "default";

interface ConfirmDialogProps {
    open: boolean;
    variant?: ConfirmDialogVariant;
    title: string;
    description: React.ReactNode;
    confirmLabel: string;
    isPending?: boolean;
    onConfirm: (e: React.MouseEvent<HTMLButtonElement>) => void;
    onCancel: () => void;
}

const variantStyles: Record<ConfirmDialogVariant, string> = {
    destructive:
        "bg-destructive text-destructive-foreground hover:bg-destructive/90 focus-visible:ring-destructive/30",
    warning:
        "bg-warning text-warning-foreground hover:bg-warning/90 focus-visible:ring-warning/30",
    success:
        "bg-success text-success-foreground hover:bg-success/90 focus-visible:ring-success/30",
    default:
        "bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:ring-primary/30",
};

export function ConfirmDialog({
    open,
    variant = "default",
    title,
    description,
    confirmLabel,
    isPending,
    onConfirm,
    onCancel,
}: ConfirmDialogProps) {
    return (
        <AlertDialog open={open} onOpenChange={(v) => !v && onCancel()}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{title}</AlertDialogTitle>
                    <AlertDialogDescription>
                        {description}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isPending}>
                        Go back
                    </AlertDialogCancel>
                    <AlertDialogAction
                        disabled={isPending}
                        onClick={onConfirm}
                        className={cn(
                            variantStyles[variant],
                            "flex items-center gap-2",
                        )}
                    >
                        {isPending && (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        )}
                        {isPending ? "Processing…" : confirmLabel}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
