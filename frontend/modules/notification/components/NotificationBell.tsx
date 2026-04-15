"use client";

import { Bell } from "lucide-react";
import { cn } from "@/modules/shared";
import { NotificationDropdown } from "./NotificationDropdown";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/modules/shared/components/dropdown-menu";
import { useUnreadCount } from "../hooks/useNotifications";

export function NotificationBell() {
  const { data: count = 0 } = useUnreadCount();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          aria-label="Notifications"
          className={cn(
            "relative p-2 rounded-lg transition-colors focus-visible:outline-none",
            "text-muted-foreground hover:text-foreground hover:bg-accent",
          )}
        >
          <Bell className="w-5 h-5" />

          {count > 0 && (
            <span
              className={cn(
                "absolute -top-0.5 -right-0.5",
                "min-w-4.5 h-4.5 px-1 flex items-center justify-center",
                "rounded-full bg-destructive text-destructive-foreground",
                "text-[10px] font-bold leading-4.5 text-center",
              )}
            >
              {count > 9 ? "9+" : count}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-80 sm:w-96 p-0 rounded-xl overflow-hidden"
      >
        <NotificationDropdown unreadCount={count} />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}