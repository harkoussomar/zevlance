"use client";

import { useState, useRef, useEffect } from "react";
import { Bell } from "lucide-react";
import { cn } from "@/modules/shared";
import { useUnreadCount } from "../hooks/useNotifications";
import { NotificationDropdown } from "./NotificationDropdown";

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { data: count = 0 } = useUnreadCount();

  // Close on outside click
  useEffect(() => {
    function handleMouseDown(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleMouseDown);
    return () => document.removeEventListener("mousedown", handleMouseDown);
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label="Notifications"
        className={cn(
          "relative p-2 rounded-lg transition-colors",
          "text-muted-foreground hover:text-foreground hover:bg-muted",
        )}
      >
        <Bell className="w-5 h-5" />

        {count > 0 && (
          <span
            className={cn(
              "absolute -top-0.5 -right-0.5",
              "min-w-4.5 h-4.5 px-1",
              "rounded-full bg-red-500 text-white",
              "text-[10px] font-bold leading-4.5 text-center",
            )}
          >
            {count > 9 ? "9+" : count}
          </span>
        )}
      </button>

      {isOpen && (
        <NotificationDropdown
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          unreadCount={count}
        />
      )}
    </div>
  );
}