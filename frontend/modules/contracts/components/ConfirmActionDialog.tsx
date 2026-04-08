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
import type { ContractActionType } from "../types";

interface ConfirmActionDialogProps {
  open: boolean;
  type: ContractActionType;
  title: string;
  description: string;
  isPending?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const actionConfig: Record<
  ContractActionType,
  { label: string; className: string }
> = {
  complete: {
    label: "Yes, complete contract",
    className:
      "bg-emerald-600 hover:bg-emerald-700 text-white focus:ring-emerald-600",
  },
  cancel: {
    label: "Yes, cancel contract",
    className:
      "bg-destructive hover:bg-destructive/90 text-destructive-foreground focus:ring-destructive",
  },
  dispute: {
    label: "Yes, open dispute",
    className:
      "bg-amber-500 hover:bg-amber-600 text-white focus:ring-amber-500",
  },
  fund: {
    label: "Proceed to payment",
    className:
      "bg-indigo-600 hover:bg-indigo-700 text-white focus:ring-indigo-600",
  },
  refund: {
    label: "Yes, refund milestone",
    className:
      "bg-destructive hover:bg-destructive/90 text-destructive-foreground focus:ring-destructive",
  },
};

export function ConfirmActionDialog({
  open,
  type,
  title,
  description,
  isPending,
  onConfirm,
  onCancel,
}: ConfirmActionDialogProps) {
  const config = actionConfig[type];

  return (
    <AlertDialog open={open} onOpenChange={(v) => !v && onCancel()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Go back</AlertDialogCancel>

          <AlertDialogAction
            disabled={isPending}
            onClick={onConfirm}
            className={cn(config.className, "flex items-center gap-2")}
          >
            {isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            {isPending ? "Processing…" : config.label}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}