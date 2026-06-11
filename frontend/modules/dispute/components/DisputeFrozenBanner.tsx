"use client";

import Link from "next/link";
import { ShieldAlert, ArrowRight, Lock } from "lucide-react";


export function DisputeFrozenBanner({ contractId }: { contractId: string }) {
  console.log("Rendering DisputeFrozenBanner for contractId:", contractId);
    return (
        <div className="rounded-xl border border-warning/40 bg-warning/5 overflow-hidden">
            {/* Top accent line */}
            <div className="h-1 w-full bg-gradient-to-r from-warning/60 via-warning to-warning/60" />

            <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-4">
                {/* Icon */}
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-warning/15 border border-warning/30 shrink-0">
                    <Lock className="w-4 h-4 text-warning" />
                </div>

                {/* Text */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                        <ShieldAlert className="w-3.5 h-3.5 text-warning shrink-0" />
                        <p className="text-sm font-semibold text-warning">
                            Contract Under Dispute
                        </p>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                        All milestone actions are paused and funds are frozen in escrow
                        while this dispute is under review. You&apos;ll be notified once a
                        resolution is reached.
                    </p>
                </div>

                {/* CTA */}
                    <Link
                        href={`${contractId}/dispute`}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-warning border border-warning/40 hover:bg-warning/10 transition-colors px-3 py-2 rounded-lg shrink-0 whitespace-nowrap"
                    >
                        View Dispute
                        <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
            </div>
        </div>
    );
}