"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "radix-ui";
import { ArrowRight, Loader2 } from "lucide-react";
import { cn } from "../utils/classnames";

// ─── CVA definition ───────────────────────────────────────────────────────────

const buttonVariants = cva(
  // Base — shared across every variant
  [
    "group/button inline-flex shrink-0 items-center justify-center gap-2",
    "whitespace-nowrap select-none font-medium font-sans",
    "border border-transparent bg-clip-padding rounded-lg",
    "transition-all duration-200",
    "outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
    "active:not-aria-[haspopup]:translate-y-px",
    "disabled:pointer-events-none disabled:opacity-50",
    "aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20",
    "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  ].join(" "),
  {
    variants: {
      // ── Visual variants ───────────────────────────────────────────────────
      variant: {
        /**
         * PRIMARY — indigo fill. Main CTA on all public pages.
         * Use: "Post a Project", "Submit Proposal", "Save Changes"
         */
        primary:
          "bg-primary text-primary-foreground hover:bg-primary/90 hover:-translate-y-0.5 shadow-sm hover:shadow-md",

        /**
         * SECONDARY — muted fill. Secondary actions alongside a primary.
         * Use: "Browse Work", "Cancel", "Skip"
         */
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",

        /**
         * OUTLINE — bordered, transparent fill. Lightweight sibling to primary.
         * Use: "Browse Work" next to "Post a Project", filter toggles
         */
        outline:
          "border-border bg-background text-foreground hover:bg-muted hover:-translate-y-0.5 dark:border-input dark:bg-input/30 dark:hover:bg-input/50",

        /**
         * DARK — bg-foreground, text-background. Used in dark/inverted sections.
         * Use: CTASection "Post a Project", RoleCards primary CTA
         */
        dark:
          "bg-foreground text-background hover:bg-foreground/90 hover:-translate-y-0.5 shadow-lg",

        /**
         * DARK-OUTLINE — bordered on dark backgrounds. Sibling to `dark`.
         * Use: CTASection "Browse Work" next to "Post a Project"
         */
        "dark-outline":
          "border-background/30 text-background bg-transparent hover:bg-background/10 hover:-translate-y-0.5",

        /**
         * SUCCESS — emerald fill. Freelancer-role positive actions.
         * Use: "Accept Milestone", "Mark as Complete", "Approve Deliverable"
         */
        success:
          "bg-success text-success-foreground hover:bg-success/90 hover:-translate-y-0.5 shadow-sm hover:shadow-md",

        /**
         * SUCCESS-OUTLINE — emerald border. Lighter freelancer actions.
         * Use: "View Contracts", "Browse as Freelancer"
         */
        "success-outline":
          "border-success/30 bg-success/5 text-success hover:bg-success/10",

        /**
         * DESTRUCTIVE — red tone. Danger / irreversible actions.
         * Use: "Cancel Contract", "Delete Project", "Withdraw Bid"
         */
        destructive:
          "bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive/20 focus-visible:border-destructive/40 focus-visible:ring-destructive/20 dark:bg-destructive/20 dark:hover:bg-destructive/30",

        /**
         * GHOST — no border, no fill. Lowest visual weight.
         * Use: icon buttons, sidebar nav items, table row actions
         */
        ghost:
          "text-foreground hover:bg-muted hover:text-foreground dark:hover:bg-muted/50",

        /**
         * GHOST-MUTED — even softer ghost for secondary icon actions.
         * Use: close buttons, collapse toggles, breadcrumb nav
         */
        "ghost-muted":
          "text-muted-foreground hover:text-foreground hover:bg-muted dark:hover:bg-muted/50",

        /**
         * LINK — text-only with animated underline. Zero chrome.
         * Use: "View all 342 open projects →", inline prose actions
         */
        link:
          "text-primary underline-offset-4 hover:underline p-0 h-auto rounded-none border-none shadow-none",

        /**
         * LINK-MUTED — muted link that reveals on hover. Zero chrome.
         * Use: footer links, breadcrumbs, contextual "learn more"
         */
        "link-muted":
          "text-muted-foreground underline-offset-4 hover:text-foreground hover:underline p-0 h-auto rounded-none border-none shadow-none",
      },

      // ── Size scale ────────────────────────────────────────────────────────
      size: {
        /**
         * XS — 24px height. Micro UI actions.
         * Use: table action chips, inline "Edit" next to a label
         */
        xs: "h-6 px-2 text-xs rounded-md gap-1 [&_svg:not([class*='size-'])]:size-3",

        /**
         * SM — 28px height. Secondary actions in compact contexts.
         * Use: card footer actions, filter bar, badge-adjacent buttons
         */
        sm: "h-7 px-2.5 text-[0.8rem] rounded-md gap-1 [&_svg:not([class*='size-'])]:size-3.5",

        /**
         * DEFAULT — 36px height. Standard form actions and CTAs.
         * Use: form submit, dialog actions, sidebar action buttons
         */
        default: "h-9 px-4 text-sm",

        /**
         * LG — 44px height. Section-level hero CTAs.
         * Use: HeroSection "Post a Project", CTASection, RoleCards
         */
        lg: "h-11 px-6 text-base rounded-lg",

        /**
         * XL — 52px height. Single mega-CTA moments.
         * Use: empty state primary action, onboarding final step
         */
        xl: "h-13 px-8 text-base font-semibold rounded-xl",

        /**
         * ICON — square, default height. Icon-only actions.
         * Use: Navbar hamburger (custom), sidebar collapse toggle
         */
        icon: "size-9 p-0 rounded-lg",

        /**
         * ICON-SM — square, sm height.
         * Use: table row action icons, avatar action overlays
         */
        "icon-sm": "size-7 p-0 rounded-md [&_svg:not([class*='size-'])]:size-3.5",

        /**
         * ICON-XS — square, xs height.
         * Use: badge remove buttons, tag dismiss chips
         */
        "icon-xs": "size-6 p-0 rounded-md [&_svg:not([class*='size-'])]:size-3",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  },
);

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ButtonProps
  extends React.ComponentProps<"button">,
    VariantProps<typeof buttonVariants> {
  /** Render as a different element/component via Radix Slot */
  asChild?: boolean;
  /** Shows a spinner and disables the button */
  loading?: boolean;
  /**
   * Appends an ArrowRight icon that slides right on hover.
   * Ideal for link-style CTAs: "View all projects →"
   */
  withArrow?: boolean;
}

// ─── Component ────────────────────────────────────────────────────────────────

function Button({
  className,
  variant = "primary",
  size = "default",
  asChild = false,
  loading = false,
  withArrow = false,
  disabled,
  children,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot.Root : "button";

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      disabled={loading || disabled}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    >
      {/* Loading spinner — replaces leading icon slot */}
      {loading && <Loader2 className="animate-spin" aria-hidden />}

      {/* Children */}
      {children}

      {/* Trailing arrow — animates on hover via group-hover */}
      {withArrow && !loading && (
        <ArrowRight
          className="transition-transform duration-200 group-hover/button:translate-x-0.5"
          aria-hidden
        />
      )}
    </Comp>
  );
}

export { Button, buttonVariants };