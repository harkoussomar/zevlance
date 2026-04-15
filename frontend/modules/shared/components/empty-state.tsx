// empty-state.tsx
import { cn } from "@/modules/shared";
import { cva, type VariantProps } from "class-variance-authority";
import {
  AlertTriangle,
  FolderOpen,
  SearchX,
  ShieldOff,
  Inbox,
  WifiOff,
} from "lucide-react";

// ─── Variants ────────────────────────────────────────────────────────────────

const emptyStateIconVariants = cva(
  "w-14 h-14 rounded-2xl flex items-center justify-center mb-4",
  {
    variants: {
      variant: {
        default: "bg-muted text-muted-foreground",
        error: "bg-destructive/10 text-destructive",
        empty: "bg-muted text-muted-foreground",
        "no-results": "bg-muted text-muted-foreground",
        unauthorized: "bg-warning/10 text-warning",
        offline: "bg-muted text-muted-foreground",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

const emptyStateTitleVariants = cva("text-base font-bold mb-1.5", {
  variants: {
    variant: {
      default: "text-foreground",
      error: "text-destructive",
      empty: "text-foreground",
      "no-results": "text-foreground",
      unauthorized: "text-foreground",
      offline: "text-foreground",
    },
  },
  defaultVariants: { variant: "default" },
});

// ─── Presets ─────────────────────────────────────────────────────────────────

type EmptyStatePreset = {
  icon: React.ReactNode;
  title: string;
  description: string;
};

const PRESETS = {
  error: {
    icon: <AlertTriangle className="w-6 h-6" />,
    title: "Something went wrong",
    description:
      "An unexpected error occurred. Try refreshing the page or come back later.",
  },
  empty: {
    icon: <FolderOpen className="w-6 h-6" />,
    title: "Nothing here yet",
    description: "Get started by creating your first item.",
  },
  "no-results": {
    icon: <SearchX className="w-6 h-6" />,
    title: "No results found",
    description: "Try adjusting your search or filters to find what you're looking for.",
  },
  unauthorized: {
    icon: <ShieldOff className="w-6 h-6" />,
    title: "Access restricted",
    description: "You don't have permission to view this content.",
  },
  inbox: {
    icon: <Inbox className="w-6 h-6" />,
    title: "All caught up",
    description: "No new notifications or messages at the moment.",
  },
  offline: {
    icon: <WifiOff className="w-6 h-6" />,
    title: "You're offline",
    description: "Check your internet connection and try again.",
  },
} satisfies Record<string, EmptyStatePreset>;

export type EmptyStateVariant = keyof typeof PRESETS | "default";

// ─── Props ────────────────────────────────────────────────────────────────────

interface EmptyStateProps extends VariantProps<typeof emptyStateIconVariants> {
  /** Use a preset to auto-fill icon, title, and description */
  preset?: keyof typeof PRESETS;
  /** Override or provide a custom icon */
  icon?: React.ReactNode;
  /** Override or provide a custom title */
  title?: string;
  /** Override or provide a custom description */
  description?: string;
  /** Action button / link rendered below the description */
  action?: React.ReactNode;
  className?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function EmptyState({
  preset,
  icon,
  title,
  description,
  action,
  variant,
  className,
}: EmptyStateProps) {
  const resolved = preset ? PRESETS[preset] : null;

  const resolvedVariant = variant ?? (preset as VariantProps<typeof emptyStateIconVariants>["variant"]) ?? "default";
  const resolvedIcon = icon ?? resolved?.icon;
  const resolvedTitle = title ?? resolved?.title ?? "";
  const resolvedDescription = description ?? resolved?.description;

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center py-16 px-4",
        className
      )}
    >
      {resolvedIcon && (
        <div className={cn(emptyStateIconVariants({ variant: resolvedVariant }))}>
          {resolvedIcon}
        </div>
      )}

      <h3 className={cn(emptyStateTitleVariants({ variant: resolvedVariant }))}>
        {resolvedTitle}
      </h3>

      {resolvedDescription && (
        <p className="text-sm text-muted-foreground max-w-sm mb-5">
          {resolvedDescription}
        </p>
      )}

      {action}
    </div>
  );
}