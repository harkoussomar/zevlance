"use client";

import { useRouter } from "next/navigation";
import { cn } from "@/modules/shared";
import { selectRole, useAuthStore } from "@/store/auth-store";
import { useNotifications, useMarkAllAsRead, useMarkAsRead } from "../hooks/useNotifications";
import { NotificationItem } from "./NotificationItem";
import type { Notification } from "../types/notification";

// ─── Routing helper ───────────────────────────────────────────────────────────

function resolveUrl(notification: Notification, role: string): string {
  const { referenceType, referenceId } = notification;
  const isClient = role === "CLIENT";

  switch (referenceType) {
    case "BID":
      return isClient ? `/client/projects/${referenceId}` : `/freelancer/bids`;
    case "CONTRACT":
      return isClient ? `/client/contracts/${referenceId}` : `/freelancer/contracts/${referenceId}`;
    case "MILESTONE":
      return isClient ? `/client/contracts` : `/freelancer/contracts`;
    case "PAYMENT":
      return isClient ? `/client/contracts/${referenceId}` : `/freelancer/contracts/${referenceId}`;
    default:
      return isClient ? `/client/dashboard` : `/freelancer/dashboard`;
  }
}

// ─── Skeleton loader ──────────────────────────────────────────────────────────

function SkeletonItem() {
  return (
    <div className="flex gap-3 px-4 py-3 animate-pulse">
      <div className="w-8 h-8 rounded-full bg-muted shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-3 bg-muted rounded w-2/3" />
        <div className="h-3 bg-muted rounded w-full" />
        <div className="h-2 bg-muted rounded w-1/3" />
      </div>
    </div>
  );
}

// ─── NotificationDropdown ─────────────────────────────────────────────────────

interface Props {
  unreadCount: number;
}

export function NotificationDropdown({ unreadCount }: Props) {
  const router = useRouter();
  const role = useAuthStore(selectRole);

  const { data, isLoading } = useNotifications(true);
  const { mutate: markAsRead } = useMarkAsRead();
  const { mutate: markAllAsRead, isPending: markingAll } = useMarkAllAsRead();

  const notifications = data?.content ?? [];

  function handleItemClick(notification: Notification) {
    if (!notification.read) {
      markAsRead(notification.id);
    }
    router.push(resolveUrl(notification, role));
  }

  return (
    <div className="flex flex-col bg-background">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
        <span className="font-semibold text-sm text-foreground">
          Notifications
        </span>
        <button
          onClick={() => markAllAsRead()}
          disabled={unreadCount === 0 || markingAll}
          className={cn(
            "text-xs font-medium transition-colors",
            unreadCount === 0 || markingAll
              ? "text-muted-foreground cursor-not-allowed"
              : "text-primary hover:underline",
          )}
        >
          Mark all as read
        </button>
      </div>

      {/* Body */}
      <div className="overflow-y-auto max-h-96">
        {isLoading ? (
          <>
            <SkeletonItem />
            <SkeletonItem />
            <SkeletonItem />
          </>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center px-4">
            <span className="text-3xl mb-3">🎉</span>
            <p className="text-sm font-medium text-foreground">
              You&apos;re all caught up
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              No new notifications
            </p>
          </div>
        ) : (
          notifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              onSelect={() => handleItemClick(notification)}
            />
          ))
        )}
      </div>
    </div>
  );
}