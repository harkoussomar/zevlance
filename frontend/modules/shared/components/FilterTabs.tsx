import { ReactNode } from "react";
import { cn } from "@/modules/shared";
import { Tabs, TabsList, TabsTrigger } from "./tabs";


// 1. Export the interface so we can type our constants
export interface FilterTab<T extends string = string> {
    label: string;
    value: T;
    icon?: ReactNode;
    badge?: number; // Add optional badge
}

interface FilterTabsProps<T extends string = string> {
    tabs: FilterTab<T>[];
    value: T;
    onValueChange: (value: T) => void;
    className?: string;
}

export function FilterTabs<T extends string = string>({
    tabs,
    value,
    onValueChange,
    className,
}: FilterTabsProps<T>) {
    return (
        <Tabs
            value={value}
            onChange={(v) => onValueChange(v as T)}
            className={cn("w-auto", className)}
        >
            <TabsList className="bg-muted/30 border border-border p-1 rounded-lg gap-1 overflow-x-auto [&::-webkit-scrollbar]:hidden">
                {tabs.map((tab) => (
                    <TabsTrigger
                        key={tab.value}
                        value={tab.value}
                        className="flex items-center gap-1.5 whitespace-nowrap shrink-0 px-3 py-1.5 text-xs rounded-md border-b-0"
                    >
                        {tab.icon}
                        {tab.label}
                        {/* 2. Professional badge styling isolated from the label */}
                        {tab.badge !== undefined && (
                            <span className="ml-0.5 rounded-full bg-muted-foreground/15 px-1.5 py-0.5 text-[10px] leading-none text-muted-foreground">
                                {tab.badge}
                            </span>
                        )}
                    </TabsTrigger>
                ))}
            </TabsList>
        </Tabs>
    );
}