"use client";

import {
    Area,
    AreaChart,
    CartesianGrid,
    XAxis,
    YAxis,
    ReferenceLine,
} from "recharts";
import { format } from "date-fns";
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart";
import { z } from "zod";
import { TrendingUp, DollarSign } from "lucide-react";
import { RevenueDataPointSchema } from "../types/admin.overview.types";

type RevenueDataPoint = z.infer<typeof RevenueDataPointSchema>;

const chartConfig = {
    amount: {
        label: "Revenue",
        color: "var(--color-chart-1)",
    },
} satisfies ChartConfig;

export function RevenueChart({ data }: { data: RevenueDataPoint[] }) {
    if (!data || data.length === 0) {
        return (
            <div className=" flex flex-col items-center justify-center gap-3 border border-border rounded-xl bg-card text-muted-foreground">
                <DollarSign className="size-8 opacity-20" />
                <p className="text-sm">No revenue data available</p>
            </div>
        );
    }

    const sortedData = [...data].sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    );

    const total = sortedData.reduce((sum, d) => sum + d.amount, 0);
    const avg = total / sortedData.length;

    const lastTwo = sortedData.slice(-2);
    const trend =
        lastTwo.length === 2
            ? ((lastTwo[1].amount - lastTwo[0].amount) /
                  (lastTwo[0].amount || 1)) *
              100
            : 0;

    return (
        <div className="border border-border rounded-xl bg-card shadow-md overflow-hidden">
            {/* ── Header ──────────────────────────────────────────────────────────── */}
            <div className="px-6 pt-5 pb-4 flex items-start justify-between gap-4 border-b border-border/60">
                <div className="flex items-center gap-3">
                    <div className="size-9 rounded-lg bg-chart-1/10 flex items-center justify-center shrink-0">
                        <DollarSign className="size-4 text-chart-1" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-foreground font-display leading-tight">
                            Revenue Over Time
                        </h3>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            Sum of milestone payouts · Last 30 days
                        </p>
                    </div>
                </div>

                <div className="text-right shrink-0">
                    <p className="text-xl font-bold text-foreground font-display tabular-nums">
                        $
                        {total.toLocaleString("en-US", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                        })}
                    </p>
                    <div
                        className={`inline-flex items-center gap-1 text-[11px] font-semibold mt-0.5 ${
                            trend >= 0 ? "text-success" : "text-destructive"
                        }`}
                    >
                        <TrendingUp
                            className={`size-3 ${trend < 0 ? "rotate-180" : ""}`}
                        />
                        {trend >= 0 ? "+" : ""}
                        {trend.toFixed(1)}% vs prev day
                    </div>
                </div>
            </div>

            {/* ── Chart ───────────────────────────────────────────────────────────── */}
            <div className="px-2 pt-4 pb-2">
                <ChartContainer
                    config={chartConfig}
                    className="h-[220px] w-full"
                >
                    <AreaChart
                        accessibilityLayer
                        data={sortedData}
                        margin={{ left: 0, right: 16, top: 8, bottom: 0 }}
                    >
                        <defs>
                            <linearGradient
                                id="revenueGradient"
                                x1="0"
                                y1="0"
                                x2="0"
                                y2="1"
                            >
                                <stop
                                    offset="0%"
                                    stopColor="var(--color-chart-1)"
                                    stopOpacity={0.25}
                                />
                                <stop
                                    offset="60%"
                                    stopColor="var(--color-chart-1)"
                                    stopOpacity={0.08}
                                />
                                <stop
                                    offset="100%"
                                    stopColor="var(--color-chart-1)"
                                    stopOpacity={0}
                                />
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
                            tick={{
                                fontSize: 11,
                                fill: "var(--color-muted-foreground)",
                                fontFamily: "var(--font-mono)",
                            }}
                            tickFormatter={(value) =>
                                format(new Date(value), "MMM dd")
                            }
                        />

                        <YAxis
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            width={58}
                            tick={{
                                fontSize: 11,
                                fill: "var(--color-muted-foreground)",
                                fontFamily: "var(--font-mono)",
                            }}
                            tickFormatter={(value) =>
                                `$${value >= 1000 ? `${(value / 1000).toFixed(1)}k` : value}`
                            }
                        />

                        <ReferenceLine
                            y={avg}
                            stroke="var(--color-chart-1)"
                            strokeOpacity={0.3}
                            strokeDasharray="6 3"
                            strokeWidth={1}
                        />

                        <ChartTooltip
                            cursor={{
                                stroke: "var(--color-chart-1)",
                                strokeOpacity: 0.2,
                                strokeWidth: 1,
                            }}
                            content={
                                <ChartTooltipContent
                                    indicator="dot"
                                    formatter={(value) =>
                                        `$${Number(value).toLocaleString(
                                            "en-US",
                                            {
                                                minimumFractionDigits: 2,
                                                maximumFractionDigits: 2,
                                            },
                                        )}`
                                    }
                                />
                            }
                        />

                        <Area
                            type="monotone"
                            dataKey="amount"
                            stroke="var(--color-chart-1)"
                            strokeWidth={2}
                            fill="url(#revenueGradient)"
                            dot={false}
                            activeDot={{
                                r: 5,
                                fill: "var(--color-chart-1)",
                                stroke: "var(--color-card)",
                                strokeWidth: 2,
                            }}
                        />
                    </AreaChart>
                </ChartContainer>
            </div>

            {/* ── Footer ──────────────────────────────────────────────────────────── */}
            <div className="px-6 py-3 border-t border-border/60 bg-muted/40 flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                    <span className="size-2 rounded-full bg-chart-1" />
                    <span className="text-[11px] text-muted-foreground">
                        Daily revenue
                    </span>
                </div>
                <div className="flex items-center gap-1.5">
                    <span className="w-4 border-t border-dashed border-chart-1/50" />
                    <span className="text-[11px] text-muted-foreground">
                        Avg $
                        {avg.toLocaleString("en-US", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                        })}
                    </span>
                </div>
            </div>
        </div>
    );
}
