"use client";
// contracts/shared/components/FileDisputeDialog.tsx

import { useState, useCallback } from "react";
import {
  Package,
  Clock,
  GitBranch,
  CreditCard,
  MessageSquareOff,
  HelpCircle,
  ChevronRight,
  ChevronLeft,
  ShieldAlert,
  CheckCircle2,
  Snowflake,
  Scale,
  AlertCircle,
  Ban,
  Timer,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/modules/shared/components/dialog";
import { Button } from "@/modules/shared/components/button";
import { Textarea } from "@/modules/shared/components/textarea";
import { cn } from "@/modules/shared";
import type { DisputeCategory, FileDisputePayload } from "@/modules/dispute/types/dispute.types";

// ─── Category Config ──────────────────────────────────────────────────────────

interface CategoryConfig {
  id: DisputeCategory;
  icon: React.ElementType;
  label: string;
  description: string;
}

const CATEGORIES: CategoryConfig[] = [
  {
    id: "DELIVERABLE_QUALITY",
    icon: Package,
    label: "Poor Deliverable Quality",
    description: "Submitted work doesn't meet the agreed requirements or standards",
  },
  {
    id: "NON_DELIVERY",
    icon: Clock,
    label: "Non-Delivery",
    description: "Freelancer failed to deliver any work by the agreed deadline",
  },
  {
    id: "SCOPE_CHANGE",
    icon: GitBranch,
    label: "Unauthorized Scope Change",
    description: "Project scope was changed or expanded without prior agreement",
  },
  {
    id: "PAYMENT_ISSUE",
    icon: CreditCard,
    label: "Payment Disagreement",
    description: "Dispute over payment amount, milestone value, or a refund",
  },
  {
    id: "UNRESPONSIVE",
    icon: MessageSquareOff,
    label: "Unresponsive Freelancer",
    description: "Freelancer has stopped communicating or responding to messages",
  },
  {
    id: "OTHER",
    icon: HelpCircle,
    label: "Other Issue",
    description: "An issue not covered by any of the categories above",
  },
];

const CONSEQUENCES = [
  { icon: Snowflake, text: "All active milestone funds will be frozen immediately" },
  { icon: Scale, text: "An admin mediator will review the evidence from both parties" },
  { icon: Ban, text: "Neither party can cancel the contract or withdraw funds during review" },
  { icon: Timer, text: "Resolution typically takes 2–5 business days" },
];

const MIN_LENGTH = 50;
const MAX_LENGTH = 1000;

// ─── Step Indicator ───────────────────────────────────────────────────────────

const STEP_LABELS = ["Category", "Description", "Confirm"];

function StepIndicator({ current }: { current: 1 | 2 | 3 }) {
  return (
    <div className="flex items-center gap-0 mt-4">
      {STEP_LABELS.map((label, i) => {
        const stepNum = i + 1;
        const isDone = stepNum < current;
        const isActive = stepNum === current;

        return (
          <div key={label} className="flex items-center flex-1">
            <div className="flex flex-col items-center gap-1 w-8 shrink-0">
              <div
                className={cn(
                  "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all",
                  isDone
                    ? "bg-warning border-warning text-warning-foreground"
                    : isActive
                    ? "bg-warning/20 border-warning text-warning"
                    : "bg-muted border-border text-muted-foreground"
                )}
              >
                {isDone ? <CheckCircle2 className="w-3.5 h-3.5" /> : stepNum}
              </div>
              <span
                className={cn(
                  "text-[10px] font-medium whitespace-nowrap",
                  isActive ? "text-warning" : isDone ? "text-muted-foreground" : "text-muted-foreground/50"
                )}
              >
                {label}
              </span>
            </div>

            {i < STEP_LABELS.length - 1 && (
              <div
                className={cn(
                  "flex-1 h-px mx-1 mb-5 transition-all",
                  isDone ? "bg-warning/60" : "bg-border"
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

interface FileDisputeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (payload: FileDisputePayload) => void;
  isPending: boolean;
}

export function FileDisputeDialog({
  open,
  onOpenChange,
  onConfirm,
  isPending,
}: FileDisputeDialogProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [category, setCategory] = useState<DisputeCategory | null>(null);
  const [reason, setReason] = useState("");
  const [acknowledged, setAcknowledged] = useState(false);

  const trimmedLength = reason.trim().length;
  const isReasonValid = trimmedLength >= MIN_LENGTH;
  const selectedCategory = CATEGORIES.find((c) => c.id === category);

  // Reset state when dialog closes
  const handleClose = useCallback(() => {
    if (isPending) return;
    onOpenChange(false);
    setTimeout(() => {
      setStep(1);
      setCategory(null);
      setReason("");
      setAcknowledged(false);
    }, 200);
  }, [isPending, onOpenChange]);

  const handleSubmit = () => {
    if (!category || !isReasonValid || !acknowledged || isPending) return;
    onConfirm({ reason: reason.trim(), category });
  };

  const canAdvanceStep1 = Boolean(category);
  const canAdvanceStep2 = isReasonValid;
  const canSubmit = acknowledged && !isPending;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden gap-0">

        {/* ── Header ──────────────────────────────────────────────────────── */}
        <DialogHeader className="px-6 pt-6 pb-5 border-b border-border/60 bg-warning/[0.04]">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-warning/15 border border-warning/20 shrink-0 mt-0.5">
              <ShieldAlert className="w-4 h-4 text-warning" />
            </div>
            <div>
              <DialogTitle className="text-base font-semibold text-foreground">
                File a Dispute
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-1 leading-relaxed">
                {step === 1 && "Select the category that best describes your issue. This helps our team route your dispute to the right mediator."}
                {step === 2 && "Describe the issue clearly and factually. Specific details improve resolution speed."}
                {step === 3 && "Review what happens after submission before confirming."}
              </DialogDescription>
            </div>
          </div>
          <StepIndicator current={step} />
        </DialogHeader>

        {/* ── Step 1: Category ────────────────────────────────────────────── */}
        {step === 1 && (
          <div className="px-6 py-5 space-y-2 max-h-[420px] overflow-y-auto">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const isSelected = category === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setCategory(cat.id)}
                  className={cn(
                    "w-full flex items-start gap-3 p-3.5 rounded-xl border text-left transition-all duration-150",
                    isSelected
                      ? "border-warning/50 bg-warning/8 shadow-sm ring-1 ring-warning/20"
                      : "border-border/60 hover:border-border hover:bg-muted/40 bg-transparent"
                  )}
                >
                  <div
                    className={cn(
                      "p-1.5 rounded-lg shrink-0 mt-0.5 transition-colors",
                      isSelected ? "bg-warning/20" : "bg-muted"
                    )}
                  >
                    <Icon
                      className={cn(
                        "w-3.5 h-3.5 transition-colors",
                        isSelected ? "text-warning" : "text-muted-foreground"
                      )}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className={cn(
                      "text-sm font-medium leading-snug transition-colors",
                      isSelected ? "text-foreground" : "text-foreground/80"
                    )}>
                      {cat.label}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                      {cat.description}
                    </p>
                  </div>
                  <div className={cn(
                    "w-4 h-4 rounded-full border-2 shrink-0 mt-1 flex items-center justify-center transition-all",
                    isSelected ? "border-warning bg-warning" : "border-muted-foreground/30"
                  )}>
                    {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* ── Step 2: Description ─────────────────────────────────────────── */}
        {step === 2 && (
          <div className="px-6 py-5 space-y-4">
            {/* Selected category reminder */}
            {selectedCategory && (
              <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-warning/8 border border-warning/20">
                <selectedCategory.icon className="w-3.5 h-3.5 text-warning shrink-0" />
                <span className="text-sm font-medium text-foreground">{selectedCategory.label}</span>
              </div>
            )}

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-foreground">
                  What happened? <span className="text-destructive">*</span>
                </label>
                <span
                  className={cn(
                    "text-xs font-mono tabular-nums transition-colors",
                    trimmedLength === 0
                      ? "text-muted-foreground/50"
                      : !isReasonValid
                      ? "text-warning"
                      : trimmedLength >= MAX_LENGTH - 50
                      ? "text-destructive"
                      : "text-success"
                  )}
                >
                  {trimmedLength}/{MAX_LENGTH}
                </span>
              </div>

              <Textarea
                placeholder={`Describe the issue in detail. Be specific:\n• What was agreed?\n• What actually happened?\n• When did the problem occur?\n• Have you tried to resolve it directly?\n\nMinimum ${MIN_LENGTH} characters required.`}
                value={reason}
                onChange={(e) => {
                  if (e.target.value.length <= MAX_LENGTH) setReason(e.target.value);
                }}
                rows={7}
                disabled={isPending}
                className={cn(
                  "resize-none text-sm leading-relaxed",
                  !isReasonValid && trimmedLength > 0 && "border-warning/40 focus-visible:ring-warning/20"
                )}
                autoFocus
              />

              {/* Validation hint */}
              <div className="h-4">
                {!isReasonValid && trimmedLength > 0 && (
                  <p className="text-xs text-warning flex items-center gap-1.5">
                    <AlertCircle className="w-3 h-3" />
                    {MIN_LENGTH - trimmedLength} more character{MIN_LENGTH - trimmedLength !== 1 ? "s" : ""} needed
                  </p>
                )}
                {isReasonValid && (
                  <p className="text-xs text-success flex items-center gap-1.5">
                    <CheckCircle2 className="w-3 h-3" />
                    Good — ready to continue
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── Step 3: Consequences & Confirm ──────────────────────────────── */}
        {step === 3 && (
          <div className="px-6 py-5 space-y-4">

            {/* Consequence list */}
            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">When you submit this dispute:</p>
              {CONSEQUENCES.map((item, i) => {
                const Icon = item.icon;
                return (
                  <div
                    key={i}
                    className="flex items-start gap-3 px-3 py-2.5 rounded-lg bg-muted/40 border border-border/50"
                  >
                    <Icon className="w-3.5 h-3.5 text-muted-foreground shrink-0 mt-0.5" />
                    <p className="text-xs text-muted-foreground leading-relaxed">{item.text}</p>
                  </div>
                );
              })}
            </div>

            {/* Summary card */}
            <div className="p-3.5 rounded-xl border border-border bg-card space-y-2.5">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
                Your submission
              </p>
              {selectedCategory && (
                <div className="flex items-center gap-2">
                  <selectedCategory.icon className="w-3.5 h-3.5 text-warning shrink-0" />
                  <span className="text-sm font-semibold text-foreground">{selectedCategory.label}</span>
                </div>
              )}
              <p className="text-xs text-muted-foreground leading-relaxed line-clamp-4">
                {reason.trim()}
              </p>
            </div>

            {/* Acknowledge checkbox */}
            <label className="flex items-start gap-3 cursor-pointer group">
              <button
                type="button"
                role="checkbox"
                aria-checked={acknowledged}
                onClick={() => setAcknowledged((a) => !a)}
                className={cn(
                  "w-4 h-4 rounded border-2 shrink-0 mt-0.5 flex items-center justify-center transition-all",
                  acknowledged
                    ? "bg-warning border-warning"
                    : "border-muted-foreground/40 group-hover:border-warning/50"
                )}
              >
                {acknowledged && <CheckCircle2 className="w-2.5 h-2.5 text-white" />}
              </button>
              <p className="text-xs text-muted-foreground leading-relaxed select-none">
                I confirm this dispute is legitimate. I understand that submitting false or frivolous
                disputes may result in account penalties under FreelanceHub&apos;s terms of service.
              </p>
            </label>
          </div>
        )}

        {/* ── Footer ──────────────────────────────────────────────────────── */}
        <DialogFooter className="px-6 py-4 border-t border-border/60 bg-muted/20 flex items-center justify-between sm:justify-between">
          <div>
            {step > 1 && (
              <Button
                variant="ghost"
                size="sm"
                disabled={isPending}
                onClick={() => setStep((s) => (s - 1) as 1 | 2 | 3)}
                className="text-muted-foreground"
              >
                <ChevronLeft className="w-3.5 h-3.5 mr-1" />
                Back
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" disabled={isPending} onClick={handleClose}>
              Cancel
            </Button>

            {step < 3 ? (
              <Button
                size="sm"
                disabled={step === 1 ? !canAdvanceStep1 : !canAdvanceStep2}
                onClick={() => setStep((s) => (s + 1) as 1 | 2 | 3)}
                className="bg-warning/90 hover:bg-warning text-warning-foreground border-0 shadow-sm"
              >
                Continue
                <ChevronRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            ) : (
              <Button
                size="sm"
                variant="destructive"
                disabled={!canSubmit}
                loading={isPending}
                onClick={handleSubmit}
              >
                Submit Dispute
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
