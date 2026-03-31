"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { X, ChevronDown, AlertCircle, CheckCircle2, Info } from "lucide-react";

// ═══════════════════════════════════════════════════════════════════════════════
// BUTTON
// ═══════════════════════════════════════════════════════════════════════════════

export type ButtonVariant =
    | "default"
    | "outline"
    | "ghost"
    | "destructive"
    | "secondary"
    | "link";
export type ButtonSize = "sm" | "md" | "lg" | "icon";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant;
    size?: ButtonSize;
    loading?: boolean;
    asChild?: boolean;
}

const buttonVariants: Record<ButtonVariant, string> = {
    default: "bg-foreground text-background hover:bg-foreground/90 shadow-sm",
    outline:
        "border border-border bg-background hover:bg-muted text-foreground",
    ghost: "hover:bg-muted text-foreground",
    destructive:
        "bg-destructive text-destructive-foreground hover:bg-destructive/90",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
    link: "text-primary underline-offset-4 hover:underline p-0 h-auto",
};

const buttonSizes: Record<ButtonSize, string> = {
    sm: "h-8 px-3 text-xs rounded-md",
    md: "h-10 px-4 text-sm rounded-lg",
    lg: "h-11 px-6 text-sm rounded-lg",
    icon: "h-9 w-9 rounded-lg",
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    (
        {
            className,
            variant = "default",
            size = "md",
            loading,
            disabled,
            children,
            ...props
        },
        ref,
    ) => (
        <button
            ref={ref}
            disabled={disabled || loading}
            className={cn(
                "inline-flex items-center justify-center gap-2 font-semibold transition-all duration-200",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                "disabled:pointer-events-none disabled:opacity-50",
                "hover:-translate-y-px active:translate-y-0",
                buttonVariants[variant],
                buttonSizes[size],
                className,
            )}
            {...props}
        >
            {loading && (
                <svg
                    className="h-3.5 w-3.5 animate-spin"
                    viewBox="0 0 24 24"
                    fill="none"
                >
                    <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                    />
                    <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                </svg>
            )}
            {children}
        </button>
    ),
);
Button.displayName = "Button";

// ═══════════════════════════════════════════════════════════════════════════════
// BADGE
// ═══════════════════════════════════════════════════════════════════════════════

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
    variant?: "default" | "secondary" | "outline" | "dot";
    dotColor?: string;
}

export function Badge({
    className,
    variant = "default",
    dotColor,
    children,
    ...props
}: BadgeProps) {
    return (
        <span
            className={cn(
                "inline-flex items-center gap-1.5 text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full border",
                variant === "default" &&
                    "bg-primary/10 text-primary border-primary/20",
                variant === "secondary" &&
                    "bg-muted text-muted-foreground border-border",
                variant === "outline" && "border-border text-foreground",
                className,
            )}
            {...props}
        >
            {variant === "dot" && dotColor && (
                <span
                    className={cn(
                        "w-1.5 h-1.5 rounded-full shrink-0",
                        dotColor,
                    )}
                />
            )}
            {children}
        </span>
    );
}

// ═══════════════════════════════════════════════════════════════════════════════
// CARD
// ═══════════════════════════════════════════════════════════════════════════════

export function Card({
    className,
    children,
    ...props
}: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            className={cn(
                "rounded-xl border border-border bg-card text-card-foreground shadow-sm",
                className,
            )}
            {...props}
        >
            {children}
        </div>
    );
}

export function CardHeader({
    className,
    children,
    ...props
}: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            className={cn("flex flex-col gap-1 p-5 pb-0", className)}
            {...props}
        >
            {children}
        </div>
    );
}

export function CardTitle({
    className,
    children,
    ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
    return (
        <h3
            className={cn(
                "font-bold text-base text-foreground leading-tight",
                className,
            )}
            {...props}
        >
            {children}
        </h3>
    );
}

export function CardDescription({
    className,
    children,
    ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
    return (
        <p
            className={cn("text-sm text-muted-foreground", className)}
            {...props}
        >
            {children}
        </p>
    );
}

export function CardContent({
    className,
    children,
    ...props
}: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div className={cn("p-5", className)} {...props}>
            {children}
        </div>
    );
}

export function CardFooter({
    className,
    children,
    ...props
}: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            className={cn(
                "flex items-center px-5 py-4 border-t border-border mt-auto",
                className,
            )}
            {...props}
        >
            {children}
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════════════════════
// INPUT
// ═══════════════════════════════════════════════════════════════════════════════

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    startIcon?: React.ReactNode;
    endIcon?: React.ReactNode;
    error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, type, startIcon, endIcon, error, ...props }, ref) => (
        <div className="relative w-full">
            {startIcon && (
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    {startIcon}
                </div>
            )}
            <input
                type={type}
                ref={ref}
                className={cn(
                    "flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm",
                    "placeholder:text-muted-foreground/60",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-ring",
                    "disabled:cursor-not-allowed disabled:opacity-50 transition-colors duration-200",
                    startIcon && "pl-9",
                    endIcon && "pr-9",
                    error &&
                        "border-destructive focus-visible:ring-destructive/30",
                    className,
                )}
                {...props}
            />
            {endIcon && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    {endIcon}
                </div>
            )}
            {error && (
                <p className="mt-1.5 text-xs text-destructive flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    {error}
                </p>
            )}
        </div>
    ),
);
Input.displayName = "Input";

// ═══════════════════════════════════════════════════════════════════════════════
// LABEL
// ═══════════════════════════════════════════════════════════════════════════════

export function Label({
    className,
    children,
    required,
    ...props
}: React.LabelHTMLAttributes<HTMLLabelElement> & { required?: boolean }) {
    return (
        <label
            className={cn(
                "text-sm font-semibold text-foreground leading-none",
                className,
            )}
            {...props}
        >
            {children}
            {required && <span className="text-destructive ml-0.5">*</span>}
        </label>
    );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TEXTAREA
// ═══════════════════════════════════════════════════════════════════════════════

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    error?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
    ({ className, error, ...props }, ref) => (
        <div className="w-full">
            <textarea
                ref={ref}
                className={cn(
                    "flex min-h-25 w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm",
                    "placeholder:text-muted-foreground/60 resize-y",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-ring",
                    "disabled:cursor-not-allowed disabled:opacity-50 transition-colors duration-200",
                    error &&
                        "border-destructive focus-visible:ring-destructive/30",
                    className,
                )}
                {...props}
            />
            {error && (
                <p className="mt-1.5 text-xs text-destructive flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    {error}
                </p>
            )}
        </div>
    ),
);
Textarea.displayName = "Textarea";

// ═══════════════════════════════════════════════════════════════════════════════
// SELECT
// ═══════════════════════════════════════════════════════════════════════════════

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    error?: string;
    placeholder?: string;
    options: Array<{ value: string; label: string }>;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
    ({ className, error, placeholder, options, ...props }, ref) => (
        <div className="relative w-full">
            <select
                ref={ref}
                className={cn(
                    "flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 pr-9 text-sm appearance-none cursor-pointer",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-ring",
                    "disabled:cursor-not-allowed disabled:opacity-50 transition-colors duration-200",
                    error &&
                        "border-destructive focus-visible:ring-destructive/30",
                    className,
                )}
                {...props}
            >
                {placeholder && (
                    <option value="" className="text-muted-foreground">
                        {placeholder}
                    </option>
                )}
                {options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                        {opt.label}
                    </option>
                ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            {error && (
                <p className="mt-1.5 text-xs text-destructive flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    {error}
                </p>
            )}
        </div>
    ),
);
Select.displayName = "Select";

// ═══════════════════════════════════════════════════════════════════════════════
// AVATAR
// ═══════════════════════════════════════════════════════════════════════════════

interface AvatarProps {
    name: string;
    size?: "xs" | "sm" | "md" | "lg" | "xl";
    className?: string;
    src?: string | null;
}

const avatarSizes: Record<string, string> = {
    xs: "w-6 h-6 text-[9px]",
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-12 h-12 text-base",
    xl: "w-16 h-16 text-lg",
};

const avatarColors = [
    "bg-blue-500/20 text-blue-700 dark:text-blue-300",
    "bg-purple-500/20 text-purple-700 dark:text-purple-300",
    "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300",
    "bg-amber-500/20 text-amber-700 dark:text-amber-300",
    "bg-rose-500/20 text-rose-700 dark:text-rose-300",
    "bg-cyan-500/20 text-cyan-700 dark:text-cyan-300",
];

function getAvatarColor(name: string): string {
    const index = name.charCodeAt(0) % avatarColors.length;
    return avatarColors[index];
}

export function Avatar({ name, size = "md", className, src }: AvatarProps) {
    const initials = name
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase();

    if (src) {
        return (
            <img
                src={src}
                alt={name}
                className={cn(
                    "rounded-full object-cover shrink-0",
                    avatarSizes[size],
                    className,
                )}
            />
        );
    }

    return (
        <div
            className={cn(
                "rounded-full flex items-center justify-center font-bold shrink-0 border border-border/50",
                avatarSizes[size],
                getAvatarColor(name),
                className,
            )}
            title={name}
        >
            {initials}
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SKELETON
// ═══════════════════════════════════════════════════════════════════════════════

export function Skeleton({
    className,
    ...props
}: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            className={cn("animate-pulse rounded-md bg-muted", className)}
            {...props}
        />
    );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SEPARATOR
// ═══════════════════════════════════════════════════════════════════════════════

export function Separator({
    orientation = "horizontal",
    className,
}: {
    orientation?: "horizontal" | "vertical";
    className?: string;
}) {
    return (
        <div
            className={cn(
                "bg-border shrink-0",
                orientation === "horizontal" ? "h-px w-full" : "h-full w-px",
                className,
            )}
        />
    );
}

// ═══════════════════════════════════════════════════════════════════════════════
// PROGRESS
// ═══════════════════════════════════════════════════════════════════════════════

interface ProgressProps {
    value: number;
    max?: number;
    className?: string;
    barClassName?: string;
    showLabel?: boolean;
}

export function Progress({
    value,
    max = 100,
    className,
    barClassName,
    showLabel,
}: ProgressProps) {
    const pct = Math.min(Math.max((value / max) * 100, 0), 100);
    return (
        <div className={cn("flex items-center gap-3", className)}>
            <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                <div
                    className={cn(
                        "h-full rounded-full bg-primary transition-all duration-500",
                        barClassName,
                    )}
                    style={{ width: `${pct}%` }}
                />
            </div>
            {showLabel && (
                <span className="text-xs font-semibold text-muted-foreground w-9 text-right">
                    {Math.round(pct)}%
                </span>
            )}
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TABS
// ═══════════════════════════════════════════════════════════════════════════════

interface TabsContextType {
    activeTab: string;
    setActiveTab: (tab: string) => void;
}

const TabsContext = React.createContext<TabsContextType>({
    activeTab: "",
    setActiveTab: () => {},
});

interface TabsProps {
    defaultValue: string;
    className?: string;
    children: React.ReactNode;
    onChange?: (value: string) => void;
}

export function Tabs({
    defaultValue,
    className,
    children,
    onChange,
}: TabsProps) {
    const [activeTab, setActiveTab] = React.useState(defaultValue);

    const handleChange = (tab: string) => {
        setActiveTab(tab);
        onChange?.(tab);
    };

    return (
        <TabsContext.Provider value={{ activeTab, setActiveTab: handleChange }}>
            <div className={cn("w-full", className)}>{children}</div>
        </TabsContext.Provider>
    );
}

export function TabsList({
    className,
    children,
}: {
    className?: string;
    children: React.ReactNode;
}) {
    return (
        <div
            className={cn(
                "flex items-center gap-1 border-b border-border",
                className,
            )}
        >
            {children}
        </div>
    );
}

export function TabsTrigger({
    value,
    children,
    className,
    badge,
}: {
    value: string;
    children: React.ReactNode;
    className?: string;
    badge?: number;
}) {
    const { activeTab, setActiveTab } = React.useContext(TabsContext);
    const isActive = activeTab === value;

    return (
        <button
            onClick={() => setActiveTab(value)}
            className={cn(
                "relative flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold transition-colors duration-200",
                "focus-visible:outline-none",
                isActive
                    ? "text-primary border-b-2 border-primary -mb-px"
                    : "text-muted-foreground hover:text-foreground",
                className,
            )}
        >
            {children}
            {badge !== undefined && badge > 0 && (
                <span className="ml-1 text-[10px] font-bold bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">
                    {badge}
                </span>
            )}
        </button>
    );
}

export function TabsContent({
    value,
    children,
    className,
}: {
    value: string;
    children: React.ReactNode;
    className?: string;
}) {
    const { activeTab } = React.useContext(TabsContext);
    if (activeTab !== value) return null;
    return <div className={cn("mt-6", className)}>{children}</div>;
}

// ═══════════════════════════════════════════════════════════════════════════════
// DIALOG / MODAL
// ═══════════════════════════════════════════════════════════════════════════════

interface DialogProps {
    open: boolean;
    onClose: () => void;
    title?: string;
    description?: string;
    children: React.ReactNode;
    size?: "sm" | "md" | "lg" | "xl";
}

const dialogSizes: Record<string, string> = {
    sm: "max-w-sm",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
};

export function Dialog({
    open,
    onClose,
    title,
    description,
    children,
    size = "md",
}: DialogProps) {
    React.useEffect(() => {
        if (open) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => {
            document.body.style.overflow = "";
        };
    }, [open]);

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-background/80 backdrop-blur-sm"
                onClick={onClose}
            />
            {/* Panel */}
            <div
                className={cn(
                    "relative w-full rounded-xl border border-border bg-card shadow-2xl",
                    "animate-in fade-in zoom-in-95 duration-200",
                    dialogSizes[size],
                )}
            >
                {/* Header */}
                {(title || description) && (
                    <div className="flex items-start justify-between p-5 border-b border-border">
                        <div>
                            {title && (
                                <h2 className="text-lg font-bold text-foreground">
                                    {title}
                                </h2>
                            )}
                            {description && (
                                <p className="text-sm text-muted-foreground mt-0.5">
                                    {description}
                                </p>
                            )}
                        </div>
                        <button
                            onClick={onClose}
                            className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                )}
                {/* Content */}
                <div className="p-5">{children}</div>
            </div>
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ALERT
// ═══════════════════════════════════════════════════════════════════════════════

interface AlertProps {
    variant?: "default" | "destructive" | "success" | "warning";
    title?: string;
    children: React.ReactNode;
    className?: string;
}

const alertVariants = {
    default: {
        wrapper: "bg-primary/5 border-primary/20 text-primary",
        icon: <Info className="w-4 h-4 shrink-0 mt-0.5" />,
    },
    destructive: {
        wrapper: "bg-destructive/5 border-destructive/20 text-destructive",
        icon: <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />,
    },
    success: {
        wrapper:
            "bg-emerald-500/5 border-emerald-500/20 text-emerald-700 dark:text-emerald-400",
        icon: <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />,
    },
    warning: {
        wrapper:
            "bg-amber-500/5 border-amber-500/20 text-amber-700 dark:text-amber-400",
        icon: <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />,
    },
};

export function Alert({
    variant = "default",
    title,
    children,
    className,
}: AlertProps) {
    const v = alertVariants[variant];
    return (
        <div
            className={cn(
                "flex gap-3 rounded-lg border p-4 text-sm",
                v.wrapper,
                className,
            )}
        >
            {v.icon}
            <div>
                {title && <p className="font-semibold mb-0.5">{title}</p>}
                <div className="opacity-90">{children}</div>
            </div>
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════════════════════
// FORM FIELD (label + input + error — composed)
// ═══════════════════════════════════════════════════════════════════════════════

interface FormFieldProps {
    label: string;
    required?: boolean;
    hint?: string;
    error?: string;
    className?: string;
    children: React.ReactNode;
}

export function FormField({
    label,
    required,
    hint,
    error,
    className,
    children,
}: FormFieldProps) {
    return (
        <div className={cn("flex flex-col gap-1.5", className)}>
            <Label required={required}>{label}</Label>
            {children}
            {hint && !error && (
                <p className="text-xs text-muted-foreground">{hint}</p>
            )}
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════════════════════
// STAR RATING
// ═══════════════════════════════════════════════════════════════════════════════

import { Star } from "lucide-react";

interface StarRatingProps {
    rating: number;
    max?: number;
    size?: "sm" | "md";
    showValue?: boolean;
}

export function StarRating({
    rating,
    max = 5,
    size = "sm",
    showValue,
}: StarRatingProps) {
    const iconSize = size === "sm" ? "w-3.5 h-3.5" : "w-4 h-4";
    return (
        <div className="flex items-center gap-1 ml-auto">
            <div className="flex gap-0.5">
                {Array.from({ length: max }).map((_, i) => (
                    <Star
                        key={i}
                        className={cn(
                            iconSize,
                            i < Math.round(rating)
                                ? "fill-amber-400 text-amber-400"
                                : "text-muted-foreground/25 fill-muted-foreground/10",
                        )}
                    />
                ))}
            </div>
            {showValue && (
                <span className="text-xs font-semibold text-muted-foreground ml-1">
                    {rating.toFixed(1)}
                </span>
            )}
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════════════════════
// STAT CARD
// ═══════════════════════════════════════════════════════════════════════════════

interface StatCardProps {
    label: string;
    value: string | number;
    icon?: React.ReactNode;
    trend?: { value: string; positive: boolean };
    className?: string;
}

export function StatCard({
    label,
    value,
    icon,
    trend,
    className,
}: StatCardProps) {
    return (
        <Card
            className={cn(
                "group hover:border-primary/30 hover:shadow-md transition-all duration-200",
                className,
            )}
        >
            <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                    <span className="text-sm font-medium text-muted-foreground">
                        {label}
                    </span>
                    {icon && (
                        <div className="p-2 rounded-lg bg-primary/8 text-primary group-hover:bg-primary/12 transition-colors">
                            {icon}
                        </div>
                    )}
                </div>
                <div className="text-2xl font-bold text-foreground tracking-tight">
                    {value}
                </div>
                {trend && (
                    <p
                        className={cn(
                            "text-xs font-medium mt-1.5",
                            trend.positive
                                ? "text-emerald-600 dark:text-emerald-400"
                                : "text-destructive",
                        )}
                    >
                        {trend.positive ? "↑" : "↓"} {trend.value}
                    </p>
                )}
            </CardContent>
        </Card>
    );
}

// ═══════════════════════════════════════════════════════════════════════════════
// EMPTY STATE
// ═══════════════════════════════════════════════════════════════════════════════

interface EmptyStateProps {
    icon?: React.ReactNode;
    title: string;
    description?: string;
    action?: React.ReactNode;
    className?: string;
}

export function EmptyState({
    icon,
    title,
    description,
    action,
    className,
}: EmptyStateProps) {
    return (
        <div
            className={cn(
                "flex flex-col items-center justify-center text-center py-16 px-4",
                className,
            )}
        >
            {icon && (
                <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center text-muted-foreground mb-4">
                    {icon}
                </div>
            )}
            <h3 className="text-base font-bold text-foreground mb-1.5">
                {title}
            </h3>
            {description && (
                <p className="text-sm text-muted-foreground max-w-sm mb-5">
                    {description}
                </p>
            )}
            {action}
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TOOLTIP (simple hover title wrapper)
// ═══════════════════════════════════════════════════════════════════════════════

export function Tooltip({
    content,
    children,
}: {
    content: string;
    children: React.ReactNode;
}) {
    return (
        <span className="relative group/tooltip inline-flex" title={content}>
            {children}
        </span>
    );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SKILL TAG
// ═══════════════════════════════════════════════════════════════════════════════

export function SkillTag({
    skill,
    onRemove,
}: {
    skill: string;
    onRemove?: () => void;
}) {
    return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-secondary text-secondary-foreground text-xs font-medium border border-border">
            {skill}
            {onRemove && (
                <button
                    onClick={onRemove}
                    className="ml-0.5 hover:text-destructive transition-colors"
                >
                    <X className="w-3 h-3" />
                </button>
            )}
        </span>
    );
}
