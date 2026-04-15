"use client";

import { useState } from "react";
import { toast } from "sonner";
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

import { Button } from "@/modules/shared/components/button";
import { InputField } from "@/modules/shared/components/input";
import { FormField } from "@/modules/shared/components/form-field";
import { MilestoneStatusBadge } from "@/modules/shared/components/status-badge";
import { cn, formatCurrency, formatDate, parseApiError } from "@/modules/shared";
import { FreelancerStatusIcon, freelancerStatusStyles } from "../config/milestone.freelancer.status";

// Import the hook directly into the card
import { useSubmitDeliverable } from "@/modules/milestone/freelancer";
import type { MilestoneResponse } from "../../shared";

// ─── Props ────────────────────────────────────────────────────────────────────

interface FreelancerMilestoneCardProps {
    contractId: string;
    milestone: MilestoneResponse;
    index: number;
    isActive: boolean;
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
    contractId,
    milestone,
    index,
    isActive,
}: FreelancerMilestoneCardProps) {
    const [showForm, setShowForm] = useState(false);
    const [url, setUrl] = useState(milestone.deliverableUrl ?? "");
    const [urlError, setUrlError] = useState<string | null>(null);

    // ─── Localized Mutation ────────────────────────────────────────────────────
    const { mutate: submitDeliverable, isPending: isSubmitting } = useSubmitDeliverable(contractId);

    const canSubmit = isActive && (milestone.status === "FUNDED" || milestone.status === "REVISION_REQUESTED");
    const styles = freelancerStatusStyles[milestone.status];

    // ─── Handlers ──────────────────────────────────────────────────────────────
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

        submitDeliverable(
            { milestoneId: milestone.id, deliverableUrl: trimmed },
            {
                onSuccess: () => {
                    toast.success("Deliverable submitted! Awaiting client review.");
                    setShowForm(false);
                },
                onError: (err) => {
                    toast.error(parseApiError(err));
                }
            }
        );
    };

    // ─── Render ────────────────────────────────────────────────────────────────
    return (
        <div className={cn("rounded-xl border p-5 transition-all duration-200", styles.card)}>
            {/* Header */}
            <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 min-w-0">
                    <div className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 border-2 transition-all",
                        styles.dot,
                        milestone.status === "APPROVED" ? "text-white" : "text-muted-foreground"
                    )}>
                        {milestone.status === "APPROVED" ? <CheckCircle2 className="w-4 h-4" /> : index + 1}
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
                                <span className="font-semibold text-foreground">{formatCurrency(milestone.amount)}</span>
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

            {/* Info / Warning Banners */}
            {milestone.status === "PENDING" && (
                <div className="mt-3 pt-3 border-t border-border/60">
                    <div className="flex items-start gap-2 text-xs text-muted-foreground bg-muted/60 rounded-lg p-2.5">
                        <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                        <p>This milestone hasn&apos;t been funded yet. Wait for the client to deposit funds into escrow before starting work.</p>
                    </div>
                </div>
            )}

            {milestone.status === "FUNDED" && (
                <div className="mt-3 pt-3 border-t border-success/20">
                    <div className="flex items-start gap-2 text-xs text-success bg-success/8 rounded-lg p-2.5 mb-3">
                        <BadgeCheck className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                        <p>
                            Escrow funded{milestone.fundedAt && <span className="text-muted-foreground"> · {formatDate(milestone.fundedAt)}</span>}. 
                            You can now submit your deliverable.
                        </p>
                    </div>
                    {milestone.freelancerPayout != null && (
                        <p className="text-xs text-muted-foreground">
                            You will receive <span className="font-semibold text-foreground">{formatCurrency(milestone.freelancerPayout)}</span> upon approval.
                        </p>
                    )}
                </div>
            )}

            {milestone.status === "REVISION_REQUESTED" && (
                <div className="mt-3 pt-3 border-t border-warning/20">
                    <div className="flex items-start gap-2 text-xs text-warning bg-warning/8 rounded-lg p-2.5">
                        <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                        <p>Revision {milestone.revisionCount}/3 requested. Please review the client&apos;s feedback and resubmit an updated deliverable.</p>
                    </div>
                </div>
            )}

            {/* Deliverable URL */}
            {milestone.deliverableUrl && (
                <div className="mt-3 pt-3 border-t border-border/60">
                    <a href={milestone.deliverableUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs text-primary hover:underline underline-offset-2 w-fit max-w-full">
                        <LinkIcon className="w-3 h-3 shrink-0" />
                        <span className="truncate">{milestone.deliverableUrl}</span>
                    </a>
                </div>
            )}

            {/* Submission Form */}
            {canSubmit && (
                <div className="mt-4 pt-4 border-t border-border/60">
                    {!showForm ? (
                        <Button variant="outline" size="sm" onClick={() => setShowForm(true)} className="w-full">
                            <Upload className="w-3.5 h-3.5 mr-2" />
                            {milestone.status === "REVISION_REQUESTED" ? "Resubmit Deliverable" : "Submit Deliverable"}
                        </Button>
                    ) : (
                        <div className="space-y-3">
                            <FormField label="Deliverable URL" error={urlError ?? undefined} required>
                                <InputField
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
                                <Button size="sm" loading={isSubmitting} onClick={handleSubmit} className="flex-1">
                                    <Upload className="w-3.5 h-3.5 mr-2" /> Submit
                                </Button>
                                <Button variant="ghost" size="sm" onClick={() => { setShowForm(false); setUrlError(null); setUrl(milestone.deliverableUrl ?? ""); }} disabled={isSubmitting}>
                                    Cancel
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Terminal / In-Progress States */}
            {milestone.status === "SUBMITTED" && (
                <div className="mt-3 pt-3 border-t border-info/20">
                    <p className="text-xs text-info flex items-center gap-1.5">
                        <Clock className="w-3 h-3" /> Awaiting client review
                    </p>
                </div>
            )}

            {milestone.status === "APPROVED" && (
                <div className="mt-3 pt-3 border-t border-success/20">
                    <p className="text-xs text-success flex items-center gap-1.5">
                        <CheckCircle2 className="w-3 h-3" />
                        {milestone.releasedAt
                            ? `Payment of ${formatCurrency(milestone.freelancerPayout)} released on ${formatDate(milestone.releasedAt)}`
                            : `Payment of ${formatCurrency(milestone.freelancerPayout)} released`}
                    </p>
                </div>
            )}

            {milestone.status === "DISPUTED" && (
                <div className="mt-3 pt-3 border-t border-destructive/20">
                    <p className="text-xs text-destructive flex items-center gap-1.5">
                        <ShieldAlert className="w-3 h-3" /> This milestone is under dispute. Our team will contact you within 48 hours.
                    </p>
                </div>
            )}

            {milestone.status === "REFUNDED" && (
                <div className="mt-3 pt-3 border-t border-border/60">
                    <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                        <Undo2 className="w-3 h-3" /> The client cancelled this milestone. Payment was refunded.
                    </p>
                </div>
            )}
        </div>
    );
}