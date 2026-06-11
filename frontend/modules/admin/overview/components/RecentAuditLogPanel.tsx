"use client";

import { useRouter } from "next/navigation";
import { ClipboardList, ArrowRight, Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Card } from "@/modules/shared/components/card";
import { useAdminRecentAuditLog } from "../hooks/useAdminOverview";

// Action → color dot mapping
const ACTION_DOT: Record<string, string> = {
    DELETE_PROJECT:          "bg-destructive",
    SUSPEND_USER:            "bg-warning",
    ACTIVATE_USER:           "bg-success",
    FLAG_PROJECT:            "bg-warning",
    UNFLAG_PROJECT:          "bg-success",
    FEATURE_PROJECT:         "bg-info",
    UNFEATURE_PROJECT:       "bg-muted-foreground",
    CHANGE_PROJECT_STATUS:   "bg-info",
    UPDATE_PROJECT_NOTE:     "bg-muted-foreground",
    DELETE_USER:             "bg-destructive",
};

// Human-readable action labels
const ACTION_LABEL: Record<string, string> = {
    DELETE_PROJECT:        "Deleted project",
    SUSPEND_USER:          "Suspended user",
    ACTIVATE_USER:         "Activated user",
    FLAG_PROJECT:          "Flagged project",
    UNFLAG_PROJECT:        "Cleared project flag",
    FEATURE_PROJECT:       "Featured project",
    UNFEATURE_PROJECT:     "Unfeatured project",
    CHANGE_PROJECT_STATUS: "Changed project status",
    UPDATE_PROJECT_NOTE:   "Updated admin note",
    DELETE_USER:           "Deleted user",
};

export function RecentAuditLogPanel() {
    const router = useRouter();

    const { data, isLoading } = useAdminRecentAuditLog();

    const entries = data?.content?.slice(0, 6) ?? [];

    return (
        <Card className="p-0 overflow-hidden">
            {/* Header */}
            <div className="px-5 py-4 flex items-center justify-between border-b border-border">
                <div className="flex items-center gap-2.5">
                    <div className="size-7 rounded-lg bg-muted flex items-center justify-center">
                        <ClipboardList className="size-3.5 text-muted-foreground" />
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-foreground leading-tight">
                            Recent activity
                        </h3>
                        <p className="text-[11px] text-muted-foreground">Admin audit log</p>
                    </div>
                </div>
                <button
                    onClick={() => router.push("/admin/audit-log")}
                    className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline"
                >
                    View all <ArrowRight className="size-3" />
                </button>
            </div>

            {/* Body */}
            <div className="divide-y divide-border">
                {isLoading ? (
                    <div className="py-10 flex justify-center">
                        <Loader2 className="size-4 animate-spin text-muted-foreground" />
                    </div>
                ) : entries.length === 0 ? (
                    <div className="py-10 flex items-center justify-center">
                        <p className="text-xs text-muted-foreground">No audit log entries yet</p>
                    </div>
                ) : (
                    entries.map((entry) => {
                        const dotClass = ACTION_DOT[entry.action] ?? "bg-muted-foreground";
                        const label    = ACTION_LABEL[entry.action] ?? entry.action;
                        return (
                            <div key={entry.id} className="px-5 py-3.5 flex items-start gap-3">
                                <span className={`mt-1.5 size-2 rounded-full shrink-0 ${dotClass}`} />
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm text-foreground leading-snug">
                                        <span className="font-medium">{label}</span>
                                        {entry.reason && (
                                            <span className="text-muted-foreground">
                                                {" "}— {entry.reason.length > 60
                                                    ? entry.reason.slice(0, 60) + "…"
                                                    : entry.reason}
                                            </span>
                                        )}
                                    </p>
                                    <p className="text-[11px] text-muted-foreground mt-0.5">
                                        {entry.createdAt
                                            ? formatDistanceToNow(new Date(entry.createdAt), { addSuffix: true })
                                            : ""}
                                    </p>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </Card>
    );
}
