"use client";

import {
    Area,
    AreaChart,
    CartesianGrid,
    XAxis,
    YAxis,
} from "recharts";
import { format } from "date-fns";
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart";
import { TrendingUp, Users } from "lucide-react";
import type { UserGrowthDataPoint } from "../types/admin.overview.types";

const chartConfig = {
    users: {
        label: "New users",
        color: "var(--color-chart-2)",
    },
} satisfies ChartConfig;

export function UserGrowthChart({ data }: { data: UserGrowthDataPoint[] }) {
    if (!data || data.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center gap-3 border border-border rounded-xl bg-card text-muted-foreground">
                <Users className="size-8 opacity-20" />
                <p className="text-sm">No user growth data available</p>
            </div>
        );
    }

    const sorted = [...data].sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    );

    const total = sorted.reduce((sum, d) => sum + d.users, 0);
    const lastTwo = sorted.slice(-2);
    const trend =
        lastTwo.length === 2
            ? ((lastTwo[1].users - lastTwo[0].users) / (lastTwo[0].users || 1)) * 100
            : 0;

    return (
        <div className="border border-border rounded-xl bg-card shadow-md overflow-hidden">
            {/* Header */}
            <div className="px-6 pt-5 pb-4 flex items-start justify-between gap-4 border-b border-border/60">
                <div className="flex items-center gap-3">
                    <div className="size-9 rounded-lg bg-chart-2/10 flex items-center justify-center shrink-0">
                        <Users className="size-4 text-chart-2" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-foreground font-display leading-tight">
                            User Growth
                        </h3>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            New registrations · Last 30 days
                        </p>
                    </div>
                </div>
                <div className="text-right shrink-0">
                    <p className="text-xl font-bold text-foreground font-display tabular-nums">
                        {total.toLocaleString()}
                    </p>
                    <div
                        className={`inline-flex items-center gap-1 text-[11px] font-semibold mt-0.5 ${
                            trend >= 0 ? "text-success" : "text-destructive"
                        }`}
                    >
                        <TrendingUp className={`size-3 ${trend < 0 ? "rotate-180" : ""}`} />
                        {trend >= 0 ? "+" : ""}
                        {trend.toFixed(1)}% vs prev day
                    </div>
                </div>
            </div>

            {/* Chart */}
            <div className="px-2 pt-4 pb-2">
                <ChartContainer config={chartConfig} className="h-55 w-full">
                    <AreaChart
                        accessibilityLayer
                        data={sorted}
                        margin={{ left: 0, right: 16, top: 8, bottom: 0 }}
                    >
                        <defs>
                            <linearGradient id="usersGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%"   stopColor="var(--color-chart-2)" stopOpacity={0.25} />
                                <stop offset="60%"  stopColor="var(--color-chart-2)" stopOpacity={0.08} />
                                <stop offset="100%" stopColor="var(--color-chart-2)" stopOpacity={0} />
                            </linearGradient>
                        </defs>

                        <CartesianGrid
                            vertical={false}
                            stroke="currentColor"
                            strokeOpacity={0.06}
                            strokeDasharray="4 4"
                        />
                        <XAxis
                            dataKey="date"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={10}
                            tick={{ fontSize: 11, fill: "var(--color-muted-foreground)", fontFamily: "var(--font-mono)" }}
                            tickFormatter={(v) => format(new Date(v), "MMM dd")}
                        />
                        <YAxis
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            width={40}
                            allowDecimals={false}
                            tick={{ fontSize: 11, fill: "var(--color-muted-foreground)", fontFamily: "var(--font-mono)" }}
                        />
                        <ChartTooltip
                            cursor={{ stroke: "var(--color-chart-2)", strokeOpacity: 0.2, strokeWidth: 1 }}
                            content={
                                <ChartTooltipContent
                                    indicator="dot"
                                    formatter={(value) => `${Number(value).toLocaleString()} users`}
                                />
                            }
                        />
                        <Area
                            type="monotone"
                            dataKey="users"
                            stroke="var(--color-chart-2)"
                            strokeWidth={2}
                            fill="url(#usersGradient)"
                            dot={false}
                            activeDot={{ r: 5, fill: "var(--color-chart-2)", stroke: "var(--color-card)", strokeWidth: 2 }}
                        />
                    </AreaChart>
                </ChartContainer>
            </div>

            {/* Footer */}
            <div className="px-6 py-3 border-t border-border/60 bg-muted/40 flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                    <span className="size-2 rounded-full bg-chart-2" />
                    <span className="text-[11px] text-muted-foreground">Daily registrations</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <span className="text-[11px] text-muted-foreground">
                        Avg {Math.round(total / (sorted.length || 1)).toLocaleString()} / day
                    </span>
                </div>
            </div>
        </div>
    );
}