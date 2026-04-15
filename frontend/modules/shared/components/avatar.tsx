"use client"

import * as React from "react"
import { Avatar as AvatarPrimitive } from "radix-ui"
import { cn } from "@/modules/shared"

// ─── Primitives (shadcn, unchanged except cn import) ──────────────────────────

function Avatar({
  className,
  size = "default",
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Root> & {
  size?: "2xs" | "xs" | "sm" | "default" | "md" | "lg" | "xl" | "2xl"
}) {
  return (
    <AvatarPrimitive.Root
      data-slot="avatar"
      data-size={size}
      className={cn(
        "group/avatar relative flex shrink-0 overflow-hidden rounded-full select-none",
        // your full size scale via data-size
        "data-[size=2xs]:size-5 data-[size=xs]:size-6 data-[size=sm]:size-7",
        "data-[size=default]:size-8 data-[size=md]:size-9 data-[size=lg]:size-10",
        "data-[size=xl]:size-12 data-[size=2xl]:size-16",
        className
      )}
      {...props}
    />
  )
}

function AvatarImage({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Image>) {
  return (
    <AvatarPrimitive.Image
      data-slot="avatar-image"
      className={cn("aspect-square size-full object-cover", className)}
      {...props}
    />
  )
}

function AvatarFallback({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Fallback>) {
  return (
    <AvatarPrimitive.Fallback
      data-slot="avatar-fallback"
      className={cn(
        "flex size-full items-center justify-center rounded-full font-bold",
        // text scale per size
        "group-data-[size=2xs]/avatar:text-[8px] group-data-[size=xs]/avatar:text-[9px]",
        "group-data-[size=sm]/avatar:text-[10px] group-data-[size=default]/avatar:text-xs",
        "group-data-[size=md]/avatar:text-xs group-data-[size=lg]/avatar:text-sm",
        "group-data-[size=xl]/avatar:text-sm group-data-[size=2xl]/avatar:text-base",
        className
      )}
      {...props}
    />
  )
}

function AvatarBadge({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="avatar-badge"
      className={cn(
        "absolute right-0 bottom-0 z-10 inline-flex items-center justify-center rounded-full bg-primary text-primary-foreground ring-2 ring-background select-none",
        "group-data-[size=sm]/avatar:size-2 group-data-[size=sm]/avatar:[&>svg]:hidden",
        "group-data-[size=default]/avatar:size-2.5 group-data-[size=default]/avatar:[&>svg]:size-2",
        "group-data-[size=lg]/avatar:size-3 group-data-[size=lg]/avatar:[&>svg]:size-2",
        className
      )}
      {...props}
    />
  )
}

function AvatarGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="avatar-group"
      className={cn(
        "group/avatar-group flex -space-x-2 *:data-[slot=avatar]:ring-2 *:data-[slot=avatar]:ring-background",
        className
      )}
      {...props}
    />
  )
}

function AvatarGroupCount({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="avatar-group-count"
      className={cn(
        "relative flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-sm text-muted-foreground ring-2 ring-background",
        "group-has-data-[size=lg]/avatar-group:size-10 group-has-data-[size=sm]/avatar-group:size-6",
        "[&>svg]:size-4 group-has-data-[size=lg]/avatar-group:[&>svg]:size-5 group-has-data-[size=sm]/avatar-group:[&>svg]:size-3",
        className
      )}
      {...props}
    />
  )
}

// ─── Color logic (your system) ────────────────────────────────────────────────

const AVATAR_COLORS: Array<{ bg: string; text: string }> = [
  { bg: "bg-indigo-500/15 dark:bg-indigo-500/20", text: "text-indigo-600 dark:text-indigo-400" },
  { bg: "bg-emerald-500/15 dark:bg-emerald-500/20", text: "text-emerald-600 dark:text-emerald-400" },
  { bg: "bg-amber-500/15 dark:bg-amber-500/20", text: "text-amber-600 dark:text-amber-400" },
  { bg: "bg-rose-500/15 dark:bg-rose-500/20", text: "text-rose-600 dark:text-rose-400" },
  { bg: "bg-blue-500/15 dark:bg-blue-500/20", text: "text-blue-600 dark:text-blue-400" },
  { bg: "bg-violet-500/15 dark:bg-violet-500/20", text: "text-violet-600 dark:text-violet-400" },
  { bg: "bg-cyan-500/15 dark:bg-cyan-500/20", text: "text-cyan-600 dark:text-cyan-400" },
  { bg: "bg-pink-500/15 dark:bg-pink-500/20", text: "text-pink-600 dark:text-pink-400" },
]

function getAvatarColor(name: string) {
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return "?"
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase()
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase()
}

// ─── Smart Avatar (your API: name + src, auto color + initials) ───────────────

export type SmartAvatarSize = "2xs" | "xs" | "sm" | "default" | "md" | "lg" | "xl" | "2xl"

export interface SmartAvatarProps {
  name?: string
  src?: string | null
  size?: SmartAvatarSize
  className?: string
  style?: React.CSSProperties
  badge?: React.ReactNode
}

function SmartAvatar({ name = "", src, size = "default", className, style, badge }: SmartAvatarProps) {
  const { bg, text } = getAvatarColor(name)
  const initials = getInitials(name)

  return (
    <Avatar size={size} className={className} style={style} title={name} aria-label={name}>
      {src && <AvatarImage src={src} alt={name} />}
      <AvatarFallback className={cn(bg, text)}>
        {initials}
      </AvatarFallback>
      {badge && <AvatarBadge>{badge}</AvatarBadge>}
    </Avatar>
  )
}

// ─── SmartAvatarGroup (your max/overflow API) ─────────────────────────────────

export interface SmartAvatarGroupProps {
  items: Array<{ name: string; src?: string | null }>
  max?: number
  size?: SmartAvatarSize
  className?: string
}

function SmartAvatarGroup({ items, max = 4, size = "default", className }: SmartAvatarGroupProps) {
  const visible = items.slice(0, max)
  const overflow = items.length - max

  return (
    <AvatarGroup className={className}>
      {visible.map((item, i) => (
        <SmartAvatar key={i} name={item.name} src={item.src} size={size} />
      ))}
      {overflow > 0 && (
        <AvatarGroupCount aria-label={`${overflow} more`}>
          +{overflow}
        </AvatarGroupCount>
      )}
    </AvatarGroup>
  )
}

// ─── AvatarWithLabel (your sidebar/profile usage) ─────────────────────────────

interface AvatarWithLabelProps extends SmartAvatarProps {
  label: string
  sublabel?: string
  labelClassName?: string
}

function AvatarWithLabel({ label, sublabel, labelClassName, ...avatarProps }: AvatarWithLabelProps) {
  return (
    <div className="flex items-center gap-3 min-w-0">
      <SmartAvatar {...avatarProps} name={label} />
      <div className="flex-1 min-w-0">
        <p className={cn("text-sm font-semibold text-foreground truncate", labelClassName)}>
          {label}
        </p>
        {sublabel && (
          <p className="text-xs text-muted-foreground truncate">{sublabel}</p>
        )}
      </div>
    </div>
  )
}

export {
  // primitives (for advanced/custom usage)
  Avatar,
  AvatarImage,
  AvatarFallback,
  AvatarBadge,
  AvatarGroup,
  AvatarGroupCount,
  // smart components (your existing API)
  SmartAvatar,
  SmartAvatarGroup,
  AvatarWithLabel,
}