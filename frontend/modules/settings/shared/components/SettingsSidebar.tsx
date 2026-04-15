import { cn } from "@/modules/shared";
import { ChevronRight } from "lucide-react";
import { NavItem } from "../types/settings.shared";

interface SidebarProps<T extends string> {
    items: NavItem<T>[];
    active: T;
    onSelect: (id: T) => void;
    avatarUrl?: string;
    name?: string;
    subtitle?: string;
}

export function SettingsSidebar<T extends string>({
    items,
    active,
    onSelect,
}: SidebarProps<T>) {
    return (
        <aside className="w-56 shrink-0 space-y-6">
            {/* Nav items */}
            <nav className="space-y-0.5" aria-label="Settings sections">
                {items.map(({ id, label, icon: Icon, description }) => {
                    const isActive = active === id;
                    return (
                        <button
                            key={id}
                            type="button"
                            onClick={() => onSelect(id)}
                            aria-current={isActive ? "page" : undefined}
                            className={cn(
                                "group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-all duration-150",
                                isActive
                                    ? "bg-primary/8 text-foreground shadow-sm"
                                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                            )}
                        >
                            <Icon
                                className={cn(
                                    "h-4 w-4 shrink-0 transition-colors",
                                    isActive
                                        ? "text-primary"
                                        : "text-muted-foreground group-hover:text-foreground",
                                )}
                            />
                            <div className="min-w-0 flex-1">
                                <p
                                    className={cn(
                                        "text-sm font-medium leading-none",
                                        isActive ? "text-foreground" : "",
                                    )}
                                >
                                    {label}
                                </p>
                                <p className="mt-0.5 text-xs text-muted-foreground truncate">
                                    {description}
                                </p>
                            </div>
                            {isActive && (
                                <ChevronRight className="h-3.5 w-3.5 shrink-0 text-primary" />
                            )}
                        </button>
                    );
                })}
            </nav>
        </aside>
    );
}