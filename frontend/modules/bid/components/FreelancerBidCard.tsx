"use client";

import { useCallback } from "react";
import { format } from "date-fns";
import {
  CheckCircle2,
  MinusCircle,
  ExternalLink,
  Loader2,
  CalendarDays,
  DollarSign,
} from "lucide-react";
import { cn, parseApiError } from "@/modules/shared";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/modules/shared/components/alert-dialog";
import Link from "next/link";
import type { BidResponse } from "../types";
import { useWithdrawBid } from "../hooks/useFreelancerBids";
import { Badge } from "@/modules/shared/components/badge";
import { Card, CardContent } from "@/modules/shared/components/card";
import { Alert, AlertDescription } from "@/modules/shared/components/alert";
import { Button } from "@/modules/shared/components/button";
import { formatCurrency } from "@/modules/shared";
import { STATUS_CONFIG } from "../config/status-config";

interface BidCardProps {
  bid: BidResponse;
}

export function BidCard({ bid }: BidCardProps) {
  const withdrawMutation = useWithdrawBid();

  const config = STATUS_CONFIG[bid.status];
  const StatusIcon = config.icon;

  const withdrawError = withdrawMutation.error
    ? parseApiError(withdrawMutation.error)
    : null;

  const handleWithdraw = useCallback(() => {
    withdrawMutation.mutate(bid.id);
  }, [withdrawMutation, bid.id]);

  return (
    <Card className="group transition-all hover:border-primary/30 hover:shadow-md">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4 mb-3">
          <div className="min-w-0">
            <Link
              href={`/projects/${bid.projectId}`}
              className="font-semibold text-foreground hover:text-primary transition-colors leading-snug line-clamp-1 flex items-center gap-1.5"
            >
              {bid.projectTitle}
              <ExternalLink className="w-3.5 h-3.5 opacity-0 group-hover:opacity-60 transition-opacity shrink-0" />
            </Link>
            <p className="text-xs text-muted-foreground mt-0.5">
              Submitted{" "}
              {format(new Date(bid.submittedAt), "MMM d, yyyy · HH:mm")}
            </p>
          </div>

          <Badge
            variant="outline"
            className={cn(
              "shrink-0 flex items-center gap-1.5 text-xs font-medium",
              config.className,
            )}
          >
            <StatusIcon className="w-3 h-3" />
            {config.label}
          </Badge>
        </div>

        <p className="text-sm text-muted-foreground line-clamp-2 mb-4 leading-relaxed">
          {bid.coverLetter}
        </p>

        <div className="flex items-center gap-5 text-sm mb-4">
          <span className="flex items-center gap-1.5 font-semibold text-foreground">
            <DollarSign className="w-3.5 h-3.5 text-muted-foreground" />
            {formatCurrency(bid.proposedPrice)}
          </span>
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <CalendarDays className="w-3.5 h-3.5" />
            {bid.estimatedDays} {bid.estimatedDays === 1 ? "day" : "days"}
          </span>
        </div>

        {withdrawError && (
          <Alert variant="destructive" className="mb-3 py-2">
            <AlertDescription className="text-xs">{withdrawError}</AlertDescription>
          </Alert>
        )}

        {bid.status === "PENDING" && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                disabled={withdrawMutation.isPending}
                className="text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/30"
              >
                {withdrawMutation.isPending ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <MinusCircle className="w-3.5 h-3.5" />
                )}
                Withdraw
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Withdraw this bid?</AlertDialogTitle>
                <AlertDialogDescription>
                  You&apos;re about to withdraw your bid on{" "}
                  <strong>{bid.projectTitle}</strong>. This cannot be undone —
                  you would need to submit a new bid if you change your mind.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={withdrawMutation.isPending}>
                  Cancel
                </AlertDialogCancel>

                <AlertDialogAction
                  onClick={handleWithdraw}
                  disabled={withdrawMutation.isPending}
                  className="bg-destructive hover:bg-destructive/90 flex items-center gap-2"
                >
                  {withdrawMutation.isPending && (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  )}
                  Withdraw Bid
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}

        {bid.status === "ACCEPTED" && (
          <Link href="/freelancer/contracts">
            <Button size="sm" variant="outline">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              View Contract
            </Button>
          </Link>
        )}
      </CardContent>
    </Card>
  );
}