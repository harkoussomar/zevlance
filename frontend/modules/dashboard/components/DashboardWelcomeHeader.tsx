import { ReactNode } from "react";

function getGreeting(): string {
    const hour = new Date().getHours();
    
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
}

interface Props {
    name?:     string | null;
    subtitle:  string;
    action:    ReactNode;
}

export function DashboardWelcomeHeader({ name, subtitle, action }: Props) {
    const firstName = name?.split(" ")[0];
    return (
        <div className="flex items-start justify-between gap-4">
            <div>
                <h1 className="text-2xl font-bold text-foreground">
                    {getGreeting()}{firstName ? `, ${firstName}` : ""}
                </h1>
                <p className="text-muted-foreground mt-1 text-sm">{subtitle}</p>
            </div>
            <div className="shrink-0">{action}</div>
        </div>
    );
}