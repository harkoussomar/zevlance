"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "radix-ui";
import { ArrowRight, Loader2 } from "lucide-react";
import { cn } from "../utils/classnames";

const buttonVariants = cva(
  [
    "group/button inline-flex shrink-0 items-center justify-center gap-2",
    "whitespace-nowrap select-none font-medium font-sans",
    "border border-transparent bg-clip-padding rounded-lg",
    "transition-all duration-[var(--duration-base)] ease-[var(--ease-standard)]",
    "outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
    "active:not-aria-[haspopup]:translate-y-px active:not-aria-[haspopup]:scale-[0.99]",
    "disabled:pointer-events-none disabled:opacity-40",
    "aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20",
    "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  ].join(" "),
  {
    variants: {
      variant: {
        primary:
          "bg-primary text-primary-foreground border-primary/20 hover:bg-primary/90 hover:-translate-y-0.5 shadow-sm hover:shadow-[var(--shadow-glow)]",
        secondary:
          "bg-secondary text-secondary-foreground border-border hover:bg-secondary/70",
        outline:
          "border-border bg-transparent text-foreground hover:bg-muted hover:-translate-y-0.5 dark:bg-transparent dark:border-border dark:hover:bg-surface-2",
        gold:
          "bg-gold text-gold-foreground border-gold/20 hover:opacity-90 hover:-translate-y-0.5 shadow-sm hover:shadow-[var(--shadow-glow-gold)] font-semibold",
        "gold-outline":
          "border-gold/40 bg-gold/5 text-gold hover:bg-gold/10 hover:border-gold/60",
        dark:
          "bg-foreground text-background hover:bg-foreground/90 hover:-translate-y-0.5 shadow-lg",
        "dark-outline":
          "border-background/30 text-background bg-transparent hover:bg-background/10 hover:-translate-y-0.5",
        success:
          "bg-success text-success-foreground border-success/20 hover:bg-success/90 hover:-translate-y-0.5 shadow-sm",
        "success-outline":
          "border-success/35 bg-success/8 text-success hover:bg-success/15",
        destructive:
          "bg-destructive/10 text-destructive border-destructive/25 hover:bg-destructive/18 focus-visible:border-destructive/40 focus-visible:ring-destructive/20 dark:bg-destructive/15 dark:hover:bg-destructive/25",
        ghost:
          "text-foreground hover:bg-muted hover:text-foreground dark:hover:bg-surface-2",
        "ghost-muted":
          "text-muted-foreground hover:text-foreground hover:bg-muted dark:hover:bg-surface-2",
        link:
          "text-primary underline-offset-4 hover:underline p-0 h-auto rounded-none border-none shadow-none",
        "link-muted":
          "text-muted-foreground underline-offset-4 hover:text-foreground hover:underline p-0 h-auto rounded-none border-none shadow-none",
      },
      size: {
        xs:       "h-6 px-2 text-xs rounded-md gap-1 [&_svg:not([class*='size-'])]:size-3",
        sm:       "h-7 px-2.5 text-[0.8rem] rounded-md gap-1 [&_svg:not([class*='size-'])]:size-3.5",
        default:  "h-9 px-4 text-sm",
        lg:       "h-11 px-6 text-base rounded-xl",
        xl:       "h-13 px-8 text-base font-semibold rounded-xl",
        icon:     "size-9 p-0 rounded-lg",
        "icon-sm":"size-7 p-0 rounded-md [&_svg:not([class*='size-'])]:size-3.5",
        "icon-xs":"size-6 p-0 rounded-md [&_svg:not([class*='size-'])]:size-3",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ComponentProps<"button">,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
  loadingLabel?: string;
  withArrow?: boolean;
}

function Button({
  className,
  variant = "primary",
  size = "default",
  asChild = false,
  loading = false,
  loadingLabel = "Loading…",
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
      aria-busy={loading}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    >
      {loading && (
        <>
          <Loader2 className="animate-spin" aria-hidden />
          <span className="sr-only">{loadingLabel}</span>
        </>
      )}
      {children}
      {withArrow && !loading && (
        <ArrowRight
          className="transition-transform duration-(--duration-base) group-hover/button:translate-x-0.5"
          aria-hidden
        />
      )}
    </Comp>
  );
}

export { Button, buttonVariants };