import { cn } from "@/modules/shared";
import React from "react";

interface TabsContextType {
    activeTab: string;
    setActiveTab: (tab: string) => void;
}

const TabsContext = React.createContext<TabsContextType>({
    activeTab: "",
    setActiveTab: () => {},
});
interface TabsProps {
    defaultValue?: string;
    value?: string;           // ← add controlled mode
    className?: string;
    children: React.ReactNode;
    onChange?: (value: string) => void;
}

export function Tabs({
    defaultValue = "",
    value,
    className,
    children,
    onChange,
}: TabsProps) {
    const [internalTab, setInternalTab] = React.useState(defaultValue);

    const activeTab = value ?? internalTab;  // controlled takes priority

    const handleChange = (tab: string) => {
        if (value === undefined) {
            setInternalTab(tab);  // only update internal state if uncontrolled
        }
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
