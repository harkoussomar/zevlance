"use client";

import {
    useAdminUsers,
    useSuspendUser,
    useActivateUser,
} from "../hooks/useAdminUser";
import { Card } from "@/modules/shared/components/card";
import { SmartPagination } from "@/modules/shared/components/Pagination";
import { ConfirmDialog } from "@/modules/shared/components/ConfirmDialog";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import type { UserResponse } from "../types/admin.users.types";
import { useState } from "react";
import {
    AlertCircle,
    Loader2,
    Users,
    Mail,
    Shield,
    Activity,
    ShieldOff,
    ShieldCheck,
    Eye,
    CalendarDays,
} from "lucide-react";
import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    useReactTable,
} from "@tanstack/react-table";
import { useRouter } from "next/navigation";
import { formatDate } from "@/modules/shared";

type UserTableProps = {
    page: number;
    roleFilter?: string;
    statusFilter?: string;
    search?: string;
    onPageChange: (p: number) => void;
};

const ROLE_CONFIG: Record<string, { dotClass: string; className: string }> = {
    ADMIN: {
        dotClass: "bg-role-admin",
        className:
            "bg-role-admin/10 text-role-admin border border-role-admin/25 font-medium",
    },
    CLIENT: {
        dotClass: "bg-role-client",
        className:
            "bg-role-client/10 text-role-client border border-role-client/25 font-medium",
    },
    FREELANCER: {
        dotClass: "bg-role-freelancer",
        className:
            "bg-role-freelancer/10 text-role-freelancer border border-role-freelancer/25 font-medium",
    },
};

function RoleBadge({ role }: { role: string }) {
    const cfg = ROLE_CONFIG[role] ?? {
        dotClass: "bg-muted-foreground",
        className:
            "bg-muted text-muted-foreground border border-border font-medium",
    };
    return (
        <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] tracking-wide uppercase ${cfg.className}`}
        >
            <span className={`size-1.5 rounded-full shrink-0 ${cfg.dotClass}`} />
            {role}
        </span>
    );
}

function StatusBadge({ active }: { active: boolean }) {
    return active ? (
        <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] tracking-wide uppercase font-medium bg-success/10 text-success border border-success/25">
            <span className="size-1.5 rounded-full shrink-0 bg-success animate-pulse" />
            Active
        </span>
    ) : (
        <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] tracking-wide uppercase font-medium bg-destructive/10 text-destructive border border-destructive/25">
            <span className="size-1.5 rounded-full shrink-0 bg-destructive" />
            Suspended
        </span>
    );
}

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

const ROLE_AVATAR_CLASS: Record<string, string> = {
    ADMIN: "bg-role-admin text-primary-foreground",
    CLIENT: "bg-role-client text-primary-foreground",
    FREELANCER: "bg-role-freelancer text-primary-foreground",
};

function UserAvatar({ email, role }: { email: string; role: string }) {
    const cls = ROLE_AVATAR_CLASS[role] ?? "bg-primary text-primary-foreground";
    return (
        <span
            className={`size-7 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 ${cls}`}
        >
            {email.charAt(0).toUpperCase()}
        </span>
    );
}

/** Textarea shown inside ConfirmDialog for reason input */
function ReasonTextarea({
    value,
    onChange,
    placeholder,
}: {
    value: string;
    onChange: (v: string) => void;
    placeholder: string;
}) {
    return (
        <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            rows={3}
            className="mt-3 w-full resize-none rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-shadow"
        />
    );
}

const columns: ColumnDef<UserResponse>[] = [
    {
        accessorKey: "email",
        header: () => <ColLabel icon={Mail} label="User" />,
        cell: ({ row }) => {
            const u = row.original;
            return (
                <div className="flex items-center gap-2.5 min-w-0">
                    <UserAvatar email={u.email} role={u.role} />
                    <div className="flex flex-col gap-0.5 min-w-0">
                        <span className="text-sm font-semibold text-foreground truncate max-w-50 font-display">
                            {u.name ?? u.email}
                        </span>
                        <span className="text-[10px] font-mono text-muted-foreground tracking-tight">
                            {u.email}
                        </span>
                    </div>
                </div>
            );
        },
    },
    {
        accessorKey: "role",
        header: () => <ColLabel icon={Shield} label="Role" />,
        cell: ({ row }) => <RoleBadge role={row.getValue("role") as string} />,
    },
    {
        accessorKey: "active",
        header: () => <ColLabel icon={Activity} label="Status" />,
        cell: ({ row }) => (
            <StatusBadge active={row.getValue("active") as boolean} />
        ),
    },
    {
        accessorKey: "joinedAt",
        header: () => <ColLabel icon={CalendarDays} label="Joined" />,
        cell: ({ row }) => (
            <span className="text-xs text-muted-foreground tabular-nums">
                {formatDate(row.getValue("joinedAt") as string)}
            </span>
        ),
    },
    {
        id: "actions",
        header: () => <div className="text-right pr-1" />,
        cell: () => null, // replaced via columnsWithActions closure below
    },
];

export function UserTable({
    page,
    roleFilter,
    statusFilter,
    search,
    onPageChange,
}: UserTableProps) {
    const router = useRouter();

    const { data, isLoading, isError } = useAdminUsers(
        page,
        roleFilter,
        statusFilter,
        search,
    );
    const suspendMut = useSuspendUser();
    const activateMut = useActivateUser();

    const [confirmSuspend, setConfirmSuspend] = useState<string | null>(null);
    const [confirmActivate, setConfirmActivate] = useState<string | null>(null);
    const [suspendReason, setSuspendReason] = useState("");
    const [activateReason, setActivateReason] = useState("");

    function handleSuspendClose() {
        setConfirmSuspend(null);
        setSuspendReason("");
    }
    function handleActivateClose() {
        setConfirmActivate(null);
        setActivateReason("");
    }

    const columnsWithActions: ColumnDef<UserResponse>[] = columns.map((col) => {
        if (col.id !== "actions") return col;
        return {
            ...col,
            cell: ({ row }) => {
                const u = row.original;
                if (u.role === "ADMIN") return null;

                const isBusy =
                    (suspendMut.isPending && suspendMut.variables?.id === u.id) ||
                    (activateMut.isPending && activateMut.variables?.id === u.id);

                return (
                    <div className="flex items-center justify-end gap-1">
                        <button
                            onClick={() => router.push(`/admin/users/${u.id}`)}
                            className="group h-8 px-3 rounded-lg flex items-center gap-1.5 text-[11px] font-semibold tracking-wide uppercase text-muted-foreground transition-all duration-150 hover:text-primary hover:bg-primary/10 hover:ring-1 hover:ring-primary/20 active:scale-95"
                        >
                            <Eye className="size-3.5 transition-transform duration-150 group-hover:scale-110" />
                            View
                        </button>

                        {isBusy ? (
                            <Loader2 className="size-4 animate-spin text-muted-foreground mx-2" />
                        ) : u.active ? (
                            <button
                                onClick={() => setConfirmSuspend(u.id)}
                                className="h-8 px-3 rounded-lg flex items-center gap-1.5 text-[11px] font-semibold tracking-wide uppercase text-destructive transition-all duration-150 hover:bg-destructive/10 hover:ring-1 hover:ring-destructive/20 active:scale-95"
                            >
                                <ShieldOff className="size-3.5" />
                                Suspend
                            </button>
                        ) : (
                            <button
                                onClick={() => setConfirmActivate(u.id)}
                                className="h-8 px-3 rounded-lg flex items-center gap-1.5 text-[11px] font-semibold tracking-wide uppercase text-success transition-all duration-150 hover:bg-success/10 hover:ring-1 hover:ring-success/20 active:scale-95"
                            >
                                <ShieldCheck className="size-3.5" />
                                Activate
                            </button>
                        )}
                    </div>
                );
            },
        };
    });

    const users = (data?.content as UserResponse[]) ?? [];

    const table = useReactTable({
        data: users,
        columns: columnsWithActions,
        getCoreRowModel: getCoreRowModel(),
        manualPagination: true,
    });

    if (isLoading) {
        return (
            <Card className="overflow-hidden border border-border shadow-md">
                <div className="h-64 flex flex-col items-center justify-center gap-3 text-muted-foreground">
                    <Loader2 className="size-5 animate-spin text-primary" />
                    <span className="text-sm">Loading users…</span>
                </div>
            </Card>
        );
    }

    if (isError) {
        return (
            <Card className="overflow-hidden border border-border shadow-md">
                <div className="h-64 flex flex-col items-center justify-center gap-3">
                    <div className="size-10 rounded-full bg-destructive/10 flex items-center justify-center">
                        <AlertCircle className="size-5 text-destructive" />
                    </div>
                    <div className="text-center">
                        <p className="text-sm font-semibold text-foreground">
                            Failed to load users
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
        <>
            <Card className="overflow-hidden shadow-md rounded-lg p-0 gap-0">
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
                                                      header.column.columnDef.header,
                                                      header.getContext(),
                                                  )}
                                        </TableHead>
                                    ))}
                                </TableRow>
                            ))}
                        </TableHeader>
                        <TableBody>
                            {table.getRowModel().rows.length ? (
                                table.getRowModel().rows.map((row, rowIndex) => (
                                    <TableRow
                                        key={row.id}
                                        style={{ animationDelay: `${rowIndex * 30}ms` }}
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
                                        colSpan={columnsWithActions.length}
                                        className="py-16"
                                    >
                                        <div className="flex flex-col items-center justify-center gap-3 text-muted-foreground">
                                            <div className="size-12 rounded-xl flex items-center justify-center bg-muted/60">
                                                <Users className="size-5 opacity-50" />
                                            </div>
                                            <div className="text-center">
                                                <p className="text-sm font-semibold text-foreground">
                                                    No users found
                                                </p>
                                                <p className="text-xs mt-0.5">
                                                    Try adjusting your filters
                                                </p>
                                            </div>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>

                <div className="px-6 py-3.5 border-t border-border bg-muted/40 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <span className="inline-flex items-center justify-center h-5 min-w-5 px-1.5 rounded-full text-[10px] font-bold bg-primary/15 text-primary">
                            {data.totalElements}
                        </span>
                        <span className="text-xs text-muted-foreground">
                            {data.totalElements === 1 ? "user" : "users"} total
                        </span>
                    </div>
                    <SmartPagination
                        page={page}
                        totalPages={data.totalPages}
                        onPageChange={onPageChange}
                    />
                </div>
            </Card>

            {/* Suspend dialog */}
            <ConfirmDialog
                open={!!confirmSuspend}
                onCancel={handleSuspendClose}
                onConfirm={() => {
                    if (confirmSuspend) {
                        suspendMut.mutate({
                            id: confirmSuspend,
                            reason: suspendReason.trim() || "Suspended by admin",
                        });
                    }
                    handleSuspendClose();
                }}
                title="Suspend user"
                description={
                    <>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            This user will{" "}
                            <span className="text-foreground font-medium">
                                immediately lose access
                            </span>{" "}
                            to the platform until reactivated.
                        </p>
                        <ReasonTextarea
                            value={suspendReason}
                            onChange={setSuspendReason}
                            placeholder="Reason for suspension (optional)…"
                        />
                    </>
                }
                confirmLabel="Suspend"
                variant="destructive"
            />

            {/* Activate dialog */}
            <ConfirmDialog
                open={!!confirmActivate}
                onCancel={handleActivateClose}
                onConfirm={() => {
                    if (confirmActivate) {
                        activateMut.mutate({
                            id: confirmActivate,
                            reason: activateReason.trim() || "Reactivated by admin",
                        });
                    }
                    handleActivateClose();
                }}
                title="Activate user"
                description={
                    <div>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            This will{" "}
                            <span className="text-foreground font-medium">
                                restore full access
                            </span>{" "}
                            for this user immediately.
                        </p>
                        <ReasonTextarea
                            value={activateReason}
                            onChange={setActivateReason}
                            placeholder="Reason for reactivation (optional)…"
                        />
                    </div>
                }
                confirmLabel="Activate"
                variant="default"
            />
        </>
    );
}