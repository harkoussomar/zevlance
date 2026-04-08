// ─── features/contracts/components/FreelancerMilestoneCard.tsx ───────────────

"use client";

import { useState } from "react";
import {
  CheckCircle2,
  Clock,
  Link as LinkIcon,
  Upload,
  Calendar,
  DollarSign,
  AlertTriangle,
  BadgeCheck,
  ShieldAlert,
  Undo2,
  Info,
} from "lucide-react";

import { Button }               from "@/modules/shared/components/button";
import { Input }                from "@/modules/shared/components/input";
import { FormField }            from "@/modules/shared/components/form-field";
import { MilestoneStatusBadge } from "@/modules/shared/components/status-badge";
import { cn }                   from "@/modules/shared";
import type { MilestoneResponse } from "@/modules/milestone/types";
import { formatCurrency, formatDate } from "@/modules/shared";
import {
  freelancerStatusStyles,
  FreelancerStatusIcon,
} from "@/modules/milestone/utils/milestone-status.config";

// ─── Props ────────────────────────────────────────────────────────────────────

interface FreelancerMilestoneCardProps {
  milestone: MilestoneResponse;
  index: number;
  isSubmitting: boolean;
  onSubmit: (milestoneId: string, deliverableUrl: string) => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function isValidUrl(value: string): boolean {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

// ─── Component ────────────────────────────────────────────────────────────────

export function FreelancerMilestoneCard({
  milestone,
  index,
  isSubmitting,
  onSubmit,
}: FreelancerMilestoneCardProps) {
  const [showForm, setShowForm] = useState(false);
  const [url, setUrl]           = useState(milestone.deliverableUrl ?? "");
  const [urlError, setUrlError] = useState<string | null>(null);

  // Submit is only available when funds are in escrow (FUNDED) or the client
  // asked for a revision (REVISION_REQUESTED). PENDING milestones haven't been
  // funded yet — starting work before payment is in escrow is the freelancer's
  // risk.
  const canSubmit =
    milestone.status === "FUNDED" || milestone.status === "REVISION_REQUESTED";

  const styles = freelancerStatusStyles[milestone.status];

  const handleSubmit = () => {
    const trimmed = url.trim();
    if (!trimmed) {
      setUrlError("Please enter a deliverable URL");
      return;
    }
    if (!isValidUrl(trimmed)) {
      setUrlError("Please enter a valid URL (e.g. https://github.com/...)");
      return;
    }
    setUrlError(null);
    onSubmit(milestone.id, trimmed);
  };

  return (
    <div
      className={cn(
        "rounded-xl border p-5 transition-all duration-200",
        styles.card,
      )}
    >
      {/* ─── Header ──────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 min-w-0">
          <div
            className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 border-2 transition-all",
              styles.dot,
              milestone.status === "APPROVED" ? "text-white" : "text-muted-foreground",
            )}
          >
            {milestone.status === "APPROVED" ? (
              <CheckCircle2 className="w-4 h-4" />
            ) : (
              index + 1
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap mb-1.5">
              <p className="font-semibold text-foreground text-sm leading-snug">
                {milestone.title}
              </p>
              <MilestoneStatusBadge status={milestone.status} />
            </div>

            {milestone.description && (
              <p className="text-xs text-muted-foreground leading-relaxed mb-2.5 line-clamp-2">
                {milestone.description}
              </p>
            )}

            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <DollarSign className="w-3 h-3" />
                <span className="font-semibold text-foreground">
                  {formatCurrency(milestone.amount)}
                </span>
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                Due {formatDate(milestone.dueDate)}
              </span>
            </div>
          </div>
        </div>

        <div className="shrink-0 mt-0.5">
          <FreelancerStatusIcon status={milestone.status} />
        </div>
      </div>

      {/* ─── PENDING: not yet funded warning ─────────────────────────────── */}
      {milestone.status === "PENDING" && (
        <div className="mt-3 pt-3 border-t border-border/60">
          <div className="flex items-start gap-2 text-xs text-muted-foreground bg-muted/60 rounded-lg p-2.5">
            <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
            <p>
              This milestone hasn&apos;t been funded yet. Wait for the client to
              deposit funds into escrow before starting work.
            </p>
          </div>
        </div>
      )}

      {/* ─── FUNDED: escrow ready ─────────────────────────────────────────── */}
      {milestone.status === "FUNDED" && (
        <div className="mt-3 pt-3 border-t border-emerald-500/20">
          <div className="flex items-start gap-2 text-xs text-emerald-700 dark:text-emerald-400 bg-emerald-500/8 rounded-lg p-2.5 mb-3">
            <BadgeCheck className="w-3.5 h-3.5 shrink-0 mt-0.5" />
            <p>
              Escrow funded
              {milestone.fundedAt && (
                <span className="text-muted-foreground">
                  {" "}· {formatDate(milestone.fundedAt)}
                </span>
              )}
              . You can now submit your deliverable.
            </p>
          </div>
          {/* Only show payout when value is present (not available in PENDING) */}
          {milestone.freelancerPayout != null && (
            <p className="text-xs text-muted-foreground">
              You will receive{" "}
              <span className="font-semibold text-foreground">
                {formatCurrency(milestone.freelancerPayout)}
              </span>{" "}
              upon approval.
            </p>
          )}
        </div>
      )}

      {/* ─── REVISION_REQUESTED: revision note ───────────────────────────── */}
      {milestone.status === "REVISION_REQUESTED" && (
        <div className="mt-3 pt-3 border-t border-amber-500/20">
          <div className="flex items-start gap-2 text-xs text-amber-700 dark:text-amber-400 bg-amber-500/8 rounded-lg p-2.5">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
            <p>
              Revision {milestone.revisionCount}/3 requested. Please review the
              client&apos;s feedback and resubmit an updated deliverable.
            </p>
          </div>
        </div>
      )}

      {/* ─── Existing deliverable link ────────────────────────────────────── */}
      {milestone.deliverableUrl && (
        <div className="mt-3 pt-3 border-t border-border/60">
          <a
            href={milestone.deliverableUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs text-primary hover:underline underline-offset-2 w-fit max-w-full"
          >
            <LinkIcon className="w-3 h-3 shrink-0" />
            <span className="truncate">{milestone.deliverableUrl}</span>
          </a>
        </div>
      )}

      {/* ─── Submit deliverable (FUNDED | REVISION_REQUESTED) ────────────── */}
      {canSubmit && (
        <div className="mt-4 pt-4 border-t border-border/60">
          {!showForm ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowForm(true)}
              className="w-full"
            >
              <Upload className="w-3.5 h-3.5" />
              {milestone.status === "REVISION_REQUESTED"
                ? "Resubmit Deliverable"
                : "Submit Deliverable"}
            </Button>
          ) : (
            <div className="space-y-3">
              <FormField
                label="Deliverable URL"
                error={urlError ?? undefined}
                required
              >
                <Input
                  placeholder="https://github.com/you/project/tree/milestone-1"
                  value={url}
                  onChange={(e) => {
                    setUrl(e.target.value);
                    if (urlError) setUrlError(null);
                  }}
                  startIcon={<LinkIcon className="w-3.5 h-3.5" />}
                  disabled={isSubmitting}
                  autoFocus
                />
              </FormField>

              <div className="flex gap-2">
                <Button
                  size="sm"
                  loading={isSubmitting}
                  onClick={handleSubmit}
                  className="flex-1"
                >
                  <Upload className="w-3.5 h-3.5" />
                  Submit
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowForm(false);
                    setUrlError(null);
                    setUrl(milestone.deliverableUrl ?? "");
                  }}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─── SUBMITTED: awaiting review ───────────────────────────────────── */}
      {milestone.status === "SUBMITTED" && (
        <div className="mt-3 pt-3 border-t border-blue-500/20">
          <p className="text-xs text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
            <Clock className="w-3 h-3" />
            Awaiting client review
          </p>
        </div>
      )}

      {/* ─── APPROVED: payment released ───────────────────────────────────── */}
      {milestone.status === "APPROVED" && (
        <div className="mt-3 pt-3 border-t border-emerald-500/20">
          <p className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
            <CheckCircle2 className="w-3 h-3" />
            {milestone.releasedAt
              ? `Payment of ${formatCurrency(milestone.freelancerPayout)} released on ${formatDate(milestone.releasedAt)}`
              : `Payment of ${formatCurrency(milestone.freelancerPayout)} released`}
          </p>
        </div>
      )}

      {/* ─── DISPUTED: frozen ─────────────────────────────────────────────── */}
      {milestone.status === "DISPUTED" && (
        <div className="mt-3 pt-3 border-t border-destructive/20">
          <p className="text-xs text-destructive flex items-center gap-1.5">
            <ShieldAlert className="w-3 h-3" />
            This milestone is under dispute. Our team will contact you within 48
            hours.
          </p>
        </div>
      )}

      {/* ─── REFUNDED: terminal ───────────────────────────────────────────── */}
      {milestone.status === "REFUNDED" && (
        <div className="mt-3 pt-3 border-t border-border/60">
          <p className="text-xs text-muted-foreground flex items-center gap-1.5">
            <Undo2 className="w-3 h-3" />
            The client cancelled this milestone. Payment was refunded.
          </p>
        </div>
      )}
    </div>
  );
}