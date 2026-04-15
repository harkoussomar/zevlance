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
import { DropdownMenuItem } from "@/modules/shared/components/dropdown-menu";
import type { Notification, NotificationType } from "../types/notification";

// ─── Icon map ─────────────────────────────────────────────────────────────────

function getIcon(type: NotificationType) {
  const cls = "w-4 h-4";
  
  if (["BID_RECEIVED", "BID_ACCEPTED", "BID_REJECTED", "BID_WITHDRAWN"].includes(type)) return <FileText className={cls} />;
  if (["CONTRACT_CREATED", "CONTRACT_COMPLETED", "CONTRACT_CANCELLED"].includes(type)) return <FileCheck className={cls} />;
  if (["CONTRACT_DISPUTED", "MILESTONE_DISPUTED"].includes(type)) return <AlertTriangle className={cls} />;
  if (["MILESTONE_FUNDED", "MILESTONE_APPROVED", "PAYMENT_RELEASED"].includes(type)) return <DollarSign className={cls} />;
  if (["MILESTONE_SUBMITTED", "MILESTONE_REVISION_REQUESTED"].includes(type)) return <Send className={cls} />;
  if (type === "PAYMENT_REFUNDED") return <RefreshCcw className={cls} />;
  if (["WELCOME", "EMAIL_VERIFICATION", "PASSWORD_RESET"].includes(type)) return <Sparkles className={cls} />;

  return <FileText className={cls} />;
}

// ─── NotificationItem ─────────────────────────────────────────────────────────

interface Props {
  notification: Notification;
  onSelect: () => void;
}

export function NotificationItem({ notification, onSelect }: Props) {
  const { type, title, message, read, createdAt } = notification;

  return (
    <DropdownMenuItem
      onSelect={onSelect}
      className={cn(
        "w-full text-left flex items-start gap-3 px-4 py-3 cursor-pointer",
        "border-b border-border last:border-b-0 rounded-none focus:rounded-none", 
        "transition-colors hover:bg-accent focus:bg-accent",
        // Subtly highlights unread rows using muted background instead of hardcoded blue
        !read && "bg-muted/50 focus:bg-accent",
      )}
    >
      {/* Unread dot */}
      <div className="mt-1 shrink-0">
        <div
          className={cn(
            "w-1.5 h-1.5 rounded-full",
            !read ? "bg-primary" : "bg-transparent",
          )}
        />
      </div>

      {/* Icon */}
      <div
        className={cn(
          "shrink-0 w-8 h-8 rounded-full flex items-center justify-center",
          !read
            ? "bg-primary/10 text-primary" // Using primary with opacity for the icon background
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
        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2 leading-snug whitespace-normal">
          {message}
        </p>
        <p className="text-[10px] text-muted-foreground/70 mt-1">
          {formatRelative(createdAt)}
        </p>
      </div>
    </DropdownMenuItem>
  );
}