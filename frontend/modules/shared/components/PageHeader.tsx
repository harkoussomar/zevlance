// modules/shared/components/PageHeader.tsx
import { ReactNode } from "react";
import { Badge } from "./badge";

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

interface PageHeaderProps {
  title?: string;
  name?: string | null;
  subtitle?: ReactNode;
  showStatusDot?: boolean;
  action?: ReactNode;
  badge?: ReactNode; 
  className?: string;
}

export function PageHeader({
  title,
  name,
  subtitle,
  showStatusDot = false,
  action,
  badge,
  className,
}: PageHeaderProps) {
  const isGreetingMode = name !== undefined;
  const firstName = name?.split(" ")[0];
  const greeting = getGreeting();

  return (
    <div
      className={`flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-6 ${className ?? ""}`}
    >
      {/* ── Text block ─────────────────────────────────────────────────── */}
      <div>
        {isGreetingMode ? (
          <>
            <p
              className="text-[0.65rem] font-semibold tracking-[0.22em] uppercase mb-1.5"
              style={{ color: "var(--primary)" }}
            >
              {greeting}
            </p>
            <h1
              className="font-display font-bold tracking-[-0.035em] leading-[1.05] text-2xl sm:text-3xl lg:text-[2rem]"
              style={{ color: "var(--foreground)" }}
            >
              {firstName ?? "Welcome back"}
            </h1>
            {badge && <Badge className="mt-1">{badge}</Badge>}
          </>
        ) : (
          <h1
            className="font-display font-bold tracking-[-0.03em] leading-[1.1] text-2xl sm:text-3xl"
            style={{ color: "var(--foreground)" }}
          >
            {title}
          </h1>
        )}

        {subtitle !== undefined && (
          <div
            className="flex items-center gap-2 mt-1.5"
            style={{ color: "var(--muted-foreground)" }}
          >
            {showStatusDot && (
              <span className="relative flex h-2 w-2 shrink-0">
                <span
                  className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-60"
                  style={{ backgroundColor: "var(--success)" }}
                />
                <span
                  className="relative inline-flex h-2 w-2 rounded-full"
                  style={{ backgroundColor: "var(--success)" }}
                />
              </span>
            )}
            <span className="text-sm font-medium leading-snug">{subtitle}</span>
          </div>
        )}
      </div>

      {/* ── Action slot ────────────────────────────────────────────────── */}
      {action && <div className="shrink-0 self-start sm:self-center">{action}</div>}
    </div>
  );
}