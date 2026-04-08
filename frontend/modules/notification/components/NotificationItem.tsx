


import {
  FileText,
  FileCheck,
  DollarSign,
  Send,
  AlertTriangle,
  RefreshCcw,
  Sparkles,
} from "lucide-react";
import { cn } from "@/modules/shared";
import { formatRelative } from "@/modules/shared/utils/date";
import type { Notification, NotificationType } from "../types";

// ─── Icon map ─────────────────────────────────────────────────────────────────

function getIcon(type: NotificationType) {
  const cls = "w-4 h-4";

  if (
    type === "BID_RECEIVED" ||
    type === "BID_ACCEPTED" ||
    type === "BID_REJECTED" ||
    type === "BID_WITHDRAWN"
  ) {
    return <FileText className={cls} />;
  }

  if (
    type === "CONTRACT_CREATED" ||
    type === "CONTRACT_COMPLETED" ||
    type === "CONTRACT_CANCELLED"
  ) {
    return <FileCheck className={cls} />;
  }

  if (type === "CONTRACT_DISPUTED" || type === "MILESTONE_DISPUTED") {
    return <AlertTriangle className={cls} />;
  }

  if (
    type === "MILESTONE_FUNDED" ||
    type === "MILESTONE_APPROVED" ||
    type === "PAYMENT_RELEASED"
  ) {
    return <DollarSign className={cls} />;
  }

  if (
    type === "MILESTONE_SUBMITTED" ||
    type === "MILESTONE_REVISION_REQUESTED"
  ) {
    return <Send className={cls} />;
  }

  if (type === "PAYMENT_REFUNDED") {
    return <RefreshCcw className={cls} />;
  }

  if (type === "WELCOME" || type === "EMAIL_VERIFICATION" || type === "PASSWORD_RESET") {
    return <Sparkles className={cls} />;
  }

  return <FileText className={cls} />;
}

// ─── NotificationItem ─────────────────────────────────────────────────────────

interface Props {
  notification: Notification;
  onClick: () => void;
}

export function NotificationItem({ notification, onClick }: Props) {
  const { type, title, message, read, createdAt } = notification;


  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full text-left flex items-start gap-3 px-4 py-3",
        "border-b border-border last:border-b-0",
        "transition-colors hover:bg-muted/60",
        !read && "bg-blue-50 dark:bg-blue-950/20",
      )}
    >
      {/* Unread dot */}
      <div className="mt-1 shrink-0">
        <div
          className={cn(
            "w-1.5 h-1.5 rounded-full",
            !read ? "bg-blue-500" : "bg-transparent",
          )}
        />
      </div>

      {/* Icon */}
      <div
        className={cn(
          "shrink-0 w-8 h-8 rounded-full flex items-center justify-center",
          !read
            ? "bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400"
            : "bg-muted text-muted-foreground",
        )}
      >
        {getIcon(type)}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-foreground leading-snug truncate">
          {title}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2 leading-snug">
          {message}
        </p>
        <p className="text-[10px] text-muted-foreground/70 mt-1">
          {formatRelative(createdAt)}
        </p>
      </div>
    </button>
  );
}