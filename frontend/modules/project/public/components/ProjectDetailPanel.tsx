"use client";

import {
    AlertCircle, Briefcase, Building2, CheckCircle2, Clock, Loader2, RotateCcw, ArrowUpRight
} from "lucide-react";

import { cn, daysUntil, formatBudget, formatCurrency, formatDate } from "@/modules/shared";
import { BidStatusBadge, CategoryBadge, ProjectStatusBadge } from "@/modules/shared/components/status-badge";
import { selectIsAuthenticated, selectRole, useAuthStore } from "@/store/auth-store";
import { useProject } from "../hooks/useProject";
import { SmartAvatar } from "@/modules/shared/components/avatar";
import { Button } from "@/modules/shared/components/button";
import type { ProjectResponse } from "../../shared/types/project.shared";
import { useMyBid, useWithdrawBid } from "@/modules/bid/freelancer";
import { BidForm } from "@/modules/bid/freelancer/components/BidForm";

interface ProjectDetailPanelProps { projectId: string; }

// ─── Utility Components ───────────────────────────────────────────────────────

function LoadingState() {
    return (
        <div className="flex flex-col items-center justify-center h-full py-32 animate-in fade-in duration-500">
            <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
            <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Synthesizing data...</span>
        </div>
    );
}

function SelectPrompt() {
    return (
        <div className="flex flex-col items-center justify-center h-full py-32 text-center px-8 animate-in fade-in duration-700">
            <div className="w-16 h-16 border border-border/50 flex items-center justify-center mb-6 bg-background/50 rotate-45">
                <ArrowUpRight className="w-6 h-6 text-muted-foreground/40 -rotate-45" />
            </div>
            <h2 className="font-display text-2xl font-bold text-foreground mb-2">No Active Target</h2>
            <p className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground/60 max-w-[250px]">
                Initiate selection from the index to display comprehensive details.
            </p>
        </div>
    );
}

function FetchError({ onRetry }: { onRetry: () => void }) {
    return (
        <div className="flex flex-col items-center justify-center h-full gap-4 py-32 text-center px-8 animate-in fade-in">
            <AlertCircle className="w-8 h-8 text-destructive/70" />
            <div className="space-y-1">
                <p className="font-display text-lg font-bold text-foreground">Transmission Failed</p>
                <p className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">Unable to establish connection.</p>
            </div>
            <Button variant="outline" size="sm" onClick={onRetry} className="rounded-none mt-4 font-mono text-[11px] uppercase tracking-widest">
                <RotateCcw className="w-3.5 h-3.5 mr-2" /> Retry Connection
            </Button>
        </div>
    );
}

function StatBlock({ value, label, urgent }: { value: React.ReactNode; label: string; urgent?: boolean; }) {
    return (
        <div className="flex flex-col gap-1 border-l-2 border-border/40 pl-4 py-1">
            <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground/70">
                {label}
            </span>
            <span className={cn("font-display text-2xl sm:text-3xl font-bold tracking-tight", urgent ? "text-warning" : "text-foreground")}>
                {value}
            </span>
        </div>
    );
}

// ─── Sub-sections ─────────────────────────────────────────────────────────────

function ProjectHero({ project, daysLeft, closingSoon }: { project: ProjectResponse; daysLeft: number; closingSoon: boolean; }) {
    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-backwards" style={{ animationDelay: '100ms' }}>
            <div className="flex items-center gap-3 flex-wrap">
                <CategoryBadge category={project.category} />
                <ProjectStatusBadge status={project.status} />
                {closingSoon && (
                    <span className="inline-flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 bg-warning/10 text-warning border border-warning/30 animate-pulse">
                        <AlertCircle className="w-3 h-3" /> Closing Soon
                    </span>
                )}
            </div>

            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-[1.05] tracking-tight text-balance">
                {project.title}
            </h1>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-6 md:gap-12 py-8 border-y border-border/30">
                <StatBlock value={formatBudget(project.budgetMin, project.budgetMax)} label="Allocation" />
                <StatBlock value={project.bidCount} label="Proposals Received" />
                <StatBlock value={daysLeft > 0 ? `${daysLeft} days` : "Expired"} label={`Deadline: ${formatDate(project.deadline)}`} urgent={daysLeft <= 7 && daysLeft > 0} />
            </div>

            <div className="grid md:grid-cols-[1fr_250px] gap-12">
                <div className="space-y-4">
                    <h3 className="font-mono text-[12px] uppercase tracking-widest text-primary font-semibold flex items-center gap-2">
                        <span className="w-2 h-px bg-primary inline-block" /> Scope & Parameters
                    </h3>
                    <p className="text-[15px] text-foreground/80 leading-relaxed whitespace-pre-line font-sans">
                        {project.description}
                    </p>
                </div>

                {project.requiredSkills?.length > 0 && (
                    <div className="space-y-4">
                        <h3 className="font-mono text-[12px] uppercase tracking-widest text-muted-foreground font-semibold flex items-center gap-2">
                            <span className="w-2 h-px bg-muted-foreground inline-block" /> Requisites
                        </h3>
                        <div className="flex flex-col gap-2">
                            {project.requiredSkills.map((skill) => (
                                <span key={skill} className="font-mono text-[11px] uppercase tracking-widest text-foreground py-1.5 px-3 bg-muted/20 border border-border/50 text-center">
                                    {skill}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

function SidebarCard({ title, children }: { title: string, children: React.ReactNode }) {
    return (
        <div className="border border-border/60 bg-background/40 p-5 space-y-4 shadow-sm">
            <h4 className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground/60 border-b border-border/40 pb-2">
                {title}
            </h4>
            {children}
        </div>
    );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function ProjectDetailPanel({ projectId }: ProjectDetailPanelProps) {
    const role = useAuthStore(selectRole);
    const isAuthenticated = useAuthStore(selectIsAuthenticated);
    const isFreelancer = isAuthenticated && role === "FREELANCER";

    const { data: project, isLoading, error, refetch } = useProject(projectId);
    const { data: myBid, isLoading: isBidLoading } = useMyBid(projectId, true);
    const withdrawBid = useWithdrawBid();

    if (!projectId) return <SelectPrompt />;
    if (isLoading) return <LoadingState />;
    if (error || !project) return <FetchError onRetry={() => refetch()} />;

    const daysLeft = daysUntil(project.deadline);
    const isOpen = project.status === "OPEN";
    const closingSoon = isOpen && daysLeft > 0 && daysLeft <= 7;

    return (
        <div className="h-full overflow-y-auto scrollbar-none pb-24">
            {/* Background design element */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-3xl -z-10 rounded-full" />

            <div className="space-y-12">
                <ProjectHero project={project} daysLeft={daysLeft} closingSoon={closingSoon} />

                <div className="grid lg:grid-cols-[1fr_300px] gap-8 items-start animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-backwards" style={{ animationDelay: '250ms' }}>
                    
                    {/* Primary Action Area (Freelancer Bidding) */}
                    <div className="space-y-6">
                        {isFreelancer && (
                            <div className="bg-card/30 border border-border/60 p-6 sm:p-8 relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
                                <h3 className="font-display text-2xl font-bold text-foreground mb-6">Proposal Submission</h3>
                                
                                {isBidLoading ? (
                                    <div className="flex items-center gap-3 text-muted-foreground py-4">
                                        <Loader2 className="w-4 h-4 animate-spin" /> <span className="font-mono text-xs uppercase">Validating status...</span>
                                    </div>
                                ) : myBid ? (
                                    <div className="space-y-6">
                                        <div className="bg-muted/10 border border-border/40 p-4 flex items-center justify-between">
                                            <div>
                                                <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Active Bid</p>
                                                <p className="font-display text-2xl font-bold text-primary">{formatCurrency(myBid.proposedPrice)}</p>
                                                <p className="font-mono text-[11px] text-muted-foreground mt-1">Est. {myBid.estimatedDays} days completion</p>
                                            </div>
                                            <BidStatusBadge status={myBid.status} />
                                        </div>

                                        {myBid.status === "PENDING" && (
                                            <Button 
                                                variant="outline" 
                                                onClick={() => withdrawBid.mutate(myBid.id)} 
                                                loading={withdrawBid.isPending}
                                                className="w-full sm:w-auto rounded-none font-mono text-xs uppercase tracking-widest text-destructive border-destructive/30 hover:bg-destructive hover:text-destructive-foreground transition-colors"
                                            >
                                                Retract Proposal
                                            </Button>
                                        )}
                                    </div>
                                ) : isOpen ? (
                                    <BidForm projectId={projectId} onSuccess={() => {}} />
                                ) : (
                                    <div className="bg-muted/20 border border-border/40 p-5 text-center">
                                        <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Submission Window Closed</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Metadata Sidebar */}
                    <aside className="space-y-6">
                        <SidebarCard title="Originator">
                            <div className="flex items-center gap-4">
                                <SmartAvatar name={project.clientName} size="md" className="rounded-none border border-border/50" />
                                <div>
                                    <p className="font-display text-lg font-bold text-foreground leading-tight">{project.clientName}</p>
                                    {project.clientCompany && (
                                        <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground/80 mt-1 flex items-center gap-1.5">
                                            <Building2 className="w-3 h-3" /> {project.clientCompany}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </SidebarCard>

                        <SidebarCard title="Classification Data">
                            <div className="space-y-4">
                                {[
                                    { icon: <Briefcase />, label: "Domain", value: project.category?.replace(/_/g, " ") },
                                    { icon: <Clock />, label: "Timeline", value: formatDate(project.deadline) },
                                    { icon: <CheckCircle2 />, label: "Phase", value: project.status },
                                ].map((row, i) => (
                                    <div key={i} className="flex flex-col gap-1">
                                        <div className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-muted-foreground/60">
                                            <span className="[&>svg]:w-3 [&>svg]:h-3">{row.icon}</span>
                                            {row.label}
                                        </div>
                                        <div className="font-mono text-sm text-foreground font-medium">
                                            {row.value}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </SidebarCard>
                    </aside>
                </div>
            </div>
        </div>
    );
}