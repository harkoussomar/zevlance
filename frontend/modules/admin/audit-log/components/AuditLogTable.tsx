"use client";

import { useAdminAuditLog } from "../hooks/useAdminAuditLog";
import { Card } from "@/modules/shared/components/card";
import { SmartPagination } from "@/modules/shared/components/Pagination";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { useMemo } from "react";
import { format } from "date-fns";
import {
    AlertCircle,
    Loader2,
    Clock,
    User,
    Zap,
    Target,
    FileText,
    ScrollText,
} from "lucide-react";
import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    useReactTable,
} from "@tanstack/react-table";
import { AdminAuditLog } from "../types/admin.audit.log.types";

/* ─── Action badge ───────────────────────────────────────────────────────── */
const ACTION_CONFIG: Record<string, { dotClass: string; className: string }> = {
    DELETE: {
        dotClass: "bg-destructive",
        className:
            "bg-destructive/10 text-destructive border border-destructive/25 font-medium",
    },
    SUSPEND: {
        dotClass: "bg-warning",
        className:
            "bg-warning/10 text-warning border border-warning/25 font-medium",
    },
    ACTIVATE: {
        dotClass: "bg-success",
        className:
            "bg-success/10 text-success border border-success/25 font-medium",
    },
    DEFAULT: {
        dotClass: "bg-muted-foreground",
        className:
            "bg-muted text-muted-foreground border border-border font-medium",
    },
};

function ActionBadge({ action }: { action: string }) {
    const key =
        ["DELETE", "SUSPEND", "ACTIVATE"].find((k) => action.includes(k)) ??
        "DEFAULT";
    const cfg = ACTION_CONFIG[key];
    return (
        <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] tracking-wide uppercase ${cfg.className}`}
        >
            <span
                className={`size-1.5 rounded-full shrink-0 ${cfg.dotClass}`}
            />
            {action}
        </span>
    );
}

/* ─── Column header label ────────────────────────────────────────────────── */
function ColLabel({
    icon: Icon,
    label,
}: {
    icon: React.ElementType;
    label: string;
}) {
    return (
        <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold tracking-widest uppercase text-muted-foreground">
            <Icon className="size-3 opacity-70" />
            {label}
        </span>
    );
}

/* ─── Main component ─────────────────────────────────────────────────────── */
export function AuditLogTable({
    page,
    onPageChange,
}: {
    page: number;
    onPageChange: (p: number) => void;
}) {
    const { data, isLoading, isError } = useAdminAuditLog(page);

    const columns = useMemo<ColumnDef<AdminAuditLog>[]>(
        () => [
            {
                accessorKey: "createdAt",
                header: () => <ColLabel icon={Clock} label="Timestamp" />,
                cell: ({ row }) => {
                    const date = new Date(row.getValue("createdAt") as string);
                    return (
                        <div className="flex flex-col gap-0.5">
                            <span className="text-sm text-foreground font-mono">
                                {format(date, "yyyy-MM-dd")}
                            </span>
                            <span className="text-[10px] text-muted-foreground font-mono">
                                {format(date, "HH:mm:ss")}
                            </span>
                        </div>
                    );
                },
            },
            {
                accessorKey: "adminId",
                header: () => <ColLabel icon={User} label="Actor" />,
                cell: ({ row }) => {
                    const id = row.getValue("adminId") as string;
                    return (
                        <div className="flex flex-col gap-0.5 min-w-0">
                            {/* FIX: max-w-[140px] → max-w-35 */}
                            <span
                                className="text-[10px] font-mono text-muted-foreground truncate max-w-35"
                                title={id}
                            >
                                #{id.slice(0, 8)}
                            </span>
                        </div>
                    );
                },
            },
            {
                accessorKey: "action",
                header: () => <ColLabel icon={Zap} label="Action" />,
                cell: ({ row }) => (
                    <ActionBadge action={row.getValue("action") as string} />
                ),
            },
            {
                id: "target",
                header: () => <ColLabel icon={Target} label="Target" />,
                cell: ({ row }) => {
                    const log = row.original;
                    return (
                        <div className="flex flex-col gap-0.5 min-w-0">
                            <span className="text-[11px] font-semibold text-foreground uppercase tracking-wide">
                                {log.targetEntityType}
                            </span>
                            {/* FIX: max-w-[140px] → max-w-35 */}
                            <span
                                className="text-[10px] font-mono text-muted-foreground truncate max-w-35"
                                title={log.targetEntityId}
                            >
                                #{log.targetEntityId.slice(0, 8)}
                            </span>
                        </div>
                    );
                },
            },
            {
                accessorKey: "reason",
                header: () => <ColLabel icon={FileText} label="Reason" />,
                cell: ({ row }) => {
                    const reason = row.getValue("reason") as string | null;
                    return reason ? (
                        /* FIX: max-w-[200px] → max-w-50 */
                        <span
                            className="text-xs text-muted-foreground truncate max-w-50 block"
                            title={reason}
                        >
                            {reason}
                        </span>
                    ) : (
                        <span className="text-xs text-muted-foreground/50 italic">
                            —
                        </span>
                    );
                },
            },
        ],
        [],
    );

    const logs = (data?.content as AdminAuditLog[]) ?? [];

    const table = useReactTable({
        data: logs,
        columns,
        getCoreRowModel: getCoreRowModel(),
        manualPagination: true,
    });

    /* ── Loading ─────────────────────────────────────────────────────────────── */
    if (isLoading) {
        return (
            <Card className="overflow-hidden border border-border shadow-md">
                <div className="h-64 flex flex-col items-center justify-center gap-3 text-muted-foreground">
                    <Loader2 className="size-5 animate-spin text-primary" />
                    <span className="text-sm">Loading audit log…</span>
                </div>
            </Card>
        );
    }

    /* ── Error ───────────────────────────────────────────────────────────────── */
    if (isError) {
        return (
            <Card className="overflow-hidden border border-border shadow-md">
                <div className="h-64 flex flex-col items-center justify-center gap-3">
                    <div className="size-10 rounded-full bg-destructive/10 flex items-center justify-center">
                        <AlertCircle className="size-5 text-destructive" />
                    </div>
                    <div className="text-center">
                        <p className="text-sm font-semibold text-foreground">
                            Failed to load audit log
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            Please refresh or try again.
                        </p>
                    </div>
                </div>
            </Card>
        );
    }

    if (!data) return null;

    return (
        <Card className="overflow-hidden rounded-lg p-0">
            <div className="overflow-x-auto">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow
                                key={headerGroup.id}
                                className="border-b border-border bg-muted/60 hover:bg-transparent"
                            >
                                {headerGroup.headers.map((header, i) => (
                                    <TableHead
                                        key={header.id}
                                        className={`h-11 px-4 ${i === 0 ? "pl-6" : ""} ${i === headerGroup.headers.length - 1 ? "pr-6" : ""}`}
                                    >
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(
                                                  header.column.columnDef
                                                      .header,
                                                  header.getContext(),
                                              )}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>

                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row, rowIndex) => (
                                <TableRow
                                    key={row.id}
                                    style={{
                                        animationDelay: `${rowIndex * 30}ms`,
                                    }}
                                    className="group border-b border-border/60 last:border-0 transition-colors duration-100 hover:bg-primary/4"
                                >
                                    {row.getVisibleCells().map((cell, i) => (
                                        <TableCell
                                            key={cell.id}
                                            className={`py-3.5 px-4 align-middle ${i === 0 ? "pl-6" : ""} ${i === row.getVisibleCells().length - 1 ? "pr-6" : ""}`}
                                        >
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext(),
                                            )}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow className="hover:bg-transparent">
                                <TableCell
                                    colSpan={columns.length}
                                    className="py-16"
                                >
                                    <div className="flex flex-col items-center justify-center gap-3 text-muted-foreground">
                                        <div className="size-12 rounded-xl flex items-center justify-center bg-muted/60">
                                            <ScrollText className="size-5 opacity-50" />
                                        </div>
                                        <div className="text-center">
                                            <p className="text-sm font-semibold text-foreground">
                                                No audit events found
                                            </p>
                                            <p className="text-xs mt-0.5">
                                                Admin actions will appear here
                                            </p>
                                        </div>
                                    </div>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* ── Footer ──────────────────────────────────────────────────────────── */}
            <div className="px-6 py-3.5 border-t border-border bg-muted/40 flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                    <span className="inline-flex items-center justify-center h-5 min-w-5 px-1.5 rounded-full text-[10px] font-bold bg-primary/15 text-primary">
                        {data.totalElements}
                    </span>
                    <span className="text-xs text-muted-foreground">
                        {data.totalElements === 1 ? "record" : "records"} total
                    </span>
                </div>
                <SmartPagination
                    page={page}
                    totalPages={data.totalPages}
                    onPageChange={onPageChange}
                />
            </div>
        </Card>
    );
}
