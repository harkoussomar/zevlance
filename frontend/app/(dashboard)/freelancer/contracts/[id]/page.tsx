"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
    ArrowLeft,
    CheckCircle2,
    Clock,
    AlertTriangle,
    XCircle,
    Plus,
    Link as LinkIcon,
    ThumbsUp,
    RotateCcw,
    Upload,
    Star,
    DollarSign,
    Calendar,
    Users,
    Layers,
} from "lucide-react";
import { MOCK_CONTRACTS, MOCK_MILESTONES, MOCK_REVIEWS } from "@/lib/mock-data";
import {
    formatCurrency,
    formatDate,
    percentage,
    cn,
} from "@/lib/utils";
import {
    Button,
    Input,
    Textarea,
    FormField,
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    Avatar,
    Progress,
    Alert,
    Dialog,
    StarRating,
    Separator,
} from "@/components/ui";
import {
    ContractStatusBadge,
    MilestoneStatusBadge,
} from "@/components/shared/status-badge";
import { useIsFreelancer, useIsClient } from "@/store/auth-store";
import type { MilestoneResponse, MilestoneStatus } from "@/types";

// ─── Milestone Card ───────────────────────────────────────────────────────────

function MilestoneCard({
    milestone,
    index,
    isFreelancer,
    isClient,
    onSubmit,
    onApprove,
    onRevision,
}: {
    milestone: MilestoneResponse;
    index: number;
    isFreelancer: boolean;
    isClient: boolean;
    onSubmit: (id: string, url: string) => void;
    onApprove: (id: string) => void;
    onRevision: (id: string) => void;
}) {
    const [url, setUrl] = useState(milestone.deliverableUrl ?? "");
    const [urlError, setUrlError] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (!url.trim()) {
            setUrlError("Enter a deliverable URL");
            return;
        }
        setLoading(true);
        await new Promise((r) => setTimeout(r, 600));
        setLoading(false);
        onSubmit(milestone.id, url);
        setSubmitting(false);
    };

    const statusIcon: Record<MilestoneStatus, React.ReactNode> = {
        PENDING: <Clock className="w-4 h-4 text-muted-foreground" />,
        SUBMITTED: <Upload className="w-4 h-4 text-blue-500" />,
        APPROVED: <CheckCircle2 className="w-4 h-4 text-emerald-500" />,
        REVISION_REQUESTED: <RotateCcw className="w-4 h-4 text-orange-500" />,
    };

    return (
        <div
            className={cn(
                "rounded-xl border p-5 transition-all duration-200",
                milestone.status === "APPROVED"
                    ? "border-emerald-500/25 bg-emerald-500/2"
                    : milestone.status === "SUBMITTED"
                      ? "border-blue-500/25 bg-blue-500/2"
                      : milestone.status === "REVISION_REQUESTED"
                        ? "border-orange-500/25 bg-orange-500/2"
                        : "border-border bg-card",
            )}
        >
            <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 min-w-0">
                    {/* Step number */}
                    <div
                        className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 border-2",
                            milestone.status === "APPROVED"
                                ? "border-emerald-500 bg-emerald-500 text-white"
                                : "border-border bg-muted text-muted-foreground",
                        )}
                    >
                        {milestone.status === "APPROVED" ? (
                            <CheckCircle2 className="w-4 h-4" />
                        ) : (
                            index + 1
                        )}
                    </div>
                    <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                            <p className="font-bold text-foreground text-sm">
                                {milestone.title}
                            </p>
                            <MilestoneStatusBadge status={milestone.status} />
                        </div>
                        {milestone.description && (
                            <p className="text-xs text-muted-foreground leading-relaxed mb-2">
                                {milestone.description}
                            </p>
                        )}
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                                <DollarSign className="w-3 h-3" />
                                <span className="font-semibold text-foreground">
                                    {formatCurrency(milestone.amount)}
                                </span>
                            </span>
                            <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                Due {formatDate(milestone.dueDate)}
                            </span>
                        </div>
                    </div>
                </div>
                <div className="shrink-0">{statusIcon[milestone.status]}</div>
            </div>

            {/* Deliverable link */}
            {milestone.deliverableUrl && (
                <div className="mt-3 pt-3 border-t border-border">
                    <a
                        href={milestone.deliverableUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-xs text-primary hover:underline"
                    >
                        <LinkIcon className="w-3 h-3" />
                        {milestone.deliverableUrl}
                    </a>
                </div>
            )}

            {/* Freelancer: submit deliverable */}
            {isFreelancer &&
                (milestone.status === "PENDING" ||
                    milestone.status === "REVISION_REQUESTED") && (
                    <div className="mt-4 pt-4 border-t border-border">
                        {!submitting ? (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSubmitting(true)}
                                className="w-full"
                            >
                                <Upload className="w-3.5 h-3.5" />
                                Submit Deliverable
                            </Button>
                        ) : (
                            <div className="space-y-2">
                                <Input
                                    placeholder="https://github.com/you/project/tree/milestone-1"
                                    value={url}
                                    onChange={(e) => {
                                        setUrl(e.target.value);
                                        setUrlError("");
                                    }}
                                    startIcon={
                                        <LinkIcon className="w-3.5 h-3.5" />
                                    }
                                    error={urlError}
                                />
                                <div className="flex gap-2">
                                    <Button
                                        size="sm"
                                        loading={loading}
                                        onClick={handleSubmit}
                                        className="flex-1"
                                    >
                                        Submit
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setSubmitting(false)}
                                    >
                                        Cancel
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                )}

            {/* Client: approve / request revision */}
            {isClient && milestone.status === "SUBMITTED" && (
                <div className="flex gap-2 mt-4 pt-4 border-t border-border">
                    <Button
                        size="sm"
                        onClick={() => onApprove(milestone.id)}
                        className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                    >
                        <ThumbsUp className="w-3.5 h-3.5" />
                        Approve
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onRevision(milestone.id)}
                        className="flex-1 text-orange-600 border-orange-300 hover:bg-orange-50 dark:hover:bg-orange-950"
                    >
                        <RotateCcw className="w-3.5 h-3.5" />
                        Request Revision
                    </Button>
                </div>
            )}
        </div>
    );
}

// ─── Add Milestone Form ───────────────────────────────────────────────────────

function AddMilestoneForm({
    onAdd,
}: {
    onAdd: (m: Partial<MilestoneResponse>) => void;
}) {
    const [title, setTitle] = useState("");
    const [desc, setDesc] = useState("");
    const [amount, setAmount] = useState("");
    const [dueDate, setDueDate] = useState("");
    const [loading, setLoading] = useState(false);
    const today = new Date().toISOString().split("T")[0];

    const handleAdd = async () => {
        if (!title || !amount || !dueDate) return;
        setLoading(true);
        await new Promise((r) => setTimeout(r, 500));
        setLoading(false);
        onAdd({
            id: `ms-new-${Date.now()}`,
            title,
            description: desc || null,
            amount: Number(amount),
            dueDate,
            status: "PENDING",
            deliverableUrl: null,
        });
        setTitle("");
        setDesc("");
        setAmount("");
        setDueDate("");
    };

    return (
        <div className="space-y-3">
            <div className="grid sm:grid-cols-2 gap-3">
                <FormField label="Milestone Title" required>
                    <Input
                        placeholder="Backend API Setup"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />
                </FormField>
                <FormField label="Amount (USD)" required>
                    <Input
                        type="number"
                        placeholder="400"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        startIcon={<span className="text-xs font-bold">$</span>}
                    />
                </FormField>
            </div>
            <FormField label="Due Date" required>
                <Input
                    type="date"
                    min={today}
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                />
            </FormField>
            <FormField label="Description">
                <Textarea
                    placeholder="What will be delivered in this milestone?"
                    rows={2}
                    value={desc}
                    onChange={(e) => setDesc(e.target.value)}
                />
            </FormField>
            <Button
                size="sm"
                loading={loading}
                onClick={handleAdd}
                disabled={!title || !amount || !dueDate}
                className="w-full"
            >
                <Plus className="w-3.5 h-3.5" /> Add Milestone
            </Button>
        </div>
    );
}

// ─── Review Form ──────────────────────────────────────────────────────────────

function ReviewForm({
    revieweeName,
    onSubmit,
}: {
    contractId: string;
    revieweeName: string;
    onSubmit: () => void;
}) {
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (!rating) return;
        setLoading(true);
        await new Promise((r) => setTimeout(r, 700));
        setLoading(false);
        onSubmit();
    };

    return (
        <div className="space-y-4">
            <div>
                <p className="text-sm font-semibold text-foreground mb-3">
                    Rate your experience with{" "}
                    <span className="text-primary">{revieweeName}</span>
                </p>
                <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((n) => (
                        <button
                            key={n}
                            onClick={() => setRating(n)}
                            className={cn(
                                "p-1.5 rounded-lg transition-all",
                                n <= rating
                                    ? "text-amber-400 scale-110"
                                    : "text-muted-foreground/30 hover:text-amber-300",
                            )}
                        >
                            <Star
                                className={cn(
                                    "w-6 h-6",
                                    n <= rating && "fill-amber-400",
                                )}
                            />
                        </button>
                    ))}
                </div>
            </div>
            <FormField label="Comment (optional)">
                <Textarea
                    placeholder="Share your experience working together…"
                    rows={3}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                />
            </FormField>
            <Button
                size="sm"
                loading={loading}
                onClick={handleSubmit}
                disabled={!rating}
                className="w-full"
            >
                <Star className="w-3.5 h-3.5" /> Submit Review
            </Button>
        </div>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ContractDetailPage() {
    const params = useParams();
    const contractId = params.id as string;
    const isFreelancer = useIsFreelancer();
    const isClient = useIsClient();

    const contract =
        MOCK_CONTRACTS.find((c) => c.id === contractId) ?? MOCK_CONTRACTS[0];

    const [milestones, setMilestones] = useState<MilestoneResponse[]>(
        MOCK_MILESTONES.filter((m) => m.contractId === contract.id),
    );
    const [showAddMilestone, setShowAddMilestone] = useState(false);
    const [showReview, setShowReview] = useState(false);
    const [reviewSubmitted, setReviewSubmitted] = useState(false);
    const [contractStatus, setContractStatus] = useState(contract.status);

    // Contract actions
    const [confirmDialog, setConfirmDialog] = useState<{
        open: boolean;
        type: "complete" | "cancel" | "dispute";
        title: string;
        description: string;
    }>({ open: false, type: "complete", title: "", description: "" });

    const approvedMilestones = milestones.filter(
        (m) => m.status === "APPROVED",
    );
    const totalPaid = approvedMilestones.reduce((s, m) => s + m.amount, 0);
    const totalValue = milestones.reduce((s, m) => s + m.amount, 0);
    const pct = percentage(approvedMilestones.length, milestones.length);

    const handleMilestoneSubmit = (id: string, url: string) => {
        setMilestones((prev) =>
            prev.map((m) =>
                m.id === id
                    ? { ...m, status: "SUBMITTED", deliverableUrl: url }
                    : m,
            ),
        );
    };

    const handleMilestoneApprove = (id: string) => {
        setMilestones((prev) =>
            prev.map((m) => (m.id === id ? { ...m, status: "APPROVED" } : m)),
        );
    };

    const handleMilestoneRevision = (id: string) => {
        setMilestones((prev) =>
            prev.map((m) =>
                m.id === id ? { ...m, status: "REVISION_REQUESTED" } : m,
            ),
        );
    };

    const handleAddMilestone = (m: Partial<MilestoneResponse>) => {
        setMilestones((prev) => [
            ...prev,
            { contractId: contract.id, ...m } as MilestoneResponse,
        ]);
        setShowAddMilestone(false);
    };

    const handleContractAction = async () => {
        await new Promise((r) => setTimeout(r, 500));
        if (confirmDialog.type === "complete") setContractStatus("COMPLETED");
        if (confirmDialog.type === "cancel") setContractStatus("CANCELLED");
        if (confirmDialog.type === "dispute") setContractStatus("DISPUTED");
        setConfirmDialog((d) => ({ ...d, open: false }));
        if (confirmDialog.type === "complete") setShowReview(true);
    };

    const existingReview = MOCK_REVIEWS.find(
        (r) => r.contractId === contract.id,
    );

    return (
        <div className="space-y-6">
            {/* Breadcrumb */}
            <Link
                href="/contracts"
                className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
                <ArrowLeft className="w-4 h-4" />
                All Contracts
            </Link>

            {/* Header */}
            <div className="flex items-start justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-1.5">
                        <ContractStatusBadge status={contractStatus} />
                    </div>
                    <h1 className="text-xl font-bold text-foreground">
                        {contract.projectTitle}
                    </h1>
                    <p className="text-sm text-muted-foreground mt-0.5">
                        Contract #{contract.id.slice(0, 8).toUpperCase()}
                    </p>
                </div>

                {/* Contract actions */}
                {contractStatus === "ACTIVE" && (
                    <div className="flex gap-2 shrink-0 flex-wrap">
                        {isClient && (
                            <Button
                                size="sm"
                                onClick={() =>
                                    setConfirmDialog({
                                        open: true,
                                        type: "complete",
                                        title: "Mark as Complete?",
                                        description:
                                            "This will mark the contract as completed and prompt both parties to leave a review.",
                                    })
                                }
                                className="bg-emerald-600 hover:bg-emerald-700 text-white"
                            >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                Complete
                            </Button>
                        )}
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                                setConfirmDialog({
                                    open: true,
                                    type: "dispute",
                                    title: "Open a Dispute?",
                                    description:
                                        "This will flag the contract for mediation. Both parties will be notified.",
                                })
                            }
                            className="text-orange-600 border-orange-300 hover:bg-orange-50 dark:hover:bg-orange-950"
                        >
                            <AlertTriangle className="w-3.5 h-3.5" />
                            Dispute
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                                setConfirmDialog({
                                    open: true,
                                    type: "cancel",
                                    title: "Cancel Contract?",
                                    description:
                                        "This action cannot be undone. Both parties will be notified.",
                                })
                            }
                            className="text-destructive hover:text-destructive hover:bg-destructive/5"
                        >
                            <XCircle className="w-3.5 h-3.5" />
                            Cancel
                        </Button>
                    </div>
                )}
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Main: Milestones */}
                <div className="lg:col-span-2 space-y-5">
                    {/* Progress card */}
                    <Card>
                        <CardContent className="p-5">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <Layers className="w-4 h-4 text-muted-foreground" />
                                    <h2 className="font-bold text-foreground">
                                        Milestones
                                    </h2>
                                    <span className="text-sm text-muted-foreground">
                                        ({approvedMilestones.length}/
                                        {milestones.length} approved)
                                    </span>
                                </div>
                                {isClient && contractStatus === "ACTIVE" && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() =>
                                            setShowAddMilestone((s) => !s)
                                        }
                                    >
                                        <Plus className="w-3.5 h-3.5" />
                                        Add Milestone
                                    </Button>
                                )}
                            </div>
                            <Progress
                                value={pct}
                                showLabel
                                barClassName="bg-emerald-500"
                            />
                            <div className="flex justify-between text-xs text-muted-foreground mt-2">
                                <span>
                                    Paid:{" "}
                                    <span className="font-semibold text-emerald-600">
                                        {formatCurrency(totalPaid)}
                                    </span>
                                </span>
                                <span>
                                    Remaining:{" "}
                                    <span className="font-semibold text-foreground">
                                        {formatCurrency(totalValue - totalPaid)}
                                    </span>
                                </span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Add milestone form */}
                    {showAddMilestone && (
                        <Card>
                            <CardHeader>
                                <CardTitle>New Milestone</CardTitle>
                            </CardHeader>
                            <CardContent className="pt-4">
                                <AddMilestoneForm onAdd={handleAddMilestone} />
                            </CardContent>
                        </Card>
                    )}

                    {/* Milestone list */}
                    <div className="space-y-3">
                        {milestones.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground text-sm">
                                No milestones yet.{" "}
                                {isClient && (
                                    <button
                                        onClick={() =>
                                            setShowAddMilestone(true)
                                        }
                                        className="text-primary font-semibold hover:underline"
                                    >
                                        Add the first one.
                                    </button>
                                )}
                            </div>
                        ) : (
                            milestones.map((ms, i) => (
                                <MilestoneCard
                                    key={ms.id}
                                    milestone={ms}
                                    index={i}
                                    isFreelancer={isFreelancer}
                                    isClient={isClient}
                                    onSubmit={handleMilestoneSubmit}
                                    onApprove={handleMilestoneApprove}
                                    onRevision={handleMilestoneRevision}
                                />
                            ))
                        )}
                    </div>

                    {/* Review section */}
                    {contractStatus === "COMPLETED" && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Review</CardTitle>
                            </CardHeader>
                            <CardContent className="pt-4">
                                {existingReview && !showReview ? (
                                    <div className="space-y-3">
                                        <Alert variant="success">
                                            You&apos;ve already left a review
                                            for this contract.
                                        </Alert>
                                        <div className="p-4 rounded-lg bg-muted/50 border border-border">
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex items-center gap-2">
                                                    <Avatar
                                                        name={
                                                            existingReview.reviewerName
                                                        }
                                                        size="sm"
                                                    />
                                                    <div>
                                                        <p className="text-sm font-semibold">
                                                            {
                                                                existingReview.reviewerName
                                                            }
                                                        </p>
                                                        <p className="text-xs text-muted-foreground">
                                                            reviewed{" "}
                                                            {
                                                                existingReview.revieweeName
                                                            }
                                                        </p>
                                                    </div>
                                                </div>
                                                <StarRating
                                                    rating={
                                                        existingReview.rating
                                                    }
                                                    showValue
                                                />
                                            </div>
                                            {existingReview.comment && (
                                                <p className="text-sm text-muted-foreground italic">
                                                    &ldquo;
                                                    {existingReview.comment}
                                                    &rdquo;
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                ) : reviewSubmitted ? (
                                    <Alert
                                        variant="success"
                                        title="Review submitted!"
                                    >
                                        Thank you for your feedback.
                                    </Alert>
                                ) : (
                                    <ReviewForm
                                        contractId={contract.id}
                                        revieweeName={
                                            isFreelancer
                                                ? contract.clientName
                                                : contract.freelancerName
                                        }
                                        onSubmit={() => {
                                            setReviewSubmitted(true);
                                            setShowReview(false);
                                        }}
                                    />
                                )}
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Sidebar */}
                <div className="space-y-4">
                    {/* Parties */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Parties</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4 space-y-4">
                            <div className="flex items-center gap-3">
                                <Avatar name={contract.clientName} size="md" />
                                <div>
                                    <p className="text-xs text-muted-foreground">
                                        Client
                                    </p>
                                    <p className="font-bold text-foreground text-sm">
                                        {contract.clientName}
                                    </p>
                                </div>
                            </div>
                            <Separator />
                            <div className="flex items-center gap-3">
                                <Avatar
                                    name={contract.freelancerName}
                                    size="md"
                                />
                                <div>
                                    <p className="text-xs text-muted-foreground">
                                        Freelancer
                                    </p>
                                    <p className="font-bold text-foreground text-sm">
                                        {contract.freelancerName}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Financial summary */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Financials</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4 space-y-3">
                            {[
                                {
                                    label: "Agreed Price",
                                    value: formatCurrency(contract.agreedPrice),
                                    highlight: false,
                                },
                                {
                                    label: "Total Milestones",
                                    value: formatCurrency(totalValue),
                                    highlight: false,
                                },
                                {
                                    label: "Paid Out",
                                    value: formatCurrency(totalPaid),
                                    highlight: true,
                                },
                                {
                                    label: "Remaining",
                                    value: formatCurrency(
                                        contract.agreedPrice - totalPaid,
                                    ),
                                    highlight: false,
                                },
                            ].map((item) => (
                                <div
                                    key={item.label}
                                    className="flex justify-between text-sm"
                                >
                                    <span className="text-muted-foreground">
                                        {item.label}
                                    </span>
                                    <span
                                        className={cn(
                                            "font-bold",
                                            item.highlight
                                                ? "text-emerald-600 dark:text-emerald-400"
                                                : "text-foreground",
                                        )}
                                    >
                                        {item.value}
                                    </span>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    {/* Timeline */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Timeline</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4 space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground flex items-center gap-1.5">
                                    <Calendar className="w-3.5 h-3.5" /> Start
                                    Date
                                </span>
                                <span className="font-medium text-foreground">
                                    {formatDate(contract.startDate)}
                                </span>
                            </div>
                            {contract.endDate && (
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground flex items-center gap-1.5">
                                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />{" "}
                                        End Date
                                    </span>
                                    <span className="font-medium text-foreground">
                                        {formatDate(contract.endDate)}
                                    </span>
                                </div>
                            )}
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground flex items-center gap-1.5">
                                    <Clock className="w-3.5 h-3.5" /> Status
                                </span>
                                <ContractStatusBadge status={contractStatus} />
                            </div>
                        </CardContent>
                    </Card>

                    {/* View project */}
                    <Link href={`/projects/${contract.projectId}`}>
                        <Button variant="outline" size="sm" className="w-full">
                            <Users className="w-4 h-4" />
                            View Project
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Confirm action dialog */}
            <Dialog
                open={confirmDialog.open}
                onClose={() => setConfirmDialog((d) => ({ ...d, open: false }))}
                title={confirmDialog.title}
                description={confirmDialog.description}
                size="sm"
            >
                <div className="flex gap-3 mt-2">
                    <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() =>
                            setConfirmDialog((d) => ({ ...d, open: false }))
                        }
                    >
                        Cancel
                    </Button>
                    <Button
                        className={cn(
                            "flex-1",
                            confirmDialog.type === "complete" &&
                                "bg-emerald-600 hover:bg-emerald-700 text-white",
                            confirmDialog.type === "dispute" &&
                                "bg-orange-500 hover:bg-orange-600 text-white",
                            confirmDialog.type === "cancel" &&
                                "bg-destructive hover:bg-destructive/90 text-destructive-foreground",
                        )}
                        onClick={handleContractAction}
                    >
                        Confirm
                    </Button>
                </div>
            </Dialog>
        </div>
    );
}
