"use client";

import { Card } from "@/modules/shared/components/card";
import { SmartPagination } from "@/modules/shared/components/Pagination";
import { ConfirmDialog } from "@/modules/shared/components/ConfirmDialog";
import { Textarea } from "@/modules/shared/components/textarea";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/modules/shared/components/dropdown-menu";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import {
    Trash2,
    AlertCircle,
    Loader2,
    FolderOpen,
    CalendarDays,
    User,
    Tag,
    MoreHorizontal,
    Eye,
    Flag,
    Star,
    StarOff,
    ShieldAlert,
    RefreshCw,
    ArrowRight,
    BadgeCheck,
    CircleDot,
} from "lucide-react";
import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    useReactTable,
} from "@tanstack/react-table";
import {
    useAdminProjects,
    useChangeProjectStatus,
    useDeleteProject,
    useFeatureProject,
    useFlagProject,
} from "../hooks/useAdminProjects";
import type { AdminProjectFilter, ProjectSummary } from "../types/admin.projects.types";
import { PROJECT_STATUSES } from "../types/admin.projects.types";

type ProjectTableProps = {
    page: number;
    filters: AdminProjectFilter;
    onPageChange: (p: number) => void;
};

// ── Status config ─────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<
    string,
    { label: string; dotClass: string; className: string }
> = {
    OPEN: {
        label: "Open",
        dotClass: "bg-success",
        className: "bg-success/10 text-success border border-success/25 font-medium",
    },
    IN_PROGRESS: {
        label: "In Progress",
        dotClass: "bg-warning",
        className: "bg-warning/10 text-warning border border-warning/25 font-medium",
    },
    COMPLETED: {
        label: "Completed",
        dotClass: "bg-info",
        className: "bg-info/10 text-info border border-info/25 font-medium",
    },
    CANCELLED: {
        label: "Cancelled",
        dotClass: "bg-muted-foreground",
        className: "bg-muted text-muted-foreground border border-border font-medium",
    },
    SUSPENDED: {
        label: "Suspended",
        dotClass: "bg-destructive",
        className: "bg-destructive/10 text-destructive border border-destructive/25 font-medium",
    },
};

function StatusBadge({ status }: { status: string }) {
    const cfg = STATUS_CONFIG[status] ?? {
        label: status,
        dotClass: "bg-muted-foreground",
        className: "bg-muted text-muted-foreground border border-border font-medium",
    };
    return (
        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] tracking-wide uppercase ${cfg.className}`}>
            <span className={`size-1.5 rounded-full shrink-0 ${cfg.dotClass}`} />
            {cfg.label}
        </span>
    );
}

function ColLabel({ icon: Icon, label }: { icon: React.ElementType; label: string }) {
    return (
        <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold tracking-widest uppercase text-muted-foreground">
            <Icon className="size-3 opacity-70" />
            {label}
        </span>
    );
}

// ── Status change dialog state ────────────────────────────────────────────────

type StatusChangeTarget = { id: string; currentStatus: string } | null;
type DeleteTarget = { id: string; title: string } | null;
type FlagTarget = { id: string; flagged: boolean } | null;

// ── Main component ────────────────────────────────────────────────────────────

export function ProjectTable({ page, filters, onPageChange }: ProjectTableProps) {
    const router = useRouter();
    const { data, isLoading, isError } = useAdminProjects(page, filters);

    const deleteMut = useDeleteProject();
    const statusMut = useChangeProjectStatus();
    const flagMut = useFlagProject();
    const featureMut = useFeatureProject();

    // dialog states
    const [deleteTarget, setDeleteTarget] = useState<DeleteTarget>(null);
    const [deleteReason, setDeleteReason] = useState("");
    const [reasonError, setReasonError] = useState(false);

    const [statusTarget, setStatusTarget] = useState<StatusChangeTarget>(null);
    const [newStatus, setNewStatus] = useState("");
    const [statusReason, setStatusReason] = useState("");
    const [statusReasonError, setStatusReasonError] = useState(false);

    const [flagTarget, setFlagTarget] = useState<FlagTarget>(null);
    const [flagReason, setFlagReason] = useState("");
    const [flagReasonError, setFlagReasonError] = useState(false);

    // ── Handlers ──────────────────────────────────────────────────────────────

    const handleDeleteConfirm = () => {
        if (!deleteReason.trim()) { setReasonError(true); return; }
        if (deleteTarget) {
            deleteMut.mutate({ id: deleteTarget.id, reason: deleteReason.trim() });
        }
        setDeleteTarget(null);
    };

    const handleStatusConfirm = () => {
        if (!statusReason.trim()) { setStatusReasonError(true); return; }
        if (statusTarget && newStatus) {
            statusMut.mutate({ id: statusTarget.id, status: newStatus, reason: statusReason.trim() });
        }
        setStatusTarget(null);
    };

    const handleFlagConfirm = () => {
        if (!flagReason.trim()) { setFlagReasonError(true); return; }
        if (flagTarget) {
            flagMut.mutate({ id: flagTarget.id, flagged: flagTarget.flagged, reason: flagReason.trim() });
        }
        setFlagTarget(null);
    };

    // ── Columns ───────────────────────────────────────────────────────────────

    const columns = useMemo<ColumnDef<ProjectSummary>[]>(
        () => [
            {
                accessorKey: "title",
                header: () => <ColLabel icon={FolderOpen} label="Project" />,
                cell: ({ row }) => (
                    <div className="flex flex-col gap-0.5 min-w-0">
                        <div className="flex items-center gap-1.5 min-w-0">
                            <span className="font-semibold text-foreground text-sm leading-snug truncate max-w-52 font-display">
                                {row.getValue("title")}
                            </span>
                            {row.original.featured && (
                                <Star className="size-3 text-warning shrink-0 fill-warning" />
                            )}
                            {row.original.flagged && (
                                <Flag className="size-3 text-destructive shrink-0 fill-destructive" />
                            )}
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] text-muted-foreground font-mono tracking-tight">
                                #{row.original.id?.slice(0, 8) ?? "—"}
                            </span>
                            {row.original.category && (
                                <span className="text-[10px] text-muted-foreground/70 bg-muted px-1.5 rounded-sm">
                                    {row.original.category.replace("_", " ")}
                                </span>
                            )}
                        </div>
                    </div>
                ),
            },
            {
                accessorKey: "clientName",
                header: () => <ColLabel icon={User} label="Client" />,
                cell: ({ row }) => {
                    const name = row.getValue("clientName") as string | null;
                    return name ? (
                        <div className="flex items-center gap-2 min-w-0">
                            <span className="size-7 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 bg-primary text-primary-foreground">
                                {name.charAt(0).toUpperCase()}
                            </span>
                            <span className="text-sm text-foreground truncate max-w-32">{name}</span>
                        </div>
                    ) : (
                        <span className="text-muted-foreground text-sm">—</span>
                    );
                },
            },
            {
                accessorKey: "bidCount",
                header: () => <ColLabel icon={CircleDot} label="Bids" />,
                cell: ({ row }) => (
                    <span className="inline-flex items-center justify-center h-5 min-w-5 px-1.5 rounded-full text-[11px] font-bold bg-muted text-muted-foreground">
                        {row.getValue("bidCount") ?? 0}
                    </span>
                ),
            },
            {
                accessorKey: "status",
                header: () => <ColLabel icon={Tag} label="Status" />,
                cell: ({ row }) => <StatusBadge status={row.getValue("status") as string} />,
            },
            {
                accessorKey: "createdAt",
                header: () => <ColLabel icon={CalendarDays} label="Created" />,
                cell: ({ row }) => {
                    const date = row.getValue("createdAt") as string | Date;
                    return (
                        <div className="flex flex-col gap-0.5">
                            <span className="text-sm text-foreground">{format(new Date(date), "MMM dd, yyyy")}</span>
                            <span className="text-[10px] text-muted-foreground">{format(new Date(date), "HH:mm")}</span>
                        </div>
                    );
                },
            },
            {
                id: "actions",
                header: () => <div />,
                cell: ({ row }) => {
                    const project = row.original;
                    return (
                        <div className="flex justify-end">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <button className="size-8 rounded-lg flex items-center justify-center text-muted-foreground transition-all duration-150 hover:text-foreground hover:bg-muted active:scale-95">
                                        <MoreHorizontal className="size-4" />
                                    </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-48">
                                    <DropdownMenuLabel className="text-[11px] text-muted-foreground uppercase tracking-widest font-semibold">
                                        Actions
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator />

                                    {/* View detail */}
                                    <DropdownMenuItem
                                        onClick={() => router.push(`/admin/projects/${project.id}`)}
                                        className="gap-2 text-sm cursor-pointer"
                                    >
                                        <Eye className="size-3.5 text-muted-foreground" />
                                        View detail
                                        <ArrowRight className="size-3 ml-auto text-muted-foreground" />
                                    </DropdownMenuItem>

                                    <DropdownMenuSeparator />

                                    {/* Change status */}
                                    <DropdownMenuItem
                                        onClick={() => {
                                            setStatusTarget({ id: project.id, currentStatus: project.status });
                                            setNewStatus("");
                                            setStatusReason("");
                                            setStatusReasonError(false);
                                        }}
                                        className="gap-2 text-sm cursor-pointer"
                                    >
                                        <RefreshCw className="size-3.5 text-muted-foreground" />
                                        Change status
                                    </DropdownMenuItem>

                                    {/* Flag / Unflag */}
                                    <DropdownMenuItem
                                        onClick={() => {
                                            setFlagTarget({ id: project.id, flagged: !project.flagged });
                                            setFlagReason("");
                                            setFlagReasonError(false);
                                        }}
                                        className="gap-2 text-sm cursor-pointer"
                                    >
                                        {project.flagged ? (
                                            <>
                                                <BadgeCheck className="size-3.5 text-success" />
                                                Clear flag
                                            </>
                                        ) : (
                                            <>
                                                <ShieldAlert className="size-3.5 text-warning" />
                                                Flag for review
                                            </>
                                        )}
                                    </DropdownMenuItem>

                                    {/* Feature / Unfeature */}
                                    <DropdownMenuItem
                                        onClick={() =>
                                            featureMut.mutate({ id: project.id, featured: !project.featured })
                                        }
                                        disabled={featureMut.isPending}
                                        className="gap-2 text-sm cursor-pointer"
                                    >
                                        {project.featured ? (
                                            <>
                                                <StarOff className="size-3.5 text-muted-foreground" />
                                                Remove from featured
                                            </>
                                        ) : (
                                            <>
                                                <Star className="size-3.5 text-warning" />
                                                Feature project
                                            </>
                                        )}
                                    </DropdownMenuItem>

                                    <DropdownMenuSeparator />

                                    {/* Delete */}
                                    <DropdownMenuItem
                                        onClick={() => {
                                            setDeleteTarget({ id: project.id, title: project.title });
                                            setDeleteReason("");
                                            setReasonError(false);
                                        }}
                                        className="gap-2 text-sm cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10"
                                    >
                                        <Trash2 className="size-3.5" />
                                        Delete project
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    );
                },
            },
        ],
        [featureMut, router],
    );

    const projects = (data?.content as ProjectSummary[]) || [];

    const table = useReactTable({
        data: projects,
        columns,
        getCoreRowModel: getCoreRowModel(),
        manualPagination: true,
    });

    // ── Loading ───────────────────────────────────────────────────────────────

    if (isLoading) {
        return (
            <Card className="overflow-hidden border border-border shadow-md">
                <div className="h-64 flex flex-col items-center justify-center gap-3 text-muted-foreground">
                    <Loader2 className="size-5 animate-spin text-primary" />
                    <span className="text-sm">Loading projects…</span>
                </div>
            </Card>
        );
    }

    // ── Error ─────────────────────────────────────────────────────────────────

    if (isError) {
        return (
            <Card className="overflow-hidden border border-border shadow-md">
                <div className="h-64 flex flex-col items-center justify-center gap-3">
                    <div className="size-10 rounded-full bg-destructive/10 flex items-center justify-center">
                        <AlertCircle className="size-5 text-destructive" />
                    </div>
                    <div className="text-center">
                        <p className="text-sm font-semibold text-foreground">Failed to load projects</p>
                        <p className="text-xs text-muted-foreground mt-0.5">Please refresh or try again.</p>
                    </div>
                </div>
            </Card>
        );
    }

    if (!data) return null;

    // ── Render ────────────────────────────────────────────────────────────────

    return (
        <>
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
                                                : flexRender(header.column.columnDef.header, header.getContext())}
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
                                        data-state={row.getIsSelected() && "selected"}
                                        style={{ animationDelay: `${rowIndex * 30}ms` }}
                                        className="group border-b border-border/60 last:border-0 transition-colors duration-100 hover:bg-primary/4 data-[state=selected]:bg-primary/6"
                                    >
                                        {row.getVisibleCells().map((cell, i) => (
                                            <TableCell
                                                key={cell.id}
                                                className={`py-3.5 px-4 align-middle ${i === 0 ? "pl-6" : ""} ${i === row.getVisibleCells().length - 1 ? "pr-6" : ""}`}
                                            >
                                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow className="hover:bg-transparent">
                                    <TableCell colSpan={columns.length} className="py-16">
                                        <div className="flex flex-col items-center justify-center gap-3 text-muted-foreground">
                                            <div className="size-12 rounded-xl flex items-center justify-center bg-muted/60">
                                                <FolderOpen className="size-5 opacity-50" />
                                            </div>
                                            <div className="text-center">
                                                <p className="text-sm font-semibold text-foreground">No projects found</p>
                                                <p className="text-xs mt-0.5">Try adjusting your filters</p>
                                            </div>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Footer */}
                <div className="px-6 py-3.5 border-t border-border bg-muted/40 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <span className="inline-flex items-center justify-center h-5 min-w-5 px-1.5 rounded-full text-[10px] font-bold bg-primary/15 text-primary">
                            {data.totalElements}
                        </span>
                        <span className="text-xs text-muted-foreground">
                            {data.totalElements === 1 ? "project" : "projects"} total
                        </span>
                    </div>
                    <SmartPagination page={page} totalPages={data.totalPages} onPageChange={onPageChange} />
                </div>
            </Card>

            {/* ── Delete dialog ──────────────────────────────────────────────── */}
            <ConfirmDialog
                open={!!deleteTarget}
                onCancel={() => setDeleteTarget(null)}
                onConfirm={handleDeleteConfirm}
                title="Force Delete Project"
                description={
                    <>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            This will{" "}
                            <span className="text-foreground font-medium">soft-delete</span>{" "}
                            <span className="text-foreground font-semibold">&ldquo;{deleteTarget?.title}&rdquo;</span>{" "}
                            and write an audit log entry. A reason is required.
                        </p>
                        <div className="mt-4 space-y-1.5">
                            <label className="text-xs font-semibold text-foreground tracking-wide uppercase">
                                Deletion reason <span className="text-destructive">*</span>
                            </label>
                            <Textarea
                                placeholder="Describe the compliance reason for this deletion…"
                                value={deleteReason}
                                rows={3}
                                className={`resize-none text-sm transition-shadow duration-150 ${reasonError ? "border-destructive ring-1 ring-destructive/30" : ""}`}
                                onChange={(e) => {
                                    setDeleteReason(e.target.value);
                                    if (e.target.value.trim()) setReasonError(false);
                                }}
                            />
                            {reasonError && (
                                <p className="flex items-center gap-1.5 text-xs text-destructive animate-in slide-in-from-top-1 duration-150">
                                    <AlertCircle className="size-3 shrink-0" /> A reason is required before deleting.
                                </p>
                            )}
                        </div>
                    </>
                }
                confirmLabel="Delete Project"
                variant="destructive"
            />

            {/* ── Status change dialog ───────────────────────────────────────── */}
            <ConfirmDialog
                open={!!statusTarget}
                onCancel={() => setStatusTarget(null)}
                onConfirm={handleStatusConfirm}
                title="Change Project Status"
                description={
                    <div className="space-y-4">
                        <p className="text-sm text-muted-foreground">
                            Current status:{" "}
                            {statusTarget && <StatusBadge status={statusTarget.currentStatus} />}
                        </p>
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-foreground tracking-wide uppercase">
                                New status <span className="text-destructive">*</span>
                            </label>
                            <select
                                value={newStatus}
                                onChange={(e) => setNewStatus(e.target.value)}
                                className="w-full h-9 rounded-md border border-input bg-transparent px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                            >
                                <option value="" disabled>Select new status…</option>
                                {PROJECT_STATUSES.filter(
                                    (s) => s !== statusTarget?.currentStatus
                                ).map((s) => (
                                    <option key={s} value={s}>
                                        {STATUS_CONFIG[s]?.label ?? s}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-foreground tracking-wide uppercase">
                                Reason <span className="text-destructive">*</span>
                            </label>
                            <Textarea
                                placeholder="Reason for this status change…"
                                value={statusReason}
                                rows={3}
                                className={`resize-none text-sm ${statusReasonError ? "border-destructive ring-1 ring-destructive/30" : ""}`}
                                onChange={(e) => {
                                    setStatusReason(e.target.value);
                                    if (e.target.value.trim()) setStatusReasonError(false);
                                }}
                            />
                            {statusReasonError && (
                                <p className="flex items-center gap-1.5 text-xs text-destructive">
                                    <AlertCircle className="size-3 shrink-0" /> A reason is required.
                                </p>
                            )}
                        </div>
                    </div>
                }
                confirmLabel="Confirm Change"
                variant="default"
            />

            {/* ── Flag dialog ────────────────────────────────────────────────── */}
            <ConfirmDialog
                open={!!flagTarget}
                onCancel={() => setFlagTarget(null)}
                onConfirm={handleFlagConfirm}
                title={flagTarget?.flagged ? "Flag Project for Review" : "Clear Project Flag"}
                description={
                    <div className="space-y-4">
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            {flagTarget?.flagged
                                ? "This project will be marked as suspicious and require further review before it appears in search results."
                                : "The flag will be cleared and the project will resume normal visibility."}
                        </p>
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-foreground tracking-wide uppercase">
                                Reason <span className="text-destructive">*</span>
                            </label>
                            <Textarea
                                placeholder={
                                    flagTarget?.flagged
                                        ? "Describe why this project is being flagged…"
                                        : "Describe why the flag is being cleared…"
                                }
                                value={flagReason}
                                rows={3}
                                className={`resize-none text-sm ${flagReasonError ? "border-destructive ring-1 ring-destructive/30" : ""}`}
                                onChange={(e) => {
                                    setFlagReason(e.target.value);
                                    if (e.target.value.trim()) setFlagReasonError(false);
                                }}
                            />
                            {flagReasonError && (
                                <p className="flex items-center gap-1.5 text-xs text-destructive">
                                    <AlertCircle className="size-3 shrink-0" /> A reason is required.
                                </p>
                            )}
                        </div>
                    </div>
                }
                confirmLabel={flagTarget?.flagged ? "Flag Project" : "Clear Flag"}
                variant={flagTarget?.flagged ? "destructive" : "default"}
            />
        </>
    );
}